"use client";

import AttendanceHistoryModal from "@/components/attendance/AttendanceHistoryModal";
import SessionCodeDisplay from "@/components/attendance/SessionCodeDisplay";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { attendanceApi } from "@/services/api/attendance";
import { scheduleService } from "@/services/api/schedules";
import type {
  LocationData,
  TeacherCheckInResponse,
} from "@/types/attendance.types";
import type { Session } from "@/types/group.types";
import { formatCoordinates, getCurrentLocation } from "@/utils/gps";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  History,
  MapPin,
  Navigation,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface TodaySession extends Session {
  schedule_name: string;
  room_name?: string;
}

export default function TeacherCheckInPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Location state
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Session state
  const [sessions, setSessions] = useState<TodaySession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Check-in state
  const [isFieldStaff, setIsFieldStaff] = useState(false);
  const [notes, setNotes] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInResult, setCheckInResult] =
    useState<TeacherCheckInResponse | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load today's sessions
  useEffect(() => {
    loadTodaySessions();
  }, []);

  // Auto-load GPS on mount if not field staff
  useEffect(() => {
    if (!isFieldStaff) {
      loadLocation();
    }
  }, [isFieldStaff]);

  const loadTodaySessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await scheduleService.getTeachersSchedules();

      const today = new Date().toISOString().split("T")[0];

      // Extract and filter sessions for today
      const todaySessions: TodaySession[] = [];
      const schedules = response.schedules || [];

      for (const schedule of schedules) {
        // Type assertion for sessions - API returns sessions array
        const sessions = (schedule as { sessions?: Session[] }).sessions || [];
        for (const session of sessions) {
          if (
            session.session_date.startsWith(today) &&
            session.status !== "cancelled"
          ) {
            todaySessions.push({
              ...session,
              schedule_name: schedule.schedule_name,
              room_name: session.room?.room_name,
            });
          }
        }
      }

      // Sort by start time
      todaySessions.sort((a, b) => {
        const timeA = a.start_time || "";
        const timeB = b.start_time || "";
        return timeA.localeCompare(timeB);
      });

      setSessions(todaySessions);

      // Auto-select first session if only one
      if (todaySessions.length === 1) {
        setSelectedSessionId(todaySessions[0].id);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast.error("ไม่สามารถโหลดรายการคาบเรียนได้");
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      const loc = await getCurrentLocation();
      setLocation(loc);
      toast.success("ตรวจพบตำแหน่งแล้ว ✓");
    } catch (error) {
      const err = error as Error;
      setLocationError(err.message);
      toast.error(err.message);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!isFieldStaff && !selectedSessionId) {
      toast.error("กรุณาเลือกคาบเรียน");
      return;
    }

    if (!isFieldStaff && !location) {
      toast.error("กรุณารอระบบตรวจสอบตำแหน่ง");
      return;
    }

    try {
      setCheckInLoading(true);

      const result = await attendanceApi.teacherCheckIn({
        session_id: isFieldStaff ? undefined : selectedSessionId!,
        location: isFieldStaff ? undefined : location!,
        notes: notes || undefined,
        is_field_staff: isFieldStaff,
      });

      setCheckInResult(result);
      toast.success("Check-in สำเร็จ!");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Check-in ล้มเหลว");
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleRefreshCode = async () => {
    if (!checkInResult?.attendance.session_id) return;

    try {
      const result = await attendanceApi.generateSessionCode({
        session_id: checkInResult.attendance.session_id,
      });

      setCheckInResult({
        ...checkInResult,
        session_code: result.session_code,
      });

      toast.success("สร้างโค้ดใหม่แล้ว");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "ไม่สามารถสร้างโค้ดใหม่ได้");
    }
  };

  const handleViewStudents = () => {
    if (checkInResult?.attendance.session_id) {
      router.push(
        `/attendance/sessions/${checkInResult.attendance.session_id}/students`
      );
    }
  };

  // If check-in successful, show session code
  if (checkInResult) {
    const selectedSession = sessions.find(
      (s) => s.id === checkInResult.attendance.session_id
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <SessionCodeDisplay
            sessionCode={checkInResult.session_code || ""}
            sessionName={selectedSession?.schedule_name || "Field Work"}
            expiresAt={new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()}
            onRefreshCode={
              checkInResult.session_code ? handleRefreshCode : undefined
            }
            onViewStudents={
              checkInResult.attendance.session_id
                ? handleViewStudents
                : undefined
            }
            onClose={() => router.push("/attendance/teacher/dashboard")}
          />
        </div>
      </div>
    );
  }

  // Main check-in form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* History Modal */}
        <AttendanceHistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          type="teacher"
        />

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#334293] to-[#4a5ab3] rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#334293]">
                  Teacher Check-in
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  เช็คอินเข้างาน
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHistory(true)}
              className="bg-[#334293] hover:bg-[#4a5ab3] text-white rounded-full p-3 transition-colors"
              title="ดูประวัติ"
            >
              <History className="h-5 w-5" />
            </button>
          </div>

          {user && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-[#334293]">
                  {user.username}
                </span>{" "}
                ({user.role})
              </p>
            </div>
          )}
        </div>

        {/* Field Staff Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="field-staff-mode"
              checked={isFieldStaff}
              onChange={(e) => setIsFieldStaff(e.target.checked)}
              className="mt-1 w-5 h-5 text-[#334293] rounded focus:ring-2 focus:ring-[#334293] cursor-pointer"
            />
            <label htmlFor="field-staff-mode" className="cursor-pointer flex-1">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#334293]" />
                <span className="font-semibold text-gray-900">
                  Field Staff Mode
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                เช็คอินทำงานภาคสนาม (ไม่ต้องระบุตำแหน่งหรือคาบเรียน)
              </p>
            </label>
          </div>
        </div>

        {/* GPS Location Section */}
        {!isFieldStaff && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-6 w-6 text-[#334293]" />
              <h2 className="text-xl font-bold text-gray-900">
                ตำแหน่งปัจจุบัน
              </h2>
            </div>

            {locationLoading && (
              <div className="flex items-center gap-3 py-4">
                <LoadingSpinner />
                <span className="text-gray-600">กำลังตรวจหาตำแหน่ง...</span>
              </div>
            )}

            {locationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">
                      ไม่สามารถเข้าถึงตำแหน่งได้
                    </p>
                    <p className="text-red-600 text-sm mt-1">{locationError}</p>
                  </div>
                </div>
                <Button
                  onClick={loadLocation}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  ลองอีกครั้ง
                </Button>
              </div>
            )}

            {location && !locationError && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium mb-2">
                      ตรวจพบตำแหน่งแล้ว
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">พิกัด:</span>
                        <span className="ml-2 font-mono text-gray-900 break-all">
                          {formatCoordinates(
                            location.latitude,
                            location.longitude
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">ความแม่นยำ:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          ±{Math.round(location.accuracy || 0)} เมตร
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session Selection */}
        {!isFieldStaff && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-[#334293]" />
              <h2 className="text-xl font-bold text-gray-900">เลือกคาบเรียน</h2>
            </div>

            {sessionsLoading ? (
              <div className="flex items-center gap-3 py-4">
                <LoadingSpinner />
                <span className="text-gray-600">กำลังโหลดคาบเรียน...</span>
              </div>
            ) : (
              <>
                {sessions.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">ไม่มีคาบเรียนวันนี้</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ลองเปิด Field Staff Mode หากต้องการเช็คอิน
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSessionId(session.id)}
                        className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                          selectedSessionId === session.id
                            ? "border-[#334293] bg-blue-50"
                            : "border-gray-200 hover:border-[#334293] hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {session.schedule_name}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                <span>
                                  {session.start_time} - {session.end_time}
                                </span>
                              </div>
                              {session.room_name && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span>{session.room_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedSessionId === session.id && (
                            <CheckCircle className="h-6 w-6 text-[#334293] flex-shrink-0 self-end sm:self-start" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Notes (Optional) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <label className="block">
            <span className="text-gray-700 font-medium mb-2 block">
              หมายเหตุ (ถ้ามี)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น: เข้างานสาย 5 นาที, ทำงานภาคสนาม..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#334293] focus:border-transparent resize-none"
              rows={3}
            />
          </label>
        </div>

        {/* Check-in Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <Button
            onClick={handleCheckIn}
            disabled={
              checkInLoading ||
              (!isFieldStaff &&
                (!location || !selectedSessionId || locationLoading))
            }
            variant="common"
            size="lg"
            className="w-full"
          >
            {checkInLoading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">กำลัง Check-in...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Check-in ตอนนี้</span>
              </>
            )}
          </Button>

          {!isFieldStaff && !location && (
            <p className="text-center text-sm text-gray-500 mt-3">
              💡 รอระบบตรวจหาตำแหน่งก่อนเช็คอิน
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
