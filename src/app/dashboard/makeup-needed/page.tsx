"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SidebarLayout from "@/components/common/SidebarLayout";
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
      setSessions(response.sessions_needing_makeup || []);
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

  const filteredSessions = (sessions || []).filter((session) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      session.group?.group_name?.toLowerCase().includes(search) ||
      session.course?.course_name?.toLowerCase().includes(search) ||
      session.schedule_name?.toLowerCase().includes(search) ||
      session.cancelling_reason?.toLowerCase().includes(search)
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
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-8 py-10 shadow-lg"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <Calendar className="h-10 w-10" />
                  {t.title}
                </h1>
                <p className="text-indigo-100 text-lg">{t.subtitle}</p>
              </div>

              {sessions.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg"
                >
                  <div className="text-sm font-medium">
                    {t.total}: {sessions.length} {t.sessions}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Search & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.search}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <Link href="/schedule">
                <Button
                  variant="monthViewClicked"
                  className="px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {t.goToSchedule}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Sessions Grid */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-md p-12 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">{t.loading}</p>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-md p-12"
            >
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.noData}
                </h3>
                <p className="text-gray-600">{t.noDataDesc}</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.session_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5" />
                        <div>
                          <h3 className="font-bold text-lg">
                            {session.group.group_name}
                          </h3>
                          <p className="text-indigo-100 text-sm">
                            {session.schedule_name}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Makeup
                      </Badge>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Course & Level */}
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-600 font-medium">
                            {t.course}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {session.course.course_name}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-indigo-100 text-indigo-800"
                          >
                            {t.level}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {session.group.level}
                        </p>
                      </div>
                    </div>

                    {/* Original Session Date & Time */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
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
                            <Clock className="h-4 w-4 text-gray-400" />
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
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-gray-600 font-medium">
                          {t.cancelledAt}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {formatDateTime(session.cancelled_at)}
                      </p>
                      <Button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowReasonModal(true);
                        }}
                        variant="cancel"
                        className="px-3 py-1.5 text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {t.viewReason}
                      </Button>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <Link href="/schedule">
                      <Button
                        variant="monthViewClicked"
                        className="w-full py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        {t.createMakeup}
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </Link>
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
                      <p className="text-gray-600 font-medium">{t.group}</p>
                      <p className="text-gray-900 font-semibold">
                        {selectedSession.group.group_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">{t.course}</p>
                      <p className="text-gray-900 font-semibold">
                        {selectedSession.course.course_name}
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
                        #{selectedSession.session_id}
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
                    {formatDateTime(selectedSession.cancelled_at)}
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
    </SidebarLayout>
  );
}
