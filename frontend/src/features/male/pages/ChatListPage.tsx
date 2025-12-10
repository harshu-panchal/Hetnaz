import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatListHeader } from '../components/ChatListHeader';
import { SearchBar } from '../components/SearchBar';
import { ChatListItem } from '../components/ChatListItem';
import { BottomNavigation } from '../components/BottomNavigation';
import { EditChatModal } from '../components/EditChatModal';
import type { Chat } from '../types/male.types';

// Mock data - replace with actual API calls
const mockChats: Chat[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Sarah',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfQrM3r4ezmwgyoIV88DGCpYKeaWFJhaYKHR6YYLrahg3antsOEr-5EF9oOrsy3-oqtN5xgfiZ6PBuuX9-di-vLEv-uaa0ZV2Qp9Lr0t173O462hHEV_pbAj6QGvuPLxT1AJxoDXIYddABQfeB9v3Io_zZiqapOnlTWMhDCbkUINzeryEMZ2sNWJhrvS7TUpBDG_wLwdciPBdgc6EHVSi8NhEC9kOjsbfN4F2ui7ohyvvN74CNcm842wb3jEdP-VOz4kBSgCw4wDg',
    lastMessage: "Hey! I saw you liked hiking too! 🏔️",
    timestamp: '10:45 AM',
    isOnline: true,
    hasUnread: true,
    unreadCount: 2,
    messageType: 'text',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Emily',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLUSJJYAwx8tl_zGDnOiTXyUUZNGZvfSUhgCgsc5vA2u3832geBVry-vrxCLbywcPMNdDw9Pp8aQYpK6Of5m_eCNYG0p8DZ_zKmzCBISKf3HqDRE9LKIkflketnQjBg0ihzj9xMoUbFN0MewVDhhm62RT4P8ApfLpMqm1KF4cJSY8J3ofy8uvQLeu7ka7eCxUsjWF4-UjrzrD1786TFutJ9_LA2fBbGdcQt8H5YNPFmG4lNC_tEwPefXDp1ieMAWqV4GmL4cQser8',
    lastMessage: 'Sent a photo',
    timestamp: '10:12 AM',
    isOnline: true,
    hasUnread: false,
    isVIP: true,
    messageType: 'photo',
    readStatus: 'read',
  },
  {
    id: '3',
    userId: '3',
    userName: 'Jessica',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc0OstJEnLP2BH3T9hAadSkfqrmXq73qN9gbTMt7kfgPaQTpDMo6RBY0rGIlVRRYx9RNgGIuso4uSojA6-sMJxsbwokldCWi5vSTRo5Am8Pzgc73OW3MErmDu8gHuiQ0qQbM52r1B6IJMdIgiER50uXcyACMQ1f-e3CVduYEyDGFk_BIAtnlQer3BE077LFURJq4oRmImX1yG5_Q1OTgCEjnwV6A_EFuMSTBc85zvXe5_v2YpQ3mDh5t5vEzbNV0GqM0iE3aISpuE',
    lastMessage: "That sounds fun! Let's do it.",
    timestamp: 'Yesterday',
    isOnline: false,
    hasUnread: false,
    messageType: 'text',
    readStatus: 'read',
  },
  {
    id: '4',
    userId: '4',
    userName: 'Ashley',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB-CmPZF-6itCs73bDy6d7GPdjSSLQ5BxCtlxCNbSbWN1o8Ra5IyWqPqrPFb7JMKxwcdwoLwrpVhW6pUwdBVUtielfuJ1ANPoxjbxKB4BYDMPoTHdQj9_llaBjzRJyHW62shjHBCI48dPR_Ap4PrX86uM0dpREOPQBDPQelNeiVWQfVXozNXMd13pLZlYycVhc-AZ_tG1Jh-OxREt95AYusjhgmWilXunjaNQDMreXKlmS-cLXa21otf4YcTP3lsEeCReLz5GIZCQ',
    lastMessage: 'Can you send me the details?',
    timestamp: 'Yesterday',
    isOnline: false,
    hasUnread: true,
    unreadCount: 1,
    messageType: 'text',
  },
  {
    id: '5',
    userId: '5',
    userName: 'Michelle',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA623yICWJGD3OhorZuTviTJ8-2TxVXoOfh-T6bz5uXPZvrrYj_Uxne_DmUz14lNt351yNswHP_Nw9R5dw9uUG1-UEKgZ0CIMOeBKsQ3pBupvWJPAw4vB3ONiEkVGL_ZVMcPwD8vitJCC_dk6qzadQYS7QtRNtcJkI5vd4d6zIRYwfbfPU-T-MyqgguxRusjEgVULoAWNJ_gt_EwbXVpEEa1lMlCyyLQHfHGFbiiR3-w-dFcfexzwhOZ41zg3qnIZ7X4cAKu6B5Q-g',
    lastMessage: 'Haha, totally! 😂',
    timestamp: 'Mon',
    isOnline: false,
    hasUnread: false,
    messageType: 'text',
    readStatus: 'read',
  },
  {
    id: '6',
    userId: '6',
    userName: 'Kim',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL9tBX9_xi0wB25MR8L7YJJDsVEF6KPFsMfAuJm0u_N13Fz34BFtXuYuQg1sn0kDy82IM3t76oh0cAz1wFbusN0SDc5mc2qFkHVgT3PU2jl_X84QVlSC0L8Drhu6gt9u8rxrH_-iM4ywj7KjZYrtx43m_UAnvakjq63btXAHTC_f95e1nPLyKF2kkdAtYrhqHXF74SWozDoaArCzfJxGX85Yajx2TpbFxPY5bqlwTWl70LXLV1XLV6pFkqsGg-AGpZB1veor46Ooc',
    lastMessage: "I'm free next weekend if...",
    timestamp: 'Sun',
    isOnline: true,
    hasUnread: false,
    messageType: 'text',
    readStatus: 'delivered',
  },
];

const navigationItems = [
  { id: 'discover', icon: 'explore', label: 'Discover' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats', isActive: true, hasBadge: true },
  { id: 'wallet', icon: 'monetization_on', label: 'Wallet' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

export const ChatListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [coinBalance] = useState(450);
  const [isEditChatOpen, setIsEditChatOpen] = useState(false);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return mockChats;
    }
    const query = searchQuery.toLowerCase();
    return mockChats.filter(
      (chat) =>
        chat.userName.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEditClick = () => {
    setIsEditChatOpen(true);
  };

  const handleCreateChat = (userId: string) => {
    // TODO: Create chat and navigate to it
    navigate(`/chat/${userId}`);
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'discover':
        navigate('/discover');
        break;
      case 'chats':
        navigate('/chats');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      case 'profile':
        navigate('/my-profile');
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Status Bar Area (Visual Only) */}
      <div className="h-6 w-full bg-background-light dark:bg-background-dark shrink-0" />

      {/* Top App Bar */}
      <ChatListHeader coinBalance={coinBalance} onEditClick={handleEditClick} />

      {/* Search Bar */}
      <SearchBar placeholder="Search matches..." onSearch={handleSearch} />

      {/* Chat List */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-2">
        {/* Section Title */}
        <div className="px-2 py-3">
          <h3 className="text-xs font-bold text-gray-500 dark:text-[#cc8ea3] uppercase tracking-wider">
            Active Conversations
          </h3>
        </div>

        {/* Chat Items */}
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} onClick={handleChatClick} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MaterialSymbol name="chat_bubble" size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-[#cc8ea3] text-center">
              No chats found matching "{searchQuery}"
            </p>
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

