"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { HiCalendarDays, HiAcademicCap, HiUserGroup, HiClock, HiDocumentText } from 'react-icons/hi2';
import ActionModal from '@/components/common/ActionModal';
import FormSection from '@/components/common/forms/FormSection';
import FieldGroup from '@/components/common/forms/FieldGroup';
import EnhancedSelect from '@/components/common/forms/EnhancedSelect';
import ModernInput from '@/components/common/forms/ModernInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { Checkbox } from '@/components/forms';
import { TimeSlotSelector } from '@/components/forms/TimeSlotSelector';
import { 
  CreateScheduleRequest, 
  Course, 
  Room, 
  TeacherOption 
} from '@/services/api/schedules';

interface ScheduleTimeSlot {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface ModernScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  scheduleForm?: Partial<CreateScheduleRequest>;
  updateForm?: (form: Partial<CreateScheduleRequest>) => void;
  courses: Course[];
  rooms: Room[];
  teachers: TeacherOption[];
  isLoading?: boolean;
  error?: string | null;
}

export default function ModernScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  scheduleForm: externalForm,
  updateForm: externalUpdate,
  courses,
  rooms,
  teachers,
  isLoading = false,
  error
}: ModernScheduleModalProps) {
  const { language } = useLanguage();

  // Internal form state - use external if provided
  const [internalForm, setInternalForm] = useState<Partial<CreateScheduleRequest>>({
    schedule_name: '',
    course_id: 0,
    teacher_id: 0,
    room_id: 0,
    total_hours: 30,
    hours_per_session: 3,
    max_students: 6,
    start_date: new Date().toISOString().split('T')[0],
    time_slots: [],
    auto_reschedule_holidays: true,
    notes: ''
  });

  const scheduleForm = externalForm || internalForm;
  const updateForm = useCallback((updates: Partial<CreateScheduleRequest>) => {
    if (externalUpdate) {
      externalUpdate(updates);
    } else {
      setInternalForm(prev => ({ ...prev, ...updates }));
    }
  }, [externalUpdate]);

  const courseOptions = useMemo(() => [
    { value: '0', label: 'Select Course' },
    ...courses.map(course => ({
      value: course.id.toString(),
      label: course.course_name,
      description: `Level: ${course.level}`,
      icon: <HiAcademicCap />
    }))
  ], [courses]);

  const teacherOptions_enhanced = useMemo(() => [
    { value: '0', label: 'Select Teacher' },
    ...teachers.map((teacher: TeacherOption) => ({
      value: teacher.id.toString(),
      label: teacher.teacher_name,
      description: teacher.teacher_email || '',
      icon: <HiUserGroup />
    }))
  ], [teachers]);

  const roomOptions = useMemo(() => [
    { value: '0', label: 'Select Room' },
    ...rooms.map(room => ({
      value: room.id.toString(),
      label: room.room_name,
      description: `Capacity: ${room.capacity}`,
      icon: <HiClock />
    }))
  ], [rooms]);

  const isFormValid = scheduleForm.schedule_name &&
                     scheduleForm.course_id &&
                     scheduleForm.course_id !== 0 &&
                     scheduleForm.teacher_id &&
                     scheduleForm.teacher_id !== 0 &&
                     scheduleForm.time_slots &&
                     scheduleForm.time_slots.length > 0;

  const handleConfirm = useCallback(async () => {
    if (!isFormValid) return;
    await onConfirm();
  }, [isFormValid, onConfirm]);

  const handleClose = useCallback(() => {
    if (!externalForm) {
      setInternalForm({
        schedule_name: '',
        course_id: 0,
        teacher_id: 0,
        room_id: 0,
        total_hours: 30,
        hours_per_session: 3,
        max_students: 6,
        start_date: new Date().toISOString().split('T')[0],
        time_slots: [],
        auto_reschedule_holidays: true,
        notes: ''
      });
    }
    onClose();
  }, [externalForm, onClose]);

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Schedule"
      size="xl"
    >
      <div className="space-y-6">
        {/* Schedule Basic Info */}
        <FormSection
          title="Schedule Information"
          icon={<HiCalendarDays />}
          color="blue"
        >
          <FieldGroup columns={2}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Schedule Name *
              </label>
              <ModernInput
                type="text"
                value={scheduleForm.schedule_name || ''}
                onChange={(e) => updateForm({ schedule_name: e.target.value })}
                placeholder="Enter schedule name"
                leftIcon={<HiDocumentText />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course *
              </label>
              <EnhancedSelect
                value={(scheduleForm.course_id || 0).toString()}
                onChange={(value) => updateForm({ course_id: parseInt(Array.isArray(value) ? value[0] : value) })}
                options={courseOptions}
                placeholder="Select Course"
                searchable
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Teacher and Room */}
        <FormSection
          title="Teacher and Room"
          icon={<HiUserGroup />}
          color="green"
        >
          <FieldGroup columns={2}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teacher *
              </label>
              <EnhancedSelect
                value={(scheduleForm.teacher_id || 0).toString()}
                onChange={(value) => updateForm({ teacher_id: parseInt(Array.isArray(value) ? value[0] : value) })}
                options={teacherOptions_enhanced}
                placeholder="Select Teacher"
                searchable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room
              </label>
              <EnhancedSelect
                value={(scheduleForm.room_id || 0).toString()}
                onChange={(value) => updateForm({ room_id: parseInt(Array.isArray(value) ? value[0] : value) })}
                options={roomOptions}
                placeholder="Select Room"
                searchable
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Schedule Settings */}
        <FormSection
          title="Schedule Settings"
          icon={<HiClock />}
          color="purple"
        >
          <FieldGroup columns={3}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Hours
              </label>
              <ModernInput
                type="number"
                value={(scheduleForm.total_hours || 30).toString()}
                onChange={(e) => updateForm({ total_hours: parseInt(e.target.value) || 30 })}
                min="1"
                max="200"
                leftIcon={<HiClock />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hours per Session
              </label>
              <ModernInput
                type="number"
                value={(scheduleForm.hours_per_session || 3).toString()}
                onChange={(e) => updateForm({ hours_per_session: parseInt(e.target.value) || 3 })}
                min="1"
                max="8"
                leftIcon={<HiClock />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Students
              </label>
              <ModernInput
                type="number"
                value={(scheduleForm.max_students || 6).toString()}
                onChange={(e) => updateForm({ max_students: parseInt(e.target.value) || 6 })}
                min="1"
                max="50"
                leftIcon={<HiUserGroup />}
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Time Slots */}
        <FormSection
          title="Time Slots"
          icon={<HiClock />}
          color="orange"
        >
          <TimeSlotSelector
            value={scheduleForm.time_slots || []}
            onChange={(slots) => updateForm({ time_slots: slots as ScheduleTimeSlot[] })}
            title=""
            format="schedule"
            variant="compact"
            language={language}
            maxSlots={7}
            showBulkSelection={true}
          />
        </FormSection>

        {/* Additional Settings */}
        <FormSection
          title="Additional Settings"
          icon={<HiDocumentText />}
          color="gray"
        >
          <div className="space-y-4">
            <div>
              <Checkbox
                label="Auto reschedule for holidays"
                checked={scheduleForm.auto_reschedule_holidays || false}
                onChange={(e) => updateForm({ auto_reschedule_holidays: e.target.checked })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <ModernInput
                type="textarea"
                value={scheduleForm.notes || ''}
                onChange={(e) => updateForm({ notes: e.target.value })}
                placeholder="Add any additional notes..."
                leftIcon={<HiDocumentText />}
              />
            </div>
          </div>
        </FormSection>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isFormValid || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </ActionModal>
  );
}
