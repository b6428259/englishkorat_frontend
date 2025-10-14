"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { CalendarSession } from "@/services/api/schedules";

interface MonthCalendarData {
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

interface MonthViewProps {
  calendarData: MonthCalendarData;
  currentDate: string;
  onSessionClick: (session: CalendarSession) => void;
  onDayClick?: (date: string) => void;
  density?: "comfortable" | "compact";
}

// Helper functions to get branch colors based on teacher's branch_id
const getBranchColorFromTeacher = (
  branchId: number | null
): { dot: string; light: string; text: string } => {
  if (branchId === 1) {
    return {
      dot: "bg-[#334293]",
      light: "bg-[#334293]/10 border-[#334293]",
      text: "text-[#334293]",
    };
  }
  if (branchId === 2) {
    return {
      dot: "bg-[#EFE957]",
      light: "bg-[#EFE957]/20 border-[#EFE957]",
      text: "text-gray-800",
    };
  }
  if (branchId === 3) {
    return {
      dot: "bg-[#58B2FF]",
      light: "bg-[#58B2FF]/10 border-[#58B2FF]",
      text: "text-[#58B2FF]",
    };
  }
  if (branchId === 4) {
    return {
      dot: "bg-[#FF90B3]",
      light: "bg-[#FF90B3]/10 border-[#FF90B3]",
      text: "text-[#FF90B3]",
    };
  }
  return {
    dot: "bg-gray-400",
    light: "bg-gray-100 border-gray-200",
    text: "text-gray-800",
  };
};

export default function MonthView({
  calendarData,
  currentDate,
  onSessionClick,
  onDayClick,
  density = "comfortable",
}: MonthViewProps) {
  const { language } = useLanguage();

  // Generate full month calendar grid starting from day 1 of the month
  const generateCalendarGrid = () => {
    const targetDate = new Date(currentDate);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    // First day of the month
    // const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    const grid = [];

    // Start from day 1 of the month and fill the grid
    for (let day = 1; day <= lastDay.getDate(); day++) {
      // Use consistent date formatting to avoid timezone issues
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const isToday = dateStr === new Date().toISOString().split("T")[0];

      grid.push({
        date: dateStr,
        day: day,
        isCurrentMonth: true,
        isToday,
        dayData: calendarData[dateStr] || {
          date: dateStr,
          day_of_week: "",
          is_holiday: false,
          holiday_info: null,
          sessions: [],
          exceptions: [],
          session_count: 0,
          branch_distribution: {},
        },
      });
    }

    // Pad with empty cells to make complete weeks if needed
    const totalCells = Math.ceil(grid.length / 7) * 7;
    while (grid.length < totalCells) {
      grid.push(null);
    }

    return grid;
  };

  const calendarGrid = generateCalendarGrid();

  // const weekDays = language === 'th'
  //   ? ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
  //   : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    if (language === "th") {
      return `${h.toString().padStart(2, "0")}:${minute}`;
    }
    return `${h % 12 === 0 ? 12 : h % 12}:${minute}${h < 12 ? "am" : "pm"}`;
  };

  // Group sessions by teacher's branch for better display
  const getSessionsByBranch = (sessions: CalendarSession[]) => {
    const grouped = sessions.reduce((acc, session) => {
      const branchId = session.teacher?.branch_id || null;
      const branchKey = branchId ? `branch-${branchId}` : "no-branch";
      if (!acc[branchKey]) acc[branchKey] = [];
      acc[branchKey].push(session);
      return acc;
    }, {} as Record<string, CalendarSession[]>);

    return grouped;
  };

  const pad = density === "compact" ? "p-1.5 sm:p-2" : "p-2 sm:p-3";
  const gap = density === "compact" ? "gap-1 sm:gap-1.5" : "gap-1.5 sm:gap-2";

  return (
    <div className="h-full flex flex-col bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Week day headers - Fully Responsive */}
      <div
        className={`grid grid-cols-7 ${gap} p-2 sm:p-3 lg:p-4 pb-1 sm:pb-2 sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200`}
      >
        {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((day, index) => (
          <div
            key={day}
            className={`text-center font-bold text-xs sm:text-sm py-1.5 sm:py-2 rounded-md sm:rounded-lg tracking-wide ${
              index === 5 || index === 6
                ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Fully Responsive */}
      <div className="flex-1 overflow-auto">
        {/* Responsive grid with better mobile support */}
        <div className={`grid grid-cols-7 ${gap} p-2 sm:p-3 lg:p-4 min-h-full`}>
          {calendarGrid.map((gridDay, index) => {
            // Handle empty cells
            if (!gridDay) {
              return <div key={`empty-${index}`} className="invisible"></div>;
            }

            const { date, day, isCurrentMonth, isToday, dayData } = gridDay;
            const sessionsByBranch = getSessionsByBranch(dayData.sessions);

            return (
              <div
                key={date}
                className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] ${pad} rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 hover:shadow-xl border sm:border-2 relative ${
                  isToday
                    ? "bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-400 shadow-md sm:shadow-lg"
                    : dayData.is_holiday
                    ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200"
                    : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300"
                }`}
                onClick={() => onDayClick?.(date)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onDayClick?.(date);
                  }
                }}
                aria-label={`${day} ${dayData.is_holiday ? "Holiday" : ""} ${
                  dayData.session_count > 0
                    ? `${dayData.session_count} sessions`
                    : ""
                }`}
              >
                {/* Day Number - Responsive */}
                <div
                  className={`text-right mb-0.5 sm:mb-1 ${
                    isCurrentMonth
                      ? isToday
                        ? "text-[#334293] font-bold text-sm sm:text-base lg:text-lg"
                        : dayData.is_holiday
                        ? "text-red-600 font-semibold text-sm sm:text-base"
                        : "text-gray-900 font-medium text-sm sm:text-base"
                      : "text-gray-400 text-sm sm:text-base"
                  }`}
                >
                  {day}
                </div>

                {/* Holiday indicator - Responsive */}
                {dayData.is_holiday &&
                  dayData.holiday_info &&
                  isCurrentMonth && (
                    <div className="text-[9px] sm:text-[10px] text-red-600 mb-0.5 sm:mb-1 truncate font-medium leading-tight">
                      🎌{" "}
                      <span className="hidden sm:inline">
                        {(dayData.holiday_info as { name?: string })?.name ||
                          "Holiday"}
                      </span>
                    </div>
                  )}

                {/* Sessions - Responsive Display */}
                {isCurrentMonth && dayData.sessions.length > 0 && (
                  <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
                    {Object.entries(sessionsByBranch)
                      .slice(0, 3)
                      .map(([branchKey, branchSessions]) => {
                        // Extract branch_id from the first session in this group
                        const firstSession = branchSessions[0];
                        const teacherBranchId =
                          firstSession.teacher?.branch_id || null;
                        const branchColors =
                          getBranchColorFromTeacher(teacherBranchId);

                        return (
                          <div key={branchKey} className="space-y-0.5">
                            {branchSessions.slice(0, 2).map((session) => (
                              <div
                                key={session.id}
                                className={`text-[9px] sm:text-[10px] p-0.5 sm:p-1 rounded border cursor-pointer hover:shadow-sm active:scale-95 transition-all ${branchColors.light}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSessionClick(session);
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onSessionClick(session);
                                  }
                                }}
                              >
                                <div className="flex items-center justify-between mb-0.5">
                                  <span
                                    className={`font-bold truncate flex-1 text-[9px] sm:text-[10px] ${branchColors.text}`}
                                  >
                                    {formatTime(session.start_time)}
                                  </span>
                                  <div
                                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ml-1 flex-shrink-0 ${branchColors.dot}`}
                                  ></div>
                                </div>

                                <div className="text-gray-700 font-medium truncate text-[8px] sm:text-[10px] leading-tight">
                                  {session.schedule_name}
                                </div>

                                {session.teacher_name && (
                                  <div className="text-gray-600 truncate text-[8px] sm:text-[10px] leading-tight hidden sm:block">
                                    👩‍🏫 {session.teacher_name}
                                  </div>
                                )}

                                {session.students &&
                                  session.students.length > 0 && (
                                    <div className="text-gray-600 text-[8px] sm:text-[10px] leading-tight">
                                      👥 {session.students.length}
                                    </div>
                                  )}

                                {/* Show participants for non-class schedules with status colors - Responsive */}
                                {session.participants &&
                                  session.participants.length > 0 && (
                                    <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
                                      <span className="text-gray-600 text-[8px] sm:text-[9px] hidden sm:inline">
                                        👤
                                      </span>
                                      <div className="flex gap-0.5">
                                        {session.participants
                                          .slice(0, 3)
                                          .map((participant, pIndex) => (
                                            <div
                                              key={`${participant.user_id}-${pIndex}`}
                                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                                                participant.status ===
                                                "confirmed"
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
                                        {session.participants.length > 3 && (
                                          <span className="text-gray-500 text-[7px] sm:text-[8px] ml-0.5">
                                            +{session.participants.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}

                            {/* Show remaining sessions count if more than 2 - Responsive */}
                            {branchSessions.length > 2 && (
                              <div className="text-[8px] sm:text-[10px] text-gray-500 text-center py-0.5">
                                +{branchSessions.length - 2}
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* Show remaining branches count if more than 3 - Responsive */}
                    {Object.keys(sessionsByBranch).length > 3 && (
                      <div className="text-[8px] sm:text-[10px] text-gray-500 text-center py-0.5 bg-gray-100 rounded">
                        +{Object.keys(sessionsByBranch).length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Session count indicator - Responsive Badge */}
                {isCurrentMonth && dayData.session_count > 0 && (
                  <div className="absolute top-0.5 sm:top-1 left-0.5 sm:left-1">
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[8px] sm:text-[10px] font-bold flex items-center justify-center text-white shadow-md ${
                        dayData.session_count > 5
                          ? "bg-red-500"
                          : dayData.session_count > 3
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                    >
                      {dayData.session_count > 9 ? "9+" : dayData.session_count}
                    </div>
                  </div>
                )}

                {/* Empty day add button - Responsive Touch Target */}
                {isCurrentMonth &&
                  dayData.sessions.length === 0 &&
                  !dayData.is_holiday && (
                    <div className="h-full flex items-center justify-center opacity-0 hover:opacity-60 active:opacity-80 transition-opacity">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-100 hover:bg-indigo-200 active:bg-indigo-300 flex items-center justify-center transition-colors">
                        <span className="text-base sm:text-lg text-indigo-400 hover:text-indigo-600 font-bold">
                          +
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
