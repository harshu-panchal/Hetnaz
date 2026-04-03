import { useState, useEffect } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { getGiftTheme } from '../utils/giftThemes';
import type { Gift } from '../types/female.types';

interface GiftCarouselViewerProps {
  isOpen: boolean;
  onClose: () => void;
  gifts: Gift[];
  note?: string;
  initialIndex?: number;
}

export const GiftCarouselViewer = ({
  isOpen,
  onClose,
  gifts,
  note,
  initialIndex = 0,
}: GiftCarouselViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentIndex]);

  if (!isOpen || gifts.length === 0) return null;

  const currentGift = gifts[currentIndex];
  const theme = getGiftTheme(currentGift);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? gifts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === gifts.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Carousel Container */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 flex items-center justify-center size-12 rounded-2xl bg-white/90 backdrop-blur-md text-slate-400 hover:text-pink-500 shadow-xl transition-all active:scale-95"
            aria-label="Close"
          >
            <MaterialSymbol name="close" size={24} />
          </button>

          {/* Gift Display Area */}
          <div className={`relative aspect-square bg-gradient-to-br ${theme.primary} flex items-center justify-center p-8 overflow-hidden`}>
            {/* Glossy Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />

            {/* Previous Button */}
            {gifts.length > 1 && (
              <button
                onClick={handlePrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center size-12 rounded-2xl bg-white/95 text-slate-800 hover:bg-white shadow-xl transition-all active:scale-90 z-10"
                aria-label="Previous gift"
              >
                <MaterialSymbol name="chevron_left" size={28} />
              </button>
            )}

            {/* Gift Card */}
            <div className="flex flex-col items-center gap-6 w-full relative z-10">
              {/* Gift Icon */}
              <div className="relative">
                 <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-125 opacity-50" />
                 <div className="size-48 bg-white/95 rounded-[3rem] shadow-2xl flex items-center justify-center relative border border-white/50">
                    {currentGift.imageUrl ? (
                      <img
                        src={currentGift.imageUrl}
                        alt={currentGift.name}
                        className="w-32 h-32 object-contain drop-shadow-xl"
                      />
                    ) : (
                      <MaterialSymbol
                        name={currentGift.icon as any}
                        size={80}
                        className={theme.iconColor}
                      />
                    )}
                 </div>
              </div>

              {/* Gift Name */}
              <div className="text-center">
                <h2 className="text-3xl font-black text-white drop-shadow-md mb-2 tracking-tight">
                  {currentGift.name}
                </h2>
                {currentGift.description && (
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 drop-shadow-sm px-8 leading-relaxed">
                    {currentGift.description}
                  </p>
                )}
              </div>
            </div>

            {/* Next Button */}
            {gifts.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center size-12 rounded-2xl bg-white/95 text-slate-800 hover:bg-white shadow-xl transition-all active:scale-90 z-10"
                aria-label="Next gift"
              >
                <MaterialSymbol name="chevron_right" size={28} />
              </button>
            )}
          </div>

          {/* Details Section */}
          <div className="p-8 bg-white relative">
            <div className="space-y-6">
               {/* Trade Value & Quantity */}
               <div className="flex items-center justify-between bg-slate-50 px-5 py-4 rounded-3xl border border-slate-100">
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trade Value</p>
                     <div className="flex items-center gap-1.5">
                       <MaterialSymbol name="monetization_on" size={18} className="text-amber-500" />
                       <span className="text-lg font-black text-slate-800 tracking-tight">
                         ₹{currentGift.tradeValue * (currentGift.quantity || 1)}
                       </span>
                     </div>
                  </div>
                  {currentGift.quantity && currentGift.quantity > 1 && (
                    <div className="bg-pink-500 text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-pink-500/20">
                      ×{currentGift.quantity}
                    </div>
                  )}
               </div>

               {/* Note */}
               {note && (
                <div className="relative group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/20 rounded-full" />
                  <p className="pl-5 text-sm font-medium italic text-slate-600 leading-relaxed">
                    "{note}"
                  </p>
                </div>
               )}
            </div>
            
            {/* Capsule Indicator */}
            {gifts.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {gifts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`h-1.5 transition-all duration-500 rounded-full ${index === currentIndex
                        ? 'w-8 bg-pink-500'
                        : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                      }`}
                    aria-label={`Go to gift ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

