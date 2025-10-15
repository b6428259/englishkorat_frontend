"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCancellationDashboardStats } from "@/services/api/schedules";
import { DashboardStatsResponse } from "@/types/session-cancellation.types";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CancellationStatsWidget() {
  const { language } = useLanguage();
  const { hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    th: {
      title: "สถิติการยกเลิกคาบเรียน",
      subtitle: "ภาพรวมคำขอยกเลิกและการจัดการ",
      pending: "รอการอนุมัติ",
      cancelled: "ยกเลิกแล้ว",
      completed: "เสร็จสิ้น",
      scheduled: "กำหนดการ",
      cancellationRate: "อัตราการยกเลิก",
      urgent: "ด่วน",
      urgentDesc: "รอนานกว่า 3 วัน",
      needsAction: "ต้องดำเนินการ",
      viewAll: "ดูทั้งหมด",
      loading: "กำลังโหลดสถิติ...",
      error: "ไม่สามารถโหลดข้อมูลได้",
      retry: "ลองอีกครั้ง",
      last30Days: "30 วันที่ผ่านมา",
      noData: "ไม่มีข้อมูล",
      sessions: "คาบเรียน",
      avgApprovalTime: "เวลาอนุมัติเฉลี่ย",
      hours: "ชั่วโมง",
      makeupNeeded: "ต้องทำ Makeup",
      makeupCreated: "สร้าง Makeup แล้ว",
      pendingMakeup: "รอสร้าง Makeup",
    },
    en: {
      title: "Session Cancellation Statistics",
      subtitle: "Overview of cancellation requests and management",
      pending: "Pending",
      cancelled: "Cancelled",
      completed: "Completed",
      scheduled: "Scheduled",
      cancellationRate: "Cancellation Rate",
      urgent: "Urgent",
      urgentDesc: "Pending > 3 days",
      needsAction: "Needs Action",
      viewAll: "View All",
      loading: "Loading statistics...",
      error: "Failed to load data",
      retry: "Retry",
      last30Days: "Last 30 Days",
      noData: "No Data",
      sessions: "Sessions",
      avgApprovalTime: "Avg Approval Time",
      hours: "hours",
      makeupNeeded: "Makeup Needed",
      makeupCreated: "Makeup Created",
      pendingMakeup: "Pending Makeup",
    },
  };

  const t = translations[language];

  useEffect(() => {
    if (hasRole(["admin", "owner"])) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getCancellationDashboardStats({ period: 30 });
      setStats(response);
    } catch (err) {
      console.error("Failed to fetch cancellation stats:", err);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is not admin/owner
  if (!hasRole(["admin", "owner"])) {
    return null;
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-8"
      >
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </motion.div>
    );
  }

  if (error || !stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-8"
      >
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">{error}</p>
          <button
            onClick={fetchStats}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {t.retry}
          </button>
        </div>
      </motion.div>
    );
  }

  const { overall_statistics, approval_metrics, makeup_class_status } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            {t.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Link
          href="/dashboard/cancellations/pending"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
        >
          {t.viewAll}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Pending */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            {overall_statistics.pending_needs_action > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                {t.needsAction}
              </Badge>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {overall_statistics.total_pending}
          </div>
          <div className="text-sm text-gray-600">{t.pending}</div>
          {overall_statistics.pending_needs_action > 0 && (
            <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {overall_statistics.pending_needs_action} {t.urgent}
            </div>
          )}
        </motion.div>

        {/* Cancelled */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {overall_statistics.total_cancelled}
          </div>
          <div className="text-sm text-gray-600">{t.cancelled}</div>
          <div className="text-xs text-gray-500 mt-1">{t.last30Days}</div>
        </motion.div>

        {/* Cancellation Rate */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between mb-2">
            {overall_statistics.cancellation_rate > 10 ? (
              <TrendingUp className="h-5 w-5 text-red-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {overall_statistics.cancellation_rate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">{t.cancellationRate}</div>
          <div className="text-xs text-gray-500 mt-1">
            {overall_statistics.total_scheduled +
              overall_statistics.total_completed}{" "}
            {t.sessions}
          </div>
        </motion.div>

        {/* Approval Time */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            {approval_metrics.urgent_count_over_3_days > 0 && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                {approval_metrics.urgent_count_over_3_days}
              </Badge>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {approval_metrics.average_approval_time_hours.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">{t.avgApprovalTime}</div>
          <div className="text-xs text-gray-500 mt-1">{t.hours}</div>
        </motion.div>
      </div>

      {/* Makeup Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg p-4 shadow-md"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">
            {t.makeupNeeded}
          </h4>
          <span className="text-sm text-gray-600">
            {makeup_class_status.sessions_needing_makeup} {t.sessions}
          </span>
        </div>

        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${
                  makeup_class_status.sessions_needing_makeup > 0
                    ? (makeup_class_status.makeup_sessions_created /
                        makeup_class_status.sessions_needing_makeup) *
                      100
                    : 0
                }%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700 z-10">
                {makeup_class_status.makeup_sessions_created} /{" "}
                {makeup_class_status.sessions_needing_makeup}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>
                  {t.makeupCreated}:{" "}
                  {makeup_class_status.makeup_sessions_created}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                <span>
                  {t.pendingMakeup}:{" "}
                  {makeup_class_status.pending_makeup_creation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Urgent Requests Alert */}
      {approval_metrics.urgent_count_over_3_days > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">
                {approval_metrics.urgent_count_over_3_days} {t.urgent}
              </p>
              <p className="text-xs text-red-700 mt-1">{t.urgentDesc}</p>
            </div>
            <Link
              href="/dashboard/cancellations/pending"
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
            >
              {t.viewAll}
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
