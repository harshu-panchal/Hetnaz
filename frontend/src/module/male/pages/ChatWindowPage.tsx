import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatWindowHeader } from '../components/ChatWindowHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { PhotoPickerModal } from '../components/PhotoPickerModal';
import { ChatMoreOptionsModal } from '../components/ChatMoreOptionsModal';
import { ChatGiftSelectorModal } from '../components/ChatGiftSelectorModal';
import { LevelUpModal } from '../components/LevelUpModal';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { useVideoCall } from '../../../core/context/VideoCallContext';
import chatService from '../../../core/services/chat.service';
import socketService from '../../../core/services/socket.service';
import type { Chat as ApiChat, Message as ApiMessage, IntimacyInfo } from '../../../core/types/chat.types';

// Message cost constant
const MESSAGE_COST = 50;

export const ChatWindowPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { coinBalance, updateBalance, user } = useGlobalState(); // Use global state
  const { requestCall, isInCall, callPrice } = useVideoCall(); // Video call context

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [chatInfo, setChatInfo] = useState<ApiChat | null>(null);
  const [intimacy, setIntimacy] = useState<IntimacyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isGiftSelectorOpen, setIsGiftSelectorOpen] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<IntimacyInfo | null>(null);

  // Typing indicator
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = user?._id || (user as any)?.id;

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch chat info and messages
  useEffect(() => {
    if (!chatId) {
      navigate('/male/chats');
      return;
    }

    const init = async () => {
      try {
        setIsLoading(true);

        // Get chat info by ID
        const chat = await chatService.getChatById(chatId);
        setChatInfo(chat);
        setIntimacy(chat.intimacy);

        // Get messages
        const { messages: msgData } = await chatService.getChatMessages(chatId);
        setMessages(msgData);

        // Balance comes from global state (auto-synced)

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
    // New message received
    const handleNewMessage = (data: { chatId: string; message: ApiMessage }) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    // Balance update handled by GlobalStateContext

    // Typing indicator
    const handleTyping = (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (data.chatId === chatId && data.userId !== currentUserId) {
        setIsOtherTyping(data.isTyping);
      }
    };

    // Level up event
    const handleLevelUp = (data: { chatId: string; levelInfo: IntimacyInfo }) => {
      if (data.chatId === chatId) {
        setIntimacy(data.levelInfo);
        setLevelUpInfo(data.levelInfo);
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
    socketService.on('intimacy:levelup', handleLevelUp);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('chat:typing', handleTyping);
      socketService.off('intimacy:levelup', handleLevelUp);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
    };
  }, [chatId, chatInfo, currentUserId, scrollToBottom]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send text message
  const handleSendMessage = async (content: string) => {
    if (!chatId || isSending) return;

    // Check balance
    if (coinBalance < MESSAGE_COST) {
      setError(`Insufficient coins. Need ${MESSAGE_COST} coins to send a message.`);
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      const result = await chatService.sendMessage(chatId, content);

      // Update messages (socket will also broadcast, but this ensures immediate UI update)
      setMessages(prev => [...prev, result.message]);

      // Update balance via global state
      if (result.newBalance !== undefined) {
        updateBalance(result.newBalance);
      }

      // Check for level up
      if (result.levelUp) {
        setLevelUpInfo(result.levelUp);
        setIntimacy(result.intimacy);
      } else if (result.intimacy) {
        setIntimacy(result.intimacy);
      }

    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Send gift
  const handleSendGift = async (giftId: string) => {
    if (!chatId || isSending) return;

    try {
      setIsSending(true);
      setError(null);

      const result = await chatService.sendGift(chatId, giftId);

      // Update messages
      setMessages(prev => [...prev, result.message]);

      // Update balance via global state
      if (result.newBalance !== undefined) {
        updateBalance(result.newBalance);
      }

      // Check for level up
      if (result.levelUp) {
        setLevelUpInfo(result.levelUp);
        setIntimacy(result.intimacy);
      } else if (result.intimacy) {
        setIntimacy(result.intimacy);
      }

      setIsGiftSelectorOpen(false);
    } catch (err: any) {
      console.error('Failed to send gift:', err);
      setError(err.response?.data?.message || 'Failed to send gift');
    } finally {
      setIsSending(false);
    }
  };

  // Typing indicator
  const handleTypingStart = () => {
    if (chatId) {
      socketService.sendTyping(chatId, true);
    }
  };

  const handleTypingStop = () => {
    if (chatId) {
      socketService.sendTyping(chatId, false);
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
          onClick={() => navigate('/male/chats')}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header with coin balance and intimacy */}
      <ChatWindowHeader
        userName={chatInfo.otherUser.name}
        userAvatar={chatInfo.otherUser.avatar || ''}
        isOnline={chatInfo.otherUser.isOnline}
        coinBalance={coinBalance}
        intimacy={intimacy}
        onMoreClick={() => setIsMoreOptionsOpen(true)}
        onBackClick={() => navigate('/male/chats')}
        showVideoCall={true}
        onVideoCall={async () => {
          if (isInCall) {
            setError('You are already in a call');
            return;
          }
          if (coinBalance < callPrice) {
            setError(`Insufficient coins. Video call costs ${callPrice} coins.`);
            return;
          }
          if (!chatInfo.otherUser.isOnline) {
            setError('User is currently offline');
            return;
          }
          try {
            await requestCall(
              chatInfo.otherUser._id,
              chatInfo.otherUser.name,
              chatInfo.otherUser.avatar || '',
              chatId!,
              user?.profile?.name || 'User',
              user?.profile?.photos?.[0]?.url || ''
            );
          } catch (err: any) {
            setError(err.message || 'Failed to start video call');
          }
        }}
      />

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Coin Cost Indicator */}
      <div className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 text-center">
        <span className="text-xs text-gray-600 dark:text-gray-300">
          💰 Each message costs <span className="font-bold text-primary">{MESSAGE_COST} coins</span>
          {coinBalance < MESSAGE_COST && (
            <span className="text-red-500 ml-2">
              (Low balance! <button onClick={() => navigate('/male/buy-coins')} className="underline">Buy coins</button>)
            </span>
          )}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            <p>No messages yet. Say hi!</p>
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

          const isSent = String(senderId) === String(currentUserId);

          const senderName = (typeof message.senderId === 'object' && message.senderId)
            ? message.senderId.profile?.name
            : 'User';

          return (
            <MessageBubble
              key={message._id}
              message={{
                id: message._id,
                chatId: message.chatId,
                senderId: String(senderId),
                senderName: senderName || 'User',
                content: message.content,
                timestamp: new Date(message.createdAt),
                type: message.messageType === 'video_call' ? 'text' : message.messageType as any,
                isSent,
                readStatus: message.status === 'failed' ? 'sent' : message.status as any,
                gifts: message.gift ? [message.gift] as any : undefined,
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

      {/* Input Area */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendPhoto={() => setIsPhotoPickerOpen(true)}
        onSendGift={() => setIsGiftSelectorOpen(true)}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        placeholder="Type a message..."
        coinCost={MESSAGE_COST}
        disabled={coinBalance < MESSAGE_COST || isSending}
        isSending={isSending}
      />

      {/* Modals */}
      <PhotoPickerModal
        isOpen={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        onPhotoSelect={() => { }}
      />

      <ChatMoreOptionsModal
        isOpen={isMoreOptionsOpen}
        onClose={() => setIsMoreOptionsOpen(false)}
        onViewProfile={() => { }}
        onBlock={() => { }}
        onReport={() => { }}
        onDelete={() => navigate('/male/chats')}
        userName={chatInfo.otherUser.name}
      />

      <ChatGiftSelectorModal
        isOpen={isGiftSelectorOpen}
        onClose={() => setIsGiftSelectorOpen(false)}
        onSendGift={handleSendGift}
        coinBalance={coinBalance}
      />

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={!!levelUpInfo}
        onClose={() => setLevelUpInfo(null)}
        levelInfo={levelUpInfo}
        userName={chatInfo.otherUser.name}
      />
    </div>
  );
};
