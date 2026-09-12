import { MaterialSymbol } from '../types/material-symbol';
import type { Chat } from '../types/male.types';

interface IntimacyInfo {
  level: number;
  badge: string;
  progress: number;
  messagesToNextLevel: number;
}

interface ChatListItemProps {
  chat: Chat & { intimacy?: IntimacyInfo };
  onClick?: (chatId: string) => void;
  showIntimacy?: boolean;
}

export const ChatListItem = ({ chat, onClick, showIntimacy = false }: ChatListItemProps) => {
  const handleClick = () => {
    onClick?.(chat.id);
  };

  const getMessagePreview = () => {
    if (chat.messageType === 'image' || chat.messageType === 'photo') {
      return (
        <span className="text-[13px] font-bold text-pink-600 flex items-center gap-1.5 truncate">
          <MaterialSymbol name="photo_camera" size={16} filled className="text-pink-500 shrink-0" />
          Photo
        </span>
      );
    }
    if (chat.messageType === 'gift') {
      return (
        <span className="text-[13px] font-bold text-amber-600 flex items-center gap-1.5 truncate">
          <MaterialSymbol name="featured_seasonal_and_gifts" size={16} filled className="text-amber-500 shrink-0" />
          Gift
        </span>
      );
    }
    return (
      <p
        className={`text-[13px] truncate leading-snug ${
          chat.hasUnread
            ? 'font-bold text-slate-900'
            : 'font-medium text-slate-500'
        }`}
      >
        {chat.lastMessage || 'Tap to start chatting'}
      </p>
    );
  };

  const getReadStatusIcon = () => {
    if (!chat.readStatus) return null;
    if (chat.readStatus === 'read') {
      return (
        <MaterialSymbol
          name="done_all"
          size={16}
          className="text-pink-600"
        />
      );
    }
    if (chat.readStatus === 'delivered') {
      return (
        <MaterialSymbol
          name="done_all"
          size={16}
          className="text-slate-400"
        />
      );
    }
    return (
      <MaterialSymbol
        name="done"
        size={16}
        className="text-slate-400"
      />
    );
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer mb-2.5 active:scale-[0.98] ${
        chat.hasUnread
          ? 'bg-white shadow-sm border border-pink-200/90 ring-1 ring-pink-500/10'
          : 'bg-white hover:bg-pink-50/30 shadow-xs border border-pink-100/60 hover:border-pink-200'
      }`}
    >
      {/* Left indicator bar for unread */}
      {chat.hasUnread && (
        <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-gradient-to-b from-pink-500 via-rose-500 to-indigo-600 rounded-r-full shadow-xs" />
      )}

      {/* Avatar Container */}
      <div className="relative shrink-0">
        <div
          className={`size-14 rounded-2xl p-[2px] transition-transform duration-300 group-hover:scale-105 ${
            chat.isVIP
              ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-sm'
              : chat.hasUnread || chat.isOnline
                ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 shadow-sm'
                : 'bg-slate-200'
          }`}
        >
          <img
            src={chat.userAvatar || 'https://via.placeholder.com/56'}
            alt={chat.userName}
            className="w-full h-full rounded-[14px] object-cover bg-slate-100"
            loading="lazy"
          />
        </div>

        {/* Live Online Dot */}
        {chat.isOnline && (
          <span
            className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs ring-1 ring-emerald-400/40 z-10"
            title="Online"
          />
        )}

        {/* VIP Star Icon Badge */}
        {chat.isVIP && (
          <div className="absolute -top-1 -right-1 size-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs border-2 border-white z-10">
            <MaterialSymbol name="star" size={12} filled className="text-amber-950" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Name + Badges + Timestamp */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h4
              className={`text-[15px] truncate ${
                chat.hasUnread
                  ? 'font-black text-slate-900'
                  : 'font-bold text-slate-800'
              }`}
            >
              {chat.userName}
            </h4>

            {/* Intimacy Tag Badge */}
            {showIntimacy && chat.intimacy && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-pink-50 text-pink-600 border border-pink-100 shrink-0 flex items-center gap-1">
                <MaterialSymbol name="favorite" size={11} filled className="text-pink-500" />
                Lv.{chat.intimacy.level}
              </span>
            )}

            {/* Distance */}
            {chat.distance && (
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                • {chat.distance}
              </span>
            )}
          </div>

          {/* Timestamp */}
          <span
            className={`text-[11px] shrink-0 ml-2 font-bold ${
              chat.hasUnread
                ? 'text-pink-600'
                : 'text-slate-400'
            }`}
          >
            {chat.timestamp}
          </span>
        </div>

        {/* Row 2: Message Preview + Unread Count / Read Status */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex-1 min-w-0">
            {getMessagePreview()}
          </div>

          <div className="shrink-0 flex items-center">
            {chat.hasUnread && chat.unreadCount ? (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </span>
            ) : (
              getReadStatusIcon()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
