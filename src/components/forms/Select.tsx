"use client"

import React, { forwardRef, useState } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'primary' | 'secondary';
  error?: boolean;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', variant = 'primary', error = false, disabled = false, options, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    const baseClasses = "w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 bg-white appearance-none";
    const cursorClass = disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';
    const variantClasses = {
      primary: `border-gray-300 focus:ring-[#334293] focus:border-[#334293] hover:border-gray-400 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${disabled ? 'bg-gray-50 border-gray-200' : ''}`,
      secondary: `border-gray-200 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${disabled ? 'bg-gray-50 border-gray-200' : ''}`
    };

    return (
      <div className="relative">
        <select
          ref={ref}
          className={`${baseClasses} ${variantClasses[variant]} ${cursorClass} ${className}`}
          disabled={disabled}
          onFocus={(e) => {
            if (!disabled) {
              setFocused(true);
              props.onFocus?.(e);
            }
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron */}
        <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none transition-all duration-200 ${
          focused && !disabled ? 'text-[#334293] transform translate-y-0' : 'text-gray-400'
        } ${disabled ? 'opacity-60' : ''}`}>
          <HiChevronDown className={`w-4 h-4 transition-transform duration-200 ${focused && !disabled ? 'rotate-180 scale-110' : 'rotate-0'}`} />
        </div>
        
        {/* Focus ring effect */}
        {focused && !error && !disabled && (
          <div className="absolute inset-0 rounded-md ring-2 ring-[#334293] ring-opacity-20 pointer-events-none" />
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
