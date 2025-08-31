"use client";

import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Session, Student } from "@/services/api/schedules";

interface ScheduleDetail {
  schedule: {
    id: number;
    schedule_name: string;
    course_name: string;
    course_code: string;
    total_hours: string;
    hours_per_session: string;
    max_students: number;
    current_students: number;
    available_spots: number;
    start_date: string;
    status: string;
    schedule_type: string;
    auto_reschedule_holidays: number;
  };
  students: Student[];
  sessions: Array<{
    id: number;
    schedule_id: number;
    session_date: string;
    session_number: number;
    week_number: number;
    start_time: string;
    end_time: string;
    teacher_id: number;
    room_name: string;
    status: string;
    teacher_first_name: string;
    teacher_last_name: string;
    notes: string | null;
  }>;
  summary: {
    total_sessions: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    makeup_sessions: number;
    total_exceptions: number;
    total_enrolled_students: number;
  };
}

const branchColors: Record<number, string> = {
  1: "bg-[#334293] text-white", // Branch 1 - Blue
  2: "bg-[#5EABD6] text-white", // Online - Light Blue
  3: "bg-[#EFE957] text-black", // Branch 3 - Yellow
};

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSession: Session | null;
  scheduleDetail: ScheduleDetail | null;
  detailLoading: boolean;
  onEditSchedule: (scheduleDetail: ScheduleDetail) => void;
  onCreateSession: (session: Session) => void;
  onRetryLoading: (session: Session) => void;
}

export default function SessionDetailModal({
  isOpen,
  onClose,
  selectedSession,
  scheduleDetail,
  detailLoading,
  onEditSchedule,
  onCreateSession,
  onRetryLoading,
}: SessionDetailModalProps) {
  const { language, t } = useLanguage();

  if (!selectedSession) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <div className="max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-300 pb-4 px-6 pt-6">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-black mb-2">
                {selectedSession.schedule_name}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedSession.course_name} {selectedSession.course_code && `(${selectedSession.course_code})`}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  branchColors[selectedSession.branch_id] || 'bg-gray-200 text-gray-700'
                }`}
              >
                {language === 'th' ? selectedSession.branch_name_th : selectedSession.branch_name_en}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedSession.status === 'scheduled' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedSession.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {language === 'th' 
                  ? (selectedSession.status === 'scheduled' ? 'กำหนดเรียน' : 
                     selectedSession.status === 'completed' ? 'เสร็จสิ้น' : 
                     selectedSession.status === 'cancelled' ? 'ยกเลิก' : selectedSession.status)
                  : selectedSession.status
                }
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="py-6 px-6 max-h-[60vh] overflow-y-auto flex-1">
          {detailLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : scheduleDetail ? (
            <div className="space-y-6">
              {/* Schedule Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {t.scheduleInformation}
                  </h4>
                  <div className="space-y-2 text-sm text-black">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">{t.time}:</span>
                      <span className="font-semibold">
                        {selectedSession.start_time.slice(0, 5)} - {selectedSession.end_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">{t.classroom}:</span>
                      <span>{selectedSession.room_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">{t.students}:</span>
                      <span className="font-bold text-rose-600">
                        {selectedSession.current_students}/{selectedSession.max_students} {t.people}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">{t.available}:</span>
                      <span className="font-semibold text-green-600">
                        {selectedSession.max_students - selectedSession.current_students} {t.people}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-black mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {t.courseInformation}
                  </h4>
                  <div className="space-y-2 text-sm text-black">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">{t.totalHours}:</span>
                      <span>{scheduleDetail.schedule.total_hours} {language === 'th' ? 'ชม.' : 'hrs'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">{t.hoursPerSession}:</span>
                      <span>{scheduleDetail.schedule.hours_per_session} {language === 'th' ? 'ชม.' : 'hrs'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">{t.startDate}:</span>
                      <span>{new Date(scheduleDetail.schedule.start_date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">{t.type}:</span>
                      <span className="capitalize">{scheduleDetail.schedule.schedule_type}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Students List */}
              {scheduleDetail.students.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    {t.studentList} ({scheduleDetail.students.length} {t.people})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                    {scheduleDetail.students.map((student) => (
                      <div key={student.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {t.nickname}: {student.nickname} • {t.age}: {student.age} {t.years}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              📞 {student.phone}
                            </p>
                            {student.email && (
                              <p className="text-xs text-gray-500">
                                ✉️ {student.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  {t.scheduleSummary}
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center bg-white p-3 rounded-lg">
                    <p className="font-bold text-2xl text-blue-600">{scheduleDetail.summary.total_sessions}</p>
                    <p className="text-gray-600 text-xs">{t.totalSessions}</p>
                  </div>
                  <div className="text-center bg-white p-3 rounded-lg">
                    <p className="font-bold text-2xl text-green-600">{scheduleDetail.summary.scheduled}</p>
                    <p className="text-gray-600 text-xs">{t.scheduledSessions}</p>
                  </div>
                  <div className="text-center bg-white p-3 rounded-lg">
                    <p className="font-bold text-2xl text-gray-600">{scheduleDetail.summary.completed}</p>
                    <p className="text-gray-600 text-xs">{t.completedSessions}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedSession.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    {t.notes}
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedSession.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-center text-gray-500">{t.failedToLoadDetails}</p>
              <Button
                onClick={() => onRetryLoading(selectedSession)}
                variant="monthView"
                className="mt-2 text-sm cursor-pointer"
              >
                {t.retryLoading}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 px-6 pb-6">
          <div className="flex justify-end space-x-2">
            <Button
              onClick={onClose}
              variant="monthView"
              className="cursor-pointer"
            >
              {t.close}
            </Button>
            <Button
              onClick={() => {
                if (scheduleDetail) {
                  onEditSchedule(scheduleDetail);
                  onClose();
                }
              }}
              variant="weekView"
              className="cursor-pointer"
            >
              {t.editSchedule}
            </Button>
            <Button
              onClick={() => {
                onCreateSession(selectedSession);
                onClose();
              }}
              variant="monthViewClicked"
              className="cursor-pointer"
            >
              {t.createSession}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}