import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatWindowHeader } from '../components/ChatWindowHeader';
import { MessageBubble } from '../components/MessageBubble';
import { GiftMessageBubble } from '../components/GiftMessageBubble';
import { MessageInput } from '../components/MessageInput';
import { ChatMoreOptionsModal } from '../components/ChatMoreOptionsModal';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import chatService from '../../../core/services/chat.service';
import userService from '../../../core/services/user.service';
import socketService from '../../../core/services/socket.service';
import offlineQueueService from '../../../core/services/offlineQueue.service';
import type { Chat as ApiChat, Message as ApiMessage } from '../../../core/types/chat.types';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { ImageModal } from '../../../shared/components/ImageModal';
import { ReportModal } from '../../../shared/components/ReportModal';
import apiClient from '../../../core/api/client';
import { compressImage } from '../../../core/utils/image';
import { getUser, getAuthToken } from '../../../core/utils/auth';

import { useQueryClient } from '@tanstack/react-query';
import { CHAT_KEYS } from '../../../core/queries/useChatQuery';

export const ChatWindowPage = () => {
  const { t } = useTranslation();
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { chatCache, saveToChatCache } = useGlobalState();
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ApiMessage[]>(() => {
    // 1. Try React Query cache first
    const queryData = queryClient.getQueryData<ApiMessage[]>(CHAT_KEYS.messages(chatId || ''));
    if (queryData) return queryData;

    // 2. Fallback to legacy cache
    return (chatId && chatCache[chatId]) ? chatCache[chatId] : [];
  });
  const [chatInfo, setChatInfo] = useState<ApiChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Image modal and upload
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Pagination state
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const MESSAGES_PER_PAGE = 10;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getUser() || {};
  const currentUserId = user._id || user.id;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch available balance
  useEffect(() => {
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
          setAvailableBalance(data.data.earnings.availableBalance || 0);
        }
      } catch (err) {
        console.error('Failed to fetch available balance:', err);
        setAvailableBalance(0);
      }
    };
    fetchAvailableBalance();
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

        // Get messages (limited to 10 initially)
        const { messages: msgData, hasMore: moreAvailable } = await chatService.getChatMessages(chatId, { limit: MESSAGES_PER_PAGE });
        setMessages(msgData);
        setHasMore(moreAvailable);
        saveToChatCache(chatId, msgData);

        // Update block status
        setIsBlockedByMe(!!chat.isBlockedByMe);
        setIsBlockedByOther(!!chat.isBlockedByOther);

        // Join chat room
        socketService.connect();
        socketService.joinChat(chatId);

        // Mark as read and update global list (for badges)
        await chatService.markChatAsRead(chatId);
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.lists() });

        setError(null);
      } catch (err: any) {
        console.error('Failed to load chat:', err);
        setError(err.response?.data?.message || t('errorFailedToLoadChat'));
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

  // Process offline queue when back online
  useEffect(() => {
    const processOfflineQueue = async () => {
      if (!chatId) return;

      await offlineQueueService.processQueue(async (queuedMsg) => {
        try {
          if (queuedMsg.type === 'message' && queuedMsg.data.chatId === chatId) {
            const result = await chatService.sendMessage(queuedMsg.data.chatId, queuedMsg.data.content);

            // Replace queued message with real message
            setMessages(prev => prev.map(m =>
              m._id === queuedMsg.data.optimisticMessageId ? result.message : m
            ));

            return true;
          }
          return false;
        } catch (err) {
          console.error('[QueueProcessor] Failed to send queued message:', err);
          return false;
        }
      });
    };

    offlineQueueService.setOnlineCallback(processOfflineQueue);
    if (offlineQueueService.getQueueSize() > 0) {
      processOfflineQueue();
    }
  }, [chatId]);

  // Socket listener for new messages - MUST be separate and early
  useEffect(() => {
    if (!chatId) return;

    const handleNewMessage = (data: { chatId: string; message: ApiMessage }) => {
      if (String(data.chatId) === String(chatId)) {
        setMessages(prev => {
          // 1. Permanent ID check
          if (prev.some(m => String(m._id) === String(data.message._id))) return prev;

          // 2. Deduplicate for sender (Optimistic UI)
          const senderIdVal = typeof data.message.senderId === 'object'
            ? (data.message.senderId as any)._id || (data.message.senderId as any).id
            : data.message.senderId;

          const isSender = String(senderIdVal) === String(currentUserId);

          if (isSender) {
            const optimisticMsg = prev.find(m =>
              String(m._id).startsWith('temp_') &&
              m.content === data.message.content &&
              m.messageType === data.message.messageType
            );

            if (optimisticMsg) {
              return prev.map(m => String(m._id) === String(optimisticMsg._id) ? data.message : m);
            }
          }

          return [...prev, data.message];
        });
        scrollToBottom();

        // Mark incoming message as read if we are in this chat
        chatService.markChatAsRead(chatId);
      }
    };

    socketService.on('message:new', handleNewMessage);
    socketService.on('chat:message', handleNewMessage);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('chat:message', handleNewMessage);
    };
  }, [chatId, currentUserId, scrollToBottom, queryClient]);

  // Socket listeners for user status, typing, blocking (requires chatInfo)
  useEffect(() => {
    if (!chatInfo) return;

    // User online/offline status updates
    const handleUserOnline = (data: { userId: string }) => {
      if (data.userId === chatInfo.otherUser._id) {
        setChatInfo(prev => prev ? {
          ...prev,
          otherUser: { ...prev.otherUser, isOnline: true }
        } : null);
      }
    };

    const handleUserOffline = (data: { userId: string; lastSeen: string }) => {
      if (data.userId === chatInfo.otherUser._id) {
        setChatInfo(prev => prev ? {
          ...prev,
          otherUser: { ...prev.otherUser, isOnline: false, lastSeen: data.lastSeen }
        } : null);
      }
    };

    const handleBlockedBy = (data: { blockedBy: string; blockedByName: string }) => {
      if (data.blockedBy === chatInfo.otherUser._id) {
        setIsBlockedByOther(true);
        setError(t('youHaveBeenBlockedBy', { name: data.blockedByName }));
      }
    };

    const handleTyping = (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (data.chatId === chatId && data.userId !== currentUserId) {
        setIsOtherTyping(data.isTyping);
      }
    };

    socketService.on('chat:typing', handleTyping);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);
    socketService.on('user:blocked_by', handleBlockedBy);

    return () => {
      socketService.off('chat:typing', handleTyping);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
      socketService.off('user:blocked_by', handleBlockedBy);
    };
  }, [chatId, chatInfo, currentUserId, t]);

  useEffect(() => {
    scrollToBottom();
    if (messages.length > 0 && chatId) {
      queryClient.setQueryData(CHAT_KEYS.messages(chatId), messages);
    }
  }, [messages, scrollToBottom, chatId, queryClient]);

  // Send image
  const handleSendImage = async (base64Image: string) => {
    if (!chatId || isSending || isUploadingImage) return;

    try {
      setIsUploadingImage(true);
      setError(null);

      // Compress image before upload
      const compressedBase64 = await compressImage(base64Image, { maxWidth: 1000, maxHeight: 1000, quality: 0.75 });

      // Upload to Cloudinary - increased timeout to 60s for direct upload
      const response = await apiClient.post('/upload/chat-image',
        { image: compressedBase64 },
        { timeout: 60000 }
      );
      const { url } = response.data.data;

      // Create optimistic message
      const optimisticMessage: ApiMessage = {
        _id: `temp_image_${Date.now()}`,
        chatId: chatId,
        senderId: currentUserId,
        content: '',
        messageType: 'image',
        status: 'sending',
        attachments: [{ type: 'image', url }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any;

      setMessages(prev => [...prev, optimisticMessage]);

      // Send via chat service
      setIsSending(true);
      const result = await chatService.sendMessage(chatId, '', 'image', url);

      setMessages(prev => prev.map(m =>
        m._id === optimisticMessage._id ? result.message : m
      ));

    } catch (err: any) {
      console.error('Failed to send image:', err);
      setError(err.response?.data?.message || t('errorFailedToSendImage'));
    } finally {
      setIsUploadingImage(false);
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

  // Female users don't pay to send messages
  const handleSendMessage = async (content: string) => {
    if (!chatId || isSending) return;

    // STEP 1: Create optimistic message for UI
    const optimisticMessage: ApiMessage = {
      _id: `temp_${Date.now()}`,
      chatId: chatId,
      senderId: currentUserId,
      content,
      messageType: 'text',
      status: 'sending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      setIsSending(true);
      setError(null);

      const result = await chatService.sendMessage(chatId, content);

      // STEP 2: Replace optimistic message
      setMessages(prev => prev.map(m =>
        m._id === optimisticMessage._id ? result.message : m
      ));
    } catch (err: any) {
      console.error('Failed to send message:', err);

      // STEP 3: If offline or network error, queue it
      if (!offlineQueueService.isOnline() || err.code === 'ERR_NETWORK') {
        offlineQueueService.queueMessage('message', {
          chatId,
          content,
          optimisticMessageId: optimisticMessage._id,
        }, 0); // Cost is 0 for females

        setMessages(prev => prev.map(m =>
          m._id === optimisticMessage._id
            ? { ...m, status: 'queued' as any }
            : m
        ));

        setError(t('messageQueued'));
      } else {
        setError(err.response?.data?.message || t('errorFailedToSendMessage'));
        // Remove optimistic message on non-network errors
        setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
      }
    } finally {
      setIsSending(false);
    }
  };



  const handleMoreClick = () => {
    setIsMoreOptionsOpen(true);
  };

  const handleViewProfile = () => {
    if (chatInfo) {
      navigate(`/female/profile/${chatInfo.otherUser._id}`);
    }
  };

  const handleBlockUser = async () => {
    if (!chatInfo) return;
    try {
      await userService.blockUser(chatInfo.otherUser._id);
      setIsBlockedByMe(true);
      setError(t('userBlockedSuccessfully'));
    } catch (err: any) {
      setError(err.response?.data?.message || t('failedToBlockUser'));
    }
  };

  const handleUnblockUser = async () => {
    if (!chatInfo) return;
    try {
      await userService.unblockUser(chatInfo.otherUser._id);
      setIsBlockedByMe(false);
      setError(t('userUnblockedSuccessfully'));
    } catch (err: any) {
      setError(err.response?.data?.message || t('failedToUnblockUser'));
    }
  };

  const handleDeleteChat = async () => {
    if (!chatId) return;
    try {
      await userService.deleteChat(chatId);
      navigate('/female/chats');
    } catch (err: any) {
      setError(err.response?.data?.message || t('failedToDeleteChat'));
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
        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('chatNotFound')}</p>
        <button
          onClick={() => navigate('/female/chats')}
          className="px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg"
        >
          {t('goBack')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <ChatWindowHeader
        userName={chatInfo.otherUser.name}
        userAvatar={chatInfo.otherUser.avatar || ''}
        isOnline={chatInfo.otherUser.isOnline}
        onMoreClick={handleMoreClick}
        onUserInfoClick={handleViewProfile}
        coinBalance={availableBalance}
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
        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <button
              onClick={async () => {
                if (!chatId || isLoadingMore) return;
                setIsLoadingMore(true);
                try {
                  const oldestMessage = messages[0];
                  const beforeDate = oldestMessage?.createdAt;
                  const { messages: olderMessages, hasMore: moreAvailable } = await chatService.getChatMessages(chatId, {
                    limit: MESSAGES_PER_PAGE,
                    before: beforeDate
                  });
                  setMessages(prev => [...olderMessages, ...prev]);
                  setHasMore(moreAvailable);
                } catch (err) {
                  console.error('Failed to load more messages:', err);
                } finally {
                  setIsLoadingMore(false);
                }
              }}
              disabled={isLoadingMore}
              className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? t('loading') : t('loadMore')}
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            <p>{t('noMessagesYet')}</p>
          </div>
        )}

        {messages.map((message) => {
          // Robust sender ID extraction
          let senderId: string | undefined;
          if (typeof message.senderId === 'string') {
            senderId = message.senderId;
          } else if (message.senderId) {
            senderId = message.senderId._id || (message.senderId as any).id;
          }

          // Robust current user ID extraction
          const user = getUser() || {};
          const currentUserId = user._id || user.id;

          const isSent = String(senderId) === String(currentUserId);

          const senderName = (typeof message.senderId === 'object' && message.senderId)
            ? message.senderId.profile?.name
            : 'User';

          return message.messageType === 'gift' && message.gifts && message.gifts.length > 0 ? (
            <GiftMessageBubble
              key={message._id}
              gifts={message.gifts.map(g => ({
                id: g.giftId,
                name: g.giftName,
                icon: 'redeem',
                imageUrl: g.giftImage,
                cost: g.giftCost,
                tradeValue: Math.floor(g.giftCost * 0.5),
                description: '',
                category: 'romantic',
                receivedAt: new Date(message.createdAt),
                senderId: String(senderId),
                senderName: senderName || 'User',
                quantity: 1,
              }))}
              note=""
              timestamp={new Date(message.createdAt)}
              senderName={senderName || 'User'}
            />
          ) : (
            <MessageBubble
              key={message._id}
              onImageClick={(url) => setSelectedImageModal(url)}
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
                attachments: message.attachments as any,
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
            <span className="text-xs text-gray-400">{t('typingIndicator', { name: chatInfo.otherUser.name })}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Females don't pay */}
      <div className="relative">
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendPhoto={handleSendImage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          placeholder={isBlockedByMe ? t('unblockToSendMessage') : isBlockedByOther ? t('youAreBlocked') : t('typeMessage')}
          disabled={isSending || isUploadingImage || isBlockedByMe || isBlockedByOther}
          isSending={isSending || isUploadingImage}
        />
      </div>

      {/* Image Modal for full-screen view */}
      {selectedImageModal && (
        <ImageModal
          isOpen={!!selectedImageModal}
          imageUrl={selectedImageModal}
          onClose={() => setSelectedImageModal(null)}
        />
      )}

      {/* More Options Modal */}
      <ChatMoreOptionsModal
        isOpen={isMoreOptionsOpen}
        onClose={() => setIsMoreOptionsOpen(false)}
        onViewProfile={handleViewProfile}
        onBlock={isBlockedByMe ? handleUnblockUser : handleBlockUser}
        isBlocked={isBlockedByMe}
        onReport={() => {
          setIsMoreOptionsOpen(false);
          setIsReportModalOpen(true);
        }}
        onDelete={handleDeleteChat}
        userName={chatInfo.otherUser.name}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportedId={chatInfo.otherUser._id}
        userName={chatInfo.otherUser.name}
        chatId={chatId}
        onSuccess={() => {
          setError(t('reportSubmittedSuccess') || 'Report submitted successfully');
        }}
      />
    </div>
  );
};
