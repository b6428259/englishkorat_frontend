import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { FaBell, FaCheck, FaSync } from "react-icons/fa";
import { HiOutlineInbox } from "react-icons/hi2";
import { useNotifications } from "../../contexts/NotificationContext";
import { useIsMobile } from "../../hooks/useMediaQuery";
import type { Notification } from "../../types/notification";
import { NotificationItem } from "./NotificationItem";

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
    openNotificationPopup,
  } = useNotifications();

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

  const renderNotificationsContent = () => {
    if (isLoading && notifications.length === 0) {
      return (
        <div className="p-12 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-500"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm font-medium text-gray-600"
          >
            กำลังโหลดการแจ้งเตือน...
          </motion.p>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm"
          >
            <HiOutlineInbox className="h-10 w-10 text-blue-400" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base font-semibold text-gray-700"
          >
            ไม่มีการแจ้งเตือน
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-sm text-gray-500"
          >
            การแจ้งเตือนจะแสดงที่นี่
          </motion.p>
        </motion.div>
      );
    }

    return (
      <div className="divide-y divide-gray-100">
        {notifications.slice(0, 5).map((notification, idx) => (
          <motion.div
            key={notification.id}
            ref={idx === 0 ? firstItemRef : undefined}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <NotificationItem
              notification={notification}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={markAsRead}
              showActions={true}
              compact={true}
              index={idx}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  const handleNotificationClick = async (notification: Notification) => {
    const channels = notification.channels || ["normal"];
    const hasPopupChannel = channels.includes("popup");

    // If this notification has popup channel, open it as modal
    if (hasPopupChannel) {
      openNotificationPopup(notification);
      onClose();
      return;
    }

    // Otherwise, navigate immediately so UI responds instantly
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
    ? "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-h-[85vh] rounded-t-3xl border border-gray-100 bg-white shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm"
    : "absolute right-0 top-12 z-50 w-[90vw] max-w-md rounded-2xl border border-gray-100 bg-white shadow-2xl max-h-[70vh] flex flex-col overflow-hidden";

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
          <div className="flex justify-center py-3 bg-gradient-to-b from-gray-50 to-transparent">
            <motion.span
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                  onClose();
                }
              }}
              className="h-1.5 w-12 rounded-full bg-gray-300 cursor-grab active:cursor-grabbing"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex items-center space-x-3 min-w-0 flex-1"
              aria-live="polite"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex-shrink-0"
              >
                <FaBell className="w-5 h-5 text-white" />
              </motion.div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  การแจ้งเตือน
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  {unreadCount > 0
                    ? `${unreadCount} รายการใหม่`
                    : "ไม่มีการแจ้งเตือนใหม่"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Connection status */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg ${
                  isConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
                title={isConnected ? "เชื่อมต่อแล้ว" : "ขาดการเชื่อมต่อ"}
              >
                <motion.div
                  animate={isConnected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-2 h-2 rounded-full ${
                    isConnected
                      ? "bg-green-500 shadow-green-500/50 shadow-md"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-xs font-semibold hidden sm:inline">
                  {isConnected ? "เชื่อมต่อ" : "ออฟไลน์"}
                </span>
              </motion.div>

              {unreadCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-white rounded-lg text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer transition-all shadow-sm hover:shadow-md border border-blue-100"
                  title="ทำเครื่องหมายว่าอ่านทั้งหมด"
                >
                  <FaCheck className="w-3 h-3" />
                  <span className="hidden sm:inline">อ่านหมด</span>
                </motion.button>
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
        <div className="px-4 py-4 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50/30 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewAll}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-bold cursor-pointer transition-colors group px-3 py-2 rounded-lg hover:bg-blue-50/50"
            >
              <span>ดูทั้งหมด</span>
              <motion.div
                className="group-hover:translate-x-1 transition-transform text-base"
                initial={false}
              >
                →
              </motion.div>
            </motion.button>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshNotifications}
                disabled={isLoading}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-800 hover:bg-white font-medium disabled:opacity-50 cursor-pointer transition-all border border-gray-200 shadow-sm hover:shadow-md"
                title="รีเฟรชการแจ้งเตือน"
              >
                <FaSync
                  className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">รีเฟรช</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
