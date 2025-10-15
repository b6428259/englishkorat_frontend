"use client";

import type {
  ItemCondition,
  ItemStatus,
  RequestStatus,
  TransactionStatus,
} from "@/types/borrowing.types";

interface StatusBadgeProps {
  status: RequestStatus | TransactionStatus | ItemStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const statusConfig: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    // Request statuses
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "รอการอนุมัติ",
    },
    approved: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "อนุมัติแล้ว",
    },
    rejected: { bg: "bg-red-100", text: "text-red-800", label: "ปฏิเสธ" },
    cancelled: { bg: "bg-gray-100", text: "text-gray-700", label: "ยกเลิก" },

    // Transaction statuses
    borrowed: { bg: "bg-blue-100", text: "text-blue-800", label: "กำลังยืม" },
    returned: { bg: "bg-green-100", text: "text-green-800", label: "คืนแล้ว" },
    overdue: { bg: "bg-red-100", text: "text-red-800", label: "เกินกำหนด" },
    lost: { bg: "bg-gray-100", text: "text-gray-700", label: "สูญหาย" },
    damaged: { bg: "bg-orange-100", text: "text-orange-800", label: "เสียหาย" },

    // Item statuses
    available: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "พร้อมให้ยืม",
    },
    unavailable: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      label: "ไม่พร้อม",
    },
  };

  const config = statusConfig[status] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
}

interface ConditionBadgeProps {
  condition: ItemCondition;
  className?: string;
}

export function ConditionBadge({
  condition,
  className = "",
}: ConditionBadgeProps) {
  const conditionConfig: Record<
    ItemCondition,
    { bg: string; text: string; label: string }
  > = {
    excellent: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "ดีเยี่ยม",
    },
    good: { bg: "bg-blue-100", text: "text-blue-800", label: "ดี" },
    fair: { bg: "bg-yellow-100", text: "text-yellow-800", label: "พอใช้" },
    poor: { bg: "bg-orange-100", text: "text-orange-800", label: "แย่" },
    damaged: { bg: "bg-red-100", text: "text-red-800", label: "เสียหาย" },
    lost: { bg: "bg-gray-100", text: "text-gray-700", label: "สูญหาย" },
  };

  const config = conditionConfig[condition];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
}
