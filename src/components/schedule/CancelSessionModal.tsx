"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { requestSessionCancellation } from "@/services/api/schedules";
import { colors } from "@/styles/colors";
import { AlertCircle, Ban, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface CancelSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  sessionDate: string;
  sessionTime: string;
  onSuccess?: () => void;
}

export default function CancelSessionModal({
  isOpen,
  onClose,
  sessionId,
  sessionDate,
  sessionTime,
  onSuccess,
}: CancelSessionModalProps) {
  const { language } = useLanguage();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    th: {
      title: "ยกเลิกคาบเรียน",
      subtitle: "ขอยกเลิกคาบเรียนนี้หรือไม่?",
      date: "วันที่",
      time: "เวลา",
      reason: "เหตุผลในการยกเลิก",
      reasonPlaceholder: "กรุณาระบุเหตุผลในการยกเลิกคาบเรียน...",
      reasonRequired: "จำเป็นต้องระบุเหตุผล",
      policy: "นโยบายการยกเลิก",
      policyDesc: "ต้องขอยกเลิกก่อนคาบเรียนอย่างน้อย 24 ชั่วโมง",
      warning: "คำเตือน",
      warningDesc: "การยกเลิกคาบเรียนจะต้องได้รับการอนุมัติจากแอดมิน",
      waitingApproval: "คำขอจะถูกส่งไปยังแอดมินเพื่ออนุมัติ",
      cancel: "ยกเลิก",
      confirm: "ยืนยันการยกเลิก",
      submitting: "กำลังส่งคำขอ...",
      success: "ส่งคำขอยกเลิกสำเร็จ",
      failed: "ส่งคำขอไม่สำเร็จ",
    },
    en: {
      title: "Cancel Session",
      subtitle: "Are you sure you want to cancel this session?",
      date: "Date",
      time: "Time",
      reason: "Cancellation Reason",
      reasonPlaceholder: "Please provide a reason for cancellation...",
      reasonRequired: "Reason is required",
      policy: "Cancellation Policy",
      policyDesc: "Must request cancellation at least 24 hours before class",
      warning: "Warning",
      warningDesc: "Cancellation request must be approved by admin",
      waitingApproval: "Your request will be sent to admin for approval",
      cancel: "Cancel",
      confirm: "Confirm Cancellation",
      submitting: "Submitting...",
      success: "Cancellation request submitted successfully",
      failed: "Failed to submit cancellation request",
    },
  };

  const t = translations[language];

  const handleSubmit = async () => {
    // Validate reason
    if (!reason.trim()) {
      setError(t.reasonRequired);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await requestSessionCancellation(sessionId, {
        reason: reason.trim(),
      });

      toast.success(t.success, {
        position: "top-center",
        icon: "✅",
      });

      // Reset form
      setReason("");
      onClose();

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("Failed to request cancellation:", err);

      // Extract error message
      let errorMessage = t.failed;
      if (err && typeof err === "object" && "response" in err) {
        const responseErr = err as { response?: { data?: { error?: string } } };
        errorMessage = responseErr.response?.data?.error || t.failed;
      }

      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader
          className="border-b pb-4"
          style={{
            borderColor: `${colors.blueLogo}20`,
            background: `linear-gradient(135deg, ${colors.blueLogo}08 0%, ${colors.yellowLogo}15 100%)`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle
                className="text-lg sm:text-xl font-bold flex items-center gap-2"
                style={{ color: colors.blueLogo }}
              >
                <Ban className="h-5 w-5 text-red-600" />
                {t.title}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {t.subtitle}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-8 w-8 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5 py-4">
          {/* Session Info */}
          <div
            className="p-3 sm:p-4 rounded-lg border"
            style={{
              backgroundColor: `${colors.blueLogo}10`,
              borderColor: `${colors.blueLogo}30`,
              borderLeft: `4px solid ${colors.blueLogo}`,
            }}
          >
            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <p className="text-gray-600 font-medium">{t.date}</p>
                <p className="text-gray-900 font-semibold">{sessionDate}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">{t.time}</p>
                <p className="text-gray-900 font-semibold">{sessionTime}</p>
              </div>
            </div>
          </div>

          {/* Policy Info */}
          <div
            className="p-3 sm:p-4 rounded-lg border"
            style={{
              backgroundColor: `${colors.yellowLogo}20`,
              borderColor: `${colors.yellowLogo}60`,
            }}
          >
            <div className="flex gap-2 sm:gap-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm">
                  {t.policy}
                </h4>
                <p className="text-xs sm:text-sm text-gray-700">
                  {t.policyDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Approval Warning */}
          <div
            className="p-3 sm:p-4 rounded-lg border"
            style={{
              backgroundColor: `${colors.blueLogo}08`,
              borderColor: `${colors.blueLogo}30`,
            }}
          >
            <div className="flex gap-2 sm:gap-3">
              <AlertCircle
                className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5"
                style={{ color: colors.blueLogo }}
              />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm">
                  {t.warning}
                </h4>
                <p className="text-xs sm:text-sm text-gray-700">
                  {t.warningDesc}
                </p>
                <p
                  className="text-xs sm:text-sm mt-2 font-medium"
                  style={{ color: colors.blueLogo }}
                >
                  {t.waitingApproval}
                </p>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label
              htmlFor="cancellation-reason"
              className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2"
            >
              {t.reason} <span className="text-red-600">*</span>
            </label>
            <textarea
              id="cancellation-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder={t.reasonPlaceholder}
              rows={4}
              disabled={isSubmitting}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              style={
                {
                  focusVisible: {
                    outline: `2px solid ${colors.blueLogo}`,
                    outlineOffset: "2px",
                  },
                } as React.CSSProperties
              }
            />
            {error && (
              <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t"
          style={{ borderColor: `${colors.blueLogo}20` }}
        >
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            variant="cancel"
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium"
          >
            {t.cancel}
          </Button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2 text-white rounded-lg transition-all shadow-lg disabled:opacity-50 hover:brightness-90"
            style={{
              backgroundColor: colors.blueLogo,
              boxShadow: `0 4px 14px 0 ${colors.blueLogo}30`,
            }}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                {t.submitting}
              </>
            ) : (
              <>
                <Ban className="h-3 w-3 sm:h-4 sm:w-4" />
                {t.confirm}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
