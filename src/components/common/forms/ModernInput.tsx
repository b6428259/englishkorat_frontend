"use client";

import React from 'react';

interface ModernInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg'
};

export default function ModernInput({
  label,
  error = false,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  className = '',
  disabled,
  ...props
}: ModernInputProps) {
  const inputId = React.useId();
  
  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className={`${disabled ? 'text-gray-300' : error ? 'text-red-400' : 'text-gray-400'}`}>
              {leftIcon}
            </span>
          </div>
        )}
        
        {/* Input */}
        <input
          {...props}
          id={inputId}
          disabled={disabled}
          className={`
            block w-full border rounded-xl transition-all duration-200
            ${sizeClasses[size]}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${disabled 
              ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
              : 'bg-white'
            }
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900 placeholder-red-300' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-gray-900 placeholder-gray-400'
            }
            focus:outline-none focus:ring-2
            ${className}
          `}
        />
        
        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className={`${disabled ? 'text-gray-300' : error ? 'text-red-400' : 'text-gray-400'}`}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {/* Helper Text */}
      {helperText && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
