"use client"

import React, { useState, useRef, useEffect } from 'react';
import { HiCalendarDays, HiChevronLeft, HiChevronRight, HiXMark } from 'react-icons/hi2';

interface CalendarProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  language?: 'th' | 'en';
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  value = '',
  onChange,
  placeholder = 'Select Date',
  error = false,
  disabled = false,
  language = 'en',
  minDate,
  maxDate,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [focused, setFocused] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse selected date
  const selectedDate = value ? new Date(value) : null;

  // Month names
  const monthNames = language === 'th' ? [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ] : [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = language === 'th' 
    ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Format date for display
  const formatDate = (date: Date) => {
    if (language === 'th') {
      const thaiYear = date.getFullYear() + 543;
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${thaiYear}`;
    }
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Get display value
  const getDisplayValue = () => {
    if (!selectedDate) return '';
    return formatDate(selectedDate);
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Check if date is selectable
  const isDateSelectable = (date: Date) => {
    if (disabled) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    
    if (minDate && dateStr < minDate) return false;
    if (maxDate && dateStr > maxDate) return false;
    
    return true;
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;
    
    const dateStr = date.toISOString().split('T')[0];
    onChange?.(dateStr);
    setIsOpen(false);
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  // Navigate years
  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  // Set specific month
  const setMonth = (monthIndex: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(monthIndex);
      return newDate;
    });
    setShowMonthPicker(false);
  };

  // Set specific year
  const setYear = (year: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearPicker(false);
  };

  // Get year range for picker
  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    const endYear = currentYear + 10;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (isDateSelectable(today)) {
      const dateStr = today.toISOString().split('T')[0];
      onChange?.(dateStr);
      setIsOpen(false);
    }
  };

  // Clear selection
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocused(false);
        setShowYearPicker(false);
        setShowMonthPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize current month based on selected date or today
  useEffect(() => {
    if (selectedDate && isOpen) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate, isOpen]);

  const calendarDays = getCalendarDays();
  const today = new Date();
  const currentMonthYear = language === 'th' 
    ? `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear() + 543}`
    : `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  return (
    <div ref={calendarRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div
        className={`
          relative w-full border rounded-lg cursor-pointer transition-all duration-300
          ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : 'bg-white hover:shadow-sm'}
          ${error ? 'border-red-400 focus-within:ring-red-500/20 focus-within:border-red-500' : 
            focused || isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300 hover:border-gray-400'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {/* Calendar Icon */}
        <div className={`
          absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200
          ${focused || isOpen ? 'text-blue-500' : 'text-gray-400'}
        `}>
          <HiCalendarDays className={`
            w-5 h-5 transition-transform duration-200 
            ${focused || isOpen ? 'scale-110' : 'scale-100'}
          `} />
        </div>

        {/* Input Display */}
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={getDisplayValue()}
          placeholder={placeholder}
          className={`
            w-full pl-12 pr-12 py-3 bg-transparent border-none outline-none cursor-pointer font-medium
            ${disabled ? 'text-gray-400' : selectedDate ? 'text-gray-900' : 'text-gray-500'}
            placeholder:text-gray-400 placeholder:font-normal
          `}
          onFocus={() => !disabled && setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
        />

        {/* Clear Button */}
        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <HiXMark className="w-4 h-4" />
          </button>
        )}

        {/* Chevron */}
        <div className={`
          absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none transition-all duration-300
          ${focused || isOpen ? 'text-blue-500 rotate-180' : 'text-gray-400'}
        `}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 min-w-[320px] animate-in slide-in-from-top-2 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {!showYearPicker && !showMonthPicker && (
              <>
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowMonthPicker(true)}
                    className="font-semibold text-gray-900 hover:text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors duration-200"
                  >
                    {monthNames[currentMonth.getMonth()]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowYearPicker(true)}
                    className="font-semibold text-gray-900 hover:text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors duration-200"
                  >
                    {language === 'th' ? currentMonth.getFullYear() + 543 : currentMonth.getFullYear()}
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <HiChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Year Picker Header */}
            {showYearPicker && (
              <>
                <button
                  type="button"
                  onClick={() => navigateYear('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="font-semibold text-gray-900 text-lg">
                  {language === 'th' ? 'เลือกปี' : 'Select Year'}
                </div>
                
                <button
                  type="button"
                  onClick={() => navigateYear('next')}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <HiChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Month Picker Header */}
            {showMonthPicker && (
              <div className="w-full text-center">
                <div className="font-semibold text-gray-900 text-lg">
                  {language === 'th' ? 'เลือกเดือน' : 'Select Month'}
                </div>
              </div>
            )}
          </div>

          {/* Year Picker Grid */}
          {showYearPicker && (
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {getYearRange().map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setYear(year)}
                  className={`
                    p-3 rounded-lg font-medium transition-all duration-200
                    ${year === currentMonth.getFullYear()
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                    }
                  `}
                >
                  {language === 'th' ? year + 543 : year}
                </button>
              ))}
            </div>
          )}

          {/* Month Picker Grid */}
          {showMonthPicker && (
            <div className="grid grid-cols-3 gap-2">
              {monthNames.map((month, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMonth(index)}
                  className={`
                    p-3 rounded-lg font-medium transition-all duration-200
                    ${index === currentMonth.getMonth()
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                    }
                  `}
                >
                  {month}
                </button>
              ))}
            </div>
          )}

          {/* Calendar View */}
          {!showYearPicker && !showMonthPicker && (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                  const isSelectable = isDateSelectable(date);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      disabled={!isSelectable}
                      className={`
                        relative p-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${!isCurrentMonth ? 'text-gray-300' : 
                          isSelected ? 'bg-blue-500 text-white shadow-md' :
                          isToday ? 'bg-blue-50 text-blue-600 font-semibold' :
                          isSelectable ? 'text-gray-700 hover:bg-gray-100' : 
                          'text-gray-300 cursor-not-allowed'}
                        ${isSelectable && !isSelected ? 'hover:scale-105' : ''}
                      `}
                    >
                      {date.getDate()}
                      {isToday && !isSelected && (
                        <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer */}
          {!showYearPicker && !showMonthPicker && (
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={goToToday}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                {language === 'th' ? 'วันนี้' : 'Today'}
              </button>
              
              {selectedDate && (
                <div className="text-sm text-gray-500">
                  {language === 'th' ? 'เลือกแล้ว:' : 'Selected:'} {getDisplayValue()}
                </div>
              )}
            </div>
          )}

          {/* Back buttons for pickers */}
          {(showYearPicker || showMonthPicker) && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowYearPicker(false);
                  setShowMonthPicker(false);
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                ← {language === 'th' ? 'กลับ' : 'Back'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
