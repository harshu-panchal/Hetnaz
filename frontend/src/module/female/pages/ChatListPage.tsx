import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatListHeader } from '../components/ChatListHeader';
import { SearchBar } from '../components/SearchBar';
import { ChatListItem } from '../components/ChatListItem';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';

import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import socketService from '../../../core/services/socket.service';
import { useAuth } from '../../../core/context/AuthContext';
import { calculateDistance, formatDistance, areCoordinatesValid } from '../../../utils/distanceCalculator';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useOptimizedChatList } from '../../../core/hooks/useOptimizedChatList';
import { getUser, getAuthToken } from '../../../core/utils/auth';

export const ChatListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();
  const { coinBalance } = useGlobalState();
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  // Use optimized hook
  const { chats, isLoading, error, refreshChats } = useOptimizedChatList();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Get current user ID from token or context
    const user = getUser() || {};
    setCurrentUserId(user.id || user._id || '');

    // Initial fetch (will load from cache first inside hook, then we trigger network)
    refreshChats();
    fetchAvailableBalance();

    // Socket is managed by SocketContext - no need to connect here

    // Listen for new messages to update chat list
    const handleNewMessage = () => {
      refreshChats();
    };
    socketService.on('message:new', handleNewMessage);
    socketService.on('message:notification', handleNewMessage);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:notification', handleNewMessage);
    };
  }, []);

  const fetchAvailableBalance = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/users/female/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setAvailableBalance(data.data.earnings.availableBalance);
      }
    } catch (err) {
      console.error('Failed to fetch available balance:', err);
      // Fallback to coinBalance if API fails
      setAvailableBalance(coinBalance || 0);
    }
  };

  // Transform API chats to component format
  const transformedChats = useMemo(() => {
    return chats.map((chat: any) => {
      // Check if the last message was sent by the current user (female)
      // senderId can be either a string or an object with _id
      const lastMessageSenderId = typeof chat.lastMessage?.senderId === 'string'
        ? chat.lastMessage?.senderId
        : (chat.lastMessage?.senderId as any)?._id;

      const lastMessageSentByMe = lastMessageSenderId === currentUserId;

      // Only show as unread/bold if there are unread messages AND the last message was NOT sent by me
      const shouldHighlight = chat.unreadCount > 0 && !lastMessageSentByMe;

      const profileLat = chat.otherUser.profile?.location?.coordinates?.[1] || chat.otherUser.latitude;
      const profileLng = chat.otherUser.profile?.location?.coordinates?.[0] || chat.otherUser.longitude;

      let distanceStr = undefined;
      const userCoord = { lat: currentUser?.latitude || 0, lng: currentUser?.longitude || 0 };
      const profileCoord = { lat: profileLat || 0, lng: profileLng || 0 };

      if (areCoordinatesValid(userCoord) && areCoordinatesValid(profileCoord)) {
        const dist = calculateDistance(userCoord, profileCoord);
        distanceStr = formatDistance(dist);
      }

      return {
        id: chat._id,
        userId: chat.otherUser._id,
        userName: chat.otherUser.name,
        userAvatar: chat.otherUser.avatar || '',
        lastMessage: chat.lastMessage?.content || t('startChatting'),
        timestamp: formatTimestamp(chat.lastMessageAt, t),
        isOnline: chat.otherUser.isOnline,
        hasUnread: shouldHighlight,
        unreadCount: chat.unreadCount,
        distance: distanceStr,
      };
    });
  }, [chats, currentUserId, currentUser, t]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return transformedChats;
    const query = searchQuery.toLowerCase();
    return transformedChats.filter(
      (chat: any) =>
        chat.userName.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery, transformedChats]);

  const handleChatClick = (chatId: string) => {
    navigate(`/female/chat/${chatId}`);
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">


      {/* Sidebar */}

      <ChatListHeader coinBalance={availableBalance} />
      <SearchBar onSearch={setSearchQuery} placeholder={t('searchChats')} />

      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Empty/No Results State */}
        {!isLoading && !error && filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <span className="text-5xl mb-4">💬</span>
            <p className="text-gray-500 dark:text-[#cbbc90] text-lg">{t('noChatsFound')}</p>
            <p className="text-gray-400 dark:text-[#cbbc90]/70 text-sm mt-2">
              {searchQuery ? t('tryDifferentSearch') : t('waitForMessage')}
            </p>
          </div>
        )}

        {/* Chat List */}
        {!isLoading && !error && filteredChats.map((chat: any) => (
          <ChatListItem key={chat.id} chat={chat as any} onClick={handleChatClick} />
        ))}
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};

// Helper function to format timestamp
function formatTimestamp(date: string | Date, t: any): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (diffDays === 1) {
    return t('yesterday');
  } else if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
