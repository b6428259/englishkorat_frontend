"use client";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loading from "@/components/common/Loading";
import { colors } from "@/styles/colors";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SidebarLayout from "../../components/common/SidebarLayout";
import { useLanguage } from "../../contexts/LanguageContext";
// import { ButtonGroup } from "@heroui/react";
import CalendarLoading from "@/components/common/CalendarLoading";
import {
  CalendarDay,
  CalendarSession,
  CalendarViewApiResponse,
  Course,
  CreateScheduleInput as CreateScheduleRequest,
  Room,
  scheduleService,
  Student,
  Teacher,
  TeacherOption,
  TeacherSession,
} from "@/services/api/schedules";
import {
  deriveScheduleFields,
  validateScheduleForm,
  validateSessionForm,
} from "@/utils/scheduleValidation";
import dynamic from "next/dynamic";
import { SessionDetailModal } from "./components";
import CompactDayViewModal from "./components/CompactDayViewModal";
import MonthView from "./components/MonthView";
import ScheduleModalWrapper from "./components/ScheduleModalWrapper";

// Extended type with backward compatibility
type ExtendedCalendarViewResponse = CalendarViewApiResponse & {
  data: CalendarViewApiResponse["data"] & {
    calendar?: Record<
      string,
      {
        date: string;
        day_of_week: string;
        is_holiday: boolean;
        holiday_info: Record<string, unknown> | null;
        sessions: CalendarSession[];
        exceptions: Record<string, unknown>[];
        session_count: number;
        branch_distribution: Record<string, number>;
      }
    >;
  };
};
const ModernSessionsModal = dynamic(
  () =>
    import("./components/ModernSessionsModal").then(
      (m) => m.ModernSessionsModal
    ),
  {
    loading: () => (
      <div className="p-6">
        <Loading />
      </div>
    ),
    ssr: false,
  }
);

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

const getBranchBorderColorFromSession = (
  session: CalendarSession | TeacherSession
): string => {
  // Try to get branch name from session
  const branchName = session?.branch_name || "";
  const name = branchName.toLowerCase();

  if (name.includes("branch 1")) return "#334293";
  if (name.includes("branch 3")) return "#EFE957";
  if (name.includes("online")) return "#58B2FF";
  if (name.includes("chinese")) return "#FF90B3";

  return "gray"; // default
};

const getBranchColor = (branchName?: string): string => {
  if (!branchName)
    return "bg-gradient-to-br from-indigo-300 to-purple-400 text-white border-indigo-200";

  const name = branchName.toLowerCase();

  if (name.includes("branch 1"))
    return "bg-[#334293] text-white border-[#334293]";
  if (name.includes("branch 3"))
    return "bg-[#EFE957] text-black border-[#EFE957]";
  if (name.includes("online"))
    return "bg-[#58B2FF] text-white border-[#58B2FF]";
  if (name.includes("chinese"))
    return "bg-[#FF90B3] text-white border-[#FF90B3]";

  return "bg-gradient-to-br from-indigo-300 to-purple-400 text-white border-indigo-200";
};

// Simple WeekView component inline
const WeekView: React.FC<{
  calendarData: WeekCalendarData;
  onSessionClick: (session: CalendarSession) => void;
  onDayClick?: (date: string) => void;
  onAddSession?: (date: string) => void;
  density?: "comfortable" | "compact";
}> = ({
  calendarData,
  onSessionClick,
  onDayClick,
  onAddSession,
  density = "comfortable",
}) => {
  const { language } = useLanguage();

  // Get sorted dates for the week, starting from Monday
  const weekDates = Object.keys(calendarData).sort();

  const weekDayNames =
    language === "th"
      ? ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    if (language === "th") {
      return `${h.toString().padStart(2, "0")}:${minute}`;
    }
    return `${h % 12 === 0 ? 12 : h % 12}:${minute}${h < 12 ? "am" : "pm"}`;
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

  const padY = density === "compact" ? "py-2" : "py-3";
  const gap = density === "compact" ? "gap-1.5" : "gap-2";
  const cardPad = density === "compact" ? "p-2" : "p-3";
  const cardText = density === "compact" ? "text-[11px]" : "text-xs";

  return (
    <div className="min-h-0 flex flex-col bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Scroll container with sticky header */}
      <div className="flex-1 min-h-0 overflow-auto">
        {/* Week Header (tone aligned with MonthView) */}
        <div
          className={`grid grid-cols-7 ${gap} p-4 pb-2 sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200`}
        >
          {weekDates.map((date) => {
            const today = date === new Date().toISOString().split("T")[0];
            const dayName = getDayName(date);
            const dayData = calendarData[date];

            return (
              <div
                key={date}
                className={`${padY} text-center font-bold text-sm rounded-lg cursor-pointer transition-all duration-200 tracking-wide ${
                  today
                    ? "bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg"
                    : dayData?.is_holiday
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 opacity-70"
                    : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700"
                }`}
                onClick={() => onDayClick?.(date)}
              >
                <div className="font-bold text-sm mb-2">{dayName}</div>
                <div
                  className={`text-2xl font-bold ${
                    today ? "text-white" : "text-gray-900"
                  }`}
                >
                  {new Date(date).getDate()}
                </div>
                {dayData?.session_count > 0 && (
                  <div
                    className={`text-xs mt-2 px-2 py-1 rounded-full ${
                      today
                        ? "bg-white/20 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {dayData.session_count}{" "}
                    {language === "th" ? "คาบ" : "sessions"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sessions Grid - Scrollable */}
        <div
          className={`grid grid-cols-7 gap-px bg-gray-200 ${
            density === "compact" ? "p-2" : ""
          }`}
        >
          {weekDates.map((date) => {
            const dayData = calendarData[date];
            const today = date === new Date().toISOString().split("T")[0];
            const timeGroups = groupSessionsByTime(dayData?.sessions || []);

            return (
              <div
                key={date}
                className={`min-h-full p-3 ${
                  today
                    ? "bg-gradient-to-b from-blue-50 to-indigo-50"
                    : dayData?.is_holiday
                    ? "bg-gradient-to-b from-red-50 to-red-100"
                    : "bg-white"
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
                          {language === "th" ? "เพิ่มคาบเรียน" : "Add Session"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Sessions grouped by time */
                    timeGroups.map(([timeRange, sessions]) => (
                      <div key={timeRange} className="space-y-2">
                        {/* Time header for clustered sessions */}
                        <div className="text-xs font-bold text-gray-600 px-2 py-1 bg-gray-100 rounded-md">
                          {formatTime(sessions[0].start_time)} -{" "}
                          {formatTime(sessions[0].end_time)}
                        </div>

                        {/* Multiple sessions at same time */}
                        {sessions.map((session, index) => (
                          <div
                            key={session.id}
                            className={`${cardPad} rounded-xl shadow-md border-2 cursor-pointer transition-shadow duration-200 hover:shadow-lg overflow-hidden relative z-10 ${getBranchColor(
                              session.branch_name
                            )} ${
                              sessions.length > 1 ? `ml-${index * 2} -mt-1` : ""
                            }`}
                            onClick={() => onSessionClick(session)}
                          >
                            {/* Schedule Name */}
                            <div
                              className={`font-bold ${
                                density === "compact" ? "text-sm" : "text-sm"
                              } mb-2 leading-tight`}
                            >
                              {session.schedule_name}
                            </div>

                            {/* Course Name */}
                            <div
                              className={`${cardText} opacity-90 mb-2 font-medium`}
                            >
                              {session.course_name}
                            </div>

                            {/* Teacher */}
                            {session.teacher_name && (
                              <div
                                className={`flex items-center ${cardText} mb-2 opacity-90`}
                              >
                                <span className="mr-1">👩‍🏫</span>
                                <span className="truncate font-medium">
                                  {session.teacher_name}
                                </span>
                              </div>
                            )}

                            {/* Students */}
                            {session.students &&
                              session.students.length > 0 && (
                                <div
                                  className={`flex items-center ${cardText} mb-2 opacity-90`}
                                >
                                  <span className="mr-1">👥</span>
                                  <span className="font-medium">
                                    {session.students.length}{" "}
                                    {language === "th" ? "คน" : "students"}
                                  </span>
                                </div>
                              )}

                            {/* Participants for non-class schedules */}
                            {session.participants &&
                              session.participants.length > 0 && (
                                <div
                                  className={`flex items-center ${cardText} mb-2 opacity-90`}
                                >
                                  <span className="mr-1">👤</span>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">
                                      {session.participants.length}{" "}
                                      {language === "th"
                                        ? "คน"
                                        : "participants"}
                                    </span>
                                    <div className="flex gap-1 ml-2">
                                      {session.participants
                                        .slice(0, 5)
                                        .map((participant, pIndex) => (
                                          <div
                                            key={`${participant.user_id}-${pIndex}`}
                                            className={`w-2 h-2 rounded-full ${
                                              participant.status === "confirmed"
                                                ? "bg-green-500"
                                                : participant.status ===
                                                  "declined"
                                                ? "bg-red-500"
                                                : participant.status ===
                                                  "tentative"
                                                ? "bg-yellow-500"
                                                : "bg-gray-400" // invited
                                            }`}
                                            title={`${
                                              participant.user?.username ||
                                              participant.user_id
                                            } - ${participant.status}`}
                                          />
                                        ))}
                                      {session.participants.length > 5 && (
                                        <span className="text-xs ml-1">
                                          +{session.participants.length - 5}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                            {/* Room */}
                            {session.room_name && (
                              <div
                                className={`${cardText} opacity-80 font-medium`}
                              >
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
                        {language === "th" ? "วันหยุด" : "Holiday"}
                      </div>
                      {dayData.holiday_info && (
                        <div className="text-xs text-red-600 mt-1">
                          {(dayData.holiday_info as { name?: string })?.name ||
                            ""}
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
interface ExtendedCreateSessionRequest {
  mode: "single" | "multiple" | "bulk";
  schedule_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  repeat?: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    end: { type: "after" | "never" | "on"; count?: number; date?: string };
    days_of_week: string[];
  };
  is_makeup_session?: boolean;
  notes?: string;
  appointment_notes?: string;
  session_count?: number;
  repeat_frequency?: "daily" | "weekly" | "monthly";
}

// Time slots from 8:00 AM to 10:00 PM - แสดงเวลาแบบไทย (24 ชม.)
const timeSlots = Array.from({ length: (22 - 8) * 2 + 1 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? 0 : 30;
  // แสดงเวลาแบบไทย 24 ชั่วโมง เช่น 08:00, 09:30, 14:00
  const label = `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
  return { hour, minute, label };
});

export default function SchedulePage() {
  const { t, language } = useLanguage();
  const [density] = useState<"comfortable" | "compact">("comfortable");

  // State management
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentDate, setCurrentDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar data state
  const [calendarData, setCalendarData] =
    useState<ExtendedCalendarViewResponse | null>(null);

  // Modal states
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Create/Edit schedule modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] =
    useState(false);
  // Prevent overlapping or looping fetches
  const isFetchingRef = useRef(false);

  // Drag-to-scroll states
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const openModal = useCallback((modal: "createSchedule" | "createSession") => {
    // Close others first
    setIsCreateModalOpen(false);
    setIsCreateSessionModalOpen(false);
    // Open requested
    if (modal === "createSchedule") setIsCreateModalOpen(true);
    if (modal === "createSession") setIsCreateSessionModalOpen(true);
  }, []);

  // Form data and options with loading state
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [schedules, setSchedules] = useState<
    Array<{ schedule_id: number; schedule_name: string; course_name: string }>
  >([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOptionsLoaded, setFormOptionsLoaded] = useState(false);

  // Schedule form data
  const [scheduleForm, setScheduleForm] = useState<
    Partial<CreateScheduleRequest>
  >({
    schedule_name: "",
    schedule_type: "class", // New: Default to class schedule
    course_id: 0,
    group_id: 0, // New: Group selection for class schedules
    teacher_id: 0,
    default_teacher_id: 0,
    room_id: 0,
    total_hours: 30,
    hours_per_session: 3,
    max_students: 6,
    start_date: new Date().toISOString().split("T")[0],
    time_slots: [],
    auto_reschedule: true, // Updated field name
    notes: "",
  });

  // Session form data
  const [sessionForm, setSessionForm] = useState<ExtendedCreateSessionRequest>({
    mode: "single",
    schedule_id: 0,
    session_date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "12:00",
    repeat: {
      enabled: false,
      frequency: "weekly",
      interval: 1,
      end: { type: "after", count: 10 },
      days_of_week: [],
    },
    is_makeup_session: false,
    notes: "",
    appointment_notes: "",
    session_count: 1,
    repeat_frequency: "weekly",
  });

  // Prefill form for ModernSessionsModal (optional controlled seed)
  interface ModernSessionsPrefill {
    schedule_id: string;
    course_id: string;
    teacher_id: string;
    student_ids: string[];
    start_date: string;
    end_date: string;
    session_count: number;
    time_slots: { day_of_week: string; start_time: string; end_time: string }[];
    notes: string;
    level: "beginner" | "intermediate" | "advanced";
  }
  const [prefilledSessionsForm, setPrefilledSessionsForm] = useState<
    ModernSessionsPrefill | undefined
  >(undefined);

  // Get current time for the current time line - updates every minute
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
    };
  });

  // ปุ่มกระชับ
  const [isCompactModalOpen, setIsCompactModalOpen] = useState(false);

  // Update current time every minute for realtime line
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime({
        hour: now.getHours(),
        minute: now.getMinutes(),
      });
    };

    // Update immediately and then every minute
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Drag-to-scroll handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsDragging(true);
    dragStartPos.current = {
      x: e.pageX,
      y: e.pageY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      e.preventDefault();

      const deltaX = e.pageX - dragStartPos.current.x;
      const deltaY = e.pageY - dragStartPos.current.y;

      container.scrollLeft = dragStartPos.current.scrollLeft - deltaX;
      container.scrollTop = dragStartPos.current.scrollTop - deltaY;
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Optimize fetchData to avoid unnecessary re-renders
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      if (viewMode === "day") {
        // For day view, use the existing API to maintain compatibility
        const response = await scheduleService.getTeachersSchedule("day", {
          date: currentDate,
          teacher_id:
            selectedTeachers.length === 1 ? selectedTeachers[0] : undefined,
        });

        if (response.success) {
          const teachersList = Array.isArray(response.data)
            ? response.data
            : [];
          setTeachers(teachersList);

          // Auto-select all teachers if none selected and data available
          if (selectedTeachers.length === 0 && teachersList.length > 0) {
            setSelectedTeachers(teachersList.map((t: Teacher) => t.id));
          }
        } else {
          setTeachers([]);
        }
      } else {
        // For week and month views, use the calendar API
        const calendarResponse = await scheduleService.getCalendarView(
          viewMode,
          currentDate,
          {
            include_students: true,
            include_holidays: true,
          }
        );

        if (calendarResponse.success) {
          // Transform calendar_days array to calendar object for backward compatibility
          const transformedResponse =
            calendarResponse as ExtendedCalendarViewResponse;

          // Create calendar object from calendar_days array
          const calendarObject: Record<
            string,
            {
              date: string;
              day_of_week: string;
              is_holiday: boolean;
              holiday_info: Record<string, unknown> | null;
              sessions: CalendarSession[];
              exceptions: Record<string, unknown>[];
              session_count: number;
              branch_distribution: Record<string, number>;
            }
          > = {};

          if (transformedResponse.data.calendar_days) {
            transformedResponse.data.calendar_days.forEach(
              (day: CalendarDay) => {
                // Calculate branch distribution from events
                const branchDistribution: Record<string, number> = {};
                day.events.forEach((event) => {
                  const branchName = event.branch_name || "Unknown";
                  branchDistribution[branchName] =
                    (branchDistribution[branchName] || 0) + 1;
                });

                calendarObject[day.date] = {
                  date: day.date,
                  day_of_week: day.day_name,
                  is_holiday: day.is_holiday,
                  holiday_info: day.holiday_title
                    ? { title: day.holiday_title }
                    : null,
                  sessions: day.events, // events are the sessions
                  exceptions: [],
                  session_count: day.event_count,
                  branch_distribution: branchDistribution,
                };
              }
            );
          }

          // Add calendar property for backward compatibility
          transformedResponse.data.calendar = calendarObject;
          setCalendarData(transformedResponse);
        } else {
          setCalendarData(null);
        }
      }
    } catch (err) {
      setError(
        language === "th"
          ? "ไม่สามารถโหลดข้อมูลตารางเรียนได้"
          : "Failed to fetch schedule data"
      );
      console.error("Error fetching schedule:", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [viewMode, currentDate, language, selectedTeachers]); // Include all dependencies but use ref to prevent excessive calls

  // Optimized fetchFormOptions - using useRef to track loading state
  const fetchFormOptions = useCallback(async () => {
    if (formOptionsLoaded) return; // Prevent duplicate loads

    try {
      setFormLoading(true);
      const [coursesRes, roomsRes, teachersRes, schedulesRes, studentsRes] =
        await Promise.all([
          scheduleService
            .getCourses()
            .catch(() => ({ success: true, data: [] })),
          scheduleService.getRooms().catch(() => ({ success: true, data: [] })),
          scheduleService
            .getTeachers()
            .catch(() => ({ success: true, data: [] })),
          scheduleService
            .getSchedules()
            .catch(() => ({ success: true, data: [] })),
          // Fetch users with student role - we'll filter students from all users for now
          import("@/services/user.service")
            .then((service) =>
              service.userService
                .getUsers(1, 1000)
                .catch(() => ({ success: false, data: { users: [] } }))
            )
            .catch(() => ({ success: false, data: { users: [] } })),
        ]);

      console.log("courses:", coursesRes.data);
      if (coursesRes && coursesRes.success && Array.isArray(coursesRes.data))
        setCourses(coursesRes.data);

      console.log("rooms:", roomsRes.data);
      if (roomsRes && roomsRes.success && Array.isArray(roomsRes.data))
        setRooms(roomsRes.data);
      if (teachersRes && teachersRes.success && Array.isArray(teachersRes.data))
        setTeacherOptions(teachersRes.data);
      if (schedulesRes.success && Array.isArray(schedulesRes.data)) {
        setSchedules(schedulesRes.data);
      }

      // Filter and set students from users data
      if (
        studentsRes &&
        "success" in studentsRes &&
        studentsRes.success &&
        Array.isArray(studentsRes.data?.users)
      ) {
        const studentUsers = studentsRes.data.users
          .filter((user: { role: string }) => user.role === "student")
          .map(
            (user: {
              id: number;
              username?: string;
              first_name?: string;
              first_name_en?: string;
              last_name?: string;
              last_name_en?: string;
              nickname?: string;
              age?: number;
              email?: string;
              phone?: string;
              line_id?: string;
              role: string;
            }) => ({
              id: user.id,
              user_id: user.id,
              first_name: user.first_name ?? user.username ?? "",
              first_name_en:
                user.first_name_en ?? user.first_name ?? user.username ?? "",
              last_name: user.last_name ?? "",
              last_name_en: user.last_name_en ?? user.last_name ?? "",
              nickname: user.nickname ?? user.username ?? "",
              age: user.age ?? 18,
              email: user.email ?? "",
              phone: user.phone ?? "",
              line_id: user.line_id ?? "",
            })
          );
        setStudents(studentUsers);
      }

      setFormOptionsLoaded(true);
    } catch (err) {
      console.error("Error fetching form options:", err);
    } finally {
      setFormLoading(false);
    }
  }, [formOptionsLoaded]); // Include formOptionsLoaded as dependency

  // Fetch schedule data when view/date changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (calendarData?.data?.calendar) {
      console.log("Calendar data:", calendarData.data.calendar);
    }
  }, [calendarData]);

  // Fetch static form options once on mount
  useEffect(() => {
    fetchFormOptions();
  }, [fetchFormOptions]);

  // Filter teachers based on selection - memoized for performance
  const filteredTeachers = useMemo(
    () => teachers.filter((teacher) => selectedTeachers.includes(teacher.id)),
    [teachers, selectedTeachers]
  );

  // Memoize transformed data passed to ModernSessionsModal to avoid recreating arrays
  const memoCourses = useMemo(
    () =>
      courses.map((course) => ({
        id: course.id.toString(),
        name: course.course_name,
        level: course.level || "beginner",
        duration_hours: 30,
      })),
    [courses]
  );

  const memoTeachers = useMemo(
    () =>
      teacherOptions.map((teacher) => ({
        id: teacher.id.toString(),
        name: teacher.teacher_name,
        email: teacher.teacher_email || "",
      })),
    [teacherOptions]
  );

  const memoStudents = useMemo(
    () =>
      students.map((student) => ({
        id: student.id.toString(),
        name: `${student.first_name} ${student.last_name}`.trim(),
        email: student.email || "",
      })),
    [students]
  );

  // Memoize schedules for ModernSessionsModal in expected shape
  const memoSchedules = useMemo(
    () =>
      schedules.map((s) => ({
        id: s.schedule_id.toString(),
        name: `${s.schedule_name} • ${s.course_name}`,
      })),
    [schedules]
  );

  const toggleTeacher = (teacherId: number) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const selectAllTeachers = () => {
    setSelectedTeachers(teachers.map((t) => t.id));
  };

  const clearSelection = () => {
    setSelectedTeachers([]);
  };

  // Calculate row span for sessions - แก้ไขให้คำนวณถูกต้อง
  const getRowSpan = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    const diffMinutes = endInMinutes - startInMinutes;

    // แก้ไข: ต้องบวก 1 เพราะ rowSpan นับรวมช่องแรกด้วย
    // เช่น 09:30-10:00 = 30 นาที = 1 slot แต่ต้องใช้ rowSpan=1
    // เช่น 09:30-11:00 = 90 นาที = 3 slots แต่ต้องใช้ rowSpan=3
    return Math.max(1, Math.ceil(diffMinutes / 30)); // 30 minutes per slot
  };

  // Handle session click for details
  const handleSessionClick = (session: TeacherSession | CalendarSession) => {
    const sessionId = session.id;
    setSelectedSession(sessionId);
    setIsDetailModalOpen(true);
  };

  // Handle day click in month view
  const handleDayClick = (date: string) => {
    setCurrentDate(date);
    setViewMode("day");
  };

  // Handle empty slot click for week/month views
  const handleEmptySlotClick = (date: string) => {
    setCurrentDate(date);
    setViewMode("day");
    // Open create schedule modal after switching to day view
    setTimeout(() => {
      openModal("createSchedule");
    }, 100);
  };

  // Handle empty cell click for creating schedule
  const handleEmptyCellClick = (
    _teacherId: number,
    timeSlot: { hour: number; minute: number }
  ) => {
    console.log("handleEmptyCellClick called with teacherId:", _teacherId);
    console.log("timeSlot:", timeSlot);
    // Reset any previous form errors
    setFormError(null);

    // Prefill a single session quickly based on clicked timeslot (default 1 hour duration)
    const startH = timeSlot.hour;
    const startM = timeSlot.minute;
    const endH = Math.min(23, startH + 1);
    const start_time = `${startH.toString().padStart(2, "0")}:${startM
      .toString()
      .padStart(2, "0")}`;
    const end_time = `${endH.toString().padStart(2, "0")}:${startM
      .toString()
      .padStart(2, "0")}`;

    setSessionForm((prev) => ({
      ...prev,
      mode: "single",
      session_date: currentDate,
      start_time,
      end_time,
      repeat: {
        enabled: false,
        frequency: prev.repeat?.frequency ?? "weekly",
        interval: prev.repeat?.interval ?? 1,
        end: prev.repeat?.end ?? { type: "after", count: 1 },
        days_of_week: prev.repeat?.days_of_week ?? [],
      },
      is_makeup_session: false,
      session_count: 1,
    }));

    // Compute day_of_week for ModernSessionsModal prefill
    const jsDate = new Date(currentDate);
    const weekdayIdx = jsDate.getDay(); // 0=Sun..6=Sat
    const dayOfWeekMap = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as const;
    const day_of_week = dayOfWeekMap[weekdayIdx];

    // We intentionally no longer auto-select existing schedule here because
    // we're seeding the Create Schedule flow (instead of ModernSessionsModal).

    // Seed the Schedule modal (create schedule) with a single time slot
    // so clicking an empty cell opens the Schedule creation flow.
    const newScheduleForm = {
      schedule_name: "",
      schedule_type: "class" as const,
      course_id: 0,
      group_id: 0,
      teacher_id: _teacherId || 0,
      default_teacher_id: _teacherId || 0,
      room_id: 0,
      total_hours: 30,
      hours_per_session: 1,
      max_students: 15,
      start_date: currentDate,
      time_slots: [
        {
          day_of_week,
          start_time,
          end_time,
        },
      ],
      // Also set the standalone session_start_time so the modal shows the time in Basic tab
      session_start_time: start_time,
      // Default recurring to none for this quick add flow
      recurring_pattern: undefined,
      notes: "",
    };

    setScheduleForm(newScheduleForm);

    // Open Create Schedule modal (modern schedule modal)
    openModal("createSchedule");
  };

  // Handle schedule creation
  // Parent now receives the finalized form from the modal on confirm to avoid frequent re-renders
  const handleCreateSchedule = async (
    finalForm?: Partial<CreateScheduleRequest>
  ) => {
    try {
      console.log("🚀 handleCreateSchedule STARTED");
      setFormLoading(true);
      setFormError(null);

      const formToValidate = finalForm || scheduleForm;
      console.log("📋 Form to validate:", formToValidate);

      // Validate per new spec
      const issues = validateScheduleForm(formToValidate);
      console.log("✅ Validation issues:", issues);
      if (issues.length > 0) {
        const errorMsg = issues[0].message;
        console.error("❌ Validation failed:", errorMsg);
        setFormError(errorMsg);
        throw new Error(errorMsg);
      }

      // Derive fields (estimated_end_date/total sessions)
      const derived = deriveScheduleFields(formToValidate);
      console.log("📊 Derived fields:", derived);
      const payload: CreateScheduleRequest = {
        ...(formToValidate as CreateScheduleRequest),
        estimated_end_date: derived.estimated_end_date,
        auto_reschedule_holidays:
          formToValidate.auto_reschedule_holidays ??
          formToValidate.auto_reschedule ??
          false,
      };
      console.log("📦 Final API payload:", payload);

      // Use unified schedule creation per new spec
      console.log("🌐 Calling API...");
      const response = await scheduleService.createSchedule(payload);
      console.log("📡 API Response:", response);
      if (response && response.schedule) {
        console.log("✅ Schedule created successfully!");

        // Jump to the created schedule's start date
        if (payload.start_date) {
          const startDateStr =
            typeof payload.start_date === "string"
              ? payload.start_date.split("T")[0]
              : new Date(payload.start_date).toISOString().split("T")[0];
          setCurrentDate(startDateStr);
          console.log("📅 Jumped to schedule start date:", startDateStr);
        }

        setIsCreateModalOpen(false);
        await fetchData(); // Refresh the schedule data
        // Refresh form options to include new schedule
        setFormOptionsLoaded(false);
        await fetchFormOptions();
        // Show success message (you can add toast notification here)
      } else {
        const errorMsg =
          response?.message ||
          (language === "th"
            ? "เกิดข้อผิดพลาดในการสร้างตารางเรียน"
            : "Failed to create schedule");
        console.error("❌ API returned error:", errorMsg);
        setFormError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: unknown) {
      console.error("💥 Exception caught:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setFormError(
        errorMessage ||
          (language === "th"
            ? "เกิดข้อผิดพลาดในการสร้างตารางเรียน"
            : "Failed to create schedule")
      );
      throw err; // Re-throw to propagate to modal
    } finally {
      console.log("🏁 handleCreateSchedule FINISHED");
      setFormLoading(false);
    }
  };

  // Handle session creation within a schedule
  const handleCreateSession = async () => {
    try {
      setFormLoading(true);
      setFormError(null);

      // Validation
      if (!sessionForm.schedule_id || sessionForm.schedule_id === 0) {
        setFormError(
          language === "th"
            ? "กรุณาเลือกตารางเรียน"
            : "Please select a schedule"
        );
        return;
      }

      const sessIssues = validateSessionForm(sessionForm);
      if (sessIssues.length > 0) {
        setFormError(sessIssues[0].message);
        return;
      }

      if (sessionForm.mode === "single") {
        // Create single session
        const response = await scheduleService.createSessions(
          sessionForm.schedule_id.toString(),
          sessionForm
        );

        if (response.success) {
          setIsCreateSessionModalOpen(false);
          await fetchData();
          // Refresh schedules list to include any new data
          setFormOptionsLoaded(false);
          await fetchFormOptions();
        } else {
          setFormError(
            response.message ||
              (language === "th"
                ? "เกิดข้อผิดพลาดในการสร้างครั้งเรียน"
                : "Failed to create session")
          );
        }
      } else if (sessionForm.mode === "multiple") {
        // Create multiple sessions
        const response = await scheduleService.createMultipleSessions({
          schedule_id: sessionForm.schedule_id,
          session_count: sessionForm.session_count || 1,
          start_date: sessionForm.session_date,
          start_time: sessionForm.start_time,
          end_time: sessionForm.end_time,
          repeat_frequency: sessionForm.repeat_frequency || "weekly",
          notes: sessionForm.notes,
        });

        if (response.success) {
          setIsCreateSessionModalOpen(false);
          await fetchData();
          // Refresh schedules list to include any new data
          setFormOptionsLoaded(false);
          await fetchFormOptions();
        } else {
          setFormError(
            response.message ||
              (language === "th"
                ? "เกิดข้อผิดพลาดในการสร้างครั้งเรียน"
                : "Failed to create sessions")
          );
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setFormError(
        errorMessage ||
          (language === "th"
            ? "เกิดข้อผิดพลาดในการสร้างครั้งเรียน"
            : "Failed to create session")
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Date navigation functions
  const navigateDate = (direction: "prev" | "next") => {
    const date = new Date(currentDate);

    if (viewMode === "day") {
      date.setDate(date.getDate() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      date.setDate(date.getDate() + (direction === "next" ? 7 : -7));
    } else if (viewMode === "month") {
      date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
    }

    setCurrentDate(date.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split("T")[0]);
  };

  // Format date display based on view mode
  const formatDateDisplay = (date: string) => {
    const d = new Date(date);
    if (language === "th") {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: viewMode === "day" ? "long" : undefined,
      };
      return d.toLocaleDateString("th-TH", options);
    } else {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: viewMode === "day" ? "long" : undefined,
      };
      return d.toLocaleDateString("en-US", options);
    }
  };

  if (loading) {
    return (
      <SidebarLayout breadcrumbItems={[{ label: t.schedule }]}>
        <div className="flex justify-center items-center h-96">
          <Loading />
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
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 flex-shrink-0 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t.scheduleManagement}
            </h1>

            {/* color label for each branches */}
            <div className="flex items-center gap-3 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#334293]"></span>{" "}
                Branch 1
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#EFE957]"></span>{" "}
                Branch 3
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#58B2FF]"></span>{" "}
                Online
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#FF90B3]"></span>{" "}
                Chinese
              </div>
            </div>

            {/* View Mode Buttons */}
            <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
              <Button
                variant={
                  viewMode === "month" ? "monthViewClicked" : "monthView"
                }
                onClick={() => setViewMode("month")}
                className={
                  "px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                }
              >
                {t.monthView.toUpperCase()}
              </Button>
              <Button
                variant={viewMode === "week" ? "weekViewClicked" : "weekView"}
                onClick={() => setViewMode("week")}
                className={
                  "px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                }
              >
                {t.weekView.toUpperCase()}
              </Button>
              <Button
                variant={viewMode === "day" ? "dayViewClicked" : "dayView"}
                onClick={() => setViewMode("day")}
                className={
                  "px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                }
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
                onClick={() => navigateDate("prev")}
                className="px-3 py-1 text-sm"
              >
                ‹
              </Button>
              <Button
                variant="monthViewClicked"
                onClick={goToToday}
                className="px-4 py-1 text-sm"
              >
                {language === "th" ? "วันนี้" : "Today"}
              </Button>
              <Button
                variant="monthView"
                onClick={() => navigateDate("next")}
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
                {language === "th"
                  ? `${currentTime.hour
                      .toString()
                      .padStart(2, "0")}:${currentTime.minute
                      .toString()
                      .padStart(2, "0")} น.`
                  : `${currentTime.hour
                      .toString()
                      .padStart(2, "0")}:${currentTime.minute
                      .toString()
                      .padStart(2, "0")}`}
              </div>
              {/* <Button
                variant={density === "compact" ? "weekViewClicked" : "weekView"}
                onClick={() =>
                  setDensity(density === "compact" ? "comfortable" : "compact")
                }
                className="px-4 py-1 text-sm"
              >
                {language === "th"
                  ? density === "compact"
                    ? "กว้าง"
                    : "กระชับ"
                  : density === "compact"
                  ? "Comfortable"
                  : "Compact"}
              </Button> */}

              <Button
                variant={density === "compact" ? "weekViewClicked" : "weekView"}
                onClick={() => setIsCompactModalOpen(true)}
                className="px-4 py-1 text-sm"
              >
                {language === "th" ? "ภาพรวม" : "Overview"}
              </Button>

              {isCompactModalOpen && (
                <CompactDayViewModal
                  date={currentDate}
                  teachers={teachers}
                  onClose={() => setIsCompactModalOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-2 flex-1 min-h-0">
          {/* Teacher Filters - Only show for day view */}
          {viewMode === "day" && (
            <div className="w-35 h-280 bg-white border border-gray-200 rounded-lg p-1 flex flex-col flex-shrink-0">
              <h2 className="font-bold mb-3 text-[#334293] border-b border-[#334293] p-2 text-sm">
                {t.SelectTeachers}
              </h2>

              <div className="mb-3 flex gap-1">
                <Button
                  variant="monthView"
                  onClick={selectAllTeachers}
                  className="text-[10px] rounded-md flex-1"
                >
                  {t.selectAllTeachers}
                </Button>
                <Button
                  variant="monthView"
                  onClick={clearSelection}
                  className="text-[10px] rounded-md flex-1"
                >
                  {t.clearSelection}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {teachers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {t.noScheduleData}
                  </p>
                ) : (
                  teachers.map((teacher) => (
                    <label
                      key={teacher.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.id)}
                        onChange={() => toggleTeacher(teacher.id)}
                        className="h-3 w-3 rounded focus:ring-0"
                        style={{ accentColor: colors.yellowLogo }}
                      />
                      <div className="min-w-0 flex-1">
                        <span
                          className="text-sm font-medium block truncate"
                          style={{ color: colors.blueLogo }}
                        >
                          T. {teacher.name.nickname_en || teacher.name.first_en}
                        </span>
                        {/* <p className="text-xs text-gray-500 truncate">
                          {`${teacher.name.first_en} ${teacher.name.last_en}`.trim()}
                        </p> */}
                        <p className="text-[9px] text-gray-600">
                          {teacher.sessions.length}{" "}
                          {language === "th" ? "ครั้งเรียน" : "sessions"}
                        </p>
                        {teacher.branch.name_en && (
                          <p className="text-xs text-blue-600 truncate">
                            {teacher.branch.name_en}
                          </p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Calendar Content - Scrollable */}
          <div
            className={`flex-1 bg-white border border-gray-200 rounded-xl shadow-lg relative min-w-0 min-h-0`}
          >
            {loading ? (
              <CalendarLoading view={viewMode} />
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <ErrorMessage message={error} onRetry={fetchData} />
              </div>
            ) : viewMode === "day" ? (
              /* Day View - Improved Horizontal Scrollable Table */
              <div className="h-full relative min-h-0">
                {/* Horizontal scroll container with drag-to-scroll */}
                <div
                  ref={scrollContainerRef}
                  className="h-full overflow-auto relative z-0 select-none"
                  style={{ cursor: isDragging ? "grabbing" : "grab" }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div
                    className="relative min-h-full"
                    style={{
                      minWidth: `${Math.max(
                        filteredTeachers.length * 200 + 100,
                        800
                      )}px`,
                    }}
                  >
                    {/* Current Time Line - spans across entire table width */}
                    <div
                      className="absolute left-0 right-0 z-50 pointer-events-none"
                      style={{
                        top: `${
                          36 +
                          (() => {
                            const currentMinutes =
                              currentTime.hour * 60 + currentTime.minute;
                            const startMinutes = 8 * 60; // 8:00 AM
                            const endMinutes = 22 * 60; // 10:00 PM

                            if (
                              currentMinutes < startMinutes ||
                              currentMinutes > endMinutes
                            ) {
                              return -1000; // Hide line if outside schedule hours
                            }

                            const minutesFromStart =
                              currentMinutes - startMinutes;
                            const pixelsPerSlot = 40; // Increased height per slot for better spacing

                            return (minutesFromStart / 30) * pixelsPerSlot;
                          })()
                        }px`,
                      }}
                    >
                      <div className="relative">
                        <div className="h-0.5 bg-red-500 shadow-lg"></div>
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full shadow-md"></div>
                        <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full shadow-md"></div>
                        {/* Time label */}
                        <div className="absolute -top-6 left-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg">
                          {currentTime.hour.toString().padStart(2, "0")}:
                          {currentTime.minute.toString().padStart(2, "0")}
                        </div>
                      </div>
                    </div>

                    <table className="w-full text-sm border-collapse relative">
                      {/* thead ไม่ sticky - scroll ลงไปด้วย */}
                      <thead className="sticky top-0 z-30 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg">
                        <tr className="relative h-[40px]">
                          {/* คอลัมน์เวลา - sticky ด้านซ้ายเท่านั้น */}
                          <th
                            className="
                              text-center font-bold text-white
                              bg-gradient-to-br from-indigo-600 to-purple-700
                              border border-gray-300
                              text-xs
                              w-[50px]
                              h-[30px]
                              sticky left-0
                              z-40
                              shadow-lg
                            "
                          >
                            {t.time}
                          </th>

                          {/* หัวตารางชื่อครู - relative, ไม่ sticky */}
                          {filteredTeachers.length === 0 ? (
                            <th className="relative text-center font-bold text-white bg-gray-400 border border-gray-300 p-4 w-[55px]">
                              {t.noScheduleData}
                            </th>
                          ) : (
                            filteredTeachers.map((teacher) => (
                              <th
                                key={teacher.id}
                                className="
                                  sticky top-0
                                  text-center font-bold text-white
                                  border border-gray-300
                                  text-[10px] w-[55px] h-[30px]
                                  bg-gradient-to-br from-indigo-600 to-purple-700
                                "
                              >
                                <div className="p-1">
                                  <div className="font-bold">
                                    T.{" "}
                                    {teacher.name.nickname_en ||
                                      teacher.name.first_en}
                                  </div>
                                  {/* <div className="text-xs opacity-90 mt-1">
                                    {`${teacher.name.first_en} ${teacher.name.last_en}`.trim()}
                                  </div> */}
                                  {teacher.branch.name_en && (
                                    <div className="text-xs opacity-75 mt-1">
                                      {teacher.branch.name_en}
                                    </div>
                                  )}
                                </div>
                              </th>
                            ))
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {filteredTeachers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={2}
                              className="text-center p-8 text-gray-500"
                            >
                              {t.noScheduleData}
                            </td>
                          </tr>
                        ) : (
                          timeSlots.map((timeSlot) => (
                            <tr
                              key={`${timeSlot.hour}-${timeSlot.minute}`}
                              className="h-8"
                            >
                              {/* เวลา - sticky ด้านซ้าย */}
                              <td
                                className="
                                font-medium text-gray-700 bg-gray-50 text-xs
                                border border-gray-300 text-center p-1
                                sticky left-0 z-30 shadow-md
                              "
                              >
                                {timeSlot.label}
                              </td>

                              {/* ตารางครู */}
                              {filteredTeachers.map((teacher) => {
                                const session = teacher.sessions.find((s) => {
                                  const [startHour, startMinute] = s.start_time
                                    .split(":")
                                    .map(Number);
                                  return (
                                    startHour === timeSlot.hour &&
                                    startMinute === timeSlot.minute
                                  );
                                });

                                if (session) {
                                  const rowSpan = getRowSpan(
                                    session.start_time,
                                    session.end_time
                                  );
                                  return (
                                    <td
                                      key={teacher.id}
                                      rowSpan={rowSpan}
                                      className="p-0 border border-gray-300 align-top relative"
                                    >
                                      <div
                                        className="w-[55px] h-full p-1.5 rounded-lg cursor-pointer transition-all duration-200
                                        shadow-sm hover:shadow-md overflow-hidden relative z-10 flex flex-col"
                                        style={{
                                          height: `${rowSpan * 32 - 8}px`,
                                          borderLeft: `4px solid ${getBranchBorderColorFromSession(
                                            session
                                          )}`,
                                        }}
                                        onClick={() =>
                                          handleSessionClick(session)
                                        }
                                      >
                                        <div className="space-y-0.5 leading-tight text-[10px]">
                                          {/* Time Display */}
                                          <div className="flex items-center gap-1">
                                            <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                                            <p className="font-medium text-[8px] text-indigo-700">
                                              {session.start_time.substring(
                                                0,
                                                5
                                              )}{" "}
                                              -{" "}
                                              {session.end_time.substring(0, 5)}
                                            </p>
                                          </div>

                                          {/* Course/Schedule Name */}
                                          {session.schedule_name && (
                                            <p
                                              className="font-semibold text-[9px] text-gray-900 whitespace-normal break-words"
                                              title={session.schedule_name}
                                            >
                                              {session.schedule_name}
                                            </p>
                                          )}

                                          {/* Session Number */}
                                          <p className="font-medium text-[9px] text-gray-700">
                                            {language === "th"
                                              ? "ครั้งที่"
                                              : "Session"}{" "}
                                            {session.session_number}
                                          </p>

                                          {/* Room Info */}
                                          {session.room?.name && (
                                            <div className="flex items-center gap-1">
                                              <svg
                                                className="w-3 h-3 text-gray-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                              </svg>
                                              <p className="text-[10px] text-gray-600 line-clamp-1">
                                                {session.room.name}
                                              </p>
                                            </div>
                                          )}

                                          {/* Status Badge */}
                                          <div className="flex items-center gap-1.5">
                                            <span
                                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                session.status === "scheduled"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : session.status ===
                                                    "completed"
                                                  ? "bg-green-100 text-green-700"
                                                  : session.status ===
                                                    "cancelled"
                                                  ? "bg-red-100 text-red-700"
                                                  : "bg-gray-100 text-gray-700"
                                              }`}
                                            >
                                              {session.status === "scheduled" &&
                                                (language === "th"
                                                  ? "กำหนดการแล้ว"
                                                  : "Scheduled")}
                                              {session.status === "completed" &&
                                                (language === "th"
                                                  ? "เสร็จสิ้น"
                                                  : "Completed")}
                                              {session.status === "cancelled" &&
                                                (language === "th"
                                                  ? "ยกเลิก"
                                                  : "Cancelled")}
                                              {![
                                                "scheduled",
                                                "completed",
                                                "cancelled",
                                              ].includes(session.status) &&
                                                session.status}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  );
                                }

                                // ช่องว่าง
                                return (
                                  <td
                                    key={teacher.id}
                                    className="border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                    onClick={() =>
                                      handleEmptyCellClick(teacher.id, timeSlot)
                                    }
                                  >
                                    <div className="w-full h-8 flex items-center justify-center">
                                      <div className="w-6 h-6 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                                        <span className="text-xs text-gray-400 hover:text-blue-600">
                                          +
                                        </span>
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
            ) : viewMode === "week" && calendarData?.data?.calendar ? (
              /* Week View */
              <WeekView
                calendarData={calendarData?.data?.calendar || []}
                onSessionClick={handleSessionClick}
                onDayClick={handleEmptySlotClick}
                onAddSession={handleEmptySlotClick}
                density={density}
              />
            ) : viewMode === "month" && calendarData?.data?.calendar ? (
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
                    {language === "th" ? "โหลดข้อมูลใหม่" : "Reload"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isDetailModalOpen && selectedSession && (
        <SessionDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          sessionId={selectedSession}
        />
      )}

      {isCreateModalOpen && (
        <ScheduleModalWrapper
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onConfirm={handleCreateSchedule}
          courses={courses}
          rooms={rooms}
          teachers={teacherOptions}
          isLoading={formLoading}
          error={formError}
        />
      )}

      {isCreateSessionModalOpen && (
        <ModernSessionsModal
          isOpen={isCreateSessionModalOpen}
          onClose={() => {
            setIsCreateSessionModalOpen(false);
            // Clear prefill after closing to avoid overriding manual opens
            setPrefilledSessionsForm(undefined);
          }}
          onConfirm={async (form) => {
            // Convert the modern form to the old format and call handleCreateSession
            const convertedForm: ExtendedCreateSessionRequest = {
              mode: "single",
              schedule_id: parseInt(form.schedule_id),
              session_date: form.start_date,
              start_time: form.time_slots[0]?.start_time || "09:00",
              end_time: form.time_slots[0]?.end_time || "12:00",
              repeat: {
                enabled: false,
                frequency: "weekly",
                interval: 1,
                end: { type: "after", count: 10 },
                days_of_week: [],
              },
              is_makeup_session: false,
              notes: form.notes,
              appointment_notes: "",
              session_count: form.session_count,
              repeat_frequency: "weekly",
            };
            setSessionForm(convertedForm);
            await handleCreateSession();
          }}
          courses={memoCourses}
          teachers={memoTeachers}
          students={memoStudents}
          schedules={memoSchedules}
          scheduleForm={prefilledSessionsForm}
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
              schedule_name: "",
              schedule_type: "class", // New: Default to class schedule
              course_id: 0,
              group_id: 0, // New: Reset group selection
              teacher_id: 0,
              start_date: new Date().toISOString().split("T")[0],
              time_slots: [],
              max_students: 15,
              total_hours: 40,
              hours_per_session: 2,
              auto_reschedule: false, // Updated field name
              notes: "",
            });
            setFormError(null);
            openModal("createSchedule");
          }}
          variant="monthViewClicked"
          className="shadow-lg hover:shadow-xl transition-shadow duration-200 px-4 py-3 text-sm font-medium rounded-full min-w-[160px] cursor-pointer"
        >
          + {t.createNewSchedule}
        </Button>
      </div>
    </SidebarLayout>
  );
}
