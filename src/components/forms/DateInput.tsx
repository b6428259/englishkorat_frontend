"use client"

import React, { forwardRef, useState } from 'react';
import { HiCalendarDays } from 'react-icons/hi2';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: 'primary' | 'secondary';
  error?: boolean;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ className = '', variant = 'primary', error = false, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    const baseClasses = "w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 bg-white";
    const variantClasses = {
      primary: `border-gray-300 focus:ring-[#334293] focus:border-[#334293] ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`,
      secondary: `border-gray-200 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`
    };

    return (
      <div className="relative">
        {/* Calendar Icon */}
        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
          focused ? 'text-[#334293]' : 'text-gray-400'
        }`}>
          <HiCalendarDays className={`w-4 h-4 transition-transform duration-200 ${focused ? 'scale-110' : 'scale-100'}`} />
        </div>
        
        {/* Date Input */}
        <input
          ref={ref}
          type="date"
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        
        {/* Focus ring effect */}
        {focused && !error && (
          <div className="absolute inset-0 rounded-md ring-2 ring-[#334293] ring-opacity-20 pointer-events-none animate-pulse" />
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
