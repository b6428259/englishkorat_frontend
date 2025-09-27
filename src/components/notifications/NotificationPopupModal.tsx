"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  scheduleService,
  SessionDetailResponse,
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

  // Play notification sound when popup opens
  useEffect(() => {
    if (isOpen && notification && !viewingAccepted) {
      playNotificationSound();
    }
  }, [isOpen, notification, viewingAccepted]);

  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  };

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
                    <span>{language === "th" ? "ยอมรับแล้ว" : "Accepted"}</span>
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
                    {language === "th" ? "รายละเอียดเซสชัน" : "Session Details"}
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
                  (currentNotification as AcceptedPopupNotification).acceptedAt
                ).toLocaleString(language === "th" ? "th-TH" : "en-US")}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3">
          {isAcceptedView ? (
            <button
              onClick={onCloseAccepted}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
            >
              {language === "th" ? "ปิด" : "Close"}
            </button>
          ) : (
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
  );
}
