import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/TopAppBar';
import { BottomNavigation } from '../components/BottomNavigation';
import { MaterialSymbol } from '../types/material-symbol';
import type { Notification } from '../types/male.types';

// Mock data - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'New Match!',
    message: 'Sarah liked you back',
    timestamp: '2 minutes ago',
    isRead: false,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNnKyZLNWCV7B-XwKgjd9-bbG9ZSq583oYGij7uKTYk2Ah_9nkpqgsGSDu-FUgux5QDiLCTw_y9JxTBhkZjWAOOReMhlK98A_84vIsKaxQ0IUzZqkJ7-wnAv67HRuUVltC2QQzOfbTk1-OdjqC7SWT4iG-MXs81ePZK3x1mYOHabRqp4eH7yIfiX3tH-YMXSs1uWS41vrxzPC8_MJHasLGiUWINfHYQ7KF2jfo0n_Yo6qBJKr_qMrOBUdimUVVJdY46GD7L0v-oL4',
    relatedUserId: '1',
    actionUrl: '/profile/1',
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Emily sent you a message',
    timestamp: '15 minutes ago',
    isRead: false,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLUSJJYAwx8tl_zGDnOiTXyUUZNGZvfSUhgCgsc5vA2u3832geBVry-vrxCLbywcPMNdDw9Pp8aQYpK6Of5m_eCNYG0p8DZ_zKmzCBISKf3HqDRE9LKIkflketnQjBg0ihzj9xMoUbFN0MewVDhhm62RT4P8ApfLpMqm1KF4cJSY8J3ofy8uvQLeu7ka7eCxUsjWF4-UjrzrD1786TFutJ9_LA2fBbGdcQt8H5YNPFmG4lNC_tEwPefXDp1ieMAWqV4GmL4cQser8',
    relatedChatId: '2',
    actionUrl: '/chat/2',
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Successful',
    message: 'Your purchase of 600 coins was successful',
    timestamp: '1 hour ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Welcome Bonus',
    message: 'You received 50 bonus coins for your first purchase!',
    timestamp: '2 hours ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'gift',
    title: 'Gift Received',
    message: 'Jessica sent you a gift',
    timestamp: 'Yesterday',
    isRead: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc0OstJEnLP2BH3T9hAadSkfqrmXq73qN9gbTMt7kfgPaQTpDMo6RBY0rGIlVRRYx9RNgGIuso4uSojA6-sMJxsbwokldCWi5vSTRo5Am8Pzgc73OW3MErmDu8gHuiQ0qQbM52r1B6IJMdIgiER50uXcyACMQ1f-e3CVduYEyDGFk_BIAtnlQer3BE077LFURJq4oRmImX1yG5_Q1OTgCEjnwV6A_EFuMSTBc85zvXe5_v2YpQ3mDh5t5vEzbNV0GqM0iE3aISpuE',
    relatedUserId: '3',
  },
];

const navigationItems = [
  { id: 'discover', icon: 'explore', label: 'Discover' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats', hasBadge: true },
  { id: 'wallet', icon: 'monetization_on', label: 'Wallet' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'matches', label: 'Matches' },
  { id: 'messages', label: 'Messages' },
];

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter((n) => !n.isRead);
        break;
      case 'matches':
        filtered = filtered.filter((n) => n.type === 'match');
        break;
      case 'messages':
        filtered = filtered.filter((n) => n.type === 'message');
        break;
      default:
        break;
    }

    return filtered;
  }, [notifications, selectedFilter]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'match':
        return 'favorite';
      case 'message':
        return 'chat_bubble';
      case 'payment':
        return 'payments';
      case 'gift':
        return 'redeem';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      {/* Top App Bar */}
      <TopAppBar
        title="Notifications"
        icon="notifications"
        onFilterClick={() => {}}
        onSearch={() => {}}
      />

      {/* Filter Chips */}
      <div className="px-4 pb-3 pt-1">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {filterOptions.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all active:scale-95 ${
                  isActive
                    ? 'bg-primary shadow-lg shadow-primary/25 text-white'
                    : 'bg-white dark:bg-[#342d18] border border-gray-200 dark:border-transparent text-slate-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#3d2a1a]'
                }`}
              >
                <p className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {filter.label}
                </p>
                {filter.id === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mark All Read Button */}
      {unreadCount > 0 && (
        <div className="px-4 pb-2">
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-primary hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications List */}
      <main className="px-4">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-98 ${
                  notification.isRead
                    ? 'bg-white dark:bg-[#342d18]'
                    : 'bg-primary/5 dark:bg-primary/10 border border-primary/20'
                }`}
              >
                {/* Avatar/Icon */}
                <div className="shrink-0">
                  {notification.avatar ? (
                    <img
                      src={notification.avatar}
                      alt={notification.title}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <MaterialSymbol
                        name={getNotificationIcon(notification.type)}
                        className="text-primary"
                        size={24}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      className="shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Delete notification"
                    >
                      <MaterialSymbol
                        name="close"
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MaterialSymbol
              name="notifications_off"
              size={48}
              className="text-gray-400 dark:text-gray-600 mb-4"
            />
            <p className="text-gray-500 dark:text-[#cc8ea3] text-center">
              No notifications found
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};


