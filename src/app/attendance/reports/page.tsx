"use client";

import AttendanceStatusBadge from "@/components/attendance/AttendanceStatusBadge";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { RoleGuard } from "@/components/common/RoleGuard";
import { attendanceApi } from "@/services/api/attendance";
import type {
  DailyReportResponse,
  MonthlyReportResponse,
  WeeklyReportResponse,
} from "@/types/attendance.types";
import { BarChart3, Calendar, Download, TrendingUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type ReportType = "daily" | "weekly" | "monthly";

export default function AdminAttendanceReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("daily");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [report, setReport] = useState<
    DailyReportResponse | WeeklyReportResponse | MonthlyReportResponse | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateReport = async () => {
    try {
      setIsLoading(true);

      if (reportType === "daily") {
        const response = await attendanceApi.getDailyReport({
          date: selectedDate,
        });
        setReport(response);
      } else if (reportType === "weekly") {
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 6);
        const response = await attendanceApi.getWeeklyReport({
          start_date: selectedDate,
          end_date: endDate.toISOString().split("T")[0],
        });
        setReport(response);
      } else if (reportType === "monthly") {
        const [year, month] = selectedDate.split("-");
        const response = await attendanceApi.getMonthlyReport({
          year: Number.parseInt(year),
          month: Number.parseInt(month),
        });
        setReport(response);
      }

      toast.success("สร้างรายงานสำเร็จ");
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("ไม่สามารถสร้างรายงานได้");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `attendance-report-${reportType}-${selectedDate}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("ดาวน์โหลดรายงานสำเร็จ");
  };

  const calculateStats = () => {
    if (!report) return null;

    if ("teacher_attendances" in report) {
      // Daily report
      const teacherAttendances = report.teacher_attendances;
      const total = teacherAttendances.length;
      const onTime = teacherAttendances.filter(
        (r) => r.status === "on-time"
      ).length;
      const late = teacherAttendances.filter((r) => r.status === "late").length;
      const fieldWork = teacherAttendances.filter(
        (r) => r.status === "field-work"
      ).length;

      return { total, onTime, late, fieldWork };
    }

    if ("teacher_summary" in report) {
      // Weekly/Monthly report
      return {
        total: report.teacher_summary.total,
        onTime: report.teacher_summary.on_time,
        late: report.teacher_summary.late,
        fieldWork: report.teacher_summary.field_work || 0,
      };
    }

    return null;
  };

  const stats = calculateStats();

  return (
    <RoleGuard minRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#334293] to-[#4a5ab3] rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  รายงานการเช็คอิน
                </h1>
                <p className="text-gray-600 mt-1">
                  สร้างและดูรายงานการเช็คอินของอาจารย์
                </p>
              </div>
            </div>

            {/* Report Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Report Type */}
              <div>
                <label
                  htmlFor="reportType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ประเภทรายงาน
                </label>
                <select
                  id="reportType"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#334293] focus:border-transparent"
                >
                  <option value="daily">รายวัน</option>
                  <option value="weekly">รายสัปดาห์</option>
                  <option value="monthly">รายเดือน</option>
                </select>
              </div>

              {/* Date Picker */}
              <div>
                <label
                  htmlFor="selectedDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  วันที่
                </label>
                <input
                  id="selectedDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#334293] focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                <Button
                  onClick={generateReport}
                  variant="primary"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">กำลังสร้าง...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5 mr-2" />
                      <span className="hidden sm:inline">สร้างรายงาน</span>
                      <span className="sm:hidden">สร้าง</span>
                    </>
                  )}
                </Button>
                {report && (
                  <button
                    onClick={downloadReport}
                    className="px-4 py-3 border-2 border-[#334293] text-[#334293] rounded-lg hover:bg-[#334293] hover:text-white transition-colors flex-shrink-0"
                    title="ดาวน์โหลด"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      ทั้งหมด
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      ตรงเวลา
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {stats.onTime}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">สาย</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                      {stats.late}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      ภาคสนาม
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                      {stats.fieldWork}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Content */}
          {report && "teacher_attendances" in report && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                รายการเช็คอิน -{" "}
                {new Date(report.date).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>

              <div className="space-y-3">
                {report.teacher_attendances.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-[#334293] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <AttendanceStatusBadge
                            status={record.status}
                            lateMinutes={record.late_minutes}
                            size="sm"
                            showIcon
                          />
                          <span className="font-semibold text-gray-900">
                            อาจารย์ ID #{record.teacher_id}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>
                            เช็คอิน:{" "}
                            {new Date(record.check_in_time).toLocaleTimeString(
                              "th-TH",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          {record.check_out_time && (
                            <span>
                              เช็คเอาท์:{" "}
                              {new Date(
                                record.check_out_time
                              ).toLocaleTimeString("th-TH", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report && "daily_breakdown" in report && (
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                สรุปรายสัปดาห์
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    สถิติรายวัน
                  </h3>
                  <div className="space-y-3">
                    {report.daily_breakdown.map((day) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-700">
                          {new Date(day.date).toLocaleDateString("th-TH", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">
                            ตรงเวลา: {day.teacher_summary.on_time}
                          </span>
                          <span className="text-yellow-600">
                            สาย: {day.teacher_summary.late}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    สรุปรวม
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">เช็คอินทั้งหมด</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {report.teacher_summary.total}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">ตรงเวลา</p>
                      <p className="text-2xl font-bold text-green-600">
                        {report.teacher_summary.on_time}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">สาย</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {report.teacher_summary.late}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!report && !isLoading && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">ยังไม่มีรายงาน</p>
              <p className="text-sm text-gray-400">
                เลือกประเภทรายงานและวันที่ แล้วกดสร้างรายงาน
              </p>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
