"use client";

import { checkScheduleMakeupQuota } from "@/services/api/schedules";
import { colors } from "@/styles/colors";
import { AlertCircle, Award } from "lucide-react";

interface MakeupQuotaBadgeProps {
  schedule: {
    make_up_quota?: number;
    make_up_remaining?: number;
    make_up_used?: number;
  };
  variant?: "default" | "compact";
  showWarning?: boolean;
}

/**
 * Component แสดง Makeup Quota ของ Schedule
 * ตาม doc ใหม่ (2025-01-23): Makeup quota อยู่ที่ Schedule level
 */
export default function MakeupQuotaBadge({
  schedule,
  variant = "default",
  showWarning = true,
}: MakeupQuotaBadgeProps) {
  const quota = checkScheduleMakeupQuota(schedule);

  // สีตามเปอร์เซ็นต์ที่เหลือ
  const getColor = () => {
    if (quota.percentage > 50) return colors.success; // เขียว
    if (quota.percentage > 0) return "#F59E0B"; // เหลือง/ส้ม
    return colors.accent; // แดง
  };

  const color = getColor();

  if (variant === "compact") {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
        style={{
          backgroundColor: `${color}15`,
          color: color,
          border: `1px solid ${color}40`,
        }}
      >
        <Award className="h-3 w-3" />
        <span>
          {quota.remaining}/{quota.total}
        </span>
      </div>
    );
  }

  return (
    <div
      className="p-3 rounded-lg border"
      style={{
        backgroundColor: `${color}10`,
        borderColor: `${color}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Award className="h-4 w-4" style={{ color }} />
        <span className="font-semibold text-sm" style={{ color }}>
          Makeup Quota
        </span>
      </div>

      <div className="space-y-1 text-xs text-gray-700">
        <div className="flex justify-between">
          <span>Remaining:</span>
          <span className="font-semibold" style={{ color }}>
            {quota.remaining}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Used:</span>
          <span>{quota.used}</span>
        </div>
        <div className="flex justify-between">
          <span>Total:</span>
          <span>{quota.total}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${quota.percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Warning */}
      {showWarning && !quota.hasQuota && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>No quota remaining! Contact admin to increase.</span>
        </div>
      )}

      {showWarning && quota.remaining === 1 && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-yellow-600">
          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>Only 1 makeup session remaining!</span>
        </div>
      )}
    </div>
  );
}
