import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatListHeader } from '../components/ChatListHeader';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { SearchBar } from '../components/SearchBar';
import { ChatListItem } from '../components/ChatListItem';
import { BottomNavigation } from '../components/BottomNavigation';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import socketService from '../../../core/services/socket.service';
import { useAuth } from '../../../core/context/AuthContext';
import { calculateDistance, formatDistance, areCoordinatesValid } from '../../../utils/distanceCalculator';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useOptimizedChatList } from '../../../core/hooks/useOptimizedChatList';

export const ChatListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');

  // Use optimized hook
  const { chats, isLoading, error, refreshChats } = useOptimizedChatList();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Initial fetch (will load from cache first inside hook, then we trigger network)
    refreshChats();

    socketService.connect();

    const handleNewMessage = () => {
      refreshChats();
    };
    socketService.on('message:new', handleNewMessage);
    socketService.on('message:notification', handleNewMessage);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:notification', handleNewMessage);
    };
  }, []); // refreshChats is stable

  const formatTimestamp = (date: string | Date): string => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return t('yesterday');
    } else if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const transformedChats = useMemo(() => {
    return chats.map((chat: any) => {
      const otherUser = (chat.otherUser || {}) as any;
      const lastMsg = (chat.lastMessage || {}) as any;

      const profileLat = otherUser.profile?.location?.coordinates?.[1] || otherUser.latitude;
      const profileLng = otherUser.profile?.location?.coordinates?.[0] || otherUser.longitude;

      let distanceStr = undefined;
      const userCoord = { lat: user?.latitude || 0, lng: user?.longitude || 0 };
      const profileCoord = { lat: profileLat || 0, lng: profileLng || 0 };

      if (areCoordinatesValid(userCoord) && areCoordinatesValid(profileCoord)) {
        const dist = calculateDistance(userCoord, profileCoord);
        distanceStr = formatDistance(dist);
      }

      return {
        id: chat._id,
        oddsUserId: otherUser._id || '',
        userName: otherUser.name || 'User',
        userAvatar: otherUser.avatar || '',
        lastMessage: lastMsg.content || t('startChatting'),
        timestamp: formatTimestamp(chat.lastMessageAt),
        isOnline: !!otherUser.isOnline,
        hasUnread: (chat.unreadCount || 0) > 0,
        unreadCount: chat.unreadCount || 0,
        messageType: lastMsg.messageType || 'text',
        intimacy: chat.intimacy || { level: 1, points: 0, nextLevelPoints: 100 },
        distance: distanceStr,
      };
    });
  }, [chats, t, user]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return transformedChats;
    }
    const query = searchQuery.toLowerCase();
    return transformedChats.filter(
      (chat: any) =>
        chat.userName.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery, transformedChats]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/male/chat/${chatId}`);
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden pb-20">
      <div className="h-4 w-full bg-background-light dark:bg-background-dark shrink-0" />

      <ChatListHeader />

      <SearchBar placeholder={t('searchMatches')} onSearch={handleSearch} />

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-2">
        <div className="px-2 py-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 dark:text-[#cc8ea3] uppercase tracking-wider">
            {t('activeConversations')}
          </h3>
          <button onClick={() => refreshChats()} className="text-primary hover:opacity-80">
            <MaterialSymbol name="refresh" size={18} />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl mb-4">
            {error}
          </div>
        )}

        {!isLoading && !error && filteredChats.length > 0 && (
          filteredChats.map((chat: any) => (
            <ChatListItem
              key={chat.id}
              chat={chat as any}
              onClick={handleChatClick}
              showIntimacy={true}
            />
          ))
        )}

        {!isLoading && !error && filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MaterialSymbol name="chat_bubble" size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-[#cc8ea3] text-center">
              {searchQuery ? t('noChatsFound', { query: searchQuery }) : t('noConversationsYet')}
            </p>
            <button
              onClick={() => navigate('/male/discover')}
              className="mt-4 px-6 py-2 bg-primary text-[#231d10] rounded-full font-bold shadow-lg shadow-primary/20 active:scale-95"
            >
              {t('discoverUsers')}
            </button>
          </div>
        )}

        <div className="h-8" />
      </main>

      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

    </div>
  );
};
