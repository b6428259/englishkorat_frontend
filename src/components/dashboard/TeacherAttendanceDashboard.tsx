"use client";

import AttendanceStatusBadge from "@/components/attendance/AttendanceStatusBadge";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { attendanceApi } from "@/services/api/attendance";
import type { TeacherAttendance } from "@/types/attendance.types";
import { Check, Clock, FileText, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function TeacherAttendanceDashboard() {
  const [todayAttendances, setTodayAttendances] = useState<TeacherAttendance[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState<number | null>(null);

  // Load today's attendance records
  useEffect(() => {
    loadTodayStatus();
  }, []);

  const loadTodayStatus = async () => {
    try {
      setIsLoading(true);
      const response = await attendanceApi.getTeacherTodayStatus();
      setTodayAttendances(response.attendances);
    } catch (error) {
      console.error("Failed to load attendance:", error);
      toast.error("ไม่สามารถโหลดข้อมูลการเช็คอินได้");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async (attendance: TeacherAttendance) => {
    try {
      setIsCheckingOut(attendance.id);
      await attendanceApi.teacherCheckOut({
        attendance_id: attendance.id,
        notes: "",
      });

      toast.success("เช็คเอาท์สำเร็จ!");
      await loadTodayStatus();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "เช็คเอาท์ไม่สำเร็จ");
    } finally {
      setIsCheckingOut(null);
    }
  };

  // Calculate quick stats
  const stats = {
    total: todayAttendances.length,
    onTime: todayAttendances.filter((a) => a.status === "on-time").length,
    late: todayAttendances.filter((a) => a.status === "late").length,
    fieldWork: todayAttendances.filter((a) => a.status === "field-work").length,
    checkedOut: todayAttendances.filter((a) => a.check_out_time !== null)
      .length,
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#334293] to-[#4a5ab3] p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">การเช็คอินวันนี้</h3>
            <p className="text-sm text-blue-100">
              {new Date().toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/attendance/teacher/check-in">
              <Button variant="common" className="bg-white text-[#334293]">
                <Check className="h-4 w-4 mr-2" />
                เช็คอิน
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Check className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-600">เช็คอินทั้งหมด</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.onTime}</p>
          <p className="text-xs text-gray-600">ตรงเวลา</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
          <p className="text-xs text-gray-600">สาย</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.fieldWork}</p>
          <p className="text-xs text-gray-600">ภาคสนาม</p>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="p-6">
        {todayAttendances.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">ยังไม่มีการเช็คอินวันนี้</p>
            <Link href="/attendance/teacher/check-in">
              <Button variant="primary">
                <Check className="h-4 w-4 mr-2" />
                เช็คอินเข้างาน
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAttendances.map((attendance) => (
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
                      {attendance.session_id && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-mono font-semibold rounded-lg">
                          Session #{attendance.session_id}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex flex-wrap gap-4 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          เช็คอิน:{" "}
                          {new Date(
                            attendance.check_in_time
                          ).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {attendance.check_out_time && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Check className="h-4 w-4" />
                            เช็คเอาท์:{" "}
                            {new Date(
                              attendance.check_out_time
                            ).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      {attendance.check_in_location?.address && (
                        <p className="text-xs text-gray-500">
                          📍 {attendance.check_in_location.address}
                        </p>
                      )}

                      {attendance.notes && (
                        <p className="text-xs text-gray-500 italic">
                          หมายเหตุ: {attendance.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Check-out button */}
                  {!attendance.check_out_time && (
                    <Button
                      onClick={() => handleCheckOut(attendance)}
                      variant="outline"
                      size="sm"
                      disabled={isCheckingOut === attendance.id}
                    >
                      {isCheckingOut === attendance.id ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">กำลังเช็คเอาท์...</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          เช็คเอาท์
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {todayAttendances.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              เช็คเอาท์แล้ว: {stats.checkedOut} / {stats.total}
            </p>
            <Link
              href="/attendance/teacher/history"
              className="text-[#334293] hover:underline font-medium"
            >
              ดูประวัติทั้งหมด →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
