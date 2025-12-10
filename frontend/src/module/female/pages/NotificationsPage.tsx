import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import type { Notification } from '../types/female.types';

// Mock data - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'earnings',
    title: 'New Earnings',
    message: 'You earned 500 coins from Alex',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: false,
    relatedUserId: '1',
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Michael sent you a message',
    timestamp: '2024-01-15T09:15:00Z',
    isRead: false,
    relatedChatId: '2',
    relatedUserId: '2',
  },
  {
    id: '3',
    type: 'withdrawal',
    title: 'Withdrawal Approved',
    message: 'Your withdrawal of 5000 coins has been approved',
    timestamp: '2024-01-14T14:00:00Z',
    isRead: true,
  },
];

const navigationItems = [
  { id: 'dashboard', icon: 'home', label: 'Home' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats' },
  { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/female/dashboard');
        break;
      case 'chats':
        navigate('/female/chats');
        break;
      case 'earnings':
        navigate('/female/earnings');
        break;
      case 'profile':
        navigate('/female/my-profile');
        break;
      default:
        break;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      return;
    }

    switch (notification.type) {
      case 'message':
        if (notification.relatedChatId) {
          navigate(`/female/chat/${notification.relatedChatId}`);
        } else {
          navigate('/female/chats');
        }
        break;
      case 'earnings':
        navigate('/female/earnings');
        break;
      case 'withdrawal':
        navigate('/female/withdrawal');
        break;
      case 'video_call':
        if (notification.relatedChatId) {
          navigate(`/female/chat/${notification.relatedChatId}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'earnings':
        return 'account_balance_wallet';
      case 'message':
        return 'mail';
      case 'withdrawal':
        return 'payments';
      case 'video_call':
        return 'videocam';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
          >
            <MaterialSymbol name="arrow_back" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-primary text-slate-900 text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary font-medium hover:underline"
          >
            Mark all read
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MaterialSymbol name="notifications_off" size={64} className="text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-[#cbbc90] text-lg">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-4 p-4 bg-white dark:bg-[#342d18] rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2515] transition-colors ${
                  !notification.isRead ? 'border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <MaterialSymbol name={getNotificationIcon(notification.type)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-[#cbbc90] mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-[#cbbc90]">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a2515] transition-colors"
                        title="Mark as read"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};

