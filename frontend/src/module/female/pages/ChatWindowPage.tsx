import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatWindowHeader } from '../components/ChatWindowHeader';
import { MessageBubble } from '../components/MessageBubble';
import { GiftMessageBubble } from '../components/GiftMessageBubble';
import { MessageInput } from '../components/MessageInput';
import { PhotoPickerModal } from '../components/PhotoPickerModal';
import { ChatMoreOptionsModal } from '../components/ChatMoreOptionsModal';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import chatService from '../../../core/services/chat.service';
import socketService from '../../../core/services/socket.service';
import type { Chat as ApiChat, Message as ApiMessage } from '../../../core/types/chat.types';

export const ChatWindowPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [chatInfo, setChatInfo] = useState<ApiChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('matchmint_user') || '{}');
  const currentUserId = user._id || user.id;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch chat info and messages
  useEffect(() => {
    if (!chatId) {
      navigate('/female/chats');
      return;
    }

    const init = async () => {
      try {
        setIsLoading(true);

        // Get chat info
        const chat = await chatService.getChatById(chatId);
        setChatInfo(chat);

        // Get messages
        const { messages: msgData } = await chatService.getChatMessages(chatId);
        setMessages(msgData);

        // Join chat room
        socketService.connect();
        socketService.joinChat(chatId);

        setError(null);
      } catch (err: any) {
        console.error('Failed to load chat:', err);
        setError(err.response?.data?.message || 'Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (chatId) {
        socketService.leaveChat(chatId);
      }
    };
  }, [chatId, navigate]);

  // Socket event listeners
  useEffect(() => {
    const handleNewMessage = (data: { chatId: string; message: ApiMessage }) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    const handleTyping = (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (data.chatId === chatId && data.userId !== currentUserId) {
        setIsOtherTyping(data.isTyping);
      }
    };

    // User online/offline status updates
    const handleUserOnline = (data: { userId: string }) => {
      if (chatInfo && data.userId === chatInfo.otherUser._id) {
        setChatInfo(prev => prev ? {
          ...prev,
          otherUser: { ...prev.otherUser, isOnline: true }
        } : null);
      }
    };

    const handleUserOffline = (data: { userId: string; lastSeen: string }) => {
      if (chatInfo && data.userId === chatInfo.otherUser._id) {
        setChatInfo(prev => prev ? {
          ...prev,
          otherUser: { ...prev.otherUser, isOnline: false, lastSeen: data.lastSeen }
        } : null);
      }
    };

    socketService.on('message:new', handleNewMessage);
    socketService.on('chat:typing', handleTyping);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('chat:typing', handleTyping);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
    };
  }, [chatId, chatInfo, currentUserId, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Female users don't pay to send messages
  const handleSendMessage = async (content: string) => {
    if (!chatId || isSending) return;

    try {
      setIsSending(true);
      setError(null);

      const result = await chatService.sendMessage(chatId, content);
      setMessages(prev => [...prev, result.message]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };



  const handleMoreClick = () => {
    setIsMoreOptionsOpen(true);
  };

  const handleViewProfile = () => {
    if (chatInfo?.otherUser._id) {
      navigate(`/female/profile/${chatInfo.otherUser._id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!chatInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-light dark:bg-background-dark p-4">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Chat not found</p>
        <button
          onClick={() => navigate('/female/chats')}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden pb-20">
      {/* Header */}
      <ChatWindowHeader
        userName={chatInfo.otherUser.name}
        userAvatar={chatInfo.otherUser.avatar || ''}
        isOnline={chatInfo.otherUser.isOnline}
        onMoreClick={handleMoreClick}
      />

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            <p>No messages yet</p>
          </div>
        )}

        {messages.map((message) => {
          // Robust sender ID extraction
          let senderId;
          if (typeof message.senderId === 'string') {
            senderId = message.senderId;
          } else if (message.senderId) {
            senderId = message.senderId._id || (message.senderId as any).id;
          }

          // Robust current user ID extraction
          const user = JSON.parse(localStorage.getItem('matchmint_user') || '{}');
          const currentUserId = user._id || user.id;

          const isSent = String(senderId) === String(currentUserId);

          const senderName = (typeof message.senderId === 'object' && message.senderId)
            ? message.senderId.profile?.name
            : 'User';

          return message.messageType === 'gift' && message.gift ? (
            <GiftMessageBubble
              key={message._id}
              gifts={[{
                id: message.gift.giftId,
                name: message.gift.giftName,
                icon: 'redeem',
                cost: message.gift.giftCost,
                tradeValue: Math.floor(message.gift.giftCost * 0.5),
                description: '',
                category: 'romantic',
                receivedAt: new Date(message.createdAt),
                senderId: String(senderId),
                senderName: senderName || 'User',
                quantity: 1,
              }]}
              note=""
              timestamp={new Date(message.createdAt)}
              senderName={senderName || 'User'}
            />
          ) : (
            <MessageBubble
              key={message._id}
              message={{
                id: message._id,
                chatId: message.chatId,
                senderId: String(senderId),
                senderName: senderName || 'User',
                content: message.content,
                timestamp: new Date(message.createdAt),
                type: message.messageType as any,
                isSent,
                readStatus: message.status as any,
              }}
            />
          );
        })}

        {/* Typing Indicator */}
        {isOtherTyping && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-gray-400">{chatInfo.otherUser.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Females don't pay */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendPhoto={() => setIsPhotoPickerOpen(true)}
        placeholder="Type a message..."
        disabled={isSending}
      />

      {/* Photo Picker Modal */}
      <PhotoPickerModal
        isOpen={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        onPhotoSelect={() => { }}
      />

      {/* More Options Modal */}
      <ChatMoreOptionsModal
        isOpen={isMoreOptionsOpen}
        onClose={() => setIsMoreOptionsOpen(false)}
        onViewProfile={handleViewProfile}
        onBlock={() => { }}
        onReport={() => { }}
        onDelete={() => navigate('/female/chats')}
        userName={chatInfo.otherUser.name}
      />

      {/* Bottom Navigation */}
      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};
