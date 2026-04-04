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
  isVerified?: boolean;
  coinBalance?: number;
  intimacy?: IntimacyInfo | null;
  onMoreClick?: () => void;
  onBackClick?: () => void;
  onVideoCall?: () => void;
  onUserInfoClick?: () => void;
  showVideoCall?: boolean;
}

export const ChatWindowHeader = ({
  userName,
  userAvatar,
  isOnline,
  isVerified,

  intimacy,
  onMoreClick,
  onBackClick,
  onVideoCall,
  onUserInfoClick,
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
    <header className="flex flex-col bg-white/70 dark:bg-black/40 backdrop-blur-md z-20 sticky top-0 border-b border-white/20 dark:border-white/5 shadow-sm pt-4">
      {/* Main Header Row */}
      <div className="flex items-center justify-between px-3 py-2 h-16">
        {/* Left Side: Back + User Info (Reverted to left-aligned) */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={handleBack}
            className="flex items-center justify-center p-2 text-gray-800 dark:text-white active:opacity-50 transition-all hover:scale-110"
            aria-label="Back"
          >
            <MaterialSymbol name="arrow_back" size={24} />
          </button>

          <button
            onClick={onUserInfoClick}
            className="flex items-center gap-3 min-w-0 active:opacity-70 transition-opacity"
          >
            <div className="relative shrink-0">
              <img
                alt={`${userName} avatar`}
                className="h-10 w-10 rounded-full object-cover border-[1.5px] border-white dark:border-white/10 shadow-sm"
                src={userAvatar || 'https://via.placeholder.com/40'}
              />
              {isOnline && (
                <div className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-[#1a0f14]" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {userName}
                </h2>
                {intimacy && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-gradient-to-r ${getIntimacyColor(intimacy.level)}`}>
                    Lv.{intimacy.level}
                  </span>
                )}
                {isVerified && (
                  <MaterialSymbol name="verified" filled size={16} className="text-blue-500" />
                )}
              </div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {isOnline ? 'Active now' : 'Active some time ago'}
              </p>
            </div>
          </button>
        </div>

        {/* Right Side: Action Icons */}
        <div className="flex items-center gap-1">
          {/* Video Call */}
          {showVideoCall && onVideoCall && (
            <button
              onClick={onVideoCall}
              className="p-2.5 text-gray-700 dark:text-white active:opacity-50 hover:scale-110 transition-transform"
              aria-label="Video Call"
            >
              <MaterialSymbol name="videocam" size={24} />
            </button>
          )}

          {/* Info */}
          <button
            onClick={onMoreClick}
            className="p-2.5 text-gray-700 dark:text-white active:opacity-50 hover:scale-110 transition-transform"
            aria-label="Info"
          >
            <MaterialSymbol name="info" size={22} />
          </button>
        </div>
      </div>

      {/* Intimacy Progress Bar (Very thin, Instagram-like subtle loader) */}
      {intimacy && intimacy.level < 10 && (
        <div className="w-full absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100 dark:bg-gray-800/30 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getIntimacyColor(intimacy.level)} transition-all duration-700 ease-out`}
            style={{ width: `${intimacy.progress}%` }}
          />
        </div>
      )}
    </header>
  );
};
