import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { ImageModal } from '../../../shared/components/ImageModal';
import { useState } from 'react';

interface ProfileHeaderProps {
  user: {
    name: string;
    avatar: string;
    isPremium: boolean;
    isOnline: boolean;
  };
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const { unreadCount } = useGlobalState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 pt-12 pb-3 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div
            className="size-[72px] rounded-full relative z-10 overflow-hidden shadow-2xl transition-transform active:scale-95 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <div
              className="size-full rounded-full bg-center bg-no-repeat bg-cover"
              style={{ backgroundImage: `url("${user.avatar}")` }}
              aria-label={`${user.name}'s profile avatar`}
            />
          </div>
          {user.isOnline && (
            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-[#0a0a0a] z-20 shadow-lg shadow-green-500/20" />
          )}
        </div>
        
        <div className="flex flex-col justify-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {user.name}
            {user.isPremium && (
              <span className="inline-flex items-center ml-1.5 align-middle">
                <MaterialSymbol name="verified" size={16} className="text-blue-500" filled />
              </span>
            )}
          </h1>
          <div className="flex items-center gap-1.5 px-0.5">
             <div className={`size-1.5 rounded-full ${user.isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {user.isOnline ? 'Online Now' : 'Offline'}
             </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/female/notifications')}
          className="skeuo-button relative size-10 rounded-xl flex items-center justify-center transition-all active:scale-90 bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 group"
        >
          <MaterialSymbol name="notifications" size={22} className="text-slate-600 dark:text-slate-300 group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 size-4 rounded-full bg-pink-500 border-2 border-white dark:border-[#0a0a0a] flex items-center justify-center shadow-lg shadow-pink-500/20">
              <span className="text-[8px] font-black text-white leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </button>
      </div>

      <ImageModal
        isOpen={isModalOpen}
        imageUrl={user.avatar}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};



