import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { useChatList } from '../../../core/queries/useChatQuery';

export const useFemaleNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { data: chats = [] } = useChatList();

  // Calculate if there are any unread chats where the last message was NOT sent by me
  const hasUnreadMessages = chats.some((chat: any) => {
    const unreadCount = chat.unreadCount || 0;
    if (unreadCount === 0) return false;

    // Safety check for user identity
    const currentUserId = user?.id || (user as any)?._id;
    const lastMessageSenderId = typeof chat.lastMessage?.senderId === 'string'
      ? chat.lastMessage?.senderId
      : (chat.lastMessage?.senderId as any)?._id;

    return lastMessageSenderId !== currentUserId;
  });

  const navigationItems = [
    {
      id: 'dashboard',
      icon: 'home',
      label: 'Home',
      isActive: location.pathname === '/female/dashboard'
    },
    {
      id: 'chats',
      icon: 'chat_bubble',
      label: 'Chats',
      hasBadge: hasUnreadMessages,
      // Include /female/profile/ (viewing other user's profile from chat context)
      isActive: location.pathname.startsWith('/female/chats') || location.pathname.startsWith('/female/chat/') || location.pathname.startsWith('/female/profile/')
    },
    {
      id: 'earnings',
      icon: 'account_balance_wallet',
      label: 'Earnings',
      isActive: location.pathname === '/female/earnings' || location.pathname === '/female/withdrawal'
    },
    {
      id: 'profile',
      icon: 'person',
      label: 'Profile',
      // Only /female/my-profile for the user's own profile
      isActive: location.pathname === '/female/my-profile'
    },
  ];

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

  return {
    navigationItems,
    handleNavigationClick,
  };
};

