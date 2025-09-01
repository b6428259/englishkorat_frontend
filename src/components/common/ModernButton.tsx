"use client";

import React from 'react';
import { HiOutlineSparkles } from 'react-icons/hi2';
import LoadingSpinner from './LoadingSpinner';

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  gradient?: boolean;
}

const variants = {
  primary: {
    base: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 focus:ring-blue-500',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 focus:ring-blue-500'
  },
  secondary: {
    base: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400 focus:ring-gray-500',
    gradient: 'bg-gradient-to-r from-gray-100 to-slate-100 hover:from-gray-200 hover:to-slate-200 text-gray-700 border-0 focus:ring-gray-500'
  },
  success: {
    base: 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700 focus:ring-green-500',
    gradient: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 focus:ring-green-500'
  },
  danger: {
    base: 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 focus:ring-red-500',
    gradient: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0 focus:ring-red-500'
  },
  ghost: {
    base: 'bg-transparent text-gray-600 border-0 hover:bg-gray-100 focus:ring-gray-500',
    gradient: 'bg-transparent text-gray-600 border-0 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 focus:ring-gray-500'
  },
  outline: {
    base: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500',
    gradient: 'bg-transparent text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 focus:ring-gray-500'
  }
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium',
  md: 'px-4 py-2 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-medium',
  xl: 'px-8 py-4 text-lg font-semibold'
};

export default function ModernButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = false,
  disabled,
  className = '',
  children,
  ...props
}: ModernButtonProps) {
  const variantClasses = gradient ? variants[variant].gradient : variants[variant].base;
  const sizeClasses = sizes[size];
  
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center gap-2 
        ${sizeClasses} ${variantClasses}
        border rounded-xl font-medium
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transform hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${fullWidth ? 'w-full' : ''}
        ${gradient ? 'shadow-lg hover:shadow-xl' : 'shadow-sm hover:shadow-md'}
        ${className}
      `}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner className="w-5 h-5" />
        </div>
      )}
      
      {/* Content */}
      <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
        
        {children && (
          <span>
            {children}
          </span>
        )}
        
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">
            {icon}
          </span>
        )}
        
        {gradient && variant === 'primary' && !icon && (
          <HiOutlineSparkles className="w-4 h-4 opacity-70" />
        )}
      </div>
    </button>
  );
}
