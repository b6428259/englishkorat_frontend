"use client";

import AttendanceHistoryModal from "@/components/attendance/AttendanceHistoryModal";
import AttendanceStatusBadge from "@/components/attendance/AttendanceStatusBadge";
import QRScanner from "@/components/attendance/QRScanner";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { attendanceApi } from "@/services/api/attendance";
import type {
  CheckInMethod,
  LocationData,
  StudentAttendance,
} from "@/types/attendance.types";
import { formatCoordinates, getCurrentLocation } from "@/utils/gps";
import { Check, History, MapPin, Navigation, QrCode, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function StudentCheckInPage() {
  const { user } = useAuth();
  const [sessionCode, setSessionCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [checkInResult, setCheckInResult] = useState<StudentAttendance | null>(
    null
  );
  const [checkInMethod, setCheckInMethod] = useState<CheckInMethod>("code");

  // Location state
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Auto-load GPS on mount
  useEffect(() => {
    loadLocation();
  }, []);

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

  // Auto-uppercase and limit to 6 characters
  const handleCodeChange = (value: string) => {
    const formatted = value
      .toUpperCase()
      .replaceAll(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setSessionCode(formatted);
  };

  // Handle QR scan success
  const handleQRScanSuccess = (code: string) => {
    setShowQRScanner(false);
    setSessionCode(code.toUpperCase());
    setCheckInMethod("qr");
    // Auto-submit after QR scan
    handleCheckIn(code, "qr");
  };

  // Validate code format
  const isCodeValid = sessionCode.length === 6;

  // Handle check-in submission
  const handleCheckIn = async (
    code: string = sessionCode,
    method: CheckInMethod = checkInMethod
  ) => {
    if (!code || code.length !== 6) {
      toast.error("กรุณากรอกโค้ด 6 ตัวอักษร");
      return;
    }

    if (!location) {
      toast.error("กรุณารอระบบตรวจสอบตำแหน่ง");
      return;
    }

    try {
      setIsLoading(true);
      const response = await attendanceApi.studentCheckIn({
        session_code: code,
        check_in_method: method,
        location: location,
      });

      setCheckInResult(response.attendance);
      toast.success("เช็คอินสำเร็จ!");
    } catch (error) {
      const err = error as Error;
      if (err.message.includes("already")) {
        toast.error("คุณได้เช็คอินเข้าเรียนแล้ว");
      } else if (err.message.includes("invalid")) {
        toast.error("โค้ดไม่ถูกต้องหรือหมดอายุแล้ว");
      } else if (err.message.includes("expired")) {
        toast.error("โค้ดหมดอายุแล้ว กรุณาขอโค้ดใหม่จากอาจารย์");
      } else if (err.message.includes("far")) {
        toast.error("คุณอยู่ไกลจากสถานที่เรียนเกินไป");
      } else {
        toast.error("เช็คอินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to check-in form
  const handleCheckInAgain = () => {
    setCheckInResult(null);
    setSessionCode("");
    setCheckInMethod("code");
  };

  // If already checked in, show result
  if (checkInResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Success card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#334293] to-[#4a5ab3] p-8 text-white text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-2xl font-bold">เช็คอินสำเร็จ!</h1>
              <p className="text-blue-100 mt-2">บันทึกการเข้าเรียนเรียบร้อย</p>
            </div>

            {/* Details */}
            <div className="p-8 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-center">
                <AttendanceStatusBadge
                  status={checkInResult.status}
                  lateMinutes={checkInResult.late_minutes}
                  size="lg"
                  showIcon
                />
              </div>

              {/* Session info */}
              <div className="space-y-3 text-center">
                {checkInResult.session && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">กลุ่ม</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {checkInResult.session.schedule_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">คาบที่</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {checkInResult.session.session_number}
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <p className="text-sm text-gray-500">เวลาเช็คอิน</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(checkInResult.check_in_time).toLocaleTimeString(
                      "th-TH",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>

                {checkInResult.late_minutes !== null &&
                  checkInResult.late_minutes > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>หมายเหตุ:</strong> คุณเข้าเรียนสาย{" "}
                        {checkInResult.late_minutes} นาที
                      </p>
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleCheckInAgain}
                  variant="common"
                  className="w-full"
                >
                  เช็คอินเข้าเรียนอื่น
                </Button>
                <Button
                  onClick={() => {
                    globalThis.location.href = "/dashboard";
                  }}
                  variant="outline"
                  className="w-full"
                >
                  กลับหน้าหลัก
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check-in form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRScanner
            onScanSuccess={handleQRScanSuccess}
            onClose={() => setShowQRScanner(false)}
          />
        )}

        {/* History Modal */}
        <AttendanceHistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          type="student"
        />

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#334293] to-[#4a5ab3] p-8 text-white">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">เช็คอินเข้าเรียน</h1>
              <button
                onClick={() => setShowHistory(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
                title="ดูประวัติ"
              >
                <History className="h-6 w-6" />
              </button>
            </div>
            <p className="text-center text-blue-100">
              {user?.username || "นักเรียน"}
            </p>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            {/* GPS Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {locationLoading && (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm text-blue-800">
                        กำลังตรวจหาตำแหน่ง...
                      </span>
                    </div>
                  )}

                  {locationError && (
                    <div>
                      <p className="text-sm text-red-800 font-medium mb-2">
                        ไม่สามารถเข้าถึงตำแหน่งได้
                      </p>
                      <p className="text-xs text-red-600 mb-2">
                        {locationError}
                      </p>
                      <Button
                        onClick={loadLocation}
                        variant="outline"
                        size="sm"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        ลองอีกครั้ง
                      </Button>
                    </div>
                  )}

                  {location && !locationError && (
                    <div>
                      <p className="text-sm text-green-800 font-medium mb-2">
                        ✓ ตรวจพบตำแหน่งแล้ว
                      </p>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">พิกัด:</span>{" "}
                          <span className="font-mono">
                            {formatCoordinates(
                              location.latitude,
                              location.longitude
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">ความแม่นยำ:</span> ±
                          {Math.round(location.accuracy || 0)} เมตร
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 text-center">
                <strong>วิธีการเช็คอิน:</strong>
                <br />
                กรอกโค้ด 6 ตัวอักษรที่ได้จากอาจารย์
                <br />
                หรือสแกน QR Code
              </p>
            </div>

            {/* Code input */}
            <div className="space-y-2">
              <label
                htmlFor="sessionCode"
                className="block text-sm font-medium text-gray-700"
              >
                โค้ดเข้าเรียน
              </label>
              <input
                id="sessionCode"
                type="text"
                value={sessionCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="A1B2C3"
                pattern="[A-Z0-9]{6}"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-4xl font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#334293] focus:border-transparent"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 text-center">
                กรอกโค้ด 6 ตัวอักษร (A-Z, 0-9)
              </p>
            </div>

            {/* QR Scanner button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">หรือ</span>
              </div>
            </div>

            <Button
              onClick={() => {
                setCheckInMethod("qr");
                setShowQRScanner(true);
              }}
              variant="outline"
              className="w-full py-3 text-lg"
              disabled={isLoading}
            >
              <QrCode className="h-6 w-6 mr-2" />
              สแกน QR Code
            </Button>

            {/* Check-in button */}
            <Button
              onClick={() => handleCheckIn()}
              variant="primary"
              className="w-full py-4 text-lg"
              disabled={
                !isCodeValid || isLoading || !location || locationLoading
              }
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">กำลังเช็คอิน...</span>
                </>
              ) : (
                <>
                  <Check className="h-6 w-6 mr-2" />
                  เช็คอินเข้าเรียน
                </>
              )}
            </Button>

            {!location && !locationLoading && (
              <p className="text-center text-sm text-gray-500">
                💡 รอระบบตรวจหาตำแหน่งก่อนเช็คอิน
              </p>
            )}

            {/* Help text */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                ไม่มีโค้ด?{" "}
                <span className="text-[#334293] font-medium">
                  ติดต่ออาจารย์ผู้สอน
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  เข้าเรียนตรงเวลา
                </h3>
                <p className="text-sm text-gray-600">เช็คอินภายใน 15 นาทีแรก</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">เข้าเรียนสาย</h3>
                <p className="text-sm text-gray-600">หลัง 15 นาทีแรก</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
