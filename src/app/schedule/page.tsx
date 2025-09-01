"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SidebarLayout from "../../components/common/SidebarLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { colors } from "@/styles/colors";
// import { ButtonGroup } from "@heroui/react";
import { scheduleService, Teacher, Session, Student, Course, Room, TeacherOption, CreateScheduleRequest, CreateSessionRequest, CalendarViewResponse, CalendarSession } from "@/services/api/schedules";
import { SessionDetailModal } from "./components";
import ModernScheduleModal from "./components/ModernScheduleModal";
import { ModernSessionsModal } from "./components/ModernSessionsModal";
import CalendarLoading from '@/components/common/CalendarLoading';
import MonthView from './components/MonthView';

interface WeekCalendarData {
  [date: string]: {
    date: string;
    day_of_week: string;
    is_holiday: boolean;
    holiday_info: Record<string, unknown> | null;
    sessions: CalendarSession[];
    exceptions: Record<string, unknown>[];
    session_count: number;
    branch_distribution: Record<string, number>;
  };
}

// Simple WeekView component inline
const WeekView: React.FC<{
  calendarData: WeekCalendarData;
  onSessionClick: (session: CalendarSession) => void;
  onDayClick?: (date: string) => void;
  onAddSession?: (date: string) => void;
  density?: 'comfortable' | 'compact';
}> = ({ calendarData, onSessionClick, onDayClick, onAddSession, density = 'comfortable' }) => {
  const { language } = useLanguage();
  
  // Get sorted dates for the week, starting from Monday
  const weekDates = Object.keys(calendarData).sort();

  const weekDayNames = language === 'th' 
    ? ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    if (language === 'th') {
      return `${h.toString().padStart(2, '0')}:${minute}`;
    }
    return `${h % 12 === 0 ? 12 : h % 12}:${minute}${h < 12 ? 'am' : 'pm'}`;
  };

  const getBranchColor = (branchName: string): string => {
    const colors: Record<string, string> = {
      "Branch 1 The Mall Branch": "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-300",
      "Online": "bg-gradient-to-br from-indigo-400 to-purple-500 text-white border-indigo-200", 
      "Branch 3": "bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-indigo-400",
    };
    return colors[branchName as keyof typeof colors] || "bg-gradient-to-br from-indigo-300 to-purple-400 text-white border-indigo-200";
  };

  // Group sessions by time for better clustering
  const groupSessionsByTime = (sessions: CalendarSession[]) => {
    const grouped = sessions.reduce((acc, session) => {
      const timeKey = `${session.start_time}-${session.end_time}`;
      if (!acc[timeKey]) acc[timeKey] = [];
      acc[timeKey].push(session);
      return acc;
    }, {} as Record<string, CalendarSession[]>);
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayIndex = date.getDay();
    // Convert Sunday (0) to be last (6)
    const mondayBasedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return weekDayNames[mondayBasedIndex];
  };

  const padY = density === 'compact' ? 'py-2' : 'py-3';
  const gap = density === 'compact' ? 'gap-1.5' : 'gap-2';
  const cardPad = density === 'compact' ? 'p-2' : 'p-3';
  const cardText = density === 'compact' ? 'text-[11px]' : 'text-xs';

  return (
    <div className="min-h-0 flex flex-col bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Scroll container with sticky header */}
      <div className="flex-1 min-h-0 overflow-auto">
        {/* Week Header (tone aligned with MonthView) */}
        <div className={`grid grid-cols-7 ${gap} p-4 pb-2 sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200`}>
        {weekDates.map((date) => {
          const today = date === new Date().toISOString().split('T')[0];
          const dayName = getDayName(date);
          const dayData = calendarData[date];
          
          return (
            <div
              key={date}
              className={`${padY} text-center font-bold text-sm rounded-lg cursor-pointer transition-all duration-200 tracking-wide ${
                today 
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg' 
                  : dayData?.is_holiday 
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 opacity-70' 
                    : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700'
              }`}
              onClick={() => onDayClick?.(date)}
            >
              <div className="font-bold text-sm mb-2">{dayName}</div>
              <div className={`text-2xl font-bold ${today ? 'text-white' : 'text-gray-900'}`}>
                {new Date(date).getDate()}
              </div>
              {dayData?.session_count > 0 && (
                <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                  today ? 'bg-white/20 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {dayData.session_count} {language === 'th' ? 'คาบ' : 'sessions'}
                </div>
              )}
            </div>
          );
        })}
        </div>

        {/* Sessions Grid - Scrollable */}
        <div className={`grid grid-cols-7 gap-px bg-gray-200 ${density === 'compact' ? 'p-2' : ''}`}>
        {weekDates.map((date) => {
          const dayData = calendarData[date];
          const today = date === new Date().toISOString().split('T')[0];
          const timeGroups = groupSessionsByTime(dayData?.sessions || []);
          
          return (
            <div
              key={date}
              className={`min-h-full p-3 ${
                today 
                  ? 'bg-gradient-to-b from-blue-50 to-indigo-50' 
                  : dayData?.is_holiday 
                    ? 'bg-gradient-to-b from-red-50 to-red-100' 
                    : 'bg-white'
              }`}
            >
              <div className="space-y-3">
                {timeGroups.length === 0 ? (
                  /* Empty day placeholder */
                  <div 
                    className="h-32 flex items-center justify-center opacity-0 hover:opacity-60 transition-all duration-300 cursor-pointer border-2 border-dashed border-indigo-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50"
                    onClick={() => onAddSession?.(date)}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2 text-gray-400">+</div>
                      <div className="text-sm text-gray-500 font-medium">
                        {language === 'th' ? 'เพิ่มคาบเรียน' : 'Add Session'}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Sessions grouped by time */
                  timeGroups.map(([timeRange, sessions]) => (
                    <div key={timeRange} className="space-y-2">
                      {/* Time header for clustered sessions */}
                      <div className="text-xs font-bold text-gray-600 px-2 py-1 bg-gray-100 rounded-md">
                        {formatTime(sessions[0].start_time)} - {formatTime(sessions[0].end_time)}
                      </div>
                      
                      {/* Multiple sessions at same time */}
                      {sessions.map((session, index) => (
                        <div
                          key={session.id}
                          className={`${cardPad} rounded-xl shadow-md border-2 cursor-pointer transition-shadow duration-200 hover:shadow-lg overflow-hidden relative z-10 ${getBranchColor(session.branch_name)} ${
                            sessions.length > 1 ? `ml-${index * 2} -mt-1` : ''
                          }`}
                          onClick={() => onSessionClick(session)}
                        >
                          {/* Schedule Name */}
                          <div className={`font-bold ${density === 'compact' ? 'text-sm' : 'text-sm'} mb-2 leading-tight`}>
                            {session.schedule_name}
                          </div>
                          
                          {/* Course Name */}
                          <div className={`${cardText} opacity-90 mb-2 font-medium`}>
                            {session.course_name}
                          </div>
                          
                          {/* Teacher */}
                          {session.teacher_name && (
                            <div className={`flex items-center ${cardText} mb-2 opacity-90`}>
                              <span className="mr-1">👩‍🏫</span>
                              <span className="truncate font-medium">{session.teacher_name}</span>
                            </div>
                          )}
                          
                          {/* Students */}
                          {session.students && session.students.length > 0 && (
                            <div className={`flex items-center ${cardText} mb-2 opacity-90`}>
                              <span className="mr-1">👥</span>
                              <span className="font-medium">{session.students.length} {language === 'th' ? 'คน' : 'students'}</span>
                            </div>
                          )}
                          
                          {/* Room */}
                          {session.room_name && (
                            <div className={`${cardText} opacity-80 font-medium`}>
                              📍 {session.room_name}
                            </div>
                          )}
                          
                          {/* Multiple sessions indicator */}
                          {sessions.length > 1 && index === 0 && (
                            <div className="absolute top-1 right-1 bg-black bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                              +{sessions.length - 1}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
                
                {/* Holiday message */}
                {dayData?.is_holiday && (
                  <div className="mt-4 p-3 bg-red-100 border-2 border-red-200 rounded-lg text-center">
                    <div className="text-2xl mb-1">🎌</div>
                    <div className="text-sm font-bold text-red-800">
                      {language === 'th' ? 'วันหยุด' : 'Holiday'}
                    </div>
                    {dayData.holiday_info && (
                      <div className="text-xs text-red-600 mt-1">
                        {(dayData.holiday_info as { name?: string })?.name || ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

// Extended session form interface for the modals
interface ExtendedCreateSessionRequest extends CreateSessionRequest {
  mode: 'single' | 'multiple' | 'bulk';
  schedule_id: number;
  session_count?: number;
  repeat_frequency?: 'daily' | 'weekly' | 'monthly';
}

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
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  
  // State management
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calendar data state
  const [calendarData, setCalendarData] = useState<CalendarViewResponse | null>(null);
  
  // Modal states
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [scheduleDetail, setScheduleDetail] = useState<ScheduleDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Create/Edit schedule modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
  // Prevent overlapping or looping fetches
  const isFetchingRef = useRef(false);

  const openModal = useCallback((modal: 'detail' | 'createSchedule' | 'createSession') => {
    // Close others first
    setIsDetailModalOpen(false);
    setIsCreateModalOpen(false);
    setIsCreateSessionModalOpen(false);
    // Open requested
    if (modal === 'detail') setIsDetailModalOpen(true);
    if (modal === 'createSchedule') setIsCreateModalOpen(true);
    if (modal === 'createSession') setIsCreateSessionModalOpen(true);
  }, []);
  
  // Form data and options with loading state
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  // const [schedules, setSchedules] = useState<Array<{schedule_id: number, schedule_name: string, course_name: string}>>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOptionsLoaded, setFormOptionsLoaded] = useState(false);

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
  const [sessionForm, setSessionForm] = useState<ExtendedCreateSessionRequest>({
    mode: 'single',
    schedule_id: 0,
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
    appointment_notes: '',
    session_count: 1,
    repeat_frequency: 'weekly'
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
    if (isFetchingRef.current) {
      return;
    }
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      if (viewMode === 'day') {
        // For day view, use the existing API to maintain compatibility
        const response = await scheduleService.getTeachersSchedule(
          'day',
          {
            date: currentDate,
            teacher_id: selectedTeachers.length === 1 ? selectedTeachers[0] : undefined,
          }
        );

        if (response.success) {
          setTeachers(response.data.teachers);

          // Auto-select all teachers if none selected and data available
          if (selectedTeachers.length === 0 && response.data.teachers.length > 0) {
            setSelectedTeachers(response.data.teachers.map(t => t.teacher_id));
          }
        }
      } else {
        // For week and month views, use the calendar API
        const calendarResponse = await scheduleService.getCalendarView(
          viewMode,
          currentDate,
          {
            include_students: true,
            include_holidays: true
          }
        );

        if (calendarResponse.success) {
          setCalendarData(calendarResponse);
        }
      }
    } catch (err) {
      setError(language === 'th' ? 'ไม่สามารถโหลดข้อมูลตารางเรียนได้' : 'Failed to fetch schedule data');
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [viewMode, currentDate, language, selectedTeachers]);

  // Fetch form options (courses, rooms, teachers, students)
  const fetchFormOptions = useCallback(async () => {
    if (formOptionsLoaded) return; // Prevent duplicate loads
    
    try {
      setFormLoading(true);
      const [coursesRes, roomsRes, teachersRes, schedulesRes, studentsRes] = await Promise.all([
        scheduleService.getCourses(),
        scheduleService.getRooms(),
        scheduleService.getTeachers(),
        scheduleService.getSchedules(),
        // Fetch users with student role - we'll filter students from all users for now
        import('@/services/user.service').then(service => 
          service.userService.getUsers(1, 1000).catch(() => ({ success: false, data: { users: [] } }))
        )
      ]);

      console.log("courses:", coursesRes.data);
      if (coursesRes.success) setCourses(coursesRes.data);

      console.log("rooms:", roomsRes.data);
      if (roomsRes.success) setRooms(roomsRes.data);
      if (teachersRes.success) setTeacherOptions(teachersRes.data);
      if (schedulesRes.success) {
        // Transform the schedules data for the dropdown
        /*
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
        */
      }
      
      // Filter and set students from users data
      if (studentsRes.success) {
        const studentUsers = studentsRes.data.users
          .filter((user: { role: string }) => user.role === 'student')
          .map((user: { 
            id: number; 
            username: string;
            first_name?: string;
            first_name_en?: string;
            last_name?: string;
            last_name_en?: string;
            nickname?: string;
            age?: number;
            email: string;
            phone?: string;
            line_id?: string;
          }) => ({
            id: user.id,
            user_id: user.id,
            first_name: user.first_name || user.username,
            first_name_en: user.first_name_en || user.first_name || user.username,
            last_name: user.last_name || '',
            last_name_en: user.last_name_en || user.last_name || '',
            nickname: user.nickname || user.username,
            age: user.age || 18,
            email: user.email,
            phone: user.phone || '',
            line_id: user.line_id || ''
          }));
        setStudents(studentUsers);
      }
      
      setFormOptionsLoaded(true);
    } catch (err) {
      console.error('Error fetching form options:', err);
    } finally {
      setFormLoading(false);
    }
  }, [formOptionsLoaded]);

  // Fetch schedule data when view/date changes
  useEffect(() => {
    fetchData();
  }, [viewMode, currentDate, fetchData]);

  // Fetch static form options once on mount
  useEffect(() => {
    // We only need to load these options once; they rarely change during the session
    fetchFormOptions();
  }, [fetchFormOptions]);

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

  // Handle session click for details (updated for calendar sessions)
  const handleSessionClick = async (session: Session | CalendarSession) => {
    // Convert CalendarSession to Session if needed
    const sessionForModal: Session = 'session_id' in session ? session : {
      session_id: session.id,
      schedule_id: session.schedule_id,
      schedule_name: session.schedule_name,
      course_name: session.course_name,
      course_code: session.course_code || '',
      session_date: session.session_date,
      start_time: session.start_time,
      end_time: session.end_time,
      session_number: 0,
      week_number: 0,
      status: session.status,
      room_name: session.room_name,
      max_students: 0,
      current_students: session.students?.length || 0,
      branch_id: 0,
      branch_name_en: session.branch_name,
      branch_name_th: session.branch_name,
      notes: null
    };

    setSelectedSession(sessionForModal);
    setDetailLoading(true);
    openModal('detail');
    
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

  // Handle day click in month view
  const handleDayClick = (date: string) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  // Handle empty slot click for week/month views
  const handleEmptySlotClick = (date: string) => {
    setCurrentDate(date);
    setViewMode('day');
    // Open create schedule modal after switching to day view
    setTimeout(() => {
      openModal('createSchedule');
    }, 100);
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
    
  openModal('createSchedule');
  };

  // Modal callback handlers
  const handleSessionDetailEditSchedule = (scheduleDetail: ScheduleDetail) => {
    handleEditSchedule(scheduleDetail);
  };

  const handleSessionDetailCreateSession = (session: Session) => {
    setSessionForm(prev => ({
      ...prev,
      schedule_id: session.schedule_id,
      session_date: session.session_date,
      start_time: session.start_time.slice(0, 5),
      end_time: session.end_time.slice(0, 5)
    }));
  openModal('createSession');
  };

  const handleSessionDetailRetryLoading = (session: Session) => {
    handleSessionClick(session);
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
        // Refresh form options to include new schedule
        setFormOptionsLoaded(false);
        await fetchFormOptions();
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
    // Look up course_id from course_name
    const course = courses.find(c => c.course_name === scheduleDetail.schedule.course_name);
    const courseId = course ? course.id : 0;

    // Look up teacher_id from teacher information in sessions
    // Assuming all sessions have the same teacher
    const firstSession = scheduleDetail.sessions[0];
    const teacher = teacherOptions.find(t => t.teacher_name === `${firstSession?.teacher_first_name} ${firstSession?.teacher_last_name}`);
    const teacherId = teacher ? teacher.id : 0;

    // Look up room_id from room information in sessions
    // Using the most common room or the first one if they differ
    const roomCounts = scheduleDetail.sessions.reduce((acc, session) => {
      acc[session.room_name] = (acc[session.room_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonRoom = Object.entries(roomCounts).sort(([,a], [,b]) => b - a)[0]?.[0];
    const room = rooms.find(r => r.room_name === mostCommonRoom);
    const roomId = room ? room.id : 0;

    // Populate time_slots from existing sessions
    const timeSlots = scheduleDetail.sessions.map(session => {
      const sessionDate = new Date(session.session_date);
      const dayOfWeek = sessionDate.toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
      
      return {
        day_of_week: dayOfWeek,
        start_time: session.start_time,
        end_time: session.end_time
      };
    });

    setScheduleForm({
      schedule_name: scheduleDetail.schedule.schedule_name,
      course_id: courseId,
      teacher_id: teacherId,
      room_id: roomId,
      total_hours: parseFloat(scheduleDetail.schedule.total_hours),
      hours_per_session: parseFloat(scheduleDetail.schedule.hours_per_session),
      max_students: scheduleDetail.schedule.max_students,
      start_date: scheduleDetail.schedule.start_date,
      time_slots: timeSlots,
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
          // Refresh schedules list to include any new data
          setFormOptionsLoaded(false);
          await fetchFormOptions();
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
          // Refresh schedules list to include any new data
          setFormOptionsLoaded(false);
          await fetchFormOptions();
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
  <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen min-h-0">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 flex-shrink-0 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t.scheduleManagement}
            </h1>
            
            {/* View Mode Buttons */}
            <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
              <Button
                variant={viewMode === "month" ? "monthViewClicked" : "monthView"}
                onClick={() => setViewMode("month")}
                className={"px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"}
              >
                {t.monthView.toUpperCase()}
              </Button>
              <Button
                variant={viewMode === "week" ? "weekViewClicked" : "weekView"}
                onClick={() => setViewMode("week")}
                className={"px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"}
              >
                {t.weekView.toUpperCase()}
              </Button>
              <Button
                variant={viewMode === "day" ? "dayViewClicked" : "dayView"}
                onClick={() => setViewMode("day")}
                className={"px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"}
              >
                {t.dayView.toUpperCase()}
              </Button>
            </div>
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

            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                {language === 'th' 
                  ? `${currentTime.hour.toString().padStart(2, '0')}:${currentTime.minute.toString().padStart(2, '0')} น.`
                  : `${currentTime.hour.toString().padStart(2, '0')}:${currentTime.minute.toString().padStart(2, '0')}`
                }
              </div>
              <Button
                variant={density === 'compact' ? 'weekViewClicked' : 'weekView'}
                onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
                className="px-4 py-1 text-sm"
              >
                {language === 'th' ? (density === 'compact' ? 'กว้าง' : 'กระชับ') : (density === 'compact' ? 'Comfortable' : 'Compact')}
              </Button>
            </div>
          </div>
        </div>

  {/* Main Content */}
  <div className="flex gap-4 flex-1 min-h-0">
          {/* Teacher Filters - Only show for day view */}
          {viewMode === 'day' && (
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
          )}

          {/* Calendar Content - Scrollable */}
          <div className={`flex-1 bg-white border border-gray-200 rounded-xl shadow-lg relative min-w-0 min-h-0`}>
            {loading ? (
              <CalendarLoading view={viewMode} />
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <ErrorMessage message={error} onRetry={fetchData} />
              </div>
            ) : viewMode === 'day' ? (
              /* Day View - Improved Horizontal Scrollable Table */
              <div className="h-full overflow-hidden">
                {/* Horizontal scroll container */}
                <div className="h-full overflow-x-auto overflow-y-visible">
                  <div className="relative min-h-full" style={{ minWidth: `${Math.max(filteredTeachers.length * 200 + 100, 800)}px` }}>
                    {/* Current Time Line - spans across entire table width */}
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
                          const pixelsPerSlot = 40; // Increased height per slot for better spacing
                          
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

                    <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-20">
                        <tr>
              <th className="text-center font-bold text-white bg-gradient-to-br from-indigo-600 to-purple-700 border border-gray-300 p-3 text-sm min-w-[100px] sticky left-0 z-30 shadow-lg">
                            {t.time}
                          </th>
                          {filteredTeachers.length === 0 ? (
                            <th className="text-center font-bold text-white bg-gray-400 border border-gray-300 p-4 min-w-[300px]">
                              {t.noScheduleData}
                            </th>
                          ) : (
                            filteredTeachers.map((teacher) => (
                              <th 
                                key={teacher.teacher_id}
                                className={`text-center font-bold text-white border border-gray-300 p-3 text-sm min-w-[200px] bg-gradient-to-br from-indigo-600 to-purple-700`}
                              >
                                <div className="p-2">
                                  <div className="font-bold">{teacher.teacher_nickname}</div>
                                  <div className="text-xs opacity-90 mt-1">{teacher.teacher_name}</div>
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
                                      className="w-full h-full p-2 rounded cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 overflow-hidden relative z-10"
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
      ) : viewMode === 'week' && calendarData?.data?.calendar ? (
              /* Week View */
              <WeekView
                calendarData={calendarData?.data?.calendar || []}
                onSessionClick={handleSessionClick}
                onDayClick={handleEmptySlotClick}
                onAddSession={handleEmptySlotClick}
                density={density}
              />
            ) : viewMode === 'month' && calendarData?.data?.calendar ? (
              /* Month View */
              <MonthView
        calendarData={calendarData?.data?.calendar || []}
                currentDate={currentDate}
                onSessionClick={handleSessionClick}
                onDayClick={handleDayClick}
        density={density}
              />
            ) : (
              /* Fallback */
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="mb-2">{t.noScheduleData}</p>
                  <Button onClick={fetchData}>
                    {language === 'th' ? 'โหลดข้อมูลใหม่' : 'Reload'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isDetailModalOpen && (
        <SessionDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          selectedSession={selectedSession}
          scheduleDetail={scheduleDetail}
          detailLoading={detailLoading}
          onEditSchedule={handleSessionDetailEditSchedule}
          onCreateSession={handleSessionDetailCreateSession}
          onRetryLoading={handleSessionDetailRetryLoading}
        />
      )}

      {isCreateModalOpen && (
        <ModernScheduleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onConfirm={handleCreateSchedule}
          courses={courses}
          rooms={rooms}
          teachers={teacherOptions}
          scheduleForm={scheduleForm}
          updateForm={setScheduleForm}
          isLoading={formLoading}
          error={formError}
        />
      )}

      {isCreateSessionModalOpen && (
        <ModernSessionsModal
          isOpen={isCreateSessionModalOpen}
          onClose={() => setIsCreateSessionModalOpen(false)}
          onConfirm={async (form) => {
            // Convert the modern form to the old format and call handleCreateSession
            const convertedForm: ExtendedCreateSessionRequest = {
              mode: 'single',
              schedule_id: parseInt(form.schedule_id),
              session_date: form.start_date,
              start_time: form.time_slots[0]?.start_time || '09:00',
              end_time: form.time_slots[0]?.end_time || '12:00',
              repeat: {
                enabled: false,
                frequency: 'weekly',
                interval: 1,
                end: { type: 'after', count: 10 },
                days_of_week: []
              },
              is_makeup_session: false,
              notes: form.notes,
              appointment_notes: '',
              session_count: form.session_count,
              repeat_frequency: 'weekly'
            };
            setSessionForm(convertedForm);
            await handleCreateSession();
          }}
          courses={courses.map(course => ({
            id: course.id.toString(),
            name: course.course_name,
            level: course.level || 'beginner',
            duration_hours: 30 // Default duration, could be configured
          }))}
          teachers={teacherOptions.map(teacher => ({
            id: teacher.id.toString(),
            name: teacher.teacher_name,
            email: teacher.teacher_email || ''
          }))}
          students={students.map(student => ({
            id: student.id.toString(),
            name: `${student.first_name} ${student.last_name}`.trim(),
            email: student.email || ''
          }))}
          availableSlots={[]}
          isLoading={formLoading}
          error={formError || undefined}
        />
      )}

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
            openModal('createSchedule');
          }}
          variant="monthViewClicked"
          className="shadow-lg hover:shadow-xl transition-shadow duration-200 px-4 py-3 text-sm font-medium rounded-full min-w-[160px] cursor-pointer"
        >
          + {t.createNewSchedule}
        </Button>

        {/* Create New Session Button */}
        <Button
          onClick={() => {
            // Reset session form and open create session modal
            setSessionForm({
              mode: 'single',
              schedule_id: 0,
              session_date: new Date().toISOString().split('T')[0],
              start_time: '09:00',
              end_time: '11:00',
              repeat: {
                enabled: false,
                frequency: 'weekly',
                interval: 1,
                end: { type: 'after', count: 10 },
                days_of_week: []
              },
              is_makeup_session: false,
              notes: '',
              appointment_notes: '',
              session_count: 1,
              repeat_frequency: 'weekly'
            });
            setFormError(null);
            openModal('createSession');
          }}
          variant="weekViewClicked"
          className="shadow-lg hover:shadow-xl transition-shadow duration-200 px-4 py-3 text-sm font-medium rounded-full min-w-[160px] cursor-pointer"
        >
          + {language === 'th' ? 'สร้างครั้งเรียนใหม่' : 'Create New Session'}
        </Button>
      </div>

    </SidebarLayout>
  );
}
