import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface Chat {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  hasUnread: boolean;
  distance?: string;
}

interface ActiveChatsListProps {
  chats: Chat[];
  onChatClick?: (chatId: string) => void;
  onSeeAllClick?: () => void;
}

const ChatItem = ({ chat, onClick, sayHiPlaceholder }: { chat: Chat; onClick?: () => void; sayHiPlaceholder: string }) => {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 px-5 py-4 transition-all duration-300 active:scale-[0.98] border-b border-white/10 dark:border-white/5 group first:rounded-t-[2rem] last:rounded-b-[2rem] last:border-b-0 ${chat.hasUnread ? 'bg-primary/[0.03]' : ''}`}
    >
      {/* Premium Avatar with Skeuomorphic Frame */}
      <div className="relative shrink-0">
        <div className="h-16 w-16 rounded-full skeuo-card p-1 shadow-lg group-hover:scale-105 transition-transform duration-300">
           <div 
             className="w-full h-full rounded-full bg-cover bg-center border-2 border-white/60"
             style={{ backgroundImage: `url("${chat.userAvatar}")` }}
           />
        </div>
        {chat.isOnline && (
          <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-black shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-center text-left min-w-0">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <p className="text-slate-900 dark:text-white text-[15px] font-black tracking-tight leading-none truncate group-hover:text-primary transition-colors">
              {chat.userName}
            </p>
            {chat.distance && (
              <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                <span className="text-[8px] font-black uppercase tracking-widest text-primary">
                   {chat.distance}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0 ml-4">
             <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
               {chat.timestamp}
             </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className={`text-[12px] leading-snug line-clamp-1 flex-1 min-w-0 ${chat.hasUnread ? 'font-bold text-slate-700 dark:text-slate-300' : 'font-medium text-slate-400 dark:text-slate-500'}`}>
            {chat.lastMessage === 'Say hi!' ? sayHiPlaceholder : chat.lastMessage}
          </p>
          {chat.hasUnread && (
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,77,109,0.5)] shrink-0" />
          )}
        </div>
      </div>

      {/* Invisible Chevron for Affordance */}
      <MaterialSymbol name="chevron_right" size={20} className="text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  );
};

export const ActiveChatsList = ({ chats, onChatClick, onSeeAllClick }: ActiveChatsListProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full px-4 mb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-5 pt-2">
        <div className="flex items-center gap-3">
          <div className="skeuo-inset size-9 rounded-xl flex items-center justify-center">
            <MaterialSymbol name="chat_bubble" className="text-primary drop-shadow-[0_2px_8px_rgba(255,77,109,0.3)]" size={20} filled />
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">
            {t('activeConversations')}
          </h2>
        </div>
        <button
          onClick={onSeeAllClick}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:scale-105 transition-transform"
        >
          {t('seeAll')}
        </button>
      </div>

      {/* List Container */}
      <div className="skeuo-card rounded-[2.25rem] overflow-hidden shadow-2xl border-white/20 dark:border-white/5">
        {chats.length > 0 ? (
          <div className="flex flex-col">
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                sayHiPlaceholder={t('sayHiPlaceholder')}
                onClick={() => onChatClick?.(chat.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 px-6 text-center bg-mesh-glass opacity-40">
             <MaterialSymbol name="forum" size={40} className="text-slate-300 dark:text-slate-700 mb-2 mx-auto" />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {t('No Active Conversations')}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};
