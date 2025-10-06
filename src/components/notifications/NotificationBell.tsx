import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNotifications } from "../../contexts/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const { unreadCount, isConnected, popupNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Check if there are any popup notifications pending
  const hasPopupNotifications = popupNotification !== null;

  let buttonStateClass =
    "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md";
  if (hasPopupNotifications) {
    buttonStateClass = "bg-red-100 text-red-600 shadow-lg animate-pulse";
  } else if (isOpen) {
    buttonStateClass = "bg-blue-100 text-blue-600 shadow-lg";
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((v) => !v);
  };

  // Keyboard accessibility
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((v) => !v);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      bellRef.current?.focus();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        ref={bellRef}
        onClick={handleToggle}
        onKeyDown={onKeyDown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="notification-dropdown"
        aria-label="เปิดการแจ้งเตือน"
        className={`relative rounded-xl transition-all duration-200 cursor-pointer px-2.5 py-2.5 sm:p-3 ${buttonStateClass}`}
        title={hasPopupNotifications ? "การแจ้งเตือนเร่งด่วน!" : "การแจ้งเตือน"}
      >
        <FaBell className="w-5 h-5" />

        {/* Unread count badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 font-semibold shadow-lg"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Connection status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
          title={isConnected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
        />

        {/* Pulse animation for new notifications */}
        {unreadCount > 0 && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-blue-400 opacity-30"
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0"
          whileHover={{ opacity: 0.1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>

      {/* Notification Dropdown */}
      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          bellRef.current?.focus();
        }}
      />
    </div>
  );
}
