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
}

export const GiftMessageBubble = ({
  gifts,
  note,
  timestamp,
  senderName,
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
      <>
        <div className="flex justify-start mb-3 px-4">
          <div className="flex flex-col max-w-[80%] items-start">
            <div className="rounded-[2rem] p-5 bg-white text-slate-800 rounded-tl-sm border border-slate-100 shadow-sm">
              {/* Gift Icon */}
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-3.5 bg-gradient-to-br ${theme.primary} rounded-[1.25rem] shadow-lg shadow-pink-500/10`}>
                  {gift.imageUrl ? (
                    <img
                      src={gift.imageUrl}
                      alt={gift.name}
                      className="w-10 h-10 object-contain drop-shadow-sm"
                    />
                  ) : (
                    <MaterialSymbol name={gift.icon as any} size={32} className="text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-base tracking-tight truncate">{gift.name}</h4>
                  {gift.description && (
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-tight">{gift.description}</p>
                  )}
                  {senderName && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-pink-500/60 mt-1">
                      From {senderName}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity Badge */}
              {gift.quantity && gift.quantity > 1 && (
                <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full px-2 py-1 text-[10px] font-black shadow-md">
                  ×{gift.quantity}
                </div>
              )}

              {/* Trade Value */}
              <div className="mt-2 pt-2 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MaterialSymbol name="monetization_on" size={16} className="text-amber-500" />
                    <span className="text-[11px] font-black text-slate-700">
                      ₹{gift.tradeValue}
                      {gift.quantity && gift.quantity > 1 && ` × ${gift.quantity} = ₹${gift.tradeValue * gift.quantity}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              {note && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <p className="text-xs font-medium italic text-slate-500 leading-relaxed">"{note}"</p>
                </div>
              )}
            </div>
            <div className="px-1 mt-1">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{time}</span>
            </div>
          </div>
        </div>
        <GiftCarouselViewer
          isOpen={isCarouselOpen}
          onClose={() => setIsCarouselOpen(false)}
          gifts={gifts}
          note={note}
          initialIndex={0}
        />
      </>
    );
  }

  // Multiple gifts - deck of cards view
  return (
    <>
      <div className="flex justify-start mb-3 px-4">
        <div className="flex flex-col max-w-[85%] items-start">
          <div
            className="rounded-[2rem] p-5 cursor-pointer transition-all active:scale-[0.98] bg-white text-slate-800 rounded-tl-sm border border-slate-100 shadow-sm"
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

            {/* Deck View */}
            <div className="relative mb-2" style={{ height: '140px' }}>
              {gifts.slice(0, Math.min(4, gifts.length)).map((gift, index) => {
                const totalVisible = Math.min(4, gifts.length);
                const rotation = (index - (totalVisible - 1) / 2) * 3;
                const offsetX = (index - (totalVisible - 1) / 2) * 12;
                const offsetY = index * 6;
                const theme = getGiftTheme(gift);

                return (
                  <div
                    key={index}
                    className={`absolute bg-gradient-to-br ${theme.secondary} rounded-2xl p-4 border-2 border-white shadow-xl transition-all`}
                    style={{
                      left: `calc(50% + ${offsetX}px)`,
                      top: `${offsetY}px`,
                      transform: `translateX(-50%) rotate(${rotation}deg)`,
                      width: '85%',
                      zIndex: gifts.length - index,
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {gift.imageUrl ? (
                        <img
                          src={gift.imageUrl}
                          alt={gift.name}
                          className="w-10 h-10 object-contain drop-shadow-md"
                        />
                      ) : (
                        <MaterialSymbol
                          name={gift.icon as any}
                          size={32}
                          className="text-white drop-shadow-md"
                        />
                      )}
                      <span className="text-[11px] font-black text-center text-white drop-shadow-sm uppercase tracking-widest">{gift.name}</span>
                      {index === 0 && gifts.length > 4 && (
                        <div className={`absolute -top-1 -right-1 bg-gradient-to-br ${theme.primary} rounded-full size-6 flex items-center justify-center shadow-lg border-2 border-white`}>
                          <span className="text-[10px] font-black text-white">+{gifts.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Value */}
            <div className="mt-4 pt-3 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Value:</span>
                <div className="flex items-center gap-1.5">
                  <MaterialSymbol name="monetization_on" size={16} className="text-amber-500" />
                  <span className="text-sm font-black text-slate-800">
                    ₹{gifts.reduce((sum, g) => sum + (g.tradeValue * (g.quantity || 1)), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Note Preview */}
            {note && (
              <div className="mt-3 pt-3 border-t border-slate-50">
                <p className="text-xs font-medium italic text-slate-500 line-clamp-1 leading-relaxed">"{note}"</p>
              </div>
            )}
          </div>
          <div className="px-1 mt-1">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{time}</span>
          </div>
        </div>
      </div>

      <GiftCarouselViewer
        isOpen={isCarouselOpen}
        onClose={() => setIsCarouselOpen(false)}
        gifts={gifts}
        note={note}
        initialIndex={0}
      />
    </>
  );
};

