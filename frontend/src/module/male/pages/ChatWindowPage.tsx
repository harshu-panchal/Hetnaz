import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatWindowHeader } from '../components/ChatWindowHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { ChatMoreOptionsModal } from '../components/ChatMoreOptionsModal';
import { ChatGiftSelectorModal } from '../components/ChatGiftSelectorModal';
import { LevelUpModal } from '../components/LevelUpModal';
import { InsufficientBalanceModal } from '../components/InsufficientBalanceModal';
import { ImageModal } from '../../../shared/components/ImageModal';
import apiClient from '../../../core/api/client';
import { compressImage } from '../../../core/utils/image';

import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { useVideoCall } from '../../../core/context/VideoCallContextXState';
import chatService from '../../../core/services/chat.service';
import userService from '../../../core/services/user.service';
import socketService from '../../../core/services/socket.service';
import offlineQueueService from '../../../core/services/offlineQueue.service';
import type { Chat as ApiChat, Message as ApiMessage, IntimacyInfo } from '../../../core/types/chat.types';
import { useTranslation } from '../../../core/hooks/useTranslation';

// Message cost constant
const MESSAGE_COST = 50;
const IMAGE_MESSAGE_COST = 100;

export const ChatWindowPage = () => {
  const { t } = useTranslation();
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { coinBalance, updateBalance, user, chatCache, saveToChatCache, appSettings } = useGlobalState();
  const { requestCall, isInCall, callPrice } = useVideoCall();

  // Dynamic Costs from Admin Settings
  const currentMessageCost = appSettings?.messageCosts?.[user?.memberTier || 'basic'] || MESSAGE_COST;
  const currentImageCost = appSettings?.messageCosts?.imageMessage || IMAGE_MESSAGE_COST;

  const [messages, setMessages] = useState<ApiMessage[]>(() => {
    return (chatId && chatCache[chatId]) ? chatCache[chatId] : [];
  });
  const [chatInfo, setChatInfo] = useState<ApiChat | null>(null);
  const [intimacy, setIntimacy] = useState<IntimacyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isGiftSelectorOpen, setIsGiftSelectorOpen] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<IntimacyInfo | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [requiredCoinsModal, setRequiredCoinsModal] = useState(MESSAGE_COST);
  const [modalAction, setModalAction] = useState(t('actionPerform'));

  // Typing indicator
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  // Block status
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);

  // Image modal and upload
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Pagination state
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const MESSAGES_PER_PAGE = 10;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = user?.id;

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
        setIsBlockedByMe(!!chat.isBlockedByMe);
        setIsBlockedByOther(!!chat.isBlockedByOther);

        // Get messages (limited to 10 initially)
        const { messages: msgData, hasMore: moreAvailable } = await chatService.getChatMessages(chatId, { limit: MESSAGES_PER_PAGE });
        setMessages(msgData);
        setHasMore(moreAvailable);
        saveToChatCache(chatId, msgData);

        // Join chat room
        socketService.connect();
        socketService.joinChat(chatId);

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
  }, [chatId, navigate, t]);

  // Check balance on load and show modal if insufficient
  useEffect(() => {
    if (!isLoading && coinBalance < currentMessageCost) {
      setRequiredCoinsModal(currentMessageCost);
      setModalAction(t('actionSendMessage'));
      setIsBalanceModalOpen(true);
    }
  }, [isLoading, coinBalance, currentMessageCost, t]);

  // Process offline queue when back online
  useEffect(() => {
    const processOfflineQueue = async () => {
      if (!chatId) return;

      await offlineQueueService.processQueue(async (queuedMsg) => {
        try {
          if (queuedMsg.data.chatId !== chatId) return false;

          if (queuedMsg.type === 'message') {
            const result = await chatService.sendMessage(queuedMsg.data.chatId, queuedMsg.data.content);

            setMessages(prev => prev.map(m =>
              m._id === queuedMsg.data.optimisticMessageId ? result.message : m
            ));
            return true;
          }

          if (queuedMsg.type === 'gift') {
            const result = await chatService.sendGift(queuedMsg.data.chatId, queuedMsg.data.giftIds);

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

  // Socket event listeners
  useEffect(() => {
    const handleNewMessage = (data: { chatId: string; message: ApiMessage }) => {
      if (String(data.chatId) === String(chatId)) {
        setMessages(prev => {
          // 1. Permanent ID check - if real ID already exists, ignore
          if (prev.some(m => String(m._id) === String(data.message._id))) return prev;

          // 2. Identify and Deduplicate Optimistic messages for the Sender
          const senderIdVal = typeof data.message.senderId === 'object'
            ? (data.message.senderId as any)._id || (data.message.senderId as any).id
            : data.message.senderId;

          const isSender = String(senderIdVal) === String(currentUserId);

          if (isSender) {
            // Find if there is a temp message with matching content
            // For images, content might be empty so we also check messageType
            const optimisticMsg = prev.find(m =>
              String(m._id).startsWith('temp_') &&
              m.content === data.message.content &&
              m.messageType === data.message.messageType
            );

            if (optimisticMsg) {
              // Replace the temp message with the real one from socket
              return prev.map(m => String(m._id) === String(optimisticMsg._id) ? data.message : m);
            }
          }

          // 3. Normal addition for others or messages not yet optimistically rendered
          return [...prev, data.message];
        });
        scrollToBottom();
      }
    };

    const handleTyping = (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (data.chatId === chatId && data.userId !== currentUserId) {
        setIsOtherTyping(data.isTyping);
      }
    };

    const handleLevelUp = (data: { chatId: string; levelInfo: IntimacyInfo }) => {
      if (data.chatId === chatId) {
        setIntimacy(data.levelInfo);
        setLevelUpInfo(data.levelInfo);
      }
    };

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

    const handleBlockedBy = (data: { blockedBy: string; blockedByName: string }) => {
      if (chatInfo && data.blockedBy === chatInfo.otherUser._id) {
        setIsBlockedByOther(true);
        setError(t('youHaveBeenBlockedBy', { name: data.blockedByName }));
      }
    };

    socketService.on('message:new', handleNewMessage);
    socketService.on('chat:typing', handleTyping);
    socketService.on('intimacy:levelup', handleLevelUp);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);
    socketService.on('user:blocked_by', handleBlockedBy);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('chat:typing', handleTyping);
      socketService.off('intimacy:levelup', handleLevelUp);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
      socketService.off('user:blocked_by', handleBlockedBy);
    };
  }, [chatId, chatInfo, currentUserId, scrollToBottom]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send text message
  const handleSendMessage = async (content: string) => {
    if (!chatId || isSending) return;

    if (coinBalance < currentMessageCost) {
      setRequiredCoinsModal(currentMessageCost);
      setModalAction(t('actionSendMessage'));
      setIsBalanceModalOpen(true);
      return;
    }

    const newBalance = coinBalance - currentMessageCost;
    updateBalance(newBalance);

    const optimisticMessage: ApiMessage = {
      _id: `temp_${Date.now()}`,
      chatId: chatId,
      senderId: user?.id || '',
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

      setMessages(prev => prev.map(m =>
        m._id === optimisticMessage._id ? result.message : m
      ));

      if (result.newBalance !== undefined) {
        updateBalance(result.newBalance);
      }

      if (result.levelUp) {
        setLevelUpInfo(result.levelUp);
        setIntimacy(result.intimacy);
      } else if (result.intimacy) {
        setIntimacy(result.intimacy);
      }

    } catch (err: any) {
      console.error('Failed to send message:', err);

      if (!offlineQueueService.isOnline() || err.code === 'ERR_NETWORK') {
        offlineQueueService.queueMessage('message', {
          chatId,
          content,
          optimisticMessageId: optimisticMessage._id,
        }, MESSAGE_COST);

        setMessages(prev => prev.map(m =>
          m._id === optimisticMessage._id
            ? { ...m, status: 'queued' as any }
            : m
        ));

        setError(t('messageQueued'));
      } else {
        setError(err.response?.data?.message || t('errorFailedToSendMessage'));
        setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
      }
    } finally {
      setIsSending(false);
    }
  };

  // Send gift
  const handleSendGift = async (giftIds: string[], totalCost: number) => {
    if (!chatId || isSending) return;

    const newBalance = coinBalance - totalCost;
    updateBalance(newBalance);

    const optimisticMessage: ApiMessage = {
      _id: `temp_gift_${Date.now()}`,
      chatId: chatId,
      senderId: user?.id || '',
      content: t('sentGift'),
      messageType: 'gift',
      status: 'sending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gifts: giftIds.map(id => ({ giftId: id, giftName: 'Gift', giftImage: '', giftCost: 0 }))
    } as any;

    setMessages(prev => [...prev, optimisticMessage]);
    setIsGiftSelectorOpen(false);

    try {
      setIsSending(true);
      setError(null);

      const result = await chatService.sendGift(chatId, giftIds);

      setMessages(prev => prev.map(m =>
        m._id === optimisticMessage._id ? result.message : m
      ));

      if (result.newBalance !== undefined) {
        updateBalance(result.newBalance);
      }

      if (result.levelUp) {
        setLevelUpInfo(result.levelUp);
        setIntimacy(result.intimacy);
      } else if (result.intimacy) {
        setIntimacy(result.intimacy);
      }

    } catch (err: any) {
      console.error('Failed to send gift:', err);

      if (!offlineQueueService.isOnline() || err.code === 'ERR_NETWORK') {
        offlineQueueService.queueMessage('gift', {
          chatId,
          giftIds,
          optimisticMessageId: optimisticMessage._id,
        }, totalCost);

        setMessages(prev => prev.map(m =>
          m._id === optimisticMessage._id
            ? { ...m, status: 'queued' as any }
            : m
        ));

        setError(t('giftQueued'));
      } else {
        const errorMessage = err.response?.data?.message || '';
        if (errorMessage.toLowerCase().includes('insufficient') || errorMessage.toLowerCase().includes('balance')) {
          setModalAction(t('actionSendGift'));
          setIsBalanceModalOpen(true);
        } else {
          setError(errorMessage || t('errorFailedToSendGift'));
        }
        setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
      }
    } finally {
      setIsSending(false);
    }
  };

  // Send image
  const handleSendImage = async (base64Image: string) => {
    if (!chatId || isSending || isUploadingImage) return;

    if (coinBalance < currentImageCost) {
      setRequiredCoinsModal(currentImageCost);
      setModalAction(t('actionSendMessage'));
      setIsBalanceModalOpen(true);
      return;
    }

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

      // Deduct balance
      const newBalance = coinBalance - currentImageCost;
      updateBalance(newBalance);

      // Create optimistic message
      const optimisticMessage: ApiMessage = {
        _id: `temp_image_${Date.now()}`,
        chatId: chatId,
        senderId: user?.id || '',
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

      if (result.newBalance !== undefined) {
        updateBalance(result.newBalance);
      }

      if (result.levelUp) {
        setLevelUpInfo(result.levelUp);
        setIntimacy(result.intimacy);
      } else if (result.intimacy) {
        setIntimacy(result.intimacy);
      }

    } catch (err: any) {
      console.error('Failed to send image:', err);
      setError(err.response?.data?.message || t('errorFailedToSendImage'));
      // Refund coins on failure
      updateBalance(coinBalance);
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
      navigate('/male/chats');
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
          onClick={() => navigate('/male/chats')}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          {t('goBack')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden font-display">
      <ChatWindowHeader
        userName={chatInfo.otherUser.name}
        userAvatar={chatInfo.otherUser.avatar || ''}
        isOnline={chatInfo.otherUser.isOnline}
        isVerified={chatInfo.otherUser.isVerified}
        coinBalance={coinBalance}
        intimacy={intimacy}
        onMoreClick={() => setIsMoreOptionsOpen(true)}
        onUserInfoClick={() => navigate(`/male/profile/${chatInfo.otherUser._id}`)}
        onBackClick={() => navigate('/male/chats')}
        showVideoCall={true}
        onVideoCall={async () => {
          if (isInCall) {
            setError(t('errorAlreadyInCall'));
            return;
          }
          if (isBlockedByMe || isBlockedByOther) {
            setError(isBlockedByMe ? t('unblockToCall') : t('youAreBlocked'));
            return;
          }
          if (coinBalance < callPrice) {
            setRequiredCoinsModal(callPrice);
            setModalAction(t('actionVideoCall'));
            setIsBalanceModalOpen(true);
            return;
          }

          if (!chatInfo.otherUser.isOnline) {
            setError(t('errorUserOffline'));
            return;
          }
          try {
            await requestCall(
              chatInfo.otherUser._id,
              chatInfo.otherUser.name,
              chatInfo.otherUser.avatar || '',
              chatId!,
              user?.name || 'User',
              user?.photos?.[0] || ''
            );
          } catch (err: any) {
            setError(err.message || t('errorFailedToStartCall'));
          }
        }}
      />

      {error && (
        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
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
              onImageClick={(url) => setSelectedImageModal(url)}
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
                gifts: message.gifts as any,
                attachments: message.attachments as any,
              }}
            />
          );
        })}

        {isOtherTyping && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-gray-400">
              {t('typingIndicator', { name: chatInfo.otherUser.name })}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="relative">
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendPhoto={handleSendImage}
          onSendGift={() => setIsGiftSelectorOpen(true)}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          placeholder={isBlockedByMe ? t('unblockToSendMessage') : isBlockedByOther ? t('youAreBlocked') : t('typeMessage')}
          coinCost={MESSAGE_COST}
          disabled={coinBalance < MESSAGE_COST || isSending || isUploadingImage || isBlockedByMe || isBlockedByOther}
          isSending={isSending || isUploadingImage}
        />
      </div>

      <ChatMoreOptionsModal
        isOpen={isMoreOptionsOpen}
        onClose={() => setIsMoreOptionsOpen(false)}
        onViewProfile={() => navigate(`/male/profile/${chatInfo.otherUser._id}`)}
        onBlock={isBlockedByMe ? handleUnblockUser : handleBlockUser}
        isBlocked={isBlockedByMe}
        onReport={() => { }}
        onDelete={handleDeleteChat}
        userName={chatInfo.otherUser.name}
      />

      <ChatGiftSelectorModal
        isOpen={isGiftSelectorOpen}
        onClose={() => setIsGiftSelectorOpen(false)}
        onSendGift={handleSendGift}
        coinBalance={coinBalance}
      />

      <InsufficientBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onBuyCoins={() => navigate('/male/buy-coins')}
        requiredCoins={requiredCoinsModal}
        currentBalance={coinBalance || 0}
        action={modalAction}
      />

      <LevelUpModal
        isOpen={!!levelUpInfo}
        onClose={() => setLevelUpInfo(null)}
        levelInfo={levelUpInfo}
        userName={chatInfo.otherUser.name}
      />

      {/* Image Modal for full-screen view */}
      {selectedImageModal && (
        <ImageModal
          isOpen={!!selectedImageModal}
          imageUrl={selectedImageModal}
          onClose={() => setSelectedImageModal(null)}
        />
      )}
    </div>
  );
};
