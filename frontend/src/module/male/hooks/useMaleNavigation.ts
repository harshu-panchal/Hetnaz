import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { useChatList } from '../../../core/queries/useChatQuery';
import { useTranslation } from '../../../core/hooks/useTranslation';

export const useMaleNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
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
      id: 'discover',
      icon: 'explore',
      label: t('discover'),
      isActive: location.pathname === '/male/dashboard' || location.pathname === '/male/discover'
    },
    {
      id: 'chats',
      icon: 'chat_bubble',
      label: t('chats'),
      hasBadge: hasUnreadMessages,
      // Include /male/profile/ (viewing other user's profile from chat context)
      isActive: location.pathname.startsWith('/male/chats') || location.pathname.startsWith('/male/chat/') || location.pathname.startsWith('/male/profile/')
    },
    {
      id: 'wallet',
      icon: 'monetization_on',
      label: t('wallet'),
      isActive: location.pathname === '/male/wallet' || location.pathname === '/male/buy-coins' || location.pathname === '/male/purchase-history' || location.pathname.startsWith('/male/payment/')
    },
    {
      id: 'profile',
      icon: 'person',
      label: t('profile'),
      // Only /male/my-profile for the user's own profile
      isActive: location.pathname === '/male/my-profile' || location.pathname === '/male/notifications' || location.pathname === '/male/gifts' || location.pathname === '/male/badges'
    },
  ];

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'discover':
        navigate('/male/discover');
        break;
      case 'chats':
        navigate('/male/chats');
        break;
      case 'wallet':
        navigate('/male/wallet');
        break;
      case 'profile':
        navigate('/male/my-profile');
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

