'use client';

import React from 'react';
import { useState, useCallback, useMemo } from 'react';
import ActionModal from '@/components/common/ActionModal';
import FormSection from '@/components/common/forms/FormSection';
import FieldGroup from '@/components/common/forms/FieldGroup';
import EnhancedSelect from '@/components/common/forms/EnhancedSelect';
import ModernInput from '@/components/common/forms/ModernInput';
import StatusMessage from '@/components/common/forms/StatusMessage';
import { DateInput } from '@/components/forms/DateInput';
import StudentSelect from '@/components/common/StudentSelect';
import { TimeSlotSelector } from '@/components/forms/TimeSlotSelector';
import { 
  HiCalendarDays, 
  HiClock,
  HiUserGroup,
  HiAcademicCap,
  HiTag,
  HiDocumentText
} from 'react-icons/hi2';

interface ScheduleTimeSlot {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface CreateSessionsForm {
  schedule_id: string;
  course_id: string;
  teacher_id: string;
  student_ids: string[];
  start_date: string;
  end_date: string;
  session_count: number;
  time_slots: ScheduleTimeSlot[];
  notes: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface Course {
  id: string;
  name: string;
  level: string;
  duration_hours: number;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

import { useLanguage } from '@/contexts/LanguageContext';

interface ModernSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (form: CreateSessionsForm) => Promise<void>;
  selectedScheduleId?: string;
  scheduleName?: string;
  courses: Course[];
  teachers: Teacher[];
  students: Student[];
  availableSlots: ScheduleTimeSlot[];
  isLoading?: boolean;
  error?: string;
  scheduleForm?: CreateSessionsForm;
  updateForm?: (updates: Partial<CreateSessionsForm>) => void;
}

export function ModernSessionsModal({
  isOpen,
  onClose,
  onConfirm,
  selectedScheduleId,
  scheduleName,
  courses,
  teachers,
  students,
  isLoading = false,
  error,
  scheduleForm: externalForm,
  updateForm: externalUpdate
}: ModernSessionsModalProps) {
  const { language } = useLanguage();

  // Internal form state - use external if provided
  const [internalForm, setInternalForm] = useState<CreateSessionsForm>({
    schedule_id: selectedScheduleId || '',
    course_id: '',
    teacher_id: '',
    student_ids: [],
    start_date: '',
    end_date: '',
    session_count: 1,
    time_slots: [],
    notes: '',
    level: 'beginner'
  });

  const sessionForm = externalForm || internalForm;
  const updateForm = useCallback((updates: Partial<CreateSessionsForm>) => {
    if (externalUpdate) {
      externalUpdate(updates);
    } else {
      setInternalForm(prev => ({ ...prev, ...updates }));
    }
  }, [externalUpdate]);

  // Memoized options
  const courseOptions = useMemo(() => 
    courses.map(course => ({
      value: course.id,
      label: course.name,
      description: `${course.level} • ${course.duration_hours}h`,
      icon: <HiAcademicCap />
    }))
  , [courses]);

  const teacherOptions = useMemo(() =>
    teachers.map(teacher => ({
      value: teacher.id,
      label: teacher.name,
      description: teacher.email,
      icon: <HiUserGroup />
    }))
  , [teachers]);

  const levelOptions = useMemo(() => [
    { 
      value: 'beginner', 
      label: 'Beginner',
      description: 'Basic level',
      icon: <HiTag />
    },
    { 
      value: 'intermediate', 
      label: 'Intermediate',
      description: 'Medium level',
      icon: <HiTag />
    },
    { 
      value: 'advanced', 
      label: 'Advanced',
      description: 'High level',
      icon: <HiTag />
    }
  ], []);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (!sessionForm.course_id) errors.push('Course is required');
    if (!sessionForm.teacher_id) errors.push('Teacher is required');
    if (!sessionForm.start_date) errors.push('Start date is required');
    if (!sessionForm.end_date) errors.push('End date is required');
    if (sessionForm.time_slots.length === 0) errors.push('Time slots are required');
    if (sessionForm.session_count < 1) errors.push('Session count must be at least 1');
    if (sessionForm.student_ids.length === 0) errors.push('Students are required');
    
    // Date validation
    if (sessionForm.start_date && sessionForm.end_date) {
      const start = new Date(sessionForm.start_date);
      const end = new Date(sessionForm.end_date);
      if (start >= end) {
        errors.push('End date must be after start date');
      }
    }
    
    return errors;
  }, [sessionForm]);

  const isFormValid = validationErrors.length === 0;

  // Handlers
  const handleConfirm = useCallback(async () => {
    if (!isFormValid) return;
    await onConfirm(sessionForm);
  }, [isFormValid, onConfirm, sessionForm]);

  const handleClose = useCallback(() => {
    if (!externalForm) {
      setInternalForm({
        schedule_id: selectedScheduleId || '',
        course_id: '',
        teacher_id: '',
        student_ids: [],
        start_date: '',
        end_date: '',
        session_count: 1,
        time_slots: [],
        notes: '',
        level: 'beginner'
      });
    }
    onClose();
  }, [externalForm, selectedScheduleId, onClose]);

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Sessions"
      size="xl"
    >
      <div className="space-y-6">
        {/* Schedule Info */}
        {scheduleName && (
          <FormSection
            title="Schedule Information"
            icon={<HiCalendarDays />}
            color="blue"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {scheduleName}
              </p>
            </div>
          </FormSection>
        )}

        {/* Course & Teacher Selection */}
        <FormSection
          title="Course and Teacher"
          icon={<HiAcademicCap />}
          color="green"
        >
          <FieldGroup columns={2}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course *
              </label>
              <EnhancedSelect
                options={courseOptions}
                value={sessionForm.course_id}
                onChange={(value) => updateForm({ course_id: value as string })}
                placeholder="Select Course"
                searchable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teacher *
              </label>
              <EnhancedSelect
                options={teacherOptions}
                value={sessionForm.teacher_id}
                onChange={(value) => updateForm({ teacher_id: value as string })}
                placeholder="Select Teacher"
                searchable
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Students & Level */}
        <FormSection
          title="Students and Level"
          icon={<HiUserGroup />}
          color="purple"
        >
          <FieldGroup columns={2}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Students *
              </label>
              <StudentSelect
                students={students}
                selectedIds={sessionForm.student_ids}
                onChange={(ids) => updateForm({ student_ids: ids })}
                placeholder="Select Students"
                maxHeight="200px"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level *
              </label>
              <EnhancedSelect
                options={levelOptions}
                value={sessionForm.level}
                onChange={(value) => updateForm({ level: value as 'beginner' | 'intermediate' | 'advanced' })}
                placeholder="Select Level"
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Dates & Sessions */}
        <FormSection
          title="Dates and Sessions"
          icon={<HiCalendarDays />}
          color="orange"
        >
          <FieldGroup columns={3}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <DateInput
                value={sessionForm.start_date}
                onChange={(e) => updateForm({ start_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <DateInput
                value={sessionForm.end_date}
                onChange={(e) => updateForm({ end_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Count *
              </label>
              <ModernInput
                type="number"
                value={sessionForm.session_count.toString()}
                onChange={(e) => updateForm({ session_count: parseInt(e.target.value) || 1 })}
                min="1"
                max="100"
                leftIcon={<HiDocumentText />}
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Time Slots */}
        <FormSection
          title="Time Slots"
          icon={<HiClock />}
          color="red"
        >
          <TimeSlotSelector
            value={sessionForm.time_slots}
            onChange={(slots) => updateForm({ time_slots: slots as ScheduleTimeSlot[] })}
            title=""
            format="schedule"
            variant="compact"
            language={language}
            maxSlots={sessionForm.session_count}
            showBulkSelection={true}
          />
        </FormSection>

        {/* Notes */}
        <FormSection
          title="Notes"
          icon={<HiDocumentText />}
          color="gray"
        >
          <ModernInput
            type="textarea"
            value={sessionForm.notes}
            onChange={(e) => updateForm({ notes: e.target.value })}
            placeholder="Add any additional notes..."
            leftIcon={<HiDocumentText />}
          />
        </FormSection>

        {/* Status Messages */}
        {error && (
          <StatusMessage
            type="error"
            message={error}
          />
        )}

        {validationErrors.length > 0 && (
          <StatusMessage
            type="warning"
            message="Please fix the following errors:"
            details={validationErrors}
          />
        )}

        {isFormValid && (
          <StatusMessage
            type="success"
            message="Form is ready to submit"
          />
        )}

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
            {isLoading ? 'Creating...' : 'Create Sessions'}
          </button>
        </div>
      </div>
    </ActionModal>
  );
}
