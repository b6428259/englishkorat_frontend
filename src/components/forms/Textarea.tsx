"use client"

import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'primary' | 'secondary';
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', variant = 'primary', error = false, ...props }, ref) => {
  const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors resize-vertical text-gray-900";
    const variantClasses = {
      primary: `border-gray-300 focus:ring-[#334293] focus:border-[#334293] ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`,
      secondary: `border-gray-200 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`
    };

    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
