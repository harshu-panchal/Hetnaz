import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatListHeader } from '../components/ChatListHeader';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { SearchBar } from '../components/SearchBar';
import { ChatListItem } from '../components/ChatListItem';
import { BottomNavigation } from '../components/BottomNavigation';
import { EditChatModal } from '../components/EditChatModal';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import chatService from '../../../core/services/chat.service';
import socketService from '../../../core/services/socket.service';
import type { Chat as ApiChat } from '../../../core/types/chat.types';

export const ChatListPage = () => {
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();
  const { coinBalance } = useGlobalState(); // Use global state for balance

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditChatOpen, setIsEditChatOpen] = useState(false);
  const [chats, setChats] = useState<ApiChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchChats();

    // Connect socket
    socketService.connect();

    // Listen for new messages to update chat list
    const handleNewMessage = () => {
      fetchChats();
    };
    socketService.on('message:new', handleNewMessage);
    socketService.on('message:notification', handleNewMessage);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:notification', handleNewMessage);
    };
  }, []);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getMyChatList();
      setChats(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch chats:', err);
      setError(err.response?.data?.message || 'Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  // Transform API chats to component format
  const transformedChats = useMemo(() => {
    return chats.map(chat => ({
      id: chat._id,
      oddsUserId: chat.otherUser._id,
      userName: chat.otherUser.name,
      userAvatar: chat.otherUser.avatar || '',
      lastMessage: chat.lastMessage?.content || 'Start chatting!',
      timestamp: formatTimestamp(chat.lastMessageAt),
      isOnline: chat.otherUser.isOnline,
      hasUnread: chat.unreadCount > 0,
      unreadCount: chat.unreadCount,
      messageType: chat.lastMessage?.messageType || 'text',
      intimacy: chat.intimacy,
    }));
  }, [chats]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return transformedChats;
    }
    const query = searchQuery.toLowerCase();
    return transformedChats.filter(
      (chat) =>
        chat.userName.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery, transformedChats]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEditClick = () => {
    setIsEditChatOpen(true);
  };

  const handleCreateChat = (userId: string) => {
    navigate(`/male/chat/${userId}`);
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/male/chat/${chatId}`);
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden pb-20">
      {/* Status Bar Spacer */}
      <div className="h-4 w-full bg-background-light dark:bg-background-dark shrink-0" />

      {/* Top App Bar */}
      <ChatListHeader coinBalance={coinBalance} onEditClick={handleEditClick} />

      {/* Search Bar */}
      <SearchBar placeholder="Search matches..." onSearch={handleSearch} />

      {/* Chat List */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-2">
        {/* Section Title */}
        <div className="px-2 py-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 dark:text-[#cc8ea3] uppercase tracking-wider">
            Active Conversations
          </h3>
          <button onClick={fetchChats} className="text-primary hover:opacity-80">
            <MaterialSymbol name="refresh" size={18} />
          </button>
        </div>

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

        {/* Chat Items */}
        {!isLoading && !error && filteredChats.length > 0 && (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat as any}
              onClick={handleChatClick}
              showIntimacy={true}
            />
          ))
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MaterialSymbol name="chat_bubble" size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-[#cc8ea3] text-center">
              {searchQuery ? `No chats found matching "${searchQuery}"` : 'No conversations yet. Start chatting!'}
            </p>
            <button
              onClick={() => navigate('/male/discover')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-medium"
            >
              Discover Users
            </button>
          </div>
        )}

        {/* Bottom Spacer */}
        <div className="h-8" />
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

      {/* Edit Chat Modal */}
      <EditChatModal
        isOpen={isEditChatOpen}
        onClose={() => setIsEditChatOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  );
};

// Helper function to format timestamp
function formatTimestamp(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
