import { useState } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { GiftCarouselViewer } from './GiftCarouselViewer';
import { getGiftTheme, getGiftImage } from '../utils/giftThemes';
import type { Gift } from '../types/male.types';
import { format } from 'date-fns';

interface GiftMessageBubbleProps {
  gifts: Gift[];
  note?: string;
  timestamp: Date;
  isSent: boolean;
  readStatus?: 'sent' | 'delivered' | 'read';
  cost?: number;
}

export const GiftMessageBubble = ({
  gifts,
  note,
  timestamp,
  isSent,
  readStatus,
  cost,
}: GiftMessageBubbleProps) => {
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const time = format(timestamp, 'h:mm a');
  const isMultiple = gifts.length > 1;

  const getReadStatusIcon = () => {
    if (!isSent || !readStatus) return null;

    if (readStatus === 'read') {
      return (
        <MaterialSymbol
          name="done_all"
          size={14}
          className="text-primary ml-1 shrink-0"
        />
      );
    }
    if (readStatus === 'delivered') {
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

  // Single gift display
  if (!isMultiple) {
    const gift = gifts[0];
    const theme = getGiftTheme(gift);

    return (
      <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
        <div className={`flex flex-col max-w-[75%] ${isSent ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl p-4 ${isSent
              ? `bg-gradient-to-br ${theme.primary} text-white rounded-tr-sm shadow-md`
              : 'bg-white dark:bg-[#342d18] text-gray-900 dark:text-white rounded-tl-sm border border-gray-200 dark:border-gray-700 shadow-sm'
              }`}
          >
            {/* Gift Icon */}
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 dark:bg-black/20 rounded-full shadow-inner backdrop-blur-sm">
                <img src={getGiftImage(gift.name)} alt={gift.name} className="w-12 h-12 object-contain drop-shadow-sm" />
              </div>
              <div className="flex-1 min-w-[100px]">
                <h4 className="font-bold text-lg leading-tight">{gift.name}</h4>
                {gift.description && (
                  <p className="text-xs opacity-90 mt-1 leading-relaxed">{gift.description}</p>
                )}
              </div>
            </div>

            {/* Note */}
            {note && (
              <div className="mt-3 pt-3 border-t border-white/20 dark:border-gray-600/50">
                <p className="text-sm italic">{note}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-gray-500 dark:text-[#cc8ea3]">{time}</span>
            {getReadStatusIcon()}
            {cost !== undefined && cost > 0 && (
              <span className="text-[10px] text-gray-500 dark:text-[#cc8ea3] ml-1">
                • {cost} coins
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Multiple gifts - deck of cards view
  return (
    <>
      <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
        <div className={`flex flex-col max-w-[85%] ${isSent ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl p-4 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] ${isSent
              ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-[#342d18] text-gray-900 dark:text-white rounded-tl-sm border border-gray-200 dark:border-gray-700'
              }`}
            onClick={() => setIsCarouselOpen(true)}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 gap-3 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <MaterialSymbol name="redeem" size={24} className="shrink-0" />
                <span className="font-bold whitespace-nowrap">{gifts.length} Gifts</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                <span className="text-xs opacity-80 whitespace-nowrap">Tap to view</span>
                <MaterialSymbol name="open_in_full" size={18} className="opacity-80 shrink-0" />
              </div>
            </div>

            {/* Deck of Cards View */}
            <div className="relative" style={{ height: '140px' }}>
              {gifts.slice(0, Math.min(4, gifts.length)).map((gift, index) => {
                const totalVisible = Math.min(4, gifts.length);
                const rotation = (index - (totalVisible - 1) / 2) * 3; // Spread rotation
                const offsetX = (index - (totalVisible - 1) / 2) * 12; // Horizontal offset
                const offsetY = index * 6; // Vertical offset
                const theme = getGiftTheme(gift);

                return (
                  <div
                    key={gift.id}
                    className={`absolute bg-gradient-to-br ${theme.secondary} rounded-xl p-4 border-2 border-white/50 dark:border-white/20 shadow-lg backdrop-blur-sm transition-all hover:scale-105`}
                    style={{
                      left: `calc(50% + ${offsetX}px)`,
                      top: `${offsetY}px`,
                      transform: `translateX(-50%) rotate(${rotation}deg)`,
                      width: '85%',
                      zIndex: gifts.length - index,
                      transition: 'transform 0.2s ease-out',
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={getGiftImage(gift.name)}
                        alt={gift.name}
                        className="w-8 h-8 object-contain drop-shadow-md"
                      />
                      <span className="text-sm font-bold text-center text-white drop-shadow-md">{gift.name}</span>
                      {index === 0 && gifts.length > 4 && (
                        <div className={`absolute -top-1 -right-1 bg-gradient-to-br ${theme.primary} rounded-full size-6 flex items-center justify-center shadow-md`}>
                          <span className="text-xs font-bold text-white">+{gifts.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note Preview */}
            {note && (
              <div className="mt-3 pt-3 border-t border-white/20 dark:border-gray-600">
                <p className="text-sm italic line-clamp-2">{note}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-gray-500 dark:text-[#cc8ea3]">{time}</span>
            {getReadStatusIcon()}
            {cost !== undefined && cost > 0 && (
              <span className="text-[10px] text-gray-500 dark:text-[#cc8ea3] ml-1">
                • {cost} coins
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gift Carousel Viewer */}
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

