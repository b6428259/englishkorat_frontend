"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Notification } from "@/types/notification";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface BorrowingUrgentPopupProps {
  notification: Notification;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BorrowingUrgentPopup({
  notification,
  isOpen,
  onClose,
  onConfirm,
}: BorrowingUrgentPopupProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const isDueSoon = notification.data?.type === "borrow_due_soon";
  const isOverdue = notification.data?.type === "borrow_overdue";

  if (!isOpen) return null;

  const title = language === "th" ? notification.title_th : notification.title;
  const message =
    language === "th" ? notification.message_th : notification.message;

  const handleViewBorrows = () => {
    onConfirm(); // Trigger navigation callback
    router.push("/borrowing/my-borrows");
  };

  // Extract icon logic
  const getIcon = () => {
    if (isDueSoon) return "⏰";
    if (isOverdue) return "❌";
    return "📚";
  };

  // Extract color classes
  const headerColorClass = isDueSoon
    ? "bg-gradient-to-r from-amber-400 to-yellow-500"
    : "bg-gradient-to-r from-red-500 to-rose-600";

  const infoBoxColorClass = isDueSoon
    ? "bg-amber-50 border-amber-200"
    : "bg-red-50 border-red-200";

  const buttonColorClass = isDueSoon
    ? "bg-amber-500 hover:bg-amber-600"
    : "bg-red-600 hover:bg-red-700";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header with color indicator */}
        <div className={`px-6 py-4 ${headerColorClass}`}>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{getIcon()}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white drop-shadow-md">
                {title}
              </h3>
              {isOverdue && notification.data?.days_overdue && (
                <p className="text-sm text-white/90 mt-1">
                  {language === "th"
                    ? `เกินกำหนด ${notification.data.days_overdue} วัน`
                    : `${notification.data.days_overdue} days overdue`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 leading-relaxed mb-4">{message}</p>

          {/* Additional info for overdue */}
          {isOverdue && notification.data?.late_fee && (
            <div className={`p-4 rounded-lg ${infoBoxColorClass} border mb-4`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {language === "th" ? "ค่าปรับที่สะสม:" : "Late Fee:"}
                </span>
                <span className="text-lg font-bold text-red-600">
                  {notification.data.late_fee.toFixed(2)}{" "}
                  {language === "th" ? "บาท" : "THB"}
                </span>
              </div>
            </div>
          )}

          {/* Due date info for due_soon */}
          {isDueSoon && notification.data?.due_date && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {language === "th" ? "กำหนดคืน:" : "Due Date:"}
                </span>
                <span className="text-sm font-semibold text-amber-800">
                  {new Date(notification.data.due_date).toLocaleDateString(
                    language === "th" ? "th-TH" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {language === "th" ? "ปิด" : "Close"}
          </button>
          <button
            onClick={handleViewBorrows}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors ${buttonColorClass}`}
          >
            {language === "th" ? "ดูรายการยืม" : "View My Borrows"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
