"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarLayout from "../../components/common/SidebarLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "@/components/common/Button";
import { colors } from "@/styles/colors";
import { ButtonGroup } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { scheduleService, Teacher, Session, Student } from "@/services/api/schedules";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

// Time slots from 8:00 AM to 10:00 PM
const timeSlots = Array.from({ length: (22 - 8) * 2 + 1 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? 0 : 30;
  const label = `${hour % 12 === 0 ? 12 : hour % 12}:${
    minute === 0 ? "00" : "30"
  }${hour < 12 ? "am" : "pm"}`;
  return { hour, minute, label };
});

const branchColors: Record<number, string> = {
  1: "bg-[#334293] text-white", // Branch 1 - Blue
  2: "bg-[#5EABD6] text-white", // Online - Light Blue
  3: "bg-[#EFE957] text-black", // Branch 3 - Yellow
};

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

export default function SchedulePage() {
  const { t } = useLanguage();
  
  // State management
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [scheduleDetail, setScheduleDetail] = useState<ScheduleDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Create schedule modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createScheduleData, setCreateScheduleData] = useState<{
    teacherId: number;
    timeSlot: { hour: number; minute: number };
    date: string;
  } | null>(null);

  // Get current time for the current time line - updates every minute
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes()
    };
  });

  // Update current time every minute for realtime line
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime({
        hour: now.getHours(),
        minute: now.getMinutes()
      });
    };

    // Update immediately and then every minute
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch teachers and schedules
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await scheduleService.getTeachersSchedule(viewMode);
      
      if (response.success) {
        setTeachers(response.data.teachers);
        // Initialize all teachers as selected
        setSelectedTeachers(response.data.teachers.map(t => t.teacher_id));
      }
    } catch (err) {
      setError('Failed to fetch schedule data');
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  // Filter teachers based on selection
  const filteredTeachers = teachers.filter(teacher => 
    selectedTeachers.includes(teacher.teacher_id)
  );

  const toggleTeacher = (teacherId: number) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  // Calculate row span for sessions
  const getRowSpan = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    const diffMinutes = endInMinutes - startInMinutes;
    
    return Math.max(1, diffMinutes / 30); // 30 minutes per slot
  };

  // Handle session click for details
  const handleSessionClick = async (session: Session) => {
    setSelectedSession(session);
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    
    try {
      const response = await scheduleService.getScheduleDetails(session.schedule_id.toString());
      if (response.success) {
        setScheduleDetail(response.data);
      }
    } catch (err) {
      console.error('Error fetching schedule details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle empty cell click for creating schedule
  const handleEmptyCellClick = (teacherId: number, timeSlot: { hour: number; minute: number }) => {
    const today = new Date().toISOString().split('T')[0];
    setCreateScheduleData({
      teacherId,
      timeSlot,
      date: today
    });
    setIsCreateModalOpen(true);
  };

  // Check if a time slot is the current time (for current time indicator)
  const isCurrentTimeSlot = (hour: number, minute: number): boolean => {
    if (viewMode !== 'day') return false;
    
    const slotTime = hour * 60 + minute;
    const currentTimeMinutes = currentTime.hour * 60 + currentTime.minute;
    
    // Show indicator if current time is within this 30-minute slot
    return currentTimeMinutes >= slotTime && currentTimeMinutes < slotTime + 30;
  };

  if (loading) {
    return (
      <SidebarLayout breadcrumbItems={[{ label: t.schedule }]}>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout breadcrumbItems={[{ label: t.schedule }]}>
        <ErrorMessage message={error} onRetry={fetchData} />
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout breadcrumbItems={[{ label: t.schedule }]}>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-black">{t.schedule}</h1>
            
            {/* View Mode Buttons */}
            <ButtonGroup>
              <Button
                variant={viewMode === "month" ? "monthViewClicked" : "monthView"}
                onClick={() => setViewMode("month")}
              >
                MONTH
              </Button>
              <Button
                variant={viewMode === "week" ? "weekViewClicked" : "weekView"}
                onClick={() => setViewMode("week")}
              >
                WEEK
              </Button>
              <Button
                variant={viewMode === "day" ? "dayViewClicked" : "dayView"}
                onClick={() => setViewMode("day")}
              >
                DAY
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-3 flex-1 min-h-0 overflow-hidden">
          {/* Teacher Filters */}
          <div className="w-60 bg-white border border-gray-200 rounded-lg p-2 flex flex-col flex-shrink-0">
            <h2 className="font-bold mb-2 text-[#334293] border-b border-[#334293] pb-1 text-sm">
              เลือกครู
            </h2>
            
            <div className="mb-2">
              <Button
                variant="monthView"
                onClick={() => setSelectedTeachers(teachers.map(t => t.teacher_id))}
                className="text-xs mr-1 mb-1 px-2 py-1"
              >
                ทั้งหมด
              </Button>
              <Button
                variant="monthView"
                onClick={() => setSelectedTeachers([])}
                className="text-xs mb-1 px-2 py-1"
              >
                ยกเลิก
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1">
              {teachers.map((teacher) => (
                <label key={teacher.teacher_id} className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.includes(teacher.teacher_id)}
                    onChange={() => toggleTeacher(teacher.teacher_id)}
                    className="h-3 w-3 rounded focus:ring-0"
                    style={{ accentColor: colors.yellowLogo }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium block truncate" style={{ color: colors.blueLogo }}>
                      {teacher.teacher_nickname}
                    </span>
                    <p className="text-xs text-gray-500 truncate">{teacher.teacher_name}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Schedule Table Container */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden relative min-w-0">
            <div className="h-full overflow-auto">
              <div className="relative min-h-full">
                {/* Current Time Line - spans across entire table width */}
                {viewMode === 'day' && (
                  <div 
                    className="absolute left-0 right-0 z-50 pointer-events-none"
                    style={{
                      top: `${36 + (() => {
                        const currentMinutes = currentTime.hour * 60 + currentTime.minute;
                        const startMinutes = 8 * 60; // 8:00 AM
                        const endMinutes = 22 * 60; // 10:00 PM
                        
                        if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
                          return -1000; // Hide line if outside schedule hours
                        }
                        
                        const minutesFromStart = currentMinutes - startMinutes;
                        const totalSlots = (22 - 8) * 2 + 1; // Total 30-min slots
                        const pixelsPerSlot = 32; // Height per slot
                        
                        return (minutesFromStart / 30) * pixelsPerSlot;
                      })()}px`
                    }}
                  >
                    <div className="relative">
                      <div className="h-0.5 bg-red-500 shadow-lg"></div>
                      <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full shadow-md"></div>
                      <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full shadow-md"></div>
                      {/* Time label */}
                      <div className="absolute -top-6 left-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg">
                        {currentTime.hour.toString().padStart(2, '0')}:{currentTime.minute.toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                )}

                <table className="w-full text-sm border-collapse table-fixed">
                  <thead className="sticky top-0 z-20">
                    <tr>
                      <th className="w-16 text-center font-bold text-white bg-[#334293] border border-gray-300 p-1 text-xs">
                        เวลา
                      </th>
                      {filteredTeachers.map((teacher) => (
                        <th 
                          key={teacher.teacher_id}
                          className="text-center font-bold text-white bg-[#334293] border border-gray-300 p-2 text-sm"
                          style={{ width: `${100 / Math.max(filteredTeachers.length, 1)}%` }}
                        >
                          {teacher.teacher_nickname}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((timeSlot, index) => (
                      <tr key={`${timeSlot.hour}-${timeSlot.minute}`} className="h-8">
                        <td className="font-medium text-gray-700 bg-gray-50 text-xs border border-gray-300 text-center p-1 relative">
                          {timeSlot.label}
                        </td>
                        
                        {filteredTeachers.map((teacher) => {
                          // Find session that starts at this time slot
                          const session = teacher.sessions.find(s => {
                            const [startHour, startMinute] = s.start_time.split(':').map(Number);
                            return startHour === timeSlot.hour && startMinute === timeSlot.minute;
                          });

                          if (session) {
                            const rowSpan = getRowSpan(session.start_time, session.end_time);
                            return (
                              <td 
                                key={teacher.teacher_id} 
                                rowSpan={rowSpan}
                                className="p-0.5 border border-gray-300 align-top relative"
                              >
                                <div
                                  className="w-full h-full p-1.5 rounded cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200"
                                  style={{
                                    minHeight: `${rowSpan * 32 - 2}px`
                                  }}
                                  onClick={() => handleSessionClick(session)}
                                >
                                  <p className="font-bold text-xs text-black mb-0.5 line-clamp-1">
                                    {session.schedule_name}
                                  </p>

                                  <p className="font-bold text-xs text-rose-600 mb-0.5">
                                    {session.current_students}/{session.max_students}
                                  </p>

                                  <p className="text-xs text-gray-600 mb-0.5 line-clamp-1">
                                    {session.course_name}
                                  </p>

                                  <p className="text-xs text-gray-500 mb-0.5">
                                    {session.room_name}
                                  </p>

                                  <span
                                    className={`inline-block px-1 py-0.5 rounded text-xs font-medium ${
                                      branchColors[session.branch_id] || 'bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {session.branch_name_th}
                                  </span>

                                  {session.notes && rowSpan > 4 && (
                                    <p className="text-[10px] italic text-gray-500 mt-0.5 line-clamp-1">
                                      {session.notes}
                                    </p>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          // Check if this cell is blocked by a session that spans multiple rows
                          const isBlocked = teacher.sessions.some(s => {
                            const [startHour, startMinute] = s.start_time.split(':').map(Number);
                            const [endHour, endMinute] = s.end_time.split(':').map(Number);
                            const sessionStartMinutes = startHour * 60 + startMinute;
                            const sessionEndMinutes = endHour * 60 + endMinute;
                            const currentSlotMinutes = timeSlot.hour * 60 + timeSlot.minute;
                            
                            return currentSlotMinutes > sessionStartMinutes && currentSlotMinutes < sessionEndMinutes;
                          });

                          if (isBlocked) {
                            return null; // This cell is part of a multi-row session
                          }

                          // Empty cell
                          return (
                            <td 
                              key={teacher.teacher_id}
                              className="border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                              onClick={() => handleEmptyCellClick(teacher.teacher_id, timeSlot)}
                            >
                              <div className="w-full h-8"></div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onOpenChange={setIsDetailModalOpen}
        size="2xl"
      >
        <ModalContent className="bg-white border border-gray-300 rounded-lg shadow-lg">
          {selectedSession && (
            <>
              <ModalHeader className="border-b border-gray-300 pb-4">
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">
                      {selectedSession.schedule_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedSession.course_name} ({selectedSession.course_code})
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      branchColors[selectedSession.branch_id] || 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {selectedSession.branch_name_th}
                  </span>
                </div>
              </ModalHeader>

              <ModalBody className="py-6">
                {detailLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <LoadingSpinner />
                  </div>
                ) : scheduleDetail ? (
                  <div className="space-y-6">
                    {/* Schedule Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">ข้อมูลตารางเรียน</h4>
                        <div className="space-y-2 text-sm text-black">
                          <p><span className="font-medium">เวลา:</span> {selectedSession.start_time.slice(0, 5)} - {selectedSession.end_time.slice(0, 5)}</p>
                          <p><span className="font-medium">ห้องเรียน:</span> {selectedSession.room_name}</p>
                          <p><span className="font-medium">จำนวนนักเรียน:</span> 
                            <span className="font-bold text-rose-600 ml-1">
                              {selectedSession.current_students}/{selectedSession.max_students} คน
                            </span>
                          </p>
                          <p><span className="font-medium">สถานะ:</span> 
                            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                              selectedSession.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedSession.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-black mb-2">ข้อมูลคอร์ส</h4>
                        <div className="space-y-2 text-sm text-black">
                          <p><span className="font-medium text-black">จำนวนชั่วโมงรวม:</span> {scheduleDetail.schedule.total_hours} ชม.</p>
                          <p><span className="font-medium text-black">ชั่วโมง/ครั้ง:</span> {scheduleDetail.schedule.hours_per_session} ชม.</p>
                          <p><span className="font-medium text-black">วันที่เริ่ม:</span> {new Date(scheduleDetail.schedule.start_date).toLocaleDateString('th-TH')}</p>
                          <p><span className="font-medium text-black">ประเภท:</span> {scheduleDetail.schedule.schedule_type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Students List */}
                    {scheduleDetail.students.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">รายชื่อนักเรียน ({scheduleDetail.students.length} คน)</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {scheduleDetail.students.map((student) => (
                            <div key={student.id} className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                ชื่อเล่น: {student.nickname} • อายุ: {student.age} ปี
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.phone} | {student.email}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Schedule Summary */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">สรุปตารางเรียน</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-2xl text-blue-600">{scheduleDetail.summary.total_sessions}</p>
                            <p className="text-gray-600">ครั้งทั้งหมด</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-2xl text-green-600">{scheduleDetail.summary.scheduled}</p>
                            <p className="text-gray-600">กำหนดแล้ว</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-2xl text-gray-600">{scheduleDetail.summary.completed}</p>
                            <p className="text-gray-600">เรียนแล้ว</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedSession.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">หมายเหตุ</h4>
                        <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                          {selectedSession.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">ไม่สามารถโหลดข้อมูลรายละเอียดได้</p>
                )}
              </ModalBody>

              <ModalFooter className="border-t border-gray-300 pt-4">
                <Button
                  onClick={() => setIsDetailModalOpen(false)}
                  variant="monthViewClicked"
                >
                  ปิด
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Create Schedule Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        size="lg"
      >
        <ModalContent className="bg-white border border-gray-300 rounded-lg shadow-lg">
          <ModalHeader className="border-b border-gray-300">
            <h3 className="text-lg font-bold text-black">สร้างตารางเรียนใหม่</h3>
          </ModalHeader>

          <ModalBody className="py-6">
            {createScheduleData && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">ข้อมูลเบื้องต้น</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">ครูผู้สอน:</span> {
                        teachers.find(t => t.teacher_id === createScheduleData.teacherId)?.teacher_nickname || 'ไม่พบข้อมูล'
                      }
                    </p>
                    <p>
                      <span className="font-medium">เวลา:</span> {
                        createScheduleData.timeSlot.hour.toString().padStart(2, '0')
                      }:{
                        createScheduleData.timeSlot.minute.toString().padStart(2, '0')
                      }
                    </p>
                    <p>
                      <span className="font-medium">วันที่:</span> {new Date(createScheduleData.date).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>

                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">🚧 อยู่ระหว่างการพัฒนา</p>
                  <p className="text-sm">ฟีเจอร์สร้างตารางเรียนจะเปิดใช้งานเร็วๆ นี้</p>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter className="border-t border-gray-300">
            <Button
              onClick={() => setIsCreateModalOpen(false)}
              variant="monthView"
              className="mr-2"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={() => {
                // Mock create schedule action
                console.log('Creating schedule with data:', createScheduleData);
                setIsCreateModalOpen(false);
                // You would normally call scheduleService.createSchedule here
              }}
              variant="monthViewClicked"
              disabled={true}
            >
              สร้างตารางเรียน (Mock)
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SidebarLayout>
  );
}
