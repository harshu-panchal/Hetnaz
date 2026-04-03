import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import chatService from '../../../core/services/chat.service';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { InsufficientBalanceModal } from '../components/InsufficientBalanceModal';
import { DailyRewardModal } from '../../../shared/components/DailyRewardModal';
import offlineQueueService from '../../../core/services/offlineQueue.service';
import apiClient from '../../../core/api/client';
import { useDiscoveryProfiles } from '../../../core/queries/useDiscoveryQuery';
import { NearbyFemaleItem } from '../components/NearbyFemaleItem';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel, FilterOptions } from '../components/FilterPanel';

import { useTranslation } from '../../../core/hooks/useTranslation';
import { MeshBackground } from '../../../shared/components/auth/AuthLayoutComponents';

type FilterType = 'all' | 'online' | 'new' | 'popular';

export const NearbyFemalesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();
  const { coinBalance, updateBalance } = useGlobalState();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    ageRange: { min: 18, max: 45 },
    maxDistance: 100
  });

  // React Query Hook
  const {
    data: profiles = [],
    isLoading: isQueryLoading,
    error: queryError
  } = useDiscoveryProfiles(activeFilter);

  // Apply Filters
  const displayProfiles = useMemo(() => {
    const rawData = profiles;
    
    return rawData
      .filter((profile: any) => {
        // 1. Tab Filter
        if (activeFilter === 'online' && !profile.isOnline) return false;
        
        // 2. Search Query (Name or Age)
        if (searchQuery) {
          const s = searchQuery.toLowerCase();
          const matchesName = profile.name.toLowerCase().includes(s);
          const matchesAge = profile.age?.toString() === s;
          if (!matchesName && !matchesAge) return false;
        }

        // 3. Modal Filters (Age & Distance)
        if (profile.age && profile.age > filterOptions.ageRange.max) return false;
        if (profile.age && profile.age < filterOptions.ageRange.min) return false;

        if (profile.distance && typeof profile.distance === 'string') {
          const distValue = parseFloat(profile.distance.replace(/[^\d.]/g, ''));
          if (!isNaN(distValue) && distValue > filterOptions.maxDistance) return false;
        }

        return true;
      })
      .sort((a: any, b: any) => {
        // 4. Tab Sorting
        if (activeFilter === 'popular') return (b.matchesCount || 0) - (a.matchesCount || 0);
        if (activeFilter === 'new') return b.id.localeCompare(a.id); // Simulating newest first
        if (activeFilter === 'all') return (a.isOnline === b.isOnline) ? 0 : (a.isOnline ? -1 : 1); // Online first in recommend
        return 0;
      });
  }, [profiles, activeFilter, searchQuery, filterOptions]);

  const error = queryError ? (queryError as any).message || 'Failed to load profiles' : null;
  const isLoading = isQueryLoading;

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const requiredCoins = 5;

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
  }, []);

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

  const handleProfileClick = (profileId: string) => {
    navigate(`/male/profile/${profileId}`);
  };

  return (
    <div className="font-display text-slate-900 dark:text-white antialiased selection:bg-primary selection:text-white min-h-screen relative overflow-hidden">
      <MeshBackground />
      
      {/* Scrollable Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto w-full">
      {/* Search & Filter Header (Sticky) */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#1a0f14]/95 backdrop-blur-3xl border-b border-pink-100/30 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.02)] pt-10">
        <div className="max-w-md mx-auto">
          <SearchBar 
            showLogo={false}
            title="Discover"
            onSearch={setSearchQuery} 
            onFilterToggle={() => setIsFilterModalOpen(true)} 
          />
        </div>
        
        {/* Tabs / Filters */}
        <div className="px-2 pb-1 max-w-md mx-auto">
          <div className="flex items-center justify-around w-full">
            {[
              { id: 'all', label: t('recommend') },
              { id: 'online', label: t('onlineTab') },
              { id: 'new', label: t('newTab') },
              { id: 'popular', label: t('popularTab') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterType)}
                className={`relative flex-1 py-3 text-[12px] font-black uppercase tracking-wider transition-all text-center ${
                  activeFilter === tab.id 
                    ? 'text-primary' 
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {tab.label}
                {activeFilter === tab.id && (
                  <div className="absolute bottom-0.5 left-0 right-0 flex justify-center">
                    <div className="w-8 h-[3.5px] bg-primary rounded-full shadow-[0_2px_10px_rgba(255,105,180,0.6)]" />
                  </div>
                )}
              </button>
            ))}
          </div>
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
        {!isLoading && !error && displayProfiles.map((profile: any) => (
          <NearbyFemaleItem
            key={profile.id}
            profile={profile}
            onProfileClick={handleProfileClick}
            onChatClick={(id) => navigate(`/male/chat/new_${id}`)}
          />
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
        action="perform this action"
      />

      {/* Filter Modal (Bottom Sheet) */}
      <FilterPanel
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialFilters={filterOptions}
        onApply={(filters) => {
          setFilterOptions(filters);
          setIsFilterModalOpen(false);
        }}
      />

      {/* Daily Reward Modal */}
      <DailyRewardModal
        isOpen={isDailyRewardModalOpen}
        onClose={() => setIsDailyRewardModalOpen(false)}
        coinsAwarded={dailyRewardData.amount}
        newBalance={dailyRewardData.newBalance}
      />
      </div>
    </div>
  );
};
