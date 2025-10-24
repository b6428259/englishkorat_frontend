"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SidebarLayout from "@/components/common/SidebarLayout";
import CreateMakeupModal from "@/components/schedule/CreateMakeupModal";
import MakeupQuotaBadge from "@/components/schedule/MakeupQuotaBadge";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMakeupNeededSessions } from "@/services/api/schedules";
import { MakeupNeededSession } from "@/types/session-cancellation.types";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  PlusCircle,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MakeupNeededPage() {
  const { language } = useLanguage();
  const { hasRole } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<MakeupNeededSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<MakeupNeededSession | null>(null);

  const translations = {
    th: {
      title: "คาบเรียนที่ต้องทำ Makeup",
      subtitle: "รายการคาบเรียนที่ยกเลิกและต้องจัด Makeup Class",
      search: "ค้นหาด้วยชื่อกลุ่ม, คอร์ส, หรือเหตุผล...",
      total: "ทั้งหมด",
      sessions: "คาบเรียน",
      noData: "ไม่มีคาบเรียนที่ต้องทำ Makeup",
      noDataDesc: "ยังไม่มีคาบเรียนที่ยกเลิกและต้องจัด Makeup Class ในขณะนี้",
      loading: "กำลังโหลดข้อมูล...",
      error: "ไม่สามารถโหลดข้อมูลได้",
      retry: "ลองอีกครั้ง",
      group: "กลุ่มเรียน",
      course: "คอร์ส",
      level: "ระดับ",
      cancelledDate: "วันที่ยกเลิก",
      sessionDate: "วันที่คาบเรียนเดิม",
      time: "เวลา",
      reason: "เหตุผลการยกเลิก",
      viewReason: "ดูเหตุผล",
      createMakeup: "สร้าง Makeup Class",
      goToSchedule: "ไปที่ตารางเรียน",
      unauthorized: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      reasonModal: "เหตุผลในการยกเลิก",
      close: "ปิด",
      sessionInfo: "ข้อมูลคาบเรียน",
      scheduleId: "Schedule ID",
      sessionId: "Session ID",
      cancelledAt: "ยกเลิกเมื่อ",
    },
    en: {
      title: "Makeup Sessions Needed",
      subtitle: "List of cancelled sessions requiring makeup classes",
      search: "Search by group, course, or reason...",
      total: "Total",
      sessions: "sessions",
      noData: "No Makeup Sessions Needed",
      noDataDesc:
        "There are no cancelled sessions requiring makeup at this time",
      loading: "Loading data...",
      error: "Failed to load data",
      retry: "Retry",
      group: "Group",
      course: "Course",
      level: "Level",
      cancelledDate: "Cancelled Date",
      sessionDate: "Original Session Date",
      time: "Time",
      reason: "Cancellation Reason",
      viewReason: "View Reason",
      createMakeup: "Create Makeup Class",
      goToSchedule: "Go to Schedule",
      unauthorized: "You don't have permission to access this page",
      reasonModal: "Cancellation Reason",
      close: "Close",
      sessionInfo: "Session Information",
      scheduleId: "Schedule ID",
      sessionId: "Session ID",
      cancelledAt: "Cancelled At",
    },
  };

  const t = translations[language];

  // Check authorization
  useEffect(() => {
    if (!hasRole(["admin", "owner", "teacher"])) {
      toast.error(t.unauthorized, { position: "top-center" });
      router.push("/dashboard");
    }
  }, [hasRole, router, t.unauthorized]);

  const fetchMakeupSessions = async () => {
    try {
      setIsLoading(true);
      const response = await getMakeupNeededSessions();
      setSessions(response.sessions || []);
    } catch (error) {
      console.error("Failed to fetch makeup sessions:", error);
      toast.error(t.error, { position: "top-center" });
      setSessions([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasRole(["admin", "owner", "teacher"])) {
      fetchMakeupSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle return from schedule selection
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const selectedDate = params.get("selectedDate");
    const selectedTime = params.get("selectedTime");
    const sessionIdParam = params.get("sessionId");

    if (selectedDate && sessionIdParam && sessions.length > 0) {
      const session = sessions.find((s) => s.id === Number(sessionIdParam));
      if (session) {
        setSelectedSession(session);
        setShowCreateModal(true);
        // Store selected date and time for modal
        sessionStorage.setItem("prefilledDate", selectedDate);
        if (selectedTime) {
          sessionStorage.setItem("prefilledTime", selectedTime);
        }
        // Clean URL
        globalThis.history.replaceState({}, "", globalThis.location.pathname);
      }
    }
  }, [sessions]);

  const filteredSessions = (sessions || []).filter((session) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      session.schedule_name?.toLowerCase().includes(search) ||
      session.cancelling_reason?.toLowerCase().includes(search) ||
      session.assigned_teacher?.username?.toLowerCase().includes(search)
    );
  });

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString(language === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!hasRole(["admin", "owner", "teacher"])) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 shadow-lg"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
                  {t.title}
                </h1>
                <p className="text-indigo-100 text-sm sm:text-base lg:text-lg">
                  {t.subtitle}
                </p>
              </div>

              {sessions.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg self-start sm:self-auto"
                >
                  <div className="text-xs sm:text-sm font-medium whitespace-nowrap">
                    {t.total}: {sessions.length} {t.sessions}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Search & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.search}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <Link href="/schedule" className="w-full lg:w-auto">
                <Button
                  variant="monthViewClicked"
                  className="w-full lg:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {t.goToSchedule}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Sessions Grid */}
          {isLoading ? (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-8 sm:p-12 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4 text-sm sm:text-base">
                  {t.loading}
                </p>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg sm:rounded-xl shadow-md p-8 sm:p-12"
            >
              <div className="text-center">
                <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {t.noData}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.noDataDesc}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 sm:mt-0 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base sm:text-lg truncate">
                            {session.schedule_name}
                          </h3>
                          <p className="text-indigo-100 text-xs sm:text-sm">
                            {language === "th" ? "คาบที่" : "Session"} #
                            {session.session_number}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs sm:text-sm flex-shrink-0">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Makeup
                      </Badge>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {/* Teacher Info */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                          <span className="text-xs text-gray-600 font-medium">
                            {language === "th" ? "ครู" : "Teacher"}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {session.assigned_teacher?.username || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Original Session Date & Time */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                            <span className="text-xs text-gray-600 font-medium">
                              {t.sessionDate}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(session.session_date)}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                            <span className="text-xs text-gray-600 font-medium">
                              {t.time}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {session.start_time} - {session.end_time}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Info */}
                    <div className="border-t border-gray-200 pt-3 sm:pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                        <span className="text-xs text-gray-600 font-medium">
                          {t.cancelledAt}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2">
                        {formatDateTime(session.cancellation_approved_at)}
                      </p>
                      <Button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowReasonModal(true);
                        }}
                        variant="cancel"
                        className="px-2.5 sm:px-3 py-1.5 text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {t.viewReason}
                      </Button>
                    </div>

                    {/* Makeup Quota Display */}
                    <div className="border-t border-gray-200 pt-3 sm:pt-4">
                      <MakeupQuotaBadge
                        schedule={{
                          make_up_quota: session.schedule_makeup_quota,
                          make_up_remaining: session.schedule_makeup_remaining,
                          make_up_used: session.schedule_makeup_used,
                        }}
                        variant="default"
                        showWarning={true}
                      />
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                    {(() => {
                      // Better quota checking with fallback
                      const quota = session.schedule_makeup_quota ?? 2; // Default to 2 if not set
                      const used = session.schedule_makeup_used ?? 0;
                      const remaining =
                        session.schedule_makeup_remaining ?? quota - used;
                      const hasQuota = remaining > 0;

                      return hasQuota ? (
                        <Button
                          variant="monthViewClicked"
                          onClick={() => {
                            setSelectedSession(session);
                            setShowCreateModal(true);
                          }}
                          className="w-full py-2 sm:py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          {t.createMakeup}
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            variant="cancel"
                            disabled
                            className="w-full py-2.5 text-sm font-semibold opacity-60 cursor-not-allowed"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {language === "th"
                              ? "ไม่สามารถสร้าง Makeup ได้"
                              : "Cannot Create Makeup"}
                          </Button>
                          <p className="text-xs text-center text-red-600">
                            {language === "th"
                              ? `ใช้โควต้าหมดแล้ว (${used}/${quota})`
                              : `Quota exhausted (${used}/${quota})`}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reason Modal */}
      {showReasonModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t.reasonModal}
                </h3>
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setSelectedSession(null);
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <AlertCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Session Info */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {t.sessionInfo}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">
                        {language === "th" ? "ตาราง" : "Schedule"}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {selectedSession.schedule_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {language === "th" ? "ครู" : "Teacher"}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {selectedSession.assigned_teacher?.username || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {t.sessionDate}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {formatDate(selectedSession.session_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">{t.time}</p>
                      <p className="text-gray-900 font-semibold">
                        {selectedSession.start_time} -{" "}
                        {selectedSession.end_time}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {t.scheduleId}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        #{selectedSession.schedule_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">{t.sessionId}</p>
                      <p className="text-gray-900 font-semibold">
                        #{selectedSession.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cancellation Reason */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {t.reason}
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[120px]">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedSession.cancelling_reason}
                    </p>
                  </div>
                </div>

                {/* Cancelled At */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-900">
                      {t.cancelledAt}
                    </span>
                  </div>
                  <p className="text-sm text-red-700">
                    {formatDateTime(selectedSession.cancellation_approved_at)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setShowReasonModal(false);
                    setSelectedSession(null);
                  }}
                  variant="cancel"
                  className="px-6 py-2.5"
                >
                  {t.close}
                </Button>
                <Link href="/schedule">
                  <Button variant="monthViewClicked" className="px-6 py-2.5">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t.createMakeup}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Makeup Modal */}
      {showCreateModal && selectedSession && (
        <CreateMakeupModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedSession(null);
          }}
          sessionId={selectedSession.id}
          sessionDate={formatDate(selectedSession.session_date)}
          sessionTime={`${selectedSession.start_time} - ${selectedSession.end_time}`}
          scheduleName={selectedSession.schedule_name}
          teacherId={selectedSession.assigned_teacher?.id}
          teacherName={selectedSession.assigned_teacher?.username}
          makeupQuota={selectedSession.schedule_makeup_quota ?? 2}
          makeupRemaining={selectedSession.schedule_makeup_remaining ?? 0}
          makeupUsed={selectedSession.schedule_makeup_used ?? 0}
          onSuccess={() => {
            // Refresh sessions list
            fetchMakeupSessions();
            toast.success(
              language === "th"
                ? "สร้าง Makeup Session สำเร็จ!"
                : "Makeup session created successfully!",
              { duration: 4000 }
            );
          }}
        />
      )}
    </SidebarLayout>
  );
}
