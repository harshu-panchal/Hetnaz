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
        {/* Coin Balance Indicator */}
        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-700/50">
          <MaterialSymbol name="monetization_on" filled size={18} className="text-yellow-600 dark:text-gold" />
          <span className="text-xs font-bold text-yellow-800 dark:text-gold">
            {(coinBalance || 0).toLocaleString()}
          </span>
        </div>
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

