import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface ChatWindowHeaderProps {
  userName: string;
  userAvatar: string;
  isOnline: boolean;
  onMoreClick?: () => void;
  onUserInfoClick?: () => void;
  onBackClick?: () => void;
  coinBalance?: number;
}

export const ChatWindowHeader = ({
  userName,
  userAvatar,
  isOnline,
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
    <header className="sticky top-0 z-50 flex items-center justify-between px-3 pt-10 pb-2 bg-white/70 backdrop-blur-xl border-b border-slate-100 shadow-none">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={handleBack}
          className="size-10 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 active:scale-95 transition-all shrink-0"
          aria-label="Back"
        >
          <MaterialSymbol name="arrow_back_ios_new" size={20} />
        </button>

        <button
          onClick={onUserInfoClick}
          className="flex items-center gap-3 flex-1 min-w-0 text-left active:opacity-70 transition-opacity"
        >
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-amber-400">
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
            <h2 className="text-[15px] font-black text-slate-800 truncate leading-tight tracking-tight">
              {userName}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 leading-tight flex items-center gap-1 uppercase tracking-widest">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
              {isOnline ? t('activeNow') : t('offline')}
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-slate-50 py-1.5 px-3 rounded-full border border-slate-100 backdrop-blur-md">
          <MaterialSymbol name="payments" size={16} className="text-amber-500" />
          <span className="text-[11px] font-black text-slate-800">
            ₹{(coinBalance || 0).toLocaleString()}
          </span>
        </div>

        <button
          onClick={onMoreClick}
          className="size-10 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 active:scale-95 transition-all shrink-0"
          aria-label="More options"
        >
          <MaterialSymbol name="more_horiz" size={24} />
        </button>
      </div>
    </header>
  );
};
