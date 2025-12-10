import { useState, useEffect } from 'react';
import { MaterialSymbol } from '../types/material-symbol';

export interface FilterOptions {
  ageRange: { min: number; max: number };
  maxDistance: number;
  onlineOnly: boolean;
  verifiedOnly: boolean;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const defaultFilters: FilterOptions = {
  ageRange: { min: 18, max: 50 },
  maxDistance: 50,
  onlineOnly: false,
  verifiedOnly: false,
};

export const FilterPanel = ({
  isOpen,
  onClose,
  onApply,
  initialFilters = defaultFilters,
}: FilterPanelProps) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, filters]);

  const handleApply = () => {
    setFilters(tempFilters);
    onApply(tempFilters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters(defaultFilters);
  };

  const handleAgeMinChange = (value: number) => {
    if (value >= 18 && value <= tempFilters.ageRange.max) {
      setTempFilters({
        ...tempFilters,
        ageRange: { ...tempFilters.ageRange, min: value },
      });
    }
  };

  const handleAgeMaxChange = (value: number) => {
    if (value >= tempFilters.ageRange.min && value <= 100) {
      setTempFilters({
        ...tempFilters,
        ageRange: { ...tempFilters.ageRange, max: value },
      });
    }
  };

  const handleDistanceChange = (value: number) => {
    setTempFilters({ ...tempFilters, maxDistance: value });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-sm bg-white dark:bg-[#2f151e] z-50 shadow-2xl filter-panel-slide-in overflow-y-auto safe-area-inset-bottom">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#2f151e] border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
              aria-label="Close filters"
            >
              <MaterialSymbol name="close" size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Age Range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-base font-semibold text-slate-900 dark:text-white">
                Age Range
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tempFilters.ageRange.min} - {tempFilters.ageRange.max} years
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Minimum Age
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="18"
                    max={tempFilters.ageRange.max}
                    value={tempFilters.ageRange.min}
                    onChange={(e) => handleAgeMinChange(Number(e.target.value))}
                    className="flex-1 h-3 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary touch-none"
                  />
                  <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-center">
                    {tempFilters.ageRange.min}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Maximum Age
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={tempFilters.ageRange.min}
                    max="100"
                    value={tempFilters.ageRange.max}
                    onChange={(e) => handleAgeMaxChange(Number(e.target.value))}
                    className="flex-1 h-3 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary touch-none"
                  />
                  <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-center">
                    {tempFilters.ageRange.max}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Distance */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-base font-semibold text-slate-900 dark:text-white">
                Maximum Distance
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tempFilters.maxDistance} km
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="100"
                value={tempFilters.maxDistance}
                onChange={(e) => handleDistanceChange(Number(e.target.value))}
                className="flex-1 h-3 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary touch-none"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white w-16 text-center">
                {tempFilters.maxDistance} km
              </span>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
            {/* Online Only */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#342d18] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
                  <MaterialSymbol
                    name="circle"
                    size={20}
                    className="text-green-500 fill-green-500"
                  />
                </div>
                <div>
                  <label className="text-base font-medium text-slate-900 dark:text-white block">
                    Online Only
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Show only online users
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setTempFilters({ ...tempFilters, onlineOnly: !tempFilters.onlineOnly })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  tempFilters.onlineOnly ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label="Toggle online only"
              >
                <span
                  className={`absolute top-1 left-1 size-4 bg-white rounded-full transition-transform ${
                    tempFilters.onlineOnly ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Verified Only */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#342d18] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
                  <MaterialSymbol name="verified" size={20} className="text-primary" />
                </div>
                <div>
                  <label className="text-base font-medium text-slate-900 dark:text-white block">
                    Verified Only
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Show only verified profiles
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setTempFilters({ ...tempFilters, verifiedOnly: !tempFilters.verifiedOnly })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  tempFilters.verifiedOnly ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label="Toggle verified only"
              >
                <span
                  className={`absolute top-1 left-1 size-4 bg-white rounded-full transition-transform ${
                    tempFilters.verifiedOnly ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-[#2f151e] border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <button
            onClick={handleApply}
            className="w-full h-12 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-98 transition-all"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="w-full h-12 bg-gray-100 dark:bg-[#342d18] text-slate-700 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-[#4b202e] active:scale-98 transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
};

