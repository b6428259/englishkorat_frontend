import type { CreateScheduleInput as CreateScheduleRequest, CreateSessionRequest } from '@/services/api/schedules';

export type ValidationIssue = { field: string; message: string };

// Basic helpers
const isIsoDate = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const toInt = (n: unknown) => (typeof n === 'number' ? n : parseInt(String(n || '0'), 10));

// Validate schedule per new rules
export function validateScheduleForm(input: Partial<CreateScheduleRequest>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!input.schedule_name?.trim()) issues.push({ field: 'schedule_name', message: 'กรุณาระบุชื่อคอร์ส/ตารางเรียน' });
  if (!input.start_date || !isIsoDate(input.start_date)) issues.push({ field: 'start_date', message: 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)' });
  if (!input.course_id) issues.push({ field: 'course_id', message: 'กรุณาเลือกคอร์ส' });

  // Recurring rules
  if (input.recurring_pattern && input.recurring_pattern !== 'none') {
    if (!input.hours_per_session || toInt(input.hours_per_session) <= 0) issues.push({ field: 'hours_per_session', message: 'ชั่วโมงต่อครั้งต้องมากกว่า 0' });
    if (!input.total_hours || toInt(input.total_hours) <= 0) issues.push({ field: 'total_hours', message: 'ชั่วโมงรวมต้องมากกว่า 0' });
    if (!input.session_per_week || toInt(input.session_per_week) <= 0) issues.push({ field: 'session_per_week', message: 'จำนวนครั้งต่อสัปดาห์ต้องมากกว่า 0' });
  }

  // Time slots required at least 1
  if (!input.time_slots || input.time_slots.length === 0) {
    issues.push({ field: 'time_slots', message: 'กรุณาเลือกวัน/เวลาอย่างน้อย 1 รายการ' });
  } else {
    input.time_slots.forEach((ts, i) => {
      if (!ts.day_of_week) issues.push({ field: `time_slots[${i}].day_of_week`, message: 'กรุณาเลือกวัน' });
      if (!ts.start_time) issues.push({ field: `time_slots[${i}].start_time`, message: 'กรุณาเลือกเวลาเริ่ม' });
      if (!ts.end_time) issues.push({ field: `time_slots[${i}].end_time`, message: 'กรุณาเลือกเวลาสิ้นสุด' });
    });
  }

  // Optional constraints
  if (input.max_students !== undefined && toInt(input.max_students) < 1) {
    issues.push({ field: 'max_students', message: 'จำนวนนักเรียนต้องมากกว่า 0' });
  }

  return issues;
}

// Derive estimated_end_date and session count (approx) per spec
export function deriveScheduleFields(input: Partial<CreateScheduleRequest>) {
  const totalHours = toInt(input.total_hours);
  const hoursPer = toInt(input.hours_per_session);
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
    estimated_end_date = end.toISOString().split('T')[0];
  }

  return { estimated_end_date, total_sessions };
}

// Validate session creation per rules
export function validateSessionForm(input: Partial<CreateSessionRequest>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!input.session_date || !isIsoDate(input.session_date)) issues.push({ field: 'session_date', message: 'กรุณาเลือกวันที่ (YYYY-MM-DD)' });
  if (!input.start_time) issues.push({ field: 'start_time', message: 'กรุณาเลือกเวลาเริ่ม' });
  if (!input.end_time) issues.push({ field: 'end_time', message: 'กรุณาเลือกเวลาสิ้นสุด' });

  return issues;
}
