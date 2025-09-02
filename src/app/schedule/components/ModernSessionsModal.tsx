'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActionModal from '@/components/common/ActionModal';
import FormSection from '@/components/common/forms/FormSection';
import FieldGroup from '@/components/common/forms/FieldGroup';
import EnhancedSelect from '@/components/common/forms/EnhancedSelect';
import ModernInput from '@/components/common/forms/ModernInput';
import StatusMessage from '@/components/common/forms/StatusMessage';
import { DateInput } from '@/components/forms/DateInput';
import StudentSelect from '@/components/common/StudentSelect';
import { ModernTimeSlotSelector } from '@/components/forms/ModernTimeSlotSelector';
import { 
  HiCalendarDays, 
  HiClock,
  HiUserGroup,
  HiAcademicCap,
  HiTag,
  HiDocumentText,
  HiSparkles,
  HiCheckCircle,
  HiInformationCircle
} from 'react-icons/hi2';
import { useLanguage } from '@/contexts/LanguageContext';

// Enhanced interfaces
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
  
  // Internal form state
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
  
  // Effect to prevent form data loss during re-renders
  useEffect(() => {
    if (externalForm && !externalUpdate) {
      setInternalForm(externalForm);
    }
  }, [externalForm, externalUpdate]);
  
  const updateForm = useCallback((updates: Partial<CreateSessionsForm>) => {
    console.log('ModernSessionsModal: updateForm called with:', updates);
    console.log('Current form state:', sessionForm);
    
    if (externalUpdate) {
      externalUpdate(updates);
    } else {
      setInternalForm(prev => {
        const newForm = { ...prev, ...updates };
        console.log('ModernSessionsModal: New internal form state:', newForm);
        return newForm;
      });
    }
  }, [externalUpdate, sessionForm]);

  // Enhanced validation with real-time feedback
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!sessionForm.course_id) errors.push(language === 'th' ? 'กรุณาเลือกคอร์ส' : 'Please select a course');
    if (!sessionForm.teacher_id) errors.push(language === 'th' ? 'กรุณาเลือกครู' : 'Please select a teacher');
    if (!sessionForm.start_date) errors.push(language === 'th' ? 'กรุณาเลือกวันที่เริ่ม' : 'Please select start date');
    if (!sessionForm.end_date) errors.push(language === 'th' ? 'กรุณาเลือกวันที่สิ้นสุด' : 'Please select end date');
    if (sessionForm.session_count < 1) errors.push(language === 'th' ? 'จำนวนเซสชันต้องมากกว่า 0' : 'Session count must be greater than 0');
    if (sessionForm.time_slots.length === 0) errors.push(language === 'th' ? 'กรุณาเพิ่มช่วงเวลา' : 'Please add time slots');
    
    // Advanced validation
    if (sessionForm.start_date && sessionForm.end_date && sessionForm.start_date > sessionForm.end_date) {
      errors.push(language === 'th' ? 'วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด' : 'Start date must be before end date');
    }

    // Warnings
    if (sessionForm.student_ids.length === 0) {
      warnings.push(language === 'th' ? 'ยังไม่มีนักเรียน' : 'No students selected');
    }
    
    if (sessionForm.time_slots.some(slot => !slot.day_of_week || !slot.start_time || !slot.end_time)) {
      warnings.push(language === 'th' ? 'มีช่วงเวลาที่ไม่สมบูรณ์' : 'Some time slots are incomplete');
    }

    // Suggestions
    if (sessionForm.session_count > 20) {
      suggestions.push(language === 'th' ? 'คอร์สนี้มีหลายเซสชัน แนะนำให้แบ่งออกเป็นหลายคอร์ส' : 'Consider splitting into multiple courses for better management');
    }

    return {
      errors,
      warnings,
      suggestions,
      isValid: errors.length === 0,
      hasWarnings: warnings.length > 0,
      hasSuggestions: suggestions.length > 0
    };
  }, [sessionForm, language]);

  // Memoized options with enhanced formatting
  const courseOptions = useMemo(() => 
    courses.map(course => ({
      value: course.id,
      label: course.name,
      description: `${course.level} • ${course.duration_hours}h`,
      icon: <HiAcademicCap className="text-blue-500" />,
      badge: course.level
    }))
  , [courses]);

  const teacherOptions = useMemo(() =>
    teachers.map(teacher => ({
      value: teacher.id,
      label: teacher.name,
      description: teacher.email,
      icon: <HiUserGroup className="text-green-500" />
    }))
  , [teachers]);

  const levelOptions = useMemo(() => [
    { 
      value: 'beginner', 
      label: language === 'th' ? 'เริ่มต้น' : 'Beginner',
      description: language === 'th' ? 'สำหรับผู้เริ่มต้น' : 'For beginners',
      icon: <HiTag className="text-green-500" />,
      color: 'green'
    },
    { 
      value: 'intermediate', 
      label: language === 'th' ? 'ปานกลาง' : 'Intermediate',
      description: language === 'th' ? 'สำหรับผู้มีพื้นฐาน' : 'For intermediate learners',
      icon: <HiTag className="text-yellow-500" />,
      color: 'yellow'
    },
    { 
      value: 'advanced', 
      label: language === 'th' ? 'ขั้นสูง' : 'Advanced',
      description: language === 'th' ? 'สำหรับผู้มีประสบการณ์' : 'For advanced learners',
      icon: <HiTag className="text-purple-500" />,
      color: 'purple'
    }
  ], [language]);

  // Handlers
  const handleClose = useCallback(() => {
    // Only reset if we're using internal form state
    if (!externalForm && !externalUpdate) {
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
  }, [externalForm, externalUpdate, selectedScheduleId, onClose]);

  const handleConfirm = useCallback(async () => {
    if (!validation.isValid) return;
    
    try {
      await onConfirm(sessionForm);
    } catch (err) {
      console.error('Error creating sessions:', err);
    }
  }, [validation.isValid, onConfirm, sessionForm]);

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={handleClose}
      title={language === 'th' ? 'สร้างเซสชันใหม่' : 'Create New Sessions'}
      subtitle={language === 'th' ? 'กำหนดรายละเอียดเซสชันการเรียน' : 'Configure your learning sessions'}
      size="2xl"
      primaryAction={{
        label: isLoading 
          ? (language === 'th' ? 'กำลังสร้าง...' : 'Creating...') 
          : (language === 'th' ? 'สร้างเซสชัน' : 'Create Sessions'),
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
      <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {/* Modern Header - Optimized animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.4, 0, 0.2, 1], // Custom bezier for smoother animation
            type: "tween" 
          }}
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200/60 dark:border-purple-700/60"
        >
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
            <HiSparkles className="w-8 h-8 text-white" />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {language === 'th' ? '✨ สร้างเซสชันการเรียน' : '✨ Create Learning Sessions'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'th' ? 'จัดการเซสชันการเรียนอย่างมืออาชีพ' : 'Manage professional learning sessions'}
            </p>
          </div>
        </motion.div>
        {/* Schedule Info Banner - Optimized */}
        {scheduleName && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.1,
              ease: "easeOut",
              type: "tween"
            }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <HiCalendarDays className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'th' ? 'สร้างเซสชันสำหรับ' : 'Creating sessions for'}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {scheduleName}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Validation Status - Optimized animations */}
        <AnimatePresence>
          {(validation.errors.length > 0 || validation.warnings.length > 0 || validation.suggestions.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.25, 
                ease: "easeOut",
                layout: { duration: 0.2 }
              }}
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
                    <HiInformationCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        {language === 'th' ? 'คำแนะนำ:' : 'Suggestions:'}
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        {validation.suggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course & Teacher Selection */}
        <FormSection
          title={language === 'th' ? 'คอร์สและครู' : 'Course and Teacher'}
          icon={<HiAcademicCap />}
          color="green"
        >
          <FieldGroup columns={2}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'คอร์ส *' : 'Course *'}
              </label>
              <EnhancedSelect
                options={courseOptions}
                value={sessionForm.course_id}
                onChange={(value) => updateForm({ course_id: Array.isArray(value) ? value[0] : value })}
                placeholder={language === 'th' ? 'เลือกคอร์ส' : 'Select Course'}
                searchable
                key={`course-${sessionForm.course_id}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'ครู *' : 'Teacher *'}
              </label>
              <EnhancedSelect
                options={teacherOptions}
                value={sessionForm.teacher_id}
                onChange={(value) => updateForm({ teacher_id: Array.isArray(value) ? value[0] : value })}
                placeholder={language === 'th' ? 'เลือกครู' : 'Select Teacher'}
                searchable
                key={`teacher-${sessionForm.teacher_id}`}
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Level Selection */}
        <FormSection
          title={language === 'th' ? 'ระดับการเรียน' : 'Learning Level'}
          icon={<HiTag />}
          color="purple"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {language === 'th' ? 'เลือกระดับ *' : 'Select Level *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {levelOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ 
                    type: "tween",
                    duration: 0.15,
                    ease: "easeOut"
                  }}
                  onClick={() => updateForm({ level: option.value as 'beginner' | 'intermediate' | 'advanced' })}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 ease-out text-left ${
                    sessionForm.level === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {option.label}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                    {sessionForm.level === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <HiCheckCircle className={`w-6 h-6 text-${option.color}-500`} />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </FormSection>

        {/* Students */}
        <FormSection
          title={language === 'th' ? 'นักเรียน' : 'Students'}
          icon={<HiUserGroup />}
          color="blue"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'th' ? 'เลือกนักเรียน' : 'Select Students'}
            </label>
            <StudentSelect
              students={students}
              selectedIds={sessionForm.student_ids}
              onChange={(selectedIds) => updateForm({ student_ids: selectedIds })}
              className="w-full"
              key={`students-${sessionForm.student_ids.length}`}
            />
          </div>
        </FormSection>

        {/* Date & Session Configuration */}
        <FormSection
          title={language === 'th' ? 'วันที่และจำนวนเซสชัน' : 'Dates and Session Count'}
          icon={<HiCalendarDays />}
          color="blue"
        >
          <FieldGroup columns={3}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'วันที่เริ่ม *' : 'Start Date *'}
              </label>
              <DateInput
                value={sessionForm.start_date}
                onChange={(e) => updateForm({ start_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                key={`start-date-${sessionForm.start_date}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'วันที่สิ้นสุด *' : 'End Date *'}
              </label>
              <DateInput
                value={sessionForm.end_date}
                onChange={(e) => updateForm({ end_date: e.target.value })}
                min={sessionForm.start_date || new Date().toISOString().split('T')[0]}
                key={`end-date-${sessionForm.end_date}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'th' ? 'จำนวนเซสชัน *' : 'Session Count *'}
              </label>
              <ModernInput
                type="number"
                value={sessionForm.session_count.toString()}
                onChange={(e) => updateForm({ session_count: parseInt(e.target.value) || 1 })}
                min="1"
                max="100"
                leftIcon={<HiDocumentText />}
                key={`session-count-${sessionForm.session_count}`}
              />
            </div>
          </FieldGroup>
        </FormSection>

        {/* Time Slots - Using new modern component */}
        <FormSection
          title={language === 'th' ? 'ช่วงเวลา' : 'Time Slots'}
          icon={<HiClock />}
          color="red"
        >
          <ModernTimeSlotSelector
            value={sessionForm.time_slots}
            onChange={(slots) => updateForm({ time_slots: slots as ScheduleTimeSlot[] })}
            title=""
            format="schedule"
            variant="mobile" // Use the new mobile-optimized variant
            language={language}
            maxSlots={sessionForm.session_count}
            showBulkSelection={true}
            className="w-full"
            key={`time-slots-${sessionForm.time_slots.length}`}
          />
        </FormSection>

        {/* Notes */}
        <FormSection
          title={language === 'th' ? 'หมายเหตุ' : 'Notes'}
          icon={<HiDocumentText />}
          color="gray"
        >
          <ModernInput
            type="textarea"
            value={sessionForm.notes}
            onChange={(e) => updateForm({ notes: e.target.value })}
            placeholder={language === 'th' ? 'เพิ่มหมายเหตุเพิ่มเติม...' : 'Add any additional notes...'}
            leftIcon={<HiDocumentText />}
            key={`notes-${sessionForm.notes.length}`}
          />
        </FormSection>

        {/* Success State - Optimized animation */}
        {validation.isValid && !validation.hasWarnings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              type: "tween"
            }}
            className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/60 dark:border-emerald-700/60 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <HiCheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                  {language === 'th' ? 'พร้อมสร้างเซสชัน!' : 'Ready to Create Sessions!'}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {language === 'th' 
                    ? `จะสร้าง ${sessionForm.session_count} เซสชันสำหรับ ${sessionForm.time_slots.length} ช่วงเวลา`
                    : `Will create ${sessionForm.session_count} sessions across ${sessionForm.time_slots.length} time slots`
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ActionModal>
  );
}

export default ModernSessionsModal;