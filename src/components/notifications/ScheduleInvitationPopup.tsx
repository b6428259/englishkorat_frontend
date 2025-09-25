"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  confirmScheduleParticipation,
  getScheduleForInvitation,
} from "@/services/api/schedules";
import type { Notification } from "@/types/notification";
import { Calendar, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface ScheduleInvitationPopupProps {
  notification: Notification & {
    scheduleData?: {
      id: number;
      schedule_name: string;
      schedule_type: string;
      start_date: string;
      estimated_end_date?: string;
      notes?: string;
      participants?: Array<{
        user_id: number;
        role: string;
        status: string;
        user: { id: number; username: string };
      }>;
      sessions?: Array<{
        id: number;
        date: string;
        start_time: string;
        end_time: string;
        status: string;
      }>;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: "confirmed" | "declined" | "tentative") => void;
}

interface ScheduleDetails {
  id: number;
  schedule_name: string;
  schedule_type: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export default function ScheduleInvitationPopup({
  notification,
  isOpen,
  onClose,
  onConfirm,
}: ScheduleInvitationPopupProps) {
  const { language } = useLanguage();
  const [scheduleDetails, setScheduleDetails] =
    useState<ScheduleDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const scheduleId = notification.data?.schedule_id;

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      // If we already have schedule data from context, use it
      if (notification.scheduleData) {
        setScheduleDetails({
          id: notification.scheduleData.id,
          schedule_name: notification.scheduleData.schedule_name,
          schedule_type: notification.scheduleData.schedule_type,
          start_date: notification.scheduleData.start_date,
          end_date: notification.scheduleData.estimated_end_date,
          description: notification.scheduleData.notes,
        });
        return;
      }

      // Otherwise fetch from API
      if (!scheduleId || !isOpen) return;

      setLoading(true);
      try {
        const details = await getScheduleForInvitation(scheduleId);
        setScheduleDetails(details);
      } catch (error) {
        console.error("Failed to fetch schedule details:", error);
        toast.error(
          language === "th"
            ? "ไม่สามารถโหลดรายละเอียดนัดหมายได้"
            : "Failed to load schedule details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [scheduleId, isOpen, language, notification.scheduleData]);

  const handleParticipationResponse = async (
    status: "confirmed" | "declined" | "tentative"
  ) => {
    if (!scheduleId) return;

    setActionLoading(true);
    try {
      await confirmScheduleParticipation(scheduleId, status);

      const statusMessages = {
        confirmed: {
          th: "ยืนยันการเข้าร่วมเรียบร้อยแล้ว",
          en: "Participation confirmed successfully",
        },
        declined: {
          th: "ปฏิเสธการเข้าร่วมเรียบร้อยแล้ว",
          en: "Participation declined successfully",
        },
        tentative: {
          th: "ตอบรับเป็นการชั่วคราวเรียบร้อยแล้ว",
          en: "Tentative response recorded successfully",
        },
      };

      toast.success(statusMessages[status][language]);

      onConfirm(status);
      onClose();
    } catch (error) {
      console.error("Failed to respond to invitation:", error);
      toast.error(
        language === "th"
          ? "ไม่สามารถตอบรับคำเชิญได้"
          : "Failed to respond to invitation"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Handle different date formats from the API
      let date: Date;
      if (dateString.includes("T")) {
        // ISO format with timezone (e.g., "2025-09-23T07:00:00+07:00")
        date = new Date(dateString);
      } else {
        // Date-only format (e.g., "2025-09-23")
        date = new Date(dateString + "T00:00:00");
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return dateString; // Return original string if parsing fails
      }

      return date.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
    } catch (error) {
      console.error("Date formatting error:", error, dateString);
      return dateString; // Return original string if parsing fails
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // Handle time format like "19:30"
      const [hours, minutes] = timeString.split(":");
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      return time.toLocaleTimeString(language === "th" ? "th-TH" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      console.error("Time formatting error:", error, timeString);
      return timeString;
    }
  };

  const getScheduleTypeLabel = (type: string) => {
    const typeLabels: Record<string, { th: string; en: string }> = {
      meeting: { th: "ประชุม", en: "Meeting" },
      appointment: { th: "นัดหมาย", en: "Appointment" },
      event: { th: "งาน", en: "Event" },
      consultation: { th: "ให้คำปรึกษา", en: "Consultation" },
      class: { th: "คลาสเรียน", en: "Class" },
    };

    return typeLabels[type]?.[language] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md mx-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {language === "th" ? "คำเชิญเข้าร่วม" : "Schedule Invitation"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600">
            {notification.message_th || notification.message}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : scheduleDetails ? (
          <div className="space-y-4 py-2">
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">
                {scheduleDetails.schedule_name}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {getScheduleTypeLabel(scheduleDetails.schedule_type)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(scheduleDetails.start_date)}</span>
                </div>

                {scheduleDetails.end_date &&
                  scheduleDetails.end_date !== scheduleDetails.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {language === "th" ? "ถึง " : "Until "}
                        {formatDate(scheduleDetails.end_date)}
                      </span>
                    </div>
                  )}

                {/* Show session information if available */}
                {notification.scheduleData?.sessions &&
                  notification.scheduleData.sessions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        {language === "th" ? "เซสชันถัดไป:" : "Next Session:"}
                      </div>
                      {notification.scheduleData.sessions
                        .slice(0, 2)
                        .map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center gap-2 text-xs text-gray-600"
                          >
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDate(session.date)} •{" "}
                              {formatTime(session.start_time)} -{" "}
                              {formatTime(session.end_time)}
                            </span>
                          </div>
                        ))}
                      {notification.scheduleData.sessions.length > 2 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {language === "th"
                            ? `และอีก ${
                                notification.scheduleData.sessions.length - 2
                              } เซสชัน`
                            : `+${
                                notification.scheduleData.sessions.length - 2
                              } more sessions`}
                        </div>
                      )}
                    </div>
                  )}

                {/* Show participants count if available */}
                {notification.scheduleData?.participants &&
                  notification.scheduleData.participants.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Users className="h-3 w-3" />
                      <span>
                        {language === "th"
                          ? `ผู้เข้าร่วม ${notification.scheduleData.participants.length} คน`
                          : `${notification.scheduleData.participants.length} participants`}
                      </span>
                    </div>
                  )}
              </div>

              {scheduleDetails.description && (
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-sm text-gray-700">
                    {scheduleDetails.description}
                  </p>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-600">
              {language === "th"
                ? "คุณต้องการเข้าร่วมหรือไม่?"
                : "Would you like to participate?"}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {language === "th"
              ? "ไม่สามารถโหลดรายละเอียดได้"
              : "Unable to load details"}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleParticipationResponse("declined")}
            disabled={actionLoading || loading || !scheduleDetails}
            className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50"
          >
            {actionLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : language === "th" ? (
              "ปฏิเสธ"
            ) : (
              "Decline"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleParticipationResponse("tentative")}
            disabled={actionLoading || loading || !scheduleDetails}
            className="w-full sm:w-auto border-yellow-300 text-yellow-600 hover:bg-yellow-50"
          >
            {actionLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : language === "th" ? (
              "ชั่วคราว"
            ) : (
              "Maybe"
            )}
          </Button>

          <Button
            onClick={() => handleParticipationResponse("confirmed")}
            disabled={actionLoading || loading || !scheduleDetails}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {actionLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : language === "th" ? (
              "ยืนยัน"
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
