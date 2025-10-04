import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaBell, FaCheck, FaEllipsisV, FaEye } from "react-icons/fa";
import { useNotifications } from "../../contexts/NotificationContext";
import { useIsMobile } from "../../hooks/useMediaQuery";
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
}: Readonly<NotificationDropdownProps>) {
  const router = useRouter();
  const isMobile = useIsMobile();
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

  const renderNotificationsContent = () => {
    if (isLoading && notifications.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-3 text-sm text-gray-500">กำลังโหลดการแจ้งเตือน...</p>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <FaBell className="h-8 w-8 text-gray-400" />
          </div>
          <p className="font-medium text-gray-500">ไม่มีการแจ้งเตือน</p>
          <p className="mt-1 text-sm text-gray-400">การแจ้งเตือนจะแสดงที่นี่</p>
        </div>
      );
    }

    return (
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
              className={`relative cursor-pointer border-l-4 transition-all duration-200 hover:bg-gray-50 ${
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
              <div className="flex items-start space-x-4 p-4">
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 ${colors.bg} ${colors.border} shadow-sm`}
                >
                  <span className="text-xl">
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
                        className={`mt-1.5 text-xs leading-relaxed line-clamp-2 ${
                          !notification.read ? "text-gray-600" : "text-gray-500"
                        }`}
                      >
                        {notification.message_th || notification.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-medium text-gray-400">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                          {/* Channel indicators */}
                          {notification.channels &&
                            notification.channels.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {notification.channels.includes("popup") && (
                                  <span
                                    className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800"
                                    title="ต้องการการตอบสนอง"
                                  >
                                    ⚡
                                  </span>
                                )}
                                {notification.channels.includes("normal") && (
                                  <span
                                    className="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800"
                                    title="การแจ้งเตือนปกติ"
                                  >
                                    📢
                                  </span>
                                )}
                                {notification.channels.includes("line") && (
                                  <span
                                    className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800"
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
                    <div className="ml-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(
                            showActions === notification.id
                              ? null
                              : notification.id
                          );
                        }}
                        className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="เมนูตัวเลือกการแจ้งเตือน"
                        aria-haspopup="menu"
                        aria-expanded={showActions === notification.id}
                        aria-controls={`notification-actions-${notification.id}`}
                      >
                        <FaEllipsisV className="h-3 w-3" />
                      </button>

                      {showActions === notification.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-2 top-12 z-10 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
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
                              className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
                              role="menuitem"
                            >
                              <FaEye className="h-3 w-3" />
                              <span>ทำเครื่องหมายว่าอ่านแล้ว</span>
                            </button>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="absolute left-1 top-4 h-2 w-2 rounded-full bg-blue-500 shadow-sm"></div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Navigate immediately so UI responds instantly
    const route = getNotificationRoute(notification);
    if (!notification.read) {
      // Fire-and-forget mark-as-read; don't await so navigation isn't delayed
      markAsRead(notification.id).catch((err) => {
        // silenced: don't block navigation on network/error
        console.warn("markAsRead failed", err);
      });
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

  const containerClasses = isMobile
    ? "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-h-[85vh] rounded-t-3xl border border-transparent bg-white shadow-2xl flex flex-col overflow-hidden"
    : "absolute right-0 top-12 z-50 w-[90vw] max-w-md rounded-lg border border-gray-200 bg-white shadow-xl max-h-[70vh] flex flex-col overflow-hidden";

  const containerStyle = isMobile
    ? { paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }
    : undefined;

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
        initial={
          isMobile ? { opacity: 0, y: 40 } : { opacity: 0, y: -10, scale: 0.95 }
        }
        animate={
          isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }
        }
        exit={
          isMobile ? { opacity: 0, y: 40 } : { opacity: 0, y: -10, scale: 0.95 }
        }
        transition={{ duration: 0.2 }}
        role="menu"
        id="notification-dropdown"
        aria-label="เมนูการแจ้งเตือน"
        className={containerClasses}
        style={containerStyle}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
            return;
          }
          if (e.key === "Tab") {
            const focusable =
              menuRef.current?.querySelectorAll('[tabindex="0"]');
            if (!focusable || focusable.length === 0) {
              return;
            }
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
        ref={menuRef}
      >
        {isMobile && (
          <div className="flex justify-center py-3">
            <span
              className="h-1.5 w-12 rounded-full bg-gray-300"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 sm:px-6">
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
          className={`flex-1 overflow-y-auto ${
            isMobile ? "max-h-[65vh]" : "max-h-[55vh]"
          }`}
          aria-busy={isLoading ? "true" : "false"}
        >
          {renderNotificationsContent()}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50 sm:px-6">
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
