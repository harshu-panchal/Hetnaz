// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { BottomNavigation } from '../components/BottomNavigation';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
import { MaleSidebar } from '../components/MaleSidebar';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { ProfileHeader } from '../components/ProfileHeader';
import { WalletBalance } from '../components/WalletBalance';
import { StatsGrid } from '../components/StatsGrid';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import { BadgeDisplay } from '../../../shared/components/BadgeDisplay';
import type { Badge } from '../types/male.types';


// Mock data - replace with actual API calls
const mockProfile = {
  id: 'me',
  name: 'John Doe',
  age: 28,
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoS_YLtV4hpNVbbyf0nrVmbQX6vzgn-xGLdye-t2gBz0LRib9HX4PeYJIj364IRM63hBRKmTLtWfuVOfikvNIryKKMjql6Ig1suPsbWoA45Vt8rO0N-wt7qwqIwMBV4Gaw6j7ooJER4L9QExcc20SNkyk1schLm-swXJOgx5ez3objGGhUPZpOMLYRY2W5WgHwClZhJ-JaWw470QybQVyCQD-hZYfamq_iJqx0EAJE0UNaa6Ee3_FbUUYSuUIIViQ_QxI6ytCepxc',
  bio: 'Love traveling and exploring new places. Looking for someone to share adventures with!',
  occupation: 'Software Engineer',
  city: 'Mumbai',
  interests: ['Travel', 'Photography', 'Hiking', 'Music'],
  preferences: {
    ageRange: { min: 22, max: 35 },
    maxDistance: 50,
    interests: ['Travel', 'Photography'],
  },
  photos: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBoS_YLtV4hpNVbbyf0nrVmbQX6vzgn-xGLdye-t2gBz0LRib9HX4PeYJIj364IRM63hBRKmTLtWfuVOfikvNIryKKMjql6Ig1suPsbWoA45Vt8rO0N-wt7qwqIwMBV4Gaw6j7ooJER4L9QExcc20SNkyk1schLm-swXJOgx5ez3objGGhUPZpOMLYRY2W5WgHwClZhJ-JaWw470QybQVyCQD-hZYfamq_iJqx0EAJE0UNaa6Ee3_FbUUYSuUIIViQ_QxI6ytCepxc',
  ],
};

const mockStats = {
  profileViews: 342,
  matches: 12,
  messagesSent: 85,
  coinsSpent: 4250,
};

// Mock badges data
const mockUserBadges: Badge[] = [
  {
    id: '1',
    name: 'VIP Member',
    icon: 'workspace_premium',
    description: 'Exclusive VIP membership badge',
    category: 'vip',
    isUnlocked: true,
    unlockedAt: '2024-01-15',
    rarity: 'legendary',
  },
  {
    id: '2',
    name: 'First Gift',
    icon: 'redeem',
    description: 'Sent your first gift',
    category: 'achievement',
    isUnlocked: true,
    unlockedAt: '2024-01-20',
    rarity: 'common',
  },
  {
    id: '3',
    name: 'Chat Master',
    icon: 'chat_bubble',
    description: 'Sent 100 messages',
    category: 'achievement',
    isUnlocked: true,
    unlockedAt: '2024-01-25',
    rarity: 'rare',
  },
  {
    id: '5',
    name: 'Early Adopter',
    icon: 'star',
    description: 'Joined in the first month',
    category: 'special',
    isUnlocked: true,
    unlockedAt: '2024-01-01',
    rarity: 'rare',
  },
  {
    id: '7',
    name: 'Profile Perfect',
    icon: 'check_circle',
    description: 'Complete your profile 100%',
    category: 'achievement',
    isUnlocked: true,
    unlockedAt: '2024-01-10',
    rarity: 'common',
  },
];

// Mock dashboard data for profile page
const mockDashboardData = {
  wallet: {
    balance: 1250,
  },
  stats: {
    matches: 12,
    sent: 85,
    views: 204,
  },
  user: {
    badges: mockUserBadges,
  },
};

export const MyProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useMaleNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [profile, setProfile] = useState(mockProfile);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowMessagesFrom, setAllowMessagesFrom] = useState<'everyone' | 'verified'>('everyone');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      const userProfile = {
        ...mockProfile,
        id: user.id || mockProfile.id,
        name: user.name || 'Anonymous',
        age: user.age || 0,
        occupation: user.occupation || '',
        city: user.city || (user.location ? user.location.split(',')[0] : '') || '',
        bio: user.bio || '',
        interests: user.interests || [],
        avatar: user.avatarUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
        photos: (user.photos && user.photos.length > 0) ? user.photos : (user.avatarUrl ? [user.avatarUrl] : []),
      };
      setProfile(userProfile);
    }
  }, [user]);

  const handleNotificationClick = () => {
    navigate('/male/notifications');
  };

  const handleTopUpClick = () => {
    navigate('/male/buy-coins');
  };

  const handleQuickActionClick = (actionId: string) => {
    switch (actionId) {
      case 'buy-coins':
        navigate('/male/buy-coins');
        break;
      case 'vip':
        // TODO: Navigate to VIP membership page
        console.log('VIP membership');
        break;
      case 'send-gift':
        navigate('/male/gifts');
        break;
      default:
        break;
    }
  };


  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      {/* Top Navbar */}
      <MaleTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <MaleSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      {/* Profile Header Section */}
      <div className="flex p-4 pt-4 @container">
        <div className="flex w-full flex-col gap-4">
          <ProfileHeader
            user={{
              name: profile.name,
              avatar: profile.avatar,
              isPremium: false,
              isOnline: true,
            }}
            onArrowClick={() => navigate('/male/my-profile/profile')}
          />
          {/* Wallet & Top Up Block */}
          <WalletBalance
            balance={mockDashboardData.wallet.balance}
            onTopUpClick={handleTopUpClick}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={mockDashboardData.stats} />

      {/* Badges Section */}
      {mockDashboardData.user.badges && mockDashboardData.user.badges.length > 0 && (
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-br from-white via-pink-50/50 to-rose-50/30 dark:from-[#2d1a24] dark:via-[#3d2530] dark:to-[#2d1a24] rounded-2xl p-5 shadow-lg border border-pink-200/50 dark:border-pink-900/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/20 dark:bg-pink-900/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-md">
                    <MaterialSymbol name="workspace_premium" className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Badges</h3>
                </div>
                <button
                  onClick={() => navigate('/male/badges')}
                  className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                >
                  View All
                </button>
              </div>
              <BadgeDisplay
                badges={mockDashboardData.user.badges}
                maxDisplay={6}
                showUnlockedOnly={true}
                compact={true}
                onBadgeClick={() => navigate('/male/badges')}
              />
              <div className="mt-4 pt-4 border-t border-pink-200/50 dark:border-pink-900/30">
                <p className="text-xs text-pink-600/70 dark:text-pink-400/70 text-center font-medium">
                  {mockDashboardData.user.badges.filter(b => b.isUnlocked).length} unlocked • {mockDashboardData.user.badges.length} total
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="px-4 mb-4">
        <QuickActionsGrid
          actions={[
            {
              id: 'buy-coins',
              icon: 'monetization_on',
              label: 'Buy Coins',
              iconColor: 'text-primary',
              iconBgColor: 'bg-primary/10',
            },
            {
              id: 'vip',
              icon: 'card_membership',
              label: 'VIP Membership',
              iconColor: 'text-purple-500',
              iconBgColor: 'bg-purple-500/10',
            },
            {
              id: 'send-gift',
              icon: 'redeem',
              label: 'Send Gift',
              iconColor: 'text-pink-500',
              iconBgColor: 'bg-pink-500/10',
            },
          ]}
          onActionClick={handleQuickActionClick}
        />
      </div>


      {/* Profile Content */}
      <main className="p-4 space-y-6">

        {/* Activity Summary */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/5 dark:via-primary/3 dark:to-transparent rounded-2xl p-4 border border-primary/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MaterialSymbol name="insights" className="text-primary" />
            Activity Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockStats.profileViews}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Profile Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockStats.matches}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockStats.messagesSent}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Messages Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockStats.coinsSpent}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Coins Spent</div>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white dark:bg-[#342d18] rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold mb-3">Profile Settings</h3>

          {/* Privacy Settings */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialSymbol name="visibility" size={20} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Online Status</span>
              </div>
              <button
                onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                className={`relative w-12 h-6 rounded-full transition-colors ${showOnlineStatus ? 'bg-primary' : 'bg-gray-300'
                  }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${showOnlineStatus ? 'translate-x-6' : ''
                    }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialSymbol name="chat" size={20} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Who Can Message Me</span>
              </div>
              <select
                value={allowMessagesFrom}
                onChange={(e) => setAllowMessagesFrom(e.target.value as 'everyone' | 'verified')}
                className="px-3 py-1 bg-gray-100 dark:bg-[#2f151e] border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="everyone">Everyone</option>
                <option value="verified">Verified Only</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialSymbol name="email" size={20} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-primary' : 'bg-gray-300'
                  }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${emailNotifications ? 'translate-x-6' : ''
                    }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialSymbol name="notifications" size={20} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Push Notifications</span>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${pushNotifications ? 'bg-primary' : 'bg-gray-300'
                  }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${pushNotifications ? 'translate-x-6' : ''
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Account Settings */}
          <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</h4>
            <button
              onClick={() => navigate('/male/badges')}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2f151e] transition-colors"
            >
              <div className="flex items-center gap-2">
                <MaterialSymbol name="workspace_premium" size={20} className="text-primary" />
                <span className="text-sm text-gray-700 dark:text-gray-300">View Badges</span>
              </div>
              <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2f151e] transition-colors">
              <div className="flex items-center gap-2">
                <MaterialSymbol name="delete" size={20} className="text-red-500" />
                <span className="text-sm text-red-500">Delete Account</span>
              </div>
              <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2f151e] transition-colors"
            >
              <div className="flex items-center gap-2">
                <MaterialSymbol name="logout" size={20} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Logout</span>
              </div>
              <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2d1a24] rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Logout?</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#3d2530] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



