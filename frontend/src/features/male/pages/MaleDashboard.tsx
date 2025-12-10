import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileHeader } from '../components/ProfileHeader';
import { WalletBalance } from '../components/WalletBalance';
import { StatsGrid } from '../components/StatsGrid';
import { DiscoverNearbyCard } from '../components/DiscoverNearbyCard';
import { ActiveChatsList } from '../components/ActiveChatsList';
import { BottomNavigation } from '../components/BottomNavigation';
import type { MaleDashboardData } from '../types/male.types';

// Mock data - replace with actual API calls
const mockDashboardData: MaleDashboardData = {
  user: {
    id: '1',
    name: 'Alex',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
    isPremium: true,
    isOnline: true,
  },
  wallet: {
    balance: 1250,
  },
  stats: {
    matches: 12,
    sent: 85,
    views: 204,
  },
  nearbyUsers: [
    {
      id: '1',
      name: 'Sarah',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC81hkr7IkYx1ryaWF6XEKAw50xyRvJBGMogrF-zD5ChG66QAopPNWZvczWXWXasmarotX6xfLiXqIGT-HGa4N4mpnfl6tHPN16fBm5L0ebBFFR6YnfhOhNpt_PXB-rNdw4iozv00ERuqlCKno-B1P2UZ6g-dU5YY4Or_m3Xdgk4_MrxVK9o6Uz70Vr_fXQdMhSrjjCl7s_yQE_R1O9FNwroQqdfSFv6kiO76qVxmnHDhLrYwRWtfdSdegsNjAzgAdgkUZgUomw2j8',
    },
    {
      id: '2',
      name: 'Jessica',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_3D5tki5d2RSAJuSJ_Ow31htoQH_FV5cZMGWqi6Cr5CMDqjOebH645goD9BnAUabnDZTNirhvkDX6-eITfd1EzLFFNW_KcLdBa2aFXo2ydswriuWM4hVqwZ3FlbtKuKsNiL3AX4zC9kUMmRRH86XSg0TINNfB5SCw-BMXWwyr26rp1VW5KtSllNAOXUT7NSpen7_J_iBbqFkoLhUROpUPQJHgyhZT657eYWmFgMTm93IK8-tM1KQMXUjXcFcJYAkSXUPry1QbEfo',
    },
  ],
  activeChats: [
    {
      id: '1',
      userId: '1',
      userName: 'Sarah',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSkFD2tzaMZiHcQ1Hm3BtJ1_UpqjoqUR_BFf2E0V7D_ppQlSWvIdDEfEBe0SPJZdTD5rtlREZvDwgJ9oL4aHTkwpfMeYycsunZlMQ_hknAY1ZNesaJ-vRkHWzRyTiCx9lwzN1_n0QMMdv8bJzzctJXhhx0ei-uw00ofyW01_9eOdINFUaXIx4mo09JX_t7wPq80h8xmmPpj8QWY0zqV8iHhF5YC9ZY4CegBhblLxKJvbgRxSmo6-8DYXdFCZcgVX16sSrpCGqceHA',
      lastMessage: 'See you at the coffee shop! ☕️',
      timestamp: '10:30 AM',
      isOnline: true,
      hasUnread: true,
    },
    {
      id: '2',
      userId: '2',
      userName: 'Jessica',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA0MFV18-2tNUL3hajagAclv-DEWceOAML73Z_hH5inSVR0AGAPtavYAfoV2rZS9WqRuv40Z2vt2DPWkJBDLJAKY6T3WrkdjwAFUwJsNr5gSekJ8dsvfX_5zvsldd7IdBCpJshws7td-x6g0CdSXzOEDEE6XKq7yyiOVmaoNmccJ9SLQqsiPNrVgoZCHAXcfsiTgoH6e4GuJxD0CqeLjQY1DVMkNxsOb8HgptbHRrdACXZO0K0SdYiL7_oKSLB8mWfsqhgus_H2MI',
      lastMessage: 'That sounds like a great plan.',
      timestamp: 'Yesterday',
      isOnline: false,
      hasUnread: false,
    },
    {
      id: '3',
      userId: '3',
      userName: 'Emily',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIEnsXe0RpUu5LWRCfLi_lS-2wr9joEcf15WUPbFUamLpw44YrY6ci9n8jlL35RqX477FvduXCyJHoR4vMnQ9TazzyN4HxCns6xvssFGXnnj8AHJQ5WtID3GmVrTmJiIePWYlkI4Ahz944gcuOSaENv86pMF568tb1UYu1CYKCMkUhXOOsLd5mNg3EwYWl0x8i5xQoek5Ky4dnKVyB4UEPgmRoTzc_K8nhgnwI0tLLwJZqq9mNRcMWOvLl_sP4mjWRku5taLuKGJ0',
      lastMessage: 'Did you see the new movie?',
      timestamp: 'Tue',
      isOnline: false,
      hasUnread: false,
    },
  ],
};

const navigationItems = [
  { id: 'discover', icon: 'explore', label: 'Discover' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats', hasBadge: true },
  { id: 'wallet', icon: 'monetization_on', label: 'Wallet' },
  { id: 'profile', icon: 'person', label: 'Profile', isActive: true },
];

export const MaleDashboard = () => {
  const [dashboardData] = useState<MaleDashboardData>(mockDashboardData);

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleTopUpClick = () => {
    // TODO: Navigate to coin purchase page
    console.log('Top Up clicked');
  };

  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/discover');
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleSeeAllChatsClick = () => {
    navigate('/chats');
  };

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'discover':
        navigate('/discover');
        break;
      case 'chats':
        navigate('/chats');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      case 'profile':
        navigate('/my-profile');
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24">
      {/* Profile Header Section */}
      <div className="flex p-4 pt-8 @container">
        <div className="flex w-full flex-col gap-4">
          <ProfileHeader
            user={dashboardData.user}
            onNotificationClick={handleNotificationClick}
          />
          {/* Wallet & Top Up Block */}
          <WalletBalance
            balance={dashboardData.wallet.balance}
            onTopUpClick={handleTopUpClick}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={dashboardData.stats} />

      {/* Discover Nearby Card */}
      <DiscoverNearbyCard
        nearbyUsers={dashboardData.nearbyUsers}
        onExploreClick={handleExploreClick}
      />

      {/* Active Chats List */}
      <ActiveChatsList
        chats={dashboardData.activeChats}
        onChatClick={handleChatClick}
        onSeeAllClick={handleSeeAllChatsClick}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />
    </div>
  );
};

