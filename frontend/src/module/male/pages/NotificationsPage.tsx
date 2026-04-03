import { useState, useMemo, useEffect, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';

export const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick: handleNav } = useMaleNavigation();
  const {
    persistentNotifications,
    markNotificationAsRead,
    deletePersistentNotification,
    clearAllPersistentNotifications,
    unreadCount,
    sessionStartTime
  } = useGlobalState();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filterOptions = [
    { id: 'all', label: t('filterAll') },
    { id: 'unread', label: t('unread') },
    { id: 'messages', label: t('filterMessages') },
  ];

  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredNotifications = useMemo(() => {
    let filtered = persistentNotifications.filter(n => n.timestamp >= sessionStartTime);

    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter((n) => !n.isRead);
        break;
      case 'messages':
        filtered = filtered.filter((n) => n.type === 'message');
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [persistentNotifications, selectedFilter, sessionStartTime]);

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    markNotificationAsRead(id);
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const handleDeleteNotification = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    deletePersistentNotification(id);
  };

  const getNotificationTheme = (type: string) => {
    switch (type) {
      case 'match': return { icon: 'favorite', color: 'text-rose-500', bgColor: 'bg-rose-500/10' };
      case 'message': return { icon: 'chat_bubble', color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
      case 'payment': return { icon: 'payments', color: 'text-amber-500', bgColor: 'bg-amber-500/10' };
      case 'gift': return { icon: 'redeem', color: 'text-purple-500', bgColor: 'bg-purple-500/10' };
      case 'system': return { icon: 'info', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
      default: return { icon: 'notifications', color: 'text-primary', bgColor: 'bg-primary/10' };
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return t('justNow');
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${t('ago')}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ${t('ago')}`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-[#fffcfd] dark:bg-[#0a0a0a] min-h-screen pb-32 relative overflow-hidden font-display antialiased">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-500/5 blur-[120px] rounded-full animate-blob-shift" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full animate-blob-shift" style={{ animationDelay: '-6s' }} />
      </div>

      {/* High-Gloss Header */}
      <header className="sticky top-0 z-50 bg-white/60 dark:bg-black/60 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 shadow-sm">

        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/male/dashboard')}
              className="skeuo-button w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shrink-0"
              aria-label="Back to home"
            >
              <MaterialSymbol name="arrow_back_ios_new" size={18} className="text-slate-600 dark:text-white" />
            </button>
            <div>
              <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{t('notifications')}</h1>
              {unreadCount > 0 && <span className="text-[9px] font-black uppercase tracking-widest text-primary animate-pulse-slow">{unreadCount} {t('New Alerts')}</span>}
            </div>
          </div>
          {persistentNotifications.length > 0 && (
            <button
              onClick={clearAllPersistentNotifications}
              className="skeuo-button h-10 px-4 rounded-2xl flex items-center gap-2 group transition-all"
            >
              <MaterialSymbol name="delete_sweep" size={18} className="text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-rose-500 transition-colors">{t('clearAll')}</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-md mx-auto w-full flex flex-col relative z-10 px-4">
        {/* Segmented Control */}
        <div className="pt-6 pb-2">
          <div className="skeuo-inset bg-gray-50 dark:bg-black/40 rounded-[1.5rem] p-1.5 flex gap-1">
            {filterOptions.map((filter) => {
              const isActive = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 capitalize text-xs tracking-wide ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold scale-[1.02]'
                    : 'text-slate-500 dark:text-slate-400 font-semibold hover:text-primary transition-colors'
                    }`}
                >
                  {filter.label}
                  {filter.id === 'unread' && unreadCount > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-primary'} animate-pulse`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <main className="space-y-3 mt-6">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const theme = getNotificationTheme(notification.type);
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.chatId ? `/male/chat/${notification.chatId}` : undefined)}
                  className={`group relative glass-card rounded-[1.5rem] p-4 flex items-start gap-4 cursor-pointer transition-all hover:translate-x-1 duration-300 ${!notification.isRead 
                    ? 'ring-1 ring-primary/20 shadow-[inset_0_1px_10px_rgba(255,77,109,0.05)] border-primary/20' 
                    : 'opacity-80 border-white/60 dark:border-white/10'}`}
                >
                  {/* Unread Indicator Pill */}
                  {!notification.isRead && (
                    <div className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,77,109,0.5)]" />
                  )}

                  <div className="shrink-0">
                    {notification.avatar ? (
                      <div className="relative">
                        <img
                          src={notification.avatar}
                          alt=""
                          className="w-14 h-14 rounded-2xl object-cover skeuo-card p-0.5 border-white dark:border-white/10"
                        />
                        <div className={`absolute -bottom-1 -right-1 size-6 rounded-lg skeuo-card flex items-center justify-center bg-white dark:bg-black p-1`}>
                           <MaterialSymbol name={theme.icon} size={14} className={theme.color} filled />
                        </div>
                      </div>
                    ) : (
                      <div className={`flex items-center justify-center w-14 h-14 rounded-2xl skeuo-inset ${theme.bgColor}`}>
                        <MaterialSymbol
                          name={theme.icon}
                          className={theme.color}
                          size={28}
                          filled
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                       <h3 className={`text-[13px] tracking-tight truncate ${!notification.isRead ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-600 dark:text-slate-400'}`}>
                        {t(notification.title)}
                      </h3>
                      <button
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        className="shrink-0 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"
                      >
                        <MaterialSymbol name="close" size={16} />
                      </button>
                    </div>
                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${!notification.isRead ? 'font-bold text-slate-700 dark:text-slate-300' : 'font-semibold text-slate-400 dark:text-slate-500'}`}>
                      {t(notification.message)}
                    </p>
                    <div className="flex items-center gap-2 pt-1 opacity-60">
                      <MaterialSymbol name="schedule" size={12} className="text-slate-400" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Premium Empty State "The Void" */
            <div className="pt-20">
              <div className="skeuo-card bg-mesh-glass rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-xl border border-white/60 dark:border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                
                <div className="relative size-24 skeuo-inset rounded-full flex items-center justify-center bg-gray-50 dark:bg-black/40 mb-8 animate-pulse-slow">
                   {/* Glowing Bell Backdrop */}
                   <div className="absolute inset-2 bg-primary/20 blur-[15px] rounded-full" />
                   <MaterialSymbol name="notifications_off" size={48} className="text-primary drop-shadow-[0_4px_10px_rgba(255,77,109,0.3)]" />
                </div>
                
                <h2 className="relative z-10 text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] mb-2">
                  {t('No New Alerts')}
                </h2>
                <p className="relative z-10 text-[10px] font-bold text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed uppercase tracking-widest">
                  {t('Stay tuned! Your journey and connections will alert you here.')}
                </p>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomNavigation items={navigationItems} onItemClick={handleNav} />
    </div>
  );
};
