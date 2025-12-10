import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatListHeader } from '../components/ChatListHeader';
import { SearchBar } from '../components/SearchBar';
import { ChatListItem } from '../components/ChatListItem';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import type { Chat } from '../types/female.types';

// Mock data - replace with actual API calls
const mockChats: Chat[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Alex',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
    lastMessage: "Hey! Thanks for the message! 😊",
    timestamp: '10:45 AM',
    isOnline: true,
    hasUnread: true,
    unreadCount: 2,
  },
  {
    id: '2',
    userId: '2',
    userName: 'Michael',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
    lastMessage: 'That sounds great!',
    timestamp: '10:12 AM',
    isOnline: true,
    hasUnread: false,
  },
  {
    id: '3',
    userId: '3',
    userName: 'David',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
    lastMessage: "I'd love to chat more!",
    timestamp: 'Yesterday',
    isOnline: false,
    hasUnread: false,
  },
  {
    id: '4',
    userId: '4',
    userName: 'James',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50-ii2k9PzO4qeyW-OGHjX-2FkC-nA5ibp8nilOmxqIs-w6h7s0urlDqev0gVBZWdyFA_3jZ4auAmlsmmGZJtFVeTHiGW7cqwg60iSjQAedJk4JqEbDkQMBYmK31cVtDFsUHahf8u_-Do3G7K2GnansIQaBcgPSJLc7jSTEJr1GNKy9Kpkbb0A-qm4L0Ul1Bd5sSiBcUw8P2BA8K3VMWLs47qnJbJahDqGtp9UA5PPVTWdJ5atRHa8i9VBLDRrbIoeoOw1THR6BI',
    lastMessage: 'Thanks for responding!',
    timestamp: 'Yesterday',
    isOnline: false,
    hasUnread: true,
    unreadCount: 1,
  },
];

const navigationItems = [
  { id: 'dashboard', icon: 'home', label: 'Home' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats', isActive: true, hasBadge: true },
  { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

export const ChatListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return mockChats;
    const query = searchQuery.toLowerCase();
    return mockChats.filter(
      (chat) =>
        chat.userName.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleChatClick = (chatId: string) => {
    navigate(`/female/chat/${chatId}`);
  };

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/female/dashboard');
        break;
      case 'chats':
        navigate('/female/chats');
        break;
      case 'earnings':
        navigate('/female/earnings');
        break;
      case 'profile':
        navigate('/female/my-profile');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      <ChatListHeader />
      <SearchBar onSearch={setSearchQuery} placeholder="Search chats..." />
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500 dark:text-[#cbbc90] text-lg">No chats found</p>
            <p className="text-gray-400 dark:text-[#cbbc90]/70 text-sm mt-2">
              {searchQuery ? 'Try a different search term' : 'Start a conversation'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} onClick={handleChatClick} />
          ))
        )}
      </div>
      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};

