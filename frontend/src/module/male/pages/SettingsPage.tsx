import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import userService from '../../../core/services/user.service';
import { MeshBackground } from '../../../shared/components/auth/AuthLayoutComponents';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addNotification } = useGlobalState();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div className="text-slate-900 dark:text-white font-display antialiased min-h-screen relative overflow-x-hidden">
      <MeshBackground />

      <div className="relative z-10 max-w-md mx-auto w-full flex flex-col pb-16">

        {/* Header */}
        <section className="pt-4 px-4 pb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/male/my-profile')}
              className="skeuo-inset size-12 shrink-0 flex items-center justify-center rounded-2xl text-slate-600 dark:text-slate-300 active:scale-90 transition-all"
              aria-label="Back"
            >
              <MaterialSymbol name="arrow_back" size={24} />
            </button>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">{t('settings')}</h1>
          </div>
        </section>

        {/* Account Section */}
        <section className="px-4 mt-4">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="skeuo-inset size-8 rounded-xl flex items-center justify-center bg-transparent dark:bg-black/20 text-primary">
              <MaterialSymbol name="manage_accounts" size={18} />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{t('account')}</h3>
          </div>

          <div className="skeuo-card rounded-[2rem] bg-mesh-glass border-white/60 dark:border-white/5 overflow-hidden shadow-2xl p-4 space-y-2">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full h-16 skeuo-inset bg-slate-50/50 dark:bg-black/20 rounded-2xl flex items-center justify-between px-6 group hover:bg-slate-100 dark:hover:bg-black/40 transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <MaterialSymbol name="power_settings_new" size={22} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('logout')}</span>
              </div>
              <MaterialSymbol name="chevron_right" size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full h-14 skeuo-inset bg-red-500/5 dark:bg-red-500/10 rounded-2xl flex items-center justify-between px-6 group hover:bg-red-500/10 transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <MaterialSymbol name="delete_sweep" size={20} className="text-red-500/60 group-hover:text-red-500 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 group-hover:text-red-500 transition-colors">{t('deleteAccount')}</span>
              </div>
              <MaterialSymbol name="chevron_right" size={18} className="text-red-300/40" />
            </button>
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
            className="skeuo-card bg-slate-900/90 rounded-[2.5rem] p-10 max-w-sm w-full border border-white/10 shadow-2xl space-y-10 animate-in zoom-in-95 duration-300 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Background Mesh Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              <div className="skeuo-inset size-24 rounded-[2rem] flex items-center justify-center bg-amber-500/10 text-amber-500 shadow-inner">
                <MaterialSymbol name="power_settings_new" size={56} filled />
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
                className="h-16 skeuo-button-bold bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-white text-[12px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
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

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="skeuo-card bg-slate-900/90 rounded-[2.5rem] p-10 max-w-sm w-full border border-white/10 shadow-2xl space-y-10 animate-in zoom-in-95 duration-300 relative overflow-hidden"
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
