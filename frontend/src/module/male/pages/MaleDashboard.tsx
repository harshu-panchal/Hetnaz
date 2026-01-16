import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { DiscoverNearbyCard } from '../components/DiscoverNearbyCard';
import { ActiveChatsList } from '../components/ActiveChatsList';
import { BottomNavigation } from '../components/BottomNavigation';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { PermissionPrompt } from '../../../shared/components/PermissionPrompt';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useOptimizedChatList } from '../../../core/hooks/useOptimizedChatList';
import { useDiscoveryProfiles } from '../../../core/queries/useDiscoveryQuery';
import { BadgeDisplay } from '../../../shared/components/BadgeDisplay';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { DailyRewardModal } from '../../../shared/components/DailyRewardModal';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import apiClient from '../../../core/api/client';


export const MaleDashboard = () => {
  const { t } = useTranslation();

  // Use optimized chat hook - loads from cache immediately
  const { chats: rawChats, isLoading: isChatsLoading, refreshChats } = useOptimizedChatList();
  const { updateBalance } = useGlobalState();

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();

  // Daily Reward Modal
  const [isDailyRewardModalOpen, setIsDailyRewardModalOpen] = useState(false);
  const [dailyRewardData, setDailyRewardData] = useState({ amount: 0, newBalance: 0 });

  // Permission management
  const { hasRequestedPermissions } = usePermissions();

  // PHASED BOOT: Check and claim daily reward 3 seconds AFTER dashboard mount
  // This ensures the initial paint and critical chat list fetch have priority
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkDailyReward = async () => {
      try {
        console.log('[DailyReward] Phase III: Background claim check...');
        const response = await apiClient.post('/rewards/daily/claim');
        const result = response.data.data;

        if (result.claimed) {
          setDailyRewardData({ amount: result.amount, newBalance: result.newBalance });
          setIsDailyRewardModalOpen(true);
          updateBalance(result.newBalance);
        }
      } catch (error) {
        // Silently fail - background task
      }
    };

    timeoutId = setTimeout(checkDailyReward, 3000);
    return () => clearTimeout(timeoutId);
  }, [updateBalance]);

  useEffect(() => {
    window.scrollTo(0, 0);
    refreshChats();
    // Nearby users fetched via hook automatically

    // Show permission prompt on first app open
    if (!hasRequestedPermissions()) {
      setTimeout(() => setShowPermissionPrompt(true), 1000);
    }
  }, []);

  // Use optimized hooks which share cache
  const { data: nearbyUsersRaw = [] } = useDiscoveryProfiles('all');

  // Transform for dashboard display
  const nearbyUsers = useMemo(() => {
    return nearbyUsersRaw.slice(0, 10).map((p: any) => ({
      id: p.id,
      name: p.name || 'User',
      avatar: p.avatar || ''
    }));
  }, [nearbyUsersRaw]);

  // Loading state derived from hooks
  const isNearbyLoading = false; // Query handles background loading, we default to showing cached or empty

  // Note: We don't need manual fetchNearbyUsers anymore



  const formatTimestamp = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return t('yesterday');
    } else if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const activeChatsForDisplay = useMemo(() => {
    return rawChats.map((chat: any) => {
      const otherUser = chat.otherUser || {};

      return {
        id: chat._id,
        userId: otherUser._id,
        userName: otherUser.name || 'User',
        userAvatar: otherUser.avatar || '',
        lastMessage: chat.lastMessage?.content || t('startChatting'),
        timestamp: formatTimestamp(chat.lastMessageAt),
        isOnline: !!otherUser.isOnline,
        hasUnread: (chat.unreadCount || 0) > 0,
        distance: otherUser.distance // Use distance from backend
      };
    });
  }, [rawChats, t]);

  const handleChatClick = (chatId: string) => {
    navigate(`/male/chat/${chatId}`);
  };

  const handleSeeAllChatsClick = () => {
    navigate('/male/chats');
  };

  const handleExploreClick = () => {
    navigate('/male/discover');
  };


  // Only show full loading screen if we have NO chats and NO nearby users AND are loading both
  // This allows cached chats to show up even if nearby users are loading
  if (isChatsLoading && isNearbyLoading && rawChats.length === 0 && nearbyUsers.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
            {t('loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-pink-50 via-rose-50/30 to-white dark:from-[#1a0f14] dark:via-[#2d1a24] dark:to-[#0a0a0a] overflow-x-hidden pb-24">
      {/* Permission Prompt - Shows on first app open */}
      {showPermissionPrompt && (
        <PermissionPrompt
          onRequestPermissions={() => {
            setShowPermissionPrompt(false);
          }}
          onDismiss={() => {
            localStorage.setItem('hetnaz_permissions_requested', 'true');
            setShowPermissionPrompt(false);
          }}
        />
      )}

      <MaleTopNavbar />

      <DiscoverNearbyCard
        nearbyUsers={nearbyUsers}
        onExploreClick={handleExploreClick}
      />

      {/* Achievements Section */}
      <div className="px-4 mb-2">
        <div className="bg-gradient-to-br from-white via-pink-50/50 to-rose-50/30 dark:from-[#2d1a24] dark:via-[#3d2530] dark:to-[#2d1a24] rounded-2xl p-5 shadow-lg border border-pink-200/50 dark:border-pink-900/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/20 dark:bg-pink-900/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-md">
                  <MaterialSymbol name="workspace_premium" className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('badges')}</h3>
              </div>
              <button
                onClick={() => navigate('/male/badges')}
                className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
              >
                {t('viewAll')}
              </button>
            </div>
            {user?.badges && user.badges.length > 0 ? (
              <BadgeDisplay
                badges={user.badges}
                maxDisplay={5}
                showUnlockedOnly={true}
                compact={true}
                onBadgeClick={() => navigate('/male/badges')}
              />
            ) : (
              <div className="text-center py-4 px-2 bg-pink-100/30 dark:bg-pink-900/10 rounded-xl border border-dashed border-pink-200 dark:border-pink-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('noBadgesYet')}
                </p>
                <button
                  onClick={() => navigate('/male/badges')}
                  className="mt-2 text-xs font-bold text-primary"
                >
                  {t('exploreAchievements')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ActiveChatsList
        chats={activeChatsForDisplay}
        onChatClick={handleChatClick}
        onSeeAllClick={handleSeeAllChatsClick}
      />

      <BottomNavigation
        items={navigationItems}
        onItemClick={handleNavigationClick}
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

