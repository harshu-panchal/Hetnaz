import { MaterialSymbol } from '../types/material-symbol';
import type { Message } from '../types/male.types';
import { format } from 'date-fns';
import { GiftMessageBubble } from './GiftMessageBubble';

interface MessageBubbleProps {
  message: Message;
  onImageClick?: (imageUrl: string) => void;
}

export const MessageBubble = ({ message, onImageClick }: MessageBubbleProps) => {
  const isSent = message.isSent;
  const time = format(message.timestamp, 'h:mm a');

  // Handle gift messages
  if (message.type === 'gift' && message.gifts && message.gifts.length > 0) {
    return (
      <GiftMessageBubble
        gifts={message.gifts.map((g: any) => ({
          ...g,
          id: g.id || g.giftId,
          name: g.name || g.giftName,
          cost: g.cost || g.giftCost,
          imageUrl: g.imageUrl || g.giftImage
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

    if (message.readStatus === 'read') {
      return (
        <MaterialSymbol
          name="done_all"
          size={14}
          className="text-primary ml-1 shrink-0"
        />
      );
    }
    if (message.readStatus === 'delivered') {
      return (
        <MaterialSymbol
          name="done_all"
          size={14}
          className="text-gray-400 dark:text-gray-600 ml-1 shrink-0"
        />
      );
    }
    return (
      <MaterialSymbol
        name="done"
        size={14}
        className="text-gray-400 dark:text-gray-600 ml-1 shrink-0"
      />
    );
  };

  if (message.type === 'image' || message.type === 'photo') {
    // Get image URL from attachments or fallback to content
    const imageUrl = (message as any).attachments?.[0]?.url || message.content;

    return (
      <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
        <div className={`flex flex-col max-w-[75%] ${isSent ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${isSent
              ? 'bg-primary rounded-tr-sm'
              : 'bg-white dark:bg-[#342d18] rounded-tl-sm'
              }`}
            onClick={() => onImageClick?.(imageUrl)}
          >
            <img
              src={imageUrl}
              alt="Shared photo"
              className="max-w-full h-auto max-h-64 object-cover"
            />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-gray-500 dark:text-[#cc8ea3]">{time}</span>
            {getReadStatusIcon()}
            {message.cost && (
              <span className="text-[10px] text-gray-500 dark:text-[#cc8ea3] ml-1">
                • {message.cost} coins
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
      <div className={`flex flex-col max-w-[75%] ${isSent ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 ${isSent
            ? 'bg-primary text-white rounded-tr-sm'
            : 'bg-white dark:bg-[#342d18] text-gray-900 dark:text-white rounded-tl-sm'
            }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] text-gray-500 dark:text-[#cc8ea3]">{time}</span>
          {getReadStatusIcon()}
          {message.cost && (
            <span className="text-[10px] text-gray-500 dark:text-[#cc8ea3] ml-1">
              • {message.cost} coins
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

