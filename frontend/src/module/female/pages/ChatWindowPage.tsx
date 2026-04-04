import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useAuth } from '../../../core/context/AuthContext';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import chatService from '../../../core/services/chat.service';
import userService from '../../../core/services/user.service';
import socketService from '../../../core/services/socket.service';
import { ChatWindowHeader } from '../components/ChatWindowHeader';
import { MessageBubble } from '../components/MessageBubble';
import { GiftMessageBubble } from '../components/GiftMessageBubble';
import { MessageInput } from '../components/MessageInput';
import { ChatMoreOptionsModal } from '../components/ChatMoreOptionsModal';
import { CameraCapture } from '../../../shared/components/CameraCapture';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { ImageModal } from '../../../shared/components/ImageModal';
import type { Message, Chat } from '../types/female.types';

export const ChatWindowPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coinBalance, updateBalance } = useGlobalState();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!chatId) return;
      setIsLoading(true);
      try {
        const [chatData, messagesData, profileData] = await Promise.all([
          chatService.getChatById(chatId),
          chatService.getChatMessages(chatId),
          userService.getMyProfile()
        ]);
        setChatInfo(chatData);
        setMessages(messagesData.messages);
        
        // Sync balance to global state if needed
        if (profileData.coins !== undefined) {
          updateBalance(profileData.coins);
        }

        // Join socket
        socketService.joinChat(chatId);
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (chatId) socketService.leaveChat(chatId);
    };
  }, [chatId, updateBalance]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Socket listeners
  useEffect(() => {
    if (!chatId) return;

    const handleNewMessage = (data: { chatId: string; message: any }) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    const handleTyping = (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (data.chatId === chatId && data.userId !== user?.id) {
        setIsOtherTyping(data.isTyping);
      }
    };

    socketService.on('message:new', handleNewMessage);
    socketService.on('chat:typing', handleTyping);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('chat:typing', handleTyping);
    };
  }, [chatId, user?.id, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    if (!chatId || !content.trim()) return;
    setIsSending(true);
    try {
      const response = await chatService.sendMessage(chatId, content);
      setMessages((prev: Message[]) => [...prev, response.message]);
      if (response.newBalance !== undefined) updateBalance(response.newBalance);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPhoto = async (base64: string) => {
    if (!chatId) return;
    setIsSending(true);
    try {
      const response = await chatService.sendMessage(chatId, '', 'image', base64);
      setMessages((prev: Message[]) => [...prev, response.message]);
      if (response.newBalance !== undefined) updateBalance(response.newBalance);
    } catch (err) {
      console.error('Failed to send photo:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleMoreClick = () => setIsOptionsOpen(true);
  const handleImageClick = (url: string) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };
  const handleUserInfoClick = () => {
    if (chatInfo?.userId) {
      navigate(`/female/profile/${chatInfo.userId}`);
    }
  };

  const handleBlock = async () => {
    if (!chatInfo?.userId) return;
    try {
      await userService.blockUser(chatInfo.userId);
      setIsOptionsOpen(false);
      navigate('/female/chats');
    } catch (err: any) {
      console.error('Failed to block user:', err);
    }
  };

  const handeReport = () => setIsOptionsOpen(false);

  const handleDeleteChat = async () => {
    if (!chatId) return;
    try {
      await userService.deleteChat(chatId);
      navigate('/female/chats');
    } catch (err: any) {
       console.error('Failed to delete chat:', err);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col h-screen bg-white items-center justify-center font-display">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-400 font-medium animate-pulse">{t('loadingChat') || 'Opening chat...'}</p>
    </div>
  );

  if (!chatInfo) return (
    <div className="flex flex-col h-screen bg-white items-center justify-center p-8 text-center font-display relative overflow-hidden">
       <div className="relative z-10 w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
          <MaterialSymbol name="chat_off" size={40} className="text-slate-300" />
        </div>
        <h2 className="relative z-10 text-2xl font-black text-slate-800 mb-3 tracking-tight">
          {t('chatNotAvailableTitle') || 'Chat Not Available'}
        </h2>
        <p className="relative z-10 text-slate-500 mb-8 max-w-xs">{t('chatNotAvailableDesc') || 'This conversation is no longer active or could not be found.'}</p>
        <button 
           onClick={() => navigate('/female/chats')}
           className="relative z-10 px-8 h-14 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          {t('backToChats')}
        </button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#fdfafb] overflow-hidden font-display relative">
      <ChatWindowHeader
        userName={chatInfo.userName}
        userAvatar={chatInfo.userAvatar || 'https://via.placeholder.com/40'}
        isOnline={chatInfo.isOnline}
        onMoreClick={handleMoreClick}
        onUserInfoClick={handleUserInfoClick}
        coinBalance={coinBalance}
        isVerified={true}
      />

      {/* Main Chat Area - Light Mode Mesh */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 custom-scrollbar relative z-10 bg-white shadow-inner">
        {/* Soft pink mesh elements for premium light feel */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-40 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center pt-12 pb-6">
          {/* Profile Centerpiece - Instagram Style (Light Theme) */}
          <div className="flex flex-col items-center mb-10 px-6 text-center">
            <div className="relative mb-6 group cursor-pointer" onClick={handleUserInfoClick}>
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 rounded-[2.8rem] opacity-40 blur-[2px] group-hover:opacity-100 transition-opacity" />
              <img
                src={chatInfo.userAvatar || 'https://via.placeholder.com/120'}
                alt={chatInfo.userName}
                className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white shadow-xl relative z-10"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1 flex items-center gap-2 justify-center">
              {chatInfo.userName}
              <MaterialSymbol name="verified" filled size={20} className="text-blue-500" />
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500/80 mb-8 px-4">
              {chatInfo.isOnline ? 'Active Now' : 'Recently Active'}
            </p>
            
            {/* Centerpiece Stats - Light Mode Cards */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center px-6 py-4 rounded-3xl bg-slate-50 border border-slate-100 min-w-[110px] shadow-sm">
                <span className="text-xl font-black text-slate-800 leading-none">Lv.1</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Level</span>
              </div>
              <div className="w-px h-10 bg-slate-200/50" />
              <div className="flex flex-col items-center px-6 py-4 rounded-3xl bg-slate-50 border border-slate-100 min-w-[110px] shadow-sm">
                <span className="text-xl font-black text-slate-800 leading-none">{messages.length}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Chats</span>
              </div>
            </div>
          </div>

          <div className="w-full space-y-4 px-4">
            {messages.map((msg: any, index) => {
              const currentUserId = user?.id || (user as any)?._id;
              
              // Defensively extract sender ID (handles string, object, or 'me' placeholder)
              const msgSenderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
              const msgSenderFallback = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
              const actualSenderId = msgSenderId || msgSenderFallback;
              
              const isMine = String(actualSenderId) === String(currentUserId) || 
                             actualSenderId === 'me' || 
                             msg.sender === 'me';
              
              const isGift = msg.type === 'gift' || 
                             (msg.metadata?.gifts && msg.metadata.gifts.length > 0) ||
                             msg.content?.toLowerCase().includes('sent 1 gift') ||
                             msg.content?.toLowerCase().includes('sent a gift');
              
              if (isGift) {
                return (
                  <GiftMessageBubble 
                    key={msg._id || index}
                    gifts={msg.metadata?.gifts || []}
                    note={msg.content}
                    timestamp={new Date(msg.createdAt)}
                    senderName={isMine ? t('you') || 'You' : chatInfo.userName}
                    isSent={isMine}
                    senderAvatar={isMine ? user?.avatarUrl : chatInfo.userAvatar}
                  />
                );
              }
              
              return (
                <MessageBubble
                  key={msg._id || index}
                  onImageClick={handleImageClick}
                  message={{
                    ...msg,
                    isSent: isMine,
                    senderAvatar: isMine ? user?.avatarUrl : chatInfo.userAvatar,
                    timestamp: new Date(msg.createdAt),
                    readStatus: msg.readStatus || 'sent'
                  } as any}
                />
              );
            })}
            
            {isOtherTyping && (
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{chatInfo.userName} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="relative z-20">
        <MessageInput 
          onSendMessage={handleSendMessage}
          onSendPhoto={handleSendPhoto}
          onCameraRequest={() => setIsCameraOpen(true)}
          placeholder={t('typeAMessage') || 'Type a message...'}
          isSending={isSending}
          onTypingStart={() => socketService.sendTyping(chatId!, true)}
          onTypingStop={() => socketService.sendTyping(chatId!, false)}
        />
      </div>

      <ChatMoreOptionsModal
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onBlock={handleBlock}
        onReport={handeReport}
        onDelete={handleDeleteChat}
        userName={chatInfo.userName}
      />

      <ImageModal 
        isOpen={isImageModalOpen}
        imageUrl={selectedImageUrl}
        onClose={() => setIsImageModalOpen(false)}
      />

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleSendPhoto}
      />
    </div>
  );
};
