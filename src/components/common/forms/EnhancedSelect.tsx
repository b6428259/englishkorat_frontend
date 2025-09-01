"use client";

import React from 'react';
import { HiChevronDown, HiCheck } from 'react-icons/hi2';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface EnhancedSelectProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
  maxHeight?: string;
}

export default function EnhancedSelect({
  value,
  onChange,
  options,
  placeholder = 'เลือก...',
  error = false,
  disabled = false,
  searchable = false,
  multiple = false,
  className = ''
}: EnhancedSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  
  const selectedOption = Array.isArray(value) 
    ? options.filter(opt => value.includes(opt.value))
    : options.find(opt => opt.value === value);
  
  const filteredOptions = searchable 
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        opt.description?.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
    setSearch('');
  };

  const isSelected = (optionValue: string) => {
    return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
  };

  const displayText = React.useMemo(() => {
    if (Array.isArray(selectedOption)) {
      return selectedOption.length > 0 
        ? `${selectedOption.length} selected` 
        : placeholder;
    }
    return selectedOption?.label || placeholder;
  }, [selectedOption, placeholder]);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full bg-white border rounded-xl px-4 py-3 pr-10 text-left
          transition-all duration-200
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
          }
          ${disabled 
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
            : 'hover:border-gray-400 focus:outline-none focus:ring-2'
          }
          ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}
        `}
      >
        <span className="flex items-center gap-3">
          {!Array.isArray(selectedOption) && selectedOption?.icon && (
            <span className="flex-shrink-0 text-gray-500">
              {selectedOption.icon}
            </span>
          )}
          <span className={`block truncate ${
            (Array.isArray(selectedOption) ? selectedOption.length > 0 : selectedOption) 
              ? 'text-gray-900' 
              : 'text-gray-500'
          }`}>
            {displayText}
          </span>
        </span>
        
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <HiChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden">
            {/* Search */}
            {searchable && (
              <div className="p-3 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            )}
            
            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  ไม่พบรายการที่ตรงกับการค้นหา
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150
                      ${isSelected(option.value) ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {option.icon && (
                          <span className="flex-shrink-0 text-gray-500">
                            {option.icon}
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate">{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-gray-500 truncate mt-0.5">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isSelected(option.value) && (
                        <HiCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
