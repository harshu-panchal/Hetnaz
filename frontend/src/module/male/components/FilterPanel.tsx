import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

export interface FilterOptions {
  ageRange: { min: number; max: number };
  maxDistance: number;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const defaultFilters: FilterOptions = {
  ageRange: { min: 18, max: 45 },
  maxDistance: 50,
};

export const FilterPanel = ({
  isOpen,
  onClose,
  onApply,
  initialFilters = defaultFilters,
}: FilterPanelProps) => {
  const { t } = useTranslation();
  const [tempFilters, setTempFilters] = useState<FilterOptions>(initialFilters);
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      setTempFilters(initialFilters);
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
      // Trigger animation on next frame for reliable entrance transition
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsVisible(false);
      timer = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = '';
      }, 300);
    }

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [isOpen, initialFilters]);

  // Handle closing with smooth exit transition
  const handleAnimatedClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 280);
  };

  const handleAnimatedApply = () => {
    setIsVisible(false);
    setTimeout(() => {
      onApply(tempFilters);
    }, 280);
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMounted && isVisible) {
        handleAnimatedClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMounted, isVisible]);

  if (!isMounted) return null;

  const handleReset = () => {
    setTempFilters({
      ageRange: { min: 18, max: 45 },
      maxDistance: 100,
    });
  };

  const ageChips = [
    { label: '18 - 24', min: 18, max: 24 },
    { label: '25 - 32', min: 25, max: 32 },
    { label: '33 - 45', min: 33, max: 45 },
    { label: 'All (18-60)', min: 18, max: 60 },
  ];

  const distanceChips = [
    { label: '10 km', value: 10 },
    { label: '25 km', value: 25 },
    { label: '50 km', value: 50 },
    { label: '100 km', value: 100 },
    { label: '200 km', value: 200 },
  ];

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-end justify-center sm:items-center transition-all duration-300 ${
        isVisible ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* 1. Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={handleAnimatedClose}
      />

      {/* 2. Modern Card / Bottom Sheet */}
      <div
        className={`relative z-10 w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 shadow-2xl border-t sm:border border-pink-100/60 dark:border-slate-800 max-h-[85vh] overflow-y-auto transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] transform ${
          isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-full opacity-0 sm:scale-95 sm:translate-y-6'
        }`}
      >
        
        {/* Drag handle */}
        <div className="mx-auto w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center">
              <MaterialSymbol name="tune" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('refine_search') || 'Refine Search'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-xs font-bold text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 px-2.5 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t('reset_filters') || 'Reset'}
            </button>
            <button 
              onClick={handleAnimatedClose}
              className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 active:scale-90 transition-all"
              aria-label="Close"
            >
              <MaterialSymbol name="close" size={18} />
            </button>
          </div>
        </div>

        {/* Filters Body */}
        <div className="space-y-6">
          
          {/* Age Range Section */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('age_range') || 'Age Range'}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300">
                {tempFilters.ageRange.min} — {tempFilters.ageRange.max} yrs
              </span>
            </div>
            
            <div className="py-2">
              <input
                type="range"
                min="18"
                max="60"
                value={tempFilters.ageRange.max}
                onChange={(e) => setTempFilters({ 
                  ...tempFilters, 
                  ageRange: { ...tempFilters.ageRange, max: parseInt(e.target.value) } 
                })}
                className="w-full appearance-none h-2 bg-pink-100 dark:bg-slate-700 rounded-full cursor-pointer accent-pink-600"
              />
            </div>
            
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-1 mb-3">
              <span>18 yrs</span>
              <span>30 yrs</span>
              <span>45 yrs</span>
              <span>60+ yrs</span>
            </div>

            {/* Quick Age Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ageChips.map((chip) => {
                const isActive = tempFilters.ageRange.min === chip.min && tempFilters.ageRange.max === chip.max;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setTempFilters({ ...tempFilters, ageRange: { min: chip.min, max: chip.max } })}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-pink-300'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance Filter Section */}
          <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('max_distance') || 'Max Distance'}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300">
                Within {tempFilters.maxDistance} km
              </span>
            </div>
            
            <div className="py-2">
              <input
                type="range"
                min="1"
                max="200"
                value={tempFilters.maxDistance}
                onChange={(e) => setTempFilters({ 
                  ...tempFilters, 
                  maxDistance: parseInt(e.target.value) 
                })}
                className="w-full appearance-none h-2 bg-pink-100 dark:bg-slate-700 rounded-full cursor-pointer accent-pink-600"
              />
            </div>

            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-1 mb-3">
              <span>1 km</span>
              <span>50 km</span>
              <span>100 km</span>
              <span>200 km+</span>
            </div>

            {/* Quick Distance Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {distanceChips.map((chip) => {
                const isActive = tempFilters.maxDistance === chip.value;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setTempFilters({ ...tempFilters, maxDistance: chip.value })}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-pink-300'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 mt-8 pb-3">
          <button
            onClick={handleAnimatedClose}
            className="flex-1 py-3.5 px-4 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all text-center"
          >
            {t('cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleAnimatedApply}
            className="flex-[1.5] py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:opacity-95 shadow-md shadow-pink-500/20 active:scale-95 transition-all text-center"
          >
            {t('apply_filters') || 'Apply Filters'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
