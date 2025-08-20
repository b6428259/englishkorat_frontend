"use client"

import React, { forwardRef, useState } from 'react';
import { HiChevronDown, HiCheck } from 'react-icons/hi2';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: 'primary' | 'secondary';
  error?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  disabled?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    error = false, 
    disabled = false, 
    placeholder,
    size = 'md',
    options, 
    ...props 
  }, ref) => {
    const [focused, setFocused] = useState(false);

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg'
    };

    const baseClasses = `
      w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 
      bg-white appearance-none relative z-10 font-medium
      ${sizeClasses[size]}
    `;
    
    const cursorClass = disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-sm';
    
    const variantClasses = {
      primary: `
        border-gray-300 focus:ring-blue-500/20 focus:border-blue-500 
        hover:border-gray-400 hover:bg-gray-50/50
        ${error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : ''}
        ${disabled ? 'bg-gray-50 border-gray-200 text-gray-400' : 'text-gray-700'}
      `,
      secondary: `
        border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 
        hover:border-gray-300 hover:bg-purple-50/30
        ${error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : ''}
        ${disabled ? 'bg-gray-50 border-gray-200 text-gray-400' : 'text-gray-700'}
      `
    };

  const hasValue = props.value && props.value !== '';

    return (
      <div className="relative group">
        {/* Custom Select */}
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
          style={{ color: '#111827' }}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled || option.value === ''}
              style={option.value === '' ? { color: '#9CA3AF', fontWeight: '500' } : {}}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron with Animation */}
        <div className={`
          absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none 
          transition-all duration-300 z-20
          ${focused && !disabled ? 
            (variant === 'primary' ? 'text-blue-500' : 'text-purple-500') : 
            'text-gray-400'
          }
          ${disabled ? 'opacity-50' : ''}
        `}>
          <HiChevronDown className={`
            w-5 h-5 transition-all duration-300 
            ${focused && !disabled ? 'rotate-180 scale-110' : 'rotate-0'}
          `} />
        </div>
        
        {/* Floating Label Effect for Placeholder */}
        {placeholder && !hasValue && (
          <div className={`
            absolute left-3 transition-all duration-300 pointer-events-none
            ${size === 'sm' ? 'top-1.5 text-sm' : size === 'lg' ? 'top-3 text-lg' : 'top-2 text-base'}
            ${focused ? 'text-gray-400 scale-95' : 'text-gray-500'}
          `}>
            {placeholder}
          </div>
        )}
        
        {/* Focus Ring Effect */}
        {focused && !error && !disabled && (
          <div className={`
            absolute inset-0 rounded-lg ring-2 pointer-events-none transition-all duration-300
            ${variant === 'primary' ? 'ring-blue-500/20' : 'ring-purple-500/20'}
          `} />
        )}

        {/* Success Check Icon */}
        {hasValue && !error && !disabled && (
          <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
            <HiCheck className="w-4 h-4 text-green-500" />
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
