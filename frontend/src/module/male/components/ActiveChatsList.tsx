import React from "react";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import { useTranslation } from "../../../core/hooks/useTranslation";

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
  isLoading?: boolean;
  onChatClick?: (chatId: string) => void;
  onSeeAllClick?: () => void;
}

const ChatItem = ({
  chat,
  onClick,
  sayHiPlaceholder,
}: {
  chat: Chat;
  onClick?: () => void;
  sayHiPlaceholder: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3.5 px-4 py-3.5 transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 active:scale-[0.99] text-left group ${
        chat.hasUnread ? "bg-pink-50/30 dark:bg-pink-950/10" : ""
      }`}>
      {/* Avatar with Online Dot */}
      <div className="relative shrink-0">
        <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800">
          <img
            src={chat.userAvatar || "https://via.placeholder.com/100?text=?"}
            alt={chat.userName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        {chat.isOnline && (
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        {/* Name + Distance + Time */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate group-hover:text-pink-600 transition-colors">
              {chat.userName}
            </span>
            {chat.distance && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 text-[10px] font-black shrink-0 leading-none">
                {chat.distance}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
            {chat.timestamp}
          </span>
        </div>

        {/* Message Preview + Unread Status */}
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-[13px] leading-snug line-clamp-1 truncate ${
              chat.hasUnread
                ? "font-bold text-slate-800 dark:text-slate-200"
                : "font-medium text-slate-400 dark:text-slate-500"
            }`}>
            {chat.lastMessage === "Say hi!"
              ? sayHiPlaceholder
              : chat.lastMessage}
          </p>

          {chat.hasUnread && (
            <span className="h-2 w-2 rounded-full bg-pink-500 shrink-0 shadow-sm animate-pulse" />
          )}
        </div>
      </div>

      {/* Subtle chevron affordance */}
      <div className="shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all">
        <MaterialSymbol name="chevron_right" size={20} />
      </div>
    </button>
  );
};

export const ActiveChatsList: React.FC<ActiveChatsListProps> = ({
  chats = [],
  isLoading = false,
  onChatClick,
  onSeeAllClick,
}) => {
  const { t } = useTranslation();
  const unreadCount = chats.filter((c) => c.hasUnread).length;

  return (
    <div className="flex flex-col w-full px-4 mb-4">
      {/* Modern Section Header */}
      <div className="flex items-center justify-between pb-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center text-pink-600 shadow-xs">
            <MaterialSymbol name="chat" size={18} filled />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-900 dark:text-white leading-tight">
              {t("activeConversations") || "Active Conversations"}
            </h2>
            {chats.length > 0 && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {chats.length}
              </span>
            )}
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-white bg-pink-500 px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onSeeAllClick}
          className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-pink-600 hover:text-pink-700 active:scale-95 transition-all">
          <span>{t("seeAll") || "See All"}</span>
          <MaterialSymbol name="arrow_forward" size={14} />
        </button>
      </div>

      {/* Redesigned Card Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/90 dark:border-slate-800 overflow-hidden divide-y divide-slate-100/80 dark:divide-slate-800/80">
        {isLoading && chats.length === 0 ? (
          <div className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="flex items-center gap-3.5 px-4 py-3.5 animate-pulse">
                <div className="w-[52px] h-[52px] rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-3.5 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              sayHiPlaceholder={t("sayHiPlaceholder") || "Say hi!"}
              onClick={() => onChatClick?.(chat.id)}
            />
          ))
        ) : (
          <div className="py-10 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-pink-500 mx-auto mb-2.5">
              <MaterialSymbol name="chat_bubble_outline" size={24} />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t("noConversationsYet") || "No active conversations yet"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Say hi to any of the recommended profiles above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
