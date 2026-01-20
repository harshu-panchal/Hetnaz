import { useEffect, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { FemaleTopNavbar } from '../components/FemaleTopNavbar';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';

export const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick: handleNav } = useFemaleNavigation();
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

  const handleNotificationClick = (id: string, actionUrl?: string, relatedChatId?: string, type?: string) => {
    markNotificationAsRead(id);

    if (actionUrl) {
      navigate(actionUrl);
      return;
    }

    if (type === 'message' && relatedChatId) {
      navigate(`/female/chat/${relatedChatId}`);
    }
  };

  const handleDeleteNotification = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    deletePersistentNotification(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'earnings': return 'account_balance_wallet';
      case 'message': return 'mail';
      case 'withdrawal': return 'payments';
      case 'video_call': return 'videocam';
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
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      <FemaleTopNavbar />

      <header className="flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5 sticky top-[57px] z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
          >
            <MaterialSymbol name="arrow_back" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('notifications')}</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-pink-500 text-white text-[10px] font-bold rounded-full">
              {unreadCount > 10 ? '10+' : unreadCount}
            </span>
          )}
        </div>
        {persistentNotifications.length > 0 && (
          <button
            onClick={clearAllPersistentNotifications}
            className="text-xs font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 flex items-center gap-1 p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all"
          >
            <MaterialSymbol name="delete_sweep" size={18} />
            {t('clearAll')}
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 space-y-3">
        {persistentNotifications.filter(n => n.timestamp >= sessionStartTime).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-gray-100 dark:bg-[#342d18] rounded-full mb-4">
              <MaterialSymbol name="notifications_off" size={48} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-[#cbbc90] text-lg font-medium">{t('noNotificationsFound')}</p>
          </div>
        ) : (
          persistentNotifications.filter(n => n.timestamp >= sessionStartTime).map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id, undefined, notification.chatId, notification.type)}
              className={`group flex items-start gap-4 p-4 rounded-2xl shadow-sm cursor-pointer transition-all active:scale-[0.99] border ${notification.isRead
                ? 'bg-white/50 dark:bg-white/5 border-transparent'
                : 'bg-white dark:bg-[#342d18] border-pink-500/20 shadow-pink-500/5'
                }`}
            >
              <div className="relative shrink-0">
                {notification.avatar ? (
                  <img src={notification.avatar} className="w-11 h-11 rounded-full object-cover ring-2 ring-pink-500/20" alt="" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-500/10 text-pink-500">
                    <MaterialSymbol name={getNotificationIcon(notification.type)} size={22} />
                  </div>
                )}
                {!notification.isRead && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-pink-500 border-2 border-white dark:border-[#342d18]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3 className={`text-sm truncate ${notification.isRead ? 'font-semibold text-gray-700 dark:text-gray-300' : 'font-bold text-gray-900 dark:text-white'}`}>
                    {t(notification.title)}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                    className="shrink-0 p-1.5 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-full transition-all text-gray-400 hover:text-pink-500"
                  >
                    <MaterialSymbol name="close" size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-[#cbbc90] line-clamp-2 leading-relaxed">
                  {t(notification.message)}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <MaterialSymbol name="schedule" size={12} className="text-gray-400" />
                  <p className="text-[10px] font-medium text-gray-400">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNav} />
    </div>
  );
};

