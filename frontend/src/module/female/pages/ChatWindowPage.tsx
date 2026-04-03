import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useAuth } from '../../../core/context/AuthContext';
import chatService from '../../../core/services/chat.service';
import userService from '../../../core/services/user.service';
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
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        setCoinBalance(profileData.coins || 0);
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!chatId || !content.trim()) return;
    setIsSending(true);
    try {
      const response = await chatService.sendMessage(chatId, content);
      setMessages((prev: Message[]) => [...prev, response.message]);
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

  const handleReport = () => {
    // Report logic
    setIsOptionsOpen(false);
  };

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
    <div className="flex flex-col h-screen bg-white items-center justify-center p-8 text-center font-display">
       <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100">
          <MaterialSymbol name="chat_off" size={40} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
          {t('chatNotAvailableTitle') || 'Chat Not Available'}
        </h2>
        <p className="text-slate-500 mb-8 max-w-xs">{t('chatNotAvailableDesc') || 'This conversation is no longer active or could not be found.'}</p>
        <button 
           onClick={() => navigate('/female/chats')}
           className="px-8 h-14 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          {t('backToChats')}
        </button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#fdfafb]">
      <ChatWindowHeader
        userName={chatInfo.userName}
        userAvatar={chatInfo.userAvatar || 'https://via.placeholder.com/40'}
        isOnline={chatInfo.isOnline}
        onMoreClick={handleMoreClick}
        onUserInfoClick={handleUserInfoClick}
        coinBalance={coinBalance}
      />

      {/* Main Chat Area - Light Mode Mesh */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 custom-scrollbar bg-white relative">
        {/* Subtle mesh elements for premium light feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-40 left-0 w-48 h-48 bg-amber-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col items-center pt-12 pb-6">
          {/* Profile Centerpiece - Light Theme */}
          <div className="flex flex-col items-center mb-8 px-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-pink-100 blur-2xl rounded-full scale-125 opacity-40 shrink-0" />
              <img
                src={chatInfo.userAvatar || 'https://via.placeholder.com/120'}
                alt={chatInfo.userName}
                className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white shadow-xl relative z-10"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
              {chatInfo.userName}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-4">
              {chatInfo.isOnline ? 'Active Now' : 'Recently Active'}
            </p>
            
            {/* Reimagined 'Vault' Centerpiece Stats - Light Mode */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col items-center px-6 py-4 rounded-3xl bg-slate-50 border border-slate-100 min-w-[100px] shadow-sm">
                <span className="text-xl font-black text-slate-800 leading-none">Lv.1</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Level</span>
              </div>
              <div className="w-px h-10 bg-slate-200/50" />
              <div className="flex flex-col items-center px-6 py-4 rounded-3xl bg-slate-50 border border-slate-100 min-w-[100px] shadow-sm">
                <span className="text-xl font-black text-slate-800 leading-none">{messages.length}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Chats</span>
              </div>
            </div>
          </div>

          <div className="w-full space-y-4 px-4 overflow-hidden">
            {messages.map((msg: any, index) => {
              const isMine = msg.senderId === user?.id || msg.senderId === 'me';
              const isGift = msg.type === 'gift' || 
                             (msg.metadata?.gifts && msg.metadata.gifts.length > 0) ||
                             msg.content?.toLowerCase().includes('sent 1 gift') ||
                             msg.content?.toLowerCase().includes('sent a gift');
              
              if (isGift) {
                return (
                  <GiftMessageBubble 
                    key={msg.id || index}
                    gifts={msg.metadata?.gifts || []}
                    note={msg.content}
                    timestamp={new Date(msg.createdAt)}
                    senderName={isMine ? t('you') || 'You' : chatInfo.userName}
                  />
                );
              }
              
              return (
                <MessageBubble
                  key={msg.id || index}
                  onImageClick={handleImageClick}
                  message={{
                    ...msg,
                    isSent: isMine,
                    timestamp: new Date(msg.createdAt),
                    readStatus: msg.readStatus || 'sent'
                  } as any}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage}
        onSendPhoto={handleSendPhoto}
        onCameraRequest={() => setIsCameraOpen(true)}
        placeholder={t('typeAMessage') || 'Type a message...'}
        isSending={isSending}
      />

      <ChatMoreOptionsModal
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onBlock={handleBlock}
        onReport={handleReport}
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
