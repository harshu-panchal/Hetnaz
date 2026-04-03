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

  if (isImageMessage) {
    const imageUrl = message.attachments?.[0]?.url || message.content;

    return (
      <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
        <div className={`flex flex-col max-w-[75%] ${isSent ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-[1.5rem] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity p-1 bg-white border border-slate-100 shadow-sm ${isSent ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
            onClick={() => onImageClick?.(imageUrl)}
          >
            <img
              src={imageUrl}
              alt="Shared photo"
              className="max-w-full h-auto max-h-64 object-cover rounded-[1.25rem]"
            />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{time}</span>
            {getReadStatusIcon()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
      <div className={`flex flex-col max-w-[80%] ${isSent ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-[1.5rem] px-5 py-3 border ${isSent
              ? 'bg-pink-500 text-white border-pink-500 rounded-tr-sm shadow-lg shadow-pink-500/10'
              : 'bg-white text-slate-800 border-slate-100 rounded-tl-sm shadow-sm'
            }`}
        >
          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{time}</span>
          {getReadStatusIcon()}
        </div>
      </div>
    </div>
  );
};


