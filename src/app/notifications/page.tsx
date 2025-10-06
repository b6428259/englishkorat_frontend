"use client";

import SidebarLayout from "@/components/common/SidebarLayout";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/contexts/NotificationContext";
import type { Notification } from "@/types/notification";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaBell, FaCheck, FaFilter, FaSearch, FaSync } from "react-icons/fa";

// Notification type to route mapping
const getNotificationRoute = (notification: Notification): string => {
  const routes: Record<string, string> = {
    student_registration: "/students/new",
    class_confirmation: "/schedule",
    class_cancellation: "/schedule",
    schedule_change: "/schedule",
    payment_reminder: "/students/list",
    appointment_reminder: "/schedule",
    class_reminder: "/schedule",
    leave_approval: "/teachers/list",
    report_deadline: "/dashboard",
    room_conflict: "/schedule",
    system_maintenance: "/dashboard",
  };

  return routes[notification.type] || "/notifications";
};

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore,
    openNotificationPopup,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const getTypeDisplayName = (type: string) => {
    const names: Record<string, string> = {
      info: "ข้อมูลทั่วไป",
      warning: "คำเตือน",
      error: "ข้อผิดพลาด",
      success: "สำเร็จ",
      class_confirmation: "ยืนยันการเรียน",
      class_cancellation: "ยกเลิกการเรียน",
      schedule_change: "เปลี่ยนแปลงตารางเรียน",
      payment_reminder: "แจ้งเตือนการชำระเงิน",
      student_registration: "การสมัครนักเรียน",
      appointment_reminder: "แจ้งเตือนนัดหมาย",
      class_reminder: "แจ้งเตือนการเรียน",
      system_maintenance: "บำรุงรักษาระบบ",
      leave_approval: "อนุมัติการลา",
      report_deadline: "กำหนดส่งรายงาน",
      room_conflict: "ขัดแย้งห้องเรียน",
      general: "ทั่วไป",
    };
    return names[type] || "อื่นๆ";
  };

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by read status
    if (filter === "unread" && notification.read) return false;
    if (filter === "read" && !notification.read) return false;

    // Filter by type
    if (selectedType !== "all" && notification.type !== selectedType)
      return false;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = (notification.title_th || notification.title)
        .toLowerCase()
        .includes(searchLower);
      const messageMatch = (notification.message_th || notification.message)
        .toLowerCase()
        .includes(searchLower);
      if (!titleMatch && !messageMatch) return false;
    }

    return true;
  });

  // Get unique notification types for filter dropdown
  const notificationTypes = Array.from(
    new Set(notifications.map((n) => n.type))
  );

  const handleNotificationClick = async (notification: Notification) => {
    const channels = notification.channels || ["normal"];
    const hasPopupChannel = channels.includes("popup");

    // If this notification has popup channel, open it as modal
    if (hasPopupChannel) {
      openNotificationPopup(notification);
      return;
    }

    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to relevant page
    const route = getNotificationRoute(notification);
    router.push(route);
  };

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <FaBell className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    การแจ้งเตือน
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {unreadCount > 0 ? (
                      <span className="text-blue-600 font-semibold">
                        {unreadCount} ข้อความใหม่
                      </span>
                    ) : (
                      "ไม่มีข้อความใหม่"
                    )}
                  </p>
                </div>
              </div>

              {/* Connection Status & Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                    isConnected
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs font-medium">
                    {isConnected ? "เชื่อมต่อแล้ว" : "ขาดการเชื่อมต่อ"}
                  </span>
                </div>

                <button
                  onClick={refreshNotifications}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 cursor-pointer transition-all hover:shadow-md disabled:cursor-not-allowed font-medium text-sm"
                >
                  <FaSync
                    className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">
                    {isLoading ? "กำลังโหลด..." : "รีเฟรช"}
                  </span>
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2 cursor-pointer transition-all hover:shadow-md font-medium text-sm"
                  >
                    <FaCheck className="w-3 h-3" />
                    <span className="hidden sm:inline">อ่านทั้งหมด</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ค้นหาการแจ้งเตือน..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text transition-all"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-3 py-2.5">
                  <FaFilter className="text-gray-400 w-3.5 h-3.5" />
                  <select
                    value={filter}
                    onChange={(e) =>
                      setFilter(e.target.value as "all" | "unread" | "read")
                    }
                    className="bg-transparent border-none focus:ring-0 cursor-pointer text-sm font-medium text-gray-700"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="unread">ยังไม่อ่าน</option>
                    <option value="read">อ่านแล้ว</option>
                  </select>
                </div>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-gray-50 border-none rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm font-medium text-gray-700"
                >
                  <option value="all">ทุกประเภท</option>
                  {notificationTypes.map((type) => (
                    <option key={type} value={type}>
                      {getTypeDisplayName(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-12 text-center"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                    <FaBell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ไม่มีการแจ้งเตือน
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filter !== "all" || selectedType !== "all"
                      ? "ไม่พบการแจ้งเตือนที่ตรงกับเงื่อนไขที่เลือก"
                      : "คุณไม่มีการแจ้งเตือนในขณะนี้"}
                  </p>
                </motion.div>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onNotificationClick={handleNotificationClick}
                    onMarkAsRead={markAsRead}
                    showActions={true}
                    compact={false}
                    index={index}
                  />
                ))
              )}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && filteredNotifications.length > 0 && (
              <div className="text-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 cursor-pointer transition-all hover:shadow-lg disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
