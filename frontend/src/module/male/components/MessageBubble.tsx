import { MaterialSymbol } from "../types/material-symbol";
import type { Message } from "../types/male.types";
import { format } from "date-fns";
import { GiftMessageBubble } from "./GiftMessageBubble";

interface MessageBubbleProps {
  message: Message;
  onImageClick?: (imageUrl: string) => void;
  onProfileClick?: (userId: string) => void;
  onFailedClick?: (message: Message) => void;
}

export const MessageBubble = ({
  message,
  onImageClick,
  onProfileClick,
  onFailedClick,
}: MessageBubbleProps) => {
  const isSent = message.isSent;
  const isFailed = isSent && message.readStatus === "failed";
  const isSending = isSent && message.readStatus === "sending";
  const time = format(message.timestamp, "h:mm a");

  // Handle gift messages
  if (message.type === "gift" && message.gifts && message.gifts.length > 0) {
    return (
      <GiftMessageBubble
        gifts={message.gifts.map((g: any) => ({
          ...g,
          id: g.id || g.giftId,
          name: g.name || g.giftName,
          cost: g.cost || g.giftCost,
          imageUrl: g.imageUrl || g.giftImage,
        }))}
        note={message.giftNote}
        timestamp={message.timestamp}
        isSent={isSent}
        readStatus={message.readStatus}
        cost={message.cost}
      />
    );
  }

  const getReadStatusIcon = () => {
    if (!isSent || !message.readStatus) return null;

    if (isFailed) {
      return (
        <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 ml-1">
          <MaterialSymbol
            name="error"
            size={12}
            filled
            className="text-red-500"
          />
          <span>Not sent</span>
        </span>
      );
    }

    if (isSending) {
      return (
        <MaterialSymbol
          name="schedule"
          size={12}
          className="text-muted-light animate-spin ml-1 shrink-0"
        />
      );
    }

    if (message.readStatus === "read") {
      return (
        <MaterialSymbol
          name="done_all"
          size={14}
          className="text-pink-600 ml-1 shrink-0"
        />
      );
    }
    if (message.readStatus === "delivered") {
      return (
        <MaterialSymbol
          name="done_all"
          size={14}
          className="text-muted-light ml-1 shrink-0"
        />
      );
    }
    return (
      <MaterialSymbol
        name="done"
        size={14}
        className="text-muted-light ml-1 shrink-0"
      />
    );
  };

  if (message.type === "image" || message.type === "photo") {
    // Get image URL from attachments or fallback to content
    const imageUrl = (message as any).attachments?.[0]?.url || message.content;

    return (
      <div
        className={`flex items-end gap-2 ${isSent ? "flex-row-reverse" : "flex-row"} mb-3 px-4`}>
        {/* Avatar */}
        <div
          className={`shrink-0 mb-5 ${!isSent ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
          onClick={() => {
            if (!isSent && onProfileClick) {
              const uId =
                typeof message.senderId === "object"
                  ? (message.senderId as any)._id ||
                    (message.senderId as any).id
                  : message.senderId;
              onProfileClick(uId);
            }
          }}>
          <img
            src={message.senderAvatar || "https://via.placeholder.com/40"}
            alt=""
            className="w-7 h-7 rounded-full object-cover border border-white shadow-sm"
          />
        </div>

        {/* Failed Alert Button next to image */}
        {isFailed && (
          <button
            type="button"
            onClick={() => onFailedClick?.(message)}
            className="self-center size-8 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-500 flex items-center justify-center hover:bg-red-200 active:scale-90 transition-all shrink-0 cursor-pointer shadow-sm"
            title="Message not sent. Tap to retry or delete.">
            <MaterialSymbol name="error" size={20} filled />
          </button>
        )}

        <div
          className={`flex flex-col max-w-[75%] ${isSent ? "items-end" : "items-start"}`}>
          <div
            className={`rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
              isFailed
                ? "border-2 border-red-400 opacity-90"
                : isSent
                  ? "bg-cta-gradient rounded-tr-sm"
                  : "bg-[#f2e4da] shadow-sm rounded-tl-sm"
            }`}
            onClick={() => {
              if (isFailed) {
                onFailedClick?.(message);
              } else {
                onImageClick?.(imageUrl);
              }
            }}>
            <img
              src={imageUrl}
              alt="Shared photo"
              className="max-w-full h-auto max-h-64 object-cover"
            />
          </div>
          <div
            className={`flex items-center gap-1 mt-1 ${isFailed ? "cursor-pointer" : ""}`}
            onClick={() => isFailed && onFailedClick?.(message)}>
            <span className="text-[10px] text-muted-light">{time}</span>
            {getReadStatusIcon()}
            {message.cost && (
              <span className="text-[10px] text-muted-light ml-1">
                • {message.cost} coins
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-end gap-2 ${isSent ? "flex-row-reverse" : "flex-row"} mb-1.5 px-3 group transition-all duration-300`}>
      {/* Avatar - Only for received messages */}
      {!isSent && (
        <div
          className="shrink-0 mb-0.5 cursor-pointer hover:opacity-80 transition-opacity self-end pb-1"
          onClick={() => {
            if (onProfileClick) {
              const uId =
                typeof message.senderId === "object"
                  ? (message.senderId as any)._id ||
                    (message.senderId as any).id
                  : message.senderId;
              onProfileClick(uId);
            }
          }}>
          <img
            src={message.senderAvatar || "https://via.placeholder.com/40"}
            alt=""
            className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
          />
        </div>
      )}

      {/* Alert Icon button for failed message — displayed right beside the bubble */}
      {isFailed && (
        <button
          type="button"
          onClick={() => onFailedClick?.(message)}
          className="self-center size-8 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-500 flex items-center justify-center hover:bg-red-200 active:scale-90 transition-all shrink-0 cursor-pointer shadow-sm"
          title="Message not sent. Tap to retry or delete."
          aria-label="Message not sent">
          <MaterialSymbol
            name="error"
            size={20}
            filled
            className="text-red-500"
          />
        </button>
      )}

      <div
        className={`flex flex-col max-w-[82%] ${isSent ? "items-end" : "items-start"}`}>
        <div
          onClick={() => isFailed && onFailedClick?.(message)}
          className={`rounded-[1.4rem] px-4 py-2.5 transition-all ${
            isFailed
              ? "bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 text-white rounded-tr-none shadow-md cursor-pointer border border-red-400/60"
              : isSent
                ? "bg-cta-gradient text-white rounded-tr-none shadow-cta"
                : "bg-[#f2e4da] shadow-sm text-ink rounded-tl-none"
          }`}>
          <p className="text-[14.5px] leading-snug whitespace-pre-wrap break-words font-medium">
            {message.content}
          </p>
        </div>

        {/* Alignment-aware timestamp + ticks */}
        <div
          className={`flex items-center gap-1.5 mt-1 pb-1 transition-opacity duration-300 ${isSent ? "mr-1" : "ml-1"} ${
            isFailed ? "cursor-pointer" : ""
          }`}
          onClick={() => isFailed && onFailedClick?.(message)}>
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-light">
            {time}
          </span>
          {getReadStatusIcon()}
        </div>
      </div>
    </div>
  );
};
