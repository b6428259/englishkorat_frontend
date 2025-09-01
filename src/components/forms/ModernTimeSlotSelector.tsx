"use client";

import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiClock, 
  HiPlus, 
  HiXMark, 
  HiCheck, 
  HiExclamationTriangle,
  HiTrash,
  HiDocumentDuplicate
} from 'react-icons/hi2';

// Enhanced interfaces for better type safety
interface LegacyTimeSlot {
  id: string;
  day: string;
  timeFrom: string;
  timeTo: string;
}

interface ScheduleTimeSlot {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

type TimeSlot = LegacyTimeSlot | ScheduleTimeSlot;

interface ModernTimeSlotSelectorProps {
  value: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  title: string;
  description?: string;
  disabled?: boolean;
  language?: 'th' | 'en';
  maxSlots?: number;
  format?: 'legacy' | 'schedule';
  variant?: 'default' | 'compact' | 'mobile' | 'card';
  showBulkSelection?: boolean;
  className?: string;
}

export const ModernTimeSlotSelector: React.FC<ModernTimeSlotSelectorProps> = ({
  value = [],
  onChange,
  title,
  description,
  disabled = false,
  language = 'th',
  maxSlots = 14,
  format = 'legacy',
  variant = 'default',
  showBulkSelection = true,
  className = ''
}) => {

  // Enhanced day options with better mobile support
  const daysOfWeek = useMemo(() => {
    const days = language === 'th' ? [
      { value: 'monday', label: 'จันทร์', shortLabel: 'จ.', emoji: '📅' },
      { value: 'tuesday', label: 'อังคาร', shortLabel: 'อ.', emoji: '📅' },
      { value: 'wednesday', label: 'พุธ', shortLabel: 'พ.', emoji: '📅' },
      { value: 'thursday', label: 'พฤหัสบดี', shortLabel: 'พฤ.', emoji: '📅' },
      { value: 'friday', label: 'ศุกร์', shortLabel: 'ศ.', emoji: '📅' },
      { value: 'saturday', label: 'เสาร์', shortLabel: 'ส.', emoji: '🎯' },
      { value: 'sunday', label: 'อาทิตย์', shortLabel: 'อา.', emoji: '🌟' }
    ] : [
      { value: 'monday', label: 'Monday', shortLabel: 'Mon', emoji: '📅' },
      { value: 'tuesday', label: 'Tuesday', shortLabel: 'Tue', emoji: '📅' },
      { value: 'wednesday', label: 'Wednesday', shortLabel: 'Wed', emoji: '📅' },
      { value: 'thursday', label: 'Thursday', shortLabel: 'Thu', emoji: '📅' },
      { value: 'friday', label: 'Friday', shortLabel: 'Fri', emoji: '📅' },
      { value: 'saturday', label: 'Saturday', shortLabel: 'Sat', emoji: '🎯' },
      { value: 'sunday', label: 'Sunday', shortLabel: 'Sun', emoji: '🌟' }
    ];
    return days;
  }, [language]);

  // Helper functions
  const isLegacySlot = (slot: TimeSlot): slot is LegacyTimeSlot => {
    return 'id' in slot;
  };

  const getSlotId = useCallback((slot: TimeSlot, index: number): string => {
    return isLegacySlot(slot) ? slot.id : `schedule-${index}`;
  }, []);

  const getSlotDay = useCallback((slot: TimeSlot): string => {
    return isLegacySlot(slot) ? slot.day : slot.day_of_week;
  }, []);

  const getSlotStartTime = useCallback((slot: TimeSlot): string => {
    return isLegacySlot(slot) ? slot.timeFrom : slot.start_time;
  }, []);

  const getSlotEndTime = useCallback((slot: TimeSlot): string => {
    return isLegacySlot(slot) ? slot.timeTo : slot.end_time;
  }, []);

  const createNewSlot = useCallback((): TimeSlot => {
    if (format === 'schedule') {
      return {
        day_of_week: '',
        start_time: '',
        end_time: ''
      } as ScheduleTimeSlot;
    } else {
      return {
        id: Date.now().toString(),
        day: '',
        timeFrom: '',
        timeTo: ''
      } as LegacyTimeSlot;
    }
  }, [format]);

  const updateSlotField = useCallback((slot: TimeSlot, field: string, slotValue: string): TimeSlot => {
    if (format === 'schedule') {
      const scheduleSlot = slot as ScheduleTimeSlot;
      switch (field) {
        case 'day':
        case 'day_of_week':
          return { ...scheduleSlot, day_of_week: slotValue };
        case 'timeFrom':
        case 'start_time':
          return { ...scheduleSlot, start_time: slotValue };
        case 'timeTo':
        case 'end_time':
          return { ...scheduleSlot, end_time: slotValue };
        default:
          return scheduleSlot;
      }
    } else {
      const legacySlot = slot as LegacyTimeSlot;
      switch (field) {
        case 'day':
        case 'day_of_week':
          return { ...legacySlot, day: slotValue };
        case 'timeFrom':
        case 'start_time':
          return { ...legacySlot, timeFrom: slotValue };
        case 'timeTo':
        case 'end_time':
          return { ...legacySlot, timeTo: slotValue };
        default:
          return legacySlot;
      }
    }
  }, [format]);

  const addTimeSlot = useCallback(() => {
    if (value.length >= maxSlots) return;
    
    const newSlot = createNewSlot();
    onChange([...value, newSlot]);
  }, [value, maxSlots, createNewSlot, onChange]);

  const removeTimeSlot = useCallback((slotToRemove: TimeSlot, index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  }, [value, onChange]);

  const updateTimeSlot = useCallback((index: number, field: string, slotValue: string) => {
    const updatedSlots = value.map((slot, i) => 
      i === index ? updateSlotField(slot, field, slotValue) : slot
    );
    onChange(updatedSlots);
  }, [value, updateSlotField, onChange]);

  const duplicateTimeSlot = useCallback((index: number) => {
    if (value.length >= maxSlots) return;
    
    const slotToDuplicate = value[index];
    const newSlot = format === 'schedule' 
      ? { ...slotToDuplicate as ScheduleTimeSlot }
      : { ...(slotToDuplicate as LegacyTimeSlot), id: Date.now().toString() };
    
    const newValue = [...value];
    newValue.splice(index + 1, 0, newSlot);
    onChange(newValue);
  }, [value, maxSlots, format, onChange]);

  // Validation
  const isSlotValid = useCallback((slot: TimeSlot): boolean => {
    const day = getSlotDay(slot);
    const startTime = getSlotStartTime(slot);
    const endTime = getSlotEndTime(slot);
    
    return day !== '' && startTime !== '' && endTime !== '' && startTime < endTime;
  }, [getSlotDay, getSlotStartTime, getSlotEndTime]);

  const validSlots = useMemo(() => value.filter(isSlotValid), [value, isSlotValid]);
  const invalidSlots = useMemo(() => value.filter(slot => !isSlotValid(slot)), [value, isSlotValid]);

  // Mobile Card Variant (New modern design)
  if (variant === 'mobile' || variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <HiClock className="w-5 h-5 text-indigo-500" />
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
          
          {/* Add Button */}
          {value.length < maxSlots && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={addTimeSlot}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={disabled}
            >
              <HiPlus className="w-4 h-4" />
              {language === 'th' ? 'เพิ่มช่วงเวลา' : 'Add Time Slot'}
            </motion.button>
          )}
        </div>

        {/* Bulk Actions */}
        {showBulkSelection && value.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
          >
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3 font-medium">
              {language === 'th' ? 'เลือกช่วงเวลาแบบกลุ่ม' : 'Quick Time Selection'}
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], label: language === 'th' ? 'วันทำงาน' : 'Weekdays', color: 'blue' },
                { days: ['saturday', 'sunday'], label: language === 'th' ? 'วันหยุด' : 'Weekends', color: 'purple' },
                { days: ['monday', 'wednesday', 'friday'], label: language === 'th' ? 'จ.-พ.-ศ.' : 'Mon-Wed-Fri', color: 'green' }
              ].map((preset, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    const newSlots = preset.days.map(day => {
                      const slot = createNewSlot();
                      return updateSlotField(slot, 'day', day);
                    });
                    onChange(newSlots);
                  }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                    preset.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200' :
                    preset.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-200' :
                    'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-200'
                  }`}
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Time Slots */}
        <AnimatePresence>
          <div className="space-y-3">
            {value.map((slot, index) => {
              const day = getSlotDay(slot);
              const dayInfo = daysOfWeek.find(d => d.value === day);
              const isValid = isSlotValid(slot);
              
              return (
                <motion.div
                  key={getSlotId(slot, index)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.01 }}
                  className={`relative p-4 rounded-2xl shadow-sm border-2 transition-all duration-200 ${
                    isValid 
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-300'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                  }`}
                >
                  {/* Day Selection */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'th' ? 'วัน' : 'Day'}
                    </label>
                    <select
                      value={day}
                      onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}
                      className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      disabled={disabled}
                    >
                      <option value="">{language === 'th' ? 'เลือกวัน' : 'Select Day'}</option>
                      {daysOfWeek.map(dayOption => (
                        <option key={dayOption.value} value={dayOption.value}>
                          {dayOption.emoji} {dayOption.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'th' ? 'เริ่ม' : 'From'}
                      </label>
                      <input
                        type="time"
                        value={getSlotStartTime(slot)}
                        onChange={(e) => updateTimeSlot(index, 'timeFrom', e.target.value)}
                        className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'th' ? 'ถึง' : 'To'}
                      </label>
                      <input
                        type="time"
                        value={getSlotEndTime(slot)}
                        onChange={(e) => updateTimeSlot(index, 'timeTo', e.target.value)}
                        className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {isValid ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <HiCheck className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {dayInfo?.shortLabel} {getSlotStartTime(slot)}-{getSlotEndTime(slot)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <HiExclamationTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {language === 'th' ? 'ข้อมูลไม่ครบ' : 'Incomplete'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Duplicate Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => duplicateTimeSlot(index)}
                        className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                        disabled={disabled || value.length >= maxSlots}
                        title={language === 'th' ? 'ทำสำเนา' : 'Duplicate'}
                      >
                        <HiDocumentDuplicate className="w-4 h-4" />
                      </motion.button>

                      {/* Remove Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeTimeSlot(slot, index)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        disabled={disabled}
                        title={language === 'th' ? 'ลบ' : 'Remove'}
                      >
                        <HiTrash className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {/* Summary */}
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {language === 'th' ? 'สรุป:' : 'Summary:'}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-green-600 dark:text-green-400">
                  ✓ {validSlots.length} {language === 'th' ? 'ช่วง' : 'valid'}
                </span>
                {invalidSlots.length > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    ⚠ {invalidSlots.length} {language === 'th' ? 'ไม่สมบูรณ์' : 'incomplete'}
                  </span>
                )}
                <span className="text-gray-500">
                  ({value.length}/{maxSlots})
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {value.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <HiClock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {language === 'th' ? 'ยังไม่มีช่วงเวลา' : 'No time slots added yet'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={addTimeSlot}
              className="px-6 py-3 bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-600 transition-all duration-200"
              disabled={disabled}
            >
              <HiPlus className="w-4 h-4 inline mr-2" />
              {language === 'th' ? 'เพิ่มช่วงเวลาแรก' : 'Add First Time Slot'}
            </motion.button>
          </motion.div>
        )}
      </div>
    );
  }

  // Fallback to compact variant for other cases
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">{title}</label>
        {value.length < maxSlots && (
          <button
            type="button"
            onClick={addTimeSlot}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            disabled={disabled}
          >
            <HiPlus className="w-4 h-4" />
            {language === 'th' ? 'เพิ่ม' : 'Add'}
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {value.map((slot, index) => (
          <div key={getSlotId(slot, index)} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <select
              value={getSlotDay(slot)}
              onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={disabled}
            >
              <option value="">{language === 'th' ? 'เลือกวัน' : 'Day'}</option>
              {daysOfWeek.map(day => (
                <option key={day.value} value={day.value}>{day.shortLabel}</option>
              ))}
            </select>
            
            <input
              type="time"
              value={getSlotStartTime(slot)}
              onChange={(e) => updateTimeSlot(index, 'timeFrom', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={disabled}
            />
            
            <span className="text-gray-400">-</span>
            
            <input
              type="time"
              value={getSlotEndTime(slot)}
              onChange={(e) => updateTimeSlot(index, 'timeTo', e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={disabled}
            />
            
            <button
              type="button"
              onClick={() => removeTimeSlot(slot, index)}
              className="p-1 text-red-500 hover:text-red-700 transition-colors"
              disabled={disabled}
            >
              <HiXMark className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernTimeSlotSelector;