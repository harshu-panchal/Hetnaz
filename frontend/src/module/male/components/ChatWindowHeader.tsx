import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';

interface IntimacyInfo {
  level: number;
  badge: string;
  progress: number;
  messagesToNextLevel: number;
}

interface ChatWindowHeaderProps {
  userName: string;
  userAvatar: string;
  isOnline: boolean;
  isVIP?: boolean;
  coinBalance?: number;
  intimacy?: IntimacyInfo | null;
  onMoreClick?: () => void;
  onBackClick?: () => void;
  onVideoCall?: () => void;
  showVideoCall?: boolean;
}

export const ChatWindowHeader = ({
  userName,
  userAvatar,
  isOnline,
  isVIP,
  coinBalance,
  intimacy,
  onMoreClick,
  onBackClick,
  onVideoCall,
  showVideoCall = false,
}: ChatWindowHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  // Get intimacy badge color
  const getIntimacyColor = (level: number) => {
    if (level <= 1) return 'from-gray-400 to-gray-500';
    if (level === 2) return 'from-blue-400 to-blue-500';
    if (level === 3) return 'from-green-400 to-green-500';
    if (level === 4) return 'from-pink-400 to-pink-500';
    if (level === 5) return 'from-purple-400 to-purple-500';
    if (level === 6) return 'from-red-400 to-red-500';
    if (level >= 7) return 'from-amber-400 to-yellow-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <header className="flex flex-col bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5 z-10">
      {/* Main Header Row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95 shrink-0"
            aria-label="Back"
          >
            <MaterialSymbol name="arrow_back" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              {isVIP && (
                <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-gold to-yellow-600 opacity-80" />
              )}
              <img
                alt={`${userName} avatar`}
                className={`h-10 w-10 rounded-full object-cover border-2 border-white dark:border-[#230f16] ${isVIP ? 'relative' : ''
                  }`}
                src={userAvatar || 'https://via.placeholder.com/40'}
              />
              {isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background-light dark:border-background-dark" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {userName}
                </h2>
                {isVIP && (
                  <MaterialSymbol name="star" filled size={16} className="text-gold shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 dark:text-[#cc8ea3]">
                  {isOnline ? 'Online' : 'Offline'}
                </p>
                {/* Intimacy Badge */}
                {intimacy && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold text-white rounded-full bg-gradient-to-r ${getIntimacyColor(intimacy.level)}`}>
                    {intimacy.badge.split(' ')[0]} Lv.{intimacy.level}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coin Balance */}
        {coinBalance !== undefined && (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-full mr-2">
            <span className="text-lg">🪙</span>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
              {coinBalance.toLocaleString()}
            </span>
          </div>
        )}

        {/* Video Call Button */}
        {showVideoCall && onVideoCall && (
          <button
            onClick={onVideoCall}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all active:scale-95 shrink-0 mr-2 shadow-md"
            aria-label="Video Call"
            title="Start Video Call (500 coins)"
          >
            <MaterialSymbol name="videocam" size={20} />
          </button>
        )}

        {/* More Options Button */}
        <button
          onClick={onMoreClick}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95 shrink-0"
          aria-label="More options"
        >
          <MaterialSymbol name="more_vert" />
        </button>
      </div>

      {/* Intimacy Progress Bar */}
      {intimacy && intimacy.level < 10 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getIntimacyColor(intimacy.level)} transition-all duration-500`}
                style={{ width: `${intimacy.progress}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 shrink-0 min-w-[60px] text-right">
              {intimacy.messagesToNextLevel} to Lv.{intimacy.level + 1}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
