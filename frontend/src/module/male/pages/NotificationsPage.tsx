import { useState, useMemo, useEffect, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
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

    return filtered;
  }, [persistentNotifications, selectedFilter]);

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match': return 'favorite';
      case 'message': return 'chat_bubble';
      case 'payment': return 'payments';
      case 'gift': return 'redeem';
      case 'system': return 'info';
      default: return 'notifications';
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
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      <MaleTopNavbar />

      <div className="sticky top-[57px] z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MaterialSymbol name="notifications" size={20} className="text-primary" />
            </div>
            <h1 className="text-lg font-bold">{t('notifications')}</h1>
          </div>
          {persistentNotifications.length > 0 && (
            <button
              onClick={clearAllPersistentNotifications}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center gap-1"
            >
              <MaterialSymbol name="delete_sweep" size={16} />
              {t('clearAll')}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 pt-4">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {filterOptions.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all active:scale-95 ${isActive
                  ? 'bg-primary shadow-lg shadow-primary/25 text-white'
                  : 'bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 text-slate-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <p className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {filter.label}
                </p>
                {filter.id === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-bold">
                    {unreadCount > 10 ? '10+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <main className="px-4 space-y-2 mt-2">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id, notification.chatId ? `/male/chat/${notification.chatId}` : undefined)}
              className={`group flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer transition-all active:scale-[0.99] border ${notification.isRead
                ? 'bg-white/50 dark:bg-white/5 border-transparent'
                : 'bg-white dark:bg-[#1a1a1a] border-primary/20 shadow-sm'
                }`}
            >
              <div className="shrink-0 relative">
                {notification.avatar ? (
                  <img
                    src={notification.avatar}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/10">
                    <MaterialSymbol
                      name={getNotificationIcon(notification.type)}
                      className="text-primary"
                      size={22}
                    />
                  </div>
                )}
                {!notification.isRead && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-[#1a1a1a]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3 className={`text-sm tracking-tight truncate ${notification.isRead ? 'font-semibold text-slate-700 dark:text-gray-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                    {t(notification.title)}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                    className="shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-all text-gray-400 hover:text-rose-500"
                  >
                    <MaterialSymbol name="close" size={16} />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {t(notification.message)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <MaterialSymbol name="schedule" size={12} className="text-slate-400" />
                  <p className="text-[10px] font-medium text-slate-400">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
            <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full mb-4">
              <MaterialSymbol name="notifications_off" size={32} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">
              {t('noNotificationsFound')}
            </p>
          </div>
        )}
      </main>

      <BottomNavigation items={navigationItems} onItemClick={handleNav} />
    </div>
  );
};



