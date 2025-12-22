import { MaterialSymbol } from '../types/material-symbol';

interface ChatListHeaderProps {
  coinBalance: number;
  onEditClick?: () => void;
}

export const ChatListHeader = ({ coinBalance, onEditClick }: ChatListHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark z-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Chats</h1>
      </div>
      <div className="flex items-center gap-3">

        {/* Action Button */}
        <button
          onClick={onEditClick}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#4a212f] text-gray-600 dark:text-[#cc8ea3] hover:bg-gray-300 dark:hover:bg-[#5e2a3c] transition-colors active:scale-95"
          aria-label="Edit"
        >
          <MaterialSymbol name="edit_square" />
        </button>
      </div>
    </header>
  );
};

