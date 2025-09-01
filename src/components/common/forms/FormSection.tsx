"use client";

import React from 'react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  children: React.ReactNode;
  className?: string;
}

const colorMap = {
  blue: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    title: 'text-gray-900',
    subtitle: 'text-blue-600'
  },
  green: {
    bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    title: 'text-gray-900',
    subtitle: 'text-green-600'
  },
  purple: {
    bg: 'bg-gradient-to-r from-purple-50 to-violet-50',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    title: 'text-gray-900',
    subtitle: 'text-purple-600'
  },
  orange: {
    bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    title: 'text-gray-900',
    subtitle: 'text-orange-600'
  },
  red: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    title: 'text-gray-900',
    subtitle: 'text-red-600'
  },
  gray: {
    bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
    title: 'text-gray-900',
    subtitle: 'text-gray-600'
  }
};

export default function FormSection({ 
  title, 
  subtitle, 
  icon, 
  color = 'blue', 
  children, 
  className = '' 
}: FormSectionProps) {
  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        {icon ? (
          <div className={`flex-shrink-0 w-8 h-8 ${colors.dot} rounded-lg flex items-center justify-center text-white text-sm`}>
            {icon}
          </div>
        ) : (
          <span className={`w-3 h-3 ${colors.dot} rounded-full flex-shrink-0 mt-1.5`}></span>
        )}
        <div className="min-w-0 flex-1">
          <h4 className={`font-semibold text-lg ${colors.title} leading-tight`}>
            {title}
          </h4>
          {subtitle && (
            <p className={`text-sm ${colors.subtitle} mt-1 leading-relaxed`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}
