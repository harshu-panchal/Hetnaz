import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';

interface ChatWindowHeaderProps {
  userName: string;
  userAvatar: string;
  isOnline: boolean;
  onMoreClick?: () => void;
  coinBalance?: number;
}

export const ChatWindowHeader = ({
  userName,
  userAvatar,
  isOnline,
  onMoreClick,
  coinBalance,
}: ChatWindowHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-3 py-2 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5 z-10">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95 shrink-0"
          aria-label="Back"
        >
          <MaterialSymbol name="arrow_back" size={20} />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div
              className="h-8 w-8 rounded-full object-cover border-2 border-white dark:border-[#230f16] bg-center bg-no-repeat bg-cover"
              style={{ backgroundImage: `url("${userAvatar}")` }}
              aria-label={`${userName} avatar`}
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background-light dark:border-background-dark" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white truncate leading-tight">
              {userName}
            </h2>
            <p className="text-[10px] text-gray-500 dark:text-[#cc8ea3] leading-tight">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Coin Balance */}
        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-700/50">
          <MaterialSymbol name="monetization_on" filled size={14} className="text-yellow-600 dark:text-gold" />
          <span className="text-[10px] font-bold text-yellow-800 dark:text-gold">
            {(coinBalance || 0).toLocaleString()}
          </span>
        </div>

        {/* More Options Button */}
        <button
          onClick={onMoreClick}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95 shrink-0"
          aria-label="More options"
        >
          <MaterialSymbol name="more_vert" size={20} />
        </button>
      </div>
    </header>
  );
};


