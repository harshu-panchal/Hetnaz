import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { DiscoverNearbyCard } from '../components/DiscoverNearbyCard';
import { ActiveChatsList } from '../components/ActiveChatsList';
import { BottomNavigation } from '../components/BottomNavigation';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
import { MaleSidebar } from '../components/MaleSidebar';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { LocationPromptModal } from '../../../shared/components/LocationPromptModal';
import userService from '../../../core/services/user.service';
import chatService from '../../../core/services/chat.service';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { calculateDistance, formatDistance, areCoordinatesValid } from '../../../utils/distanceCalculator';
import { BadgeDisplay } from '../../../shared/components/BadgeDisplay';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';

interface MaleDashboardData {
  nearbyUsers: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  activeChats: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    lastMessage: string;
    timestamp: string;
    isOnline: boolean;
    hasUnread: boolean;
    distance?: string;
  }>;
  rawChats: any[];
}

export const MaleDashboard = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<MaleDashboardData>({
    nearbyUsers: [],
    activeChats: [],
    rawChats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useMaleNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [nearbyResponse, chatsResponse] = await Promise.all([
        userService.discoverFemales('all', 1, 10),
        chatService.getMyChatList()
      ]);

      setDashboardData({
        nearbyUsers: nearbyResponse.profiles?.map((p: any) => ({
          id: p.id,
          name: p.name || 'User',
          avatar: p.avatar || ''
        })) || [],
        rawChats: chatsResponse || [],
        activeChats: [] // Will be computed
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user needs to set location
    // Show prompt if location is empty OR if coordinates are not set
    const hasLocation = user?.location && user.location.trim() !== '';
    const hasCoordinates = user?.latitude && user?.longitude && user.latitude !== 0 && user.longitude !== 0;
    if (user && (!hasLocation || !hasCoordinates)) {
      setShowLocationPrompt(true);
    }
  }, [user]);

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
    return dashboardData.rawChats.map((chat: any) => {
      const otherUser = chat.otherUser || {};
      const profileLat = otherUser.profile?.location?.coordinates?.[1] || otherUser.latitude;
      const profileLng = otherUser.profile?.location?.coordinates?.[0] || otherUser.longitude;

      let distanceStr = undefined;
      const userCoord = { lat: user?.latitude || 0, lng: user?.longitude || 0 };
      const profileCoord = { lat: profileLat || 0, lng: profileLng || 0 };

      if (areCoordinatesValid(userCoord) && areCoordinatesValid(profileCoord)) {
        const dist = calculateDistance(userCoord, profileCoord);
        distanceStr = formatDistance(dist);
      }

      return {
        id: chat._id,
        userId: otherUser._id,
        userName: otherUser.name || 'User',
        userAvatar: otherUser.avatar || '',
        lastMessage: chat.lastMessage?.content || 'Say hi!',
        timestamp: formatTimestamp(chat.lastMessageAt),
        isOnline: !!otherUser.isOnline,
        hasUnread: (chat.unreadCount || 0) > 0,
        distance: distanceStr
      };
    });
  }, [dashboardData.rawChats, user?.latitude, user?.longitude, t]);

  const handleChatClick = (chatId: string) => {
    navigate(`/male/chat/${chatId}`);
  };

  const handleSeeAllChatsClick = () => {
    navigate('/male/chats');
  };

  const handleExploreClick = () => {
    navigate('/male/discover');
  };

  const handleLocationSave = (location: string, coordinates?: { lat: number, lng: number }) => {
    if (updateUser) {
      updateUser({
        location,
        city: location,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng
      });
    }
    setShowLocationPrompt(false);
  };

  if (isLoading) {
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
      {showLocationPrompt && (
        <LocationPromptModal
          onSave={handleLocationSave}
          onClose={() => setShowLocationPrompt(false)}
        />
      )}
      <MaleTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      <MaleSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      <DiscoverNearbyCard
        nearbyUsers={dashboardData.nearbyUsers}
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
    </div>
  );
};

