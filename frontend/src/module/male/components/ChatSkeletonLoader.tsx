import React from "react";

interface ChatSkeletonLoaderProps {
  hasHeader?: boolean;
}

export const ChatSkeletonLoader: React.FC<ChatSkeletonLoaderProps> = ({
  hasHeader = true,
}) => {
  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden font-display">
      {/* 1. Chat Header Skeleton */}
      {hasHeader && (
        <div className="h-16 px-4 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 border-b border-slate-100 dark:border-slate-800 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <div className="size-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            {/* Avatar with status dot */}
            <div className="relative">
              <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400/50 border-2 border-white dark:border-slate-900" />
            </div>
            {/* Name & status */}
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-3 w-16 rounded-md bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="size-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="size-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      )}

      {/* 2. Messages Body Skeleton */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden flex flex-col justify-end pb-4">
        {/* Date separator pill */}
        <div className="flex justify-center my-2">
          <div className="h-5 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
        </div>

        {/* Incoming message 1 */}
        <div className="flex items-end gap-2.5 max-w-[80%]">
          <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 animate-pulse" />
          <div className="space-y-1">
            <div className="h-10 w-48 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-3 shadow-xs animate-pulse" />
            <div className="h-2.5 w-10 bg-slate-200/60 dark:bg-slate-800/60 rounded ml-1" />
          </div>
        </div>

        {/* Outgoing message 1 */}
        <div className="flex flex-col items-end gap-1 ml-auto max-w-[80%]">
          <div className="h-12 w-56 rounded-2xl rounded-br-sm bg-pink-100 dark:bg-pink-950/40 border border-pink-200/40 p-3 shadow-xs animate-pulse" />
          <div className="h-2.5 w-12 bg-slate-200/60 dark:bg-slate-800/60 rounded mr-1" />
        </div>

        {/* Incoming message 2 with image placeholder */}
        <div className="flex items-end gap-2.5 max-w-[80%]">
          <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 animate-pulse" />
          <div className="space-y-1">
            <div className="h-28 w-44 rounded-2xl rounded-bl-sm bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-xs animate-pulse flex items-center justify-center">
              <div className="size-8 rounded-full bg-slate-300/60 dark:bg-slate-700/60" />
            </div>
            <div className="h-2.5 w-10 bg-slate-200/60 dark:bg-slate-800/60 rounded ml-1" />
          </div>
        </div>

        {/* Outgoing message 2 */}
        <div className="flex flex-col items-end gap-1 ml-auto max-w-[80%]">
          <div className="h-9 w-36 rounded-2xl rounded-br-sm bg-pink-100 dark:bg-pink-950/40 border border-pink-200/40 p-3 shadow-xs animate-pulse" />
          <div className="h-2.5 w-10 bg-slate-200/60 dark:bg-slate-800/60 rounded mr-1" />
        </div>
      </div>

      {/* 3. Bottom Input Bar Skeleton */}
      <div className="p-3 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
        <div className="size-10 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="size-10 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="flex-1 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 animate-pulse" />
        <div className="size-10 rounded-2xl bg-pink-200 dark:bg-pink-900/40 animate-pulse" />
      </div>
    </div>
  );
};
