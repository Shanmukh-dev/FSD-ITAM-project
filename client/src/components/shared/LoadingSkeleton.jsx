import React from 'react';

export const LoadingSkeleton = ({ type = 'table', rows = 5 }) => {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 animate-pulse shadow-xs"
          >
            <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-24 mb-4" />
            <div className="h-8 bg-slate-200 dark:bg-white/10 rounded w-16 mb-2" />
            <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 animate-pulse flex flex-col gap-3 shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-32" />
              <div className="h-5 bg-slate-200 dark:bg-white/10 rounded-full w-16" />
            </div>
            <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-48" />
            <div className="h-20 bg-slate-100 dark:bg-white/5 rounded-lg w-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  // Default table skeleton
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden p-4 animate-pulse shadow-xs">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48" />
        <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-lg w-28" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-3.5 bg-slate-200 dark:bg-white/10 rounded w-24" />
            <div className="h-3.5 bg-slate-200 dark:bg-white/10 rounded flex-1" />
            <div className="h-3.5 bg-slate-100 dark:bg-white/5 rounded w-28" />
            <div className="h-5 bg-slate-200 dark:bg-white/10 rounded-full w-20" />
            <div className="h-3.5 bg-slate-100 dark:bg-white/5 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
