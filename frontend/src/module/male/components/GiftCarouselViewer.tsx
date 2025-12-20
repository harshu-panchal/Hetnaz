import { useState, useEffect } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { getGiftTheme, getGiftImage } from '../utils/giftThemes';
import type { Gift } from '../types/male.types';

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
      // Prevent body scroll when modal is open
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
        className="fixed inset-0 bg-black/80 z-50 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Carousel Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white dark:bg-[#2f151e] rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center size-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors active:scale-95"
            aria-label="Close"
          >
            <MaterialSymbol name="close" size={24} />
          </button>

          {/* Gift Display Area */}
          <div className={`relative aspect-square bg-gradient-to-br ${theme.primary} flex items-center justify-center p-8`}>
            {/* Previous Button */}
            {gifts.length > 1 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-12 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black/70 transition-colors shadow-lg active:scale-95 z-10"
                aria-label="Previous gift"
              >
                <MaterialSymbol name="chevron_left" size={28} />
              </button>
            )}

            {/* Gift Card */}
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Gift Icon */}
              <div className="relative">
                <div className="p-8 bg-white/90 dark:bg-black/50 rounded-full shadow-2xl backdrop-blur-sm">
                  <img
                    src={getGiftImage(currentGift.name)}
                    alt={currentGift.name}
                    className="w-32 h-32 object-contain drop-shadow-xl"
                  />
                </div>
                {/* Category Badge */}
                {currentGift.category && (
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r ${theme.primary} text-white text-xs font-semibold rounded-full capitalize shadow-md`}>
                    {currentGift.category}
                  </div>
                )}
              </div>

              {/* Gift Name */}
              <div className="text-center relative z-10">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                  {currentGift.name}
                </h2>
                {currentGift.description && (
                  <p className="text-base text-white/90 drop-shadow-md">
                    {currentGift.description}
                  </p>
                )}
              </div>

              {/* Cost Display */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-black/40 rounded-full">
                <MaterialSymbol name="monetization_on" size={20} className="text-primary" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentGift.cost} coins
                </span>
              </div>
            </div>

            {/* Next Button */}
            {gifts.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-12 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black/70 transition-colors shadow-lg active:scale-95 z-10"
                aria-label="Next gift"
              >
                <MaterialSymbol name="chevron_right" size={28} />
              </button>
            )}
          </div>

          {/* Note Section */}
          {note && (
            <div className="px-6 py-5 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-t-2 border-pink-200 dark:border-pink-800/50 relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative flex items-start gap-3">
                {/* Quote icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-white/80 dark:bg-black/40 rounded-full shadow-md backdrop-blur-sm">
                    <MaterialSymbol
                      name="format_quote"
                      size={24}
                      className="text-pink-500 dark:text-pink-400"
                    />
                  </div>
                </div>

                {/* Note content */}
                <div className="flex-1 min-w-0">
                  <p className="text-base text-gray-800 dark:text-gray-100 leading-relaxed font-medium italic relative z-10">
                    "{note}"
                  </p>

                  {/* Decorative line */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 dark:from-pink-500/50 dark:via-purple-500/50 dark:to-pink-500/50" />
                    <MaterialSymbol
                      name="favorite"
                      size={12}
                      className="text-pink-400 dark:text-pink-500"
                    />
                    <div className="flex-1 h-px bg-gradient-to-l from-pink-300 via-purple-300 to-pink-300 dark:from-pink-500/50 dark:via-purple-500/50 dark:to-pink-500/50" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dots Indicator */}
          {gifts.length > 1 && (
            <div className="px-6 py-4 bg-white dark:bg-[#2f151e] border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2">
                {gifts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`size-2 rounded-full transition-all ${index === currentIndex
                      ? 'bg-pink-500 size-3'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                      }`}
                    aria-label={`Go to gift ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                {currentIndex + 1} of {gifts.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

