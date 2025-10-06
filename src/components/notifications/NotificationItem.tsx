"use client";

import type { Notification } from "@/types/notification";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaCheck, FaEllipsisV, FaEye } from "react-icons/fa";

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
  index?: number;
}

export function NotificationItem({
  notification,
  onNotificationClick,
  onMarkAsRead,
  showActions = true,
  compact = false,
  index = 0,
}: NotificationItemProps) {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const getNotificationIcon = (type: string): string => {
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

  const getNotificationColors = (type: string) => {
    const colors: Record<
      string,
      { bg: string; border: string; text: string; accent: string }
    > = {
      info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        accent: "bg-blue-500",
      },
      warning: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
        accent: "bg-amber-500",
      },
      error: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        accent: "bg-red-500",
      },
      success: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-800",
        accent: "bg-emerald-500",
      },
      class_confirmation: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        accent: "bg-green-500",
      },
      class_cancellation: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        accent: "bg-red-500",
      },
      schedule_change: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-800",
        accent: "bg-purple-500",
      },
      payment_reminder: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        accent: "bg-yellow-500",
      },
      student_registration: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        accent: "bg-blue-500",
      },
    };
    return colors[type] || colors.info;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "เมื่อสักครู่";
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;

    return date.toLocaleDateString("th-TH");
  };

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

  const colors = getNotificationColors(notification.type);

  if (compact) {
    // Compact version for dropdown
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        className={`relative cursor-pointer border-l-4 transition-all duration-200 hover:bg-gray-50 ${
          !notification.read
            ? `${colors.border} bg-gradient-to-r from-blue-25 to-transparent`
            : "border-transparent bg-white hover:border-gray-200"
        }`}
        onClick={() => onNotificationClick(notification)}
      >
        <div className="flex items-start space-x-3 p-4">
          {/* Icon */}
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border-2 ${colors.bg} ${colors.border}`}
          >
            <span className="text-lg">
              {getNotificationIcon(notification.type)}
            </span>
          </div>

          {/* Content */}
          <div className="relative flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <p
                  className={`text-sm font-semibold leading-tight ${
                    !notification.read ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {notification.title_th || notification.title}
                </p>
                <p
                  className={`mt-1 text-xs leading-relaxed line-clamp-2 ${
                    !notification.read ? "text-gray-600" : "text-gray-500"
                  }`}
                >
                  {notification.message_th || notification.message}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-400">
                    {formatTimeAgo(notification.created_at)}
                  </p>
                  {/* Channel indicators */}
                  {notification.channels &&
                    notification.channels.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {notification.channels.includes("popup") && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800">
                            ⚡
                          </span>
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="ml-2 flex-shrink-0">
                  {!notification.read ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead?.(notification.id);
                      }}
                      className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                      title="ทำเครื่องหมายว่าอ่านแล้ว"
                    >
                      <FaEye className="h-3 w-3" />
                    </button>
                  ) : (
                    <div className="text-green-600 p-1.5">
                      <FaCheck className="h-3 w-3" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-blue-500 shadow-sm"></div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Full version for notifications page
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.01] ${
        !notification.read
          ? "ring-2 ring-blue-100 border-blue-200"
          : "hover:border-gray-300"
      }`}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-14 h-14 rounded-xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center shadow-sm`}
          >
            <span className="text-2xl">
              {getNotificationIcon(notification.type)}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3
                    className={`text-lg font-semibold ${
                      !notification.read ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {notification.title_th || notification.title}
                  </h3>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                <p
                  className={`text-sm ${
                    !notification.read ? "text-gray-600" : "text-gray-500"
                  } mb-3 leading-relaxed`}
                >
                  {notification.message_th || notification.message}
                </p>

                <div className="flex items-center flex-wrap gap-2 text-xs text-gray-400">
                  <span className="font-medium">
                    {formatTimeAgo(notification.created_at)}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} font-medium`}
                  >
                    {getTypeDisplayName(notification.type)}
                  </span>
                  {notification.user && (
                    <span>
                      จาก: {notification.user.first_name_th}{" "}
                      {notification.user.last_name_th}
                    </span>
                  )}
                  {/* Channel indicators */}
                  {notification.channels &&
                    notification.channels.length > 0 && (
                      <>
                        {notification.channels.includes("popup") && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            ⚡ Popup
                          </span>
                        )}
                        {notification.channels.includes("line") && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            LINE
                          </span>
                        )}
                      </>
                    )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex-shrink-0 ml-4 relative">
                  {!notification.read ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionsMenu(!showActionsMenu);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-2 cursor-pointer transition-colors rounded-lg hover:bg-gray-100"
                        title="ตัวเลือกเพิ่มเติม"
                      >
                        <FaEllipsisV className="w-4 h-4" />
                      </button>
                      {showActionsMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-10"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead?.(notification.id);
                              setShowActionsMenu(false);
                            }}
                            className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
                          >
                            <FaEye className="h-3 w-3" />
                            <span>ทำเครื่องหมายว่าอ่านแล้ว</span>
                          </button>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="text-green-600 p-2" title="อ่านแล้ว">
                      <FaCheck className="w-5 h-5" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
