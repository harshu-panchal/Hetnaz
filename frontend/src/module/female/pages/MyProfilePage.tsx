import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { FemaleTopNavbar } from '../components/FemaleTopNavbar';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import { EditProfileModal } from '../components/EditProfileModal';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import userService from '../../../core/services/user.service';

export const MyProfilePage = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { addNotification } = useGlobalState();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Local display state (synced with user)
  const [name, setName] = useState(user?.name || t('anonymous'));
  const [age, setAge] = useState(24);
  const [location, setLocation] = useState(t('unknownLocation'));

  const [allowMessagesFrom, setAllowMessagesFrom] = useState<'everyone' | 'verified'>('everyone');
  const [pushNotifications, setPushNotifications] = useState(true);

  // Stats - fetched from backend
  const [stats, setStats] = useState({
    messagesReceived: 0,
    activeConversations: 0,
    totalEarnings: 0,
    availableBalance: 0,
  });
  const [_isStatsLoading, setIsStatsLoading] = useState(true);

  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfileStats();
  }, []);

  // Fetch real stats from backend
  const fetchProfileStats = async () => {
    try {
      setIsStatsLoading(true);
      const data = await userService.getFemaleDashboardData();
      setStats({
        messagesReceived: data.stats?.messagesReceived || 0,
        activeConversations: data.stats?.activeConversations || 0,
        totalEarnings: data.earnings?.totalEarnings || 0,
        availableBalance: data.earnings?.availableBalance || 0,
      });
    } catch (error) {
      console.error('Failed to fetch profile stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || t('anonymous'));
      setAge(user.age || 24);
      setLocation(user.location || user.city || t('unknownLocation'));

      if (user.photos && user.photos.length > 0) {
        setPhotos(user.photos);
      } else if (user.avatarUrl) {
        setPhotos([user.avatarUrl]);
      } else {
        setPhotos([]);
      }
    }
  }, [user, t]);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await userService.deleteMyAccount();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
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
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      {/* Top Navbar */}
      <FemaleTopNavbar />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />


      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 min-h-0">
        {/* Profile Header Card - Clickable */}
        <div
          className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/5 dark:to-transparent rounded-2xl p-6 border border-primary/20 transition-all"
        >
          <div className="flex flex-col items-center">
            <div
              className="relative mb-4 cursor-pointer active:scale-95 transition-transform"
              onClick={() => setIsEditModalOpen(true)}
            >
              <div
                className="h-32 w-32 rounded-full bg-center bg-no-repeat bg-cover border-4 border-white dark:border-[#342d18] shadow-lg"
                style={{
                  backgroundImage: photos.length > 0 ? `url("${photos[0]}")` : undefined,
                  backgroundColor: photos.length === 0 ? '#e5e7eb' : undefined,
                }}
              />
              <div className="absolute bottom-1 right-1 bg-gray-900/80 p-1.5 rounded-full text-white shadow-md">
                <MaterialSymbol name="edit" size={14} />
              </div>
              <div className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 border-2 border-white dark:border-[#342d18]">
                <div className="h-3 w-3 rounded-full bg-white" />
              </div>
            </div>

            <div className="text-center mb-0">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h2>
                <MaterialSymbol name="verified" className="text-blue-500" size={20} />
              </div>
              <p className="text-sm text-gray-600 dark:text-[#cbbc90]">{t('yearsOld', { count: age })}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <MaterialSymbol name="location_on" size={16} className="text-gray-500 dark:text-[#cbbc90]" />
                <p className="text-sm text-gray-600 dark:text-[#cbbc90]">{location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="rounded-xl px-6 py-4 bg-green-50 dark:bg-green-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <MaterialSymbol name="verified" className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('profileVerified')}</p>
              <p className="text-xs text-gray-600 dark:text-[#cbbc90]">{t('profileVerifiedDesc')}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <MaterialSymbol name="mail" className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.messagesReceived.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-[#cbbc90] mt-1">{t('messages')}</p>
          </div>

          <div className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <MaterialSymbol name="chat_bubble" className="text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeConversations}</p>
            <p className="text-xs text-gray-500 dark:text-[#cbbc90] mt-1">{t('chats')}</p>
          </div>
        </div>

        {/* Earnings Preview */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-[#cbbc90] mb-1">{t('availableBalance')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.availableBalance.toLocaleString()} coins</p>
            </div>
            <button
              onClick={() => navigate('/female/earnings')}
              className="px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors text-sm"
            >
              {t('viewEarnings')}
            </button>
          </div>
        </div>

        {/* Photo Gallery - Read Only */}
        {photos.length > 0 && (
          <div className="bg-white dark:bg-[#342d18] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('photos')}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className="relative group aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-[#2a2515] cursor-pointer"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute bottom-2 right-2 bg-yellow-400 text-white rounded-full p-0.5 shadow-sm flex items-center justify-center">
                      <MaterialSymbol name="star" size={12} filled />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Summary */}
        <div className="bg-white dark:bg-[#342d18] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MaterialSymbol name="insights" className="text-primary" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('activitySummary')}</h3>
          </div>

          <div className="space-y-3">

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#2a2515] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <MaterialSymbol name="chat_bubble" className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('activeConversations')}</p>
                  <p className="text-xs text-gray-500 dark:text-[#cbbc90]">{stats.activeConversations} ongoing chats</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.activeConversations}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#2a2515] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <MaterialSymbol name="account_balance_wallet" className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('totalEarnings')}</p>
                  <p className="text-xs text-gray-500 dark:text-[#cbbc90]">All time earnings</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white dark:bg-[#342d18] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <MaterialSymbol name="settings" className="text-primary" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('settings')}</h3>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-white/5">
            {/* Privacy Settings */}
            <div className="px-6 py-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-[#cbbc90] mb-3">{t('privacy')}</h4>

              <div className="space-y-3">


                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('whoCanMessageMe')}</p>
                    <p className="text-xs text-gray-500 dark:text-[#cbbc90]">{t('whoCanMessageMeDesc')}</p>
                  </div>
                  <select
                    value={allowMessagesFrom}
                    onChange={(e) => setAllowMessagesFrom(e.target.value as 'everyone' | 'verified')}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="everyone">{t('everyone')}</option>
                    <option value="verified">{t('verifiedOnly')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="px-6 py-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-[#cbbc90] mb-3">{t('notifications')}</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('notifications')}</p>
                    <p className="text-xs text-gray-500 dark:text-[#cbbc90]">{t('notificationsDesc')}</p>
                  </div>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className="px-6 py-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-[#cbbc90] mb-3">{t('language')}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${currentLanguage === 'en'
                    ? 'bg-primary text-slate-900 border-primary font-bold'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${currentLanguage === 'hi'
                    ? 'bg-primary text-slate-900 border-primary font-bold'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="px-6 py-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-[#cbbc90] mb-3">{t('account')}</h4>

              <div className="space-y-2">
                <button
                  onClick={() => navigate('/female/auto-messages')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2515] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MaterialSymbol name="smart_toy" className="text-gray-600 dark:text-[#cbbc90]" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t('autoMessages')}</span>
                  </div>
                  <MaterialSymbol name="chevron_right" className="text-gray-400" />
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MaterialSymbol name="delete" className="text-red-500" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{t('Delete Account')}</span>
                  </div>
                  <MaterialSymbol name="chevron_right" className="text-gray-400" />
                </button>

                <button
                  disabled={isLoggingOut}
                  onClick={() => {
                    if (isLoggingOut) return;
                    setIsLoggingOut(true);
                    addNotification({
                      title: t('logoutSuccess') || 'Logged Out',
                      message: t('logoutSuccessMessage') || 'You have been successfully logged out.',
                      type: 'system'
                    });
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <MaterialSymbol name="logout" className="text-gray-600 dark:text-[#cbbc90]" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t('logout')}</span>
                  </div>
                  <MaterialSymbol name="chevron_right" className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

      {/* Photo Lightbox */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <MaterialSymbol name="close" size={32} />
          </button>

          {/* Navigation Arrows */}
          {selectedPhotoIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhotoIndex(selectedPhotoIndex - 1);
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
            >
              <MaterialSymbol name="chevron_left" size={48} />
            </button>
          )}

          {selectedPhotoIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhotoIndex(selectedPhotoIndex + 1);
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
            >
              <MaterialSymbol name="chevron_right" size={48} />
            </button>
          )}

          {/* Image */}
          <img
            src={photos[selectedPhotoIndex]}
            alt={`Photo ${selectedPhotoIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Photo Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {selectedPhotoIndex + 1} / {photos.length}
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#2d1a24] rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4">
              <MaterialSymbol name="delete_forever" className="text-red-600 dark:text-red-400" size={32} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              {t('Delete Account?')}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
              {t('deleteAccountConfirm')}
            </p>

            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-[#3d2530] transition-colors disabled:opacity-50"
              >
                {t('Cancel')}
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t('Delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
