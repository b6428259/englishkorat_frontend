import { PrinterIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { JSX, useEffect, useRef } from "react";

type Session = {
  id: number;
  start_time: string;
  end_time: string;
  schedule_name?: string;
  session_number?: number;
  status?: string;
  room?: {
    name?: string;
  };
};

type Name = {
  nickname_en?: string;
  first_en?: string;
};

type Branch = {
  id?: number;
  name_en?: string;
};

type Teacher = {
  id: string | number;
  name: Name;
  sessions: Session[];
  branch: Branch;
};

type Props = {
  date: string | Date;
  teachers: Teacher[];
  onClose: () => void;
};

export default function CompactDayViewModal({
  date,
  teachers,
  onClose,
}: Props): JSX.Element {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ปิด scroll ของ body ตอน modal เปิด
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Close on Escape for better accessibility
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Time slots (08:00 - 22:00 every hour for compact view)
  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // Ensure date is rendered as a string for React
  const formattedDate =
    typeof date === "string" ? date : date.toLocaleDateString();

  const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      onClose();
    }
  };

  // Group teachers by branch
  const getBranchColor = (branchId: number): string => {
    if (branchId === 1) return "bg-[#334293]";
    if (branchId === 2) return "bg-[#EFE957]";
    if (branchId === 3) return "bg-[#58B2FF]";
    if (branchId === 4) return "bg-[#FF90B3]";
    return "bg-gray-400";
  };

  const getBranchName = (branchId: number): string => {
    if (branchId === 1) return "Branch 1";
    if (branchId === 2) return "Branch 3";
    if (branchId === 3) return "Online";
    if (branchId === 4) return "Chinese";
    return "Other";
  };

  // Group teachers by branch
  const teachersByBranch = teachers.reduce((acc, teacher) => {
    const branchId = teacher.branch?.id || 0;
    if (!acc[branchId]) acc[branchId] = [];
    acc[branchId].push(teacher);
    return acc;
  }, {} as Record<number, Teacher[]>);

  const sortedBranches = Object.entries(teachersByBranch).sort(([a], [b]) => {
    const order = [1, 2, 3, 4, 0];
    return order.indexOf(Number(a)) - order.indexOf(Number(b));
  });

  // Check if teacher has session at time
  const hasSessionAtTime = (teacher: Teacher, time: string): Session | null => {
    const [hour] = time.split(":").map(Number);
    return (
      teacher.sessions.find((s) => {
        const [startHour] = s.start_time.split(":").map(Number);
        const [endHour] = s.end_time.split(":").map(Number);
        return hour >= startHour && hour < endHour;
      }) || null
    );
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content,
          #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-40 flex items-center justify-center">
        {/* พื้นหลังมืด */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Close modal"
          className="absolute inset-0 bg-black/60 backdrop-blur-sm no-print"
          onClick={onClose}
          onKeyDown={handleOverlayKeyDown}
        ></div>

        {/* Modal Content - Responsive */}
        <div className="relative bg-white rounded-lg shadow-2xl w-[98vw] sm:w-[96vw] h-[96vh] sm:h-[94vh] flex flex-col overflow-hidden">
          {/* Header - Compact and Responsive */}
          <div className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 no-print flex-shrink-0">
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 truncate">
                📅 ตารางเรียนภาพรวม (Schedule Overview)
              </h2>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 truncate">
                วันที่ {formattedDate}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                className="flex items-center gap-1 text-white bg-indigo-600 hover:bg-indigo-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs md:text-sm font-semibold transition-colors"
                onClick={handlePrint}
                aria-label="Print"
              >
                <PrinterIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                className="flex items-center gap-1 text-white bg-red-500 hover:bg-red-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs md:text-sm font-semibold transition-colors"
                onClick={onClose}
                aria-label="Close modal"
              >
                <XMarkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Print Content - NO SCROLL, FIT EVERYTHING */}
          <div
            id="print-content"
            ref={printRef}
            className="flex-1 flex flex-col p-2 sm:p-3 bg-gray-50 overflow-hidden"
          >
            <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Ultra-compact table - scale to fit all content */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-hidden">
                  <table className="w-full h-full border-collapse text-[6px] sm:text-[7px] md:text-[8px]">
                    <thead>
                      {/* Branch row */}
                      <tr style={{ height: "18px" }}>
                        <th
                          rowSpan={2}
                          className="border border-gray-400 px-0.5 py-0.5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-bold"
                          style={{ width: "35px", minWidth: "35px" }}
                        >
                          <div className="text-[7px] sm:text-[8px]">Time</div>
                        </th>
                        {sortedBranches.map(([branchId, branchTeachers]) => (
                          <th
                            key={branchId}
                            colSpan={branchTeachers.length}
                            className={`border border-white text-white font-bold px-0.5 py-0.5 ${getBranchColor(
                              Number(branchId)
                            )}`}
                          >
                            <div className="text-[7px] sm:text-[8px] truncate">
                              {getBranchName(Number(branchId))} (
                              {branchTeachers.length})
                            </div>
                          </th>
                        ))}
                      </tr>
                      {/* Teacher row */}
                      <tr style={{ height: "16px" }}>
                        {sortedBranches.flatMap(([, branchTeachers]) =>
                          branchTeachers.map((teacher) => (
                            <th
                              key={teacher.id}
                              className="border border-gray-400 px-0.5 py-0.5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-semibold"
                              style={{
                                minWidth: "45px",
                                maxWidth: "80px",
                                width: `${Math.max(
                                  45,
                                  Math.min(80, 400 / teachers.length)
                                )}px`,
                              }}
                            >
                              <div className="text-[6px] sm:text-[7px] truncate leading-tight">
                                {teacher.name.nickname_en ||
                                  teacher.name.first_en}
                              </div>
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((time, idx) => (
                        <tr
                          key={time}
                          className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                          style={{ height: `${100 / timeSlots.length}%` }}
                        >
                          <td className="border border-gray-400 px-0.5 py-0 text-center font-semibold text-gray-700 bg-gray-100">
                            <div className="text-[6px] sm:text-[7px] leading-tight">
                              {time}
                            </div>
                          </td>
                          {sortedBranches.flatMap(([, branchTeachers]) =>
                            branchTeachers.map((teacher) => {
                              const session = hasSessionAtTime(teacher, time);
                              return (
                                <td
                                  key={teacher.id}
                                  className={`border border-gray-300 px-0.5 py-0 ${
                                    session
                                      ? "bg-gradient-to-br from-blue-100 to-indigo-100"
                                      : ""
                                  }`}
                                >
                                  {session && (
                                    <div className="leading-none">
                                      <div className="font-bold text-gray-900 truncate text-[5px] sm:text-[6px]">
                                        {session.schedule_name || "Class"}
                                      </div>
                                      <div className="text-[4px] sm:text-[5px] text-gray-600 truncate mt-0.5">
                                        #{session.session_number || "-"}
                                        {session.room?.name &&
                                          ` • ${session.room.name}`}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            })
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary - Compact */}
              <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-300 no-print flex-shrink-0">
                <div className="flex flex-wrap gap-2 sm:gap-3 text-[7px] sm:text-[8px] text-gray-700">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Teachers:</span>
                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
                      {teachers.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Sessions:</span>
                    <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                      {teachers.reduce(
                        (sum, t) => sum + (t.sessions?.length || 0),
                        0
                      )}
                    </span>
                  </div>
                  {sortedBranches.map(([branchId, branchTeachers]) => (
                    <div key={branchId} className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${getBranchColor(
                          Number(branchId)
                        )}`}
                      ></span>
                      <span className="font-semibold">
                        {getBranchName(Number(branchId))}:
                      </span>
                      <span className="font-bold">{branchTeachers.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
