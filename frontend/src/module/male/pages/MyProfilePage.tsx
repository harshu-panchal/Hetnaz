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
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { useTranslation } from '../../../core/hooks/useTranslation';

import { StatsGrid } from '../components/StatsGrid';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import { BadgeDisplay } from '../../../shared/components/BadgeDisplay';
import userService from '../../../core/services/user.service';

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



export const MyProfilePage = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { coinBalance } = useGlobalState();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useMaleNavigation();
  const [stats, setStats] = useState({
    matches: 0,
    sent: 0,
    views: 0,
    coinsSpent: 0
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [profile, setProfile] = useState(mockProfile);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userService.getMeStats();
        if (data) setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
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

  const handleTopUpClick = () => {
    navigate('/male/buy-coins');
  };

  const handleQuickActionClick = (actionId: string) => {
    switch (actionId) {
      case 'buy-coins':
        navigate('/male/buy-coins');
        break;
      case 'vip':
        console.log('VIP membership');
        break;
      case 'send-gift':
        navigate('/male/gifts');
        break;
      default:
        break;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      <MaleTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      <MaleSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      <div className="flex p-4 pt-4 @container">
        <div className="flex w-full flex-col gap-4">
          <ProfileHeader
            user={{
              name: profile.name,
              avatar: profile.avatar,
              isPremium: false,
              isOnline: true,
              memberTier: user?.memberTier || 'basic',
            }}
            onEditClick={() => navigate('/male/my-profile/profile')}
          />
          <WalletBalance
            balance={coinBalance}
            onTopUpClick={handleTopUpClick}
          />
        </div>
      </div>

      <StatsGrid stats={stats} />

      {user?.badges && user.badges.length > 0 && (
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-br from-white via-pink-50/50 to-rose-50/30 dark:from-[#2d1a24] dark:via-[#3d2530] dark:to-[#2d1a24] rounded-2xl p-5 shadow-lg border border-pink-200/50 dark:border-pink-900/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/20 dark:bg-pink-900/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-md">
                    <MaterialSymbol name="workspace_premium" className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('myBadges')}</h3>
                </div>
                <button
                  onClick={() => navigate('/male/badges')}
                  className="text-sm font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                >
                  {t('viewAll')}
                </button>
              </div>
              <BadgeDisplay
                badges={user.badges}
                maxDisplay={6}
                showUnlockedOnly={true}
                compact={true}
                onBadgeClick={() => navigate('/male/badges')}
              />
              <div className="mt-4 pt-4 border-t border-pink-200/50 dark:border-pink-900/30">
                <p className="text-xs text-pink-600/70 dark:text-pink-400/70 text-center font-medium">
                  {user.badges.filter(b => b.isUnlocked).length} {t('unlockedCount')} • {user.badges.length} {t('totalCount')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mb-4">
        <QuickActionsGrid
          actions={[
            {
              id: 'buy-coins',
              icon: 'monetization_on',
              label: t('buyCoins'),
              iconColor: 'text-primary',
              iconBgColor: 'bg-primary/10',
            },
            {
              id: 'vip',
              icon: 'card_membership',
              label: t('vipMembership'),
              iconColor: 'text-purple-500',
              iconBgColor: 'bg-purple-500/10',
            },
            {
              id: 'send-gift',
              icon: 'redeem',
              label: t('sendGift'),
              iconColor: 'text-pink-500',
              iconBgColor: 'bg-pink-500/10',
            },
          ]}
          onActionClick={handleQuickActionClick}
        />
      </div>

      <main className="p-4 space-y-6">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/5 dark:via-primary/3 dark:to-transparent rounded-2xl p-4 border border-primary/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MaterialSymbol name="insights" className="text-primary" />
            {t('activitySummary')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.views}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('profileViews')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.matches}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('matches')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.sent}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('messagesSent')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.coinsSpent}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('coinsSpent')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#342d18] rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold mb-3">{t('profileSettings')}</h3>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('account')}</h4>
            <button
              onClick={() => navigate('/male/badges')}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2f151e] transition-colors"
            >
              <div className="flex items-center gap-2">
                <MaterialSymbol name="workspace_premium" size={20} className="text-primary" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('viewBadges')}</span>
              </div>
              <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2f151e] transition-colors">
              <div className="flex items-center gap-2">
                <MaterialSymbol name="delete" size={20} className="text-red-500" />
                <span className="text-sm text-red-500">{t('deleteAccount')}</span>
              </div>
              <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
            </button>

            <div className="pt-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('language')}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${currentLanguage === 'en'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${currentLanguage === 'hi'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2f151e] transition-colors"
            >
              <div className="flex items-center gap-2">
                <MaterialSymbol name="logout" size={20} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('logout')}</span>
              </div>
              <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </main>

      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2d1a24] rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t('logoutConfirmTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {t('logoutConfirmMessage')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#3d2530] transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



