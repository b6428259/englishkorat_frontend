"use client";

import AttendanceStatusBadge from "@/components/attendance/AttendanceStatusBadge";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { attendanceApi } from "@/services/api/attendance";
import type {
  StudentAttendance,
  TeacherAttendance,
} from "@/types/attendance.types";
import { Calendar, Clock, Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface AttendanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "student" | "teacher";
}

export default function AttendanceHistoryModal({
  isOpen,
  onClose,
  type,
}: Readonly<AttendanceHistoryModalProps>) {
  const [attendances, setAttendances] = useState<
    (StudentAttendance | TeacherAttendance)[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Set default date range (last 30 days)
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setEndDate(today.toISOString().split("T")[0]);
      setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const params = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        limit: 50,
        offset: 0,
      };

      if (type === "student") {
        const response = await attendanceApi.getStudentHistory(params);
        setAttendances(response.attendances);
      } else {
        const response = await attendanceApi.getTeacherHistory(params);
        setAttendances(response.attendances);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      toast.error("ไม่สามารถโหลดประวัติการเช็คอินได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    loadHistory();
  };

  const handleReset = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  };

  // Calculate stats
  const stats = {
    total: attendances.length,
    onTime: attendances.filter((a) => a.status === "on-time").length,
    late: attendances.filter((a) => a.status === "late").length,
    present: attendances.filter((a) => a.status === "present").length,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#334293] to-[#4a5ab3] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">ประวัติการเช็คอิน</h2>
              <p className="text-sm text-blue-100 mt-1">
                {type === "student" ? "นักเรียน" : "อาจารย์"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {stats.total}
            </p>
            <p className="text-xs text-gray-600">ทั้งหมด</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {stats.onTime}
            </p>
            <p className="text-xs text-gray-600">ตรงเวลา</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">
              {stats.late}
            </p>
            <p className="text-xs text-gray-600">สาย</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {stats.present}
            </p>
            <p className="text-xs text-gray-600">มาเรียน</p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <label
                htmlFor="startDate"
                className="text-sm font-medium text-gray-700 flex-shrink-0"
              >
                ตั้งแต่:
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#334293] focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 flex-1">
              <label
                htmlFor="endDate"
                className="text-sm font-medium text-gray-700 flex-shrink-0"
              >
                ถึง:
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#334293] focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleFilter}
                variant="primary"
                size="sm"
                className="flex-1 sm:flex-initial"
              >
                <Filter className="h-4 w-4 mr-2" />
                กรอง
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial"
              >
                รีเซ็ต
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!isLoading && attendances.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ไม่พบประวัติการเช็คอิน</p>
              <p className="text-sm text-gray-400 mt-2">
                ลองเปลี่ยนช่วงเวลาที่ค้นหา
              </p>
            </div>
          )}

          {!isLoading && attendances.length > 0 && (
            <div className="space-y-3">
              {attendances.map((attendance) => (
                <div
                  key={attendance.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#334293] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AttendanceStatusBadge
                          status={attendance.status}
                          lateMinutes={attendance.late_minutes}
                          size="sm"
                          showIcon
                        />
                        <span className="text-sm text-gray-500">
                          {new Date(
                            type === "student" &&
                            "attendance_date" in attendance
                              ? attendance.attendance_date
                              : attendance.check_in_time
                          ).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Student specific info */}
                      {type === "student" &&
                        "session" in attendance &&
                        attendance.session && (
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold text-gray-900">
                              {attendance.session.schedule_name}
                            </p>
                            <p className="text-gray-600">
                              คาบที่ {attendance.session.session_number}
                            </p>
                          </div>
                        )}

                      {/* Teacher specific info */}
                      {type === "teacher" && "session_id" in attendance && (
                        <div className="space-y-1 text-sm">
                          {attendance.session_id && (
                            <p className="text-gray-600">
                              Session #{attendance.session_id}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(
                            attendance.check_in_time
                          ).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {type === "teacher" &&
                          "check_out_time" in attendance &&
                          attendance.check_out_time && (
                            <span className="flex items-center gap-1 text-green-600">
                              <X className="h-4 w-4" />
                              {new Date(
                                attendance.check_out_time
                              ).toLocaleTimeString("th-TH", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                      </div>

                      {type === "teacher" &&
                        "notes" in attendance &&
                        attendance.notes && (
                          <p className="text-xs text-gray-500 italic mt-2">
                            หมายเหตุ: {attendance.notes}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">แสดง {attendances.length} รายการ</p>
            <Button onClick={onClose} variant="outline" size="sm">
              ปิด
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
