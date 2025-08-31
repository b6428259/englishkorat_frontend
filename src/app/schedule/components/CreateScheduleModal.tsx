"use client";

import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { TimeSlotSelector, type ScheduleTimeSlot } from "@/components/common";
import { 
  FormField,
  Input,
  Select,
  Textarea,
  Checkbox
} from "@/components/forms";
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
                <FormField label={t.scheduleName} required>
                  <Input
                    type="text"
                    value={scheduleForm.schedule_name || ''}
                    onChange={(e) => setScheduleForm(prev => ({...prev, schedule_name: e.target.value}))}
                    placeholder={language === 'th' ? 'ชื่อตารางเรียน' : 'Schedule name'}
                  />
                </FormField>
                
                <FormField label={t.selectCourse} required>
                  <Select
                    value={(scheduleForm.course_id || 0).toString()}
                    onChange={(e) => setScheduleForm(prev => ({...prev, course_id: parseInt(e.target.value)}))}
                    options={[
                      { value: '0', label: t.selectCourse },
                      ...courses.map(course => ({
                        value: course.id.toString(),
                        label: `${course.course_name} (${course.course_code})`
                      }))
                    ]}
                  />
                </FormField>

                <FormField label={t.selectTeacher}>
                  <Select
                    value={(scheduleForm.teacher_id || 0).toString()}
                    onChange={(e) => setScheduleForm(prev => ({...prev, teacher_id: parseInt(e.target.value)}))}
                    options={[
                      { value: '0', label: t.selectTeacher },
                      ...teacherOptions.map(teacher => ({
                        value: teacher.id.toString(),
                        label: `${teacher.teacher_nickname} - ${teacher.teacher_name}`
                      }))
                    ]}
                  />
                </FormField>

                <FormField label={t.selectRoom}>
                  <Select
                    value={(scheduleForm.room_id || 0).toString()}
                    onChange={(e) => setScheduleForm(prev => ({...prev, room_id: parseInt(e.target.value)}))}
                    options={[
                      { value: '0', label: t.selectRoom },
                      ...rooms.map(room => ({
                        value: room.id.toString(),
                        label: `${room.room_name} (${language === 'th' ? 'ความจุ' : 'Capacity'}: ${room.capacity})`
                      }))
                    ]}
                  />
                </FormField>

                <FormField label={t.totalHours}>
                  <Input
                    type="number"
                    value={(scheduleForm.total_hours || 30).toString()}
                    onChange={(e) => setScheduleForm(prev => ({...prev, total_hours: parseInt(e.target.value)}))}
                    min={1}
                  />
                </FormField>

                <FormField label={t.hoursPerSession}>
                  <Input
                    type="number"
                    step="0.5"
                    value={(scheduleForm.hours_per_session || 3).toString()}
                    onChange={(e) => setScheduleForm(prev => ({...prev, hours_per_session: parseFloat(e.target.value)}))}
                    min={0.5}
                  />
                </FormField>

                <FormField label={t.maxStudents}>
                  <Input
                    type="number"
                    value={(scheduleForm.max_students || 6).toString()}
                    onChange={(e) => setScheduleForm(prev => ({...prev, max_students: parseInt(e.target.value)}))}
                    min={1}
                  />
                </FormField>

                <FormField label={t.startDate} required>
                  <Input
                    type="date"
                    value={scheduleForm.start_date || ''}
                    onChange={(e) => setScheduleForm(prev => ({...prev, start_date: e.target.value}))}
                  />
                </FormField>
              </div>

              <div className="mt-4">
                <Checkbox
                  label={t.autoRescheduleHolidays}
                  checked={scheduleForm.auto_reschedule_holidays || false}
                  onChange={(e) => setScheduleForm(prev => ({...prev, auto_reschedule_holidays: e.target.checked}))}
                />
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
            <FormField label={t.notes}>
              <Textarea
                value={scheduleForm.notes || ''}
                onChange={(e) => setScheduleForm(prev => ({...prev, notes: e.target.value}))}
                rows={3}
                placeholder={language === 'th' ? 'หมายเหตุเพิ่มเติม' : 'Additional notes'}
              />
            </FormField>

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