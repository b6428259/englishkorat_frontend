"use client";

import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownOption {
  value: string | number;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | number;
  placeholder?: string;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  onChange,
  disabled = false,
  className = '',
  error,
  label,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((option: DropdownOption) => {
    if (!option.disabled) {
      onChange?.(option.value);
      setIsOpen(false);
      setFocusedIndex(-1);
      buttonRef.current?.focus();
    }
  }, [onChange]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev + 1;
            return nextIndex >= options.length ? 0 : nextIndex;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev - 1;
            return nextIndex < 0 ? options.length - 1 : nextIndex;
          });
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0) {
            const option = options[focusedIndex];
            if (!option.disabled) {
              handleSelect(option);
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, focusedIndex, options, handleSelect]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFocusedIndex(value ? options.findIndex(opt => opt.value === value) : -1);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            relative w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-[#334293] focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${isOpen ? 'ring-2 ring-[#334293] border-transparent' : 'hover:border-gray-400'}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? undefined : 'dropdown-label'}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {selectedOption?.icon && (
                <span className="mr-2 flex-shrink-0">
                  {selectedOption.icon}
                </span>
              )}
              <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                {selectedOption?.label || placeholder}
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
            </svg>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              <ul role="listbox" className="py-1">
                {options.map((option, index) => (
                  <li key={option.value} role="option" aria-selected={option.value === value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option)}
                      disabled={option.disabled}
                      className={`
                        w-full px-3 py-2 text-left flex items-center
                        ${option.disabled 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-900 hover:bg-gray-50 cursor-pointer'
                        }
                        ${index === focusedIndex ? 'bg-blue-50' : ''}
                        ${option.value === value ? 'bg-[#334293] bg-opacity-10 text-[#334293]' : ''}
                      `}
                      onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
                      onMouseLeave={() => setFocusedIndex(-1)}
                    >
                      {option.icon && (
                        <span className="mr-2 flex-shrink-0">
                          {option.icon}
                        </span>
                      )}
                      <span>{option.label}</span>
                      {option.value === value && (
                        <svg
                          className="w-4 h-4 ml-auto text-[#334293]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 13 4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Dropdown;