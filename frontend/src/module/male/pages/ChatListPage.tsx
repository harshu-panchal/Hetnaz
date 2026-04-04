import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { MeshBackground } from '../../../shared/components/auth/AuthLayoutComponents';

type FilterType = 'all' | 'online' | 'unread';

export const ChatListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Swipe gesture handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: t('filterAll') },
    { id: 'online', label: t('online') },
    { id: 'unread', label: t('unread') }
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = filters.findIndex(f => f.id === activeFilter);
      let nextIndex = currentIndex;

      if (isLeftSwipe && currentIndex < filters.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (isRightSwipe && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      }

      if (nextIndex !== currentIndex) {
        setActiveFilter(filters[nextIndex].id);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Debounce search query to avoid frequent API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use optimized hook with debounced search
  const { chats, isLoading, error, refreshChats } = useOptimizedChatList(debouncedSearch);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Trigger network refetch if not searching
    if (!debouncedSearch) {
      refreshChats();
    }

    // Socket is managed by SocketContext - no need to connect here

    const handleNewMessage = () => {
      refreshChats();
    };
    socketService.on('message:new', handleNewMessage);
    socketService.on('message:notification', handleNewMessage);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:notification', handleNewMessage);
    };
  }, [debouncedSearch, refreshChats]);

  const formatTimestamp = (date: string | Date): string => {
    if (!date || date === '1970-01-01T00:00:00.000Z' || new Date(date).getTime() === 0) {
      return '';
    }
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
        lastMessage: lastMsg.content || (chat.isNewPotentialChat ? t('startNewConversation') : t('startChatting')),
        timestamp: formatTimestamp(chat.lastMessageAt),
        isOnline: !!otherUser.isOnline,
        hasUnread: (chat.unreadCount || 0) > 0,
        unreadCount: chat.unreadCount || 0,
        messageType: lastMsg.messageType || 'text',
        intimacy: chat.intimacy || { level: 1, points: 0, nextLevelPoints: 100 },
        distance: distanceStr,
        isNewPotentialChat: !!chat.isNewPotentialChat
      };
    });
  }, [chats, t, user]);

  const filteredChats = useMemo(() => {
    let result = transformedChats;

    // Apply active filter
    if (activeFilter === 'online') {
      result = result.filter((chat: any) => chat.isOnline);
    } else if (activeFilter === 'unread') {
      result = result.filter((chat: any) => chat.hasUnread);
    }

    // Apply search query
    if (!searchQuery.trim()) {
      return result;
    }

    const query = searchQuery.toLowerCase();
    return result.filter(
      (chat: any) =>
        chat.userName.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery, transformedChats, activeFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/male/chat/${chatId}`);
  };

  return (
    <div className="font-display text-slate-900 dark:text-white antialiased selection:bg-primary selection:text-white min-h-screen relative overflow-hidden flex flex-col bg-background-light dark:bg-background-dark pb-20">
      <MeshBackground />
      
      {/* Scrollable Content Layer */}
      <div className="relative z-10 flex flex-col h-full flex-1 max-w-md mx-auto w-full">
        
        {/* Search & Filter Header (Sticky below TopNavbar) */}
        <div className="sticky top-0 z-30 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-b border-pink-200/30 dark:border-pink-900/10 shadow-sm px-4 py-1.5 pt-4">
          <div className="max-w-md mx-auto w-full space-y-1">
            <SearchBar 
              variant="full"
              placeholder={t('searchMatches')} 
              onSearch={handleSearch} 
            />

            {/* Filter Slider */}
            <div className="relative flex items-center bg-white/20 dark:bg-white/5 rounded-2xl p-1.5 overflow-hidden backdrop-blur-3xl border border-white/50 dark:border-white/10 shadow-sm">
                {/* Sliding Background Indicator */}
                <div 
                  className="absolute top-1.5 bottom-1.5 bg-white/80 dark:bg-[#FF4D6D] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_12px_rgba(255,77,109,0.3)] transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
                  style={{
                    width: `calc((100% - 12px) / ${filters.length})`,
                    transform: `translateX(calc(${filters.findIndex(f => f.id === activeFilter) * 100}%))`
                  }}
                />
                
                {filters.map((filter) => {
                  const count = filter.id === 'online' 
                    ? transformedChats.filter((c: any) => c.isOnline).length 
                    : filter.id === 'unread' 
                      ? transformedChats.filter((c: any) => c.hasUnread).length 
                      : 0;

                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`relative z-10 flex-1 py-2 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none active:scale-95 ${
                        activeFilter === filter.id 
                          ? 'text-[#FF4D6D] dark:text-white' 
                          : 'text-gray-500 dark:text-[#cc8ea3]'
                      }`}
                    >
                      {filter.label}
                      {count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center transition-all ${
                          activeFilter === filter.id
                            ? 'bg-[#FF4D6D]/10 dark:bg-white/20 text-[#FF4D6D] dark:text-white'
                            : 'bg-gray-400/10 dark:bg-white/10 text-gray-400 dark:text-[#cc8ea3]'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

      <main 
        className="flex-1 overflow-y-auto px-4 pb-24"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('messages', 'Messages')}
            </h3>
            {filteredChats.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                {filteredChats.length}
              </span>
            )}
          </div>
          <button 
            onClick={() => refreshChats()} 
            className="group flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
            aria-label="Refresh Chats"
          >
            <MaterialSymbol name="sync" size={18} className="group-active:animate-spin duration-500" />
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
      </div>

      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

    </div>
  );
};
