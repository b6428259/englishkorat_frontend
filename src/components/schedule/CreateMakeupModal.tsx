"use client";

import Button from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { scheduleService } from "@/services/api/schedules";
import { CreateMakeupSessionRequest } from "@/types/group.types";
import {
  AlertCircle,
  Calendar,
  FileText,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CreateMakeupModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  sessionDate: string;
  sessionTime: string;
  scheduleName: string;
  teacherId?: number | null;
  teacherName?: string;
  // Quota info
  makeupQuota?: number;
  makeupRemaining?: number;
  makeupUsed?: number;
  onSuccess?: () => void;
}

export default function CreateMakeupModal({
  isOpen,
  onClose,
  sessionId,
  sessionDate,
  sessionTime,
  scheduleName,
  teacherId,
  teacherName,
  makeupQuota = 2,
  makeupRemaining = 0,
  makeupUsed = 0,
  onSuccess,
}: Readonly<CreateMakeupModalProps>) {
  const { language } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState<{
    new_session_date: string;
    new_start_time: string;
    cancelling_reason: string;
    new_session_status: "cancelled" | "rescheduled" | "no-show";
  }>({
    new_session_date: "",
    new_start_time: "",
    cancelling_reason: "",
    new_session_status: "cancelled",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we're returning from schedule selection
  useEffect(() => {
    if (isOpen) {
      // Check URL params first
      const params = new URLSearchParams(globalThis.location.search);
      const selectedDate = params.get("selectedDate");
      const selectedTime = params.get("selectedTime");

      // Check sessionStorage for prefilled date and time
      const prefilledDate = sessionStorage.getItem("prefilledDate");
      const prefilledTime = sessionStorage.getItem("prefilledTime");

      if (selectedDate) {
        setFormData((prev) => ({
          ...prev,
          new_session_date: selectedDate,
          new_start_time: selectedTime || prev.new_start_time,
        }));
        // Clean up URL
        globalThis.history.replaceState({}, "", globalThis.location.pathname);
      } else if (prefilledDate) {
        setFormData((prev) => ({
          ...prev,
          new_session_date: prefilledDate,
          new_start_time: prefilledTime || prev.new_start_time,
        }));
        // Clean up sessionStorage
        sessionStorage.removeItem("prefilledDate");
        sessionStorage.removeItem("prefilledTime");
      }
    }
  }, [isOpen]);

  const translations = {
    th: {
      title: "สร้าง Makeup Session",
      originalSession: "คาบเรียนต้นฉบับ",
      scheduleName: "ชื่อ Schedule",
      sessionDate: "วันที่",
      sessionTime: "เวลา",
      newSession: "คาบเรียนชดเชย",
      newDate: "วันที่ชดเชย",
      newTime: "เวลาเริ่ม",
      reason: "เหตุผลการยกเลิก",
      reasonPlaceholder:
        "เช่น: ครูป่วย, นักเรียนไม่มาเรียน, วันหยุดนักขัตฤกษ์...",
      status: "สถานะคาบเดิม",
      cancelled: "ยกเลิก",
      rescheduled: "เลื่อนเวลา",
      noShow: "ไม่มาเรียน",
      quotaInfo: "ข้อมูลโควต้า",
      remaining: "เหลือ",
      used: "ใช้ไป",
      total: "ทั้งหมด",
      quotaWarning: "⚠️ เหลือโควต้าอีก 1 ครั้ง!",
      quotaExhausted: "🚫 โควต้าหมดแล้ว",
      quotaExhaustedMsg:
        "ไม่สามารถสร้าง Makeup Session ได้ กรุณาติดต่อแอดมินเพื่อเพิ่มโควต้า",
      cancel: "ยกเลิก",
      create: "สร้าง Makeup",
      creating: "กำลังสร้าง...",
      fillRequired: "กรุณากรอกข้อมูลให้ครบถ้วน",
      success: "สร้าง Makeup Session สำเร็จ!",
      error: "เกิดข้อผิดพลาดในการสร้าง Makeup",
    },
    en: {
      title: "Create Makeup Session",
      originalSession: "Original Session",
      scheduleName: "Schedule Name",
      sessionDate: "Date",
      sessionTime: "Time",
      newSession: "Makeup Session",
      newDate: "Makeup Date",
      newTime: "Start Time",
      reason: "Cancellation Reason",
      reasonPlaceholder: "e.g., Teacher sick, Student absent, Holiday...",
      status: "Original Status",
      cancelled: "Cancelled",
      rescheduled: "Rescheduled",
      noShow: "No Show",
      quotaInfo: "Quota Information",
      remaining: "Remaining",
      used: "Used",
      total: "Total",
      quotaWarning: "⚠️ Only 1 quota remaining!",
      quotaExhausted: "🚫 Quota Exhausted",
      quotaExhaustedMsg:
        "Cannot create makeup session. Please contact admin to increase quota.",
      cancel: "Cancel",
      create: "Create Makeup",
      creating: "Creating...",
      fillRequired: "Please fill in all required fields",
      success: "Makeup session created successfully!",
      error: "Failed to create makeup session",
    },
  };

  const t = translations[language];

  const hasQuota = makeupRemaining > 0;

  // Determine border and background class
  const getQuotaBorderClass = () => {
    if (!hasQuota) {
      return "bg-red-50 border-red-300";
    }
    if (makeupRemaining === 1) {
      return "bg-yellow-50 border-yellow-300";
    }
    return "bg-green-50 border-green-300";
  };

  // Determine icon color class
  const getQuotaIconClass = () => {
    if (!hasQuota) {
      return "text-red-600";
    }
    if (makeupRemaining === 1) {
      return "text-yellow-600";
    }
    return "text-green-600";
  };

  const handleSubmit = async () => {
    // Validate
    if (
      !formData.new_session_date ||
      !formData.new_start_time ||
      !formData.cancelling_reason
    ) {
      toast.error(t.fillRequired);
      return;
    }

    // Check quota
    if (!hasQuota) {
      toast.error(t.quotaExhaustedMsg, { duration: 5000 });
      return;
    }

    try {
      setIsSubmitting(true);

      const request: CreateMakeupSessionRequest = {
        original_session_id: sessionId,
        new_session_date: formData.new_session_date,
        new_start_time: formData.new_start_time,
        cancelling_reason: formData.cancelling_reason,
        new_session_status: formData.new_session_status,
      };

      await scheduleService.createMakeupSession(request);

      toast.success(t.success, { duration: 4000 });

      // Close modal
      onClose();

      // Callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error("Failed to create makeup session:", error);

      // Check if quota exhausted
      const errorData = (
        error as {
          response?: { data?: { makeup_used?: number; makeup_quota?: number } };
        }
      )?.response?.data;
      if (
        errorData?.makeup_used !== undefined &&
        errorData?.makeup_quota !== undefined
      ) {
        const used = errorData.makeup_used;
        const total = errorData.makeup_quota;
        const errorMessage =
          language === "th"
            ? `ไม่สามารถสร้าง Makeup Class ได้\n\nสิทธิ์ใช้หมดแล้ว: ${used}/${total}\n\nกรุณาติดต่อแอดมินเพื่อเพิ่มสิทธิ์`
            : `Cannot create Makeup Class\n\nQuota exhausted: ${used}/${total}\n\nPlease contact admin to increase quota`;
        toast.error(errorMessage, { duration: 6000 });
      } else {
        const message =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          t.error;
        toast.error(message, { duration: 5000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
          {/* Original Session Info */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <FileText className="h-4 w-4 text-gray-600" />
              {t.originalSession}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-gray-600">{t.scheduleName}:</span>
                <p className="font-medium text-gray-900 break-words">
                  {scheduleName}
                </p>
              </div>
              <div>
                <span className="text-gray-600">{t.sessionDate}:</span>
                <p className="font-medium text-gray-900">{sessionDate}</p>
              </div>
              <div>
                <span className="text-gray-600">{t.sessionTime}:</span>
                <p className="font-medium text-gray-900">{sessionTime}</p>
              </div>
            </div>
          </div>

          {/* Quota Info */}
          <div
            className={`p-3 sm:p-4 rounded-lg border-2 ${getQuotaBorderClass()}`}
          >
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
              <AlertCircle className={`h-4 w-4 ${getQuotaIconClass()}`} />
              {t.quotaInfo}
            </h3>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-600">{t.remaining}:</span>
                <span className="font-bold ml-1">{makeupRemaining}</span>
              </div>
              <div>
                <span className="text-gray-600">{t.used}:</span>
                <span className="font-bold ml-1">{makeupUsed}</span>
              </div>
              <div>
                <span className="text-gray-600">{t.total}:</span>
                <span className="font-bold ml-1">{makeupQuota}</span>
              </div>
            </div>
            {!hasQuota && (
              <p className="text-red-700 text-sm mt-2 font-medium">
                {t.quotaExhaustedMsg}
              </p>
            )}
            {makeupRemaining === 1 && (
              <p className="text-yellow-700 text-sm mt-2 font-medium">
                {t.quotaWarning}
              </p>
            )}
          </div>

          {/* New Session Form */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="h-4 w-4 text-blue-600" />
              {t.newSession}
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t.newDate} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="date"
                    value={formData.new_session_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        new_session_date: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting || !hasQuota}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams({
                        selectMode: "makeup",
                        sessionId: sessionId.toString(),
                      });
                      if (teacherId) {
                        params.set("teacherId", teacherId.toString());
                      }
                      if (teacherName) {
                        params.set(
                          "teacherName",
                          encodeURIComponent(teacherName)
                        );
                      }
                      router.push(`/schedule?${params.toString()}`);
                    }}
                    className="w-full sm:w-auto px-3 py-2 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                    disabled={isSubmitting || !hasQuota}
                    title={
                      language === "th"
                        ? "เลือกจาก Schedule"
                        : "Select from Schedule"
                    }
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="sm:hidden">
                      {language === "th" ? "เลือกจากปฏิทิน" : "From Calendar"}
                    </span>
                    <span className="hidden sm:inline">
                      {language === "th"
                        ? "เลือกจาก Schedule"
                        : "Select from Schedule"}
                    </span>
                  </button>
                </div>
                {formData.new_session_date && (
                  <p className="text-xs sm:text-sm text-green-600 mt-2 flex items-center gap-1 bg-green-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-green-200">
                    <span className="text-sm sm:text-base">✓</span>
                    <span className="font-medium break-words">
                      {language === "th"
                        ? `เลือกวันที่: ${new Date(
                            formData.new_session_date
                          ).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}`
                        : `Selected: ${new Date(
                            formData.new_session_date
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}`}
                      {formData.new_start_time &&
                        ` ${language === "th" ? "เวลา" : "at"} ${
                          formData.new_start_time
                        } ${language === "th" ? "น." : ""}`}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t.newTime} <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.new_start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, new_start_time: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting || !hasQuota}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t.status} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.new_session_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    new_session_status: e.target.value as
                      | "cancelled"
                      | "rescheduled"
                      | "no-show",
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting || !hasQuota}
              >
                <option value="cancelled">{t.cancelled}</option>
                <option value="rescheduled">{t.rescheduled}</option>
                <option value="no-show">{t.noShow}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t.reason} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.cancelling_reason}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cancelling_reason: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={t.reasonPlaceholder}
                disabled={isSubmitting || !hasQuota}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
            <Button
              variant="cancel"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 text-sm sm:text-base py-2 sm:py-2.5"
            >
              <X className="h-4 w-4 mr-2" />
              {t.cancel}
            </Button>
            <Button
              variant="monthViewClicked"
              onClick={handleSubmit}
              disabled={isSubmitting || !hasQuota}
              className="flex-1 text-sm sm:text-base py-2 sm:py-2.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t.creating}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t.create}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
