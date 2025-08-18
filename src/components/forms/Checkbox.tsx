"use client"

import React, { forwardRef, useState } from 'react';
import { HiCheck } from 'react-icons/hi2';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, description, checked, onChange, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <label className={`flex items-start gap-3 cursor-pointer group ${className}`}>
        <div className="relative flex-shrink-0 mt-1">
          {/* Hidden native checkbox */}
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
          
          {/* Custom checkbox */}
          <div className={`
            w-4 h-4 border-2 rounded transition-all duration-200 flex items-center justify-center
            ${checked 
              ? 'bg-[#334293] border-[#334293] text-white transform scale-105' 
              : 'border-gray-300 bg-white hover:border-[#334293] hover:bg-blue-50'
            }
            ${focused ? 'ring-2 ring-[#334293] ring-opacity-30' : ''}
            group-hover:shadow-sm
          `}>
            {checked && (
              <HiCheck className="w-3 h-3 text-white animate-in fade-in-0 zoom-in-50 duration-150" />
            )}
          </div>
          
          {/* Focus ring */}
          {focused && (
            <div className="absolute inset-0 rounded ring-2 ring-[#334293] ring-opacity-20 animate-pulse" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <span className={`text-sm transition-colors duration-150 ${
            checked ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-gray-900'
          }`}>
            {label}
          </span>
          {description && (
            <p className={`text-xs mt-1 transition-colors duration-150 ${
              checked ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-600'
            }`}>
              {description}
            </p>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
