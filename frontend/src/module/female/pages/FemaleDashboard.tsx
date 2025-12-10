import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileHeader } from '../components/ProfileHeader';
import { EarningsCard } from '../components/EarningsCard';
import { FemaleStatsGrid } from '../components/FemaleStatsGrid';
import { ActiveChatsList } from '../components/ActiveChatsList';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import type { FemaleDashboardData } from '../types/female.types';

// Mock data - replace with actual API calls
const mockDashboardData: FemaleDashboardData = {
  user: {
    id: '1',
    name: 'Emma',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC81hkr7IkYx1ryaWF6XEKAw50xyRvJBGMogrF-zD5ChG66QAopPNWZvczWXWXasmarotX6xfLiXqIGT-HGa4N4mpnfl6tHPN16fBm5L0ebBFFR6YnfhOhNpt_PXB-rNdw4iozv00ERuqlCKno-B1P2UZ6g-dU5YY4Or_m3Xdgk4_MrxVK9o6Uz70Vr_fXQdMhSrjjCl7s_yQE_R1O9FNwroQqdfSFv6kiO76qVxmnHDhLrYwRWtfdSdegsNjAzgAdgkUZgUomw2j8',
    isPremium: true,
    isOnline: true,
  },
  earnings: {
    totalEarnings: 15250,
    availableBalance: 12450,
    pendingWithdrawals: 2800,
  },
  stats: {
    messagesReceived: 342,
    activeConversations: 18,
    profileViews: 1256,
  },
  activeChats: [
    {
      id: '1',
      userId: '1',
      userName: 'Alex',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
      lastMessage: 'Thanks for the great conversation! 😊',
      timestamp: '10:30 AM',
      isOnline: true,
      hasUnread: true,
    },
    {
      id: '2',
      userId: '2',
      userName: 'Michael',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
      lastMessage: 'Looking forward to chatting more!',
      timestamp: 'Yesterday',
      isOnline: false,
      hasUnread: false,
    },
    {
      id: '3',
      userId: '3',
      userName: 'David',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
      lastMessage: 'You have a beautiful profile!',
      timestamp: 'Tue',
      isOnline: false,
      hasUnread: false,
    },
  ],
};

const navigationItems = [
  { id: 'dashboard', icon: 'home', label: 'Home', isActive: true },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats', hasBadge: true },
  { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

const quickActions = [
  { id: 'earnings', icon: 'trending_up', label: 'View Earnings' },
  { id: 'withdraw', icon: 'payments', label: 'Withdraw' },
  { id: 'auto-messages', icon: 'auto_awesome', label: 'Auto Messages' },
];

export const FemaleDashboard = () => {
  const [dashboardData] = useState<FemaleDashboardData>(mockDashboardData);
  const navigate = useNavigate();

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

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/female/dashboard');
        break;
      case 'chats':
        navigate('/female/chats');
        break;
      case 'earnings':
        navigate('/female/earnings');
        break;
      case 'profile':
        navigate('/female/my-profile');
        break;
      default:
        break;
    }
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

  return (
    <div className="relative flex w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-20">
      {/* Profile Header Section */}
      <div className="flex p-4 pt-8 @container">
        <div className="flex w-full flex-col gap-4">
          <ProfileHeader
            user={dashboardData.user}
            onNotificationClick={handleNotificationClick}
          />
          {/* Earnings Card */}
          <EarningsCard
            totalEarnings={dashboardData.earnings.totalEarnings}
            availableBalance={dashboardData.earnings.availableBalance}
            pendingWithdrawals={dashboardData.earnings.pendingWithdrawals}
            onViewEarningsClick={handleViewEarningsClick}
            onWithdrawClick={handleWithdrawClick}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <FemaleStatsGrid stats={dashboardData.stats} />

      {/* Quick Actions Grid */}
      <QuickActionsGrid actions={quickActions.map(action => ({
        ...action,
        onClick: () => handleQuickActionClick(action.id),
      }))} />

      {/* Active Chats List */}
      <ActiveChatsList
        chats={dashboardData.activeChats}
        onChatClick={handleChatClick}
        onSeeAllClick={handleSeeAllChatsClick}
      />

      {/* Bottom Navigation Bar */}
      <FemaleBottomNavigation
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />
    </div>
  );
};

