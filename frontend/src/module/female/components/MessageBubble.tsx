import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { Message } from '../types/female.types';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  onImageClick?: (imageUrl: string) => void;
}

export const MessageBubble = ({ message, onImageClick }: MessageBubbleProps) => {
  const isSent = message.isSent;
  const time = format(message.timestamp, 'h:mm a');

  const getReadStatusIcon = () => {
    if (!isSent || !message.readStatus) return null;

    if (message.readStatus === 'read') {
      return (
        <MaterialSymbol
          name="done_all"
          size={14}
          className="text-pink-500 ml-1 shrink-0"
        />
      );
    }
    if (message.readStatus === 'delivered') {
      return (
        <MaterialSymbol
          name="done_all"
          size={14}
          className="text-slate-300 ml-1 shrink-0"
        />
      );
    }
    return (
      <MaterialSymbol
        name="done"
        size={14}
        className="text-slate-300 ml-1 shrink-0"
      />
    );
  };

  const isImageMessage = message.type === 'image' || message.type === 'photo' || 
                         (message.content && message.content.match(/\.(jpeg|jpg|gif|png)$/) != null) ||
                         (message.content && message.content.startsWith('http') && (message.content.includes('/images/') || message.content.includes('cloudinary')));

  const imageUrl = isImageMessage ? (message.attachments?.[0]?.url || message.content) : null;

  return (
    <div className={`flex items-end gap-2.5 ${isSent ? 'flex-row-reverse' : 'flex-row'} mb-4 px-4 transition-all duration-300`}>
      {/* Avatar - Only for received messages */}
      {!isSent && (
        <div className="shrink-0 mb-1.5 self-end">
          <div className="h-8.5 w-8.5 rounded-full p-[1px] bg-gradient-to-tr from-pink-500/20 to-rose-400/20 ring-1 ring-slate-100 shadow-sm">
             <div 
               className="h-full w-full rounded-full border-2 border-white bg-center bg-no-repeat bg-cover"
               style={{ backgroundImage: `url("${message.senderAvatar || 'https://via.placeholder.com/40'}")` }}
             />
          </div>
        </div>
      )}

      <div className={`flex flex-col max-w-[78%] ${isSent ? 'items-end' : 'items-start'}`}>
        <div
          className={`transition-all outline-none ${isImageMessage 
            ? `p-1 bg-white border border-slate-100 shadow-md rounded-[1.4rem] cursor-pointer hover:opacity-95 ${isSent ? 'rounded-tr-none' : 'rounded-tl-none'}`
            : `px-5 py-2.5 rounded-[1.4rem] shadow-sm ${isSent 
                ? 'bg-pink-500 text-white rounded-tr-none shadow-pink-500/10' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`
          }`}
          onClick={() => isImageMessage && onImageClick?.(imageUrl!)}
        >
          {isImageMessage ? (
            <img
              src={imageUrl!}
              alt="Shared photo"
              className="max-w-full h-auto max-h-72 object-cover rounded-[1.2rem]"
            />
          ) : (
            <p className="text-[14.5px] font-medium leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
        </div>
        
        {/* Alignment-aware timestamp + ticks */}
        <div className={`flex items-center gap-1.5 mt-1.5 transition-opacity duration-300 ${isSent ? 'pr-1' : 'pl-1'}`}>
          <span className="text-[9.5px] font-black uppercase tracking-[0.15em] text-slate-400/70">{time}</span>
          {getReadStatusIcon()}
        </div>
      </div>
    </div>
  );
};


