import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';

interface ChatWindowHeaderProps {
  userName: string;
  userAvatar: string;
  isOnline: boolean;
  onMoreClick?: () => void;
}

export const ChatWindowHeader = ({
  userName,
  userAvatar,
  isOnline,
  onMoreClick,
}: ChatWindowHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5 z-10">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95 shrink-0"
          aria-label="Back"
        >
          <MaterialSymbol name="arrow_back" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div
              className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-[#230f16] bg-center bg-no-repeat bg-cover"
              style={{ backgroundImage: `url("${userAvatar}")` }}
              aria-label={`${userName} avatar`}
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background-light dark:border-background-dark" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {userName}
            </h2>
            <p className="text-xs text-gray-500 dark:text-[#cc8ea3]">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* More Options Button */}
      <button
        onClick={onMoreClick}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95 shrink-0 ml-2"
        aria-label="More options"
      >
        <MaterialSymbol name="more_vert" />
      </button>
    </header>
  );
};


