"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
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
  updateSession,
  UpdateSessionRequest,
} from "@/services/api/schedules";
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
}

export default function SessionDetailModal({
  isOpen,
  onClose,
  sessionId,
  onUpdate,
}: SessionDetailModalProps) {
  const { language } = useLanguage();
  const { hasRole } = useAuth();

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

  // Check if user is admin or owner
  const canEdit = hasRole(["admin", "owner"]);

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

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSessionDetail();
      fetchSessionComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sessionId]);

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
                <div className="space-y-6 overflow-y-auto max-h-[65vh] p-2">
                  {/* Session Status & Basic Info */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {sessionDetail.session.schedule_name}
                      </h3>
                      <div className="flex items-center gap-3">
                        {!isEditMode &&
                          getStatusBadge(sessionDetail.session.status)}

                        {/* Edit Mode Controls */}
                        {isEditMode ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              variant="cancel"
                              className="px-4 py-2 text-sm"
                            >
                              <X className="h-4 w-4 mr-1" />
                              {language === "th" ? "ยกเลิก" : "Cancel"}
                            </Button>
                            <Button
                              onClick={handleSaveSession}
                              disabled={isSaving}
                              variant="monthViewClicked"
                              className="px-4 py-2 text-sm"
                            >
                              {isSaving ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-1" />
                                  {language === "th" ? "บันทึก" : "Save"}
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <>
                            {/* Admin Edit Button - ปรับปรุงให้สวยขึ้น */}
                            {canEdit && (
                              <Button
                                onClick={handleEnterEditMode}
                                variant="monthViewClicked"
                                className="px-6 py-2.5 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                              >
                                <Edit2 className="h-4 w-4" />
                                {language === "th"
                                  ? "แก้ไขเซสชัน"
                                  : "Edit Session"}
                              </Button>
                            )}

                            {/* Teacher Confirm/Decline */}
                            {sessionDetail.session.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleDeclineSession}
                                  disabled={isDeclining || isConfirming}
                                  variant="cancel"
                                  className="px-4 py-2 text-sm"
                                >
                                  {isDeclining ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <Ban className="h-4 w-4 mr-1" />
                                      {language === "th" ? "ปฏิเสธ" : "Decline"}
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={handleConfirmSession}
                                  disabled={isConfirming || isDeclining}
                                  variant="monthViewClicked"
                                  className="px-4 py-2 text-sm"
                                >
                                  {isConfirming ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" />
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

                    {isEditMode ? (
                      /* Edit Mode Form */
                      <div className="space-y-4 text-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Date */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Start Time */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* End Time */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Status */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                      parseInt(e.target.value) || undefined,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                      parseInt(e.target.value) || undefined,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                          <div>
                            <p className="text-sm text-black">
                              {language === "th" ? "วันที่" : "Date"}
                            </p>
                            <p className="font-medium text-gray-700">
                              {
                                formatDateTime(
                                  sessionDetail.session.session_date
                                ).date
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                          <Clock className="h-5 w-5 text-indigo-600" />
                          <div>
                            <p className="text-sm text-black">
                              {language === "th" ? "เวลา" : "Time"}
                            </p>
                            <p className="font-medium text-gray-700">
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

                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                          <MapPin className="h-5 w-5 text-indigo-600" />
                          <div>
                            <p className="text-sm text-black">
                              {language === "th" ? "ห้องเรียน" : "Room"}
                            </p>
                            <p className="font-medium text-gray-700">
                              {sessionDetail.session.room?.room_name ||
                                (sessionDetail.session.room_id
                                  ? `Room ID: ${sessionDetail.session.room_id}`
                                  : language === "th"
                                  ? "ไม่ระบุ"
                                  : "Not specified")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                          <Users className="h-5 w-5 text-indigo-600" />
                          <div>
                            <p className="text-sm text-black">
                              {language === "th" ? "ครั้งที่" : "Session"}
                            </p>
                            <p className="font-medium text-gray-700">
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
                  <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      {language === "th"
                        ? "ข้อมูลเพิ่มเติม"
                        : "Additional Information"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-black">
                          {language === "th" ? "Schedule ID" : "Schedule ID"}
                        </p>
                        <p className="font-medium text-gray-700">
                          #{sessionDetail.session.schedule_id}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-black">
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
                          className="text-gray-700"
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

                      {/* Branch Information */}
                      {(sessionDetail.session.branch ||
                        sessionDetail.session.room?.branch) && (
                        <div>
                          <p className="text-sm text-black">
                            {language === "th" ? "สาขา" : "Branch"}
                          </p>
                          <p className="font-medium text-gray-700">
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
                        <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-indigo-600" />
                          {language === "th"
                            ? "รายละเอียดห้องเรียน"
                            : "Room Details"}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">
                              {language === "th" ? "ความจุ" : "Capacity"}
                            </p>
                            <p className="font-medium text-gray-700">
                              {sessionDetail.session.room.capacity}{" "}
                              {language === "th" ? "คน" : "people"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              {language === "th" ? "สถานะ" : "Status"}
                            </p>
                            <Badge
                              variant={
                                sessionDetail.session.room.status ===
                                "available"
                                  ? "success"
                                  : "secondary"
                              }
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
                              <div className="md:col-span-2 lg:col-span-1">
                                <p className="text-sm text-gray-600 mb-1">
                                  {language === "th" ? "อุปกรณ์" : "Equipment"}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {sessionDetail.session.room.equipment.map(
                                    (item, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs"
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
                <div className="space-y-6 overflow-y-auto max-h-[65vh] p-2">
                  {/* Group Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-blue-600" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {sessionDetail.group.group_name}
                        </h3>
                      </div>

                      {/* Admin Edit Group Button */}
                      {canEdit && sessionDetail?.group && (
                        <Button
                          onClick={() => {
                            // Navigate to group edit page
                            if (sessionDetail.group) {
                              window.location.href = `/groups?edit=${sessionDetail.group.group_id}`;
                            }
                          }}
                          variant="secondary"
                          className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 bg-white border-2 border-blue-300 hover:border-blue-400 text-blue-700 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                          {language === "th" ? "แก้ไขกลุ่ม" : "Edit Group"}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <Award className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-black">
                            {language === "th" ? "ระดับ" : "Level"}
                          </p>
                          <p className="font-medium text-gray-700">
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
    </Dialog>
  );
}
