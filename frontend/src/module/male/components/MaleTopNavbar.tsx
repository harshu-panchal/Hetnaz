import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useGlobalState } from '../../../core/context/GlobalStateContext';

interface MaleTopNavbarProps {
  title?: string;
}

export const MaleTopNavbar = ({ title }: MaleTopNavbarProps) => {
  const navigate = useNavigate();
  const { unreadCount } = useGlobalState();

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-pink-50/95 via-rose-50/95 to-pink-50/95 dark:from-[#1a0f14]/95 dark:via-[#2d1a24]/95 dark:to-[#1a0f14]/95 backdrop-blur-lg border-b border-pink-200/50 dark:border-pink-900/30 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo or Title */}
        {title ? (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="p-1 shadow-md overflow-hidden bg-white">
              <img src="/Hetnaz.png" alt="HETNAZ" className="w-8 h-8 object-cover" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent">HETNAZ</span>
          </div>
        )}

        {/* Notifications Icon (Replaced Hamburger) */}
        <button
          onClick={() => navigate('/male/notifications')}
          className="relative flex items-center justify-center size-10 rounded-xl hover:bg-pink-100/50 dark:hover:bg-pink-900/20 transition-colors active:scale-95"
          aria-label="Notifications"
        >
          <MaterialSymbol name="notifications" size={24} className="text-pink-700 dark:text-pink-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white dark:border-[#2d1a24] shadow-sm animate-in zoom-in-50 duration-200">
              {unreadCount > 10 ? '10+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

