import React from "react";

export const PageSkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-screen relative w-full bg-background-light overflow-x-hidden select-none">
      {/* Scrollable Skeleton Content Container */}
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full px-4 pt-3 pb-28 animate-pulse">
        {/* 1. Header Bar Skeleton */}
        <div className="flex items-center justify-between py-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* 2. Search / Segmented Bar Skeleton */}
        <div className="h-11 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs mb-4" />

        {/* 3. Horizontal Story / Category Pills Reel Skeleton */}
        <div className="flex items-center gap-3 mb-5 overflow-hidden">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="size-14 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-2.5 w-10 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>

        {/* 4. Main List / Card Skeletons */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 rounded-[1.75rem] p-3.5 flex items-center gap-3.5 shadow-xs border border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="w-16 h-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Persistent Glassy Bottom Nav Skeleton Placeholder */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 w-full h-[66px] bg-white/80 dark:bg-slate-900/85 backdrop-blur-2xl border-t border-white/80 dark:border-white/10 z-50 flex items-center justify-around px-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <div className="size-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-2 w-8 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
};
