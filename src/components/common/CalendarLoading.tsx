"use client";

import React from 'react';

interface CalendarLoadingProps {
  view: 'day' | 'week' | 'month';
}

export default function CalendarLoading({ view }: CalendarLoadingProps) {
  if (view === 'day') {
    return (
      <div className="h-full animate-pulse">
        {/* Header skeleton */}
        <div className="flex h-12 border-b">
          <div className="w-20 bg-gray-200"></div>
          <div className="flex-1 flex">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-1 border-l bg-gray-100">
                <div className="h-8 bg-gray-200 m-2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Time slots skeleton */}
        <div className="space-y-px">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex h-8">
              <div className="w-20 bg-gray-100 border-r"></div>
              <div className="flex-1 flex">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex-1 border-l border-b bg-white">
                    {(i + j) % 4 === 0 && (
                      <div className="m-1 h-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded animate-pulse"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'week') {
    return (
      <div className="h-full animate-pulse">
        {/* Week header skeleton */}
        <div className="grid grid-cols-7 gap-px bg-gray-300 mb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Week content skeleton */}
        <div className="grid grid-cols-7 gap-px bg-gray-300 flex-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white p-2 space-y-2">
              {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, j) => (
                <div key={j} className="h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded animate-pulse"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Month view skeleton
  return (
    <div className="h-full animate-pulse">
      {/* Month header skeleton */}
      <div className="grid grid-cols-7 gap-px bg-gray-300 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-gray-100 p-2">
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      
      {/* Month grid skeleton */}
      <div className="grid grid-cols-7 gap-px bg-gray-300 flex-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="bg-white p-1 min-h-[120px]">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            {Array.from({ length: Math.floor(Math.random() * 2) }).map((_, j) => (
              <div key={j} className="h-6 bg-gradient-to-r from-teal-100 to-teal-200 rounded mb-1 animate-pulse"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
