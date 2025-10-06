"use client";

import SessionDetailModal from "@/app/schedule/components/SessionDetailModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { playNotificationSound } from "@/lib/playNotificationSound";
import {
  scheduleService,
  SessionDetailResponse,
  teacherConfirmSession,
  teacherDeclineSession,
} from "@/services/api/schedules";
import type {
  AcceptedPopupNotification,
  Notification,
} from "@/types/notification";
import { Check, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface NotificationPopupModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  viewingAccepted?: AcceptedPopupNotification | null;
  onCloseAccepted?: () => void;
}

export default function NotificationPopupModal({
  notification,
  isOpen,
  onAccept,
  onDecline,
  viewingAccepted,
  onCloseAccepted,
}: NotificationPopupModalProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionDetail, setSessionDetail] =
    useState<SessionDetailResponse | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );

  // Play notification sound when popup opens
  useEffect(() => {
    if (isOpen && notification && !viewingAccepted) {
      // fire-and-forget the async helper
      void playNotificationSound();
    }
  }, [isOpen, notification, viewingAccepted]);

  const currentNotification = viewingAccepted || notification;
  if (!currentNotification) return null;

  // Check if this is an actionable notification (updated for new patterns)
  const isActionable = currentNotification.data?.action
    ? [
        "confirm-session",
        "open-session",
        "confirm-participation",
        "review-missed-session",
      ].includes(currentNotification.data.action)
    : false;
  const hasResourceLink = currentNotification.data?.link?.href;

  const resolveSessionId = () => {
    const data = currentNotification.data;
    if (!data) return undefined;
    if (typeof data.session_id === "number") return data.session_id;
    if (typeof data.resource?.id === "number") {
      if (!data.resource.type || data.resource.type === "session") {
        return data.resource.id;
      }
    }
    return undefined;
  };

  const resolveScheduleId = () => {
    const data = currentNotification.data;
    if (!data) return undefined;
    if (typeof data.schedule_id === "number") return data.schedule_id;
    if (typeof data.resource?.id === "number") {
      if (!data.resource.type || data.resource.type === "schedule") {
        return data.resource.id;
      }
    }
    return undefined;
  };

  // Fetch session details if resource link is available
  const fetchSessionDetails = async () => {
    if (!hasResourceLink || !currentNotification.data?.link) return;

    const action = currentNotification.data?.action;

    // If action is review-schedule, fetch sessions and show modal
    if (action === "review-schedule") {
      const scheduleId = resolveScheduleId();
      if (!scheduleId) {
        toast.error(
          language === "th"
            ? "ไม่พบข้อมูลตารางเรียน"
            : "Schedule information not found",
          { position: "top-center" }
        );
        return;
      }

      setIsLoadingSession(true);
      try {
        // Fetch schedule sessions
        const response: unknown =
          await scheduleService.fetchNotificationResource(
            currentNotification.data.link.href,
            currentNotification.data.link.method || "GET"
          );

        // Type guard and check for sessions
        const sessionsData = response as { sessions?: Array<{ id: number }> };
        if (
          sessionsData?.sessions &&
          Array.isArray(sessionsData.sessions) &&
          sessionsData.sessions.length > 0
        ) {
          const firstSession = sessionsData.sessions[0];
          setSelectedSessionId(firstSession.id);
          setShowSessionModal(true);
        } else {
          toast(
            language === "th"
              ? "ไม่พบคาบเรียนในตารางนี้"
              : "No sessions found in this schedule",
            { icon: "ℹ️", position: "top-center" }
          );
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        toast.error(
          language === "th"
            ? "ไม่สามารถโหลดรายละเอียดได้"
            : "Failed to load details",
          { position: "top-center" }
        );
      } finally {
        setIsLoadingSession(false);
      }
      return;
    }

    // If action is review-missed-session, open SessionDetailModal directly
    if (action === "review-missed-session") {
      const sessionId = resolveSessionId();
      if (!sessionId) {
        toast.error(
          language === "th"
            ? "ไม่พบข้อมูลเซสชัน"
            : "Session information not found",
          { position: "top-center" }
        );
        return;
      }

      // Open SessionDetailModal directly with session_id
      setSelectedSessionId(sessionId);
      setShowSessionModal(true);
      return;
    }

    // Default behavior for other actions
    setIsLoadingSession(true);
    try {
      const sessionData = await scheduleService.fetchNotificationResource(
        currentNotification.data.link.href,
        currentNotification.data.link.method || "GET"
      );
      setSessionDetail(sessionData as SessionDetailResponse);
    } catch (error) {
      console.error("Failed to fetch session details:", error);
      toast.error(
        language === "th"
          ? "ไม่สามารถโหลดรายละเอียดได้"
          : "Failed to load details",
        {
          position: "top-center",
        }
      );
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Handle session confirmation (updated for new patterns)
  const handleSessionConfirm = async () => {
    const action = currentNotification.data?.action;
    if (action === "confirm-participation") {
      const scheduleId = resolveScheduleId();
      if (!scheduleId) {
        toast.error(
          language === "th"
            ? "ไม่พบข้อมูลตาราง จึงไม่สามารถยืนยันได้"
            : "Missing schedule information, confirmation cannot be sent.",
          { icon: "❌", position: "top-center" }
        );
        return;
      }

      setIsLoading(true);
      try {
        await scheduleService.updateParticipationStatus(
          scheduleId.toString(),
          "confirmed"
        );
        toast.success(
          language === "th"
            ? "ยืนยันการเข้าร่วมสำเร็จ"
            : "Participation confirmed successfully",
          {
            icon: "✅",
            position: "top-center",
          }
        );
        await onAccept();
      } catch (error) {
        console.error("Failed to confirm participation:", error);
        toast.error(
          language === "th" ? "ไม่สามารถยืนยันได้" : "Failed to confirm",
          {
            icon: "❌",
            position: "top-center",
          }
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const sessionId = resolveSessionId();

    if (!sessionId) {
      toast.error(
        language === "th"
          ? "ไม่พบข้อมูลเซสชัน จึงไม่สามารถยืนยันได้"
          : "Missing session information, confirmation cannot be sent.",
        { icon: "❌", position: "top-center" }
      );
      return;
    }

    setIsLoading(true);
    try {
      // Handle different action types
      switch (action) {
        case "confirm-session":
          await scheduleService.confirmSession(sessionId, "confirm");
          toast.success(
            language === "th"
              ? "ยืนยันเซสชันสำเร็จ"
              : "Session confirmed successfully",
            {
              icon: "✅",
              position: "top-center",
            }
          );
          break;

        default:
          // Default confirmation behavior
          await scheduleService.confirmSession(sessionId, "confirm");
          toast.success(
            language === "th" ? "ยืนยันสำเร็จ" : "Confirmed successfully",
            {
              icon: "✅",
              position: "top-center",
            }
          );
          break;
      }

      // Call the original accept handler
      await onAccept();
    } catch (error) {
      console.error("Failed to confirm:", error);
      toast.error(
        language === "th" ? "ไม่สามารถยืนยันได้" : "Failed to confirm",
        {
          icon: "❌",
          position: "top-center",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle session decline/cancel (updated for new patterns)
  const handleSessionDecline = async () => {
    const action = currentNotification.data?.action;

    if (action === "confirm-participation") {
      const scheduleId = resolveScheduleId();
      if (!scheduleId) {
        toast.error(
          language === "th"
            ? "ไม่พบข้อมูลตาราง จึงไม่สามารถปฏิเสธได้"
            : "Missing schedule information, decline cannot be sent.",
          { icon: "❌", position: "top-center" }
        );
        return;
      }

      setIsLoading(true);
      try {
        await scheduleService.updateParticipationStatus(
          scheduleId.toString(),
          "declined"
        );
        toast.success(
          language === "th"
            ? "ปฏิเสธการเข้าร่วมสำเร็จ"
            : "Participation declined successfully",
          {
            icon: "❌",
            position: "top-center",
          }
        );

        // Call the original decline handler
        await onDecline();
      } catch (error) {
        console.error("Failed to decline participation:", error);
        toast.error(
          language === "th" ? "ไม่สามารถปฏิเสธได้" : "Failed to decline",
          {
            icon: "❌",
            position: "top-center",
          }
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const sessionId = resolveSessionId();

    if (!sessionId) {
      toast.error(
        language === "th"
          ? "ไม่พบข้อมูลเซสชัน จึงไม่สามารถปฏิเสธได้"
          : "Missing session information, decline cannot be sent.",
        { icon: "❌", position: "top-center" }
      );
      return;
    }

    setIsLoading(true);
    try {
      // Handle different action types
      switch (action) {
        case "confirm-session":
          await scheduleService.confirmSession(sessionId, "decline");
          toast.success(
            language === "th"
              ? "ปฏิเสธเซสชันสำเร็จ"
              : "Session declined successfully",
            {
              icon: "❌",
              position: "top-center",
            }
          );
          break;

        default:
          // Default decline behavior
          await scheduleService.confirmSession(sessionId, "decline");
          toast.success(
            language === "th" ? "ปฏิเสธสำเร็จ" : "Declined successfully",
            {
              icon: "❌",
              position: "top-center",
            }
          );
          break;
      }

      // Call the original decline handler
      await onDecline();
    } catch (error) {
      console.error("Failed to decline:", error);
      toast.error(
        language === "th" ? "ไม่สามารถปฏิเสธได้" : "Failed to decline",
        {
          icon: "❌",
          position: "top-center",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle open/review actions (open-session, review-schedule, etc.)
  const handleOpenAction = async () => {
    const action = currentNotification.data?.action;
    const link = currentNotification.data?.link;

    setIsLoading(true);
    try {
      // If there's a link, execute it
      if (link?.href) {
        await scheduleService.executeLink(link);
      }

      // Show success message based on action type
      const successMessage = (() => {
        switch (action) {
          case "open-session":
            return language === "th"
              ? "เปิดเซสชันสำเร็จ"
              : "Session opened successfully";
          case "review-schedule":
          case "review-missed-session":
            return language === "th"
              ? "ตรวจสอบตารางเรียนสำเร็จ"
              : "Schedule reviewed successfully";
          case "open-today-schedule":
            return language === "th"
              ? "เปิดตารางวันนี้สำเร็จ"
              : "Today's schedule opened successfully";
          default:
            return language === "th" ? "เปิดสำเร็จ" : "Opened successfully";
        }
      })();

      toast.success(successMessage, {
        icon: "✅",
        position: "top-center",
      });

      // Call the original accept handler (open actions are typically "accept" actions)
      await onAccept();
    } catch (error) {
      console.error("Failed to execute action:", error);
      toast.error(
        language === "th"
          ? "ไม่สามารถดำเนินการได้"
          : "Failed to execute action",
        {
          icon: "❌",
          position: "top-center",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const title =
    currentNotification.title_th && language === "th"
      ? currentNotification.title_th
      : currentNotification.title;

  const message =
    currentNotification.message_th && language === "th"
      ? currentNotification.message_th
      : currentNotification.message;

  const handleAccept = async () => {
    const action = currentNotification.data?.action;

    if (isActionable) {
      // Route to appropriate handler based on action type
      switch (action) {
        case "confirm-session":
        case "confirm-participation":
          await handleSessionConfirm();
          break;
        case "open-session":
        case "review-schedule":
        case "review-missed-session":
        case "open-today-schedule":
          await handleOpenAction();
          break;
        default:
          // Fallback to session confirm for unknown actionable types
          await handleSessionConfirm();
          break;
      }
    } else {
      setIsLoading(true);
      try {
        await onAccept();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDecline = async () => {
    const action = currentNotification.data?.action;

    if (isActionable) {
      // Only confirmation actions should have decline option
      switch (action) {
        case "confirm-session":
        case "confirm-participation":
          await handleSessionDecline();
          break;
        default:
          // For other actionable types, just close the modal
          await onDecline();
          break;
      }
    } else {
      setIsLoading(true);
      try {
        await onDecline();
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper functions for button text and behavior based on action type
  const getAcceptButtonText = () => {
    const action = currentNotification.data?.action;

    if (!isActionable) {
      return language === "th" ? "ยอมรับ" : "Accept";
    }

    switch (action) {
      case "confirm-session":
        return language === "th" ? "ยืนยัน" : "Confirm";
      case "confirm-participation":
        return language === "th"
          ? "ยืนยันการเข้าร่วม"
          : "Confirm Participation";
      case "open-session":
        return language === "th" ? "เปิดเซสชัน" : "Open Session";
      case "review-schedule":
        return language === "th" ? "ดูตารางเรียน" : "Review Schedule";
      case "review-missed-session":
        return language === "th" ? "ดูเซสชันที่พลาด" : "Review Missed Session";
      case "open-today-schedule":
        return language === "th" ? "ดูตารางวันนี้" : "View Today's Schedule";
      default:
        return language === "th" ? "ยืนยัน" : "Confirm";
    }
  };

  const getDeclineButtonText = () => {
    const action = currentNotification.data?.action;

    if (!isActionable) {
      return language === "th" ? "ปฏิเสธ" : "Decline";
    }

    switch (action) {
      case "confirm-session":
        return language === "th" ? "ปฏิเสธ" : "Decline";
      case "confirm-participation":
        return language === "th"
          ? "ปฏิเสธการเข้าร่วม"
          : "Decline Participation";
      default:
        return language === "th" ? "ปิด" : "Close";
    }
  };

  const shouldShowDeclineButton = () => {
    const action = currentNotification.data?.action;

    if (!isActionable) {
      return true; // Non-actionable notifications always show decline/close
    }

    // Only confirmation actions should have decline option
    return ["confirm-session", "confirm-participation"].includes(action || "");
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      info: "📢",
      warning: "⚠️",
      error: "❌",
      success: "✅",
      class_confirmation: "✅",
      class_cancellation: "❌",
      schedule_change: "📅",
      payment_reminder: "💰",
      student_registration: "👨‍🎓",
      appointment_reminder: "🕐",
      class_reminder: "🎓",
      system_maintenance: "🔧",
      leave_approval: "📋",
      report_deadline: "📊",
      room_conflict: "⚠️",
      general: "📢",
    };
    return icons[type] || "📢";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> =
      {
        info: {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
        },
        warning: {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
        },
        error: {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
        },
        success: {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
        },
      };
    return colors[type] || colors.info;
  };

  const typeColor = getTypeColor(currentNotification.type);
  const isAcceptedView = !!viewingAccepted;

  // Safe teacher name (language-aware). Falls back to '-' when no teacher assigned.
  const teacherName = (() => {
    const teacher = sessionDetail?.session?.assigned_teacher;
    if (!teacher) return "-";
    // SessionDetailUser doesn't contain localized first/last names in current types.
    // Prefer `username`, then branch name, else fallback to '-' to be type-safe.
    if (teacher.username) return teacher.username;
    if (language === "th" && teacher.branch?.name_th)
      return teacher.branch.name_th;
    if (teacher.branch?.name_en) return teacher.branch.name_en;
    return "-";
  })();

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={isAcceptedView ? onCloseAccepted : undefined}
      >
        <DialogContent className={`max-w-md ${typeColor.border} border-2`}>
          <DialogHeader
            className={`${typeColor.bg} -m-6 mb-0 p-6 rounded-t-lg border-b ${typeColor.border}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {getTypeIcon(currentNotification.type)}
              </span>
              <div className="flex-1">
                <DialogTitle
                  className={`text-lg font-semibold ${typeColor.text} flex items-center gap-2`}
                >
                  {title}
                  {isAcceptedView && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      <Check size={12} />
                      <span>
                        {language === "th" ? "ยอมรับแล้ว" : "Accepted"}
                      </span>
                    </div>
                  )}
                  {!isAcceptedView && currentNotification.read && (
                    <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      <Check size={12} />
                      <span>{language === "th" ? "อ่านแล้ว" : "Read"}</span>
                    </div>
                  )}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <DialogDescription className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {message}
            </DialogDescription>

            {/* Session details button for actionable notifications */}
            {hasResourceLink && !isAcceptedView && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {language === "th"
                        ? "รายละเอียดเซสชัน"
                        : "Session Details"}
                    </span>
                  </div>
                  <button
                    onClick={fetchSessionDetails}
                    disabled={isLoadingSession}
                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingSession ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span>
                          {language === "th" ? "กำลังโหลด..." : "Loading..."}
                        </span>
                      </div>
                    ) : language === "th" ? (
                      "ดูรายละเอียด"
                    ) : (
                      "View Details"
                    )}
                  </button>
                </div>

                {/* Show session details if loaded */}
                {sessionDetail && (
                  <div className="mt-3 pt-3 border-t border-blue-200 text-sm">
                    {/* Session Status Badge */}
                    {sessionDetail.session?.status && (
                      <div className="mb-3">
                        <span className="font-medium text-gray-600 text-xs">
                          {language === "th" ? "สถานะ:" : "Status:"}
                        </span>
                        <div className="mt-1">
                          {(() => {
                            const status = sessionDetail.session.status;
                            const statusConfig: Record<
                              string,
                              { text: string; icon: string; className: string }
                            > = {
                              pending: {
                                text:
                                  language === "th" ? "รอการยืนยัน" : "Pending",
                                icon: "⏳",
                                className:
                                  "bg-yellow-100 text-yellow-800 border-yellow-300",
                              },
                              scheduled: {
                                text:
                                  language === "th"
                                    ? "กำหนดการแล้ว"
                                    : "Scheduled",
                                icon: "📅",
                                className:
                                  "bg-blue-100 text-blue-800 border-blue-300",
                              },
                              confirmed: {
                                text:
                                  language === "th"
                                    ? "ยืนยันแล้ว"
                                    : "Confirmed",
                                icon: "✅",
                                className:
                                  "bg-green-100 text-green-800 border-green-300",
                              },
                              cancelled: {
                                text:
                                  language === "th" ? "ยกเลิก" : "Cancelled",
                                icon: "❌",
                                className:
                                  "bg-red-100 text-red-800 border-red-300",
                              },
                              rescheduled: {
                                text:
                                  language === "th"
                                    ? "เลื่อนกำหนดการ"
                                    : "Rescheduled",
                                icon: "🔄",
                                className:
                                  "bg-purple-100 text-purple-800 border-purple-300",
                              },
                              "no-show": {
                                text:
                                  language === "th" ? "ไม่มาเรียน" : "No-show",
                                icon: "🚫",
                                className:
                                  "bg-orange-100 text-orange-800 border-orange-300",
                              },
                              completed: {
                                text:
                                  language === "th" ? "เสร็จสิ้น" : "Completed",
                                icon: "✔️",
                                className:
                                  "bg-emerald-100 text-emerald-800 border-emerald-300",
                              },
                            };
                            const config = statusConfig[status] || {
                              text: status,
                              icon: "ℹ️",
                              className:
                                "bg-gray-100 text-gray-800 border-gray-300",
                            };
                            return (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.className}`}
                              >
                                <span>{config.icon}</span>
                                {config.text}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {sessionDetail.session && (
                        <>
                          <div>
                            <span className="font-medium text-gray-600">
                              {language === "th" ? "วันที่:" : "Date:"}
                            </span>
                            <br />
                            <span className="text-gray-800">
                              {new Date(
                                sessionDetail.session.session_date
                              ).toLocaleDateString(
                                language === "th" ? "th-TH" : "en-US"
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              {language === "th" ? "เวลา:" : "Time:"}
                            </span>
                            <br />
                            <span className="text-gray-800">
                              {sessionDetail.session.start_time} -{" "}
                              {sessionDetail.session.end_time}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              {language === "th" ? "ครู:" : "Teacher:"}
                            </span>
                            <br />
                            <span className="text-gray-800">{teacherName}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              {language === "th" ? "ห้องเรียน:" : "Room:"}
                            </span>
                            <br />
                            <span className="text-gray-800">
                              {sessionDetail.session.room?.room_name || "-"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Pending Session Actions */}
                    {sessionDetail.session?.status === "pending" &&
                      !currentNotification.read && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-xs text-gray-600 mb-2">
                            {language === "th"
                              ? "คาบเรียนนี้รอการยืนยันจากคุณ:"
                              : "This session requires your confirmation:"}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                const sessionId = resolveSessionId();
                                if (!sessionId) {
                                  toast.error(
                                    language === "th"
                                      ? "ไม่พบข้อมูลเซสชัน"
                                      : "Session not found"
                                  );
                                  return;
                                }

                                try {
                                  await teacherDeclineSession(sessionId);
                                  toast.success(
                                    language === "th"
                                      ? "ปฏิเสธคาบเรียนสำเร็จ"
                                      : "Session declined successfully",
                                    { icon: "❌" }
                                  );
                                  await fetchSessionDetails();
                                } catch (error) {
                                  console.error("Failed to decline:", error);
                                  toast.error(
                                    language === "th"
                                      ? "ไม่สามารถปฏิเสธได้"
                                      : "Failed to decline"
                                  );
                                }
                              }}
                              className="flex-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-300 rounded hover:bg-red-100 transition-colors"
                            >
                              {language === "th" ? "ปฏิเสธ" : "Decline"}
                            </button>
                            <button
                              onClick={async () => {
                                const sessionId = resolveSessionId();
                                if (!sessionId) {
                                  toast.error(
                                    language === "th"
                                      ? "ไม่พบข้อมูลเซสชัน"
                                      : "Session not found"
                                  );
                                  return;
                                }

                                try {
                                  await teacherConfirmSession(sessionId);
                                  toast.success(
                                    language === "th"
                                      ? "ยืนยันคาบเรียนสำเร็จ"
                                      : "Session confirmed successfully",
                                    { icon: "✅" }
                                  );
                                  await fetchSessionDetails();
                                } catch (error) {
                                  console.error("Failed to confirm:", error);
                                  toast.error(
                                    language === "th"
                                      ? "ไม่สามารถยืนยันได้"
                                      : "Failed to confirm"
                                  );
                                }
                              }}
                              className="flex-1 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-300 rounded hover:bg-green-100 transition-colors"
                            >
                              {language === "th" ? "ยืนยัน" : "Confirm"}
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {currentNotification.sender?.name ??
                    (language === "th" ? "ระบบ" : "System")}
                </span>
                <span>
                  {new Date(currentNotification.created_at).toLocaleString(
                    language === "th" ? "th-TH" : "en-US"
                  )}
                </span>
              </div>
              {currentNotification.branch && (
                <div className="text-xs text-gray-500 mt-1">
                  {currentNotification.branch.name_th && language === "th"
                    ? currentNotification.branch.name_th
                    : currentNotification.branch.name_en}
                </div>
              )}
              {isAcceptedView && "acceptedAt" in currentNotification && (
                <div className="text-xs text-green-600 mt-2 font-medium">
                  {language === "th" ? "ยอมรับเมื่อ: " : "Accepted at: "}
                  {new Date(
                    (
                      currentNotification as AcceptedPopupNotification
                    ).acceptedAt
                  ).toLocaleString(language === "th" ? "th-TH" : "en-US")}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3">
            {isAcceptedView || currentNotification.read ? (
              // If notification is already read or accepted, show only close button
              <button
                onClick={isAcceptedView ? onCloseAccepted : onDecline}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
              >
                {language === "th" ? "ปิด" : "Close"}
              </button>
            ) : (
              // If notification is unread, show action buttons
              <>
                {shouldShowDeclineButton() && (
                  <button
                    onClick={handleDecline}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <span>
                          {language === "th"
                            ? "กำลังดำเนินการ..."
                            : "Processing..."}
                        </span>
                      </div>
                    ) : (
                      getDeclineButtonText()
                    )}
                  </button>
                )}
                <button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    isActionable
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 border-2 rounded-full animate-spin ${
                          isActionable
                            ? "border-green-300 border-t-white"
                            : "border-blue-300 border-t-white"
                        }`}
                      ></div>
                      <span>
                        {language === "th"
                          ? "กำลังดำเนินการ..."
                          : "Processing..."}
                      </span>
                    </div>
                  ) : (
                    getAcceptButtonText()
                  )}
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Detail Modal - Opens when viewing schedule sessions */}
      {showSessionModal && selectedSessionId && (
        <SessionDetailModal
          isOpen={showSessionModal}
          onClose={() => {
            setShowSessionModal(false);
            setSelectedSessionId(null);
          }}
          sessionId={selectedSessionId}
        />
      )}
    </>
  );
}
