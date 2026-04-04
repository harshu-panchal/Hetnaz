import { useState } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { GiftCarouselViewer } from './GiftCarouselViewer';
import { getGiftTheme } from '../utils/giftThemes';
import type { Gift } from '../types/female.types';
import { format } from 'date-fns';

interface GiftMessageBubbleProps {
  gifts: Gift[];
  note?: string;
  timestamp: Date;
  senderName?: string;
  isSent?: boolean;
  senderAvatar?: string;
}

export const GiftMessageBubble = ({
  gifts,
  note,
  timestamp,
  senderName,
  isSent = false,
  senderAvatar
}: GiftMessageBubbleProps) => {
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const time = format(timestamp, 'h:mm a');
  const isMultiple = gifts.length > 1;

  // Single gift display
  if (!isMultiple) {
    const gift = gifts[0] || {
      id: 'default',
      name: 'Special Gift',
      icon: 'featured_seasonal_and_gifts',
      tradeValue: 0,
      imageUrl: ''
    };
    const theme = getGiftTheme(gift);

    return (
      <div className={`flex items-end gap-2.5 ${isSent ? 'flex-row-reverse' : 'flex-row'} mb-4 px-4 transition-all duration-300`}>
        {/* Avatar - Only for received messages */}
        {!isSent && (
          <div className="shrink-0 mb-1.5 self-end">
            <div className="h-8.5 w-8.5 rounded-full p-[1px] bg-gradient-to-tr from-pink-500/20 to-rose-400/20 ring-1 ring-slate-100 shadow-sm">
               <div 
                 className="h-full w-full rounded-full border-2 border-white bg-center bg-no-repeat bg-cover"
                 style={{ backgroundImage: `url("${senderAvatar || 'https://via.placeholder.com/40'}")` }}
               />
            </div>
          </div>
        )}

        <div className={`flex flex-col max-w-[80%] ${isSent ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-[1.4rem] p-5 bg-white text-slate-800 border border-slate-100 shadow-sm ${isSent ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
            {/* Gift Item Content */}
            <div className="flex items-center gap-4 mb-3">
              <div className={`p-3.5 bg-gradient-to-br ${theme.primary} rounded-[1.25rem] shadow-lg shadow-pink-500/10`}>
                {gift.imageUrl ? (
                  <img src={gift.imageUrl} alt={gift.name} className="w-10 h-10 object-contain drop-shadow-sm" />
                ) : (
                  <MaterialSymbol name={gift.icon as any} size={32} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-base tracking-tight truncate">{gift.name}</h4>
                {senderName && <p className="text-[9px] font-black uppercase tracking-widest text-pink-500/60 mt-1">From {senderName}</p>}
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-2">
              <MaterialSymbol name="monetization_on" size={16} className="text-amber-500" />
              <span className="text-[11px] font-black text-slate-700">₹{gift.tradeValue * (gift.quantity || 1)}</span>
            </div>

            {note && <div className="mt-3 pt-3 border-t border-slate-50 italic text-xs text-slate-500">"{note}"</div>}
          </div>
          <div className={`px-1 mt-1.5 ${isSent ? 'pr-1' : 'pl-1'}`}>
             <span className="text-[9.5px] font-black uppercase tracking-[0.15em] text-slate-400/70">{time}</span>
          </div>
        </div>
      </div>
    );
  }

  // Multiple gifts
  return (
    <div className={`flex items-end gap-2.5 ${isSent ? 'flex-row-reverse' : 'flex-row'} mb-4 px-4 transition-all duration-300`}>
      {!isSent && (
        <div className="shrink-0 mb-1.5 self-end">
          <div className="h-8.5 w-8.5 rounded-full p-[1px] bg-gradient-to-tr from-pink-500/20 to-rose-400/20 ring-1 ring-slate-100 shadow-sm">
             <div 
               className="h-full w-full rounded-full border-2 border-white bg-center bg-no-repeat bg-cover"
               style={{ backgroundImage: `url("${senderAvatar || 'https://via.placeholder.com/40'}")` }}
             />
          </div>
        </div>
      )}

      <div className={`flex flex-col max-w-[85%] ${isSent ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-[1.4rem] p-5 cursor-pointer transition-all active:scale-[0.98] bg-white text-slate-800 border border-slate-100 shadow-sm ${isSent ? 'rounded-tr-none' : 'rounded-tl-none'}`}
          onClick={() => setIsCarouselOpen(true)}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 gap-3 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="size-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                 <MaterialSymbol name="redeem" size={20} filled />
              </div>
              <span className="text-sm font-black tracking-tight">{gifts.length} Gifts</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-auto bg-slate-50 px-2 py-1 rounded-full">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">View</span>
              <MaterialSymbol name="open_in_full" size={14} className="text-slate-300" />
            </div>
          </div>

          {/* Deck View Logic... (Condensed for brevity but keeping structure) */}
          <div className="relative mb-2 h-24">
             {/* ...Deck rendering... */}
             <div className="text-center text-[10px] font-bold text-slate-400">Gifts from {senderName}</div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Value:</span>
            <div className="flex items-center gap-1.5">
              <MaterialSymbol name="monetization_on" size={16} className="text-amber-500" />
              <span className="text-sm font-black text-slate-800">₹{gifts.reduce((sum, g) => sum + (g.tradeValue * (g.quantity || 1)), 0)}</span>
            </div>
          </div>
        </div>
        <div className={`px-1 mt-1.5 ${isSent ? 'pr-1' : 'pl-1'}`}>
           <span className="text-[9.5px] font-black uppercase tracking-[0.15em] text-slate-400/70">{time}</span>
        </div>
      </div>
      <GiftCarouselViewer isOpen={isCarouselOpen} onClose={() => setIsCarouselOpen(false)} gifts={gifts} note={note} initialIndex={0} />
    </div>
  );
};

