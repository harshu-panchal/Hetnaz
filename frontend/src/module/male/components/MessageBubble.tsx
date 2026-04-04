import { MaterialSymbol } from '../types/material-symbol';
import type { Message } from '../types/male.types';
import { format } from 'date-fns';
import { GiftMessageBubble } from './GiftMessageBubble';

interface MessageBubbleProps {
  message: Message;
  onImageClick?: (imageUrl: string) => void;
  onProfileClick?: (userId: string) => void;
}

export const MessageBubble = ({ message, onImageClick, onProfileClick }: MessageBubbleProps) => {
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
      <div className={`flex items-end gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'} mb-3 px-4`}>
        {/* Avatar */}
        <div 
          className={`shrink-0 mb-5 ${!isSent ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={() => {
            if (!isSent && onProfileClick) {
              const uId = typeof message.senderId === 'object' ? (message.senderId as any)._id || (message.senderId as any).id : message.senderId;
              onProfileClick(uId);
            }
          }}
        >
          <img
            src={message.senderAvatar || 'https://via.placeholder.com/40'}
            alt=""
            className="w-7 h-7 rounded-full object-cover border border-white/20 dark:border-white/5 shadow-sm"
          />
        </div>

        <div className={`flex flex-col max-w-[75%] ${isSent ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${isSent
              ? 'bg-primary rounded-tr-sm'
              : 'bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-tl-sm border border-white/40 dark:border-white/5'
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
    <div className={`flex items-end gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'} mb-1.5 px-3 group transition-all duration-300`}>
      {/* Avatar - Only for received messages */}
      {!isSent && (
        <div 
          className="shrink-0 mb-0.5 cursor-pointer hover:opacity-80 transition-opacity self-end pb-1"
          onClick={() => {
            if (onProfileClick) {
              const uId = typeof message.senderId === 'object' ? (message.senderId as any)._id || (message.senderId as any).id : message.senderId;
              onProfileClick(uId);
            }
          }}
        >
          <img
            src={message.senderAvatar || 'https://via.placeholder.com/40'}
            alt=""
            className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-white/10 shadow-sm"
          />
        </div>
      )}

      <div className={`flex flex-col max-w-[82%] ${isSent ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-[1.4rem] px-4 py-2 shadow-sm transition-all hover:brightness-110 ${isSent
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-white dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white rounded-tl-none border border-gray-200 dark:border-white/10 shadow-sm'
            }`}
        >
          <p className="text-[14.5px] leading-snug whitespace-pre-wrap break-words font-medium">
            {message.content}
          </p>
        </div>
        
        {/* Alignment-aware timestamp + ticks */}
        <div className={`flex items-center gap-1.5 mt-1 pb-1 transition-opacity duration-300 ${isSent ? 'mr-1' : 'ml-1'}`}>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500/80">{time}</span>
          {getReadStatusIcon()}
        </div>
      </div>
    </div>
  );
};

