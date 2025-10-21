"use client";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loading from "@/components/common/Loading";
import { colors } from "@/styles/colors";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SidebarLayout from "../../components/common/SidebarLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
// import { ButtonGroup } from "@heroui/react";
import CalendarLoading from "@/components/common/CalendarLoading";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";
import {
  CalendarDay,
  CalendarSession,
  CalendarViewApiResponse,
  Course,
  CreateScheduleInput as CreateScheduleRequest,
  Room,
  scheduleService,
  SessionDetailUser,
  Student,
  StudentDetailInSession,
  Teacher,
  TeacherOption,
  TeacherSession,
  updateSession,
} from "@/services/api/schedules";
import {
  deriveScheduleFields,
  validateScheduleForm,
  validateSessionForm,
} from "@/utils/scheduleValidation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, Users, X } from "lucide-react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { SessionDetailModal } from "./components";
import CompactDayViewModal from "./components/CompactDayViewModal";
import MonthView from "./components/MonthView";
import { QuickSearch } from "./components/QuickSearch";
import ScheduleModalWrapper from "./components/ScheduleModalWrapper";
import {
  DayViewSkeleton,
  MonthViewSkeleton,
  WeekViewSkeleton,
} from "./components/SkeletonLoader";

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

const getBranchIdFromSession = (
  session: CalendarSession | TeacherSession
): number | null => {
  // First priority: Check branch_id directly on session
  if ("branch_id" in session && session.branch_id) {
    return session.branch_id;
  }

  // Second priority: For TeacherSession, check room.branch_id
  if ("room" in session && session.room && typeof session.room === "object") {
    const room = session.room as { branch_id?: number };
    if (room.branch_id) return room.branch_id;
  }

  // Fallback: Try to guess from branch name
  const branchName = session?.branch_name || "";
  const name = branchName.toLowerCase();

  if (name.includes("branch 1")) return 1;
  if (name.includes("branch 3")) return 2;
  if (name.includes("online")) return 3;
  if (name.includes("chinese")) return 4;

  return null;
};

const getBranchIdFromTeacher = (teacher: Teacher): number | null => {
  // Get branch ID from teacher object
  if (
    teacher.branch &&
    typeof teacher.branch === "object" &&
    "id" in teacher.branch
  ) {
    return teacher.branch.id ?? null;
  }
  return null;
};

const getBranchColorByTeacher = (teacher: Teacher): string => {
  const branchId = getBranchIdFromTeacher(teacher);

  if (branchId === 1) return "bg-[#334293]"; // Branch 1
  if (branchId === 2) return "bg-[#EFE957]"; // Branch 3
  if (branchId === 3) return "bg-[#58B2FF]"; // Online
  if (branchId === 4) return "bg-[#FF90B3]"; // Chinese

  return "bg-gray-400"; // default
};

const getBranchBorderColorFromSession = (
  session: CalendarSession | TeacherSession
): string => {
  const branchId = getBranchIdFromSession(session);

  if (branchId === 1) return "#334293"; // Branch 1
  if (branchId === 2) return "#EFE957"; // Branch 3
  if (branchId === 3) return "#58B2FF"; // Online
  if (branchId === 4) return "#FF90B3"; // Chinese

  return "gray"; // default
};

// Modern WeekView - Compact, Clean, Scheduleista-inspired
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

  // Get sorted dates for the week, starting from Sunday
  const allDates = Object.keys(calendarData).sort();

  // Ensure we always have exactly 7 days (Sun-Sat) starting from the first Sunday
  const weekDates = (() => {
    if (allDates.length === 0) return [];

    // Find the first Sunday in the data
    const baseDate = new Date(allDates[0]);
    const dayOfWeek = baseDate.getDay();
    const sundayOffset = -dayOfWeek; // 0 for Sunday, -1 for Monday, etc.
    const firstSunday = new Date(baseDate);
    firstSunday.setDate(firstSunday.getDate() + sundayOffset);

    // Generate exactly 7 days from Sunday
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstSunday);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
  })();

  const weekDayNames =
    language === "th"
      ? ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]
      : [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

  const weekDayNamesShort =
    language === "th"
      ? ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const getDayName = (dateStr: string, short: boolean = false) => {
    const date = new Date(dateStr);
    const dayIndex = date.getDay();
    // Convert Sunday (0) to be last (6)
    const mondayBasedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return short
      ? weekDayNamesShort[mondayBasedIndex]
      : weekDayNames[mondayBasedIndex];
  };

  // Calculate week summary
  const weekSummary = useMemo(() => {
    let totalSessions = 0;
    let totalStudents = 0;
    const branchCounts: Record<number, number> = {};

    Object.values(calendarData).forEach((dayData) => {
      if (dayData?.sessions) {
        totalSessions += dayData.sessions.length;
        dayData.sessions.forEach((session) => {
          if (session.students) {
            totalStudents += session.students.length;
          }
          const branchId = session.teacher?.branch_id;
          if (branchId) {
            branchCounts[branchId] = (branchCounts[branchId] || 0) + 1;
          }
        });
      }
    });

    return { totalSessions, totalStudents, branchCounts };
  }, [calendarData]);

  // Compact sizing for better space utilization
  const gap = "gap-1.5 sm:gap-2";
  const cardPad = "p-1.5 sm:p-2";
  const cardText = "text-[10px] sm:text-xs";
  const cardTextSmall = "text-[9px] sm:text-[10px]";

  return (
    <div className="flex flex-col bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg border border-gray-100 h-full">
      {/* Week Summary Bar - Minimal Theme */}
      <div className="bg-indigo-600 text-white px-3 py-1.5 sm:py-2">
        <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <span className="text-sm">📅</span>
              <span className="font-bold">{weekSummary.totalSessions}</span>
            </div>

            <div className="w-px h-3 bg-white/30" />

            <div className="flex items-center gap-1">
              <span className="text-sm">👥</span>
              <span className="font-bold">{weekSummary.totalStudents}</span>
            </div>

            {Object.keys(weekSummary.branchCounts).length > 0 && (
              <>
                <div className="w-px h-3 bg-white/30 hidden md:block" />
                <div className="hidden md:flex items-center gap-1">
                  {Object.entries(weekSummary.branchCounts).map(
                    ([branchId, count]) => {
                      const id = parseInt(branchId);
                      let color = "bg-gray-400";

                      if (id === 1) {
                        color = "bg-[#334293]";
                      } else if (id === 2) {
                        color = "bg-[#EFE957]";
                      } else if (id === 3) {
                        color = "bg-[#58B2FF]";
                      } else if (id === 4) {
                        color = "bg-[#FF90B3]";
                      }

                      return (
                        <div
                          key={branchId}
                          className="flex items-center gap-0.5 px-1 py-0.5 bg-white/20 rounded"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${color}`}
                          />
                          <span className="text-[10px] font-semibold">
                            {count}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scroll container with sticky header */}
      <div className="flex-1 overflow-auto">
        {/* Week Header - Minimal */}
        <div
          className={`grid grid-cols-7 ${gap} p-1.5 sm:p-2 pb-1.5 sticky top-0 z-20 bg-white/98 backdrop-blur-sm border-b border-gray-100`}
        >
          {weekDates.map((date) => {
            const today = date === new Date().toISOString().split("T")[0];
            const dayName = getDayName(date, true);
            const dayData = calendarData[date] || {
              date,
              day_of_week: "",
              is_holiday: false,
              holiday_info: null,
              sessions: [],
              exceptions: [],
              session_count: 0,
              branch_distribution: {},
            };

            const isWeekend =
              new Date(date).getDay() === 0 || new Date(date).getDay() === 6;

            return (
              <div
                key={date}
                role="button"
                tabIndex={0}
                aria-label={`${dayName}, ${new Date(
                  date
                ).toLocaleDateString()}`}
                className={`py-1.5 sm:py-2 px-1 text-center rounded cursor-pointer transition-all ${
                  today
                    ? "bg-indigo-600 text-white"
                    : isWeekend
                    ? "bg-indigo-50 text-gray-700 hover:bg-indigo-100"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onDayClick?.(date)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onDayClick?.(date);
                  }
                }}
              >
                {/* Day Name */}
                <div
                  className={`text-[9px] sm:text-[10px] mb-0.5 ${
                    today ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {dayName}
                </div>

                {/* Date Number */}
                <div
                  className={`text-base sm:text-lg font-bold mb-0.5 ${
                    today ? "text-white" : "text-gray-900"
                  }`}
                >
                  {new Date(date).getDate()}
                </div>

                {/* Session Count Badge */}
                {dayData?.session_count > 0 ? (
                  <div
                    className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      today
                        ? "bg-white/20 text-white"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {dayData.session_count}
                    <span className="hidden sm:inline ml-0.5">
                      {language === "th" ? "คาบ" : ""}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`text-[10px] ${
                      today ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    -
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sessions Grid - Minimal */}
        <div className={`grid grid-cols-7 ${gap} bg-white p-1.5 sm:p-2`}>
          {weekDates.map((date) => {
            const dayData = calendarData[date];
            const today = date === new Date().toISOString().split("T")[0];
            const timeGroups = groupSessionsByTime(dayData?.sessions || []);
            const isWeekend =
              new Date(date).getDay() === 0 || new Date(date).getDay() === 6;

            return (
              <div
                key={date}
                className={`min-h-[180px] sm:min-h-[200px] ${cardPad} rounded border ${
                  today
                    ? "bg-indigo-50/30 border-indigo-200"
                    : isWeekend
                    ? "bg-indigo-50/20 border-gray-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="space-y-1">
                  {timeGroups.length === 0 ? (
                    /* Empty day */
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`Add session for ${new Date(
                        date
                      ).toLocaleDateString()}`}
                      className="h-28 sm:h-32 flex items-center justify-center opacity-20 hover:opacity-40 transition-opacity cursor-pointer border border-dashed border-gray-300 rounded hover:border-indigo-400"
                      onClick={() => onAddSession?.(date)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onAddSession?.(date);
                        }
                      }}
                    >
                      <div className="text-center">
                        <div className="text-lg sm:text-xl mb-0.5">➕</div>
                        <div className="text-[9px] text-gray-500">
                          {language === "th" ? "เพิ่ม" : "Add"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Sessions */
                    timeGroups.map(([timeRange, sessions]) => (
                      <div key={timeRange} className="space-y-0.5">
                        {/* Time Badge - Minimal */}
                        <div className="flex items-center gap-0.5 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold">
                          <span>⏰</span>
                          <span>
                            {formatTime(sessions[0].start_time)}-
                            {formatTime(sessions[0].end_time)}
                          </span>
                          {sessions.length > 1 && (
                            <span className="ml-auto bg-white/20 px-1 py-0.5 rounded">
                              +{sessions.length - 1}
                            </span>
                          )}
                        </div>

                        {/* Session Cards - Minimal Theme */}
                        <div className="space-y-0.5">
                          {sessions.map((session, index) => {
                            // Branch indicator (minimal)
                            const teacherBranchId =
                              session.teacher?.branch_id || null;
                            let branchColor = "#9CA3AF";
                            if (teacherBranchId === 1) branchColor = "#334293";
                            else if (teacherBranchId === 2)
                              branchColor = "#EFE957";
                            else if (teacherBranchId === 3)
                              branchColor = "#58B2FF";
                            else if (teacherBranchId === 4)
                              branchColor = "#FF90B3";

                            return (
                              <div
                                key={session.id}
                                role="button"
                                tabIndex={0}
                                aria-label={`Session: ${session.schedule_name}, ${session.course_name}`}
                                className={`${cardPad} rounded border border-gray-200 bg-white cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all`}
                                onClick={() => onSessionClick(session)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSessionClick(session);
                                  }
                                }}
                                style={{
                                  borderLeftWidth: "3px",
                                  borderLeftColor: branchColor,
                                }}
                              >
                                {/* Content */}
                                <div className="space-y-0.5">
                                  {/* Header: Schedule Name */}
                                  <div className="flex items-center gap-1">
                                    <h3
                                      className={`font-bold ${cardText} leading-tight text-gray-900 flex-1 truncate`}
                                    >
                                      {session.schedule_name}
                                    </h3>
                                    {sessions.length > 1 && index === 0 && (
                                      <span className="bg-gray-200 text-gray-700 text-[9px] font-bold px-1 py-0.5 rounded shrink-0">
                                        +{sessions.length - 1}
                                      </span>
                                    )}
                                  </div>

                                  {/* Course */}
                                  <div
                                    className={`flex items-center gap-0.5 ${cardTextSmall} text-gray-600`}
                                  >
                                    <span className="text-[10px]">📚</span>
                                    <span className="truncate">
                                      {session.course_name}
                                    </span>
                                  </div>

                                  {/* Info */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {/* Teacher */}
                                    {session.teacher_name && (
                                      <div
                                        className={`flex items-center gap-0.5 ${cardTextSmall} text-gray-600`}
                                      >
                                        <span className="text-[10px]">👨‍🏫</span>
                                        <span className="truncate max-w-[60px] sm:max-w-[80px]">
                                          {session.teacher_name}
                                        </span>
                                      </div>
                                    )}

                                    {/* Students Count */}
                                    {session.students &&
                                      session.students.length > 0 && (
                                        <div
                                          className={`flex items-center gap-0.5 ${cardTextSmall}`}
                                        >
                                          <span className="text-[10px]">
                                            👥
                                          </span>
                                          <span className="font-bold text-indigo-600">
                                            {session.students.length}
                                          </span>
                                        </div>
                                      )}

                                    {/* Participants */}
                                    {session.participants &&
                                      session.participants.length > 0 && (
                                        <div
                                          className={`flex items-center gap-0.5 ${cardTextSmall}`}
                                        >
                                          <span className="text-[10px]">
                                            👤
                                          </span>
                                          <span className="font-bold text-indigo-600">
                                            {session.participants.length}
                                          </span>
                                          <div className="flex gap-0.5">
                                            {session.participants
                                              .slice(0, 2)
                                              .map((participant, pIndex) => (
                                                <div
                                                  key={`${participant.user_id}-${pIndex}`}
                                                  className={`w-1.5 h-1.5 rounded-full ${
                                                    participant.status ===
                                                    "confirmed"
                                                      ? "bg-indigo-500"
                                                      : participant.status ===
                                                        "declined"
                                                      ? "bg-gray-400"
                                                      : participant.status ===
                                                        "tentative"
                                                      ? "bg-indigo-300"
                                                      : "bg-gray-300"
                                                  }`}
                                                  title={`${
                                                    participant.user
                                                      ?.username ||
                                                    participant.user_id
                                                  } - ${participant.status}`}
                                                />
                                              ))}
                                            {session.participants.length >
                                              3 && (
                                              <span className="text-[10px] font-bold text-gray-600 ml-0.5">
                                                +
                                                {session.participants.length -
                                                  3}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Room */}
                                    {session.room_name && (
                                      <div
                                        className={`flex items-center gap-1 ${cardTextSmall}`}
                                      >
                                        <span className="text-sm">📍</span>
                                        <span className="text-gray-700 truncate">
                                          {session.room_name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Holiday Banner - Minimal */}
                  {dayData?.is_holiday && (
                    <div className="mt-2 p-2 bg-indigo-50 rounded border border-indigo-200 text-center">
                      <div className="text-lg mb-0.5">🎌</div>
                      <div
                        className={`${cardTextSmall} font-bold text-indigo-700`}
                      >
                        {language === "th" ? "วันหยุด" : "Holiday"}
                      </div>
                      {dayData.holiday_info && (
                        <div
                          className={`${cardTextSmall} text-gray-600 mt-0.5`}
                        >
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

      {/* Bottom Helper Bar - Minimal */}
      <div className="bg-white border-t border-gray-100 px-2 py-1 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-500">
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#334293]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#EFE957]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#58B2FF]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF90B3]" />
            <span className="ml-0.5">
              {language === "th" ? "สาขา" : "Branches"}
            </span>
          </div>
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
  const { user } = useAuth();
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

  // Quick search modal state
  const [showQuickSearch, setShowQuickSearch] = useState(false);

  // Teacher filter visibility state
  const [showTeacherFilter, setShowTeacherFilter] = useState(true);

  // Create/Edit schedule modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] =
    useState(false);
  // Prevent overlapping or looping fetches
  const isFetchingRef = useRef(false);
  const selectedTeachersRef = useRef<number[]>(selectedTeachers);

  // Sync ref with state
  useEffect(() => {
    selectedTeachersRef.current = selectedTeachers;
  }, [selectedTeachers]);

  // Drag-to-scroll states
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const lastVelocity = useRef({ x: 0, y: 0 });
  const momentumAnimation = useRef<number | null>(null);

  // Drag & Drop session states
  const [draggedSession, setDraggedSession] = useState<
    CalendarSession | TeacherSession | null
  >(null);
  const [dropTarget, setDropTarget] = useState<{
    teacherId: number;
    timeSlot: { hour: number; minute: number };
  } | null>(null);
  const [showMoveConfirm, setShowMoveConfirm] = useState(false);
  const [moveSessionData, setMoveSessionData] = useState<{
    session: CalendarSession | TeacherSession;
    newTeacherId: number;
    newTime: { hour: number; minute: number };
    sessionDetail?: {
      oldTeacher?: SessionDetailUser;
      newTeacher?: SessionDetailUser;
      students?: StudentDetailInSession[];
    };
  } | null>(null);

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

  // Flag to track when schedule form should trigger modal opening
  const [scheduleFormPending, setScheduleFormPending] = useState(false);

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

  // Open modal when schedule form is set and pending flag is true
  useEffect(() => {
    if (scheduleFormPending && scheduleForm.default_teacher_id) {
      console.log(
        "🚀 Opening Create Schedule modal after state update with teacher_id:",
        scheduleForm.default_teacher_id
      );
      openModal("createSchedule");
      setScheduleFormPending(false);
    }
  }, [scheduleFormPending, scheduleForm, openModal]);

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

    // Cancel any ongoing momentum animation
    if (momentumAnimation.current) {
      cancelAnimationFrame(momentumAnimation.current);
      momentumAnimation.current = null;
    }

    setIsDragging(true);
    dragStartPos.current = {
      x: e.pageX,
      y: e.pageY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
    lastVelocity.current = { x: 0, y: 0 };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      e.preventDefault();

      const deltaX = e.pageX - dragStartPos.current.x;
      const deltaY = e.pageY - dragStartPos.current.y;

      // Calculate velocity for momentum
      lastVelocity.current = {
        x: deltaX - lastVelocity.current.x,
        y: deltaY - lastVelocity.current.y,
      };

      container.scrollLeft = dragStartPos.current.scrollLeft - deltaX;
      container.scrollTop = dragStartPos.current.scrollTop - deltaY;
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);

    // Apply momentum scrolling with easing
    const container = scrollContainerRef.current;
    if (!container) return;

    const velocityX = lastVelocity.current.x;
    const velocityY = lastVelocity.current.y;
    const friction = 0.94; // Smoother momentum (increased from 0.92)
    const threshold = 0.3; // Smoother stop (decreased from 0.5)

    let currentVelocityX = velocityX * 1.5; // Amplify initial velocity for smoother feel
    let currentVelocityY = velocityY * 1.5;

    // Easing function for smoother deceleration
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    let frame = 0;
    const maxFrames = 60; // Maximum animation frames

    const applyMomentum = () => {
      frame++;
      const progress = Math.min(frame / maxFrames, 1);
      const easedProgress = easeOut(progress);

      if (
        Math.abs(currentVelocityX) < threshold &&
        Math.abs(currentVelocityY) < threshold
      ) {
        momentumAnimation.current = null;
        return;
      }

      // Apply eased scroll with smoother deceleration
      container.scrollLeft -= currentVelocityX * (1 - easedProgress * 0.3);
      container.scrollTop -= currentVelocityY * (1 - easedProgress * 0.3);

      currentVelocityX *= friction;
      currentVelocityY *= friction;

      momentumAnimation.current = requestAnimationFrame(applyMomentum);
    };

    if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
      applyMomentum();
    }
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
        // Always fetch all teachers, filtering is done client-side
        const response = await scheduleService.getTeachersSchedule("day", {
          date: currentDate,
        });

        if (response.success) {
          const teachersList = Array.isArray(response.data)
            ? response.data
            : [];
          setTeachers(teachersList);

          // Auto-select all teachers if none selected and data available
          if (
            selectedTeachersRef.current.length === 0 &&
            teachersList.length > 0
          ) {
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
  }, [viewMode, currentDate, language]); // selectedTeachers removed - filtering is client-side only

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

  // Get all sessions for quick search - memoized for performance
  const allSessions = useMemo(() => {
    if (!calendarData?.data?.calendar) return [];

    const sessions: CalendarSession[] = [];
    Object.values(calendarData.data.calendar).forEach((day) => {
      if (day.sessions) {
        sessions.push(...day.sessions);
      }
    });
    return sessions;
  }, [calendarData]);

  // Filter teachers based on selection - memoized for performance
  const filteredTeachers = useMemo(
    () => teachers.filter((teacher) => selectedTeachers.includes(teacher.id)),
    [teachers, selectedTeachers]
  );

  // Group filtered teachers by branch - memoized for performance
  const teachersByBranch = useMemo(() => {
    const grouped = filteredTeachers.reduce((acc, teacher) => {
      const branchId = teacher.branch?.id || 0;
      if (!acc[branchId]) {
        acc[branchId] = [];
      }
      acc[branchId].push(teacher);
      return acc;
    }, {} as Record<number, Teacher[]>);

    // Sort branches: 1, 2, 3, 4, then others
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      if (aNum === 0) return 1; // Unassigned last
      if (bNum === 0) return -1;
      return aNum - bNum;
    });

    return sortedEntries;
  }, [filteredTeachers]);

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

  // Check if a cell is covered by a session with rowSpan
  // เช็คว่า cell นี้ถูก "ครอบคลุม" โดย session ที่มี rowSpan หรือไม่
  const isCellCoveredBySession = (
    teacher: (typeof filteredTeachers)[0] & {
      sessions: TeacherSession[];
    },
    timeSlot: (typeof timeSlots)[0]
  ): boolean => {
    return teacher.sessions.some((session: TeacherSession) => {
      const [sessionStartHour, sessionStartMinute] = session.start_time
        .split(":")
        .map(Number);
      const [sessionEndHour, sessionEndMinute] = session.end_time
        .split(":")
        .map(Number);

      const sessionStartMinutes = sessionStartHour * 60 + sessionStartMinute;
      const sessionEndMinutes = sessionEndHour * 60 + sessionEndMinute;
      const currentSlotMinutes = timeSlot.hour * 60 + timeSlot.minute;

      // ถ้า current time slot อยู่ระหว่าง session start-end แต่ไม่ใช่ start time
      // แสดงว่า cell นี้ถูกครอบคลุมโดย rowSpan ไม่ต้อง render <td>
      return (
        currentSlotMinutes > sessionStartMinutes &&
        currentSlotMinutes < sessionEndMinutes
      );
    });
  };

  // Handle session click for details
  const handleSessionClick = (session: TeacherSession | CalendarSession) => {
    const sessionId = session.id;
    setSelectedSession(sessionId);
    setIsDetailModalOpen(true);
  };

  // Handle session click in month view - go to day view and open details
  const handleMonthSessionClick = (session: CalendarSession) => {
    const sessionDate = session.session_date;
    const sessionId = session.id;

    // Switch to day view with the session's date
    setCurrentDate(sessionDate);
    setViewMode("day");

    // Open detail modal after switching view
    setTimeout(() => {
      setSelectedSession(sessionId);
      setIsDetailModalOpen(true);
    }, 100);
  };

  // Handle day click in month/week view
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
  // Handle empty cell click for creating schedule
  const handleEmptyCellClick = (
    _teacherId: number,
    timeSlot: { hour: number; minute: number }
  ) => {
    console.log("🔍 handleEmptyCellClick called with teacherId:", _teacherId);
    console.log("🔍 timeSlot:", timeSlot);

    // Validate teacher ID
    if (!_teacherId || _teacherId <= 0) {
      console.error("❌ Invalid teacher ID:", _teacherId);
      toast.error(
        language === "th"
          ? "ไม่สามารถระบุครูได้ กรุณาลองใหม่อีกครั้ง"
          : "Cannot identify teacher. Please try again."
      );
      return;
    }

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

    // Compute day_of_week for time slots
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

    console.log("✅ Setting schedule form with teacher_id:", _teacherId);

    // Find the teacher to get user_id
    const teacher = teachers.find((t) => t.id === _teacherId);
    const userId = teacher?.user_id;

    if (!userId) {
      console.error("❌ Cannot find user_id for teacher_id:", _teacherId);
      toast.error(
        language === "th"
          ? "ไม่พบข้อมูลครู กรุณาลองใหม่อีกครั้ง"
          : "Teacher data not found. Please try again."
      );
      return;
    }

    console.log("✅ Found user_id:", userId, "for teacher_id:", _teacherId);

    // Update schedule form with teacher ID
    const newForm: Partial<CreateScheduleRequest> = {
      schedule_name: "",
      schedule_type: "class" as const,
      course_id: 0,
      group_id: 0,
      teacher_id: _teacherId,
      default_teacher_id: userId, // Use user_id for the combobox
      room_id: 0,
      default_room_id: 0,
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
      session_start_time: start_time,
      recurring_pattern: undefined,
      notes: "",
      auto_reschedule: false,
      auto_reschedule_holidays: false,
    };

    // Set form first
    setScheduleForm(newForm);

    // Set a flag to trigger modal opening after state update
    setScheduleFormPending(true);
  };

  // Drag & Drop handlers for moving sessions
  const handleSessionDragStart = (
    session: CalendarSession | TeacherSession
  ) => {
    setDraggedSession(session);
  };

  const handleCellDragOver = (
    e: React.DragEvent,
    teacherId: number,
    timeSlot: { hour: number; minute: number }
  ) => {
    e.preventDefault();
    setDropTarget({ teacherId, timeSlot });
  };

  const handleCellDragLeave = () => {
    setDropTarget(null);
  };

  const handleCellDrop = async (
    e: React.DragEvent,
    newTeacherId: number,
    newTimeSlot: { hour: number; minute: number }
  ) => {
    e.preventDefault();
    setDropTarget(null);

    if (!draggedSession) return;

    // Check if it's the same cell (no move needed)
    const oldTeacherId =
      "assigned_teacher_id" in draggedSession
        ? draggedSession.assigned_teacher_id
        : "teacher_id" in draggedSession
        ? draggedSession.teacher_id
        : null;
    const oldStartTime = draggedSession.start_time.substring(0, 5);
    const [oldHour, oldMinute] = oldStartTime.split(":").map(Number);

    if (
      oldTeacherId === newTeacherId &&
      oldHour === newTimeSlot.hour &&
      oldMinute === newTimeSlot.minute
    ) {
      setDraggedSession(null);
      return;
    }

    // Fetch session details for confirmation modal
    const fetchSessionDetails = async () => {
      try {
        const response = await scheduleService.getSessionDetail(
          draggedSession.id.toString()
        );
        const oldTeacher = response.session.assigned_teacher;
        const newTeacher = teacherOptions.find((t) => t.id === newTeacherId);
        const students = response.students?.map((s) => s.student) || [];

        setMoveSessionData({
          session: draggedSession,
          newTeacherId,
          newTime: newTimeSlot,
          sessionDetail: {
            oldTeacher,
            newTeacher: newTeacher as unknown as SessionDetailUser,
            students,
          },
        });
        setShowMoveConfirm(true);
      } catch (error) {
        console.error("Failed to fetch session details:", error);
        // Fallback without detailed info
        setMoveSessionData({
          session: draggedSession,
          newTeacherId,
          newTime: newTimeSlot,
        });
        setShowMoveConfirm(true);
      }
      setDraggedSession(null);
    };

    fetchSessionDetails();
  };

  const handleConfirmMoveSession = async () => {
    if (!moveSessionData) return;

    const { session, newTeacherId, newTime } = moveSessionData;
    const sessionId = session.id;

    // Check if teacher changed
    const currentTeacherId =
      "teacher_id" in session ? session.teacher_id : null;
    const teacherChanged =
      currentTeacherId && currentTeacherId !== newTeacherId;

    // Check if time changed
    const currentHour = parseInt(session.start_time.split(":")[0]);
    const currentMinute = parseInt(session.start_time.split(":")[1]);
    const timeChanged =
      currentHour !== newTime.hour || currentMinute !== newTime.minute;

    if (!teacherChanged && !timeChanged) {
      toast(language === "th" ? "ไม่มีการเปลี่ยนแปลง" : "No changes made", {
        icon: "ℹ️",
        position: "top-center",
      });
      setShowMoveConfirm(false);
      setMoveSessionData(null);
      return;
    }

    try {
      // Calculate new start and end times
      const oldStartTime = session.start_time.substring(0, 5);
      const oldEndTime = session.end_time.substring(0, 5);
      const [oldStartHour, oldStartMinute] = oldStartTime
        .split(":")
        .map(Number);
      const [oldEndHour, oldEndMinute] = oldEndTime.split(":").map(Number);

      const durationMinutes =
        oldEndHour * 60 + oldEndMinute - (oldStartHour * 60 + oldStartMinute);
      const newStartMinutes = newTime.hour * 60 + newTime.minute;
      const newEndMinutes = newStartMinutes + durationMinutes;
      const newEndHour = Math.floor(newEndMinutes / 60);
      const newEndMinute = newEndMinutes % 60;

      const newStartTime = `${newTime.hour
        .toString()
        .padStart(2, "0")}:${newTime.minute.toString().padStart(2, "0")}:00`;
      const newEndTime = `${newEndHour
        .toString()
        .padStart(2, "0")}:${newEndMinute.toString().padStart(2, "0")}:00`;

      // Prepare updates for API (PATCH /api/schedules/sessions/:id)
      const updates: {
        start_time?: string;
        end_time?: string;
        assigned_teacher_id?: number;
      } = {};

      if (timeChanged) {
        updates.start_time = newStartTime;
        updates.end_time = newEndTime;
      }

      if (teacherChanged) {
        updates.assigned_teacher_id = newTeacherId;
      }

      // Use updateSession endpoint that supports teacher reassignment
      await updateSession(sessionId, updates);

      // Show success message based on what changed
      const changeMessage =
        teacherChanged && timeChanged
          ? language === "th"
            ? "ย้ายคาบเรียนและเปลี่ยนครูสำเร็จ"
            : "Session moved and teacher changed successfully"
          : teacherChanged
          ? language === "th"
            ? "เปลี่ยนครูสำเร็จ"
            : "Teacher changed successfully"
          : language === "th"
          ? "ย้ายคาบเรียนสำเร็จ"
          : "Session moved successfully";

      toast.success(changeMessage, {
        icon: "✅",
        position: "top-center",
      });

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error("Failed to move session:", error);
      toast.error(
        language === "th"
          ? "ไม่สามารถย้ายคาบเรียนได้"
          : "Failed to move session",
        { position: "top-center" }
      );
    } finally {
      setShowMoveConfirm(false);
      setMoveSessionData(null);
    }
  };

  const handleCancelMoveSession = () => {
    setShowMoveConfirm(false);
    setMoveSessionData(null);
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
  const navigateDate = useCallback(
    (direction: "prev" | "next") => {
      const date = new Date(currentDate);

      if (viewMode === "day") {
        date.setDate(date.getDate() + (direction === "next" ? 1 : -1));
      } else if (viewMode === "week") {
        date.setDate(date.getDate() + (direction === "next" ? 7 : -7));
      } else if (viewMode === "month") {
        date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
      }

      setCurrentDate(date.toISOString().split("T")[0]);
    },
    [currentDate, viewMode]
  );

  const goToToday = useCallback(() => {
    setCurrentDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Quick search shortcut (Cmd+K / Ctrl+K)
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowQuickSearch(true);
        return;
      }

      // Ignore other shortcuts if user is typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Navigation shortcuts
      if (e.key === "ArrowLeft" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        navigateDate("prev");
      } else if (e.key === "ArrowRight" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        navigateDate("next");
      } else if (e.key === "t" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        goToToday();
      } else if (e.key === "d" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setViewMode("day");
      } else if (e.key === "w" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setViewMode("week");
      } else if (e.key === "m" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setViewMode("month");
      } else if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openModal("createSchedule");
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [viewMode, navigateDate, goToToday, openModal]);

  // Touch gesture support for mobile navigation
  useSwipeGestures({
    onSwipeLeft: () => navigateDate("next"),
    onSwipeRight: () => navigateDate("prev"),
    onSwipeUp: () => {
      // Cycle view mode: day -> week -> month -> day
      if (viewMode === "day") setViewMode("week");
      else if (viewMode === "week") setViewMode("month");
      else if (viewMode === "month") setViewMode("day");
    },
    onSwipeDown: () => {
      // Pull to refresh - refetch data
      fetchData();
    },
  });

  // Format date display based on view mode
  const formatDateDisplay = (date: string) => {
    const d = new Date(date);

    if (viewMode === "week") {
      // Show week range: "Jan 13 - 19, 2025" or "13 - 19 มกราคม 2025"
      const startOfWeek = new Date(d);
      const dayOfWeek = startOfWeek.getDay();
      const sundayOffset = -dayOfWeek; // Start from Sunday
      startOfWeek.setDate(startOfWeek.getDate() + sundayOffset);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      if (language === "th") {
        const monthName = startOfWeek.toLocaleDateString("th-TH", {
          month: "long",
        });
        const year = startOfWeek.toLocaleDateString("th-TH", {
          year: "numeric",
        });
        const startDay = startOfWeek.getDate();
        const endDay = endOfWeek.getDate();

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startDay} - ${endDay} ${monthName} ${year}`;
        } else {
          const endMonthName = endOfWeek.toLocaleDateString("th-TH", {
            month: "long",
          });
          return `${startDay} ${monthName} - ${endDay} ${endMonthName} ${year}`;
        }
      } else {
        const startMonth = startOfWeek.toLocaleDateString("en-US", {
          month: "short",
        });
        const endMonth = endOfWeek.toLocaleDateString("en-US", {
          month: "short",
        });
        const year = startOfWeek.getFullYear();
        const startDay = startOfWeek.getDate();
        const endDay = endOfWeek.getDate();

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startMonth} ${startDay} - ${endDay}, ${year}`;
        } else {
          return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
        }
      }
    }

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
        <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          {viewMode === "week" && <WeekViewSkeleton />}
          {viewMode === "month" && <MonthViewSkeleton />}
          {viewMode === "day" && <DayViewSkeleton />}
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
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header Section - Responsive */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg mb-2 sm:mb-3 flex-shrink-0 border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t.scheduleManagement}
            </h1>

            {/* color label for each branches - Hide on small mobile, show as grid on tablet */}
            <div className="hidden sm:flex sm:flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#334293]"></span>
                <span className="hidden lg:inline">Branch 1</span>
                <span className="lg:hidden">B1</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#EFE957]"></span>
                <span className="hidden lg:inline">Branch 3</span>
                <span className="lg:hidden">B3</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#58B2FF]"></span>
                <span className="hidden lg:inline">Online</span>
                <span className="lg:hidden">OL</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF90B3]"></span>
                <span className="hidden lg:inline">Chinese</span>
                <span className="lg:hidden">CH</span>
              </div>
            </div>

            {/* View Mode Buttons - Responsive */}
            <div className="flex bg-gray-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-inner w-full sm:w-auto">
              <Button
                variant={
                  viewMode === "month" ? "monthViewClicked" : "monthView"
                }
                onClick={() => setViewMode("month")}
                className="flex-1 sm:flex-none px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-md sm:rounded-lg text-[11px] sm:text-xs lg:text-sm font-semibold transition-all duration-200"
              >
                <span className="sm:hidden">
                  {language === "th" ? "เดือน" : "MO"}
                </span>
                <span className="hidden sm:inline">
                  {t.monthView.toUpperCase()}
                </span>
              </Button>
              <Button
                variant={viewMode === "week" ? "weekViewClicked" : "weekView"}
                onClick={() => setViewMode("week")}
                className="flex-1 sm:flex-none px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-md sm:rounded-lg text-[11px] sm:text-xs lg:text-sm font-semibold transition-all duration-200"
              >
                <span className="sm:hidden">
                  {language === "th" ? "สัปดาห์" : "WK"}
                </span>
                <span className="hidden sm:inline">
                  {t.weekView.toUpperCase()}
                </span>
              </Button>
              <Button
                variant={viewMode === "day" ? "dayViewClicked" : "dayView"}
                onClick={() => setViewMode("day")}
                className="flex-1 sm:flex-none px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-md sm:rounded-lg text-[11px] sm:text-xs lg:text-sm font-semibold transition-all duration-200"
              >
                <span className="sm:hidden">
                  {language === "th" ? "วัน" : "DY"}
                </span>
                <span className="hidden sm:inline">
                  {t.dayView.toUpperCase()}
                </span>
              </Button>
            </div>
          </div>

          {/* Date Navigation - Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="monthView"
                onClick={() => navigateDate("prev")}
                className="px-2 sm:px-3 py-1.5 sm:py-1 text-base sm:text-sm"
              >
                ‹
              </Button>
              <Button
                variant="monthViewClicked"
                onClick={goToToday}
                className="px-3 sm:px-4 py-1.5 sm:py-1 text-xs sm:text-sm"
              >
                {language === "th" ? "วันนี้" : "Today"}
              </Button>
              <Button
                variant="monthView"
                onClick={() => navigateDate("next")}
                className="px-2 sm:px-3 py-1.5 sm:py-1 text-base sm:text-sm"
              >
                ›
              </Button>
            </div>

            {/* Current Date Display - Responsive */}
            <div className="text-center sm:text-left text-base sm:text-lg font-semibold text-gray-700 order-first sm:order-none">
              {formatDateDisplay(currentDate)}
            </div>

            {/* Time & Actions */}
            <div className="flex items-center justify-between sm:justify-end space-x-2">
              <div className="text-xs sm:text-sm text-gray-500">
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

              {/* Quick Search Button */}
              <button
                onClick={() => setShowQuickSearch(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                title={language === "th" ? "ค้นหา (⌘K)" : "Search (⌘K)"}
              >
                <Search className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 hidden lg:inline">
                  {language === "th" ? "ค้นหา" : "Search"}
                </span>
                <kbd className="hidden xl:inline text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile search button - icon only */}
              <button
                onClick={() => setShowQuickSearch(true)}
                className="sm:hidden p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={language === "th" ? "ค้นหา" : "Search"}
              >
                <Search className="h-4 w-4 text-gray-500" />
              </button>

              <Button
                variant={density === "compact" ? "weekViewClicked" : "weekView"}
                onClick={() => setIsCompactModalOpen(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-1 text-xs sm:text-sm"
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
        <div className="flex gap-2 flex-1 min-h-0 relative">
          {/* Teacher Filters - Only show for day view - Responsive */}
          {viewMode === "day" && showTeacherFilter && (
            <div
              className="fixed sm:relative z-30 inset-0 sm:inset-auto bg-black/50 sm:bg-transparent flex sm:block"
              onClick={(e) => {
                // Close when clicking backdrop (only on mobile)
                if (e.target === e.currentTarget && window.innerWidth < 640) {
                  setShowTeacherFilter(false);
                }
              }}
            >
              <div className="w-72 sm:w-40 md:w-44 lg:w-48 bg-white border-r sm:border border-gray-200 sm:rounded-lg flex flex-col flex-shrink-0 mr-auto sm:ml-0 shadow-2xl sm:shadow-sm h-full sm:h-auto max-h-screen sm:max-h-[calc(100vh-180px)] overflow-hidden">
                {/* Mini Calendar - ปฏิทินเล็กข้างซ้าย - Theme Colors */}
                <div
                  className="p-2 border-b border-gray-200"
                  style={{
                    background: `linear-gradient(135deg, ${colors.blueLogo}15 0%, ${colors.yellowLogo}25 100%)`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCurrentDate(newDate.toISOString().split("T")[0]);
                      }}
                      className="p-0.5 hover:bg-white/60 rounded transition-colors active:scale-95"
                      style={{ color: colors.blueLogo }}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <h3
                      className="text-[10px] sm:text-xs font-bold"
                      style={{ color: colors.blueLogo }}
                    >
                      {new Date(currentDate).toLocaleDateString(
                        language === "th" ? "th-TH" : "en-US",
                        { month: "short", year: "numeric" }
                      )}
                    </h3>
                    <button
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCurrentDate(newDate.toISOString().split("T")[0]);
                      }}
                      className="p-0.5 hover:bg-white/60 rounded transition-colors active:scale-95"
                      style={{ color: colors.blueLogo }}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-0.5 text-center">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                      <div
                        key={idx}
                        className="text-[8px] sm:text-[9px] font-semibold py-0.5"
                        style={{ color: colors.blueLogo }}
                      >
                        {day}
                      </div>
                    ))}
                    {(() => {
                      const date = new Date(currentDate);
                      const year = date.getFullYear();
                      const month = date.getMonth();
                      const firstDay = new Date(year, month, 1).getDay();
                      const daysInMonth = new Date(
                        year,
                        month + 1,
                        0
                      ).getDate();
                      const today = new Date().toISOString().split("T")[0];
                      const selected = currentDate;

                      const days = [];
                      // Empty cells before first day
                      for (let i = 0; i < firstDay; i++) {
                        days.push(
                          <div
                            key={`empty-${i}`}
                            className="text-[8px] sm:text-[9px] py-0.5"
                          />
                        );
                      }
                      // Days of month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const dateStr = `${year}-${String(month + 1).padStart(
                          2,
                          "0"
                        )}-${String(day).padStart(2, "0")}`;
                        const isToday = dateStr === today;
                        const isSelected = dateStr === selected;
                        days.push(
                          <button
                            key={day}
                            onClick={() => setCurrentDate(dateStr)}
                            className={`text-[8px] sm:text-[9px] py-0.5 rounded transition-all duration-200 ${
                              isSelected
                                ? "font-bold shadow-sm scale-105"
                                : isToday
                                ? "font-semibold ring-1"
                                : "text-gray-700 hover:bg-white/50"
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? colors.blueLogo
                                : isToday
                                ? colors.yellowLogo
                                : undefined,
                              color: isSelected
                                ? "#ffffff"
                                : isToday
                                ? colors.blueLogo
                                : undefined,
                              outline: isToday
                                ? `2px solid ${colors.blueLogo}`
                                : undefined,
                            }}
                          >
                            {day}
                          </button>
                        );
                      }
                      return days;
                    })()}
                  </div>
                </div>

                {/* Header with close button */}
                <div
                  className="flex items-center justify-between px-2 py-1.5 border-b bg-white"
                  style={{ borderColor: colors.blueLogo }}
                >
                  <h2
                    className="font-bold text-[10px] sm:text-xs"
                    style={{ color: colors.blueLogo }}
                  >
                    {t.SelectTeachers}
                  </h2>
                  <button
                    onClick={() => setShowTeacherFilter(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors sm:hidden active:scale-95"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                <div className="px-2 py-1.5 flex gap-1">
                  <Button
                    variant="monthView"
                    onClick={selectAllTeachers}
                    className="text-[8px] sm:text-[9px] rounded-md flex-1 px-1 py-0.5 h-5 sm:h-6"
                  >
                    {t.selectAllTeachers}
                  </Button>
                  <Button
                    variant="monthView"
                    onClick={clearSelection}
                    className="text-[8px] sm:text-[9px] rounded-md flex-1 px-1 py-0.5 h-5 sm:h-6"
                  >
                    {t.clearSelection}
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-2">
                  {teachers.length === 0 ? (
                    <p className="text-[10px] text-gray-500 text-center py-2">
                      {t.noScheduleData}
                    </p>
                  ) : (
                    teachers.map((teacher) => (
                      <label
                        key={teacher.id}
                        className="flex items-center space-x-1 p-1 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeachers.includes(teacher.id)}
                          onChange={() => toggleTeacher(teacher.id)}
                          className="h-2.5 w-2.5 rounded focus:ring-0 flex-shrink-0"
                          style={{ accentColor: colors.yellowLogo }}
                        />
                        {/* Branch color indicator */}
                        <div
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getBranchColorByTeacher(
                            teacher
                          )}`}
                        />
                        <div className="min-w-0 flex-1">
                          <span
                            className="text-[10px] font-medium block truncate"
                            style={{ color: colors.blueLogo }}
                          >
                            T.{" "}
                            {teacher.name.nickname_en || teacher.name.first_en}
                          </span>
                          <p className="text-[8px] text-gray-600">
                            {teacher.sessions.length}{" "}
                            {language === "th" ? "ครั้ง" : "sessions"}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Toggle Teacher Filter Button - Mobile Only - Theme Colors */}
          {viewMode === "day" && !showTeacherFilter && (
            <button
              onClick={() => setShowTeacherFilter(true)}
              className="fixed bottom-20 left-4 sm:hidden z-40 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
              style={{
                backgroundColor: colors.blueLogo,
              }}
              aria-label="Show Teacher Filter"
            >
              <Users className="h-5 w-5" />
            </button>
          )}

          {/* Calendar Content - Responsive & Scrollable */}
          <div
            className={`flex-1 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg relative min-w-0 min-h-0 overflow-hidden`}
          >
            {loading ? (
              <CalendarLoading view={viewMode} />
            ) : error ? (
              <div className="h-full flex items-center justify-center p-4">
                <ErrorMessage message={error} onRetry={fetchData} />
              </div>
            ) : viewMode === "day" ? (
              /* Day View - Ultra Compact Full View - Responsive */
              <div className="h-full relative min-h-0 overflow-hidden">
                {/* Full view container - responsive scroll */}
                <div
                  ref={scrollContainerRef}
                  className="h-full w-full relative z-0 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                >
                  <div className="relative h-full w-full min-w-[600px] sm:min-w-full">
                    {/* Current Time Line - spans across entire table width */}
                    <div
                      className="absolute left-0 right-0 z-40 pointer-events-none"
                      style={{
                        top: `${
                          28 +
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
                            const pixelsPerSlot = 20; // Reduced for ultra compact

                            return (minutesFromStart / 30) * pixelsPerSlot;
                          })()
                        }px`,
                      }}
                    >
                      <div className="relative">
                        <div className="h-px bg-red-500 shadow-sm"></div>
                        <div className="absolute -left-0.5 -top-0.5 w-1 h-1 bg-red-500 rounded-full"></div>
                        <div className="absolute -right-0.5 -top-0.5 w-1 h-1 bg-red-500 rounded-full"></div>
                        {/* Time label */}
                        <div className="absolute -top-4 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-[7px] sm:text-[8px] font-bold shadow-sm">
                          {currentTime.hour.toString().padStart(2, "0")}:
                          {currentTime.minute.toString().padStart(2, "0")}
                        </div>
                      </div>
                    </div>

                    <table
                      className="w-full text-[9px] sm:text-[10px] border-collapse relative"
                      style={{ tableLayout: "fixed" }}
                    >
                      {/* thead with branch groups - Responsive */}
                      <thead className="sticky top-0 z-30 text-white shadow-sm sm:shadow-md">
                        {/* Branch header row */}
                        <tr className="relative h-[16px] sm:h-[18px]">
                          {/* คอลัมน์เวลา - sticky ด้านซ้ายเท่านั้น */}
                          <th
                            className="
                              text-center font-bold text-white
                              bg-gradient-to-br from-indigo-600 to-purple-700
                              border border-gray-300
                              text-[7px] sm:text-[8px]
                              sticky left-0
                              z-40
                              shadow-sm sm:shadow-md
                              px-0
                            "
                            style={{
                              width: "28px",
                              minWidth: "28px",
                              maxWidth: "28px",
                            }}
                            rowSpan={2}
                          >
                            {t.time}
                          </th>

                          {/* Branch group headers */}
                          {filteredTeachers.length === 0 ? (
                            <th className="relative text-center font-bold text-white bg-gray-400 border border-gray-300 p-0.5 text-[8px] sm:text-[9px]">
                              {t.noScheduleData}
                            </th>
                          ) : (
                            teachersByBranch.map(([branchId, teachers]) => {
                              const branchIdNum = parseInt(branchId);
                              let branchBgColor = "bg-gray-500";
                              let branchName = "Unknown";

                              if (branchIdNum === 1) {
                                branchBgColor = "bg-[#334293]";
                                branchName = "B1";
                              } else if (branchIdNum === 2) {
                                branchBgColor = "bg-[#EFE957]";
                                branchName = "B3";
                              } else if (branchIdNum === 3) {
                                branchBgColor = "bg-[#58B2FF]";
                                branchName = "OL";
                              } else if (branchIdNum === 4) {
                                branchBgColor = "bg-[#FF90B3]";
                                branchName = "CH";
                              } else if (branchIdNum === 0) {
                                branchBgColor = "bg-gray-500";
                                branchName = "NA";
                              }

                              return (
                                <th
                                  key={branchId}
                                  colSpan={teachers.length}
                                  className={`
                                    sticky top-0
                                    text-center font-bold text-white
                                    border border-white
                                    text-[7px] sm:text-[8px]
                                    ${branchBgColor}
                                    px-0
                                  `}
                                >
                                  <div className="p-0.5 flex items-center justify-center gap-0.5">
                                    <div
                                      className={`w-1 h-1 rounded-full ${branchBgColor} border border-white`}
                                    />
                                    <span className="hidden sm:inline">
                                      {branchName}
                                    </span>
                                    <span className="sm:hidden">
                                      {branchName.substring(0, 2)}
                                    </span>
                                    <span className="text-[6px] sm:text-[7px] opacity-75">
                                      ({teachers.length})
                                    </span>
                                  </div>
                                </th>
                              );
                            })
                          )}
                        </tr>

                        {/* Teacher names row - Responsive */}
                        <tr className="relative h-[14px] sm:h-[16px]">
                          {filteredTeachers.length > 0 &&
                            teachersByBranch.map(([, teachers]) =>
                              teachers.map((teacher) => (
                                <th
                                  key={teacher.id}
                                  className="
                                    sticky top-[16px] sm:top-[18px]
                                    text-center font-bold text-white
                                    border border-gray-300
                                    text-[6px] sm:text-[7px] w-[40px] sm:w-[45px]
                                    bg-gradient-to-br from-indigo-600 to-purple-700
                                    px-0
                                  "
                                >
                                  <div
                                    className="p-0.5 truncate"
                                    title={
                                      teacher.name.nickname_en ||
                                      teacher.name.first_en
                                    }
                                  >
                                    {(
                                      teacher.name.nickname_en ||
                                      teacher.name.first_en
                                    ).substring(0, 5)}
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
                              className="text-center p-3 sm:p-4 text-gray-500 text-xs"
                            >
                              {t.noScheduleData}
                            </td>
                          </tr>
                        ) : (
                          timeSlots.map((timeSlot) => (
                            <tr
                              key={`${timeSlot.hour}-${timeSlot.minute}`}
                              className="h-5"
                            >
                              {/* เวลา - sticky ด้านซ้าย - Responsive */}
                              <td
                                className="
                                font-medium text-gray-700 bg-gray-50 text-[6px] sm:text-[7px]
                                border border-gray-300 text-center p-0
                                sticky left-0 z-30 shadow-sm
                              "
                              >
                                {timeSlot.label}
                              </td>

                              {/* ตารางครู - grouped by branch - Responsive */}
                              {teachersByBranch.flatMap(([, teachers]) =>
                                teachers.map((teacher) => {
                                  const session = teacher.sessions.find((s) => {
                                    const [startHour, startMinute] =
                                      s.start_time.split(":").map(Number);
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
                                    const isBeingDragged =
                                      draggedSession?.id === session.id;

                                    return (
                                      <td
                                        key={teacher.id}
                                        rowSpan={rowSpan}
                                        className="p-0 border border-gray-300 align-top relative"
                                        onDragOver={(e) =>
                                          handleCellDragOver(
                                            e,
                                            teacher.id,
                                            timeSlot
                                          )
                                        }
                                        onDragLeave={handleCellDragLeave}
                                        onDrop={(e) =>
                                          handleCellDrop(
                                            e,
                                            teacher.id,
                                            timeSlot
                                          )
                                        }
                                      >
                                        <motion.div
                                          draggable
                                          onDragStart={(e) => {
                                            handleSessionDragStart(session);
                                            (
                                              e.target as HTMLElement
                                            ).style.cursor = "grabbing";
                                          }}
                                          onDragEnd={(e) => {
                                            setDraggedSession(null);
                                            (
                                              e.target as HTMLElement
                                            ).style.cursor = "grab";
                                          }}
                                          className={`w-full h-full p-0.5 rounded cursor-grab transition-all duration-200
                                        shadow-sm hover:shadow-md overflow-hidden relative z-10 flex flex-col ${
                                          isBeingDragged
                                            ? "opacity-50"
                                            : "opacity-100"
                                        }`}
                                          style={{
                                            height: `${rowSpan * 20 - 4}px`,
                                            borderLeft: `3px solid ${getBranchBorderColorFromSession(
                                              session
                                            )}`,
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSessionClick(session);
                                          }}
                                          whileHover={{ scale: 1.01 }}
                                          whileTap={{ scale: 0.99 }}
                                          initial={{ opacity: 0, y: -5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.15 }}
                                        >
                                          <div className="space-y-0 leading-tight">
                                            {/* Time Display - Responsive */}
                                            <div className="flex items-center gap-0.5">
                                              <div className="w-0.5 h-0.5 rounded-full bg-indigo-500"></div>
                                              <p className="font-medium text-[5px] sm:text-[6px] text-indigo-700 truncate">
                                                {session.start_time.substring(
                                                  0,
                                                  5
                                                )}
                                              </p>
                                            </div>

                                            {/* Course/Schedule Name - Responsive */}
                                            {session.schedule_name && (
                                              <p
                                                className="font-semibold text-[5px] sm:text-[6px] text-gray-900 whitespace-normal break-words line-clamp-2"
                                                title={session.schedule_name}
                                              >
                                                {session.schedule_name.length >
                                                10
                                                  ? session.schedule_name.substring(
                                                      0,
                                                      10
                                                    ) + "..."
                                                  : session.schedule_name}
                                              </p>
                                            )}

                                            {/* Session Number - Responsive */}
                                            <p className="font-medium text-[5px] sm:text-[6px] text-gray-700">
                                              #{session.session_number}
                                            </p>

                                            {/* Room Info - only show icon if space allows */}
                                            {session.room?.name &&
                                              rowSpan > 3 && (
                                                <div className="flex items-center gap-0.5">
                                                  <svg
                                                    className="w-1.5 h-1.5 text-gray-500 flex-shrink-0"
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
                                                  </svg>
                                                  <p className="text-[6px] text-gray-600 truncate">
                                                    {session.room.name.substring(
                                                      0,
                                                      3
                                                    )}
                                                  </p>
                                                </div>
                                              )}

                                            {/* Status Badge - only if space */}
                                            {rowSpan > 4 && (
                                              <div className="flex items-center gap-0.5">
                                                <span
                                                  className={`inline-block px-0.5 py-0 rounded-full text-[5px] font-medium ${
                                                    session.status ===
                                                    "scheduled"
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
                                                  {session.status ===
                                                    "scheduled" && "S"}
                                                  {session.status ===
                                                    "completed" && "C"}
                                                  {session.status ===
                                                    "cancelled" && "X"}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </motion.div>
                                      </td>
                                    );
                                  }

                                  // เช็คว่า cell นี้ถูกครอบคลุมโดย rowSpan หรือไม่
                                  // ถ้าใช่ ไม่ต้อง render <td> เพราะ cell ถูก covered แล้ว
                                  if (
                                    isCellCoveredBySession(teacher, timeSlot)
                                  ) {
                                    return null;
                                  }

                                  // ช่องว่าง
                                  const isDropTarget =
                                    dropTarget?.teacherId === teacher.id &&
                                    dropTarget?.timeSlot.hour ===
                                      timeSlot.hour &&
                                    dropTarget?.timeSlot.minute ===
                                      timeSlot.minute;

                                  return (
                                    <td
                                      key={teacher.id}
                                      className={`border border-gray-300 transition-all duration-200 ${
                                        isDropTarget
                                          ? "bg-blue-100 border-blue-400"
                                          : "bg-white hover:bg-gray-50"
                                      } cursor-pointer`}
                                      onClick={() =>
                                        handleEmptyCellClick(
                                          teacher.id,
                                          timeSlot
                                        )
                                      }
                                      onDragOver={(e) =>
                                        handleCellDragOver(
                                          e,
                                          teacher.id,
                                          timeSlot
                                        )
                                      }
                                      onDragLeave={handleCellDragLeave}
                                      onDrop={(e) =>
                                        handleCellDrop(e, teacher.id, timeSlot)
                                      }
                                    >
                                      {isDropTarget && draggedSession ? (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 0.6, scale: 1 }}
                                          className="w-full h-5 p-0.5 rounded bg-blue-100 border border-dashed border-blue-400 flex items-center justify-center"
                                        >
                                          <span className="text-[6px] text-blue-700 font-medium">
                                            +
                                          </span>
                                        </motion.div>
                                      ) : (
                                        <div className="w-full h-5 flex items-center justify-center">
                                          <div className="w-3 h-3 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                                            <span className="text-[7px] text-gray-400 hover:text-blue-600">
                                              +
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                  );
                                })
                              )}
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
                onSessionClick={handleMonthSessionClick}
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
          onUpdate={fetchData}
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
          scheduleForm={scheduleForm}
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

      {/* Move Session Confirmation Modal */}
      <AnimatePresence>
        {showMoveConfirm && moveSessionData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleCancelMoveSession}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <div className="flex-1 max-h-[70vh] overflow-y-auto">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {language === "th"
                      ? "ยืนยันการย้ายคาบเรียน"
                      : "Confirm Move Session"}
                  </h3>

                  {/* Course Name */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-800">
                      {moveSessionData.session.schedule_name}
                    </p>
                  </div>

                  {/* Time Change */}
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">
                        {language === "th" ? "เวลาเดิม:" : "Current Time:"}
                      </span>
                      <span className="text-indigo-600 font-medium">
                        {moveSessionData.session.start_time.substring(0, 5)} -{" "}
                        {moveSessionData.session.end_time.substring(0, 5)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">
                        {language === "th" ? "เวลาใหม่:" : "New Time:"}
                      </span>
                      <span className="text-green-600 font-medium">
                        {`${moveSessionData.newTime.hour
                          .toString()
                          .padStart(2, "0")}:${moveSessionData.newTime.minute
                          .toString()
                          .padStart(2, "0")}`}
                      </span>
                    </div>
                  </div>

                  {/* Teacher Change */}
                  {moveSessionData.sessionDetail?.oldTeacher && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                        {language === "th" ? "ครู" : "Teacher"}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">
                            {language === "th" ? "เดิม:" : "Current:"}
                          </span>{" "}
                          <span className="font-medium">
                            {moveSessionData.sessionDetail.oldTeacher
                              .teacher_profile?.nickname_en ||
                              moveSessionData.sessionDetail.oldTeacher.username}
                          </span>
                          {moveSessionData.sessionDetail.oldTeacher
                            .teacher_profile && (
                            <p className="text-xs text-gray-500 mt-1">
                              {
                                moveSessionData.sessionDetail.oldTeacher
                                  .teacher_profile.first_name_en
                              }{" "}
                              {
                                moveSessionData.sessionDetail.oldTeacher
                                  .teacher_profile.last_name_en
                              }
                              {moveSessionData.sessionDetail.oldTeacher
                                .teacher_profile.specializations && (
                                <span className="ml-2 text-blue-600">
                                  •{" "}
                                  {
                                    moveSessionData.sessionDetail.oldTeacher
                                      .teacher_profile.specializations
                                  }
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        {moveSessionData.sessionDetail.newTeacher && (
                          <div>
                            <span className="text-gray-600">
                              {language === "th" ? "ใหม่:" : "New:"}
                            </span>{" "}
                            <span className="font-medium text-green-600">
                              {moveSessionData.sessionDetail.newTeacher
                                .teacher_profile?.nickname_en ||
                                moveSessionData.sessionDetail.newTeacher
                                  .username}
                            </span>
                            {moveSessionData.sessionDetail.newTeacher
                              .teacher_profile && (
                              <p className="text-xs text-gray-500 mt-1">
                                {
                                  moveSessionData.sessionDetail.newTeacher
                                    .teacher_profile.first_name_en
                                }{" "}
                                {
                                  moveSessionData.sessionDetail.newTeacher
                                    .teacher_profile.last_name_en
                                }
                                {moveSessionData.sessionDetail.newTeacher
                                  .teacher_profile.specializations && (
                                  <span className="ml-2 text-green-600">
                                    •{" "}
                                    {
                                      moveSessionData.sessionDetail.newTeacher
                                        .teacher_profile.specializations
                                    }
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Students */}
                  {moveSessionData.sessionDetail?.students &&
                    moveSessionData.sessionDetail.students.length > 0 && (
                      <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                          {language === "th" ? "นักเรียน" : "Students"} (
                          {moveSessionData.sessionDetail.students.length})
                        </h4>
                        <div className="space-y-2 text-xs">
                          {moveSessionData.sessionDetail.students.map(
                            (student, idx) => {
                              const isAdmin =
                                user?.role === "admin" ||
                                user?.role === "owner";
                              const isTeacher = user?.role === "teacher";

                              return (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 p-2 bg-white rounded border border-amber-200"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {student.nickname_th ||
                                        student.nickname_en ||
                                        student.first_name}
                                    </p>
                                    {isTeacher ? (
                                      // Teacher sees limited info
                                      <div className="text-gray-600 mt-1 space-y-0.5">
                                        {student.date_of_birth && (
                                          <p>
                                            {language === "th"
                                              ? "วันเกิด:"
                                              : "DOB:"}{" "}
                                            {new Date(
                                              student.date_of_birth
                                            ).toLocaleDateString(
                                              language === "th"
                                                ? "th-TH"
                                                : "en-US"
                                            )}
                                          </p>
                                        )}
                                        {student.age > 0 && (
                                          <p>
                                            {language === "th"
                                              ? "อายุ:"
                                              : "Age:"}{" "}
                                            {student.age}{" "}
                                            {language === "th" ? "ปี" : "years"}
                                          </p>
                                        )}
                                        {student.user_branch && (
                                          <p>
                                            {language === "th"
                                              ? "สาขา:"
                                              : "Branch:"}{" "}
                                            {language === "th"
                                              ? student.user_branch.name_th
                                              : student.user_branch.name_en}
                                          </p>
                                        )}
                                      </div>
                                    ) : isAdmin ? (
                                      // Admin sees full info
                                      <div className="text-gray-600 mt-1 space-y-0.5">
                                        <p>
                                          {student.first_name_en ||
                                            student.first_name}{" "}
                                          {student.last_name_en ||
                                            student.last_name}
                                        </p>
                                        {student.email && (
                                          <p>📧 {student.email}</p>
                                        )}
                                        {student.phone && (
                                          <p>📞 {student.phone}</p>
                                        )}
                                        {student.line_id && (
                                          <p>💬 LINE: {student.line_id}</p>
                                        )}
                                        {student.date_of_birth && (
                                          <p>
                                            🎂{" "}
                                            {new Date(
                                              student.date_of_birth
                                            ).toLocaleDateString(
                                              language === "th"
                                                ? "th-TH"
                                                : "en-US"
                                            )}
                                            {student.age > 0 &&
                                              ` (${student.age} ${
                                                language === "th"
                                                  ? "ปี"
                                                  : "years"
                                              })`}
                                          </p>
                                        )}
                                        {student.age_group && (
                                          <p>👥 {student.age_group}</p>
                                        )}
                                        {student.user_branch && (
                                          <p>
                                            🏢{" "}
                                            {language === "th"
                                              ? student.user_branch.name_th
                                              : student.user_branch.name_en}
                                          </p>
                                        )}
                                        {student.recent_cefr && (
                                          <p className="text-blue-600 font-medium">
                                            📊 CEFR: {student.recent_cefr}
                                          </p>
                                        )}
                                        <p className="flex gap-2">
                                          <span
                                            className={`px-2 py-0.5 rounded ${
                                              student.payment_status === "paid"
                                                ? "bg-green-100 text-green-700"
                                                : student.payment_status ===
                                                  "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                          >
                                            {student.payment_status}
                                          </span>
                                          <span
                                            className={`px-2 py-0.5 rounded ${
                                              student.registration_status ===
                                              "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}
                                          >
                                            {student.registration_status}
                                          </span>
                                        </p>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                  <p className="text-gray-500 text-sm mt-4">
                    {language === "th"
                      ? "ต้องการย้ายคาบเรียนนี้ไปยังเวลาและครูใหม่หรือไม่?"
                      : "Do you want to move this session to the new time and teacher?"}
                  </p>
                </div>
                <div className="flex-shrink-0 mt-4">
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelMoveSession}
                      className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      {language === "th" ? "ยกเลิก" : "Cancel"}
                    </button>
                    <button
                      onClick={handleConfirmMoveSession}
                      className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
                    >
                      {language === "th" ? "ยืนยัน" : "Confirm"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-6 z-20 flex flex-col gap-3">
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

      {/* Quick Search Modal */}
      {showQuickSearch && (
        <QuickSearch
          sessions={allSessions}
          onSelectSession={(session) => {
            // Navigate to the session's date and open detail modal
            setCurrentDate(session.session_date);
            setViewMode("day");
            setSelectedSession(session.id);
            setIsDetailModalOpen(true);
            setShowQuickSearch(false);
          }}
          onClose={() => setShowQuickSearch(false)}
        />
      )}
    </SidebarLayout>
  );
}
