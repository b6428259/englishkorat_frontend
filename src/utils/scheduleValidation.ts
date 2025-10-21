import type {
  CreateScheduleInput as CreateScheduleRequest,
  CreateSessionRequest,
} from "@/services/api/schedules";

export type ValidationIssue = { field: string; message: string };

// Basic helpers
// Accept either a date-only string (YYYY-MM-DD) or a full ISO/RFC3339 timestamp
const isIsoDate = (s?: string) => {
  if (!s) return false;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/; // 2025-09-20
  const isoFull = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/; // 2025-09-20T00:00:00.000Z
  return dateOnly.test(s) || isoFull.test(s);
};
const toInt = (n: unknown) =>
  typeof n === "number" ? n : parseInt(String(n || "0"), 10);

// Validate schedule per new rules
export function validateScheduleForm(
  input: Partial<CreateScheduleRequest> & {
    session_times?: Array<{ weekday: number; start_time: string }>;
  }
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!input.schedule_name?.trim())
    issues.push({
      field: "schedule_name",
      message: "กรุณาระบุชื่อคอร์ส/ตารางเรียน",
    });
  if (!input.start_date || !isIsoDate(input.start_date))
    issues.push({
      field: "start_date",
      message: "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD) หรือ ISO (RFC3339)",
    });
  // Course selection is optional; however, if a course is assigned then a group must
  // be provided first (we require group-first assignment). Also, for class schedules
  // either a group must be selected or a group will be required by other flows.
  if (input.course_id && !input.group_id) {
    issues.push({ field: "group_id", message: "กรุณาเลือกกลุ่มก่อนระบุคอร์ส" });
  }

  // Recurring rules - hours required for any recurring pattern (not just class)
  if (input.recurring_pattern && input.recurring_pattern !== "none") {
    // รองรับทศนิยม (0.5 = 30 นาที) - ใช้ Number.parseFloat แทน toInt
    const hoursPerSession = Number.parseFloat(
      String(input.hours_per_session || 0)
    );
    if (!input.hours_per_session || hoursPerSession <= 0)
      issues.push({
        field: "hours_per_session",
        message: "ชั่วโมงต่อครั้งต้องมากกว่า 0 (เช่น 0.5 สำหรับ 30 นาที)",
      });
    // ตรวจสอบขั้นต่ำ 0.5 ชั่วโมง (30 นาที)
    if (hoursPerSession > 0 && hoursPerSession < 0.5) {
      issues.push({
        field: "hours_per_session",
        message: "ชั่วโมงต่อครั้งต้องไม่ต่ำกว่า 0.5 ชั่วโมง (30 นาที)",
      });
    }
    if (!input.total_hours || toInt(input.total_hours) <= 0)
      issues.push({ field: "total_hours", message: "ชั่วโมงรวมต้องมากกว่า 0" });
    if (!input.session_per_week || toInt(input.session_per_week) <= 0)
      issues.push({
        field: "session_per_week",
        message: "จำนวนครั้งต่อสัปดาห์ต้องมากกว่า 0",
      });

    // Validate custom recurring days when pattern is custom
    // Class schedules can use session_times instead, so only check if not using session_times
    if (
      input.recurring_pattern === "custom" &&
      (!input.custom_recurring_days ||
        input.custom_recurring_days.length === 0) &&
      (!input.session_times || input.session_times.length === 0)
    ) {
      issues.push({
        field: "custom_recurring_days",
        message: "กรุณาเลือกวันในสัปดาห์สำหรับรูปแบบกำหนดเอง",
      });
    }
  }

  // Time validation - different rules for recurring vs one-off
  if (input.recurring_pattern && input.recurring_pattern !== "none") {
    // Class schedules can use session_times (new format) OR time_slots (old format)
    const hasSessionTimes =
      input.session_times && input.session_times.length > 0;
    const hasTimeSlots = input.time_slots && input.time_slots.length > 0;
    const hasSessionStartTime = input.session_start_time;

    // Must have at least one time specification
    if (!hasSessionTimes && !hasTimeSlots && !hasSessionStartTime) {
      issues.push({
        field: "time_slots",
        message: "กรุณาเลือกวัน/เวลาอย่างน้อย 1 รายการ",
      });
    }

    // Validate time_slots if provided (old format)
    if (hasTimeSlots) {
      // @ts-expect-error - time_slots validation
      input.time_slots.forEach((ts, i) => {
        if (!ts.day_of_week)
          issues.push({
            field: `time_slots[${i}].day_of_week`,
            message: "กรุณาเลือกวัน",
          });
        if (!ts.start_time)
          issues.push({
            field: `time_slots[${i}].start_time`,
            message: "กรุณาเลือกเวลาเริ่ม",
          });
        if (!ts.end_time)
          issues.push({
            field: `time_slots[${i}].end_time`,
            message: "กรุณาเลือกเวลาสิ้นสุด",
          });
      });
    }

    // Validate session_times if provided (new format for class schedules)
    if (hasSessionTimes) {
      // @ts-expect-error - session_times validation
      input.session_times.forEach((st, i) => {
        if (st.weekday == null)
          issues.push({
            field: `session_times[${i}].weekday`,
            message: "กรุณาเลือกวัน",
          });
        if (!st.start_time)
          issues.push({
            field: `session_times[${i}].start_time`,
            message: "กรุณาเลือกเวลาเริ่ม",
          });
      });
    }
  } else {
    // One-off events need session_start_time instead
    if (!input.session_start_time) {
      issues.push({
        field: "session_start_time",
        message: "กรุณาระบุเวลาเริ่มเซสชัน",
      });
    }
  }

  // Optional constraints
  if (input.max_students !== undefined && toInt(input.max_students) < 1) {
    issues.push({
      field: "max_students",
      message: "จำนวนนักเรียนต้องมากกว่า 0",
    });
  }

  return issues;
}

// Derive estimated_end_date and session count (approx) per spec
export function deriveScheduleFields(input: Partial<CreateScheduleRequest>) {
  const totalHours = toInt(input.total_hours);
  // รองรับทศนิยม (0.5, 1.5, etc.)
  const hoursPer = Number.parseFloat(String(input.hours_per_session || 0));
  const perWeek = toInt(input.session_per_week);

  let estimated_end_date: string | undefined;
  let total_sessions: number | undefined;

  // Always compute total sessions if possible
  if (totalHours > 0 && hoursPer > 0) {
    total_sessions = Math.ceil(totalHours / hoursPer);
  }

  // Compute estimated end date only when we know sessions per week and have a start date
  if (isIsoDate(input.start_date) && total_sessions && perWeek > 0) {
    const weeks = Math.ceil(total_sessions / perWeek);
    const start = new Date(input.start_date as string);
    const end = new Date(start);
    end.setDate(start.getDate() + weeks * 7 - 1);
    estimated_end_date = end.toISOString().split("T")[0];
  }

  return { estimated_end_date, total_sessions };
}

// Validate session creation per rules
export function validateSessionForm(
  input: Partial<CreateSessionRequest>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!input.session_date || !isIsoDate(input.session_date))
    issues.push({
      field: "session_date",
      message: "กรุณาเลือกวันที่ (YYYY-MM-DD) หรือ ISO (RFC3339)",
    });
  if (!input.start_time)
    issues.push({ field: "start_time", message: "กรุณาเลือกเวลาเริ่ม" });
  if (!input.end_time)
    issues.push({ field: "end_time", message: "กรุณาเลือกเวลาสิ้นสุด" });

  return issues;
}
