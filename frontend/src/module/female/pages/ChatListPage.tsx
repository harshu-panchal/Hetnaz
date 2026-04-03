import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { SearchBar } from '../components/SearchBar';
import { ChatListItem } from '../components/ChatListItem';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { MeshBackground } from '../../../shared/components/auth/AuthLayoutComponents';

import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import socketService from '../../../core/services/socket.service';
import { useAuth } from '../../../core/context/AuthContext';
import { calculateDistance, formatDistance, areCoordinatesValid } from '../../../utils/distanceCalculator';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useOptimizedChatList } from '../../../core/hooks/useOptimizedChatList';
import { getUser, getAuthToken } from '../../../core/utils/auth';

type FilterType = 'all' | 'online' | 'unread';

export const ChatListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();
  const { coinBalance } = useGlobalState();
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  // Swipe gesture handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: t('filterAll') },
    { id: 'online', label: t('online') },
    { id: 'unread', label: t('unread') }
  ];

  // Use optimized hook
  const { chats, isLoading, error, refreshChats } = useOptimizedChatList(debouncedSearch);

  useEffect(() => {
    window.scrollTo(0, 0);
    const user = getUser() || {};
    setCurrentUserId(user.id || user._id || '');

    refreshChats();
    fetchAvailableBalance();

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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      setAvailableBalance(coinBalance || 0);
    }
  };

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

  const transformedChats = useMemo(() => {
    return chats.map((chat: any) => {
      const lastMessageSenderId = typeof chat.lastMessage?.senderId === 'string'
        ? chat.lastMessage?.senderId
        : (chat.lastMessage?.senderId as any)?._id;

      const lastMessageSentByMe = lastMessageSenderId === currentUserId;
      const hasUnread = (chat.unreadCount || 0) > 0 && !lastMessageSentByMe;

      const profileLat = chat.otherUser?.profile?.location?.coordinates?.[1] || chat.otherUser?.latitude;
      const profileLng = chat.otherUser?.profile?.location?.coordinates?.[0] || chat.otherUser?.longitude;

      let distanceStr = undefined;
      const userCoord = { lat: currentUser?.latitude || 0, lng: currentUser?.longitude || 0 };
      const profileCoord = { lat: profileLat || 0, lng: profileLng || 0 };

      if (areCoordinatesValid(userCoord) && areCoordinatesValid(profileCoord)) {
        const dist = calculateDistance(userCoord, profileCoord);
        distanceStr = formatDistance(dist);
      }

      return {
        id: chat._id,
        userId: chat.otherUser?._id,
        userName: chat.otherUser?.name || 'User',
        userAvatar: chat.otherUser?.avatar || '',
        lastMessage: chat.lastMessage?.content || t('startChatting'),
        timestamp: formatTimestamp(chat.lastMessageAt, t),
        isOnline: !!chat.otherUser?.isOnline,
        hasUnread,
        unreadCount: chat.unreadCount || 0,
        distance: distanceStr,
      };
    });
  }, [chats, currentUserId, currentUser, t]);

  const filteredChats = useMemo(() => {
    let result = transformedChats;
    
    if (activeFilter === 'online') {
      result = result.filter((chat: any) => chat.isOnline);
    } else if (activeFilter === 'unread') {
      result = result.filter((chat: any) => chat.hasUnread);
    }

    if (!searchQuery.trim()) return result;
    const query = searchQuery.toLowerCase();
    return result.filter(
      (chat: any) =>
        chat.userName?.toLowerCase().includes(query) ||
        chat.lastMessage?.toLowerCase().includes(query)
    );
  }, [searchQuery, transformedChats, activeFilter]);

  const handleChatClick = (chatId: string) => {
    navigate(`/female/chat/${chatId}`);
  };

  return (
    <div className="font-display text-slate-900 dark:text-white antialiased selection:bg-pink-500 selection:text-white min-h-screen relative overflow-hidden flex flex-col bg-background-light dark:bg-[#0a0a0a] pb-24">
      <MeshBackground />
      
      <div className="relative z-10 flex flex-col h-full flex-1 max-w-md mx-auto w-full">
        {/* Premium Skeuomorphic Header */}
        <div className="sticky top-0 z-30 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-b border-white/20 dark:border-white/5 shadow-sm px-4 pb-3 pt-10">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-3">
               <div className="skeuo-inset size-12 rounded-[1.25rem] flex items-center justify-center bg-gray-50/50 dark:bg-black/40">
                 <MaterialSymbol name="forum" className="text-pink-500 drop-shadow-[0_2px_8px_rgba(255,77,109,0.3)]" size={32} filled />
               </div>
               <h1 className="text-[16px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white leading-none">{t('chats')}</h1>
             </div>
             
             <div className="skeuo-button px-4 h-10 rounded-2xl flex items-center gap-2 bg-white/60 dark:bg-white/5 border-white/60">
               <MaterialSymbol name="payments" size={18} className="text-amber-500" filled />
               <span className="text-[11px] font-black text-slate-900 dark:text-white">₹{availableBalance}</span>
             </div>
          </div>
          
          <div className="space-y-3">
            <SearchBar 
              variant="full"
              onSearch={setSearchQuery} 
              placeholder={t('searchChats')} 
            />

            <div className="relative flex items-center skeuo-inset bg-gray-50/50 dark:bg-black/40 rounded-2xl p-1 overflow-hidden">
                <div 
                  className="absolute top-1.5 bottom-1.5 bg-pink-500 rounded-xl shadow-[0_4px_12px_rgba(255,77,109,0.3)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
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
                      className={`relative z-10 flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none active:scale-95 ${
                        activeFilter === filter.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {filter.label}
                      {count > 0 && (
                        <div className={`size-1.5 rounded-full ${activeFilter === filter.id ? 'bg-white' : 'bg-pink-500'} animate-pulse`} />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        <main 
          className="flex-1 overflow-y-auto px-4 py-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-12 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('loading')}</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="skeuo-card bg-red-500/5 border-red-500/20 p-6 rounded-[2rem] text-center space-y-2">
              <MaterialSymbol name="error" className="text-red-500" size={32} />
              <p className="text-xs font-bold text-red-500">{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="skeuo-inset size-24 rounded-[2.5rem] flex items-center justify-center bg-gray-50/50 dark:bg-black/20 opacity-40">
                <MaterialSymbol name="chat_bubble_outline" size={48} className="text-slate-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('noChatsFound')}</h3>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                  {searchQuery ? t('tryDifferentSearch') : t('waitForMessage')}
                </p>
              </div>
            </div>
          )}

          <div className="skeuo-card rounded-[2.25rem] overflow-hidden bg-white/20 dark:bg-black/10 shadow-2xl border-white/60 dark:border-white/5">
            {!isLoading && !error && filteredChats.map((chat: any) => (
              <ChatListItem key={chat.id} chat={chat as any} onClick={handleChatClick} />
            ))}
          </div>
          
          <div className="h-12" />
        </main>
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};

function formatTimestamp(date: string | Date, t: any): string {
  if (!date) return '';
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
}
