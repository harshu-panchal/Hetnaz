import { MaterialSymbol } from '../types/material-symbol';
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
    <div
      onClick={handleClick}
      className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer mb-1 active:scale-[0.98]"
    >
      <div className="relative shrink-0">
        <div
          className="h-14 w-14 rounded-full object-cover border-2 border-white dark:border-[#230f16] bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url("${chat.userAvatar}")` }}
          aria-label={`${chat.userName} portrait`}
        />
        {chat.isOnline && (
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#230f16] z-10" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
            {chat.userName}
          </h4>
          <span className="text-xs shrink-0 ml-2 text-gray-500 dark:text-[#cc8ea3]">
            {chat.timestamp}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p
            className={`text-sm truncate pr-4 ${
              chat.hasUnread
                ? 'font-semibold text-gray-800 dark:text-gray-200'
                : 'font-normal text-gray-500 dark:text-gray-400'
            }`}
          >
            {chat.lastMessage}
          </p>
          {chat.hasUnread && chat.unreadCount ? (
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary shrink-0 ml-2">
              <span className="text-[10px] font-bold text-white">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};


