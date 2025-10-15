"use client";

export const WeekViewSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg border border-gray-100 h-full animate-pulse">
      {/* Summary Bar Skeleton */}
      <div className="bg-gray-200 h-8" />

      {/* Header Skeleton */}
      <div className="grid grid-cols-7 gap-2 p-2 border-b border-gray-100">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-2">
        <div className="grid grid-cols-7 gap-2 h-full">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-16 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MonthViewSkeleton = () => {
  return (
    <div className="h-full flex flex-col bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg border border-gray-200 animate-pulse">
      {/* Header Skeleton */}
      <div className="grid grid-cols-7 gap-2 p-3 border-b border-gray-200">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded" />
        ))}
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="flex-1 p-3">
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const DayViewSkeleton = () => {
  return (
    <div className="h-full bg-white rounded-xl shadow-lg border border-gray-200 animate-pulse">
      <div className="p-4 space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-16 h-20 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SessionCardSkeleton = () => {
  return (
    <div className="p-2 rounded border border-gray-200 bg-white animate-pulse">
      <div className="space-y-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
};
