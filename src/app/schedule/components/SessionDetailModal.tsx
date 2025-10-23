"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import CancelSessionModal from "@/components/schedule/CancelSessionModal";
import MakeupQuotaBadge from "@/components/schedule/MakeupQuotaBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CreateSessionCommentRequest,
  Room,
  scheduleService,
  SessionComment,
  SessionDetailResponse,
  teacherConfirmSession,
  teacherDeclineSession,
  TeacherOption,
  undoSessionCancellation,
  updateScheduleMakeupQuota,
  updateSession,
  UpdateSessionRequest,
} from "@/services/api/schedules";
import { UpdateScheduleMakeupQuotaRequest } from "@/types/session-cancellation.types";
import {
  AlertCircle,
  Award,
  Ban,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  FileText,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Save,
  Smile,
  Users,
  UserX,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  onUpdate?: () => void | Promise<void>;
  onAddSessionBefore?: (session: SessionDetailResponse) => void;
  onAddSessionAfter?: (session: SessionDetailResponse) => void;
  onAddSessionCustom?: (
    scheduleId: number,
    sessionDetail: SessionDetailResponse
  ) => void;
}

export default function SessionDetailModal({
  isOpen,
  onClose,
  sessionId,
  onUpdate,
  onAddSessionBefore,
  onAddSessionAfter,
  onAddSessionCustom,
}: SessionDetailModalProps) {
  const { language } = useLanguage();
  const { hasRole, user } = useAuth();

  const [sessionDetail, setSessionDetail] =
    useState<SessionDetailResponse | null>(null);
  const [sessionComments, setSessionComments] = useState<SessionComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<UpdateSessionRequest>({});
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Cancel session state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isUndoingCancellation, setIsUndoingCancellation] = useState(false);

  // Edit makeup quota state (Admin only)
  const [editQuotaValue, setEditQuotaValue] = useState<number>(2);
  const [editQuotaReason, setEditQuotaReason] = useState("");
  const [isUpdatingQuota, setIsUpdatingQuota] = useState(false);

  // Check if user is admin or owner
  const canEdit = hasRole(["admin", "owner"]);

  // Check if session can be cancelled
  const canCancelSession = () => {
    if (!sessionDetail) return false;

    const session = sessionDetail.session;

    // Cannot cancel if already cancelled, completed, or pending cancellation
    if (
      session.status === "cancelled" ||
      session.status === "completed" ||
      session.status === "cancellation_pending"
    ) {
      return false;
    }

    // Admin/Owner can cancel any session anytime
    if (hasRole(["admin", "owner"])) {
      return true;
    }

    // Teacher can only cancel their own sessions
    if (hasRole(["teacher"])) {
      // Must be the assigned teacher
      const isAssignedTeacher = session.assigned_teacher_id === user?.id;
      if (!isAssignedTeacher) {
        return false;
      }

      // Must be at least 24 hours before session
      try {
        const datePart = session.session_date.split("T")[0];
        let timePart = session.start_time;
        if (timePart.includes("T")) {
          timePart = timePart.split("T")[1];
        }
        timePart = timePart.substring(0, 5);

        const sessionDateTime = new Date(`${datePart}T${timePart}:00`);
        const now = new Date();
        const hoursUntilSession =
          (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        return hoursUntilSession >= 24;
      } catch (error) {
        console.error("Error checking cancel session deadline:", error);
        return false;
      }
    }

    return false;
  };

  const handleCancelSessionSuccess = () => {
    // Refresh session detail to show updated status
    fetchSessionDetail();
    if (onUpdate) {
      onUpdate();
    }
  };

  const fetchSessionDetail = async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const response = await scheduleService.getSessionDetail(
        sessionId.toString()
      );
      setSessionDetail(response);
    } catch (error) {
      console.error("Failed to fetch session detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionComments = async () => {
    if (!sessionId) return;

    try {
      setIsCommentsLoading(true);
      const response = await scheduleService.getSessionComments(sessionId);
      setSessionComments(response.comments);
    } catch (error) {
      console.error("Failed to fetch session comments:", error);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  // Handle update makeup quota (Admin only)
  const handleUpdateMakeupQuota = async () => {
    if (!sessionDetail?.session?.schedule_id) {
      toast.error(
        language === "th"
          ? "ไม่พบข้อมูล Schedule"
          : "Schedule information not found"
      );
      return;
    }

    // Validate quota value
    if (editQuotaValue < 0 || editQuotaValue > 20) {
      toast.error(
        language === "th"
          ? "โควต้าต้องอยู่ระหว่าง 0-20"
          : "Quota must be between 0-20"
      );
      return;
    }

    const currentQuota = sessionDetail.session.schedule?.make_up_quota ?? 2;
    if (editQuotaValue === currentQuota) {
      toast.error(
        language === "th"
          ? "โควต้าใหม่ต้องไม่เท่ากับโควต้าเดิม"
          : "New quota must be different from current quota"
      );
      return;
    }

    try {
      setIsUpdatingQuota(true);

      const request: UpdateScheduleMakeupQuotaRequest = {
        new_quota: editQuotaValue,
        reason: editQuotaReason || undefined,
      };

      const response = await updateScheduleMakeupQuota(
        sessionDetail.session.schedule_id,
        request
      );

      if (response.success) {
        toast.success(
          language === "th"
            ? `อัปเดตโควต้าชดเชยเรียบร้อย (${response.schedule.old_quota} → ${response.schedule.new_quota})`
            : `Makeup quota updated successfully (${response.schedule.old_quota} → ${response.schedule.new_quota})`,
          { duration: 4000 }
        );

        // Clear reason field
        setEditQuotaReason("");

        // Refresh session detail to get updated quota
        await fetchSessionDetail();

        // Notify parent to refresh if needed
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error: unknown) {
      console.error("Failed to update makeup quota:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (language === "th"
          ? "ไม่สามารถอัปเดตโควต้าได้"
          : "Failed to update quota");
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsUpdatingQuota(false);
    }
  };

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSessionDetail();
      fetchSessionComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sessionId]);

  // Initialize quota value when session detail is loaded
  useEffect(() => {
    if (sessionDetail?.session?.schedule?.make_up_quota !== undefined) {
      setEditQuotaValue(sessionDetail.session.schedule.make_up_quota);
    }
  }, [sessionDetail]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !sessionId) return;

    try {
      setIsSubmittingComment(true);
      const commentData: CreateSessionCommentRequest = {
        session_id: sessionId,
        comment: newComment.trim(),
      };

      await scheduleService.createSessionComment(commentData);
      setNewComment("");
      setShowEmojiPicker(false);
      await fetchSessionComments();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewComment((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleConfirmSession = async () => {
    if (!sessionId) return;

    try {
      setIsConfirming(true);
      await teacherConfirmSession(sessionId);
      toast.success(
        language === "th"
          ? "ยืนยันคาบเรียนสำเร็จ"
          : "Session confirmed successfully",
        { position: "top-center", icon: "✅" }
      );
      await fetchSessionDetail();
    } catch (error) {
      console.error("Failed to confirm session:", error);
      toast.error(
        language === "th" ? "ไม่สามารถยืนยันได้" : "Failed to confirm session",
        { position: "top-center" }
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDeclineSession = async () => {
    if (!sessionId) return;

    try {
      setIsDeclining(true);
      await teacherDeclineSession(sessionId);
      toast.success(
        language === "th"
          ? "ปฏิเสธคาบเรียนสำเร็จ"
          : "Session declined successfully",
        { position: "top-center", icon: "❌" }
      );
      await fetchSessionDetail();
    } catch (error) {
      console.error("Failed to decline session:", error);
      toast.error(
        language === "th" ? "ไม่สามารถปฏิเสธได้" : "Failed to decline session",
        { position: "top-center" }
      );
    } finally {
      setIsDeclining(false);
    }
  };

  // Load teachers and rooms for edit mode
  const loadEditOptions = async () => {
    try {
      setIsLoadingOptions(true);
      const [teachersData, roomsData] = await Promise.all([
        scheduleService.getTeachers(),
        scheduleService.getRooms(),
      ]);
      setTeachers(teachersData.data);
      setRooms(roomsData.data);
    } catch (error) {
      console.error("Failed to load edit options:", error);
      toast.error(
        language === "th" ? "ไม่สามารถโหลดข้อมูลได้" : "Failed to load data",
        { position: "top-center" }
      );
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Enter edit mode
  const handleEnterEditMode = async () => {
    if (!sessionDetail) return;

    await loadEditOptions();

    setEditForm({
      session_date: sessionDetail.session.session_date.split("T")[0],
      start_time:
        sessionDetail.session.start_time.split("T")[1]?.substring(0, 5) || "",
      end_time:
        sessionDetail.session.end_time.split("T")[1]?.substring(0, 5) || "",
      status: sessionDetail.session.status as UpdateSessionRequest["status"],
      notes: "",
    });
    setIsEditMode(true);
  };

  // Exit edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm({});
  };

  // Save session updates
  const handleSaveSession = async () => {
    if (!sessionId || !editForm) return;

    try {
      setIsSaving(true);

      // Build update payload - only include changed fields
      const updates: UpdateSessionRequest = {};

      if (editForm.session_date) {
        updates.session_date = editForm.session_date;
      }
      if (editForm.start_time) {
        updates.start_time = editForm.start_time;
      }
      if (editForm.end_time) {
        updates.end_time = editForm.end_time;
      }
      if (editForm.assigned_teacher_id !== undefined) {
        updates.assigned_teacher_id = editForm.assigned_teacher_id;
      }
      if (editForm.room_id !== undefined) {
        updates.room_id = editForm.room_id;
      }
      if (editForm.status) {
        updates.status = editForm.status;
      }
      if (editForm.notes) {
        updates.notes = editForm.notes;
      }
      if (editForm.cancelling_reason) {
        updates.cancelling_reason = editForm.cancelling_reason;
      }

      await updateSession(sessionId, updates);

      toast.success(
        language === "th"
          ? "อัปเดตคาบเรียนสำเร็จ"
          : "Session updated successfully",
        { position: "top-center", icon: "✅" }
      );

      setIsEditMode(false);
      await fetchSessionDetail();

      // Refresh the schedule table in the parent component
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      console.error("Failed to update session:", error);
      toast.error(
        language === "th"
          ? "ไม่สามารถอัปเดตคาบเรียนได้"
          : "Failed to update session",
        { position: "top-center" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndoCancellation = async () => {
    if (!sessionId) return;

    const confirmMessage =
      language === "th"
        ? "คุณต้องการยกเลิกคำขอยกเลิกคาบเรียนนี้ใช่หรือไม่?"
        : "Are you sure you want to withdraw the cancellation request?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsUndoingCancellation(true);

      await undoSessionCancellation(sessionId);

      toast.success(
        language === "th"
          ? "ยกเลิกคำขอยกเลิกสำเร็จ คาบเรียนกลับมาเป็นปกติแล้ว"
          : "Cancellation request withdrawn. Session is now scheduled.",
        { position: "top-center", icon: "✅" }
      );

      await fetchSessionDetail();

      // Refresh the schedule table in the parent component
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      console.error("Failed to undo cancellation:", error);
      toast.error(
        language === "th"
          ? "ไม่สามารถยกเลิกคำขอได้"
          : "Failed to withdraw cancellation request",
        { position: "top-center" }
      );
    } finally {
      setIsUndoingCancellation(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(language === "th" ? "th-TH" : "en-US"),
      time: date.toLocaleTimeString(language === "th" ? "th-TH" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        variant: "warning" as const,
        icon: Clock,
        text: language === "th" ? "รอการยืนยัน" : "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
      pending_cancellation: {
        variant: "warning" as const,
        icon: AlertCircle,
        text: language === "th" ? "รอการอนุมัติยกเลิก" : "Pending Cancellation",
        className: "bg-orange-100 text-orange-800 border-orange-300",
      },
      scheduled: {
        variant: "secondary" as const,
        icon: Calendar,
        text: language === "th" ? "กำหนดการแล้ว" : "Scheduled",
        className: "bg-blue-100 text-blue-800 border-blue-300",
      },
      confirmed: {
        variant: "success" as const,
        icon: CheckCircle,
        text: language === "th" ? "ยืนยันแล้ว" : "Confirmed",
        className: "bg-green-100 text-green-800 border-green-300",
      },
      cancelled: {
        variant: "destructive" as const,
        icon: XCircle,
        text: language === "th" ? "ยกเลิก" : "Cancelled",
        className: "bg-red-100 text-red-800 border-red-300",
      },
      rescheduled: {
        variant: "secondary" as const,
        icon: RefreshCw,
        text: language === "th" ? "เลื่อนกำหนดการ" : "Rescheduled",
        className: "bg-purple-100 text-purple-800 border-purple-300",
      },
      "no-show": {
        variant: "destructive" as const,
        icon: UserX,
        text: language === "th" ? "ไม่มาเรียน" : "No-show",
        className: "bg-orange-100 text-orange-800 border-orange-300",
      },
      completed: {
        variant: "success" as const,
        icon: CheckCircle,
        text: language === "th" ? "เสร็จสิ้น" : "Completed",
        className: "bg-emerald-100 text-emerald-800 border-emerald-300",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      icon: AlertCircle,
      text: status,
      className: "bg-gray-100 text-gray-800 border-gray-300",
    };
    const IconComponent = config.icon;

    return (
      <Badge
        variant={config.variant}
        className={`inline-flex items-center gap-1 ${config.className}`}
      >
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (!sessionId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        <DialogHeader className="border-b border-gray-300 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-indigo-600" />
              {language === "th" ? "รายละเอียดคาบเรียน" : "Session Details"}
              <span className="text-lg text-black">#{sessionId}</span>
            </DialogTitle>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="details"
                className="flex items-center gap-2 text-black"
              >
                <FileText className="h-4 w-4 text-black" />
                {language === "th" ? "รายละเอียด" : "Details"}
              </TabsTrigger>
              <TabsTrigger
                value="group"
                className="flex items-center gap-2 text-black"
              >
                <Users className="h-4 w-4 text-black" />
                {language === "th" ? "กลุ่ม" : "Group"}
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="flex items-center gap-2 text-black"
              >
                <MessageSquare className="h-4 w-4 text-black" />
                {language === "th" ? "ความคิดเห็น" : "Comments"} (
                {sessionComments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="details"
              className="flex-1 overflow-hidden min-h-0"
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="md" />
                </div>
              ) : sessionDetail ? (
                <div className="space-y-4 md:space-y-6 overflow-y-auto max-h-[65vh] p-1 md:p-2">
                  {/* Session Status & Basic Info */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 md:p-6 rounded-xl border border-indigo-200 shadow-sm">
                    {/* Header with Title and Status */}
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base md:text-xl font-semibold text-gray-900 break-words line-clamp-2 flex-1">
                          {sessionDetail.session.schedule_name}
                        </h3>
                        {!isEditMode && (
                          <div className="flex-shrink-0">
                            {getStatusBadge(sessionDetail.session.status)}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Edit Mode Controls */}
                        {isEditMode ? (
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <Button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              variant="cancel"
                              className="px-3 md:px-4 py-2 text-xs md:text-sm flex-1 sm:flex-none min-w-[100px]"
                            >
                              <X className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" />
                              {language === "th" ? "ยกเลิก" : "Cancel"}
                            </Button>
                            <Button
                              onClick={handleSaveSession}
                              disabled={isSaving}
                              variant="monthViewClicked"
                              className="px-3 md:px-4 py-2 text-xs md:text-sm flex-1 sm:flex-none min-w-[100px]"
                            >
                              {isSaving ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <Save className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" />
                                  {language === "th" ? "บันทึก" : "Save"}
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <>
                            {/* Undo Cancellation Button - แสดงเมื่อสถานะเป็น cancellation_pending */}
                            {sessionDetail.session.status ===
                              "cancellation_pending" && (
                              <Button
                                onClick={handleUndoCancellation}
                                disabled={isUndoingCancellation}
                                variant="cancel"
                                className="px-3 md:px-5 py-2 text-xs md:text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 min-w-[120px] md:min-w-[160px]"
                              >
                                {isUndoingCancellation ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                                    <span className="hidden md:inline truncate">
                                      {language === "th"
                                        ? "ถอนคำขอยกเลิก"
                                        : "Withdraw Request"}
                                    </span>
                                    <span className="md:hidden truncate">
                                      {language === "th"
                                        ? "ถอนคำขอ"
                                        : "Withdraw"}
                                    </span>
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Cancel Session Button */}
                            {canCancelSession() && (
                              <Button
                                onClick={() => setShowCancelModal(true)}
                                variant="cancel"
                                className="px-3 md:px-5 py-2 text-xs md:text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 min-w-[120px] md:min-w-[160px]"
                              >
                                <Ban className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                                <span className="hidden md:inline truncate">
                                  {language === "th"
                                    ? "ขอยกเลิกคาบเรียน"
                                    : "Request Cancel"}
                                </span>
                                <span className="md:hidden truncate">
                                  {language === "th" ? "ยกเลิก" : "Cancel"}
                                </span>
                              </Button>
                            )}

                            {/* Admin Edit Button */}
                            {canEdit && (
                              <Button
                                onClick={handleEnterEditMode}
                                variant="monthViewClicked"
                                className="px-3 md:px-5 py-2 text-xs md:text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 min-w-[100px] md:min-w-[120px]"
                              >
                                <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {language === "th" ? "แก้ไข" : "Edit"}
                                </span>
                              </Button>
                            )}

                            {/* Teacher Confirm/Decline */}
                            {sessionDetail.session.status === "pending" && (
                              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <Button
                                  onClick={handleDeclineSession}
                                  disabled={isDeclining || isConfirming}
                                  variant="cancel"
                                  className="px-3 md:px-4 py-2 text-xs md:text-sm flex-1 sm:flex-none min-w-[100px]"
                                >
                                  {isDeclining ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <Ban className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" />
                                      {language === "th" ? "ปฏิเสธ" : "Decline"}
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={handleConfirmSession}
                                  disabled={isConfirming || isDeclining}
                                  variant="monthViewClicked"
                                  className="px-3 md:px-4 py-2 text-xs md:text-sm flex-1 sm:flex-none min-w-[100px]"
                                >
                                  {isConfirming ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" />
                                      {language === "th" ? "ยืนยัน" : "Confirm"}
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Cancellation Pending Alert */}
                    {sessionDetail.session.status === "cancellation_pending" &&
                      sessionDetail.session.cancelling_reason && (
                        <div className="mt-4 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 p-3 md:p-4 rounded-lg shadow-sm">
                          <div className="flex items-start gap-2 md:gap-3">
                            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
                              <h4 className="text-xs md:text-sm font-semibold text-orange-900">
                                {language === "th"
                                  ? "📝 ส่งคำขอยกเลิกคาบเรียนแล้ว"
                                  : "📝 Cancellation Request Submitted"}
                              </h4>
                              <div className="bg-white/60 rounded-md p-2 md:p-2.5">
                                <p className="text-xs md:text-sm text-orange-800 break-words">
                                  <span className="font-semibold">
                                    {language === "th"
                                      ? "เหตุผล: "
                                      : "Reason: "}
                                  </span>
                                  <span className="text-gray-700">
                                    {sessionDetail.session.cancelling_reason}
                                  </span>
                                </p>
                              </div>
                              <p className="text-[10px] md:text-xs text-orange-600 flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {language === "th"
                                    ? "รอการอนุมัติจากผู้ดูแลระบบ"
                                    : "Waiting for admin approval"}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {isEditMode ? (
                      /* Edit Mode Form */
                      <div className="space-y-4 text-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          {/* Date */}
                          <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                              {language === "th" ? "วันที่" : "Date"}
                            </label>
                            <input
                              type="date"
                              value={editForm.session_date || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  session_date: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                          </div>

                          {/* Start Time */}
                          <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                              {language === "th" ? "เวลาเริ่ม" : "Start Time"}
                            </label>
                            <input
                              type="time"
                              value={editForm.start_time || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  start_time: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                          </div>

                          {/* End Time */}
                          <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                              {language === "th" ? "เวลาสิ้นสุด" : "End Time"}
                            </label>
                            <input
                              type="time"
                              value={editForm.end_time || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  end_time: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                          </div>

                          {/* Status */}
                          <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                              {language === "th" ? "สถานะ" : "Status"}
                            </label>
                            <select
                              value={editForm.status || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  status: e.target
                                    .value as UpdateSessionRequest["status"],
                                })
                              }
                              className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            >
                              <option value="scheduled">
                                {language === "th"
                                  ? "กำหนดการแล้ว"
                                  : "Scheduled"}
                              </option>
                              <option value="confirmed">
                                {language === "th" ? "ยืนยันแล้ว" : "Confirmed"}
                              </option>
                              <option value="pending">
                                {language === "th" ? "รอการยืนยัน" : "Pending"}
                              </option>
                              <option value="completed">
                                {language === "th" ? "เสร็จสิ้น" : "Completed"}
                              </option>
                              <option value="cancelled">
                                {language === "th" ? "ยกเลิก" : "Cancelled"}
                              </option>
                              <option value="rescheduled">
                                {language === "th"
                                  ? "เลื่อนกำหนดการ"
                                  : "Rescheduled"}
                              </option>
                              <option value="no-show">
                                {language === "th" ? "ไม่มาเรียน" : "No-show"}
                              </option>
                            </select>
                          </div>

                          {/* Teacher */}
                          <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                              {language === "th" ? "ครู" : "Teacher"}
                            </label>
                            {isLoadingOptions ? (
                              <div className="flex items-center justify-center py-2">
                                <LoadingSpinner size="sm" />
                              </div>
                            ) : (
                              <select
                                value={editForm.assigned_teacher_id || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    assigned_teacher_id:
                                      Number.parseInt(e.target.value) ||
                                      undefined,
                                  })
                                }
                                className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              >
                                <option value="">
                                  {language === "th"
                                    ? "เลือกครู"
                                    : "Select Teacher"}
                                </option>
                                {teachers.map((teacher) => (
                                  <option key={teacher.id} value={teacher.id}>
                                    {teacher.teacher_name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* Room */}
                          <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                              {language === "th" ? "ห้องเรียน" : "Room"}
                            </label>
                            {isLoadingOptions ? (
                              <div className="flex items-center justify-center py-2">
                                <LoadingSpinner size="sm" />
                              </div>
                            ) : (
                              <select
                                value={editForm.room_id || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    room_id:
                                      Number.parseInt(e.target.value) ||
                                      undefined,
                                  })
                                }
                                className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              >
                                <option value="">
                                  {language === "th"
                                    ? "เลือกห้อง"
                                    : "Select Room"}
                                </option>
                                {rooms.map((room) => (
                                  <option key={room.id} value={room.id}>
                                    {room.room_name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                            {language === "th" ? "หมายเหตุ" : "Notes"}
                          </label>
                          <textarea
                            value={editForm.notes || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                notes: e.target.value,
                              })
                            }
                            rows={3}
                            className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                            placeholder={
                              language === "th"
                                ? "เพิ่มหมายเหตุ..."
                                : "Add notes..."
                            }
                          />
                        </div>

                        {/* Cancelling Reason (if status is cancelled) */}
                        {editForm.status === "cancelled" && (
                          <div>
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                              {language === "th"
                                ? "เหตุผลการยกเลิก"
                                : "Cancelling Reason"}
                            </label>
                            <textarea
                              value={editForm.cancelling_reason || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  cancelling_reason: e.target.value,
                                })
                              }
                              rows={2}
                              className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                              placeholder={
                                language === "th"
                                  ? "ระบุเหตุผล..."
                                  : "Specify reason..."
                              }
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <div className="flex items-center gap-2.5 md:gap-3 p-3 md:p-3.5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-0.5">
                              {language === "th" ? "วันที่" : "Date"}
                            </p>
                            <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                              {
                                formatDateTime(
                                  sessionDetail.session.session_date
                                ).date
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 md:gap-3 p-3 md:p-3.5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-0.5">
                              {language === "th" ? "เวลา" : "Time"}
                            </p>
                            <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                              {
                                formatDateTime(sessionDetail.session.start_time)
                                  .time
                              }{" "}
                              -{" "}
                              {
                                formatDateTime(sessionDetail.session.end_time)
                                  .time
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 md:gap-3 p-3 md:p-3.5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <MapPin className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-0.5">
                              {language === "th" ? "ห้องเรียน" : "Room"}
                            </p>
                            <p
                              className="text-xs md:text-sm font-semibold text-gray-900 truncate"
                              title={
                                sessionDetail.session.room?.room_name || ""
                              }
                            >
                              {sessionDetail.session.room?.room_name ||
                                (sessionDetail.session.room_id
                                  ? `Room ID: ${sessionDetail.session.room_id}`
                                  : language === "th"
                                  ? "ไม่ระบุ"
                                  : "Not specified")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 md:gap-3 p-3 md:p-3.5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-0.5">
                              {language === "th" ? "ครั้งที่" : "Session"}
                            </p>
                            <p className="text-xs md:text-sm font-semibold text-gray-900">
                              {sessionDetail.session.session_number} /{" "}
                              {language === "th"
                                ? `สัปดาห์ ${sessionDetail.session.week_number}`
                                : `Week ${sessionDetail.session.week_number}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Session Information */}
                  <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                      <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600" />
                      </div>
                      <span className="truncate">
                        {language === "th"
                          ? "ข้อมูลเพิ่มเติม"
                          : "Additional Information"}
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-1">
                          {language === "th" ? "Schedule ID" : "Schedule ID"}
                        </p>
                        <p className="text-sm md:text-base font-semibold text-gray-900">
                          #{sessionDetail.session.schedule_id}
                        </p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-1">
                          {language === "th"
                            ? "คาบเรียนชดเชย"
                            : "Makeup Session"}
                        </p>
                        <Badge
                          variant={
                            sessionDetail.session.is_makeup
                              ? "warning"
                              : "secondary"
                          }
                          className="text-xs md:text-sm"
                        >
                          {sessionDetail.session.is_makeup
                            ? language === "th"
                              ? "ใช่"
                              : "Yes"
                            : language === "th"
                            ? "ไม่ใช่"
                            : "No"}
                        </Badge>
                      </div>

                      {/* Makeup Quota */}
                      <div>
                        <p className="text-sm text-black mb-2">
                          {language === "th" ? "โควต้าชดเชย" : "Makeup Quota"}
                        </p>
                        {sessionDetail.session.schedule && (
                          <MakeupQuotaBadge
                            schedule={sessionDetail.session.schedule}
                            variant="compact"
                            showWarning={false}
                          />
                        )}
                      </div>

                      {/* Branch Information */}
                      {(sessionDetail.session.branch ||
                        sessionDetail.session.room?.branch) && (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-1">
                            {language === "th" ? "สาขา" : "Branch"}
                          </p>
                          <p className="text-sm md:text-base font-semibold text-gray-900">
                            {language === "th"
                              ? sessionDetail.session.branch?.name_th ||
                                sessionDetail.session.room?.branch?.name_th
                              : sessionDetail.session.branch?.name_en ||
                                sessionDetail.session.room?.branch?.name_en}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Room Details Section */}
                    {sessionDetail.session.room && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm md:text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                            <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 text-purple-600" />
                          </div>
                          <span>
                            {language === "th"
                              ? "รายละเอียดห้องเรียน"
                              : "Room Details"}
                          </span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-1">
                              {language === "th" ? "ความจุ" : "Capacity"}
                            </p>
                            <p className="text-sm md:text-base font-semibold text-gray-900">
                              {sessionDetail.session.room.capacity}{" "}
                              {language === "th" ? "คน" : "people"}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-1">
                              {language === "th" ? "สถานะ" : "Status"}
                            </p>
                            <Badge
                              variant={
                                sessionDetail.session.room.status ===
                                "available"
                                  ? "success"
                                  : "secondary"
                              }
                              className="text-xs md:text-sm"
                            >
                              {sessionDetail.session.room.status === "available"
                                ? language === "th"
                                  ? "ว่าง"
                                  : "Available"
                                : language === "th"
                                ? "ไม่ว่าง"
                                : "Occupied"}
                            </Badge>
                          </div>
                          {sessionDetail.session.room.equipment &&
                            sessionDetail.session.room.equipment.length > 0 && (
                              <div className="sm:col-span-2 lg:col-span-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-2">
                                  {language === "th" ? "อุปกรณ์" : "Equipment"}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {sessionDetail.session.room.equipment.map(
                                    (item, index) => (
                                      <Badge
                                        key={`equipment-${item}-${index}`}
                                        variant="secondary"
                                        className="text-[10px] md:text-xs"
                                      >
                                        {item}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Admin: Edit Makeup Quota */}
                  {canEdit && sessionDetail?.session?.schedule && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl border border-blue-200 shadow-sm">
                      <h5 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2 mb-3 md:mb-4">
                        <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Edit2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-600" />
                        </div>
                        <span className="truncate">
                          {language === "th"
                            ? "แก้ไขโควต้าชดเชย (Admin)"
                            : "Edit Makeup Quota (Admin)"}
                        </span>
                      </h5>

                      <div className="bg-white p-3 md:p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between text-xs md:text-sm">
                          <span className="text-gray-600">
                            {language === "th"
                              ? "สถานะปัจจุบัน:"
                              : "Current Status:"}
                          </span>
                          <MakeupQuotaBadge
                            schedule={sessionDetail.session.schedule}
                            variant="compact"
                            showWarning={false}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
                          <div>
                            <label className="block text-gray-600 font-medium mb-1.5">
                              {language === "th" ? "โควต้าใหม่" : "New Quota"}
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={editQuotaValue}
                              onChange={(e) =>
                                setEditQuotaValue(
                                  Number.parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0-20"
                              disabled={isUpdatingQuota}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="monthViewClicked"
                              className="w-full text-xs md:text-sm px-3 py-2"
                              onClick={handleUpdateMakeupQuota}
                              disabled={isUpdatingQuota}
                            >
                              {isUpdatingQuota ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 animate-spin" />
                                  <span className="truncate">
                                    {language === "th"
                                      ? "กำลังบันทึก..."
                                      : "Saving..."}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Save className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" />
                                  <span className="truncate">
                                    {language === "th" ? "บันทึก" : "Save"}
                                  </span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-600 text-xs md:text-sm font-medium mb-1.5">
                            {language === "th"
                              ? "เหตุผล (ไม่บังคับ)"
                              : "Reason (Optional)"}
                          </label>
                          <textarea
                            rows={2}
                            value={editQuotaReason}
                            onChange={(e) => setEditQuotaReason(e.target.value)}
                            className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder={
                              language === "th"
                                ? "เช่น: เพิ่มโควต้าเนื่องจาก..."
                                : "e.g., Increase quota due to..."
                            }
                            disabled={isUpdatingQuota}
                          />
                        </div>

                        <p className="text-[10px] md:text-xs text-gray-500 flex items-start gap-1.5">
                          <span className="flex-shrink-0">💡</span>
                          <span>
                            {language === "th"
                              ? "หมายเหตุ: การเปลี่ยนแปลงจะมีผลทันที และจะส่งการแจ้งเตือนไปยังครูที่เกี่ยวข้อง"
                              : "Note: Changes will take effect immediately and notifications will be sent to relevant teachers"}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions - Add Sessions (Admin only) */}
                  {canEdit &&
                    sessionDetail &&
                    (onAddSessionBefore ||
                      onAddSessionAfter ||
                      onAddSessionCustom) && (
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 md:p-6 rounded-xl border border-yellow-200 shadow-sm">
                        <div className="mb-3 md:mb-4">
                          <h5 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
                            <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-lg bg-yellow-100 flex items-center justify-center">
                              <Plus className="h-3 w-3 md:h-3.5 md:w-3.5 text-yellow-600" />
                            </div>
                            <span className="truncate">
                              {language === "th"
                                ? "เพิ่ม Session ใหม่"
                                : "Add New Session"}
                            </span>
                          </h5>
                          <p className="text-xs md:text-sm text-gray-600 mt-1 ml-8 md:ml-9">
                            {language === "th"
                              ? "เลือกวิธีการเพิ่ม Session ลงในตารางเรียน"
                              : "Choose how to add a session to the schedule"}
                          </p>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                          {/* Custom Session - Main option */}
                          {onAddSessionCustom && sessionDetail?.session && (
                            <button
                              onClick={() => {
                                if (
                                  sessionDetail?.session?.schedule_id &&
                                  sessionDetail
                                ) {
                                  onAddSessionCustom(
                                    sessionDetail.session.schedule_id,
                                    sessionDetail
                                  );
                                }
                              }}
                              className="group w-full flex items-start gap-2.5 md:gap-3 p-3 md:p-4 bg-white rounded-lg border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-md transition-all duration-200 text-left"
                            >
                              <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-100 group-hover:bg-yellow-200 flex items-center justify-center transition-colors">
                                <Plus className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-base font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors truncate">
                                  {language === "th"
                                    ? "สร้าง Session ใหม่"
                                    : "Create New Session"}
                                </p>
                                <p className="text-[10px] md:text-sm text-gray-600 mt-0.5 md:mt-1 line-clamp-2">
                                  {language === "th"
                                    ? "กำหนดวันเวลาและรายละเอียดด้วยตัวเอง"
                                    : "Set date, time, and details manually"}
                                </p>
                              </div>
                            </button>
                          )}

                          {/* Quick insert options */}
                          {(onAddSessionBefore || onAddSessionAfter) &&
                            sessionDetail && (
                              <div className="pt-2 md:pt-3 border-t border-yellow-200">
                                <p className="text-[10px] md:text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-1">
                                  <span className="flex-shrink-0">🚀</span>
                                  <span className="truncate">
                                    {language === "th"
                                      ? "แทรกด่วน (คัดลอกข้อมูลจาก Session นี้)"
                                      : "Quick Insert (Copy from this session)"}
                                  </span>
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {onAddSessionBefore && (
                                    <button
                                      onClick={() => {
                                        if (sessionDetail) {
                                          onAddSessionBefore(sessionDetail);
                                        }
                                      }}
                                      className="group flex items-center gap-2 p-2.5 sm:p-3 bg-white/70 rounded-lg border border-yellow-300 hover:border-yellow-400 hover:bg-white hover:shadow transition-all duration-200 text-left"
                                    >
                                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                                          {language === "th"
                                            ? "แทรกก่อนหน้า"
                                            : "Insert Before"}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate">
                                          Session #
                                          {sessionDetail.session.session_number}
                                        </p>
                                      </div>
                                    </button>
                                  )}

                                  {onAddSessionAfter && (
                                    <button
                                      onClick={() => {
                                        if (sessionDetail) {
                                          onAddSessionAfter(sessionDetail);
                                        }
                                      }}
                                      className="group flex items-center gap-2 p-2.5 sm:p-3 bg-white/70 rounded-lg border border-yellow-300 hover:border-yellow-400 hover:bg-white hover:shadow transition-all duration-200 text-left"
                                    >
                                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                                          {language === "th"
                                            ? "แทรกถัดไป"
                                            : "Insert After"}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate">
                                          Session #
                                          {sessionDetail.session.session_number}
                                        </p>
                                      </div>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-black">
                  {language === "th"
                    ? "ไม่พบข้อมูลคาบเรียน"
                    : "Session not found"}
                </div>
              )}
            </TabsContent>

            {/* Group Tab */}
            <TabsContent
              value="group"
              className="flex-1 overflow-hidden min-h-0"
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="md" />
                </div>
              ) : sessionDetail?.group ? (
                <div className="space-y-4 md:space-y-6 overflow-y-auto max-h-[65vh] p-1 md:p-2">
                  {/* Group Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 md:mb-4">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="flex-shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                        </div>
                        <h3 className="text-base md:text-xl font-semibold text-gray-900 truncate">
                          {sessionDetail.group.group_name}
                        </h3>
                      </div>

                      {/* Admin Edit Group Button */}
                      {canEdit && sessionDetail?.group && (
                        <Button
                          onClick={() => {
                            // Navigate to group edit page
                            if (sessionDetail.group) {
                              globalThis.location.href = `/groups?edit=${sessionDetail.group.group_id}`;
                            }
                          }}
                          variant="secondary"
                          className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-2 bg-white border-2 border-blue-300 hover:border-blue-400 text-blue-700 hover:text-blue-800 min-w-[120px] flex-shrink-0"
                        >
                          <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="truncate">
                            {language === "th" ? "แก้ไขกลุ่ม" : "Edit Group"}
                          </span>
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      <div className="flex items-center gap-2.5 md:gap-3 p-3 md:p-3.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center">
                          <Award className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-0.5">
                            {language === "th" ? "ระดับ" : "Level"}
                          </p>
                          <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                            {sessionDetail.group.level}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-black">
                            {language === "th" ? "คอร์ส" : "Course"}
                          </p>
                          <p className="font-medium text-gray-700">
                            {sessionDetail.group.course_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-black">
                            {language === "th" ? "นักเรียน" : "Students"}
                          </p>
                          <p className="font-medium text-gray-700">
                            {sessionDetail.group.student_count} /{" "}
                            {sessionDetail.group.max_students}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group Members */}
                  <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      {language === "th" ? "สมาชิกในกลุ่ม" : "Group Members"}
                      <Badge variant="secondary" className="ml-2">
                        {sessionDetail.group.members.length}
                      </Badge>
                    </h4>

                    <div className="space-y-3">
                      {sessionDetail.group.members.map((member) => (
                        <div
                          key={member.student.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {(member.student.first_name || "U")
                                .charAt(0)
                                .toUpperCase()}
                              {(member.student.last_name || "N")
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {member.student.first_name}{" "}
                              {member.student.last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {member.student.first_name_en}{" "}
                              {member.student.last_name_en}
                            </p>
                            <p className="text-sm text-gray-500">
                              @
                              {member.student.user?.username ||
                                member.student.nickname_en}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant={
                                member.payment_status === "paid"
                                  ? "success"
                                  : member.payment_status === "pending"
                                  ? "warning"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {member.payment_status === "paid"
                                ? language === "th"
                                  ? "ชำระแล้ว"
                                  : "Paid"
                                : member.payment_status === "pending"
                                ? language === "th"
                                  ? "รอชำระ"
                                  : "Pending"
                                : language === "th"
                                ? "ค้างชำระ"
                                : "Overdue"}
                            </Badge>
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "success"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {member.status === "active"
                                ? language === "th"
                                  ? "เรียนอยู่"
                                  : "Active"
                                : language === "th"
                                ? "ไม่ได้เรียน"
                                : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                  <Users className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg">
                    {language === "th"
                      ? "ไม่มีข้อมูลกลุ่ม"
                      : "No group information"}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="comments"
              className="flex-1 overflow-hidden min-h-0 flex flex-col"
            >
              <div className="flex-1 overflow-y-auto min-h-0 p-2">
                <div className="space-y-4 mb-6">
                  {isCommentsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : sessionComments.length > 0 ? (
                    sessionComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white p-4 rounded-xl border border-gray-300 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                comment.user?.avatar
                                  ? `${
                                      process.env.NEXT_PUBLIC_API_URL ||
                                      "http://localhost:8080"
                                    }/${comment.user.avatar}`
                                  : undefined
                              }
                              alt={comment.user?.username}
                            />
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                              {comment.user?.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">
                                {comment.user?.username}
                              </span>
                              <span className="text-xs text-black">
                                {formatDateTime(comment.created_at).date}{" "}
                                {formatDateTime(comment.created_at).time}
                              </span>
                            </div>
                            <p className="text-gray-700">{comment.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-black">
                        {language === "th"
                          ? "ยังไม่มีความคิดเห็น"
                          : "No comments yet"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Add Comment Section */}
              <div className="bg-gray-100 p-4 rounded-xl">
                <div className="flex gap-3 relative">
                  <div className="flex-1 relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={
                        language === "th"
                          ? "เพิ่มความคิดเห็น..."
                          : "Add a comment..."
                      }
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                      rows={3}
                    />
                    {/* Emoji Button */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-2 bottom-2 p-2 hover:bg-gray-200 rounded-full transition-colors"
                      title={language === "th" ? "เลือก Emoji" : "Pick Emoji"}
                    >
                      <Smile className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    </button>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div
                        ref={emojiPickerRef}
                        className="absolute bottom-full right-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-50 w-72 max-h-64 overflow-y-auto"
                      >
                        <div className="grid grid-cols-8 gap-2">
                          {[
                            "😀",
                            "😃",
                            "😄",
                            "😁",
                            "😆",
                            "😅",
                            "🤣",
                            "😂",
                            "🙂",
                            "🙃",
                            "😉",
                            "😊",
                            "😇",
                            "🥰",
                            "😍",
                            "🤩",
                            "😘",
                            "😗",
                            "😚",
                            "😙",
                            "😋",
                            "😛",
                            "😜",
                            "🤪",
                            "😝",
                            "🤑",
                            "🤗",
                            "🤭",
                            "🤫",
                            "🤔",
                            "🤐",
                            "🤨",
                            "😐",
                            "😑",
                            "😶",
                            "😏",
                            "😒",
                            "🙄",
                            "😬",
                            "🤥",
                            "😌",
                            "😔",
                            "😪",
                            "🤤",
                            "😴",
                            "😷",
                            "🤒",
                            "🤕",
                            "🤢",
                            "🤮",
                            "🤧",
                            "🥵",
                            "🥶",
                            "😎",
                            "🤓",
                            "🧐",
                            "😕",
                            "😟",
                            "🙁",
                            "😮",
                            "😯",
                            "😲",
                            "😳",
                            "🥺",
                            "😦",
                            "😧",
                            "😨",
                            "😰",
                            "😥",
                            "😢",
                            "😭",
                            "😱",
                            "😖",
                            "😣",
                            "😞",
                            "😓",
                            "😩",
                            "😫",
                            "🥱",
                            "😤",
                            "😡",
                            "😠",
                            "🤬",
                            "👍",
                            "👎",
                            "👏",
                            "🙌",
                            "👋",
                            "🤝",
                            "🙏",
                            "💪",
                            "❤️",
                            "🧡",
                            "💛",
                            "💚",
                            "💙",
                            "💜",
                            "🤎",
                            "🖤",
                            "🤍",
                            "💯",
                            "✨",
                            "⭐",
                            "🌟",
                            "💫",
                            "🔥",
                            "💥",
                            "✅",
                            "❌",
                            "⚠️",
                            "📌",
                            "📍",
                            "🎉",
                            "🎊",
                            "🎈",
                            "🎁",
                            "🏆",
                            "🥇",
                            "🥈",
                            "🥉",
                          ].map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleEmojiClick(emoji)}
                              className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                              title={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="self-end px-6 py-3"
                    variant="monthViewClicked"
                  >
                    {isSubmittingComment ? (
                      <LoadingSpinner size="sm" />
                    ) : language === "th" ? (
                      "ส่ง"
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      {/* Cancel Session Modal */}
      {sessionDetail && (
        <CancelSessionModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          sessionId={sessionId}
          sessionDate={sessionDetail.session.session_date}
          sessionTime={`${sessionDetail.session.start_time} - ${sessionDetail.session.end_time}`}
          onSuccess={handleCancelSessionSuccess}
        />
      )}
    </Dialog>
  );
}
