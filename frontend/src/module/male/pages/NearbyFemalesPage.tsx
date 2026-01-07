import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import chatService from '../../../core/services/chat.service';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { InsufficientBalanceModal } from '../components/InsufficientBalanceModal';
import { HiSentModal } from '../components/HiSentModal';
import { DailyRewardModal } from '../../../shared/components/DailyRewardModal';
import offlineQueueService from '../../../core/services/offlineQueue.service';
import apiClient from '../../../core/api/client';
import { useDiscoveryProfiles } from '../../../core/queries/useDiscoveryQuery';

import { useTranslation } from '../../../core/hooks/useTranslation';

type FilterType = 'all' | 'online' | 'new' | 'popular';

export const NearbyFemalesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();
  const { coinBalance, updateBalance } = useGlobalState();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // React Query Hook
  const {
    data: profiles = [],
    isLoading: isQueryLoading,
    error: queryError,
    refetch
  } = useDiscoveryProfiles(activeFilter);

  const error = queryError ? (queryError as any).message || 'Failed to load profiles' : null;
  const isLoading = isQueryLoading;

  const [sendingHiTo, setSendingHiTo] = useState<string | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [requiredCoins, setRequiredCoins] = useState(5);

  // Hi Sent Modal
  const [isHiSentModalOpen, setIsHiSentModalOpen] = useState(false);
  const [sentHiRecipient, setSentHiRecipient] = useState({ name: '', chatId: '' });

  // Daily Reward Modal
  const [isDailyRewardModalOpen, setIsDailyRewardModalOpen] = useState(false);
  const [dailyRewardData, setDailyRewardData] = useState({ amount: 0, newBalance: 0 });

  // Check and claim daily reward on page load
  useEffect(() => {
    const checkDailyReward = async () => {
      try {
        console.log('[DailyReward] Attempting to claim...');
        const response = await apiClient.post('/rewards/daily/claim');
        console.log('[DailyReward] Response:', response.data);
        const result = response.data.data;
        console.log('[DailyReward] Result:', result);

        if (result.claimed) {
          console.log('[DailyReward] Reward claimed! Amount:', result.amount, 'New Balance:', result.newBalance);
          // Show celebration modal
          setDailyRewardData({
            amount: result.amount,
            newBalance: result.newBalance
          });
          setIsDailyRewardModalOpen(true);
          console.log('[DailyReward] Modal state set to true');
          // Update global balance
          updateBalance(result.newBalance);
        } else {
          console.log('[DailyReward] Not claimed. Reason:', result.reason);
        }
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.log('[DailyReward] Failed to claim:', error);
      }
    };
    checkDailyReward();
  }, [updateBalance]);

  // Process offline queue when back online
  useEffect(() => {
    const processOfflineQueue = async () => {
      await offlineQueueService.processQueue(async (queuedMsg) => {
        try {
          if (queuedMsg.type === 'hi') {
            await chatService.sendHiMessage(queuedMsg.data.profileId);
            return true;
          }
          return false;
        } catch (err) {
          console.error('[QueueProcessor] Failed to send queued Hi:', err);
          return false;
        }
      });
    };

    offlineQueueService.setOnlineCallback(processOfflineQueue);
    if (offlineQueueService.getQueueSize() > 0) {
      processOfflineQueue();
    }
  }, []);

  const handleSendHi = async (profileId: string, profileName: string) => {
    if (coinBalance < 5) {
      setRequiredCoins(5);
      setIsBalanceModalOpen(true);
      return;
    }

    // STEP 1: Deduct coins IMMEDIATELY (optimistic)
    updateBalance(coinBalance - 5);

    try {
      setSendingHiTo(profileId);
      const result = await chatService.sendHiMessage(profileId);

      // Show success modal
      setSentHiRecipient({ name: profileName, chatId: result.chatId });
      setIsHiSentModalOpen(true);
    } catch (err: any) {
      console.error('Failed to send Hi:', err);

      // STEP 2: If offline or network error, queue it
      if (!offlineQueueService.isOnline() || err.code === 'ERR_NETWORK') {
        console.log('[NearbyFemales] Offline detected, queuing Hi');

        offlineQueueService.queueMessage('hi', {
          profileId,
          profileName
        }, 5);

        // Still show success modal but maybe we can't navigate to chat yet
        setSentHiRecipient({ name: profileName, chatId: '' }); // No chatId yet
        setIsHiSentModalOpen(true);
        // We might want to alert that it's queued
      } else {
        const errorMessage = err.response?.data?.message || '';
        if (errorMessage.toLowerCase().includes('insufficient') || errorMessage.toLowerCase().includes('balance')) {
          setRequiredCoins(5);
          setIsBalanceModalOpen(true);
        } else {
          alert(errorMessage || 'Failed to send Hi message');
        }
        // Refund optimistic deduction on non-network errors? 
        // User rules say "Coins are NEVER refunded", but usually that's for successful queueing.
        // If it's a 400 error, we probably should restore balance IF we want to be nice, 
        // but the prompt says "coins get deducted for every Hi... in the queue."
        // If it fails immediately with a non-network error, it's NOT in the queue.
        // So I'll restore balance for non-network errors.
        updateBalance(coinBalance);
      }
    } finally {
      setSendingHiTo(null);
    }
  };

  const handleProfileClick = async (profileId: string) => {
    try {
      // Get or create chat with this user
      const chat = await chatService.getOrCreateChat(profileId);
      // Navigate to the chat using _id
      const chatId = chat._id || chat.chatId;
      if (chatId) {
        navigate(`/male/chat/${chatId}`);
      } else {
        throw new Error('Chat ID not found in response');
      }
    } catch (err: any) {
      console.error('Failed to open chat:', err);
      alert(err.response?.data?.message || 'Failed to open chat');
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white flex flex-col min-h-screen">
      {/* Tabs / Filters */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-pink-50/95 via-rose-50/95 to-pink-50/95 dark:from-[#1a0f14]/95 dark:via-[#2d1a24]/95 dark:to-[#1a0f14]/95 backdrop-blur-md border-b border-pink-200/40 dark:border-pink-900/30 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[13px] font-semibold">
            <button
              className={`pb-1 ${activeFilter === 'all' ? 'text-slate-900 dark:text-white border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400'}`}
              onClick={() => setActiveFilter('all')}
            >
              {t('recommend')}
            </button>
            <button
              className={`pb-1 ${activeFilter === 'online' ? 'text-slate-900 dark:text-white border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400'}`}
              onClick={() => setActiveFilter('online')}
            >
              {t('onlineTab')}
            </button>
            <button
              className={`pb-1 ${activeFilter === 'new' ? 'text-slate-900 dark:text-white border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400'}`}
              onClick={() => setActiveFilter('new')}
            >
              {t('newTab')}
            </button>
            <button
              className={`pb-1 ${activeFilter === 'popular' ? 'text-slate-900 dark:text-white border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400'}`}
              onClick={() => setActiveFilter('popular')}
            >
              {t('popularTab')}
            </button>
          </div>
          <button onClick={() => refetch()} className="text-primary p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-3 space-y-2 pb-24">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && profiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('noProfilesFound', { defaultValue: 'No profiles found' })}</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('noProfilesFoundDesc', { defaultValue: 'No approved female profiles are available right now. Check back later!' })}
            </p>
          </div>
        )}

        {/* Profile List */}
        {!isLoading && !error && profiles.map((profile: any) => (
          <div
            key={profile.id}
            onClick={() => handleProfileClick(profile.id)}
            className="bg-white dark:bg-[#2d1a24] rounded-2xl shadow-sm border border-pink-100/60 dark:border-pink-900/30 px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={profile.avatar || 'https://via.placeholder.com/48?text=?'}
                alt={profile.name}
                className="h-12 w-12 rounded-xl object-cover border border-pink-100 dark:border-pink-800"
              />
              {profile.isOnline && (
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white dark:ring-[#2d1a24]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{profile.name}</p>
                {profile.occupation && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300">
                    {profile.occupation}
                  </span>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-x-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-300">
                {profile.location && <span>{profile.location}</span>}
                {profile.location && profile.age && <span>•</span>}
                {profile.age && <span>{t('yearsOld', { count: profile.age })}</span>}
                {(profile.location || profile.age) && profile.distance && <span>•</span>}
                {profile.distance && <span>{profile.distance}</span>}
              </div>
              {profile.bio && (
                <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5 line-clamp-1">
                  {profile.bio}
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleSendHi(profile.id, profile.name);
              }}
              disabled={sendingHiTo === profile.id}
              className="px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-primary to-rose-500 shadow-md active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1"
            >
              {sendingHiTo === profile.id ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>👋</span>
                  <span>{t('hi')}</span>
                </>
              )}
            </button>
          </div>
        ))}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onBuyCoins={() => navigate('/male/buy-coins')}
        requiredCoins={requiredCoins}
        currentBalance={coinBalance || 0}
        action="send a Hi"
      />

      {/* Hi Sent Success Modal */}
      <HiSentModal
        isOpen={isHiSentModalOpen}
        onClose={() => setIsHiSentModalOpen(false)}
        onGoToChat={() => navigate(`/male/chat/${sentHiRecipient.chatId}`)}
        recipientName={sentHiRecipient.name}
      />

      {/* Daily Reward Modal */}
      <DailyRewardModal
        isOpen={isDailyRewardModalOpen}
        onClose={() => setIsDailyRewardModalOpen(false)}
        coinsAwarded={dailyRewardData.amount}
        newBalance={dailyRewardData.newBalance}
      />
    </div>
  );
};
