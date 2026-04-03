import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isOpen) {
      setTempFilters(initialFilters);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialFilters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 1. Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* 2. Bottom Sheet Wrapper */}
      <div className="relative w-full max-w-lg bg-[#f8f0f4] dark:bg-[#1a0f14] rounded-t-[3rem] sm:rounded-[3rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-500 border-t border-white/40 dark:border-white/5">
        
        {/* Handle for Bottom Sheet */}
        <div className="mx-auto w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mb-8 opacity-50" />

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <MaterialSymbol name="tune" size={28} className="text-primary" />
            {t('refine_search') || 'Refine Search'}
          </h2>
          <button 
            onClick={onClose}
            className="skeuo-button p-2 rounded-full active:scale-90 transition-transform"
          >
            <MaterialSymbol name="close" size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Filters Content */}
        <div className="space-y-10">
          
          {/* Age Range Filter */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest">
                {t('age_range') || 'Age Range'}
              </span>
              <span className="text-lg font-black text-primary italic">
                {tempFilters.ageRange.min} — {tempFilters.ageRange.max}
              </span>
            </div>
            
            <div className="skeuo-inset p-1.5 rounded-2xl relative h-10 flex items-center px-4">
              <input
                type="range"
                min="18"
                max="60"
                value={tempFilters.ageRange.max}
                onChange={(e) => setTempFilters({ 
                  ...tempFilters, 
                  ageRange: { ...tempFilters.ageRange, max: parseInt(e.target.value) } 
                })}
                className="w-full appearance-none h-4 bg-transparent cursor-pointer accent-primary"
              />
            </div>
            <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-gray-400 uppercase">
              <span>18</span>
              <span>40</span>
              <span>60+</span>
            </div>
          </div>

          {/* Distance Filter */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest">
                {t('max_distance') || 'Max Distance'}
              </span>
              <span className="text-lg font-black text-primary italic">
                {tempFilters.maxDistance} km
              </span>
            </div>
            
            <div className="skeuo-inset p-1.5 rounded-2xl h-10 flex items-center px-4">
              <input
                type="range"
                min="1"
                max="200"
                value={tempFilters.maxDistance}
                onChange={(e) => setTempFilters({ 
                  ...tempFilters, 
                  maxDistance: parseInt(e.target.value) 
                })}
                className="w-full appearance-none h-4 bg-transparent cursor-pointer accent-primary"
              />
            </div>
            <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-gray-400 uppercase">
              <span>1 km</span>
              <span>100 km</span>
              <span>200 km+</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 mt-12 pb-4">
          <button
            onClick={onClose}
            className="flex-1 skeuo-button py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest text-gray-500 active:scale-95 transition-all"
          >
            {t('cancel') || 'Cancel'}
          </button>
          <button
            onClick={() => onApply(tempFilters)}
            className="flex-[2] skeuo-button-bold py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest text-white active:scale-95 transition-all"
          >
            {t('confirm') || 'Confirm'}
          </button>
        </div>
      </div>

      {/* Style overrides for tactile inputs */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 28px;
          width: 28px;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 
            0 4px 10px rgba(0,0,0,0.15),
            inset 0 1px 1px rgba(255,255,255,1),
            inset 0 -1px 3px rgba(0,0,0,0.1);
          cursor: pointer;
          border: 1px solid rgba(0,0,0,0.05);
          margin-top: -6px; /* adjustment */
        }
        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          background: rgba(255, 105, 180, 0.2);
          border-radius: 4px;
        }
        .dark input[type="range"]::-webkit-slider-runnable-track {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};
