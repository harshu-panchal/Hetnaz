import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatWindowHeader } from '../components/ChatWindowHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { PhotoPickerModal } from '../components/PhotoPickerModal';
import { ChatMoreOptionsModal } from '../components/ChatMoreOptionsModal';
import type { Message } from '../types/male.types';

// Mock data - replace with actual API calls
const mockChats: Record<string, { userName: string; userAvatar: string; isOnline: boolean; isVIP?: boolean }> = {
  '1': {
    userName: 'Sarah',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfQrM3r4ezmwgyoIV88DGCpYKeaWFJhaYKHR6YYLrahg3antsOEr-5EF9oOrsy3-oqtN5xgfiZ6PBuuX9-di-vLEv-uaa0ZV2Qp9Lr0t173O462hHEV_pbAj6QGvuPLxT1AJxoDXIYddABQfeB9v3Io_zZiqapOnlTWMhDCbkUINzeryEMZ2sNWJhrvS7TUpBDG_wLwdciPBdgc6EHVSi8NhEC9kOjsbfN4F2ui7ohyvvN74CNcm842wb3jEdP-VOz4kBSgCw4wDg',
    isOnline: true,
  },
  '2': {
    userName: 'Emily',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLUSJJYAwx8tl_zGDnOiTXyUUZNGZvfSUhgCgsc5vA2u3832geBVry-vrxCLbywcPMNdDw9Pp8aQYpK6Of5m_eCNYG0p8DZ_zKmzCBISKf3HqDRE9LKIkflketnQjBg0ihzj9xMoUbFN0MewVDhhm62RT4P8ApfLpMqm1KF4cJSY8J3ofy8uvQLeu7ka7eCxUsjWF4-UjrzrD1786TFutJ9_LA2fBbGdcQt8H5YNPFmG4lNC_tEwPefXDp1ieMAWqV4GmL4cQser8',
    isOnline: true,
    isVIP: true,
  },
  '3': {
    userName: 'Jessica',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc0OstJEnLP2BH3T9hAadSkfqrmXq73qN9gbTMt7kfgPaQTpDMo6RBY0rGIlVRRYx9RNgGIuso4uSojA6-sMJxsbwokldCWi5vSTRo5Am8Pzgc73OW3MErmDu8gHuiQ0qQbM52r1B6IJMdIgiER50uXcyACMQ1f-e3CVduYEyDGFk_BIAtnlQer3BE077LFURJq4oRmImX1yG5_Q1OTgCEjnwV6A_EFuMSTBc85zvXe5_v2YpQ3mDh5t5vEzbNV0GqM0iE3aISpuE',
    isOnline: false,
  },
  '4': {
    userName: 'Ashley',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB-CmPZF-6itCs73bDy6d7GPdjSSLQ5BxCtlxCNbSbWN1o8Ra5IyWqPqrPFb7JMKxwcdwoLwrpVhW6pUwdBVUtielfuJ1ANPoxjbxKB4BYDMPoTHdQj9_llaBjzRJyHW62shjHBCI48dPR_Ap4PrX86uM0dpREOPQBDPQelNeiVWQfVXozNXMd13pLZlYycVhc-AZ_tG1Jh-OxREt95AYusjhgmWilXunjaNQDMreXKlmS-cLXa21otf4YcTP3lsEeCReLz5GIZCQ',
    isOnline: false,
  },
  '5': {
    userName: 'Michelle',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA623yICWJGD3OhorZuTviTJ8-2TxVXoOfh-T6bz5uXPZvrrYj_Uxne_DmUz14lNt351yNswHP_Nw9R5dw9uUG1-UEKgZ0CIMOeBKsQ3pBupvWJPAw4vB3ONiEkVGL_ZVMcPwD8vitJCC_dk6qzadQYS7QtRNtcJkI5vd4d6zIRYwfbfPU-T-MyqgguxRusjEgVULoAWNJ_gt_EwbXVpEEa1lMlCyyLQHfHGFbiiR3-w-dFcfexzwhOZ41zg3qnIZ7X4cAKu6B5Q-g',
    isOnline: false,
  },
  '6': {
    userName: 'Kim',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL9tBX9_xi0wB25MR8L7YJJDsVEF6KPFsMfAuJm0u_N13Fz34BFtXuYuQg1sn0kDy82IM3t76oh0cAz1wFbusN0SDc5mc2qFkHVgT3PU2jl_X84QVlSC0L8Drhu6gt9u8rxrH_-iM4ywj7KjZYrtx43m_UAnvakjq63btXAHTC_f95e1nPLyKF2kkdAtYrhqHXF74SWozDoaArCzfJxGX85Yajx2TpbFxPY5bqlwTWl70LXLV1XLV6pFkqsGg-AGpZB1veor46Ooc',
    isOnline: true,
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
        senderName: 'Sarah',
        content: 'Hey! I saw you liked hiking too! 🏔️',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        isSent: false,
      },
      {
        id: '1-2',
        chatId: '1',
        senderId: 'me',
        senderName: 'You',
        content: 'Yes! I love hiking. Have you been to the mountains nearby?',
        timestamp: new Date(Date.now() - 3300000),
        type: 'text',
        isSent: true,
        readStatus: 'read',
        cost: 20,
      },
      {
        id: '1-3',
        chatId: '1',
        senderId: 'other',
        senderName: 'Sarah',
        content: 'Not yet, but I really want to go! Maybe we could plan a trip together?',
        timestamp: new Date(Date.now() - 3000000),
        type: 'text',
        isSent: false,
      },
      {
        id: '1-4',
        chatId: '1',
        senderId: 'me',
        senderName: 'You',
        content: 'That sounds amazing! When are you free?',
        timestamp: new Date(Date.now() - 2700000),
        type: 'text',
        isSent: true,
        readStatus: 'read',
        cost: 20,
      },
    ],
    '2': [
      {
        id: '2-1',
        chatId: '2',
        senderId: 'other',
        senderName: 'Emily',
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
        content: 'Hi Emily! How are you?',
        timestamp: new Date(Date.now() - 6900000),
        type: 'text',
        isSent: true,
        readStatus: 'read',
        cost: 20,
      },
    ],
    '3': [
      {
        id: '3-1',
        chatId: '3',
        senderId: 'other',
        senderName: 'Jessica',
        content: "That sounds fun! Let's do it.",
        timestamp: new Date(Date.now() - 86400000),
        type: 'text',
        isSent: false,
      },
    ],
    '4': [
      {
        id: '4-1',
        chatId: '4',
        senderId: 'other',
        senderName: 'Ashley',
        content: 'Can you send me the details?',
        timestamp: new Date(Date.now() - 86400000),
        type: 'text',
        isSent: false,
      },
    ],
    '5': [
      {
        id: '5-1',
        chatId: '5',
        senderId: 'other',
        senderName: 'Michelle',
        content: 'Haha, totally! 😂',
        timestamp: new Date(Date.now() - 172800000),
        type: 'text',
        isSent: false,
      },
    ],
    '6': [
      {
        id: '6-1',
        chatId: '6',
        senderId: 'other',
        senderName: 'Kim',
        content: "I'm free next weekend if...",
        timestamp: new Date(Date.now() - 259200000),
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
  const [coinBalance] = useState(450);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInfo = chatId ? mockChats[chatId] : null;

  // Load messages for the current chat
  useEffect(() => {
    if (!chatId || !chatInfo) {
      navigate('/chats');
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
      cost: 20, // Cost per message for male users
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate response after 1 second
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        chatId,
        senderId: 'other',
        senderName: chatInfo.userName,
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
      content: file.name,
      timestamp: new Date(),
      type: 'image',
      isSent: true,
      readStatus: 'sent',
      cost: 20,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleMoreClick = () => {
    setIsMoreOptionsOpen(true);
  };

  const handleViewProfile = () => {
    if (chatInfo?.userName) {
      // Navigate to profile - would need userId from chatInfo
      console.log('View profile for:', chatInfo.userName);
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
    navigate('/chats');
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
        isVIP={chatInfo.isVIP}
        onMoreClick={handleMoreClick}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendPhoto={handleSendPhoto}
        placeholder="Type a message..."
        coinCost={20}
        disabled={coinBalance < 20}
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
        userName={chatInfo?.userName}
      />
    </div>
  );
};

