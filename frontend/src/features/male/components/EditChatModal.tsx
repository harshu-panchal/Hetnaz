import { useState } from 'react';
import { MaterialSymbol } from '../types/material-symbol';

interface EditChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat?: (userId: string) => void;
}

// Mock users for search - replace with actual API call
const mockUsers = [
  { id: '1', name: 'Sarah', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNnKyZLNWCV7B-XwKgjd9-bbG9ZSq583oYGij7uKTYk2Ah_9nkpqgsGSDu-FUgux5QDiLCTw_y9JxTBhkZjWAOOReMhlK98A_84vIsKaxQ0IUzZqkJ7-wnAv67HRuUVltC2QQzOfbTk1-OdjqC7SWT4iG-MXs81ePZK3x1mYOHabRqp4eH7yIfiX3tH-YMXSs1uWS41vrxzPC8_MJHasLGiUWINfHYQ7KF2jfo0n_Yo6qBJKr_qMrOBUdimUVVJdY46GD7L0v-oL4' },
  { id: '2', name: 'Emily', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLUSJJYAwx8tl_zGDnOiTXyUUZNGZvfSUhgCgsc5vA2u3832geBVry-vrxCLbywcPMNdDw9Pp8aQYpK6Of5m_eCNYG0p8DZ_zKmzCBISKf3HqDRE9LKIkflketnQjBg0ihzj9xMoUbFN0MewVDhhm62RT4P8ApfLpMqm1KF4cJSY8J3ofy8uvQLeu7ka7eCxUsjWF4-UjrzrD1786TFutJ9_LA2fBbGdcQt8H5YNPFmG4lNC_tEwPefXDp1ieMAWqV4GmL4cQser8' },
  { id: '3', name: 'Jessica', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc0OstJEnLP2BH3T9hAadSkfqrmXq73qN9gbTMt7kfgPaQTpDMo6RBY0rGIlVRRYx9RNgGIuso4uSojA6-sMJxsbwokldCWi5vSTRo5Am8Pzgc73OW3MErmDu8gHuiQ0qQbM52r1B6IJMdIgiER50uXcyACMQ1f-e3CVduYEyDGFk_BIAtnlQer3BE077LFURJq4oRmImX1yG5_Q1OTgCEjnwV6A_EFuMSTBc85zvXe5_v2YpQ3mDh5t5vEzbNV0GqM0iE3aISpuE' },
];

export const EditChatModal = ({ isOpen, onClose, onCreateChat }: EditChatModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (userId: string) => {
    onCreateChat?.(userId);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-[fadeIn_0.2s_ease-out]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#2f151e] rounded-t-3xl shadow-2xl photo-picker-slide-up safe-area-inset-bottom max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#2f151e] border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Chat</h2>
            <button
              onClick={handleClose}
              className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
              aria-label="Close"
            >
              <MaterialSymbol name="close" size={24} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 h-12 bg-gray-50 dark:bg-[#2f151e] rounded-xl px-4">
            <MaterialSymbol name="search" size={20} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-gray-400 focus:ring-0"
            />
          </div>
        </div>

        {/* User List */}
        <div className="p-2">
          {filteredUsers.length > 0 ? (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#342d18] transition-colors active:scale-95"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="flex-1 text-left font-medium text-slate-900 dark:text-white">
                    {user.name}
                  </span>
                  <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MaterialSymbol
                name="person_search"
                size={48}
                className="text-gray-400 dark:text-gray-600 mb-4"
              />
              <p className="text-gray-500 dark:text-[#cc8ea3] text-center">
                {searchQuery ? 'No users found' : 'Search for users to start a chat'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


