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
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CreateSessionCommentRequest,
  scheduleService,
  SessionComment,
  SessionDetailResponse,
  teacherConfirmSession,
  teacherDeclineSession,
} from "@/services/api/schedules";
import {
  AlertCircle,
  Award,
  Ban,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  RefreshCw,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
}

export default function SessionDetailModal({
  isOpen,
  onClose,
  sessionId,
}: SessionDetailModalProps) {
  const { language } = useLanguage();

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
      await fetchSessionComments();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
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
                        {getStatusBadge(sessionDetail.session.status)}
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
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm text-black">
                            {language === "th" ? "วันที่" : "Date"}
                          </p>
                          <p className="font-medium text-gray-700">
                            {
                              formatDateTime(sessionDetail.session.session_date)
                                .date
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
                          <p className="font-medium text-gray-700">N/A</p>
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
                  </div>

                  {/* Additional Session Information */}
                  <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      {language === "th"
                        ? "ข้อมูลเพิ่มเติม"
                        : "Additional Information"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
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
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {sessionDetail.group.group_name}
                      </h3>
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
                          key={member.student_id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {member.first_name.charAt(0).toUpperCase()}
                              {member.last_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {member.first_name_en} {member.last_name_en}
                            </p>
                            <p className="text-sm text-gray-500">
                              @{member.username}
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
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={
                      language === "th"
                        ? "เพิ่มความคิดเห็น..."
                        : "Add a comment..."
                    }
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                    rows={3}
                  />
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
