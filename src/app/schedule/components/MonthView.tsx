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

const branchColors: Record<string, string> = {
  "Branch 1 The Mall Branch": "bg-indigo-500",
  Online: "bg-indigo-400",
  "Branch 3": "bg-indigo-600",
};

const branchColorLight: Record<string, string> = {
  "Branch 1 The Mall Branch": "bg-indigo-50 border-indigo-200",
  Online: "bg-indigo-50 border-indigo-200",
  "Branch 3": "bg-indigo-50 border-indigo-200",
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

  const getBranchColorDot = (branchName: string) => {
    return branchColors[branchName] || "bg-gray-400";
  };

  const getBranchColorLight = (branchName: string) => {
    return branchColorLight[branchName] || "bg-gray-100 border-gray-200";
  };

  // Group sessions by branch for better display
  const getSessionsByBranch = (sessions: CalendarSession[]) => {
    const grouped = sessions.reduce((acc, session) => {
      const branch = session.branch_name;
      if (!acc[branch]) acc[branch] = [];
      acc[branch].push(session);
      return acc;
    }, {} as Record<string, CalendarSession[]>);

    return grouped;
  };

  const pad = density === "compact" ? "p-2" : "p-3";
  const gap = density === "compact" ? "gap-1.5" : "gap-2";

  return (
    <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Week day headers (tone aligned with WeekView) */}
      <div
        className={`grid grid-cols-7 ${gap} p-4 pb-2 sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200`}
      >
        {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((day, index) => (
          <div
            key={day}
            className={`text-center font-bold text-sm py-2 rounded-lg tracking-wide ${
              index === 5 || index === 6
                ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Responsive and scrollable */}
      <div className="flex-1 overflow-auto">
        {/* Dynamic grid based on number of days */}
        <div
          className={`grid ${gap} p-4 min-h-full`}
          style={{
            gridTemplateColumns: `repeat(${Math.min(
              7,
              calendarGrid.filter(Boolean).length
            )}, minmax(120px, 1fr))`,
          }}
        >
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
                className={`min-h-[120px] ${pad} rounded-xl cursor-pointer transition-all duration-200 hover:shadow-xl border-2 relative ${
                  isToday
                    ? "bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-400 shadow-lg"
                    : dayData.is_holiday
                    ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200"
                    : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300"
                }`}
                onClick={() => onDayClick?.(date)}
              >
                {/* Day Number */}
                <div
                  className={`text-right mb-1 ${
                    isCurrentMonth
                      ? isToday
                        ? "text-[#334293] font-bold text-lg"
                        : dayData.is_holiday
                        ? "text-red-600 font-semibold"
                        : "text-gray-900 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {day}
                </div>

                {/* Holiday indicator */}
                {dayData.is_holiday &&
                  dayData.holiday_info &&
                  isCurrentMonth && (
                    <div className="text-[10px] text-red-600 mb-1 truncate font-medium">
                      🎌{" "}
                      {(dayData.holiday_info as { name?: string })?.name ||
                        "Holiday"}
                    </div>
                  )}

                {/* Sessions */}
                {isCurrentMonth && dayData.sessions.length > 0 && (
                  <div className="space-y-1 overflow-hidden">
                    {Object.entries(sessionsByBranch)
                      .slice(0, 3)
                      .map(([branchName, branchSessions]) => (
                        <div key={branchName} className="space-y-0.5">
                          {branchSessions.slice(0, 2).map((session) => (
                            <div
                              key={session.id}
                              className={`text-[10px] p-1 rounded border cursor-pointer hover:shadow-sm transition-all ${getBranchColorLight(
                                branchName
                              )}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSessionClick(session);
                              }}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-bold text-gray-800 truncate flex-1">
                                  {formatTime(session.start_time)}
                                </span>
                                <div
                                  className={`w-2 h-2 rounded-full ml-1 ${getBranchColorDot(
                                    branchName
                                  )}`}
                                ></div>
                              </div>

                              <div className="text-gray-700 font-medium truncate">
                                {session.schedule_name}
                              </div>

                              {session.teacher_name && (
                                <div className="text-gray-600 truncate">
                                  👩‍🏫 {session.teacher_name}
                                </div>
                              )}

                              {session.students &&
                                session.students.length > 0 && (
                                  <div className="text-gray-600">
                                    👥 {session.students.length}
                                  </div>
                                )}

                              {/* Show participants for non-class schedules with status colors */}
                              {session.participants &&
                                session.participants.length > 0 && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-gray-600 text-[9px]">
                                      👤
                                    </span>
                                    <div className="flex gap-0.5">
                                      {session.participants
                                        .slice(0, 3)
                                        .map((participant) => (
                                          <div
                                            key={participant.user_id}
                                            className={`w-1.5 h-1.5 rounded-full ${
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
                                            title={`${participant.user.username} - ${participant.status}`}
                                          />
                                        ))}
                                      {session.participants.length > 3 && (
                                        <span className="text-gray-500 text-[8px] ml-0.5">
                                          +{session.participants.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ))}

                          {/* Show remaining sessions count if more than 2 */}
                          {branchSessions.length > 2 && (
                            <div className="text-[10px] text-gray-500 text-center py-0.5">
                              +{branchSessions.length - 2} more
                            </div>
                          )}
                        </div>
                      ))}

                    {/* Show remaining branches count if more than 3 */}
                    {Object.keys(sessionsByBranch).length > 3 && (
                      <div className="text-[10px] text-gray-500 text-center py-0.5 bg-gray-100 rounded">
                        +{Object.keys(sessionsByBranch).length - 3} branches
                      </div>
                    )}
                  </div>
                )}

                {/* Session count indicator for days with many sessions */}
                {isCurrentMonth && dayData.session_count > 0 && (
                  <div className="absolute top-1 left-1">
                    <div
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${
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

                {/* Empty day add button */}
                {isCurrentMonth &&
                  dayData.sessions.length === 0 &&
                  !dayData.is_holiday && (
                    <div className="h-full flex items-center justify-center opacity-0 hover:opacity-60 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center">
                        <span className="text-lg text-indigo-400 hover:text-indigo-600">
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
