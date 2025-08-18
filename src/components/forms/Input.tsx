"use client"

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'primary' | 'secondary';
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', variant = 'primary', error = false, ...props }, ref) => {
  const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors text-gray-900";
    const variantClasses = {
      primary: `border-gray-300 focus:ring-[#334293] focus:border-[#334293] ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`,
      secondary: `border-gray-200 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`
    };

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
