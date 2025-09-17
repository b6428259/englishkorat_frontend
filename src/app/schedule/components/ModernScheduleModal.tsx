"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { HiDocumentText } from 'react-icons/hi2';
import { CalendarIcon, ClockIcon, BookOpenIcon, UsersIcon, MapPinIcon } from 'lucide-react';
import { validateScheduleForm, deriveScheduleFields, type ValidationIssue } from '@/utils/scheduleValidation';
import { 
  CreateScheduleInput as CreateScheduleRequest, 
  Course, 
  Room, 
  TeacherOption 
} from '@/services/api/schedules';
import { GroupOption } from '@/types/group.types';

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
  groups?: GroupOption[];
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
  groups = [],
  isLoading = false,
  error
}: ModernScheduleModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("basic");

  // Internal form state
  const [internalForm, setInternalForm] = useState<Partial<CreateScheduleRequest>>({
    schedule_name: '',
    schedule_type: 'class',
    course_id: 0,
    group_id: 0,
    teacher_id: 0,
    room_id: 0,
    total_hours: 30,
    hours_per_session: 3,
    max_students: 6,
    start_date: new Date().toISOString().split('T')[0],
    time_slots: [],
    auto_reschedule: true,
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

  useEffect(() => {
    if (externalForm && !externalUpdate) {
      setInternalForm(externalForm);
    }
  }, [externalForm, externalUpdate]);

  // Validation
  const issues = useMemo<ValidationIssue[]>(() => validateScheduleForm(scheduleForm), [scheduleForm]);
  const getFieldError = useCallback((field: string) => issues.find(i => i.field === field)?.message, [issues]);
  const hasErrors = issues.length > 0;
  const { estimated_end_date, total_sessions } = useMemo(() => deriveScheduleFields(scheduleForm), [scheduleForm]);

  const scheduleTypes = [
    { value: 'class', label: language === 'th' ? 'คลาสเรียน' : 'Class', icon: UsersIcon },
    { value: 'private', label: language === 'th' ? 'ติวเตอร์' : 'Private', icon: UsersIcon },
    { value: 'workshop', label: language === 'th' ? 'เวิร์คช็อป' : 'Workshop', icon: BookOpenIcon },
  ];

  const weekDays = [
    { value: 'monday', label: language === 'th' ? 'จันทร์' : 'Monday' },
    { value: 'tuesday', label: language === 'th' ? 'อังคาร' : 'Tuesday' },
    { value: 'wednesday', label: language === 'th' ? 'พุธ' : 'Wednesday' },
    { value: 'thursday', label: language === 'th' ? 'พฤหัสบดี' : 'Thursday' },
    { value: 'friday', label: language === 'th' ? 'ศุกร์' : 'Friday' },
    { value: 'saturday', label: language === 'th' ? 'เสาร์' : 'Saturday' },
    { value: 'sunday', label: language === 'th' ? 'อาทิตย์' : 'Sunday' },
  ];

  const addTimeSlot = () => {
    const newSlot: ScheduleTimeSlot = {
      day_of_week: 'monday',
      start_time: '09:00',
      end_time: '12:00'
    };
    updateForm({
      time_slots: [...(scheduleForm.time_slots || []), newSlot]
    });
  };

  const removeTimeSlot = (index: number) => {
    const newTimeSlots = (scheduleForm.time_slots || []).filter((_, i) => i !== index);
    updateForm({ time_slots: newTimeSlots });
  };

  const updateTimeSlot = (index: number, updates: Partial<ScheduleTimeSlot>) => {
    const newTimeSlots = (scheduleForm.time_slots || []).map((slot, i) => 
      i === index ? { ...slot, ...updates } : slot
    );
    updateForm({ time_slots: newTimeSlots });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-indigo-600" />
            {language === 'th' ? 'สร้างตารางเรียนใหม่' : 'Create New Schedule'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4" />
                {language === 'th' ? 'ข้อมูลพื้นฐาน' : 'Basic Info'}
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                {language === 'th' ? 'ตารางเวลา' : 'Time Schedule'}
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <HiDocumentText className="h-4 w-4" />
                {language === 'th' ? 'พรีวิว' : 'Preview'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="flex-1 overflow-y-auto space-y-6">
              {/* Schedule Name */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HiDocumentText className="h-5 w-5 text-indigo-600" />
                  {language === 'th' ? 'ข้อมูลพื้นฐาน' : 'Basic Information'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'th' ? 'ชื่อตารางเรียน' : 'Schedule Name'}
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.schedule_name || ''}
                      onChange={(e) => updateForm({ schedule_name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={language === 'th' ? 'ใส่ชื่อตารางเรียน' : 'Enter schedule name'}
                    />
                    {getFieldError('schedule_name') && (
                      <p className="text-red-500 text-sm mt-1">{getFieldError('schedule_name')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'th' ? 'ประเภทตารางเรียน' : 'Schedule Type'}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {scheduleTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <button
                              key={type.value}
                              type="button"
                              onClick={() => updateForm({ schedule_type: type.value as import('@/services/api/schedules').CreateScheduleInput['schedule_type'] })}
                              className={`p-4 rounded-lg border text-center transition-all ${
                                scheduleForm.schedule_type === type.value
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                            <IconComponent className="h-6 w-6 mx-auto mb-2" />
                            <p className="font-medium">{type.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'th' ? 'คอร์ส' : 'Course'}
                      </label>
                      <select
                        value={scheduleForm.course_id || 0}
                        onChange={(e) => updateForm({ course_id: parseInt(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value={0}>{language === 'th' ? 'เลือกคอร์ส' : 'Select Course'}</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.course_name} - {course.level}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'th' ? 'ครู' : 'Teacher'}
                      </label>
                      <select
                        value={scheduleForm.teacher_id || 0}
                        onChange={(e) => updateForm({ teacher_id: parseInt(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value={0}>{language === 'th' ? 'เลือกครู' : 'Select Teacher'}</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.teacher_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'th' ? 'ห้องเรียน' : 'Room'}
                      </label>
                      <select
                        value={scheduleForm.room_id || 0}
                        onChange={(e) => updateForm({ room_id: parseInt(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value={0}>{language === 'th' ? 'เลือกห้องเรียน' : 'Select Room'}</option>
                        {rooms.map(room => (
                          <option key={room.id} value={room.id}>
                            {room.room_name} (ความจุ: {room.capacity})
                          </option>
                        ))}
                      </select>
                    </div>

                    {groups.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === 'th' ? 'กลุ่ม' : 'Group'}
                        </label>
                        <select
                          value={scheduleForm.group_id || 0}
                          onChange={(e) => updateForm({ group_id: parseInt(e.target.value) })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value={0}>{language === 'th' ? 'เลือกกลุ่ม' : 'Select Group'}</option>
                          {groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.group_name}
                          </option>
                        ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'th' ? 'จำนวนชั่วโมงรวม' : 'Total Hours'}
                      </label>
                      <input
                        type="number"
                        value={scheduleForm.total_hours || ''}
                        onChange={(e) => updateForm({ total_hours: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'th' ? 'ชั่วโมงต่อครั้ง' : 'Hours per Session'}
                      </label>
                      <input
                        type="number"
                        value={scheduleForm.hours_per_session || ''}
                        onChange={(e) => updateForm({ hours_per_session: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="1"
                        step="0.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'th' ? 'จำนวนนักเรียนสูงสุด' : 'Max Students'}
                      </label>
                      <input
                        type="number"
                        value={scheduleForm.max_students || ''}
                        onChange={(e) => updateForm({ max_students: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'th' ? 'วันที่เริ่มต้น' : 'Start Date'}
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.start_date || ''}
                      onChange={(e) => updateForm({ start_date: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="flex-1 overflow-y-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-indigo-600" />
                    {language === 'th' ? 'ตารางเวลา' : 'Time Schedule'}
                  </h3>
                  <Button
                    onClick={addTimeSlot}
                    variant="monthViewClicked"
                    className="px-4 py-2 text-sm"
                  >
                    + {language === 'th' ? 'เพิ่มช่วงเวลา' : 'Add Time Slot'}
                  </Button>
                </div>

                <div className="space-y-4">
                  {(scheduleForm.time_slots || []).map((slot, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {language === 'th' ? 'ช่วงเวลาที่' : 'Time Slot'} {index + 1}
                        </h4>
                        <button
                          onClick={() => removeTimeSlot(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          {language === 'th' ? 'ลบ' : 'Remove'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'th' ? 'วันในสัปดาห์' : 'Day of Week'}
                          </label>
                          <select
                            value={slot.day_of_week}
                            onChange={(e) => updateTimeSlot(index, { day_of_week: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            {weekDays.map(day => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'th' ? 'เวลาเริ่ม' : 'Start Time'}
                          </label>
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => updateTimeSlot(index, { start_time: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'th' ? 'เวลาสิ้นสุด' : 'End Time'}
                          </label>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => updateTimeSlot(index, { end_time: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(scheduleForm.time_slots || []).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>{language === 'th' ? 'ยังไม่มีช่วงเวลา คลิกเพิ่มช่วงเวลาเพื่อเริ่มต้น' : 'No time slots added. Click "Add Time Slot" to start.'}</p>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'th' ? 'หมายเหตุ' : 'Notes'}
                    </label>
                    <textarea
                      value={scheduleForm.notes || ''}
                      onChange={(e) => updateForm({ notes: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24 resize-none"
                      placeholder={language === 'th' ? 'เพิ่มหมายเหตุ (ถ้ามี)' : 'Add notes (optional)'}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_reschedule"
                      checked={scheduleForm.auto_reschedule || false}
                      onChange={(e) => updateForm({ auto_reschedule: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="auto_reschedule" className="text-sm text-gray-700">
                      {language === 'th' ? 'จัดตารางใหม่อัตโนมัติเมื่อมีวันหยุด' : 'Auto reschedule for holidays'}
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-y-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <HiDocumentText className="h-5 w-5 text-indigo-600" />
                  {language === 'th' ? 'สรุปตารางเรียน' : 'Schedule Summary'}
                </h3>

                <div className="space-y-6">
                  {/* Basic Info Summary */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {scheduleForm.schedule_name || (language === 'th' ? 'ไม่ระบุชื่อ' : 'Untitled Schedule')}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm text-gray-600">
                          {courses.find(c => c.id === scheduleForm.course_id)?.course_name || 
                           (language === 'th' ? 'ไม่ระบุคอร์ส' : 'No course selected')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm text-gray-600">
                          {teachers.find(t => t.id === scheduleForm.teacher_id)?.teacher_name || 
                           (language === 'th' ? 'ไม่ระบุครู' : 'No teacher selected')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm text-gray-600">
                          {rooms.find(r => r.id === scheduleForm.room_id)?.room_name || 
                           (language === 'th' ? 'ไม่ระบุห้อง' : 'No room selected')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">
                        {language === 'th' ? 'รายละเอียดการเรียน' : 'Class Details'}
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === 'th' ? 'ประเภท:' : 'Type:'}</span>
                          <Badge variant="outline">{scheduleForm.schedule_type}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === 'th' ? 'จำนวนชั่วโมงรวม:' : 'Total Hours:'}</span>
                          <span>{scheduleForm.total_hours} {language === 'th' ? 'ชั่วโมง' : 'hours'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === 'th' ? 'ชั่วโมงต่อครั้ง:' : 'Hours per Session:'}</span>
                          <span>{scheduleForm.hours_per_session} {language === 'th' ? 'ชั่วโมง' : 'hours'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === 'th' ? 'นักเรียนสูงสุด:' : 'Max Students:'}</span>
                          <span>{scheduleForm.max_students} {language === 'th' ? 'คน' : 'students'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">
                        {language === 'th' ? 'ประมาณการ' : 'Estimates'}
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === 'th' ? 'จำนวนครั้งทั้งหมด:' : 'Total Sessions:'}</span>
                          <span>{total_sessions} {language === 'th' ? 'ครั้ง' : 'sessions'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === 'th' ? 'วันที่เริ่ม:' : 'Start Date:'}</span>
                          <span>{scheduleForm.start_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{language === 'th' ? 'วันที่สิ้นสุด (ประมาณ):' : 'Estimated End:'}</span>
                          <span>{estimated_end_date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Slots */}
                  {(scheduleForm.time_slots || []).length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">
                        {language === 'th' ? 'ตารางเวลา' : 'Time Schedule'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(scheduleForm.time_slots || []).map((slot, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {weekDays.find(d => d.value === slot.day_of_week)?.label}
                              </span>
                              <span className="text-sm text-gray-600">
                                {slot.start_time} - {slot.end_time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validation Errors */}
                  {hasErrors && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h5 className="font-medium text-red-800 mb-2">
                        {language === 'th' ? 'ข้อมูลที่ต้องแก้ไข:' : 'Issues to Fix:'}
                      </h5>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {issues.map((issue, index) => (
                          <li key={index}>{issue.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between w-full">
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <Button onClick={onClose} variant="monthView">
                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
              </Button>
              <Button 
                onClick={onConfirm} 
                disabled={hasErrors || isLoading}
                variant="monthViewClicked"
                className="px-6 py-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  language === 'th' ? 'สร้างตารางเรียน' : 'Create Schedule'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}