import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatWindowHeader } from '../components/ChatWindowHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { PhotoPickerModal } from '../components/PhotoPickerModal';
import { ChatMoreOptionsModal } from '../components/ChatMoreOptionsModal';
import type { Message } from '../types/female.types';

// Mock data - replace with actual API calls
const mockChats: Record<string, { userId: string; userName: string; userAvatar: string; isOnline: boolean }> = {
  '1': {
    userId: '1',
    userName: 'Alex',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
    isOnline: true,
  },
  '2': {
    userId: '2',
    userName: 'Michael',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
    isOnline: true,
  },
  '3': {
    userId: '3',
    userName: 'David',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
    isOnline: false,
  },
};

// Mock messages for each chat
const getMockMessages = (chatId: string): Message[] => {
  const chatInfo = mockChats[chatId];
  if (!chatInfo) return [];

  const baseMessages: Record<string, Message[]> = {
    '1': [
      {
        id: '1-1',
        chatId: '1',
        senderId: 'other',
        senderName: 'Alex',
        content: 'Hey! Thanks for the message! 😊',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        isSent: false,
      },
      {
        id: '1-2',
        chatId: '1',
        senderId: 'me',
        senderName: 'You',
        content: 'Hi Alex! How are you doing?',
        timestamp: new Date(Date.now() - 3300000),
        type: 'text',
        isSent: true,
        readStatus: 'read',
      },
      {
        id: '1-3',
        chatId: '1',
        senderId: 'other',
        senderName: 'Alex',
        content: "I'm doing great! Thanks for asking!",
        timestamp: new Date(Date.now() - 3000000),
        type: 'text',
        isSent: false,
      },
    ],
    '2': [
      {
        id: '2-1',
        chatId: '2',
        senderId: 'other',
        senderName: 'Michael',
        content: 'Hey there! 👋',
        timestamp: new Date(Date.now() - 7200000),
        type: 'text',
        isSent: false,
      },
      {
        id: '2-2',
        chatId: '2',
        senderId: 'me',
        senderName: 'You',
        content: 'Hi Michael! How are you?',
        timestamp: new Date(Date.now() - 6900000),
        type: 'text',
        isSent: true,
        readStatus: 'read',
      },
    ],
    '3': [
      {
        id: '3-1',
        chatId: '3',
        senderId: 'other',
        senderName: 'David',
        content: "I'd love to chat more!",
        timestamp: new Date(Date.now() - 86400000),
        type: 'text',
        isSent: false,
      },
    ],
  };

  return baseMessages[chatId] || [];
};

export const ChatWindowPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInfo = chatId ? mockChats[chatId] : null;

  // Load messages for the current chat
  useEffect(() => {
    if (!chatId || !chatInfo) {
      navigate('/female/chats');
      return;
    }
    // Load messages for this chat
    const chatMessages = getMockMessages(chatId);
    setMessages(chatMessages);
  }, [chatId, chatInfo, navigate]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!chatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      senderId: 'me',
      senderName: 'You',
      content,
      timestamp: new Date(),
      type: 'text',
      isSent: true,
      readStatus: 'sent',
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate response after 1 second
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        chatId,
        senderId: 'other',
        senderName: chatInfo?.userName || 'User',
        content: 'Thanks for your message! 😊',
        timestamp: new Date(),
        type: 'text',
        isSent: false,
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 1000);
  };

  const handleSendPhoto = () => {
    setIsPhotoPickerOpen(true);
  };

  const handlePhotoSelect = (file: File) => {
    if (!chatId) return;

    // TODO: Upload photo and send message
    // For now, just create a mock image message
    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      senderId: 'me',
      senderName: 'You',
      content: URL.createObjectURL(file),
      timestamp: new Date(),
      type: 'image',
      isSent: true,
      readStatus: 'sent',
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleMoreClick = () => {
    setIsMoreOptionsOpen(true);
  };

  const handleViewProfile = () => {
    if (chatInfo?.userId) {
      navigate(`/female/profile/${chatInfo.userId}`);
    }
  };

  const handleBlock = () => {
    console.log('Block user');
    // TODO: Implement block functionality
  };

  const handleReport = () => {
    console.log('Report user');
    // TODO: Implement report functionality
  };

  const handleDelete = () => {
    console.log('Delete chat');
    navigate('/female/chats');
    // TODO: Implement delete chat functionality
  };

  if (!chatId || !chatInfo) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <ChatWindowHeader
        userName={chatInfo.userName}
        userAvatar={chatInfo.userAvatar}
        isOnline={chatInfo.isOnline}
        onMoreClick={handleMoreClick}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendPhoto={handleSendPhoto}
        placeholder="Type a message..."
      />

      {/* Photo Picker Modal */}
      <PhotoPickerModal
        isOpen={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        onPhotoSelect={handlePhotoSelect}
      />

      {/* More Options Modal */}
      <ChatMoreOptionsModal
        isOpen={isMoreOptionsOpen}
        onClose={() => setIsMoreOptionsOpen(false)}
        onViewProfile={handleViewProfile}
        onBlock={handleBlock}
        onReport={handleReport}
        onDelete={handleDelete}
        userName={chatInfo.userName}
      />
    </div>
  );
};

