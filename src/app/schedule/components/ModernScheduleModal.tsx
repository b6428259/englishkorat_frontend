"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCalendarDays, HiAcademicCap, HiUserGroup, HiClock, HiDocumentText, HiSparkles, HiCheckCircle, HiBuildingOffice2, HiGlobeAlt } from 'react-icons/hi2';
import ActionModal from '@/components/common/ActionModal';
import FormSection from '@/components/common/forms/FormSection';
import FieldGroup from '@/components/common/forms/FieldGroup';
import EnhancedSelect from '@/components/common/forms/EnhancedSelect';
import ModernInput from '@/components/common/forms/ModernInput';
import StatusMessage from '@/components/common/forms/StatusMessage';
import { useLanguage } from '@/contexts/LanguageContext';
import { Checkbox } from '@/components/forms';
import { ModernTimeSlotSelector } from '@/components/forms/ModernTimeSlotSelector';
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

export default function ModernScheduleModalV2({
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

  // Default form state with enhanced structure
  const defaultForm: CreateScheduleRequest = useMemo(() => ({
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
  }), []);

  // Internal form state
  const [internalForm, setInternalForm] = useState<CreateScheduleRequest>(defaultForm);

  const scheduleForm = externalForm || internalForm;

  const updateForm = useCallback((updates: Partial<CreateScheduleRequest>) => {
    if (externalUpdate) {
      externalUpdate(updates);
    } else {
      setInternalForm(prev => ({ ...prev, ...updates }));
    }
  }, [externalUpdate]);

  // Enhanced validation with smart suggestions
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Required field validation
    if (!scheduleForm.schedule_name?.trim()) {
      errors.push(language === 'th' ? 'กรุณากรอกชื่อตารางเรียน' : 'Please enter schedule name');
    }
    
    if (!scheduleForm.course_id || scheduleForm.course_id === 0) {
      errors.push(language === 'th' ? 'กรุณาเลือกคอร์ส' : 'Please select a course');
    }
    
    if (!scheduleForm.teacher_id || scheduleForm.teacher_id === 0) {
      errors.push(language === 'th' ? 'กรุณาเลือกครู' : 'Please select a teacher');
    }
    
    if (!scheduleForm.room_id || scheduleForm.room_id === 0) {
      errors.push(language === 'th' ? 'กรุณาเลือกห้องเรียน' : 'Please select a room');
    }

    if (!scheduleForm.start_date) {
      errors.push(language === 'th' ? 'กรุณาเลือกวันที่เริ่ม' : 'Please select start date');
    }

    if (!scheduleForm.time_slots || scheduleForm.time_slots.length === 0) {
      errors.push(language === 'th' ? 'กรุณาเพิ่มช่วงเวลาเรียน' : 'Please add time slots');
    }

    // Advanced validation
    if (scheduleForm.total_hours && scheduleForm.hours_per_session && 
        scheduleForm.total_hours < scheduleForm.hours_per_session) {
      errors.push(language === 'th' ? 'จำนวนชั่วโมงรวมต้องมากกว่าชั่วโมงต่อเซสชัน' : 'Total hours must be greater than hours per session');
    }

    if (scheduleForm.max_students && scheduleForm.max_students > 20) {
      warnings.push(language === 'th' ? 'จำนวนนักเรียนสูงกว่าแนะนำ (20 คน)' : 'Student count is higher than recommended (20 students)');
    }

    if (scheduleForm.time_slots && scheduleForm.time_slots.some(slot => !slot.day_of_week || !slot.start_time || !slot.end_time)) {
      warnings.push(language === 'th' ? 'มีช่วงเวลาที่ไม่สมบูรณ์' : 'Some time slots are incomplete');
    }

    // Smart suggestions
    if (scheduleForm.total_hours && scheduleForm.hours_per_session) {
      const estimatedSessions = Math.ceil(scheduleForm.total_hours / scheduleForm.hours_per_session);
      if (estimatedSessions > 50) {
        suggestions.push(language === 'th' ? 'คอร์สนี้อาจใช้เวลานาน แนะนำให้แบ่งออกเป็นหลายระดับ' : 'This course might be lengthy. Consider splitting into multiple levels');
      }
    }

    if (scheduleForm.time_slots && scheduleForm.time_slots.length > 5) {
      suggestions.push(language === 'th' ? 'มีช่วงเวลาหลายช่วง ควรตรวจสอบความพร้อมของครู' : 'Multiple time slots detected. Verify teacher availability');
    }

    return {
      errors,
      warnings,
      suggestions,
      isValid: errors.length === 0,
      hasWarnings: warnings.length > 0,
      hasSuggestions: suggestions.length > 0
    };
  }, [scheduleForm, language]);

  // Enhanced memoized options with better UX
  const courseOptions = useMemo(() => [
    { value: '0', label: language === 'th' ? 'เลือกคอร์ส' : 'Select Course', disabled: true },
    ...courses.map(course => ({
      value: course.id.toString(),
      label: course.course_name,
      description: `${language === 'th' ? 'ระดับ' : 'Level'}: ${course.level}`,
      icon: <HiAcademicCap className="text-blue-500" />,
      badge: course.level,
      color: course.level.toLowerCase() === 'beginner' ? 'green' : 
             course.level.toLowerCase() === 'intermediate' ? 'yellow' : 'purple'
    }))
  ], [courses, language]);

  const teacherOptions_enhanced = useMemo(() => [
    { value: '0', label: language === 'th' ? 'เลือกครู' : 'Select Teacher', disabled: true },
    ...teachers.map((teacher: TeacherOption) => ({
      value: teacher.id.toString(),
      label: teacher.teacher_name,
      description: teacher.teacher_email || '',
      icon: <HiUserGroup className="text-green-500" />,
      subtitle: language === 'th' ? 'ครูผู้สอน' : 'Instructor'
    }))
  ], [teachers, language]);

  const roomOptions = useMemo(() => [
    { value: '0', label: language === 'th' ? 'เลือกห้องเรียน' : 'Select Room', disabled: true },
    ...rooms.map(room => ({
      value: room.id.toString(),
      label: room.room_name,
      description: `${language === 'th' ? 'ความจุ' : 'Capacity'}: ${room.capacity} ${language === 'th' ? 'คน' : 'people'}`,
      icon: <HiBuildingOffice2 className="text-orange-500" />,
      badge: `${room.capacity}`
    }))
  ], [rooms, language]);

  // Smart defaults and calculations
  const calculatedSessions = useMemo(() => {
    if (scheduleForm.total_hours && scheduleForm.hours_per_session) {
      return Math.ceil(scheduleForm.total_hours / scheduleForm.hours_per_session);
    }
    return 0;
  }, [scheduleForm.total_hours, scheduleForm.hours_per_session]);

  // Handlers
  const handleClose = useCallback(() => {
    if (!externalForm) {
      setInternalForm(defaultForm);
    }
    onClose();
  }, [externalForm, onClose, defaultForm]);

  const handleConfirm = useCallback(async () => {
    if (!validation.isValid) return;
    
    try {
      await onConfirm();
    } catch (err) {
      console.error('Error creating schedule:', err);
    }
  }, [validation.isValid, onConfirm]);

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={handleClose}
      title={language === 'th' ? 'สร้างตารางเรียนใหม่' : 'Create New Schedule'}
      subtitle={language === 'th' ? 'กำหนดรายละเอียดตารางเรียน' : 'Configure your class schedule'}
      size="2xl"
      primaryAction={{
        label: isLoading 
          ? (language === 'th' ? 'กำลังสร้าง...' : 'Creating...') 
          : (language === 'th' ? 'สร้างตารางเรียน' : 'Create Schedule'),
        onClick: handleConfirm,
        loading: isLoading,
        disabled: !validation.isValid,
        variant: 'primary',
        icon: <HiCheckCircle />
      }}
      secondaryAction={{
        label: language === 'th' ? 'ยกเลิก' : 'Cancel',
        onClick: handleClose,
        variant: 'ghost'
      }}
      error={error}
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-700"
        >
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <HiSparkles className="w-8 h-8 text-white" />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {language === 'th' ? '🎯 สร้างตารางเรียนสมัยใหม่' : '🎯 Modern Schedule Creation'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'th' ? 'ออกแบบตารางเรียนที่ทันสมัยและใช้งานง่าย' : 'Design modern and user-friendly class schedules'}
            </p>
          </div>
        </motion.div>
        {/* Validation Messages */}
        <AnimatePresence>
          {(validation.errors.length > 0 || validation.warnings.length > 0 || validation.suggestions.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {validation.errors.length > 0 && (
                <StatusMessage
                  type="error"
                  message={language === 'th' ? 'กรุณาแก้ไขข้อมูลต่อไปนี้:' : 'Please fix the following:'}
                  details={validation.errors}
                />
              )}
              
              {validation.warnings.length > 0 && (
                <StatusMessage
                  type="warning"
                  message={language === 'th' ? 'คำเตือน:' : 'Warnings:'}
                  details={validation.warnings}
                />
              )}
              
              {validation.suggestions.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-start gap-3">
                    <HiGlobeAlt className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        {language === 'th' ? 'คำแนะนำ:' : 'Smart Suggestions:'}
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        {validation.suggestions.map((suggestion, index) => (
                          <li key={index}>💡 {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schedule Basic Info */}
        <FormSection
          title={language === 'th' ? 'ข้อมูลพื้นฐาน' : 'Schedule Information'}
          icon={<HiCalendarDays />}
          color="blue"
        >
          <FieldGroup columns={2}>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'ชื่อตารางเรียน *' : 'Schedule Name *'}
              </label>
              <ModernInput
                type="text"
                value={scheduleForm.schedule_name || ''}
                onChange={(e) => updateForm({ schedule_name: e.target.value })}
                placeholder={language === 'th' ? 'กรอกชื่อตารางเรียน' : 'Enter schedule name'}
                leftIcon={<HiDocumentText />}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'คอร์ส *' : 'Course *'}
              </label>
              <EnhancedSelect
                options={courseOptions}
                value={scheduleForm.course_id?.toString() || '0'}
                onChange={(value) => updateForm({ course_id: parseInt(value as string) || 0 })}
                placeholder={language === 'th' ? 'เลือกคอร์ส' : 'Select Course'}
                searchable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'วันที่เริ่ม *' : 'Start Date *'}
              </label>
              <ModernInput
                type="date"
                value={scheduleForm.start_date || ''}
                onChange={(e) => updateForm({ start_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                leftIcon={<HiCalendarDays />}
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Teacher & Room */}
        <FormSection
          title={language === 'th' ? 'ครูและห้องเรียน' : 'Teacher & Room'}
          icon={<HiUserGroup />}
          color="green"
        >
          <FieldGroup columns={2}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'ครูผู้สอน *' : 'Teacher *'}
              </label>
              <EnhancedSelect
                options={teacherOptions_enhanced}
                value={scheduleForm.teacher_id?.toString() || '0'}
                onChange={(value) => updateForm({ teacher_id: parseInt(value as string) || 0 })}
                placeholder={language === 'th' ? 'เลือกครู' : 'Select Teacher'}
                searchable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'ห้องเรียน *' : 'Room *'}
              </label>
              <EnhancedSelect
                options={roomOptions}
                value={scheduleForm.room_id?.toString() || '0'}
                onChange={(value) => updateForm({ room_id: parseInt(value as string) || 0 })}
                placeholder={language === 'th' ? 'เลือกห้องเรียน' : 'Select Room'}
                searchable
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Session Configuration */}
        <FormSection
          title={language === 'th' ? 'การกำหนดเซสชัน' : 'Session Configuration'}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'ชั่วโมงต่อเซสชัน' : 'Hours per Session'}
              </label>
              <ModernInput
                type="number"
                value={(scheduleForm.hours_per_session || 3).toString()}
                onChange={(e) => updateForm({ hours_per_session: parseInt(e.target.value) || 3 })}
                min="0.5"
                max="8"
                step="0.5"
                leftIcon={<HiClock />}
              />
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
            </div>
          </FieldGroup>

          {/* Session Preview */}
          {calculatedSessions > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    {language === 'th' ? 'จำนวนเซสชันโดยประมาณ:' : 'Estimated Sessions:'}
                  </span>
                </div>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {calculatedSessions}
                </span>
              </div>
            </motion.div>
          )}
        </FormSection>

        {/* Time Slots */}
        <FormSection
          title={language === 'th' ? 'ช่วงเวลาเรียน' : 'Time Slots'}
          icon={<HiClock />}
          color="orange"
        >
          <ModernTimeSlotSelector
            value={scheduleForm.time_slots || []}
            onChange={(slots) => updateForm({ time_slots: slots as ScheduleTimeSlot[] })}
            title=""
            format="schedule"
            variant="mobile" // Use mobile-optimized variant
            language={language}
            maxSlots={7}
            showBulkSelection={true}
            className="w-full"
          />
        </FormSection>

        {/* Additional Settings */}
        <FormSection
          title={language === 'th' ? 'การตั้งค่าเพิ่มเติม' : 'Additional Settings'}
          icon={<HiDocumentText />}
          color="gray"
        >
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <Checkbox
                checked={scheduleForm.auto_reschedule_holidays || false}
                onChange={(e) => updateForm({ auto_reschedule_holidays: e.target.checked })}
                label={language === 'th' ? 'เลื่อนตารางเรียนอัตโนมัติในวันหยุด' : 'Auto-reschedule on holidays'}
                description={language === 'th' ? 'ระบบจะเลื่อนตารางเรียนอัตโนมัติเมื่อตรงกับวันหยุดนักขัตฤกษ์' : 'System will automatically reschedule classes that fall on holidays'}
              />
            </motion.div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'หมายเหตุ' : 'Notes'}
              </label>
              <ModernInput
                type="textarea"
                value={scheduleForm.notes || ''}
                onChange={(e) => updateForm({ notes: e.target.value })}
                placeholder={language === 'th' ? 'เพิ่มหมายเหตุเพิ่มเติม...' : 'Add additional notes...'}
                leftIcon={<HiDocumentText />}
              />
            </div>
          </div>
        </FormSection>

        {/* Success State */}
        {validation.isValid && !validation.hasWarnings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-700"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <HiCheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex-grow">
                <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
                  {language === 'th' ? '🎉 พร้อมสร้างตารางเรียน!' : '🎉 Ready to Create Schedule!'}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {language === 'th' 
                    ? `จะสร้างตารางเรียน "${scheduleForm.schedule_name}" พร้อม ${scheduleForm.time_slots?.length || 0} ช่วงเวลา`
                    : `Will create "${scheduleForm.schedule_name}" with ${scheduleForm.time_slots?.length || 0} time slots`
                  }
                </p>
                {calculatedSessions > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {language === 'th' 
                      ? `ประมาณ ${calculatedSessions} เซสชัน (${scheduleForm.total_hours} ชั่วโมง)`
                      : `Approximately ${calculatedSessions} sessions (${scheduleForm.total_hours} hours)`
                    }
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ActionModal>
  );
}

// Add custom scrollbar styles
const styles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}