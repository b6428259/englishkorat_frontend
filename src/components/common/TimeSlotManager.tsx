"use client"

import React from 'react';
import { TimeSlotSelector } from '../forms/TimeSlotSelector';

// Legacy interface for backward compatibility
interface LegacyTimeSlot {
  id: string;
  day: string;
  timeFrom: string;
  timeTo: string;
}

// New interface for schedule management
interface ScheduleTimeSlot {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface TimeSlotManagerProps {
  // Legacy props for backward compatibility
  value?: LegacyTimeSlot[];
  onChange?: (slots: LegacyTimeSlot[]) => void;
  
  // New props for schedule format
  scheduleSlots?: ScheduleTimeSlot[];
  onScheduleChange?: (slots: ScheduleTimeSlot[]) => void;
  
  // Common props
  title: string;
  description?: string;
  error?: boolean;
  disabled?: boolean;
  language?: 'th' | 'en';
  maxSlots?: number;
  variant?: 'default' | 'compact' | 'inline';
  showBulkSelection?: boolean;
}

/**
 * TimeSlotManager - Wrapper component for TimeSlotSelector
 * 
 * This component provides backward compatibility by automatically detecting
 * which format is being used and converting between legacy and schedule formats.
 * 
 * Usage for legacy format (existing pages):
 * ```tsx
 * <TimeSlotManager
 *   value={legacySlots}
 *   onChange={setLegacySlots}
 *   title="Select Time Slots"
 * />
 * ```
 * 
 * Usage for schedule format (new pages):
 * ```tsx
 * <TimeSlotManager
 *   scheduleSlots={scheduleSlots}
 *   onScheduleChange={setScheduleSlots}
 *   title="Select Time Slots"
 * />
 * ```
 */
export const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({
  value,
  onChange,
  scheduleSlots,
  onScheduleChange,
  title,
  description,
  error,
  disabled,
  language = 'th',
  maxSlots = 14,
  variant = 'default',
  showBulkSelection = true
}) => {
  // Determine which format is being used
  const isUsingScheduleFormat = scheduleSlots !== undefined && onScheduleChange !== undefined;
  const isUsingLegacyFormat = value !== undefined && onChange !== undefined;

  if (!isUsingScheduleFormat && !isUsingLegacyFormat) {
    console.warn('TimeSlotManager: Either legacy props (value, onChange) or schedule props (scheduleSlots, onScheduleChange) must be provided');
    return null;
  }

  // Handle schedule format usage
  if (isUsingScheduleFormat) {
    return (
      <TimeSlotSelector
        value={scheduleSlots}
        onChange={(slots) => {
          // Ensure we're passing the correct format
          const scheduleFormatSlots = slots.map(slot => {
            if ('day_of_week' in slot) {
              return slot;
            } else {
              return {
                day_of_week: (slot as LegacyTimeSlot).day,
                start_time: (slot as LegacyTimeSlot).timeFrom,
                end_time: (slot as LegacyTimeSlot).timeTo
              };
            }
          }) as ScheduleTimeSlot[];
          onScheduleChange(scheduleFormatSlots);
        }}
        title={title}
        description={description}
        error={error}
        disabled={disabled}
        language={language}
        maxSlots={maxSlots}
        format="schedule"
        variant={variant}
        showBulkSelection={showBulkSelection}
      />
    );
  }

  // Handle legacy format usage (backward compatibility)
  if (isUsingLegacyFormat) {
    return (
      <TimeSlotSelector
        value={value}
        onChange={(slots) => {
          // Ensure we're passing the correct format
          const legacyFormatSlots = slots.map((slot, index) => {
            if ('id' in slot) {
              return slot;
            } else {
              return {
                id: `slot_${index}_${Date.now()}`,
                day: (slot as ScheduleTimeSlot).day_of_week,
                timeFrom: (slot as ScheduleTimeSlot).start_time,
                timeTo: (slot as ScheduleTimeSlot).end_time
              };
            }
          }) as LegacyTimeSlot[];
          onChange(legacyFormatSlots);
        }}
        title={title}
        description={description}
        error={error}
        disabled={disabled}
        language={language}
        maxSlots={maxSlots}
        format="legacy"
        variant={variant}
        showBulkSelection={showBulkSelection}
      />
    );
  }

  return null;
};

// Re-export TimeSlotSelector for direct usage when needed
export { TimeSlotSelector } from '../forms/TimeSlotSelector';

// Export types for TypeScript usage
export type { LegacyTimeSlot, ScheduleTimeSlot };
