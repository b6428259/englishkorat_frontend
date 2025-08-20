"use client"

import React, { useState } from 'react';
import { HiCalendarDays, HiClock, HiPlus, HiXMark, HiCheck } from 'react-icons/hi2';
import { Select } from '../forms';

interface TimeSlot {
  id: string;
  day: string;
  timeFrom: string;
  timeTo: string;
}

interface BulkTimeSlot {
  days: string[];
  timeFrom: string;
  timeTo: string;
}

interface TimeSlotSelectorProps {
  value: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  title: string;
  description?: string;
  error?: boolean;
  disabled?: boolean;
  language?: 'th' | 'en';
  maxSlots?: number;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  value = [],
  onChange,
  title,
  description,
  error = false,
  disabled = false,
  language = 'th',
  maxSlots = 14
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSlot, setBulkSlot] = useState<BulkTimeSlot>({ days: [], timeFrom: '', timeTo: '' });

  const daysOfWeek = language === 'th' ? [
    { value: 'monday', label: 'จันทร์', shortLabel: 'จ' },
    { value: 'tuesday', label: 'อังคาร', shortLabel: 'อ' },
    { value: 'wednesday', label: 'พุธ', shortLabel: 'พ' },
    { value: 'thursday', label: 'พฤหัสบดี', shortLabel: 'พฤ' },
    { value: 'friday', label: 'ศุกร์', shortLabel: 'ศ' },
    { value: 'saturday', label: 'เสาร์', shortLabel: 'ส' },
    { value: 'sunday', label: 'อาทิตย์', shortLabel: 'อา' }
  ] : [
    { value: 'monday', label: 'Monday', shortLabel: 'Mon' },
    { value: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
    { value: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
    { value: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
    { value: 'friday', label: 'Friday', shortLabel: 'Fri' },
    { value: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
    { value: 'sunday', label: 'Sunday', shortLabel: 'Sun' }
  ];

  const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    return { value: time, label: time };
  });

  const addTimeSlot = () => {
    if (value.length >= maxSlots) return;
    
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      day: '',
      timeFrom: '',
      timeTo: ''
    };
    onChange([...value, newSlot]);
  };

  const removeTimeSlot = (id: string) => {
    onChange(value.filter(slot => slot.id !== id));
  };

  const updateTimeSlot = (id: string, field: keyof Omit<TimeSlot, 'id'>, newValue: string) => {
    onChange(value.map(slot => 
      slot.id === id ? { ...slot, [field]: newValue } : slot
    ));
  };

  const getDayLabel = (dayValue: string) => {
    return daysOfWeek.find(d => d.value === dayValue)?.label || dayValue;
  };

  const toggleBulkDay = (dayValue: string) => {
    setBulkSlot(prev => ({
      ...prev,
      days: prev.days.includes(dayValue) 
        ? prev.days.filter(d => d !== dayValue)
        : [...prev.days, dayValue]
    }));
  };

  const addBulkTimeSlots = () => {
    if (!bulkSlot.days.length || !bulkSlot.timeFrom || !bulkSlot.timeTo) return;
    if (bulkSlot.timeFrom >= bulkSlot.timeTo) return;

    const newSlots = bulkSlot.days.map(day => ({
      id: `${Date.now()}_${day}`,
      day,
      timeFrom: bulkSlot.timeFrom,
      timeTo: bulkSlot.timeTo
    }));

    // Filter out slots that would exceed maxSlots
    const slotsToAdd = newSlots.slice(0, Math.max(0, maxSlots - value.length));
    
    onChange([...value, ...slotsToAdd]);
    
    // Reset bulk form
    setBulkSlot({ days: [], timeFrom: '', timeTo: '' });
    setBulkMode(false);
  };

  const selectAllDays = () => {
    setBulkSlot(prev => ({
      ...prev,
      days: prev.days.length === daysOfWeek.length ? [] : daysOfWeek.map(d => d.value)
    }));
  };

  const selectWeekdays = () => {
    const weekdays = daysOfWeek.slice(0, 5).map(d => d.value); // Mon-Fri
    setBulkSlot(prev => ({
      ...prev,
      days: prev.days.length === weekdays.length && weekdays.every(d => prev.days.includes(d)) 
        ? [] : weekdays
    }));
  };

  const selectWeekends = () => {
    const weekends = daysOfWeek.slice(5).map(d => d.value); // Sat-Sun
    setBulkSlot(prev => ({
      ...prev,
      days: prev.days.length === weekends.length && weekends.every(d => prev.days.includes(d))
        ? [] : weekends
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div 
        className={`
          p-4 border-2 rounded-xl cursor-pointer transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
          ${error ? 'border-red-400 bg-red-50/50' : 
            isExpanded ? 'border-blue-400 bg-blue-50/50' : 
            'border-gray-200 bg-white hover:border-gray-300'}
        `}
        onClick={() => !disabled && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              p-2 rounded-lg transition-colors duration-200
              ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
            `}>
              <HiCalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{title}</h3>
              {description && (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              )}
              {value.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {value.slice(0, 3).map((slot) => (
                    <span key={slot.id} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      <HiClock className="w-3 h-3 mr-1" />
                      {slot.day && slot.timeFrom && slot.timeTo ? 
                        `${getDayLabel(slot.day)} ${slot.timeFrom}-${slot.timeTo}` :
                        (language === 'th' ? 'ยังไม่ครบ' : 'Incomplete')
                      }
                    </span>
                  ))}
                  {value.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{value.length - 3} {language === 'th' ? 'เพิ่มเติม' : 'more'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className={`
            transform transition-transform duration-300
            ${isExpanded ? 'rotate-180' : 'rotate-0'}
          `}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && !disabled && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={() => setBulkMode(!bulkMode)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${bulkMode 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                }
              `}
            >
              {bulkMode ? 
                (language === 'th' ? '✓ โหมดเลือกหลายวัน' : '✓ Bulk Selection') :
                (language === 'th' ? 'เลือกหลายวันพร้อมกัน' : 'Bulk Selection')
              }
            </button>
            
            {!bulkMode && value.length < maxSlots && (
              <button
                type="button"
                onClick={addTimeSlot}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200"
              >
                <HiPlus className="w-4 h-4 inline mr-1" />
                {language === 'th' ? 'เพิ่มทีละช่วง' : 'Add Single Slot'}
              </button>
            )}
          </div>

          {/* Bulk Selection Mode */}
          {bulkMode && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <h4 className="font-medium text-gray-800 mb-4">
                {language === 'th' ? 'เลือกหลายวันพร้อมกัน' : 'Bulk Day Selection'}
              </h4>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                >
                  {bulkSlot.days.length === daysOfWeek.length ? 
                    (language === 'th' ? 'ยกเลิกทั้งหมด' : 'Deselect All') :
                    (language === 'th' ? 'เลือกทั้งหมด' : 'Select All')
                  }
                </button>
                <button
                  type="button"
                  onClick={selectWeekdays}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                >
                  {language === 'th' ? 'วันจันทร์-ศุกร์' : 'Weekdays'}
                </button>
                <button
                  type="button"
                  onClick={selectWeekends}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                >
                  {language === 'th' ? 'วันเสาร์-อาทิตย์' : 'Weekends'}
                </button>
              </div>

              {/* Day Selection Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleBulkDay(day.value)}
                    className={`
                      p-3 rounded-lg font-medium transition-all duration-200 text-sm
                      ${bulkSlot.days.includes(day.value)
                        ? 'bg-blue-500 text-white shadow-md transform scale-105'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                      }
                    `}
                  >
                    <div className="text-xs mb-1">{day.shortLabel}</div>
                    <div className="text-xs opacity-80">{day.label}</div>
                    {bulkSlot.days.includes(day.value) && (
                      <HiCheck className="w-4 h-4 mx-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'th' ? 'เวลาเริ่ม' : 'Start Time'}
                  </label>
                  <Select
                    options={[{ value: '', label: language === 'th' ? 'เลือกเวลาเริ่ม' : 'Select Start Time', disabled: true }, ...timeOptions]}
                    value={bulkSlot.timeFrom}
                    onChange={(e) => setBulkSlot(prev => ({ ...prev, timeFrom: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'th' ? 'เวลาสิ้นสุด' : 'End Time'}
                  </label>
                  <Select
                    options={[{ value: '', label: language === 'th' ? 'เลือกเวลาสิ้นสุด' : 'Select End Time', disabled: true }, ...timeOptions.filter(time => !bulkSlot.timeFrom || time.value > bulkSlot.timeFrom)]}
                    value={bulkSlot.timeTo}
                    onChange={(e) => setBulkSlot(prev => ({ ...prev, timeTo: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Apply Bulk Selection */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {bulkSlot.days.length > 0 && bulkSlot.timeFrom && bulkSlot.timeTo ? (
                    <span className="text-green-600">
                      {language === 'th' 
                        ? `จะเพิ่ม ${bulkSlot.days.length} ช่วงเวลา`
                        : `Will add ${bulkSlot.days.length} time slots`
                      }
                    </span>
                  ) : (
                    <span className="text-amber-600">
                      {language === 'th' ? 'กรุณาเลือกวันและเวลา' : 'Please select days and times'}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkMode(false);
                      setBulkSlot({ days: [], timeFrom: '', timeTo: '' });
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={addBulkTimeSlots}
                    disabled={!bulkSlot.days.length || !bulkSlot.timeFrom || !bulkSlot.timeTo}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {language === 'th' ? 'เพิ่มช่วงเวลาทั้งหมด' : 'Add All Slots'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Time Slots */}
          {value.map((slot, index) => (
            <div key={slot.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">
                  {language === 'th' ? `ช่วงเวลาที่ ${index + 1}` : `Time Slot ${index + 1}`}
                </h4>
                <button
                  type="button"
                  onClick={() => removeTimeSlot(slot.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Day Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'th' ? 'วัน' : 'Day'}
                  </label>
                  <Select
                    options={[{ value: '', label: language === 'th' ? 'เลือกวัน' : 'Select Day', disabled: true }, ...daysOfWeek.map(day => ({ value: day.value, label: day.label }))]}
                    value={slot.day}
                    onChange={(e) => updateTimeSlot(slot.id, 'day', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Time From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'th' ? 'เวลาเริ่ม' : 'From'}
                  </label>
                  <Select
                    options={[{ value: '', label: language === 'th' ? 'เลือกเวลาเริ่ม' : 'Select Start Time', disabled: true }, ...timeOptions]}
                    value={slot.timeFrom}
                    onChange={(e) => updateTimeSlot(slot.id, 'timeFrom', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Time To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'th' ? 'เวลาสิ้นสุด' : 'To'}
                  </label>
                  <Select
                    options={[{ value: '', label: language === 'th' ? 'เลือกเวลาสิ้นสุด' : 'Select End Time', disabled: true }, ...timeOptions.filter(time => !slot.timeFrom || time.value > slot.timeFrom)]}
                    value={slot.timeTo}
                    onChange={(e) => updateTimeSlot(slot.id, 'timeTo', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}

          {value.length >= maxSlots && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                {language === 'th' 
                  ? `สามารถเพิ่มได้สูงสุด ${maxSlots} ช่วงเวลา`
                  : `Maximum ${maxSlots} time slots allowed`
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};
