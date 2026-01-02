import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { ProfileHeader } from '../components/ProfileHeader';
import { EarningsCard } from '../components/EarningsCard';
import { FemaleStatsGrid } from '../components/FemaleStatsGrid';
import { ActiveChatsList } from '../components/ActiveChatsList';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { FemaleTopNavbar } from '../components/FemaleTopNavbar';
import { FemaleSidebar } from '../components/FemaleSidebar';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import { LocationPromptModal } from '../../../shared/components/LocationPromptModal';
import { PermissionPrompt } from '../../../shared/components/PermissionPrompt';
import { usePermissions } from '../../../core/hooks/usePermissions';
import userService from '../../../core/services/user.service';
import { calculateDistance, formatDistance, areCoordinatesValid } from '../../../utils/distanceCalculator';
import type { FemaleDashboardData } from '../types/female.types';
import { useTranslation } from '../../../core/hooks/useTranslation';

const FemaleDashboardContent = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<FemaleDashboardData | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useFemaleNavigation();

  // Permission management
  const { hasRequestedPermissions } = usePermissions();

  const quickActions = useMemo(() => [
    { id: 'earnings', icon: 'trending_up', label: t('viewEarnings') },
    { id: 'withdraw', icon: 'payments', label: t('withdraw') },
    { id: 'auto-messages', icon: 'auto_awesome', label: t('autoMessages') },
  ], [t]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDashboardData();

    // Show permission prompt on first app open
    if (!hasRequestedPermissions()) {
      setTimeout(() => setShowPermissionPrompt(true), 1000);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getFemaleDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch female dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Protect route: Redirect if not approved
    if (user && user.role === 'female' && user.approvalStatus !== 'approved') {
      navigate('/verification-pending');
    }

    // Check if user needs to set location (only for approved females)
    // Show prompt if location is empty OR if coordinates are not set
    const hasLocation = user?.location && user.location.trim() !== '';
    const hasCoordinates = user?.latitude && user?.longitude && user.latitude !== 0 && user.longitude !== 0;
    if (user && user.role === 'female' && user.approvalStatus === 'approved' && (!hasLocation || !hasCoordinates)) {
      setShowLocationPrompt(true);
    }
  }, [user, navigate]);

  const activeChatsForDisplay = useMemo(() => {
    if (!dashboardData?.activeChats) return [];
    return dashboardData.activeChats.map((chat: any) => {
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

      return { ...chat, distance: distanceStr };
    });
  }, [dashboardData?.activeChats, user?.latitude, user?.longitude]);

  const handleNotificationClick = () => {
    navigate('/female/notifications');
  };

  const handleViewEarningsClick = () => {
    navigate('/female/earnings');
  };

  const handleWithdrawClick = () => {
    navigate('/female/withdrawal');
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/female/chat/${chatId}`);
  };

  const handleSeeAllChatsClick = () => {
    navigate('/female/chats');
  };

  const handleQuickActionClick = (actionId: string) => {
    switch (actionId) {
      case 'earnings':
        navigate('/female/earnings');
        break;
      case 'withdraw':
        navigate('/female/withdrawal');
        break;
      case 'auto-messages':
        navigate('/female/auto-messages');
        break;
      default:
        break;
    }
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
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">{t('loadingDashboard')}</p>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-20">
      {/* Permission Prompt - Shows on first app open */}
      {showPermissionPrompt && (
        <PermissionPrompt
          onRequestPermissions={() => {
            setShowPermissionPrompt(false);
          }}
          onDismiss={() => {
            localStorage.setItem('matchmint_permissions_requested', 'true');
            setShowPermissionPrompt(false);
          }}
        />
      )}

      {showLocationPrompt && (
        <LocationPromptModal
          onSave={handleLocationSave}
          onClose={() => setShowLocationPrompt(false)}
        />
      )}
      <FemaleTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      <FemaleSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      <div className="flex p-4 pt-4 @container">
        <div className="flex w-full flex-col gap-4">
          <ProfileHeader
            user={dashboardData?.user || { name: t('loading'), avatar: '', isPremium: false, isOnline: true }}
            onNotificationClick={handleNotificationClick}
          />
          <EarningsCard
            totalEarnings={dashboardData?.earnings.totalEarnings || 0}
            availableBalance={dashboardData?.earnings.availableBalance || 0}
            pendingWithdrawals={dashboardData?.earnings.pendingWithdrawals || 0}
            onViewEarningsClick={handleViewEarningsClick}
            onWithdrawClick={handleWithdrawClick}
          />
        </div>
      </div>

      <FemaleStatsGrid stats={dashboardData?.stats || { messagesReceived: 0, activeConversations: 0, profileViews: 0 }} />

      <QuickActionsGrid actions={quickActions.map(action => ({
        ...action,
        onClick: () => handleQuickActionClick(action.id),
      }))} />

      <ActiveChatsList
        chats={activeChatsForDisplay}
        onChatClick={handleChatClick}
        onSeeAllClick={handleSeeAllChatsClick}
      />

      <FemaleBottomNavigation
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />
    </div>
  );
};

export const FemaleDashboard = () => (
  <FemaleDashboardContent />
);
