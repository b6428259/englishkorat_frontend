"use client";

import { useState, useEffect, useCallback } from "react";
import SidebarLayout from "../../components/common/SidebarLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { colors } from "@/styles/colors";
import { ButtonGroup } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { scheduleService, Teacher, Session, Student, Course, Room, TeacherOption, CreateScheduleRequest, CreateSessionRequest } from "@/services/api/schedules";
import { TimeSlotSelector, type ScheduleTimeSlot } from "@/components/common";

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
  const { t, language } = useLanguage();
  
  // State management
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [scheduleDetail, setScheduleDetail] = useState<ScheduleDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Create/Edit schedule modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleDetail | null>(null);
  
  // Form data and options
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [schedules, setSchedules] = useState<Array<{schedule_id: number, schedule_name: string, course_name: string}>>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Schedule form data
  const [scheduleForm, setScheduleForm] = useState<Partial<CreateScheduleRequest>>({
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

  // Session form data
  const [sessionForm, setSessionForm] = useState<CreateSessionRequest>({
    session_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '12:00',
    repeat: {
      enabled: false,
      frequency: 'weekly',
      interval: 1,
      end: { type: 'after', count: 10 },
      days_of_week: []
    },
    is_makeup_session: false,
    notes: '',
    appointment_notes: ''
  });

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

  // Fetch schedule data based on view mode
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (viewMode === 'day') {
        // For day view, use calendar API and map to our UI shape
        const calendarResponse = await scheduleService.getCalendarView(viewMode, currentDate, {
          include_students: true,
          include_holidays: true
        });

        if (calendarResponse.success && calendarResponse.data) {
          const uniqueTeachers: Teacher[] = [];
          const teacherMap = new Map<number, Teacher>();

          const dayData = calendarResponse.data.calendar?.[currentDate];
          const sessions = dayData?.sessions || [];

          sessions.forEach(cs => {
            // Create a stable pseudo ID from teacher_name hash to group sessions
            const base = cs.teacher_name || 'Unknown';
            let hash = 0;
            for (let i = 0; i < base.length; i++) {
              hash = ((hash << 5) - hash) + base.charCodeAt(i);
              hash |= 0;
            }
            const teacherId = Math.abs(hash) + 1;

            if (!teacherMap.has(teacherId)) {
              const teacher: Teacher = {
                teacher_id: teacherId,
                teacher_name: cs.teacher_name || 'Unknown',
                teacher_nickname: (cs.teacher_name?.split(' ')[0]) || 'Teacher',
                teacher_avatar: null,
                sessions: []
              };
              teacherMap.set(teacherId, teacher);
              uniqueTeachers.push(teacher);
            }

            // Convert calendar session to UI Session type with safe fallbacks
            const converted: Session = {
              session_id: cs.id,
              schedule_id: cs.schedule_id,
              schedule_name: cs.schedule_name,
              course_name: cs.course_name,
              course_code: cs.course_code || '',
              session_date: cs.session_date,
              start_time: cs.start_time,
              end_time: cs.end_time,
              session_number: 0,
              week_number: 0,
              status: cs.status,
              room_name: cs.room_name,
              max_students: 0, // not provided in calendar day; UI will handle gracefully
              current_students: (cs.students?.length) || 0,
              branch_id: 0,
              branch_name_en: dayData?.branch_distribution ? Object.keys(dayData.branch_distribution)[0] || '' : '',
              branch_name_th: dayData?.branch_distribution ? Object.keys(dayData.branch_distribution)[0] || '' : '',
              notes: null
            };

            teacherMap.get(teacherId)!.sessions.push(converted);
          });

          setTeachers(uniqueTeachers);
          setSelectedTeachers(uniqueTeachers.map(t => t.teacher_id));
        }
      } else {
        // For week/month view, use teachers API
        const response = await scheduleService.getTeachersSchedule(viewMode, {
          date: currentDate
        });
        
        if (response.success) {
          setTeachers(response.data.teachers);
          // Initialize all teachers as selected
          setSelectedTeachers(response.data.teachers.map(t => t.teacher_id));
        }
      }
    } catch (err) {
      setError(language === 'th' ? 'ไม่สามารถโหลดข้อมูลตารางเรียนได้' : 'Failed to fetch schedule data');
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [viewMode, currentDate, language]); // Dependencies for useCallback

  // Fetch form options (courses, rooms, teachers)
  const fetchFormOptions = async () => {
    try {
      const [coursesRes, roomsRes, teachersRes, schedulesRes] = await Promise.all([
        scheduleService.getCourses(),
        scheduleService.getRooms(),
        scheduleService.getTeachers(),
        scheduleService.getSchedules()
      ]);

      if (coursesRes.success) setCourses(coursesRes.data);
      if (roomsRes.success) setRooms(roomsRes.data);
      if (teachersRes.success) setTeacherOptions(teachersRes.data);
      if (schedulesRes.success) {
        // Transform the schedules data for the dropdown
        const schedulesForDropdown = schedulesRes.data.map((schedule: {
          schedule_id: number;
          schedule_name: string;
          course_name: string;
        }) => ({
          schedule_id: schedule.schedule_id,
          schedule_name: schedule.schedule_name,
          course_name: schedule.course_name
        }));
        setSchedules(schedulesForDropdown);
      }
    } catch (err) {
      console.error('Error fetching form options:', err);
    }
  };  useEffect(() => {
    const loadData = async () => {
      await fetchData();
      await fetchFormOptions();
    };
    loadData();
  }, [viewMode, currentDate, fetchData]);

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

  const selectAllTeachers = () => {
    setSelectedTeachers(teachers.map(t => t.teacher_id));
  };

  const clearSelection = () => {
    setSelectedTeachers([]);
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
  const handleEmptyCellClick = (_teacherId: number, timeSlot: { hour: number; minute: number }) => {
    // Reset any previous form errors
    setFormError(null);
    
    // Pre-fill form with suggested data
    setScheduleForm(prev => ({
      ...prev,
      teacher_id: _teacherId,
      start_date: currentDate,
      time_slots: [{
        day_of_week: new Date(currentDate).toLocaleDateString('en', {weekday: 'long'}).toLowerCase(),
        start_time: `${timeSlot.hour.toString().padStart(2, '0')}:${timeSlot.minute.toString().padStart(2, '0')}`,
        end_time: `${(timeSlot.hour + 3).toString().padStart(2, '0')}:${timeSlot.minute.toString().padStart(2, '0')}`
      }]
    }));
    
    setIsCreateModalOpen(true);
  };

  // Handle schedule creation
  const handleCreateSchedule = async () => {
    try {
      setFormLoading(true);
      setFormError(null);

      if (!scheduleForm.schedule_name || !scheduleForm.course_id || scheduleForm.time_slots?.length === 0) {
        setFormError(language === 'th' ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please fill in all required fields');
        return;
      }

      const response = await scheduleService.createSchedule(scheduleForm as CreateScheduleRequest);
      
      if (response.success) {
        setIsCreateModalOpen(false);
        await fetchData(); // Refresh the schedule data
        // Show success message (you can add toast notification here)
      } else {
        setFormError(response.message || (language === 'th' ? 'เกิดข้อผิดพลาดในการสร้างตารางเรียน' : 'Failed to create schedule'));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setFormError(errorMessage || (language === 'th' ? 'เกิดข้อผิดพลาดในการสร้างตารางเรียน' : 'Failed to create schedule'));
    } finally {
      setFormLoading(false);
    }
  };

  // Handle schedule editing
  const handleEditSchedule = (scheduleDetail: ScheduleDetail) => {
    setEditingSchedule(scheduleDetail);
    setScheduleForm({
      schedule_name: scheduleDetail.schedule.schedule_name,
      course_id: 0, // Will need to be looked up from course_name
      teacher_id: 0, // Will need to be looked up 
      room_id: 0, // Will need to be looked up
      total_hours: parseFloat(scheduleDetail.schedule.total_hours),
      hours_per_session: parseFloat(scheduleDetail.schedule.hours_per_session),
      max_students: scheduleDetail.schedule.max_students,
      start_date: scheduleDetail.schedule.start_date,
      time_slots: [], // Will be populated from existing sessions
      auto_reschedule_holidays: scheduleDetail.schedule.auto_reschedule_holidays === 1,
      notes: ''
    });
    setIsCreateModalOpen(true);
  };

  // Handle schedule update

  // Handle session creation within a schedule
  const handleCreateSession = async () => {
    try {
      setFormLoading(true);
      setFormError(null);

      // Validation
      if (!sessionForm.schedule_id || sessionForm.schedule_id === 0) {
        setFormError(language === 'th' ? 'กรุณาเลือกตารางเรียน' : 'Please select a schedule');
        return;
      }

      if (!sessionForm.session_date) {
        setFormError(language === 'th' ? 'กรุณาเลือกวันที่เซสชัน' : 'Please select session date');
        return;
      }

      if (!sessionForm.start_time || !sessionForm.end_time) {
        setFormError(language === 'th' ? 'กรุณากรอกเวลาเริ่มต้นและเวลาสิ้นสุด' : 'Please enter start and end time');
        return;
      }

      if (sessionForm.mode === 'single') {
        // Create single session
        const response = await scheduleService.createSessions(sessionForm.schedule_id.toString(), sessionForm);
        
        if (response.success) {
          setIsCreateSessionModalOpen(false);
          await fetchData();
        } else {
          setFormError(response.message || (language === 'th' ? 'เกิดข้อผิดพลาดในการสร้างครั้งเรียน' : 'Failed to create session'));
        }
      } else if (sessionForm.mode === 'multiple') {
        // Create multiple sessions
        const response = await scheduleService.createMultipleSessions({
          schedule_id: sessionForm.schedule_id,
          session_count: sessionForm.session_count || 1,
          start_date: sessionForm.session_date,
          start_time: sessionForm.start_time,
          end_time: sessionForm.end_time,
          repeat_frequency: sessionForm.repeat_frequency || 'weekly',
          notes: sessionForm.notes
        });

        if (response.success) {
          setIsCreateSessionModalOpen(false);
          await fetchData();
        } else {
          setFormError(response.message || (language === 'th' ? 'เกิดข้อผิดพลาดในการสร้างครั้งเรียน' : 'Failed to create sessions'));
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setFormError(errorMessage || (language === 'th' ? 'เกิดข้อผิดพลาดในการสร้างครั้งเรียน' : 'Failed to create session'));
    } finally {
      setFormLoading(false);
    }
  };

  // Date navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    
    if (viewMode === 'day') {
      date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Format date display based on view mode
  const formatDateDisplay = (date: string) => {
    const d = new Date(date);
    if (language === 'th') {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: viewMode === 'day' ? 'long' : undefined
      };
      return d.toLocaleDateString('th-TH', options);
    } else {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: viewMode === 'day' ? 'long' : undefined
      };
      return d.toLocaleDateString('en-US', options);
    }
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
        <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-black">{t.scheduleManagement}</h1>
            
            {/* View Mode Buttons */}
            <ButtonGroup>
              <Button
                variant={viewMode === "month" ? "monthViewClicked" : "monthView"}
                onClick={() => setViewMode("month")}
                className="px-4 py-2"
              >
                {t.monthView.toUpperCase()}
              </Button>
              <Button
                variant={viewMode === "week" ? "weekViewClicked" : "weekView"}
                onClick={() => setViewMode("week")}
                className="px-4 py-2"
              >
                {t.weekView.toUpperCase()}
              </Button>
              <Button
                variant={viewMode === "day" ? "dayViewClicked" : "dayView"}
                onClick={() => setViewMode("day")}
                className="px-4 py-2"
              >
                {t.dayView.toUpperCase()}
              </Button>
            </ButtonGroup>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="monthView"
                onClick={() => navigateDate('prev')}
                className="px-3 py-1 text-sm"
              >
                ‹
              </Button>
              <Button
                variant="monthViewClicked"
                onClick={goToToday}
                className="px-4 py-1 text-sm"
              >
                {language === 'th' ? 'วันนี้' : 'Today'}
              </Button>
              <Button
                variant="monthView"
                onClick={() => navigateDate('next')}
                className="px-3 py-1 text-sm"
              >
                ›
              </Button>
            </div>
            
            <div className="text-lg font-semibold text-gray-700">
              {formatDateDisplay(currentDate)}
            </div>

            <div className="text-sm text-gray-500">
              {language === 'th' 
                ? `${currentTime.hour.toString().padStart(2, '0')}:${currentTime.minute.toString().padStart(2, '0')} น.`
                : `${currentTime.hour.toString().padStart(2, '0')}:${currentTime.minute.toString().padStart(2, '0')}`
              }
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Teacher Filters */}
          <div className="w-64 bg-white border border-gray-200 rounded-lg p-3 flex flex-col flex-shrink-0">
            <h2 className="font-bold mb-3 text-[#334293] border-b border-[#334293] pb-2 text-sm">
              {t.SelectTeachers}
            </h2>
            
            <div className="mb-3 flex gap-2">
              <Button
                variant="monthView"
                onClick={selectAllTeachers}
                className="text-xs px-3 py-1 flex-1"
              >
                {t.selectAllTeachers}
              </Button>
              <Button
                variant="monthView"
                onClick={clearSelection}
                className="text-xs px-3 py-1 flex-1"
              >
                {t.clearSelection}
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {teachers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t.noScheduleData}
                </p>
              ) : (
                teachers.map((teacher) => (
                  <label key={teacher.teacher_id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher.teacher_id)}
                      onChange={() => toggleTeacher(teacher.teacher_id)}
                      className="h-4 w-4 rounded focus:ring-0"
                      style={{ accentColor: colors.yellowLogo }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium block truncate" style={{ color: colors.blueLogo }}>
                        {teacher.teacher_nickname}
                      </span>
                      <p className="text-xs text-gray-500 truncate">{teacher.teacher_name}</p>
                      <p className="text-xs text-green-600">
                        {teacher.sessions.length} {language === 'th' ? 'ครั้งเรียน' : 'sessions'}
                      </p>
                    </div>
                  </label>
                ))
              )}
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
                      <th className="w-20 text-center font-bold text-white bg-[#334293] border border-gray-300 p-2 text-sm">
                        {t.time}
                      </th>
                      {filteredTeachers.length === 0 ? (
                        <th className="text-center font-bold text-white bg-gray-400 border border-gray-300 p-4">
                          {t.noScheduleData}
                        </th>
                      ) : (
                        filteredTeachers.map((teacher) => (
                          <th 
                            key={teacher.teacher_id}
                            className="text-center font-bold text-white bg-[#334293] border border-gray-300 p-3 text-sm"
                            style={{ width: `${100 / Math.max(filteredTeachers.length, 1)}%` }}
                          >
                            <div>
                              <div className="font-bold">{teacher.teacher_nickname}</div>
                              <div className="text-xs opacity-80 mt-1">{teacher.teacher_name}</div>
                            </div>
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center p-8 text-gray-500">
                          {t.noScheduleData}
                        </td>
                      </tr>
                    ) : (
                      timeSlots.map((timeSlot) => (
                        <tr key={`${timeSlot.hour}-${timeSlot.minute}`} className="h-8">
                          <td className="font-medium text-gray-700 bg-gray-50 text-xs border border-gray-300 text-center p-2 relative">
                            <div className="font-semibold">{timeSlot.label}</div>
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
                                  className="p-1 border border-gray-300 align-top relative"
                                >
                                  <div
                                    className="w-full h-full p-2 rounded cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200"
                                    style={{
                                      minHeight: `${rowSpan * 32 - 4}px`
                                    }}
                                    onClick={() => handleSessionClick(session)}
                                  >
                                    <div className="space-y-1">
                                      <p className="font-bold text-xs text-black line-clamp-1">
                                        {session.schedule_name}
                                      </p>

                                      <p className="font-bold text-xs text-rose-600">
                                        {session.current_students}
                                        {session.max_students > 0 ? `/${session.max_students}` : ''} {t.people}
                                      </p>

                                      <p className="text-xs text-gray-600 line-clamp-1">
                                        {session.course_name}
                                      </p>

                                      <p className="text-xs text-gray-500">
                                        {session.room_name}
                                      </p>

                                      {(session.branch_name_th || session.branch_name_en) && (
                                        <span
                                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                            session.branch_id && branchColors[session.branch_id] ? branchColors[session.branch_id] : 'bg-gray-200 text-gray-700'
                                          }`}
                                        >
                                          {language === 'th' ? (session.branch_name_th || session.branch_name_en) : (session.branch_name_en || session.branch_name_th)}
                                        </span>
                                      )}

                                      {session.notes && rowSpan > 4 && (
                                        <p className="text-[10px] italic text-gray-500 mt-1 line-clamp-1">
                                          {session.notes}
                                        </p>
                                      )}
                                    </div>
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
                                <div className="w-full h-8 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                                    <span className="text-xs text-gray-400 hover:text-blue-600">+</span>
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
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
        className="max-h-[90vh]"
      >
        <ModalContent className="bg-white border border-gray-300 rounded-lg shadow-xl">
          {selectedSession && (
            <>
              <ModalHeader className="border-b border-gray-300 pb-4">
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
              </ModalHeader>

              <ModalBody className="py-6 max-h-[60vh] overflow-y-auto">
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
                      onClick={() => handleSessionClick(selectedSession)}
                      variant="monthView"
                      className="mt-2 text-sm"
                    >
                      {t.retryLoading}
                    </Button>
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="border-t border-gray-300 pt-4">
                <Button
                  onClick={() => setIsDetailModalOpen(false)}
                  variant="monthView"
                  className="mr-2"
                >
                  {t.close}
                </Button>
                <Button
                  onClick={() => {
                    if (scheduleDetail) {
                      handleEditSchedule(scheduleDetail);
                      setIsDetailModalOpen(false);
                    }
                  }}
                  variant="weekView"
                  className="mr-2"
                >
                  {t.editSchedule}
                </Button>
                <Button
                  onClick={() => {
                    if (selectedSession) {
                      // Pre-fill session form for current schedule
                      setSessionForm(prev => ({
                        ...prev,
                        session_date: selectedSession.session_date,
                        start_time: selectedSession.start_time.slice(0, 5),
                        end_time: selectedSession.end_time.slice(0, 5)
                      }));
                      setIsCreateSessionModalOpen(true);
                      setIsDetailModalOpen(false);
                    }
                  }}
                  variant="monthViewClicked"
                >
                  {t.createSession}
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
        size="3xl"
        className="max-h-[90vh]"
      >
        <ModalContent className="bg-white border border-gray-300 rounded-lg shadow-xl">
          <ModalHeader className="border-b border-gray-300">
            <h3 className="text-lg font-bold text-black">{t.createNewSchedule}</h3>
          </ModalHeader>

          <ModalBody className="py-6 max-h-[70vh] overflow-y-auto">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scheduleForm.auto_reschedule_holidays || false}
                      onChange={(e) => setScheduleForm(prev => ({...prev, auto_reschedule_holidays: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
          </ModalBody>

          <ModalFooter className="border-t border-gray-300">
            <Button
              onClick={() => {
                setIsCreateModalOpen(false);
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
              }}
              variant="monthView"
              className="mr-2"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleCreateSchedule}
              variant="monthViewClicked"
              disabled={formLoading}
              className={`px-4 py-2 ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {formLoading && <LoadingSpinner className="w-4 h-4 mr-2" />}
              {formLoading ? t.processing : t.createNewSchedule}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Sessions Modal */}
      <Modal 
        isOpen={isCreateSessionModalOpen} 
        onOpenChange={setIsCreateSessionModalOpen}
        size="4xl"
        className="max-h-[90vh]"
      >
        <ModalContent className="bg-white border border-gray-300 rounded-lg shadow-xl">
          <ModalHeader className="border-b border-gray-300">
            <h3 className="text-lg font-bold text-black">{t.createSessions}</h3>
          </ModalHeader>

          <ModalBody className="py-6 max-h-[75vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Creation Mode Selection */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  {t.createSessionMode}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="sessionMode"
                      value="single"
                      checked={sessionForm.mode === 'single'}
                      onChange={(e) => setSessionForm(prev => ({...prev, mode: e.target.value as 'single' | 'multiple' | 'bulk'}))}
                      className="h-4 w-4 text-purple-600"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{t.singleSession}</div>
                      <div className="text-sm text-gray-600">{t.createOneSession}</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="sessionMode"
                      value="multiple"
                      checked={sessionForm.mode === 'multiple'}
                      onChange={(e) => setSessionForm(prev => ({...prev, mode: e.target.value as 'single' | 'multiple' | 'bulk'}))}
                      className="h-4 w-4 text-purple-600"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{t.multipleSession}</div>
                      <div className="text-sm text-gray-600">{t.createMultipleSessions}</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="sessionMode"
                      value="bulk"
                      checked={sessionForm.mode === 'bulk'}
                      onChange={(e) => setSessionForm(prev => ({...prev, mode: e.target.value as 'single' | 'multiple' | 'bulk'}))}
                      className="h-4 w-4 text-purple-600"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{t.bulkCreate}</div>
                      <div className="text-sm text-gray-600">{t.createBulkSessions}</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Single Session Mode */}
              {sessionForm.mode === 'single' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {t.singleSessionDetails}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.selectSchedule} *
                      </label>
                      <select
                        value={sessionForm.schedule_id || 0}
                        onChange={(e) => setSessionForm(prev => ({...prev, schedule_id: parseInt(e.target.value)}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>{t.selectSchedule}</option>
                        {schedules.map(schedule => (
                          <option key={schedule.schedule_id} value={schedule.schedule_id}>
                            {schedule.schedule_name} - {schedule.course_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.sessionDate} *
                      </label>
                      <input
                        type="date"
                        value={sessionForm.session_date || ''}
                        onChange={(e) => setSessionForm(prev => ({...prev, session_date: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.startTime} *
                      </label>
                      <input
                        type="time"
                        value={sessionForm.start_time || ''}
                        onChange={(e) => setSessionForm(prev => ({...prev, start_time: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.endTime} *
                      </label>
                      <input
                        type="time"
                        value={sessionForm.end_time || ''}
                        onChange={(e) => setSessionForm(prev => ({...prev, end_time: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.sessionNotes}
                      </label>
                      <textarea
                        value={sessionForm.notes || ''}
                        onChange={(e) => setSessionForm(prev => ({...prev, notes: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder={language === 'th' ? 'หมายเหตุสำหรับเซสชันนี้' : 'Notes for this session'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Multiple Sessions Mode */}
              {sessionForm.mode === 'multiple' && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {t.multipleSessionDetails}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.selectSchedule} *
                      </label>
                      <select
                        value={sessionForm.schedule_id || 0}
                        onChange={(e) => setSessionForm(prev => ({...prev, schedule_id: parseInt(e.target.value)}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>{t.selectSchedule}</option>
                        {schedules.map(schedule => (
                          <option key={schedule.schedule_id} value={schedule.schedule_id}>
                            {schedule.schedule_name} - {schedule.course_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.numberOfSessions} *
                      </label>
                      <input
                        type="number"
                        value={sessionForm.session_count || 1}
                        onChange={(e) => setSessionForm(prev => ({...prev, session_count: parseInt(e.target.value)}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={1}
                        max={50}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.startDate} *
                      </label>
                      <input
                        type="date"
                        value={sessionForm.session_date || ''}
                        onChange={(e) => setSessionForm(prev => ({...prev, session_date: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.repeatFrequency} *
                      </label>
                      <select
                        value={sessionForm.repeat_frequency || 'weekly'}
                        onChange={(e) => setSessionForm(prev => ({...prev, repeat_frequency: e.target.value as 'daily' | 'weekly' | 'monthly'}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">{t.daily}</option>
                        <option value="weekly">{t.weekly}</option>
                        <option value="monthly">{t.monthly}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.startTime} *
                      </label>
                      <input
                        type="time"
                        value={sessionForm.start_time || ''}
                        onChange={(e) => setSessionForm(prev => ({...prev, start_time: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.endTime} *
                      </label>
                      <input
                        type="time"
                        value={sessionForm.end_time || ''}
                        onChange={(e) => setSessionForm(prev => ({...prev, end_time: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <div className="w-5 h-5 text-yellow-600 mr-2 mt-0.5">⚠️</div>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">{t.multipleSessionWarning}</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>{t.willCreateSessions.replace('{count}', (sessionForm.session_count || 1).toString())}</li>
                          <li>{t.repeatsEvery} {sessionForm.repeat_frequency === 'daily' ? t.daily.toLowerCase() : sessionForm.repeat_frequency === 'weekly' ? t.weekly.toLowerCase() : t.monthly.toLowerCase()}</li>
                          <li>{t.checkForConflicts}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bulk Creation Mode */}
              {sessionForm.mode === 'bulk' && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    {t.bulkCreateDetails}
                  </h4>
                  
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-lg mb-2 font-semibold">{t.bulkCreateComingSoon}</p>
                    <p className="text-sm">{t.bulkCreateDescription}</p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{formError}</p>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="border-t border-gray-300">
            <Button
              onClick={() => {
                setIsCreateSessionModalOpen(false);
                setFormError(null);
                setSessionForm({
                  mode: 'single',
                  schedule_id: 0,
                  session_date: new Date().toISOString().split('T')[0],
                  start_time: '',
                  end_time: '',
                  notes: '',
                  session_count: 1,
                  repeat_frequency: 'weekly'
                });
              }}
              variant="monthView"
              className="mr-2"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleCreateSession}
              variant="monthViewClicked"
              disabled={formLoading || sessionForm.mode === 'bulk'}
              className={`px-4 py-2 ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {formLoading && <LoadingSpinner className="w-4 h-4 mr-2" />}
              {formLoading ? t.processing : 
               sessionForm.mode === 'single' ? t.createSession :
               sessionForm.mode === 'multiple' ? `${t.createSessions} (${sessionForm.session_count || 1})` :
               t.bulkCreateComingSoon}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Create New Schedule Button */}
        <Button
          onClick={() => {
            // Reset form and open create schedule modal
            setScheduleForm({
              schedule_name: '',
              course_id: 0,
              teacher_id: 0,
              start_date: new Date().toISOString().split('T')[0],
              time_slots: [],
              max_students: 15,
              total_hours: 40,
              hours_per_session: 2,
              auto_reschedule_holidays: false
            });
            setFormError(null);
            setIsCreateModalOpen(true);
          }}
          variant="monthViewClicked"
          className="shadow-lg hover:shadow-xl transition-shadow duration-200 px-4 py-3 text-sm font-medium rounded-full min-w-[160px]"
        >
          + {t.createNewSchedule}
        </Button>

        {/* Create New Session Button */}
        <Button
          onClick={() => {
            // Reset session form and open create session modal
            setSessionForm({
              schedule_id: 0,
              session_date: new Date().toISOString().split('T')[0],
              start_time: '09:00',
              end_time: '11:00',
              mode: 'single',
              session_count: 1
            });
            setFormError(null);
            setIsCreateSessionModalOpen(true);
          }}
          variant="weekViewClicked"
          className="shadow-lg hover:shadow-xl transition-shadow duration-200 px-4 py-3 text-sm font-medium rounded-full min-w-[160px]"
        >
          + {language === 'th' ? 'สร้างครั้งเรียนใหม่' : 'Create New Session'}
        </Button>
      </div>

    </SidebarLayout>
  );
}
