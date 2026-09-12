import React, { useState, useEffect } from 'react';
import { MaterialSymbol } from '../types/material-symbol';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
  hasBadge?: boolean;
}

interface BottomNavigationProps {
  items: NavItem[];
  onItemClick?: (itemId: string) => void;
}

// Module-level tracker so transition persists across page route changes
let globalPrevNavIndex: number | null = null;

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ items, onItemClick }) => {
  const currentActiveIndex = items.findIndex((item) => item.isActive);

  // Initialize with last known index to enable cross-page sliding animation
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    if (globalPrevNavIndex !== null && globalPrevNavIndex >= 0 && globalPrevNavIndex < items.length) {
      return globalPrevNavIndex;
    }
    return currentActiveIndex !== -1 ? currentActiveIndex : 0;
  });

  // Smoothly sync activeIndex when route / items change
  useEffect(() => {
    if (currentActiveIndex !== -1) {
      const frame = requestAnimationFrame(() => {
        setActiveIndex(currentActiveIndex);
        globalPrevNavIndex = currentActiveIndex;
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [currentActiveIndex]);

  const handleItemClick = (item: NavItem, index: number) => {
    setActiveIndex(index);
    globalPrevNavIndex = index;
    onItemClick?.(item.id);
  };

  const itemCount = items.length || 5;

  return (
    <>
      {/* Mobile & tablet: Full-width Apple Liquid Glass Bar with Fluid Sliding Transition */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 w-full z-50 bg-white/80 dark:bg-slate-900/85 backdrop-blur-2xl backdrop-saturate-200 border-t border-white/80 dark:border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.06),0_-1px_0_rgba(255,255,255,0.9)_inset] transition-all duration-300 select-none"
      >
        {/* Specular Top Hairline Reflection */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90 pointer-events-none" />

        {/* Navigation Track Container */}
        <div className="relative max-w-md md:max-w-2xl mx-auto px-2 pt-2 pb-3">
          {/* Fluid Sliding Liquid Glass Capsule */}
          {activeIndex >= 0 && (
            <div
              className="absolute inset-y-2 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none flex items-center justify-center"
              style={{
                left: '8px',
                width: `calc((100% - 16px) / ${itemCount})`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            >
              <div className="w-[64px] h-[50px] rounded-2xl bg-gradient-to-b from-pink-500/18 to-rose-500/10 dark:from-pink-500/28 dark:to-rose-500/15 backdrop-blur-md border border-pink-200/60 dark:border-pink-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_14px_rgba(236,72,153,0.18)]" />
            </div>
          )}

          {/* Nav Items Grid */}
          <div
            className="relative z-10 grid"
            style={{ gridTemplateColumns: `repeat(${itemCount}, minmax(0, 1fr))` }}
          >
            {items.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item, index)}
                  className="relative flex flex-col items-center justify-center py-1.5 h-[50px] rounded-2xl active:scale-90 transition-transform duration-150 group focus:outline-none"
                >
                  {/* Icon with Unread Badge */}
                  <div className="relative flex items-center justify-center">
                    <MaterialSymbol
                      name={item.icon}
                      filled={isActive}
                      size={24}
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'text-pink-600 dark:text-pink-400 drop-shadow-[0_2px_8px_rgba(236,72,153,0.35)] scale-110'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:scale-105'
                      }`}
                    />

                    {item.hasBadge && (
                      <span className="absolute -top-1 -right-1.5 h-2.5 w-2.5 rounded-full bg-pink-500 border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] tracking-tight mt-0.5 transition-all duration-300 leading-none ${
                      isActive
                        ? 'font-black text-pink-600 dark:text-pink-400'
                        : 'font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Laptop & desktop: Persistent left sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-60 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-100 dark:border-slate-800 shadow-nav flex-col px-4 py-8">
        <div className="flex items-center gap-2 px-2 mb-10">
          <div className="h-9 w-9 rounded-xl bg-cta-gradient flex items-center justify-center shrink-0 shadow-cta">
            <MaterialSymbol name="favorite" size={18} className="text-white" filled />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Dil Mate</span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {items.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item, index)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl relative transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MaterialSymbol
                  name={item.icon}
                  filled={isActive}
                  size={22}
                  className={isActive ? 'text-pink-600 dark:text-pink-400' : 'text-slate-400'}
                />
                <span className={`text-[14px] ${isActive ? 'font-black' : 'font-semibold'}`}>
                  {item.label}
                </span>

                {item.hasBadge && (
                  <span className="absolute top-3 right-4 h-2 w-2 rounded-full bg-pink-500 border border-white dark:border-slate-900 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
