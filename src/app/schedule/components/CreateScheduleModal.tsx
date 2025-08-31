"use client";

import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { TimeSlotSelector, type ScheduleTimeSlot } from "@/components/common";
import { 
  CreateScheduleRequest, 
  Course, 
  Room, 
  TeacherOption 
} from "@/services/api/schedules";

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleForm: Partial<CreateScheduleRequest>;
  setScheduleForm: React.Dispatch<React.SetStateAction<Partial<CreateScheduleRequest>>>;
  courses: Course[];
  rooms: Room[];
  teacherOptions: TeacherOption[];
  formLoading: boolean;
  formError: string | null;
  setFormError: React.Dispatch<React.SetStateAction<string | null>>;
  onCreateSchedule: () => void;
}

export default function CreateScheduleModal({
  isOpen,
  onClose,
  scheduleForm,
  setScheduleForm,
  courses,
  rooms,
  teacherOptions,
  formLoading,
  formError,
  setFormError,
  onCreateSchedule,
}: CreateScheduleModalProps) {
  const { language, t } = useLanguage();

  const handleClose = () => {
    onClose();
    setFormError(null);
    setScheduleForm({
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
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
    >
      <div className="max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-300 px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-black">{t.createNewSchedule}</h3>
        </div>

        {/* Body */}
        <div className="py-6 px-6 max-h-[70vh] overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {t.preliminaryInfo}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.scheduleName} *
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.schedule_name || ''}
                    onChange={(e) => setScheduleForm(prev => ({...prev, schedule_name: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={language === 'th' ? 'ชื่อตารางเรียน' : 'Schedule name'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectCourse} *
                  </label>
                  <select
                    value={scheduleForm.course_id || 0}
                    onChange={(e) => setScheduleForm(prev => ({...prev, course_id: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={0}>{t.selectCourse}</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectTeacher}
                  </label>
                  <select
                    value={scheduleForm.teacher_id || 0}
                    onChange={(e) => setScheduleForm(prev => ({...prev, teacher_id: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={0}>{t.selectTeacher}</option>
                    {teacherOptions.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.teacher_nickname} - {teacher.teacher_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectRoom}
                  </label>
                  <select
                    value={scheduleForm.room_id || 0}
                    onChange={(e) => setScheduleForm(prev => ({...prev, room_id: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={0}>{t.selectRoom}</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.room_name} ({language === 'th' ? 'ความจุ' : 'Capacity'}: {room.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.totalHours}
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.total_hours || 30}
                    onChange={(e) => setScheduleForm(prev => ({...prev, total_hours: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.hoursPerSession}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={scheduleForm.hours_per_session || 3}
                    onChange={(e) => setScheduleForm(prev => ({...prev, hours_per_session: parseFloat(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={0.5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.maxStudents}
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.max_students || 6}
                    onChange={(e) => setScheduleForm(prev => ({...prev, max_students: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.startDate} *
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.start_date || ''}
                    onChange={(e) => setScheduleForm(prev => ({...prev, start_date: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleForm.auto_reschedule_holidays || false}
                    onChange={(e) => setScheduleForm(prev => ({...prev, auto_reschedule_holidays: e.target.checked}))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">{t.autoRescheduleHolidays}</span>
                </label>
              </div>
            </div>

            {/* Time Slots */}
            <TimeSlotSelector
              value={scheduleForm.time_slots || []}
              onChange={(slots) => setScheduleForm(prev => ({...prev, time_slots: slots as ScheduleTimeSlot[]}))}
              title={t.timeSlots + ' *'}
              description={language === 'th' ? 'เลือกวันและเวลาที่ต้องการจัดเรียน' : 'Select days and times for classes'}
              format="schedule"
              variant="compact"
              language={language}
              maxSlots={7}
              showBulkSelection={true}
            />

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.notes}
              </label>
              <textarea
                value={scheduleForm.notes || ''}
                onChange={(e) => setScheduleForm(prev => ({...prev, notes: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder={language === 'th' ? 'หมายเหตุเพิ่มเติม' : 'Additional notes'}
              />
            </div>

            {/* Error Display */}
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 px-6 py-4">
          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleClose}
              variant="monthView"
              className="cursor-pointer"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={onCreateSchedule}
              variant="monthViewClicked"
              disabled={formLoading}
              className={`px-4 py-2 cursor-pointer ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {formLoading && <LoadingSpinner className="w-4 h-4 mr-2" />}
              {formLoading ? t.processing : t.createNewSchedule}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}