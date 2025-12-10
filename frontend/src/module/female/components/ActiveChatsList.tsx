import { MaterialSymbol } from '../types/material-symbol';
import type { Chat } from '../types/female.types';

interface ActiveChatsListProps {
  chats: Chat[];
  onChatClick?: (chatId: string) => void;
  onSeeAllClick?: () => void;
}

const ChatItem = ({ chat, onClick }: { chat: Chat; onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 border-b border-slate-200 dark:border-slate-800/50 bg-background-light dark:bg-background-dark px-4 py-3 active:bg-slate-100 dark:active:bg-[#2a2515] hover:bg-slate-50 dark:hover:bg-[#2a2515]/80 transition-colors"
    >
      <div className="relative">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14"
          style={{ backgroundImage: `url("${chat.userAvatar}")` }}
          aria-label={`Portrait of ${chat.userName}`}
        />
        {chat.isOnline && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background-light dark:border-background-dark" />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center text-left">
        <div className="flex justify-between items-center mb-0.5">
          <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">
            {chat.userName}
          </p>
          <p className="text-slate-400 dark:text-[#cbbc90] text-xs font-normal">
            {chat.timestamp}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal line-clamp-1 flex-1">
            {chat.lastMessage}
          </p>
          {chat.hasUnread && (
            <div className="h-2 w-2 rounded-full bg-primary shrink-0 ml-auto" />
          )}
        </div>
      </div>
    </button>
  );
};

export const ActiveChatsList = ({ chats, onChatClick, onSeeAllClick }: ActiveChatsListProps) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between px-4 pb-2 pt-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Chats</h2>
        <button
          onClick={onSeeAllClick}
          className="text-sm font-medium text-primary hover:text-yellow-300 transition-colors"
        >
          See All
        </button>
      </div>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          onClick={() => onChatClick?.(chat.id)}
        />
      ))}
    </div>
  );
};


