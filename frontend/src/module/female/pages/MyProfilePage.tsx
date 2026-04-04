import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import { EditProfileModal } from '../components/EditProfileModal';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import userService from '../../../core/services/user.service';
import { MeshBackground } from '../../../shared/components/auth/AuthLayoutComponents';

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark relative overflow-hidden">
        <MeshBackground />
        <div className="relative z-10 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="font-display text-slate-900 dark:text-white antialiased selection:bg-pink-500 selection:text-white min-h-screen relative overflow-x-hidden bg-background-light dark:bg-[#0a0a0a]">
      <MeshBackground />
      
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Scrollable Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen pb-32 max-w-md mx-auto w-full px-4 pt-12 space-y-4">
        
        {/* Profile Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-pink-500/10 blur-[80px] rounded-full opacity-50 pointer-events-none" />
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative group">
               {/* Glossy Aura */}
               <div className="absolute -inset-4 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               
               <div className="relative z-10 group/avatar">
                 <div className="size-40 rounded-full overflow-hidden shadow-2xl transition-transform active:scale-95 duration-500 group-hover/avatar:rotate-1">
                   <div
                     className="size-full rounded-full bg-center bg-no-repeat bg-cover"
                     style={{
                       backgroundImage: photos.length > 0 ? `url("${photos[0]}")` : undefined,
                       backgroundColor: photos.length === 0 ? '#e5e7eb' : undefined,
                     }}
                   />
                 </div>
                 <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-2 right-2 skeuo-button size-10 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-90 transition-all border border-pink-400/50 z-30"
                 >
                   <MaterialSymbol name="edit" size={20} filled />
                 </button>
               </div>
               
               {/* Online Indicator */}
               <div className="absolute top-2 right-2 size-6 rounded-full bg-green-500 border-2 border-white/20 z-20 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <div className="size-1.5 bg-white rounded-full animate-pulse" />
               </div>
            </div>

            <div className="space-y-1 relative z-10">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white px-6 leading-tight pb-2">
                {name}
                <span className="inline-flex items-center ml-2 align-middle">
                  <MaterialSymbol name="verified" className="text-blue-500 drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]" size={28} filled />
                </span>
              </h1>
              <div className="flex items-center justify-center gap-3">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{t('yearsOld', { count: age })}</span>
                 <div className="size-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                 <div className="flex items-center gap-1">
                    <MaterialSymbol name="location_on" size={14} className="text-pink-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{location}</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Status Banner */}
        <div className="skeuo-inset bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-4 transition-colors duration-500 max-w-sm mx-auto w-full">
          <MaterialSymbol name="verified" size={24} className="text-emerald-500" filled />
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">{t('profileVerified')}</p>
            <p className="text-[8px] font-medium text-emerald-600/60 dark:text-emerald-400/60 leading-tight">{t('profileVerifiedDesc')}</p>
          </div>
        </div>

        {/* About & Interests Section */}
        {(user?.bio || (user?.interests && user.interests.length > 0)) && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 px-1">
              <MaterialSymbol name="person_outline" size={22} className="text-pink-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white font-display">
                {t('about')}
              </h2>
            </div>

            <div className="skeuo-card bg-mesh-glass rounded-[2rem] px-6 py-4 border-white/60 dark:border-white/5 shadow-xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              {user?.bio && (
                <div className="space-y-0.5 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{t('bio')}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic border-l-2 border-pink-500/20 pl-4 py-0 mt-0.5">
                    "{user.bio}"
                  </p>
                </div>
              )}

              {user?.interests && user.interests.length > 0 && (
                <div className="space-y-2 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{t('interests')}</p>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-xl bg-pink-500/5 border border-pink-500/10 text-[9px] font-black uppercase tracking-widest text-pink-500/80 shadow-sm transition-all hover:scale-105 active:scale-95"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Photo Portfolio Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <MaterialSymbol name="photo_library" size={22} className="text-pink-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white font-display">
                {t('photos')}
              </h2>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-[10px] font-black uppercase tracking-widest text-pink-500 hover:scale-105 active:scale-95 transition-transform"
            >
              {t('manage')}
            </button>
          </div>

          <div className="grid grid-cols-6 gap-4">
            {photos.length > 0 ? photos.map((photo, index) => (
              <div
                key={index}
                onClick={() => setSelectedPhotoIndex(index)}
                className={`relative group rounded-[2rem] overflow-hidden skeuo-card bg-mesh-glass border-white/60 dark:border-white/5 shadow-xl cursor-pointer hover:translate-y-[-4px] active:scale-95 transition-all duration-500 ${
                  index === 0 ? 'col-span-6 aspect-[16/9]' : 'col-span-2 aspect-[4/5]'
                }`}
              >
                {index === 0 && (
                  <div className="absolute top-4 left-4 z-20">
                     <div className="skeuo-card bg-pink-500/90 backdrop-blur-md px-3 py-1 rounded-full border-white/20 shadow-lg">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1">
                           <MaterialSymbol name="star" size={10} filled />
                           {t('featured')}
                        </span>
                     </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <img
                  src={photo}
                  alt={`Portfolio ${index + 1}`}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                <div className="absolute bottom-4 right-4 skeuo-button size-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
                   <MaterialSymbol name="open_in_full" size={16} className="text-pink-500" />
                </div>
              </div>
            )) : (
              <div className="col-span-2 skeuo-inset bg-gray-50/50 dark:bg-black/20 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-slate-200 dark:border-white/10">
                 <div className="size-16 skeuo-card rounded-full flex items-center justify-center bg-white/40 dark:bg-white/5">
                    <MaterialSymbol name="add_a_photo" size={32} className="text-slate-300 dark:text-slate-600" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('noPhotos')}</p>
                    <p className="text-[10px] font-medium text-slate-400/60 dark:text-slate-600">{t('uploadToShine')}</p>
                 </div>
                 <button onClick={() => setIsEditModalOpen(true)} className="skeuo-button px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-pink-500">
                    {t('uploadNow')}
                 </button>
              </div>
            )}
          </div>
        </section>

        {/* Stats & Earnings Showcase */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 px-1">
            <MaterialSymbol name="bar_chart" size={22} className="text-pink-500" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white font-display">
              {t('performance')}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="skeuo-card bg-mesh-glass rounded-[2rem] p-6 space-y-4 shadow-xl border-white/60 dark:border-white/5">
                <MaterialSymbol name="mail" size={32} className="text-blue-500" filled />
                <div>
                   <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">{stats.messagesReceived.toLocaleString()}</p>
                   <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 mt-1">{t('messages')}</p>
                </div>
             </div>
             <div className="skeuo-card bg-mesh-glass rounded-[2rem] p-6 space-y-4 shadow-xl border-white/60 dark:border-white/5">
                <MaterialSymbol name="chat_bubble" size={32} className="text-purple-500" filled />
                <div>
                   <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">{stats.activeConversations.toLocaleString()}</p>
                   <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 mt-1">{t('activeChats')}</p>
                </div>
             </div>
          </div>

          {/* Earnings Glass Card */}
          <div className="group relative overflow-hidden skeuo-card bg-mesh-glass rounded-[2.5rem] p-8 border-white/60 dark:border-white/5 shadow-2xl transition-all hover:translate-y-[-2px]">
             <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />
             <div className="flex items-center justify-between relative z-10">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <MaterialSymbol name="payments" size={22} className="text-emerald-500" filled />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{t('earnings')}</span>
                   </div>
                   <div className="space-y-1">
                      <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                        {stats.availableBalance.toLocaleString()}
                      </p>
                      <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">{t('coinsAvailable')}</p>
                   </div>
                </div>
                <button 
                  onClick={() => navigate('/female/earnings')}
                  className="skeuo-button h-14 px-8 rounded-2xl flex items-center justify-center bg-pink-500 text-white shadow-xl shadow-pink-500/20 active:scale-95 transition-all group/btn"
                >
                   <span className="text-[10px] font-black uppercase tracking-[0.25em] drop-shadow-sm">{t('details')}</span>
                </button>
             </div>
          </div>
        </section>

        {/* Global Settings Section */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 px-1">
            <MaterialSymbol name="settings" size={22} className="text-pink-500" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white font-display">
              {t('settings')}
            </h2>
          </div>

          <div className="skeuo-card bg-mesh-glass rounded-[2.5rem] overflow-hidden border-white/60 dark:border-white/5 shadow-xl divide-y divide-gray-100 dark:divide-white/5">
             
             {/* Privacy Switch */}
             <div className="p-6 flex items-center justify-between group">
                <div className="space-y-1">
                   <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('whoCanMessageMe')}</p>
                   <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{t('whoCanMessageMeDesc')}</p>
                </div>
                <div className="flex items-center relative">
                  <select
                    value={allowMessagesFrom}
                    onChange={(e) => setAllowMessagesFrom(e.target.value as 'everyone' | 'verified')}
                    className="bg-transparent border-none appearance-none text-[10px] font-black uppercase tracking-widest text-pink-500 focus:ring-0 outline-none pr-8 cursor-pointer"
                  >
                    <option value="everyone">{t('everyone')}</option>
                    <option value="verified">{t('verifiedOnly')}</option>
                  </select>
                  <div className="absolute right-0 pointer-events-none">
                    <MaterialSymbol name="expand_more" size={18} className="text-pink-500" />
                  </div>
                </div>
             </div>

             {/* Notifications Switch */}
             <div className="p-6 flex items-center justify-between group">
                <div className="space-y-1">
                   <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('pushNotifications')}</p>
                   <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{t('stayUpdated')}</p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative h-6 w-10 transition-colors duration-500 flex items-center p-1 border-2 ${pushNotifications ? 'bg-pink-500/10 border-pink-500/20' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'} rounded-full`}
                >
                  <div className={`size-4 rounded-full shadow-sm transform transition-all duration-500 ${pushNotifications ? 'translate-x-4 bg-pink-500' : 'translate-x-0 bg-slate-400 dark:bg-slate-600'}`} />
                </button>
             </div>

             {/* Language Selector */}
             <div className="p-6 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('language')}</p>
                <div className="grid grid-cols-2 gap-3">
                   <button
                    onClick={() => changeLanguage('en')}
                    className={`h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${currentLanguage === 'en' ? 'skeuo-button bg-pink-500 text-white shadow-pink-500/20' : 'skeuo-inset bg-gray-50/50 dark:bg-black/20 text-slate-400 dark:text-slate-500'}`}
                   >
                     English
                   </button>
                   <button
                    onClick={() => changeLanguage('hi')}
                    className={`h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${currentLanguage === 'hi' ? 'skeuo-button bg-pink-500 text-white shadow-pink-500/20' : 'skeuo-inset bg-gray-50/50 dark:bg-black/20 text-slate-400 dark:text-slate-500'}`}
                   >
                     हिंदी
                   </button>
                </div>
             </div>

             {/* Logout & Delete - Vault Danger Zone */}
             <div className="p-6 space-y-3">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full h-16 skeuo-inset bg-slate-50/50 dark:bg-black/20 rounded-2xl flex items-center justify-between px-6 group hover:bg-slate-100 dark:hover:bg-black/40 transition-all duration-500"
              >
                 <div className="flex items-center gap-3">
                    <MaterialSymbol name="logout" size={22} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('logout')}</span>
                 </div>
                 <MaterialSymbol name="chevron_right" size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full h-14 skeuo-inset bg-red-500/5 dark:bg-red-500/10 rounded-2xl flex items-center justify-between px-6 group hover:bg-red-500/10 transition-all duration-500"
                >
                   <div className="flex items-center gap-3">
                      <MaterialSymbol name="delete_forever" size={20} className="text-red-500/60 group-hover:text-red-500 transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 group-hover:text-red-500 transition-colors">{t('deleteAccount')}</span>
                   </div>
                   <MaterialSymbol name="chevron_right" size={18} className="text-red-300/40" />
                </button>
             </div>
          </div>
        </section>
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

      {/* Redesigned Premium Logout Modal */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300"
          onClick={() => setShowLogoutModal(false)}
        >
          <div 
            className="skeuo-card bg-[#1a1a1a]/90 rounded-[2.5rem] p-10 max-w-sm w-full border border-white/10 shadow-2xl space-y-10 animate-in zoom-in-95 duration-300 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
             {/* Background Mesh Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none" />
             
             <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="skeuo-inset size-24 rounded-[2rem] flex items-center justify-center bg-pink-500/10 text-pink-500 shadow-inner">
                   <MaterialSymbol name="logout" size={56} filled />
                </div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-black tracking-tighter text-white leading-none">{t('signOutOfVault')}</h3>
                   <p className="text-[12px] font-medium text-slate-400 leading-relaxed px-4 opacity-80">{t('logoutConfirmText')}</p>
                </div>
             </div>

             <div className="flex flex-col gap-4 relative z-10">
                <button
                  disabled={isLoggingOut}
                  onClick={() => {
                    if (isLoggingOut) return;
                    setIsLoggingOut(true);
                    addNotification({ title: 'logoutSuccess', message: 'logoutSuccessMessage', type: 'system' });
                    logout();
                    navigate('/login');
                  }}
                  className="h-16 skeuo-button-bold bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white text-[12px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-pink-500/20"
                >
                   {isLoggingOut ? <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : t('confirmLogout')}
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="h-14 skeuo-button-outline bg-white/5 rounded-2xl text-slate-300 text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all border border-white/10 hover:bg-white/10"
                >
                   {t('stayInVault')}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Modern High-Gloss Photo Lightbox */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center animate-in fade-in duration-500"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Close button relocated to bottom-center */}

          {/* Large Portfolio View */}
          <div className="relative w-full h-[70vh] flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
             <img
               src={photos[selectedPhotoIndex]}
               alt={`Portfolio ${selectedPhotoIndex + 1}`}
               className="max-w-full max-h-full object-contain rounded-[2.5rem] shadow-2xl border border-white/10"
             />
             
             {/* Large Navigation */}
             <div className="absolute inset-x-4 flex items-center justify-between pointer-events-none">
                <button
                  disabled={selectedPhotoIndex === 0}
                  onClick={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                  className={`pointer-events-auto skeuo-button size-14 rounded-[1.5rem] flex items-center justify-center bg-white/10 text-white backdrop-blur-xl border-white/10 active:scale-90 transition-all ${selectedPhotoIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                >
                  <MaterialSymbol name="chevron_left" size={32} />
                </button>
                <button
                  disabled={selectedPhotoIndex === photos.length - 1}
                  onClick={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                  className={`pointer-events-auto skeuo-button size-14 rounded-[1.5rem] flex items-center justify-center bg-white/10 text-white backdrop-blur-xl border-white/10 active:scale-90 transition-all ${selectedPhotoIndex === photos.length - 1 ? 'opacity-0' : 'opacity-100'}`}
                >
                  <MaterialSymbol name="chevron_right" size={32} />
                </button>
             </div>
          </div>

           <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-8 z-20">
              {/* Glow Action Close Button */}
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="skeuo-button size-16 rounded-full flex items-center justify-center bg-white/10 text-white backdrop-blur-2xl border border-white/20 shadow-2xl active:scale-90 transition-all group hover:bg-white/20"
              >
                <div className="absolute inset-0 bg-pink-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <MaterialSymbol name="close" size={32} className="relative z-10" />
              </button>

              <div className="p-1.5 rounded-2xl skeuo-inset bg-white/5 border border-white/10 backdrop-blur-md">
                 <div className="flex gap-2">
                    {photos.map((_, i) => (
                       <div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${i === selectedPhotoIndex ? 'w-8 bg-pink-500' : 'w-1.5 bg-white/20'}`} />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300"
          onClick={() => setShowDeleteConfirm(false)}
        >
           <div 
             className="skeuo-card bg-[#1a1a1a]/90 rounded-[2.5rem] p-10 max-w-sm w-full border border-white/10 shadow-2xl space-y-10 animate-in zoom-in-95 duration-300 relative overflow-hidden"
             onClick={e => e.stopPropagation()}
           >
             {/* Destructive Mesh Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
             
             <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="skeuo-inset size-24 rounded-[2rem] flex items-center justify-center bg-red-500/10 text-red-500 shadow-inner">
                   <MaterialSymbol name="delete_forever" size={56} filled />
                </div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-black tracking-tighter text-white leading-none">{t('selfDestructTitle')}</h3>
                   <p className="text-[12px] font-medium text-slate-400 leading-relaxed px-4 opacity-80">{t('deleteAccountConfirm')}</p>
                </div>
             </div>

             <div className="flex flex-col gap-4 relative z-10">
                <button
                  disabled={isDeleting}
                  onClick={handleDeleteAccount}
                  className="h-16 skeuo-button-bold bg-gradient-to-r from-red-500 to-red-600 rounded-2xl text-white text-[12px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
                >
                   {isDeleting ? <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : t('confirmDelete')}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-14 skeuo-button-outline bg-white/5 rounded-2xl text-slate-300 text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all border border-white/10 hover:bg-white/10"
                >
                   {t('abortAction')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

