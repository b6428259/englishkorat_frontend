"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { HiCalendarDays, HiAcademicCap, HiUserGroup, HiClock, HiDocumentText } from 'react-icons/hi2';
import ActionModal from '@/components/common/ActionModal';
import FormSection from '@/components/common/forms/FormSection';
import FieldGroup from '@/components/common/forms/FieldGroup';
import EnhancedSelect from '@/components/common/forms/EnhancedSelect';
import ModernInput from '@/components/common/forms/ModernInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { Checkbox } from '@/components/forms';
import { TimeSlotSelector } from '@/components/forms/TimeSlotSelector';
import { DateInput } from '@/components/forms/DateInput';
import { validateScheduleForm, deriveScheduleFields, type ValidationIssue } from '@/utils/scheduleValidation';
import { 
  CreateScheduleInput as CreateScheduleRequest, 
  Course, 
  Room, 
  TeacherOption 
} from '@/services/api/schedules';
import { GroupOption } from '@/types/group.types';

// Legacy interface for backward compatibility
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

interface ModernScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  scheduleForm?: Partial<CreateScheduleRequest>;
  updateForm?: (form: Partial<CreateScheduleRequest>) => void;
  courses: Course[];
  rooms: Room[];
  teachers: TeacherOption[];
  groups?: GroupOption[]; // New: Group options for group-based scheduling
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
  groups = [], // New: Group options
  isLoading = false,
  error
}: ModernScheduleModalProps) {
  const { language } = useLanguage();

  // Internal form state with proper persistence
  const [internalForm, setInternalForm] = useState<Partial<CreateScheduleRequest>>({
    schedule_name: '',
    schedule_type: 'class', // New: Default to class schedule
    course_id: 0,
    group_id: 0, // New: Group selection for class schedules
    teacher_id: 0,
    room_id: 0,
    total_hours: 30,
    hours_per_session: 3,
    max_students: 6,
    start_date: new Date().toISOString().split('T')[0],
    time_slots: [],
    auto_reschedule: true, // Updated field name
    notes: ''
  });

  // Use external form if provided, otherwise use internal state
  const scheduleForm = externalForm || internalForm;

  // Enhanced updateForm function with better state management
  const updateForm = useCallback((updates: Partial<CreateScheduleRequest>) => {
    if (externalUpdate) {
      // Use external update function if provided
      externalUpdate(updates);
    } else {
      // Update internal state and preserve existing data
      setInternalForm(prev => ({ ...prev, ...updates }));
    }
  }, [externalUpdate]);

  // Effect to sync external form changes to internal state
  useEffect(() => {
    if (externalForm && !externalUpdate) {
      setInternalForm(externalForm);
    }
  }, [externalForm, externalUpdate]);

  // Validation and derived preview
  const issues = useMemo<ValidationIssue[]>(() => validateScheduleForm(scheduleForm), [scheduleForm]);
  const getFieldError = useCallback((field: string) => issues.find(i => i.field === field)?.message, [issues]);
  const hasErrors = issues.length > 0;
  const { estimated_end_date, total_sessions } = useMemo(() => deriveScheduleFields(scheduleForm), [scheduleForm]);

  const courseOptions = useMemo(() => [
    { value: '0', label: language === 'th' ? 'เลือกคอร์ส' : 'Select Course', disabled: true },
    ...courses.map(course => ({
      value: course.id.toString(),
      label: course.course_name,
      description: `${language === 'th' ? 'ระดับ' : 'Level'}: ${course.level}`,
      icon: <HiAcademicCap className="text-blue-500" />
    }))
  ], [courses, language]);

  const teacherOptions_enhanced = useMemo(() => [
    { value: '0', label: language === 'th' ? 'เลือกครู' : 'Select Teacher', disabled: true },
    ...teachers.map((teacher: TeacherOption) => ({
      value: teacher.id.toString(),
      label: teacher.teacher_name,
      description: teacher.teacher_email || '',
      icon: <HiUserGroup className="text-green-500" />
    }))
  ], [teachers, language]);

  const roomOptions = useMemo(() => [
    { value: '0', label: language === 'th' ? 'เลือกห้องเรียน' : 'Select Room', disabled: true },
    ...rooms.map(room => ({
      value: room.id.toString(),
      label: room.room_name,
      description: `${language === 'th' ? 'ความจุ' : 'Capacity'}: ${room.capacity} ${language === 'th' ? 'คน' : 'people'}`,
      icon: <HiClock className="text-orange-500" />
    }))
  ], [rooms, language]);

  const isFormValid = !hasErrors;

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

  // Enhanced time slots update handler to prevent data loss
  const handleTimeSlotsChange = useCallback((slots: (LegacyTimeSlot | ScheduleTimeSlot)[]) => {
    // Normalize both legacy and modern formats to ScheduleTimeSlot
    const scheduleSlots: ScheduleTimeSlot[] = slots.map((slot) => {
      if ('day_of_week' in slot) {
        return {
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
        };
      }
      const legacy = slot as LegacyTimeSlot;
      return {
        day_of_week: legacy.day,
        start_time: legacy.timeFrom,
        end_time: legacy.timeTo,
      };
    });
    updateForm({ time_slots: scheduleSlots });
  }, [updateForm]);

  // Enhanced notes update handler
  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    updateForm({ notes: newValue });
  }, [updateForm]);

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={handleClose}
      title={language === 'th' ? 'สร้างตารางเรียนใหม่' : 'Create New Schedule'}
      size="xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto">
        {/* Schedule Basic Info */}
        <FormSection
          title={language === 'th' ? 'ข้อมูลตารางเรียน' : 'Schedule Information'}
          icon={<HiCalendarDays />}
          color="blue"
        >
          <FieldGroup columns={2}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'ชื่อตารางเรียน *' : 'Schedule Name *'}
              </label>
              <ModernInput
                type="text"
                value={scheduleForm.schedule_name || ''}
                onChange={(e) => updateForm({ schedule_name: e.target.value })}
                placeholder={language === 'th' ? 'กรอกชื่อตารางเรียน' : 'Enter schedule name'}
                leftIcon={<HiDocumentText />}
              />
              {getFieldError('schedule_name') && (
                <p className="mt-1 text-xs text-red-600">{getFieldError('schedule_name')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'คอร์ส *' : 'Course *'}
              </label>
              <EnhancedSelect
                value={(scheduleForm.course_id || 0).toString()}
                onChange={(value) => updateForm({ course_id: parseInt(Array.isArray(value) ? value[0] : value) })}
                options={courseOptions}
                placeholder={language === 'th' ? 'เลือกคอร์ส' : 'Select Course'}
                searchable
              />
              {getFieldError('course_id') && (
                <p className="mt-1 text-xs text-red-600">{getFieldError('course_id')}</p>
              )}
            </div>
          </FieldGroup>
        </FormSection>

        {/* Schedule Type and Group Selection */}
        <FormSection
          title={language === 'th' ? 'ประเภทและกลุ่ม' : 'Type and Group'}
          icon={<HiUserGroup />}
          color="purple"
        >
          <FieldGroup columns={2}>
            {/* Schedule Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'ประเภทตารางเรียน *' : 'Schedule Type *'}
              </label>
              <EnhancedSelect
                value={scheduleForm.schedule_type || 'class'}
                onChange={(value) => {
                  const selected = Array.isArray(value) ? value[0] : value;
                  updateForm({
                    schedule_type: selected as NonNullable<CreateScheduleRequest['schedule_type']>,
                    // Reset group/participant selection when type changes
                    group_id: undefined,
                    participant_user_ids: undefined
                  });
                }}
                options={[
                  { value: 'class', label: language === 'th' ? 'คลาสเรียน' : 'Class' },
                  { value: 'event', label: language === 'th' ? 'อีเว้นท์' : 'Event' },
                  { value: 'appointment', label: language === 'th' ? 'นัดหมาย' : 'Appointment' }
                ]}
                placeholder={language === 'th' ? 'เลือกประเภท' : 'Select Type'}
              />
              {getFieldError('schedule_type') && (
                <p className="mt-1 text-xs text-red-600">{getFieldError('schedule_type')}</p>
              )}
            </div>

            {/* Group Selection (for class schedules) */}
            {scheduleForm.schedule_type === 'class' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'กลุ่มเรียน *' : 'Learning Group *'}
                </label>
                <EnhancedSelect
                  value={(scheduleForm.group_id || 0).toString()}
                  onChange={(value) => updateForm({ group_id: parseInt(Array.isArray(value) ? value[0] : value) })}
                  options={groups.map(group => ({
                    value: group.id.toString(),
                    label: `${group.group_name} (${group.current_students}/${group.max_students})`,
                    sublabel: `${group.course_name} - ${group.level}`
                  }))}
                  placeholder={language === 'th' ? 'เลือกกลุ่มเรียน' : 'Select Group'}
                  searchable
                />
                {getFieldError('group_id') && (
                  <p className="mt-1 text-xs text-red-600">{getFieldError('group_id')}</p>
                )}
                {(!scheduleForm.group_id || scheduleForm.group_id === 0) && (
                  <p className="mt-1 text-xs text-amber-600">
                    {language === 'th' ? 'กรุณาเลือกกลุ่มเรียนสำหรับคลาสเรียน' : 'Please select a group for class schedules'}
                  </p>
                )}
              </div>
            )}

            {/* Participant Information (for events/appointments) */}
            {(scheduleForm.schedule_type === 'event' || scheduleForm.schedule_type === 'appointment') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ผู้เข้าร่วม' : 'Participants'}
                </label>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-700">
                    {language === 'th' 
                      ? 'การเลือกผู้เข้าร่วมจะพัฒนาในอนาคต' 
                      : 'Participant selection will be implemented in future updates'
                    }
                  </p>
                </div>
              </div>
            )}
          </FieldGroup>
        </FormSection>

        {/* Teacher and Room */}
        <FormSection
          title={language === 'th' ? 'ครูและห้องเรียน' : 'Teacher and Room'}
          icon={<HiUserGroup />}
          color="green"
        >
          <FieldGroup columns={2}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'ครูผู้สอน *' : 'Teacher *'}
              </label>
              <EnhancedSelect
                value={(scheduleForm.teacher_id || 0).toString()}
                onChange={(value) => updateForm({ teacher_id: parseInt(Array.isArray(value) ? value[0] : value) })}
                options={teacherOptions_enhanced}
                placeholder={language === 'th' ? 'เลือกครู' : 'Select Teacher'}
                searchable
              />
              {/* Teacher is optional in API but we show hint if unset */}
              {(!scheduleForm.teacher_id || scheduleForm.teacher_id === 0) && (
                <p className="mt-1 text-xs text-amber-600">{language === 'th' ? 'แนะนำให้เลือกครูผู้สอน' : 'Teacher selection is recommended'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'ห้องเรียน' : 'Room'}
              </label>
              <EnhancedSelect
                value={(scheduleForm.room_id || 0).toString()}
                onChange={(value) => updateForm({ room_id: parseInt(Array.isArray(value) ? value[0] : value) })}
                options={roomOptions}
                placeholder={language === 'th' ? 'เลือกห้องเรียน' : 'Select Room'}
                searchable
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Schedule Settings */}
        <FormSection
          title={language === 'th' ? 'การตั้งค่าตารางเรียน' : 'Schedule Settings'}
          icon={<HiClock />}
          color="purple"
        >
          <FieldGroup columns={3}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'จำนวนชั่วโมงรวม' : 'Total Hours'}
              </label>
              <ModernInput
                type="number"
                value={(scheduleForm.total_hours || 30).toString()}
                onChange={(e) => updateForm({ total_hours: parseInt(e.target.value) || 30 })}
                min="1"
                max="200"
                leftIcon={<HiClock />}
              />
              {getFieldError('total_hours') && (
                <p className="mt-1 text-xs text-red-600">{getFieldError('total_hours')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'ชั่วโมงต่อเซสชัน' : 'Hours per Session'}
              </label>
              <ModernInput
                type="number"
                value={(scheduleForm.hours_per_session || 3).toString()}
                onChange={(e) => updateForm({ hours_per_session: parseInt(e.target.value) || 3 })}
                min="1"
                max="8"
                leftIcon={<HiClock />}
              />
              {getFieldError('hours_per_session') && (
                <p className="mt-1 text-xs text-red-600">{getFieldError('hours_per_session')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'นักเรียนสูงสุด' : 'Max Students'}
              </label>
              <ModernInput
                type="number"
                value={(scheduleForm.max_students || 6).toString()}
                onChange={(e) => updateForm({ max_students: parseInt(e.target.value) || 6 })}
                min="1"
                max="50"
                leftIcon={<HiUserGroup />}
              />
              {getFieldError('max_students') && (
                <p className="mt-1 text-xs text-red-600">{getFieldError('max_students')}</p>
              )}
            </div>
          </FieldGroup>

          <FieldGroup columns={3}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'วันที่เริ่มต้น *' : 'Start Date *'}
              </label>
              <DateInput
                value={scheduleForm.start_date || ''}
                onChange={(e) => updateForm({ start_date: e.target.value })}
                language={language}
              />
              {getFieldError('start_date') && (
                <p className="mt-1 text-xs text-red-600">{getFieldError('start_date')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'รูปแบบการเกิดซ้ำ' : 'Recurring Pattern'}
              </label>
              <EnhancedSelect
                value={(scheduleForm.recurring_pattern || 'weekly')}
                onChange={(value) => {
                  const next = Array.isArray(value) ? value[0] : value;
                  updateForm({ recurring_pattern: next as NonNullable<CreateScheduleRequest['recurring_pattern']> });
                }}
                options={[
                  { value: 'none', label: language === 'th' ? 'ไม่เกิดซ้ำ' : 'None' },
                  { value: 'daily', label: language === 'th' ? 'รายวัน' : 'Daily' },
                  { value: 'weekly', label: language === 'th' ? 'รายสัปดาห์' : 'Weekly' },
                  { value: 'bi-weekly', label: language === 'th' ? 'รายสองสัปดาห์' : 'Bi-weekly' },
                  { value: 'monthly', label: language === 'th' ? 'รายเดือน' : 'Monthly' },
                ]}
                placeholder={language === 'th' ? 'เลือกรูปแบบ' : 'Select pattern'}
              />
            </div>

            {(scheduleForm.recurring_pattern && scheduleForm.recurring_pattern !== 'none') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'จำนวนครั้งต่อสัปดาห์' : 'Sessions per week'}
                </label>
                <ModernInput
                  type="number"
                  value={(scheduleForm.session_per_week || 1).toString()}
                  onChange={(e) => updateForm({ session_per_week: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="14"
                  leftIcon={<HiClock />}
                />
                {getFieldError('session_per_week') && (
                  <p className="mt-1 text-xs text-red-600">{getFieldError('session_per_week')}</p>
                )}
              </div>
            )}
          </FieldGroup>

          {/* Derived preview */}
          {total_sessions && scheduleForm.start_date && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              {language === 'th'
                ? `จะสร้างทั้งหมด ${total_sessions} เซสชัน โดยคาดว่าจะสิ้นสุดวันที่ ${estimated_end_date || '-'}`
                : `Will create ${total_sessions} sessions, estimated to end on ${estimated_end_date || '-'}`}
            </div>
          )}
        </FormSection>

        {/* Time Slots */}
        <FormSection
          title={language === 'th' ? 'ช่วงเวลาเรียน' : 'Time Slots'}
          icon={<HiClock />}
          color="orange"
        >
          <TimeSlotSelector
            value={scheduleForm.time_slots || []}
            onChange={handleTimeSlotsChange}
            title=""
            format="schedule"
            variant="compact"
            language={language}
            maxSlots={7}
            showBulkSelection={true}
          />
          {getFieldError('time_slots') && (
            <p className="mt-2 text-xs text-red-600">{getFieldError('time_slots')}</p>
          )}
        </FormSection>

        {/* Additional Settings */}
        <FormSection
          title={language === 'th' ? 'การตั้งค่าเพิ่มเติม' : 'Additional Settings'}
          icon={<HiDocumentText />}
          color="gray"
        >
          <div className="space-y-4">
            <div>
              <Checkbox
                label={language === 'th' ? 'เลื่อนตารางเรียนอัตโนมัติในวันหยุด' : 'Auto reschedule for holidays'}
                checked={scheduleForm.auto_reschedule_holidays || false}
                onChange={(e) => updateForm({ auto_reschedule_holidays: e.target.checked })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'หมายเหตุ' : 'Notes'}
              </label>
              <ModernInput
                type="textarea"
                value={scheduleForm.notes || ''}
                onChange={handleNotesChange}
                placeholder={language === 'th' ? 'เพิ่มหมายเหตุเพิ่มเติม...' : 'Add any additional notes...'}
                leftIcon={<HiDocumentText />}
              />
            </div>
          </div>
        </FormSection>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            {language === 'th' ? 'ยกเลิก' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isFormValid || isLoading}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {language === 'th' ? 'กำลังสร้าง...' : 'Creating...'}
              </>
            ) : (
              language === 'th' ? 'สร้างตารางเรียน' : 'Create Schedule'
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}
      </div>
    </ActionModal>
  );
}