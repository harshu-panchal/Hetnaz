import React from "react";

export const PageSkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-screen pb-24 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full px-4 pt-4 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex items-center justify-between pb-6 pt-2">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="space-y-2.5">
            <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
      </div>

      {/* 2. Top Banner / Tabs Skeleton */}
      <div className="flex items-center gap-4 pb-4">
        <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* 3. Cards / Items Skeleton */}
      <div className="space-y-3.5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="bg-white dark:bg-slate-900 rounded-[1.75rem] p-4 flex items-center gap-3.5 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="w-16 h-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
