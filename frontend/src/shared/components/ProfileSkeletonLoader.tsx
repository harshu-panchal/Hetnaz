import React from "react";

export const ProfileSkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-screen pb-32 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full px-4 pt-3 animate-pulse bg-background-light">
      {/* Top Header Back Bar */}
      <div className="flex items-center justify-between py-2 mb-3">
        <div className="size-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="size-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Hero Photo Card Skeleton */}
      <div className="w-full aspect-[4/5] sm:aspect-square max-h-[460px] rounded-3xl bg-slate-200 dark:bg-slate-800 shadow-sm relative overflow-hidden mb-5">
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2">
          <div className="h-7 w-40 rounded-xl bg-slate-300 dark:bg-slate-700" />
          <div className="h-4 w-28 rounded-lg bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>

      {/* Badges / Chips row */}
      <div className="flex items-center gap-2 mb-5 overflow-hidden">
        <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="h-8 w-24 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="h-8 w-28 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
      </div>

      {/* Bio / About Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 mb-4">
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Fixed bottom action dock */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex gap-3 z-40 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        <div className="h-14 flex-1 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-14 flex-1 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
};
