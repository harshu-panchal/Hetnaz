import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import userService from '../../../core/services/user.service';

export const SettingsPage = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addNotification } = useGlobalState();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [allowMessagesFrom, setAllowMessagesFrom] = useState<'everyone' | 'verified'>('everyone');
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  return (
    <div className="font-display text-ink antialiased selection:bg-pink-500 selection:text-white min-h-screen relative overflow-x-hidden bg-background-light">

      <div className="relative z-10 flex flex-col min-h-screen pb-16 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full px-4 pt-4 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/female/my-profile')}
            className="bg-[#f6ece7] size-12 shrink-0 flex items-center justify-center rounded-2xl text-slate-600 active:scale-90 transition-all"
            aria-label="Back"
          >
            <MaterialSymbol name="arrow_back" size={24} />
          </button>
          <h1 className="text-2xl font-black tracking-tighter text-ink">{t('settings')}</h1>
        </div>

        {/* Settings Card Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <MaterialSymbol name="manage_accounts" size={22} className="text-pink-500" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-ink font-display">
              {t('vaultSettings')}
            </h2>
          </div>

          <div className="bg-white shadow-card rounded-[2.5rem] overflow-hidden border-white/60 shadow-xl divide-y divide-gray-100">
             {/* Privacy Switch */}
             <div className="p-6 flex items-center justify-between group bg-white/20">
                <div className="space-y-1">
                   <p className="text-xs font-black uppercase tracking-widest text-ink">{t('whoCanMessageMe')}</p>
                   <p className="text-[10px] font-medium text-muted-light">{t('whoCanMessageMeDesc')}</p>
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
             <div className="p-6 flex items-center justify-between group bg-white/20">
                <div className="space-y-1">
                   <p className="text-xs font-black uppercase tracking-widest text-ink">{t('pushNotifications')}</p>
                   <p className="text-[10px] font-medium text-muted-light">{t('stayUpdated')}</p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative h-6 w-10 transition-colors duration-500 flex items-center p-1 border-2 ${pushNotifications ? 'bg-pink-500/10 border-pink-500/20' : 'bg-slate-100 border-slate-200'} rounded-full`}
                >
                  <div className={`size-4 rounded-full shadow-sm transform transition-all duration-500 ${pushNotifications ? 'translate-x-4 bg-pink-500' : 'translate-x-0 bg-slate-400'}`} />
                </button>
             </div>

             {/* Language Selector */}
             <div className="p-6 space-y-4 bg-white/20">
                <p className="text-xs font-black uppercase tracking-widest text-ink">{t('language')}</p>
                <div className="grid grid-cols-2 gap-3">
                   <button
                    onClick={() => changeLanguage('en')}
                    className={`h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${currentLanguage === 'en' ? 'shadow-card bg-pink-500 text-white shadow-pink-500/20' : 'bg-gray-50/50 text-muted-light'}`}
                   >
                     English
                   </button>
                   <button
                    onClick={() => changeLanguage('hi')}
                    className={`h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${currentLanguage === 'hi' ? 'shadow-card bg-pink-500 text-white shadow-pink-500/20' : 'bg-gray-50/50 text-muted-light'}`}
                   >
                     हिंदी
                   </button>
                </div>
             </div>

             {/* Logout & Delete - Vault Danger Zone */}
             <div className="p-6 space-y-3 bg-white/20">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full h-16 bg-slate-50/50 rounded-2xl flex items-center justify-between px-6 group hover:bg-slate-100 transition-all duration-500"
              >
                 <div className="flex items-center gap-3">
                    <MaterialSymbol name="logout" size={22} className="text-muted-light group-hover:text-pink-500 transition-colors" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-light group-hover:text-ink transition-colors">{t('logout')}</span>
                 </div>
                 <MaterialSymbol name="chevron_right" size={20} className="text-muted-light group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full h-14 bg-red-500/5 rounded-2xl flex items-center justify-between px-6 group hover:bg-red-500/10 transition-all duration-500"
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

      {/* Redesigned Premium Logout Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="shadow-card bg-[#1a1a1a]/90 rounded-[2.5rem] p-10 max-w-sm w-full border border-white/10 shadow-2xl space-y-10 animate-in zoom-in-95 duration-300 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Background Mesh Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              <div className="size-24 rounded-[2rem] flex items-center justify-center bg-pink-500/10 text-pink-500 shadow-inner">
                <MaterialSymbol name="logout" size={56} filled />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tighter text-white leading-none">{t('signOutOfVault')}</h3>
                <p className="text-[12px] font-medium text-muted-light leading-relaxed px-4 opacity-80">{t('logoutConfirmText')}</p>
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
                className="h-16 bg-white shadow-card-bold bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white text-[12px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-pink-500/20"
              >
                {isLoggingOut ? <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : t('confirmLogout')}
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="h-14 bg-white shadow-card-outline bg-white/5 rounded-2xl text-muted-light text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all border border-white/10 hover:bg-white/10"
              >
                {t('stayInVault')}
              </button>
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
            className="shadow-card bg-[#1a1a1a]/90 rounded-[2.5rem] p-10 max-w-sm w-full border border-white/10 shadow-2xl space-y-10 animate-in zoom-in-95 duration-300 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Destructive Mesh Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              <div className="size-24 rounded-[2rem] flex items-center justify-center bg-red-500/10 text-red-500 shadow-inner">
                <MaterialSymbol name="delete_forever" size={56} filled />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tighter text-white leading-none">{t('selfDestructTitle')}</h3>
                <p className="text-[12px] font-medium text-muted-light leading-relaxed px-4 opacity-80">{t('deleteAccountConfirm')}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <button
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="h-16 bg-white shadow-card-bold bg-gradient-to-r from-red-500 to-red-600 rounded-2xl text-white text-[12px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
              >
                {isDeleting ? <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : t('confirmDelete')}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="h-14 bg-white shadow-card-outline bg-white/5 rounded-2xl text-muted-light text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all border border-white/10 hover:bg-white/10"
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

export default SettingsPage;
