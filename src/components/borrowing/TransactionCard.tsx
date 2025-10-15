"use client";

import type { BorrowTransaction } from "@/types/borrowing.types";
import { formatDateReadable } from "@/utils/dateFormatter";
import { ConditionBadge, StatusBadge } from "./StatusBadge";

interface TransactionCardProps {
  transaction: BorrowTransaction;
  onClick?: () => void;
  showActions?: boolean;
  onRenew?: () => void;
  onCheckIn?: () => void;
  className?: string;
}

export function TransactionCard({
  transaction,
  onClick,
  showActions = false,
  onRenew,
  onCheckIn,
  className = "",
}: TransactionCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const datePart = dateString.split("T")[0];
    return formatDateReadable(datePart, "th");
  };

  const getUserName = () => {
    if (transaction.user?.student) {
      return `${transaction.user.student.first_name} ${transaction.user.student.last_name}`;
    }
    return transaction.user?.username || "ไม่ระบุ";
  };

  const isOverdue = () => {
    if (transaction.status === "returned") return false;
    const dueDate = new Date(transaction.due_date);
    return dueDate < new Date();
  };

  const daysUntilDue = () => {
    const dueDate = new Date(transaction.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const CardWrapper = onClick ? "button" : "div";

  return (
    <CardWrapper
      className={`w-full text-left bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {transaction.item?.title || `รายการ #${transaction.item_id}`}
          </h3>
          <p className="text-sm text-gray-600">ผู้ยืม: {getUserName()}</p>
        </div>
        <StatusBadge status={transaction.status} />
      </div>

      {/* Dates */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">วันที่ยืม:</span>
          <span className="font-medium">
            {formatDate(transaction.borrowed_date)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">กำหนดคืน:</span>
          <span className={`font-medium ${isOverdue() ? "text-red-600" : ""}`}>
            {formatDate(transaction.due_date)}
            {transaction.status === "borrowed" && !isOverdue() && (
              <span className="ml-2 text-xs text-gray-500">
                (อีก {daysUntilDue()} วัน)
              </span>
            )}
          </span>
        </div>
        {transaction.returned_date && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">วันที่คืน:</span>
            <span className="font-medium text-green-600">
              {formatDate(transaction.returned_date)}
            </span>
          </div>
        )}
        {transaction.extended_until && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ต่ออายุถึง:</span>
            <span className="font-medium text-blue-600">
              {formatDate(transaction.extended_until)}
            </span>
          </div>
        )}
      </div>

      {/* Renewal Info */}
      {transaction.renewal_count > 0 && (
        <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
          <span className="text-blue-700">
            ต่ออายุแล้ว {transaction.renewal_count} ครั้ง
            {transaction.item?.renewable_count &&
              ` (สูงสุด ${transaction.item.renewable_count} ครั้ง)`}
          </span>
        </div>
      )}

      {/* Condition */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">สภาพตอนยืม:</span>
          <ConditionBadge condition={transaction.condition_on_borrow} />
        </div>
        {transaction.condition_on_return && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">สภาพตอนคืน:</span>
            <ConditionBadge condition={transaction.condition_on_return} />
          </div>
        )}
      </div>

      {/* Fees */}
      {transaction.total_fee > 0 && (
        <div className="mb-3 p-3 bg-red-50 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-red-900">
              ค่าธรรมเนียมทั้งหมด
            </span>
            <span className="text-lg font-bold text-red-600">
              {transaction.total_fee} บาท
            </span>
          </div>
          {transaction.late_fee > 0 && (
            <div className="flex justify-between text-sm text-red-700">
              <span>ค่าปรับล่าช้า ({transaction.late_days} วัน):</span>
              <span>{transaction.late_fee} บาท</span>
            </div>
          )}
          {transaction.damage_fee > 0 && (
            <div className="flex justify-between text-sm text-red-700">
              <span>ค่าเสียหาย:</span>
              <span>{transaction.damage_fee} บาท</span>
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-red-200">
            <span
              className={`text-xs font-medium ${
                transaction.fee_paid ? "text-green-600" : "text-red-600"
              }`}
            >
              {transaction.fee_paid ? "✓ ชำระเงินแล้ว" : "⚠ ยังไม่ได้ชำระ"}
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      {transaction.borrow_notes && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
          <p className="text-gray-600 font-medium mb-1">หมายเหตุการยืม:</p>
          <p className="text-gray-700">{transaction.borrow_notes}</p>
        </div>
      )}
      {transaction.return_notes && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
          <p className="text-gray-600 font-medium mb-1">หมายเหตุการคืน:</p>
          <p className="text-gray-700">{transaction.return_notes}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          {transaction.status === "borrowed" &&
            onRenew &&
            transaction.item?.renewable_count &&
            transaction.renewal_count < transaction.item.renewable_count && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRenew();
                }}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                ต่ออายุ
              </button>
            )}
          {(transaction.status === "borrowed" ||
            transaction.status === "overdue") &&
            onCheckIn && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckIn();
                }}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                รับคืน
              </button>
            )}
        </div>
      )}
    </CardWrapper>
  );
}
