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
    <header className="sticky top-0 z-50 flex items-center justify-between px-3 pt-4 pb-2 bg-brand-gradient shadow-header rounded-b-[1.75rem] transition-all duration-300">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={handleBack}
          className="size-9 rounded-full flex items-center justify-center bg-white/25 text-white active:scale-95 transition-all shrink-0"
          aria-label="Back"
        >
          <MaterialSymbol name="arrow_back_ios_new" size={16} />
        </button>

        <button
          onClick={onUserInfoClick}
          className="flex items-center gap-3 flex-1 min-w-0 text-left active:opacity-70 transition-opacity group"
        >
          <div className="relative shrink-0">
            <img
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white/60 group-hover:scale-105 transition-transform"
              src={userAvatar}
              alt=""
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#ff4d6d]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[15px] font-black text-white truncate leading-tight tracking-tight">
                {userName}
              </h2>
              {isVerified && (
                 <MaterialSymbol name="verified" filled size={16} className="text-white" />
              )}
            </div>
            <p className="text-[10px] font-bold text-white/85 leading-tight flex items-center gap-1 uppercase tracking-widest mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-white' : 'bg-white/40'}`} />
              {isOnline ? t('activeNow') : t('offline')}
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-coin-gradient py-1.5 px-3 rounded-full shadow-cta">
          <MaterialSymbol name="payments" size={16} filled className="text-[#7a4400]" />
          <span className="text-[11px] font-black text-[#7a4400] tracking-tighter">
            ₹{(coinBalance || 0).toLocaleString()}
          </span>
        </div>

        <button
          onClick={onMoreClick}
          className="size-9 rounded-full flex items-center justify-center bg-white/25 text-white active:scale-95 transition-all shrink-0"
          aria-label="More options"
        >
          <MaterialSymbol name="more_horiz" size={22} />
        </button>
      </div>
    </header>
  );
};
