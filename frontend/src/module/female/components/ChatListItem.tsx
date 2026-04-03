// @ts-nocheck
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { Chat } from '../types/female.types';

interface ChatListItemProps {
  chat: Chat;
  onClick?: (chatId: string) => void;
}

export const ChatListItem = ({ chat, onClick }: ChatListItemProps) => {
  const handleClick = () => {
    onClick?.(chat.id);
  };

  return (
    <button
      onClick={handleClick}
      className={`group flex w-full items-center gap-4 bg-white/40 dark:bg-black/20 backdrop-blur-md px-5 py-4 transition-all duration-300 active:scale-[0.98] border-b border-white/20 dark:border-white/5 first:rounded-t-[2rem] last:rounded-b-[2rem] last:border-b-0 mb-0.5 ${chat.hasUnread ? 'shadow-[inset_0_1px_10px_rgba(255,77,109,0.05)] bg-pink-500/[0.02]' : ''}`}
    >
      {/* Premium Avatar with Skeuomorphic Frame */}
      <div className="relative shrink-0">
        <div className="h-16 w-16 rounded-full skeuo-card p-1 bg-mesh-glass shadow-lg group-hover:scale-105 transition-transform duration-300 border-white/20 dark:border-white/5">
           <div 
             className="w-full h-full rounded-full bg-cover bg-center border-2 border-white/5 dark:border-white/10"
             style={{ backgroundImage: `url("${chat.userAvatar}")` }}
           />
        </div>
        {chat.isOnline && (
          <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-[#230f16] shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-center text-left min-w-0">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h4 className="text-slate-900 dark:text-white text-[15px] font-black tracking-tight leading-none truncate group-hover:text-pink-500 transition-colors">
              {chat.userName}
            </h4>
            {chat.distance && (
              <div className="px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 shrink-0">
                <span className="text-[8px] font-black uppercase tracking-widest text-pink-500">
                   {chat.distance}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0 ml-4">
             <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-[#cc8ea3]">
               {chat.timestamp}
             </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className={`text-[12px] leading-snug line-clamp-1 flex-1 min-w-0 ${chat.hasUnread ? 'font-bold text-slate-700 dark:text-slate-300' : 'font-medium text-slate-400 dark:text-slate-500'}`}>
            {chat.lastMessage}
          </p>
          {chat.hasUnread && (
            <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(255,77,109,0.5)] shrink-0" />
          )}
        </div>
      </div>

      <MaterialSymbol name="chevron_right" size={20} className="text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  );
};


