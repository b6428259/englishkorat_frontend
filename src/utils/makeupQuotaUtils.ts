/**
 * Makeup Quota Utilities
 * ตาม doc ใหม่ (2025-01-23): Schedule-level makeup quota system
 */

import { checkScheduleMakeupQuota } from "@/services/api/schedules";
import { Schedule } from "@/types/group.types";

/**
 * ตรวจสอบว่าสามารถสร้าง makeup session ได้หรือไม่
 * @returns { canCreate: boolean, reason?: string }
 */
export const canCreateMakeupSession = (
  schedule: Schedule,
  session?: { has_makeup_session?: boolean; is_makeup?: boolean }
): { canCreate: boolean; reason?: string } => {
  // เช็ค quota
  const quota = checkScheduleMakeupQuota(schedule);
  if (!quota.hasQuota) {
    return {
      canCreate: false,
      reason: `No makeup quota remaining (${quota.used}/${quota.total} used)`,
    };
  }

  // เช็คว่า session นี้มี makeup อยู่แล้วหรือไม่
  if (session?.has_makeup_session) {
    return {
      canCreate: false,
      reason: "This session already has a makeup session",
    };
  }

  // เช็คว่า session นี้เป็น makeup session หรือไม่
  if (session?.is_makeup) {
    return {
      canCreate: false,
      reason: "Cannot create makeup for a makeup session",
    };
  }

  return { canCreate: true };
};

/**
 * แสดง UI message เมื่อ quota หมด
 */
export const getMakeupQuotaExhaustedMessage = (
  schedule: Schedule,
  language: "th" | "en" = "th"
): string => {
  const quota = checkScheduleMakeupQuota(schedule);

  if (language === "th") {
    return `ไม่สามารถสร้าง Makeup Class ได้

สิทธิ์ใช้หมดแล้ว: ${quota.used}/${quota.total}

กรุณาติดต่อแอดมินเพื่อเพิ่มสิทธิ์`;
  }

  return `Cannot create Makeup Class

Quota exhausted: ${quota.used}/${quota.total}

Please contact admin to increase quota`;
};

/**
 * แสดง warning message เมื่อสิทธิ์ใกล้หมด
 */
export const getMakeupQuotaWarningMessage = (
  schedule: Schedule,
  language: "th" | "en" = "th"
): string | null => {
  const quota = checkScheduleMakeupQuota(schedule);

  if (quota.remaining === 0) {
    return getMakeupQuotaExhaustedMessage(schedule, language);
  }

  if (quota.remaining === 1) {
    if (language === "th") {
      return `⚡ เหลือสิทธิ์ Makeup เพียง 1 ครั้งเท่านั้น!\nใช้ไปแล้ว: ${quota.used}/${quota.total}`;
    }
    return `⚡ Only 1 makeup session remaining!\nUsed: ${quota.used}/${quota.total}`;
  }

  return null;
};

/**
 * Format quota display for UI
 */
export const formatMakeupQuota = (schedule: Schedule): string => {
  const quota = checkScheduleMakeupQuota(schedule);
  return `${quota.remaining}/${quota.total}`;
};
