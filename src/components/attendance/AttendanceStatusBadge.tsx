"use client";

import type { AttendanceStatus } from "@/types/attendance.types";
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  lateMinutes?: number | null;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export default function AttendanceStatusBadge({
  status,
  lateMinutes,
  size = "md",
  showIcon = true,
}: Readonly<AttendanceStatusBadgeProps>) {
  const getStatusConfig = () => {
    switch (status) {
      case "on-time":
        return {
          label: "ตรงเวลา",
          labelEn: "On Time",
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-300",
          Icon: CheckCircle,
        };
      case "late":
        return {
          label: lateMinutes ? `สาย ${lateMinutes} นาที` : "สาย",
          labelEn: lateMinutes ? `Late ${lateMinutes} min` : "Late",
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-300",
          Icon: Clock,
        };
      case "present":
        return {
          label: "เข้าเรียน",
          labelEn: "Present",
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-300",
          Icon: CheckCircle,
        };
      case "absent":
        return {
          label: "ขาดเรียน",
          labelEn: "Absent",
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-300",
          Icon: XCircle,
        };
      case "field-work":
        return {
          label: "ทำงานภาคสนาม",
          labelEn: "Field Work",
          bg: "bg-indigo-100",
          text: "text-indigo-700",
          border: "border-indigo-300",
          Icon: Briefcase,
        };
      default:
        return {
          label: "ไม่ทราบสถานะ",
          labelEn: "Unknown",
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-300",
          Icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.Icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${config.bg} ${config.text} ${config.border}
        border rounded-full font-medium
        ${sizeClasses[size]}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  );
}
