import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { ProfileHeader } from '../components/ProfileHeader';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { EarningsCard } from '../components/EarningsCard';
import { FemaleStatsGrid } from '../components/FemaleStatsGrid';
import { ActiveChatsList } from '../components/ActiveChatsList';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { FemaleTopNavbar } from '../components/FemaleTopNavbar';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import { PermissionPrompt } from '../../../shared/components/PermissionPrompt';
import { usePermissions } from '../../../core/hooks/usePermissions';
import userService from '../../../core/services/user.service';
import type { FemaleDashboardData } from '../types/female.types';
import { useTranslation } from '../../../core/hooks/useTranslation';

const FemaleDashboardContent = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<FemaleDashboardData | null>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useGlobalState();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();
  const { hasRequestedPermissions } = usePermissions();

  const quickActions = useMemo(() => [
    { id: 'earnings', icon: 'trending_up', label: t('viewEarnings') },
    { id: 'withdraw', icon: 'payments', label: t('withdraw') },
    { id: 'auto-messages', icon: 'auto_awesome', label: t('autoMessages') },
  ], [t]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await userService.getFemaleDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch female dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDashboardData();

    // Refetch data when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Show permission prompt on first app open (deferred)
    if (!hasRequestedPermissions()) {
      setTimeout(() => setShowPermissionPrompt(true), 2000);
    }

    // Welcome notification (deferred to not block main thread)
    if (user?.role === 'female' && user?.approvalStatus === 'approved') {
      const welcomeShown = localStorage.getItem('hetnaz_female_welcome_shown');
      if (!welcomeShown) {
        localStorage.setItem('hetnaz_female_welcome_shown', 'true');
        setTimeout(() => {
          addNotification({
            title: 'Welcome to HETNAZ',
            message: 'Your journey begins here. Explore and connect seamlessly.',
            type: 'system'
          });
        }, 3000);
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, addNotification, hasRequestedPermissions, fetchDashboardData]);

  useEffect(() => {
    if (user && user.role === 'female' && user.approvalStatus !== 'approved') {
      navigate('/verification-pending');
    }
  }, [user, navigate]);

  const activeChatsForDisplay = useMemo(() => {
    return dashboardData?.activeChats || [];
  }, [dashboardData?.activeChats]);

  const handleQuickActionClick = (actionId: string) => {
    switch (actionId) {
      case 'earnings': navigate('/female/earnings'); break;
      case 'withdraw': navigate('/female/withdrawal'); break;
      case 'auto-messages': navigate('/female/auto-messages'); break;
    }
  };

  // Show lightweight skeleton instead of blocking spinner
  if (isLoading && !dashboardData) {
    return (
      <div className="flex h-screen w-full flex-col bg-background-light dark:bg-background-dark">
        <FemaleTopNavbar />
        <div className="flex-1 p-4 space-y-4 animate-pulse">
          <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-20">
      {showPermissionPrompt && (
        <PermissionPrompt
          onRequestPermissions={() => setShowPermissionPrompt(false)}
          onDismiss={() => {
            localStorage.setItem('hetnaz_permissions_requested', 'true');
            setShowPermissionPrompt(false);
          }}
        />
      )}

      <FemaleTopNavbar />

      <div className="flex p-4 pt-4 @container">
        <div className="flex w-full flex-col gap-4">
          <ProfileHeader
            user={dashboardData?.user || { name: t('loading'), avatar: '', isPremium: false, isOnline: true }}
          />
          <EarningsCard
            totalEarnings={dashboardData?.earnings.totalEarnings || 0}
            availableBalance={dashboardData?.earnings.availableBalance || 0}
            pendingWithdrawals={dashboardData?.earnings.pendingWithdrawals || 0}
            onViewEarningsClick={() => navigate('/female/earnings')}
            onWithdrawClick={() => navigate('/female/withdrawal')}
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
        onChatClick={(id) => navigate(`/female/chat/${id}`)}
        onSeeAllClick={() => navigate('/female/chats')}
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
