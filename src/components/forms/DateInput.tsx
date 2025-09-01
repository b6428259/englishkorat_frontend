"use client"

import React, { forwardRef } from 'react';
import { Calendar } from '../common/Calendar';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  variant?: 'primary' | 'secondary';
  error?: boolean;
  language?: 'th' | 'en';
  onChange?: (e: { target: { value: string } }) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ 
    className = '', 
    error = false, 
    language = 'th',
    onChange,
    value,
    placeholder,
    disabled
  }, ref) => {
    const handleDateChange = (dateStr: string) => {
      onChange?.({ target: { value: dateStr } });
    };

    return (
      <div ref={ref}>
        <Calendar
          value={value as string}
          onChange={handleDateChange}
          error={error}
          disabled={disabled}
          language={language}
          placeholder={placeholder || (language === 'th' ? 'เลือกวันที่' : 'Select Date')}
          className={className}
        />
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
