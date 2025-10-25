/**
 * Attendance System Types
 * Types for teacher/student check-in/check-out and attendance management
 */

export type AttendanceStatus =
  | "on-time"
  | "late"
  | "present"
  | "absent"
  | "field-work";

export type CheckInMethod = "code" | "qr";

// ==================== Location Types ====================

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

// ==================== Teacher Attendance ====================

export interface TeacherCheckInRequest {
  session_id?: number;
  location?: LocationData;
  notes?: string;
  is_field_staff?: boolean;
}

export interface TeacherCheckOutRequest {
  attendance_id: number;
  location?: LocationData;
  notes?: string;
}

export interface TeacherAttendance {
  id: number;
  teacher_id: number;
  session_id: number | null;
  check_in_time: string;
  check_out_time: string | null;
  status: AttendanceStatus;
  late_minutes: number | null;
  location_verified: boolean;
  distance_meters: number | null;
  check_in_location?: LocationData;
  check_out_location?: LocationData;
  notes?: string;
  is_field_staff: boolean;
  session?: {
    id: number;
    schedule_name: string;
    session_number: number;
    start_time: string;
    end_time: string;
    session_date: string;
  };
}

export interface TeacherCheckInResponse {
  success: boolean;
  message: string;
  attendance: TeacherAttendance;
  session_code?: string;
  status_info: {
    status: AttendanceStatus;
    late_minutes: number | null;
  };
}

export interface TeacherCheckOutResponse {
  success: boolean;
  message: string;
  attendance: TeacherAttendance;
}

export interface TeacherTodayStatusResponse {
  success: boolean;
  date: string;
  count: number;
  attendances: TeacherAttendance[];
}

export interface TeacherAttendanceHistoryParams {
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface TeacherAttendanceHistoryResponse {
  success: boolean;
  total: number;
  limit: number;
  offset: number;
  attendances: TeacherAttendance[];
}

// ==================== Student Attendance ====================

export interface StudentCheckInRequest {
  session_code: string;
  check_in_method: CheckInMethod;
  location: LocationData; // GPS location is required for students
}

export interface StudentAttendance {
  id: number;
  student_id: number;
  session_id: number;
  attendance_date: string;
  check_in_time: string;
  status: AttendanceStatus;
  late_minutes: number | null;
  check_in_method: CheckInMethod;
  location_verified?: boolean; // Whether location was within 500m radius
  distance_meters?: number | null; // Distance from branch in meters
  check_in_location?: LocationData;
  session?: {
    id: number;
    schedule_name: string;
    session_number: number;
    start_time: string;
    end_time: string;
    session_date: string;
  };
}

export interface StudentCheckInResponse {
  success: boolean;
  message: string;
  attendance: StudentAttendance;
  status_info: {
    status: AttendanceStatus;
    late_minutes: number | null;
    location_verified?: boolean;
    distance_meters?: number;
  };
}

export interface StudentAttendanceHistoryParams {
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface StudentAttendanceHistoryResponse {
  success: boolean;
  total: number;
  limit: number;
  offset: number;
  attendances: StudentAttendance[];
}

// ==================== Attendance Session ====================

export interface AttendanceSession {
  id: number;
  session_id: number;
  session_code: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface GenerateSessionCodeRequest {
  session_id: number;
}

export interface GenerateSessionCodeResponse {
  success: boolean;
  message: string;
  session_code: string;
  expires_at: string;
}

export interface GetSessionCodeResponse {
  success: boolean;
  session_code: string;
  expires_at: string;
  is_active: boolean;
}

// ==================== Student List ====================

export interface SessionStudent {
  student_id: number;
  student_name: string;
  username: string;
  checked_in: boolean;
  check_in_time?: string;
  status: AttendanceStatus;
  late_minutes?: number;
}

export interface SessionStudentListResponse {
  success: boolean;
  session: {
    id: number;
    schedule_name: string;
    session_number: number;
    start_time: string;
    end_time: string;
    session_date: string;
  };
  total_enrolled: number;
  checked_in: number;
  on_time: number;
  late: number;
  absent: number;
  students: SessionStudent[];
}

// ==================== Reports ====================

export interface AttendanceSummary {
  total: number;
  on_time: number;
  late: number;
  absent?: number;
  field_work?: number;
}

export interface DailyReportParams {
  date: string;
  branch_id?: number;
}

export interface DailyReportResponse {
  success: boolean;
  date: string;
  branch?: {
    id: number;
    name: string;
  };
  teacher_summary: AttendanceSummary;
  student_summary: AttendanceSummary;
  teacher_attendances: TeacherAttendance[];
  student_attendances: StudentAttendance[];
}

export interface WeeklyReportParams {
  start_date: string;
  end_date: string;
  branch_id?: number;
}

export interface WeeklyReportResponse {
  success: boolean;
  start_date: string;
  end_date: string;
  branch?: {
    id: number;
    name: string;
  };
  teacher_summary: AttendanceSummary;
  student_summary: AttendanceSummary;
  daily_breakdown: Array<{
    date: string;
    teacher_summary: AttendanceSummary;
    student_summary: AttendanceSummary;
  }>;
}

export interface MonthlyReportParams {
  year: number;
  month: number;
  branch_id?: number;
}

export interface MonthlyReportResponse {
  success: boolean;
  year: number;
  month: number;
  branch?: {
    id: number;
    name: string;
  };
  teacher_summary: AttendanceSummary;
  student_summary: AttendanceSummary;
  weekly_breakdown: Array<{
    week: number;
    start_date: string;
    end_date: string;
    teacher_summary: AttendanceSummary;
    student_summary: AttendanceSummary;
  }>;
}

export interface YearlyReportParams {
  year: number;
  branch_id?: number;
}

export interface YearlyReportResponse {
  success: boolean;
  year: number;
  branch?: {
    id: number;
    name: string;
  };
  teacher_summary: AttendanceSummary;
  student_summary: AttendanceSummary;
  monthly_breakdown: Array<{
    month: number;
    teacher_summary: AttendanceSummary;
    student_summary: AttendanceSummary;
  }>;
}

export interface IndividualReportParams {
  user_id: number;
  start_date: string;
  end_date: string;
}

export interface IndividualReportResponse {
  success: boolean;
  user: {
    id: number;
    name: string;
    username: string;
    role: string;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  summary: AttendanceSummary;
  attendances: (TeacherAttendance | StudentAttendance)[];
}
