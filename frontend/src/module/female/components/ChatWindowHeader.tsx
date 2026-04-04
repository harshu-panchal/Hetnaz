import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface ChatWindowHeaderProps {
  userName: string;
  userAvatar: string;
  isOnline: boolean;
  isVerified?: boolean;
  onMoreClick?: () => void;
  onUserInfoClick?: () => void;
  onBackClick?: () => void;
  coinBalance?: number;
}

export const ChatWindowHeader = ({
  userName,
  userAvatar,
  isOnline,
  isVerified = false,
  onMoreClick,
  onUserInfoClick,
  onBackClick,
  coinBalance,
}: ChatWindowHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) onBackClick();
    else navigate(-1);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-3 pt-4 pb-2 bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-none transition-all duration-300">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={handleBack}
          className="size-10 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all shrink-0 border border-slate-100"
          aria-label="Back"
        >
          <MaterialSymbol name="arrow_back_ios_new" size={18} />
        </button>

        <button
          onClick={onUserInfoClick}
          className="flex items-center gap-3 flex-1 min-w-0 text-left active:opacity-70 transition-opacity group"
        >
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-rose-400 shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <div
                className="h-full w-full rounded-full border-2 border-white bg-center bg-no-repeat bg-cover"
                style={{ backgroundImage: `url("${userAvatar}")` }}
              />
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[15px] font-black text-slate-800 truncate leading-tight tracking-tight">
                {userName}
              </h2>
              {isVerified && (
                 <MaterialSymbol name="verified" filled size={16} className="text-blue-500" />
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 leading-tight flex items-center gap-1 uppercase tracking-widest mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-200'}`} />
              {isOnline ? t('activeNow') : t('offline')}
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-slate-50 py-1.5 px-3 rounded-full border border-slate-100 backdrop-blur-md">
          <MaterialSymbol name="payments" size={16} filled className="text-amber-500" />
          <span className="text-[11px] font-black text-slate-800 tracking-tighter">
            ₹{(coinBalance || 0).toLocaleString()}
          </span>
        </div>

        <button
          onClick={onMoreClick}
          className="size-10 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all shrink-0 border border-slate-100"
          aria-label="More options"
        >
          <MaterialSymbol name="more_horiz" size={24} />
        </button>
      </div>
    </header>
  );
};
