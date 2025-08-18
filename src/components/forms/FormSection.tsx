"use client"

import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  className = '',
  titleClassName = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className={`text-xl font-semibold text-gray-800 border-b pb-2 ${titleClassName}`}>
        {title}
      </h2>
      {children}
    </div>
  );
};
