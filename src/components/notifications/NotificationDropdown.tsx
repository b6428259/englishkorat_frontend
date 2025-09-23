import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaBell, FaCheck, FaEllipsisV, FaEye } from "react-icons/fa";
import { useNotifications } from "../../contexts/NotificationContext";
import type { Notification } from "../../types/notification";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

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

  // Default to notifications page for unknown types
  return routes[notification.type] || "/notifications";
};

export default function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
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
  } = useNotifications();

  const [showActions, setShowActions] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLDivElement | null>(null);

  // Focus management: focus first item when opened
  useEffect(() => {
    if (isOpen) {
      // small timeout to wait for animation / mount
      setTimeout(() => {
        firstItemRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
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

  const handleNotificationClick = async (notification: Notification) => {
    // Navigate immediately so UI responds instantly
    const route = getNotificationRoute(notification);
    try {
      // Fire-and-forget mark-as-read; don't await so navigation isn't delayed
      if (!notification.read) {
        markAsRead(notification.id).catch((err) => {
          // silenced: don't block navigation on network/error
          console.warn("markAsRead failed", err);
        });
      }
    } catch {
      // ignore
    }

    // Optimistic UI and short toast to indicate action
    if (!notification.read) {
      toast("ทำเครื่องหมายว่าอ่านแล้ว", {
        icon: "✓",
        position: "top-right",
        duration: 1200,
      });
    }

    router.push(route);
    onClose();
  };

  const handleViewAll = () => {
    router.push("/notifications");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop - placed as a sibling so it doesn't block dropdown clicks */}
      <motion.div
        key="notification-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        key="notification-menu"
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        role="menu"
        id="notification-dropdown"
        aria-label="เมนูการแจ้งเตือน"
        className="absolute right-0 top-12 w-[90vw] max-w-md bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        ref={menuRef}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3" aria-live="polite">
              <div className="p-2 bg-blue-100 rounded-full">
                <FaBell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  การแจ้งเตือน
                </h3>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0
                    ? `${unreadCount} รายการใหม่`
                    : "ไม่มีการแจ้งเตือนใหม่"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Connection status */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isConnected ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isConnected ? "เชื่อมต่อ" : "ขาดการเชื่อมต่อ"}
                </span>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors"
                  title="ทำเครื่องหมายว่าอ่านทั้งหมด"
                >
                  <FaCheck className="w-3 h-3" />
                  <span>อ่านทั้งหมด</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div
          className="max-h-[55vh] overflow-y-auto"
          aria-busy={isLoading ? "true" : "false"}
          // Basic focus trap: keep Tab focus inside the menu
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              const focusable =
                menuRef.current?.querySelectorAll('[tabindex="0"]');
              if (!focusable || focusable.length === 0) return;
              const first = focusable[0] as HTMLElement;
              const last = focusable[focusable.length - 1] as HTMLElement;
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }}
        >
          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm">
                กำลังโหลดการแจ้งเตือน...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaBell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">ไม่มีการแจ้งเตือน</p>
              <p className="text-gray-400 text-sm mt-1">
                การแจ้งเตือนจะแสดงที่นี่
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.slice(0, 5).map((notification, idx) => {
                const colors = getNotificationColors(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`relative p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 border-l-4 ${
                      !notification.read
                        ? `${colors.border} bg-gradient-to-r from-blue-25 to-transparent`
                        : "border-transparent bg-white hover:border-gray-200"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                    role="menuitem"
                    tabIndex={0}
                    ref={idx === 0 ? firstItemRef : undefined}
                    aria-label={
                      (notification.title_th || notification.title) +
                      (notification.read ? "" : " ยังไม่ได้อ่าน")
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNotificationClick(notification);
                      }
                      if (e.key === "Escape") {
                        onClose();
                      }
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl ${colors.bg} border-2 ${colors.border} flex items-center justify-center shadow-sm`}
                      >
                        <span className="text-xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-2">
                            <p
                              className={`text-sm font-semibold leading-tight ${
                                !notification.read
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title_th || notification.title}
                            </p>
                            <p
                              className={`text-xs mt-1.5 leading-relaxed ${
                                !notification.read
                                  ? "text-gray-600"
                                  : "text-gray-500"
                              } line-clamp-2`}
                            >
                              {notification.message_th || notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-400 font-medium">
                                  {formatTimeAgo(notification.created_at)}
                                </p>
                                {/* Channel indicators */}
                                {notification.channels &&
                                  notification.channels.length > 0 && (
                                    <div className="flex items-center space-x-1">
                                      {notification.channels.includes(
                                        "popup"
                                      ) && (
                                        <span
                                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                          title="ต้องการการตอบสนอง"
                                        >
                                          ⚡
                                        </span>
                                      )}
                                      {notification.channels.includes(
                                        "normal"
                                      ) && (
                                        <span
                                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                          title="การแจ้งเตือนปกติ"
                                        >
                                          📢
                                        </span>
                                      )}
                                      {notification.channels.includes(
                                        "line"
                                      ) && (
                                        <span
                                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                          title="ส่งผ่าน LINE"
                                        >
                                          LINE
                                        </span>
                                      )}
                                    </div>
                                  )}
                              </div>
                              {notification.branch && (
                                <p className="text-xs text-gray-400">
                                  {notification.branch.name_th ||
                                    notification.branch.name_en}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActions(
                                  showActions === notification.id
                                    ? null
                                    : notification.id
                                );
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                              aria-label="เมนูตัวเลือกการแจ้งเตือน"
                              aria-haspopup="menu"
                              aria-expanded={showActions === notification.id}
                              aria-controls={`notification-actions-${notification.id}`}
                            >
                              <FaEllipsisV className="w-3 h-3" />
                            </button>

                            {showActions === notification.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-2 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]"
                                role="menu"
                                id={`notification-actions-${notification.id}`}
                              >
                                {!notification.read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                      setShowActions(null);
                                    }}
                                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left cursor-pointer transition-colors"
                                    role="menuitem"
                                  >
                                    <FaEye className="w-3 h-3" />
                                    <span>ทำเครื่องหมายว่าอ่านแล้ว</span>
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="absolute left-1 top-4 w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleViewAll}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition-colors group"
            >
              <span>ดูการแจ้งเตือนทั้งหมด</span>
              <motion.div
                className="group-hover:translate-x-1 transition-transform"
                initial={false}
              >
                →
              </motion.div>
            </button>
            <div className="flex items-center space-x-3">
              {hasMore && notifications.length > 0 && (
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isLoading ? "กำลังโหลด..." : "โหลดเพิ่ม"}
                </button>
              )}
              <button
                onClick={refreshNotifications}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 cursor-pointer transition-colors"
              >
                รีเฟรช
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
