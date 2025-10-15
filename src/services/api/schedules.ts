import {
  CommentListResponse,
  ConfirmScheduleRequest,
  CreateMakeupSessionRequest,
  Session as DetailedSession,
  Schedule,
  ScheduleComment,
  ScheduleParticipant,
  ScheduleResponse,
  TeachersScheduleResponse,
  UpdateSessionStatusRequest,
} from "@/types/group.types";
import type { Method } from "axios";
import { api } from "./base";
import { API_ENDPOINTS } from "./endpoints";

// Updated API endpoints for Group-based scheduling
export const SCHEDULE_ENDPOINTS_EXTENDED = {
  ...API_ENDPOINTS.SCHEDULES,
  MY_SCHEDULES: "/schedules/my",
  CONFIRM: (id: string) => `/schedules/${id}/confirm`,
  SESSION_STATUS: (sessionId: string) =>
    `/schedules/sessions/${sessionId}/status`,
  MAKEUP_SESSION: "/schedules/sessions/makeup",
  COMMENTS: "/schedules/comments",
  TEACHERS_SCHEDULE: "/schedules/teachers",
  PARTICIPATE: (id: string) => `/schedules/${id}/participants/me`,
  CHECK_ROOM_CONFLICT: "/schedules/rooms/check-conflicts",
  PREVIEW: "/schedules/preview",
} as const;
// Session detail response interfaces
export interface TeacherProfile {
  active: boolean;
  branch_id: number;
  certifications: string | null;
  first_name_en: string;
  first_name_th: string;
  hourly_rate: number;
  last_name_en: string;
  last_name_th: string;
  nationality: string;
  nickname_en: string;
  nickname_th: string;
  specializations: string | null;
  teacher_type: string;
}

export interface SessionDetailUser {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  username: string;
  email: string | null;
  phone: string;
  line_id: string;
  role: string;
  branch_id: number;
  status: string;
  avatar: string;
  teacher_profile?: TeacherProfile;
  branch?: {
    id: number;
    created_at?: string;
    updated_at?: string;
    deleted_at: string | null;
    name_en: string;
    name_th: string;
    code: string;
    address: string;
    phone: string;
    type: string;
    active: boolean;
  };
}

export interface SessionDetailRoom {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  branch_id: number;
  room_name: string;
  capacity: number;
  equipment: string[];
  status: string;
  branch: {
    id: number;
    deleted_at: string | null;
    name_en: string;
    name_th: string;
    code: string;
    address: string;
    phone: string;
    type: string;
    active: boolean;
  };
}

export interface SessionDetailSchedule {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  schedule_name: string;
  schedule_type: string;
  group_id: number;
  created_by_user_id: number;
  recurring_pattern: string;
  total_hours: number;
  hours_per_session: number;
  session_per_week: number;
  start_date: string;
  estimated_end_date: string;
  actual_end_date: string | null;
  default_teacher_id: number;
  default_room_id: number;
  status: string;
  auto_reschedule: boolean;
  notes: string;
  admin_assigned: string;
  default_teacher: SessionDetailUser;
  default_room: SessionDetailRoom;
}

export interface SessionDetail {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  schedule_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  session_number: number;
  week_number: number;
  status: string;
  cancelling_reason: string;
  is_makeup: boolean;
  makeup_for_session_id: number | null;
  notes: string;
  assigned_teacher_id: number;
  room_id: number;
  confirmed_at: string | null;
  confirmed_by_user_id: number | null;
  schedule: SessionDetailSchedule;
  assigned_teacher: SessionDetailUser;
  room: SessionDetailRoom;
  confirmed_by: SessionDetailUser | null;
}

export interface SessionComment {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  schedule_id: number | null;
  session_id: number;
  user_id: number;
  // Optional expanded user details if API includes it
  user?: SessionDetailUser;
  comment: string;
  session_number: number;
  week_number: number;
  status: string;
  cancelling_reason: string;
  is_makeup: boolean;
  makeup_for_session_id: number | null;
  notes: string;
  assigned_teacher_id: number;
  room_id: number;
  confirmed_at: string | null;
  confirmed_by_user_id: number | null;
  schedule: SessionDetailSchedule;
  assigned_teacher: SessionDetailUser;
  room: SessionDetailRoom;
  confirmed_by: SessionDetailUser | null;
}

export interface CreateSessionCommentRequest {
  session_id: number;
  comment: string;
}

// New API response structure for session detail
export interface StudentDetailInSession {
  id: number;
  age: number;
  age_group: string;
  cefr_level: string;
  date_of_birth: string | null;
  deposit_amount: number;
  email: string;
  first_name: string;
  first_name_en: string;
  gender: string;
  grammar_score: number | null;
  language_level: string;
  last_name: string;
  last_name_en: string;
  learning_goals: string;
  learning_style: string;
  line_id: string;
  listening_score: number | null;
  nickname_en: string;
  nickname_th: string;
  payment_status: string;
  phone: string;
  preferred_branch_id: number | null;
  preferred_language: string;
  reading_score: number | null;
  recent_cefr: string;
  registration_status: string;
  registration_type: string;
  speaking_score: number | null;
  teacher_type: string;
  user_id: number;
  writing_score: number | null;
  user?: {
    avatar: string;
    branch_id: number;
    email: string | null;
    id: number;
    phone: string;
    role: string;
    status: string;
    username: string;
  };
  user_branch?: {
    code: string;
    id: number;
    name_en: string;
    name_th: string;
  };
}

export interface SessionDetailGroupMember {
  student: StudentDetailInSession;
  payment_status: string;
  status: string;
}

export interface SessionDetailGroup {
  group_id: number;
  group_name: string;
  level: string;
  max_students: number;
  status: string;
  course_id: number;
  course_name: string;
  student_count: number;
  members: SessionDetailGroupMember[];
}

export interface SessionDetailSession {
  id: number;
  schedule_id: number;
  schedule_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  session_number: number;
  week_number: number;
  status: string;
  is_makeup: boolean;
  room_id?: number | null;
  room?: SessionDetailRoom | null;
  branch?: {
    id: number;
    name_th: string;
    name_en: string;
    code: string;
  } | null;
}

export interface SessionDetailSessionExtended extends SessionDetailSession {
  assigned_teacher_id?: number;
  assigned_teacher?: SessionDetailUser;
}

export interface SessionDetailResponse {
  comments: SessionComment[];
  group: SessionDetailGroup | null;
  session: SessionDetailSessionExtended;
  students: SessionDetailGroupMember[];
}

export interface SessionCommentsResponse {
  comments: SessionComment[];
  count: number;
}

export interface TeacherUser {
  avatar: string;
  id: number;
  username: string;
}

export interface TeacherName {
  first_en: string;
  first_th: string;
  last_en: string;
  last_th: string;
  nickname_en: string;
  nickname_th: string;
}

export interface TeacherBranch {
  code?: string;
  id?: number;
  name_en?: string;
  name_th?: string;
}

export interface TeacherSession {
  id: number;
  schedule_id: number;
  schedule_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  session_number: number;
  week_number: number;
  status: string;
  is_makeup: boolean;
  notes: string;
  branch_id?: number;
  room: {
    id: number | null;
    name: string;
    branch_id?: number;
  };
  students?: unknown[];
  course_name?: string;
  course_code?: string;
  branch_name?: string;
  group?: {
    id: number;
    name: string;
    members: Array<{
      id: number;
      name: {
        first_name: string;
        last_name: string;
        nickname_en: string;
        nickname_th: string;
      };
      payment_status: string;
      user: {
        avatar: string;
        id: number;
        username: string;
      };
    }>;
  };
}

export interface Teacher {
  branch: TeacherBranch;
  id: number;
  name: TeacherName;
  sessions: TeacherSession[];
  user: TeacherUser;
  user_id: number;
}

export interface ScheduleTeachersResponse {
  success: boolean;
  data: Teacher[];
  filters: {
    branch_id: string;
    date_filter: "day" | "week" | "month";
    end_date: string;
    start_date: string;
    timezone: string;
  };
  total: number;
}

// Legacy session interface for backward compatibility
export interface Session {
  session_id: number;
  schedule_id: number;
  schedule_name: string;
  course_name: string;
  course_code: string;
  session_date: string;
  start_time: string;
  end_time: string;
  session_number: number;
  week_number: number;
  status: string;
  room_name: string;
  max_students: number;
  current_students: number;
  branch_id: number;
  branch_name_en: string;
  branch_name_th: string;
  notes: string | null;
}

export interface Student {
  id: number;
  user_id: number;
  first_name: string;
  first_name_en: string | null;
  last_name: string;
  last_name_en: string | null;
  nickname: string;
  age: number;
  email: string;
  phone: string;
  line_id: string;
}

export interface ScheduleDetailResponse {
  success: boolean;
  data: {
    schedule: {
      id: number;
      schedule_name: string;
      course_name: string;
      course_code: string;
      total_hours: string;
      hours_per_session: string;
      max_students: number;
      current_students: number;
      available_spots: number;
      start_date: string;
      status: string;
      schedule_type: string;
      auto_reschedule_holidays: number;
    };
    students: Student[];
    sessions: Array<{
      id: number;
      schedule_id: number;
      session_date: string;
      session_number: number;
      week_number: number;
      start_time: string;
      end_time: string;
      teacher_id: number;
      room_name: string;
      status: string;
      teacher_first_name: string;
      teacher_last_name: string;
      notes: string | null;
    }>;
    summary: {
      total_sessions: number;
      scheduled: number;
      completed: number;
      cancelled: number;
      makeup_sessions: number;
      total_exceptions: number;
      total_enrolled_students: number;
    };
  };
}

// Schedule list response interface
// Internal API shape used by legacy list endpoints
export interface ScheduleListApiResponse {
  success: boolean;
  data: {
    schedules: Array<{
      id: number;
      schedule_name: string;
      course_name: string;
      course_code: string;
      teacher_first_name: string;
      teacher_last_name: string;
      teacher_nickname: string;
      room_name: string;
      start_date: string;
      status: string;
      max_students: number;
      current_students: number;
      available_spots: number;
      branch_name_th: string;
      branch_name_en: string;
    }>;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

// Create schedule request interface
export interface CreateScheduleInput {
  course_id?: number; // Optional for non-class types
  teacher_id?: number;
  room_id?: number;
  // New canonical fields
  default_teacher_id?: number;
  default_room_id?: number;
  branch_id?: number; // Branch ID
  schedule_name: string;
  total_hours?: number; // Required for class schedules
  hours_per_session?: number; // Required for class schedules
  // New spec fields
  schedule_type?:
    | "class"
    | "meeting"
    | "event"
    | "holiday"
    | "appointment"
    | "personal";
  // For class schedules, associate to a group (REQUIRED for class)
  group_id?: number;
  recurring_pattern?:
    | "none"
    | "daily"
    | "weekly"
    | "bi-weekly"
    | "monthly"
    | "yearly"
    | "custom";
  session_per_week?: number;
  assigned_to_user_id?: number; // teacher id alias
  max_students?: number;
  start_date: string;
  estimated_end_date?: string;
  session_start_time?: string; // HH:MM - for single-slot weekly (legacy)
  // For multi-slot weekly classes (Case 2)
  session_times?: Array<{
    weekday: number; // 0 (Sunday) through 6 (Saturday)
    start_time: string; // HH:MM
  }>;
  // For event/appointment schedules, specify participants
  participant_user_ids?: number[];
  custom_recurring_days?: number[]; // 1-7 for Mon-Sun
  time_slots?: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
  }>;
  auto_reschedule_holidays?: boolean;
  auto_reschedule?: boolean; // spec naming
  notes?: string;
}

// Raw course response from API
interface CourseDTO {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  code: string;
  course_type: string;
  branch_id: number;
  description: string | null;
  status: string;
  category_id: number;
  level: string;
  branch?: { id: number; name_en?: string; name_th?: string } | null;
  duration_id?: number | null;
  branch_name_en?: string;
  branch_name_th?: string;
  branch_code?: string;
}

// Raw teacher response from API
interface RawTeacherResponse {
  // Legacy flat fields (may be present)
  id: number;
  first_name_en?: string;
  last_name_en?: string | null;
  nickname_en?: string | null;
  first_name_th?: string;
  last_name_th?: string | null;
  nickname_th?: string | null;
  email?: string | null;
  phone?: string | null;

  // New nested shape
  name?: {
    first_en?: string;
    last_en?: string | null;
    nickname_en?: string | null;
    first_th?: string;
    last_th?: string | null;
    nickname_th?: string | null;
  };
  user?: {
    id?: number;
    username?: string;
    avatar?: string | null;
    email?: string | null;
    phone?: string | null;
  };

  // Additional optional fields
  avatar?: string | null;
  branch?: { code?: string; id?: number; name_en?: string; name_th?: string };
  teacher_type?: string;
  active?: boolean;
  user_id?: number;
}

// (legacy RawCourseResponse removed in favor of CourseDTO)

// Course interface for dropdowns
export interface Course {
  id: number;
  name: string;
  code: string;
  course_name: string; // Mapped from name for frontend compatibility
  course_code: string; // Mapped from code for frontend compatibility
  course_type: string;
  branch_id: number;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  category_id: number;
  duration_id: number | null;
  level: string;
  branch_name_en: string;
  branch_name_th: string;
  branch_code: string;
}

// Room interface for dropdowns
export interface Room {
  equipment: unknown;
  id: number;
  room_name: string;
  capacity: number;
  branch_id: number;
}

// Room conflict check types
export interface RoomConflictDetail {
  room_id: number;
  existing_room_id: number;
  session_id: number;
  schedule_id: number;
  schedule_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
}

export interface RoomConflictInfo {
  room_id: number;
  conflicts: RoomConflictDetail[];
}

export interface CheckRoomConflictRequest {
  room_ids: number[];
  branch_id: number;
  recurring_pattern: string;
  total_hours: number;
  hours_per_session: number;
  session_per_week: number;
  start_date: string;
  estimated_end_date?: string;
  session_times?: Array<{ weekday: number; start_time: string }>;
  session_start_time?: string;
  exclude_schedule_id?: number;
}

export interface CheckRoomConflictResponse {
  has_conflict: boolean;
  checked_room_ids: number[];
  conflicts: RoomConflictDetail[];
  rooms: RoomConflictInfo[];
}

// Schedule Preview (Dry Run) Types
export interface PreviewIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  details?: unknown;
}

export interface PreviewSession {
  session_number: number;
  week_number: number;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface HolidayImpact {
  session_number: number;
  date: string;
  holiday_name?: string;
  shifted_to: string;
  was_rescheduled: boolean;
}

export interface PreviewConflictDetail {
  schedule_id: number;
  schedule_name: string;
  session_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
}

export interface PreviewTeacherConflict {
  teacher_id: number;
  teacher_name: string;
  conflicts: PreviewConflictDetail[];
}

export interface PreviewRoomConflict {
  room_id: number;
  conflicts: Array<{
    room_id: number;
    existing_room_id: number;
    session_id: number;
    schedule_id: number;
    schedule_name: string;
    session_date: string;
    start_time: string;
    end_time: string;
  }>;
}

export interface GroupPaymentStatus {
  group_id: number;
  group_name: string;
  group_payment_status: string;
  eligible_members: number;
  ineligible_members: number;
  member_totals: {
    pending: number;
    deposit_paid: number;
    fully_paid: number;
  };
  require_deposit: boolean;
}

export interface SchedulePreviewResponse {
  can_create: boolean;
  issues: PreviewIssue[];
  summary: {
    schedule_name: string;
    schedule_type: string;
    start_date: string;
    estimated_end_date: string;
    total_hours: number;
    hours_per_session: number;
    session_per_week: number;
    total_sessions: number;
  };
  sessions: PreviewSession[];
  original_sessions?: PreviewSession[];
  holiday_impacts: HolidayImpact[];
  conflicts: {
    group: unknown | null;
    rooms: PreviewRoomConflict[];
    teachers: PreviewTeacherConflict[];
    participants: PreviewConflictDetail[];
    students: PreviewConflictDetail[];
  };
  group_payment?: GroupPaymentStatus;
  auto_reschedule: boolean;
  branch_hours: {
    open_minutes: number;
    close_minutes: number;
    open_time: string;
    close_time: string;
  };
  checked_room_ids: number[];
}

// Teacher interface for dropdowns
export interface TeacherOption {
  id: number;
  teacher_name: string;
  teacher_nickname: string;
  teacher_email?: string;
  teacher_phone?: string;
  avatar?: string | null;
  branch?: TeacherBranch | null;
  // language-specific name parts for better UI formatting
  first_en?: string;
  last_en?: string | null;
  nickname_en?: string | null;
  first_th?: string;
  last_th?: string | null;
  nickname_th?: string | null;
  username?: string;
}

// Session creation request
export interface CreateSessionRequest {
  session_date: string;
  start_time: string;
  end_time: string;
  repeat?: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    end: {
      type: "never" | "after" | "on";
      count?: number;
      date?: string;
    };
    days_of_week?: string[];
  };
  is_makeup_session?: boolean;
  notes?: string;
  appointment_notes?: string;

  // Extended properties for comprehensive session creation
  mode?: "single" | "multiple" | "bulk";
  schedule_id?: number;
  session_count?: number;
  repeat_frequency?: "daily" | "weekly" | "monthly";
}

// Calendar view response interface
export interface CalendarSession {
  id: number;
  schedule_id: number;
  schedule_name: string;
  course_name: string;
  course_code?: string | null;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  room_name: string;
  teacher_name: string;
  branch_name: string;
  teacher_phone?: string | null;
  teacher_email?: string | null;
  teacher?: {
    avatar: string | null;
    branch_id: number | null;
    id: number | null;
    username: string | null;
  };
  students?: Array<{ id: number; name: string; level: string | null }>;
  participants?: Array<{
    role: "participant" | "organizer" | "observer";
    status: "invited" | "confirmed" | "declined" | "tentative";
    user: {
      avatar: string;
      id: number;
      username: string;
    };
    user_id: number;
  }>;
}

// New API structure for calendar endpoints
export interface CalendarDay {
  date: string;
  day_name: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  event_count: number;
  events: CalendarSession[];
  holiday_title: string;
  is_holiday: boolean;
}

export interface CalendarViewApiResponse {
  success: boolean;
  data: {
    calendar_days: CalendarDay[];
    date_range: {
      start: string;
      end: string;
      total_days: number;
    };
    events: CalendarSession[]; // All events in the period
    holidays: Array<{
      date: string;
      title: string;
      type: string;
    }>;
    total_events: number;
    user_context: {
      branch_id: string | number;
      role: string;
      user_id: number;
    };
    view_type: "day" | "week" | "month";
  };
}

// Legacy calendar structure (for backward compatibility)
export interface LegacyCalendarViewApiResponse {
  success: boolean;
  data: {
    view: "day" | "week" | "month";
    period: {
      start_date: string;
      end_date: string;
      total_days: number;
    };
    calendar: Record<
      string,
      {
        date: string;
        day_of_week: string;
        is_holiday: boolean;
        holiday_info: Record<string, unknown> | null;
        sessions: CalendarSession[];
        exceptions: Record<string, unknown>[];
        session_count: number;
        branch_distribution: Record<string, number>;
      }
    >;
    holidays: Array<{ date: string; name?: string }>;
    summary: {
      total_sessions: number;
      total_holidays: number;
      total_exceptions: number;
      sessions_by_status: Record<string, number>;
      sessions_by_branch: Record<string, number>;
      sessions_by_teacher: Record<string, number>;
      days_with_sessions: number;
      days_with_holidays: number;
    };
  };
}

export type GetCoursesParams = {
  branch_id?: number | string;
  status?: string; // API default: 'active'
  course_type?: string;
  level?: string;
  page?: number; // 1-based
  per_page?: number; // default 20, cap 100
};

export const scheduleService = {
  // Get list of courses with optional filters + pagination
  getCourses: async (
    params?: GetCoursesParams
  ): Promise<{
    success: boolean;
    data: Course[];
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  }> => {
    const query = new URLSearchParams();
    if (params) {
      const {
        branch_id,
        status = "active",
        course_type,
        level,
        page,
        per_page,
      } = params;
      if (branch_id !== undefined && branch_id !== null)
        query.append("branch_id", String(branch_id));
      if (status) query.append("status", status);
      if (course_type) query.append("course_type", course_type);
      if (level) query.append("level", level);
      if (typeof page === "number") query.append("page", String(page));
      if (typeof per_page === "number")
        query.append("per_page", String(per_page));
    } else {
      // Default status=active per API if no params provided
      query.append("status", "active");
      query.append("status", "full");
    }

    const url = query.toString()
      ? `${API_ENDPOINTS.COURSES.LIST}?${query}`
      : API_ENDPOINTS.COURSES.LIST;
    const response = await api.get(url);

    const rawCourses = (response?.data?.data?.courses ??
      response?.data?.courses ??
      []) as CourseDTO[];
    const mapped: Course[] = rawCourses.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      course_name: c.name,
      course_code: c.code,
      course_type: c.course_type,
      branch_id: c.branch_id,
      description: c.description ?? null,
      status: c.status,
      created_at: c.created_at,
      updated_at: c.updated_at,
      category_id: c.category_id,
      duration_id: c.duration_id ?? null,
      level: c.level,
      branch_name_en: c.branch_name_en ?? c.branch?.name_en ?? "",
      branch_name_th: c.branch_name_th ?? c.branch?.name_th ?? "",
      branch_code: c.branch_code ?? "",
    }));

    const pageMeta = {
      page: response?.data?.data?.page ?? response?.data?.page ?? 1,
      per_page:
        response?.data?.data?.per_page ??
        response?.data?.per_page ??
        mapped.length,
      total:
        response?.data?.data?.total ?? response?.data?.total ?? mapped.length,
      total_pages:
        response?.data?.data?.total_pages ?? response?.data?.total_pages ?? 1,
    };

    return {
      success: !!(response?.data?.success ?? true),
      data: mapped,
      ...pageMeta,
    };
  },

  // Get list of rooms for dropdown
  getRooms: async (): Promise<{ success: boolean; data: Room[] }> => {
    const response = await api.get("/rooms");
    // Defensive: guard against missing shapes
    const rooms = response?.data?.data?.rooms ?? response?.data?.rooms ?? [];
    return {
      success: !!(response?.data?.success ?? true),
      data: Array.isArray(rooms) ? rooms : [],
    };
  },

  // Get list of teachers for dropdown
  getTeachers: async (): Promise<{
    success: boolean;
    data: TeacherOption[];
  }> => {
    const response = await api.get("/teachers");
    const raw: RawTeacherResponse[] =
      response?.data?.data?.teachers ?? response?.data?.teachers ?? [];
    const mapped: TeacherOption[] = Array.isArray(raw)
      ? raw.map((t: RawTeacherResponse) => {
          // Support both legacy flat fields and new nested { name, user } shape
          // IMPORTANT: Use user_id (not teacher.id) as this is what the API expects
          const id = t.user_id ?? t.user?.id ?? t.id;
          const first = t.name?.first_en ?? t.first_name_en ?? "";
          const last = t.name?.last_en ?? t.last_name_en ?? "";
          const nickname = t.name?.nickname_en ?? t.nickname_en ?? "";
          const username = t.user?.username ?? "";
          const teacher_name =
            `${first}${last ? " " + last : ""}`.trim() ||
            nickname ||
            username ||
            `Teacher ${id}`;
          const teacher_nickname = nickname || first || username || "";
          const teacher_email = t.user?.email ?? t.email ?? undefined;
          const teacher_phone = t.user?.phone ?? t.phone ?? undefined;
          const avatar = t.user?.avatar ?? t.avatar ?? undefined;
          const branch = t.branch ?? undefined;

          return {
            id,
            teacher_name,
            teacher_nickname,
            teacher_email,
            teacher_phone,
            avatar,
            branch,
            first_en: first || undefined,
            last_en: last || undefined,
            nickname_en: nickname || undefined,
            first_th: t.name?.first_th ?? undefined,
            last_th: t.name?.last_th ?? undefined,
            nickname_th: t.name?.nickname_th ?? undefined,
            username: username || undefined,
          } as TeacherOption;
        })
      : [];
    return {
      success: !!(response?.data?.success ?? true),
      data: mapped,
    };
  },

  // Get list of schedules with filters
  getScheduleList: async (params?: {
    page?: number;
    limit?: number;
    course_id?: number;
    teacher_id?: number;
    room_id?: number;
    status?: string;
    branch_id?: number;
  }): Promise<ScheduleListApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(
      `${API_ENDPOINTS.SCHEDULES.LIST}?${queryParams}`
    );
    return {
      success: response.data.success,
      data: response.data.data,
    };
  },

  // Get teachers with their schedules for a specific date filter
  getTeachersSchedule: async (
    dateFilter: "day" | "week" | "month" = "day",
    params?: {
      date?: string;
      teacher_id?: number;
      branch_id?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<ScheduleTeachersResponse> => {
    const queryParams = new URLSearchParams({ date_filter: dateFilter });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(
      `${API_ENDPOINTS.SCHEDULES.TEACHERS(dateFilter)}&${queryParams}`
    );

    // Handle the new response structure
    const teachers = Array.isArray(response?.data?.data)
      ? response.data.data
      : [];
    const filters = response?.data?.filters ?? {
      branch_id: "",
      date_filter: dateFilter,
      end_date: "",
      start_date: "",
      timezone: "Asia/Bangkok",
    };
    const total = response?.data?.total ?? teachers.length;

    return {
      success: !!(response?.data?.success ?? true),
      data: teachers,
      filters,
      total,
    };
  },

  // Get calendar view of schedules
  getCalendarView: async (
    view: "day" | "week" | "month",
    date: string,
    params?: {
      branch_id?: number;
      teacher_id?: number;
      room_id?: number;
      course_id?: number;
      status?: string;
      include_students?: boolean;
      include_holidays?: boolean;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<CalendarViewApiResponse> => {
    const queryParams = new URLSearchParams({ view });
    // Only add date if no start_date/end_date provided
    if (!params?.start_date && !params?.end_date) {
      queryParams.append("date", date);
    }
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(
      `${API_ENDPOINTS.SCHEDULES.CALENDAR}?${queryParams}`
    );
    const rawData = response?.data?.data ?? {};

    // Ensure calendar_days is an array
    const calendar_days = Array.isArray(rawData.calendar_days)
      ? rawData.calendar_days
      : [];

    // Transform to new structure with defensive defaults
    const data = {
      calendar_days,
      date_range: rawData.date_range ?? {
        start: "",
        end: "",
        total_days: 0,
      },
      events: Array.isArray(rawData.events) ? rawData.events : [],
      holidays: Array.isArray(rawData.holidays) ? rawData.holidays : [],
      total_events: rawData.total_events ?? 0,
      user_context: rawData.user_context ?? {
        branch_id: "",
        role: "",
        user_id: 0,
      },
      view_type: (rawData.view_type ?? view) as "day" | "week" | "month",
    };

    return {
      success: !!(response?.data?.success ?? true),
      data,
    };
  },

  // Get detailed information about a specific schedule
  getScheduleDetails: async (
    scheduleId: string
  ): Promise<ScheduleDetailResponse> => {
    // Use the sessions endpoint which returns schedule + students + sessions + summary
    const response = await api.get(
      API_ENDPOINTS.SCHEDULES.SESSIONS(scheduleId)
    );
    return {
      success: response.data.success,
      data: response.data.data,
    };
  },

  // Get schedule sessions with filters
  getScheduleSessions: async (
    scheduleId: string,
    params?: {
      status?: string;
      start_date?: string;
      end_date?: string;
      include_cancelled?: boolean;
      page?: number;
      limit?: number;
      sort_by?: string;
      sort_order?: "asc" | "desc";
    }
  ): Promise<ScheduleDetailResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(
      `${API_ENDPOINTS.SCHEDULES.SESSIONS(scheduleId)}?${queryParams}`
    );
    return {
      success: response.data.success,
      data: response.data.data,
    };
  },

  // Check room conflicts
  checkRoomConflict: async (
    request: CheckRoomConflictRequest
  ): Promise<CheckRoomConflictResponse> => {
    return checkRoomConflict(request);
  },

  // Preview schedule (dry run) before creation
  previewSchedule: async (
    scheduleData: CreateScheduleInput
  ): Promise<SchedulePreviewResponse> => {
    // Use the same payload transformation logic as createSchedule
    const toTimeOnly = (timeStr?: string) => {
      if (!timeStr) return timeStr;
      const hmMatch = timeStr.match(/^(\d{2}:\d{2})/);
      if (hmMatch) return hmMatch[1];
      const isoMatch = timeStr.match(/T(\d{2}):(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}:${isoMatch[2]}`;
      return timeStr;
    };

    const toISODate = (d?: string) => {
      if (!d) return d;
      if (d.includes("T")) return d;
      try {
        return new Date(`${d}T00:00:00Z`).toISOString();
      } catch {
        return d;
      }
    };

    const payload: Partial<CreateScheduleInput> = {
      schedule_name: scheduleData.schedule_name,
      schedule_type: scheduleData.schedule_type || "class",
      start_date: toISODate(scheduleData.start_date),
      estimated_end_date:
        toISODate(scheduleData.estimated_end_date) ||
        toISODate(scheduleData.start_date),
      recurring_pattern: scheduleData.recurring_pattern || "none",
    };

    if (scheduleData.total_hours != null)
      payload.total_hours = scheduleData.total_hours;
    if (scheduleData.hours_per_session != null)
      payload.hours_per_session = scheduleData.hours_per_session;

    if (scheduleData.schedule_type === "class") {
      if (scheduleData.course_id) payload.course_id = scheduleData.course_id;
      if (scheduleData.group_id) payload.group_id = scheduleData.group_id;
      if (scheduleData.max_students != null)
        payload.max_students = scheduleData.max_students;
    }

    if (
      scheduleData.default_teacher_id != null ||
      scheduleData.teacher_id != null
    ) {
      payload.default_teacher_id =
        scheduleData.default_teacher_id ?? scheduleData.teacher_id;
    }
    if (scheduleData.default_room_id != null || scheduleData.room_id != null) {
      payload.default_room_id =
        scheduleData.default_room_id ?? scheduleData.room_id;
    }

    if (scheduleData.schedule_type === "class") {
      if (scheduleData.session_times && scheduleData.session_times.length > 0) {
        payload.session_times = scheduleData.session_times.map((slot) => ({
          weekday: slot.weekday,
          start_time: toTimeOnly(slot.start_time) || slot.start_time,
        }));
        payload.recurring_pattern = "custom";
        payload.session_per_week = scheduleData.session_times.length;
      } else if (scheduleData.session_start_time) {
        payload.session_start_time = toTimeOnly(
          scheduleData.session_start_time
        );
        if (scheduleData.session_per_week != null) {
          payload.session_per_week = scheduleData.session_per_week;
        }
      }
    } else if (scheduleData.session_start_time) {
      payload.session_start_time = toTimeOnly(scheduleData.session_start_time);
    }

    if (payload.session_per_week == null) {
      if (scheduleData.session_per_week != null) {
        payload.session_per_week = scheduleData.session_per_week;
      } else if (payload.recurring_pattern === "none") {
        payload.session_per_week = 1;
      }
    }

    if (
      scheduleData.schedule_type !== "class" &&
      payload.recurring_pattern === "custom" &&
      scheduleData.custom_recurring_days &&
      scheduleData.custom_recurring_days.length > 0
    ) {
      payload.custom_recurring_days = Array.from(
        new Set(scheduleData.custom_recurring_days)
      );
    }

    if (
      scheduleData.participant_user_ids &&
      scheduleData.participant_user_ids.length > 0
    ) {
      payload.participant_user_ids = scheduleData.participant_user_ids;
    }

    payload.auto_reschedule_holidays =
      scheduleData.auto_reschedule_holidays ??
      scheduleData.auto_reschedule ??
      true;

    if (scheduleData.notes && scheduleData.notes.trim() !== "") {
      payload.notes = scheduleData.notes;
    }

    const response = await api.post(
      SCHEDULE_ENDPOINTS_EXTENDED.PREVIEW,
      payload
    );
    return response.data;
  },

  // Create a new schedule (unified per new spec)
  createSchedule: async (
    scheduleData: CreateScheduleInput
  ): Promise<ScheduleResponse> => {
    // Removed dayToNum helper: not deriving recurring days from time_slots here

    // Helper: ensure HH:MM for time strings
    const toTimeOnly = (timeStr?: string) => {
      if (!timeStr) return timeStr;
      const hmMatch = timeStr.match(/^(\d{2}:\d{2})/);
      if (hmMatch) return hmMatch[1];
      const isoMatch = timeStr.match(/T(\d{2}):(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}:${isoMatch[2]}`;
      return timeStr;
    };

    // Helper: ensure ISO 8601 with Z when date-only provided
    const toISODate = (d?: string) => {
      if (!d) return d;
      if (d.includes("T")) return d;
      try {
        return new Date(`${d}T00:00:00Z`).toISOString();
      } catch {
        return d;
      }
    };

    // Build payload conservatively: include only fields that were explicitly provided
    const payload: Partial<CreateScheduleInput> = {
      // Required / common
      schedule_name: scheduleData.schedule_name,
      schedule_type: scheduleData.schedule_type || "class",
      start_date: toISODate(scheduleData.start_date),
      estimated_end_date:
        toISODate(scheduleData.estimated_end_date) ||
        toISODate(scheduleData.start_date), // Default to start_date for one-off events
    };

    // Always include recurring pattern (required field)
    payload.recurring_pattern = scheduleData.recurring_pattern || "none";

    // Hours and session metrics - now supported for all schedule types with recurring patterns
    if (scheduleData.total_hours != null)
      payload.total_hours = scheduleData.total_hours;
    if (scheduleData.hours_per_session != null)
      payload.hours_per_session = scheduleData.hours_per_session;

    // Class-only associations and student limits
    if (scheduleData.schedule_type === "class") {
      if (scheduleData.course_id) payload.course_id = scheduleData.course_id;
      if (scheduleData.group_id) payload.group_id = scheduleData.group_id;
      if (scheduleData.max_students != null)
        payload.max_students = scheduleData.max_students;
    }

    // Teacher/Room (only if chosen)
    if (
      scheduleData.default_teacher_id != null ||
      scheduleData.teacher_id != null
    ) {
      console.log(
        "Schedule API transformation - scheduleData.default_teacher_id:",
        scheduleData.default_teacher_id
      );
      console.log(
        "Schedule API transformation - scheduleData.teacher_id:",
        scheduleData.teacher_id
      );
      payload.default_teacher_id =
        scheduleData.default_teacher_id ?? scheduleData.teacher_id;
      console.log(
        "Schedule API transformation - final payload.default_teacher_id:",
        payload.default_teacher_id
      );
    }
    if (scheduleData.default_room_id != null || scheduleData.room_id != null) {
      payload.default_room_id =
        scheduleData.default_room_id ?? scheduleData.room_id;
    }

    // For class schedules: support both legacy single-slot and new multi-slot patterns
    if (scheduleData.schedule_type === "class") {
      // Case 2: Multi-slot weekly class (session_times)
      if (scheduleData.session_times && scheduleData.session_times.length > 0) {
        payload.session_times = scheduleData.session_times.map((slot) => ({
          weekday: slot.weekday,
          start_time: toTimeOnly(slot.start_time) || slot.start_time,
        }));
        // When session_times is provided, recurring_pattern is forced to "custom"
        payload.recurring_pattern = "custom";
        // session_per_week must equal number of session_times entries
        payload.session_per_week = scheduleData.session_times.length;
      }
      // Case 1: Legacy single-slot weekly class
      else if (scheduleData.session_start_time) {
        payload.session_start_time = toTimeOnly(
          scheduleData.session_start_time
        );
        // Keep user-selected recurring_pattern for single-slot (weekly, bi-weekly, monthly)
        if (scheduleData.session_per_week != null) {
          payload.session_per_week = scheduleData.session_per_week;
        }
      }
    }
    // For non-class schedules: use session_start_time
    else if (scheduleData.session_start_time) {
      payload.session_start_time = toTimeOnly(scheduleData.session_start_time);
    }

    // Recurring: include session_per_week for all events (if not already set by session_times)
    if (payload.session_per_week == null) {
      if (scheduleData.session_per_week != null) {
        payload.session_per_week = scheduleData.session_per_week;
      } else if (payload.recurring_pattern === "none") {
        // Default to 1 for one-off events
        payload.session_per_week = 1;
      }
    }

    // Custom recurring days (0=Sunday, 1=Monday, ..., 6=Saturday) - for non-class events
    if (
      scheduleData.schedule_type !== "class" &&
      payload.recurring_pattern === "custom" &&
      scheduleData.custom_recurring_days &&
      scheduleData.custom_recurring_days.length > 0
    ) {
      payload.custom_recurring_days = Array.from(
        new Set(scheduleData.custom_recurring_days)
      );
    }

    // Participants (non-class may use this)
    if (
      scheduleData.participant_user_ids &&
      scheduleData.participant_user_ids.length > 0
    ) {
      payload.participant_user_ids = scheduleData.participant_user_ids;
    }

    // Default auto skip holidays (prior requirement). If explicitly provided, honor it
    payload.auto_reschedule_holidays =
      scheduleData.auto_reschedule_holidays ??
      scheduleData.auto_reschedule ??
      true;

    // Notes (trim empty)
    if (scheduleData.notes && scheduleData.notes.trim() !== "") {
      payload.notes = scheduleData.notes;
    }

    const response = await api.post(API_ENDPOINTS.SCHEDULES.CREATE, payload);

    if (response.data?.success || response.data?.message) {
      return {
        message: response.data.message || "Schedule created successfully",
        schedule: response.data.data?.schedule || response.data.schedule,
      } as ScheduleResponse;
    }
    return response.data as ScheduleResponse;
  },

  // Update an existing schedule
  updateSchedule: async (
    scheduleId: string,
    updates: Partial<CreateScheduleInput>
  ) => {
    const response = await api.put(
      API_ENDPOINTS.SCHEDULES.UPDATE(scheduleId),
      updates
    );
    return response.data;
  },

  // Delete a schedule
  deleteSchedule: async (scheduleId: string) => {
    const response = await api.delete(
      API_ENDPOINTS.SCHEDULES.DELETE(scheduleId)
    );
    return response.data;
  },

  // Assign student to schedule
  assignStudent: async (
    scheduleId: string,
    studentData: {
      student_id: number;
      total_amount?: number;
      notes?: string;
    }
  ) => {
    const response = await api.post(
      `${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/students`,
      studentData
    );
    return response.data;
  },

  // Remove student from schedule
  removeStudent: async (
    scheduleId: string,
    studentId: string,
    reason?: string
  ) => {
    const response = await api.delete(
      `${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/students/${studentId}`,
      {
        data: { reason },
      }
    );
    return response.data;
  },

  // Get students in a schedule
  getScheduleStudents: async (
    scheduleId: string,
    status: string = "active"
  ) => {
    const response = await api.get(
      `${API_ENDPOINTS.SCHEDULES.GET_BY_ID(
        scheduleId
      )}/students?status=${status}`
    );
    return response.data;
  },

  // Create schedule exception
  createScheduleException: async (
    scheduleId: string,
    exceptionData: {
      exception_date: string;
      exception_type: "cancellation" | "reschedule" | "time_change";
      new_date?: string;
      new_start_time?: string;
      new_end_time?: string;
      new_teacher_id?: number;
      new_room_id?: number;
      reason: string;
      notes?: string;
    }
  ) => {
    const response = await api.post(
      `${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/exceptions`,
      exceptionData
    );
    return response.data;
  },

  // Create makeup session
  createScheduleMakeupSession: async (
    scheduleId: string,
    makeupData: {
      original_session_id: number;
      makeup_date: string;
      makeup_start_time: string;
      makeup_end_time: string;
      teacher_id?: number;
      room_id?: number;
      reason?: string;
      notes?: string;
    }
  ) => {
    const response = await api.post(
      `${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/makeup`,
      makeupData
    );
    return response.data;
  },

  // Update session
  updateSession: async (
    scheduleId: string,
    sessionId: string,
    updates: {
      session_date?: string;
      start_time?: string;
      end_time?: string;
      status?: string;
      notes?: string;
    }
  ) => {
    const response = await api.put(
      `${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/sessions/${sessionId}`,
      updates
    );
    return response.data;
  },

  // Create session(s) with repeat options
  createSessions: async (
    scheduleId: string,
    sessionData: {
      session_date: string;
      start_time: string;
      end_time: string;
      repeat?: {
        enabled: boolean;
        frequency: "daily" | "weekly" | "monthly";
        interval: number;
        end: {
          type: "never" | "after" | "on";
          count?: number;
          date?: string;
        };
        days_of_week?: string[];
      };
      is_makeup_session?: boolean;
      notes?: string;
      appointment_notes?: string;
    }
  ) => {
    // Backend expects time-only strings (HH:MM) for start_time/end_time.
    const toTimeOnly = (timeStr: string) => {
      if (!timeStr) return timeStr;
      // If already HH:MM or HH:MM:SS, extract HH:MM
      const hmMatch = timeStr.match(/^(\d{2}:\d{2})/);
      if (hmMatch) return hmMatch[1];
      // If ISO-like, extract T..:.. from it
      const isoMatch = timeStr.match(/T(\d{2}):(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}:${isoMatch[2]}`;
      return timeStr;
    };

    const payload = {
      ...sessionData,
      // keep session_date as-is (YYYY-MM-DD)
      start_time: toTimeOnly(sessionData.start_time),
      end_time: toTimeOnly(sessionData.end_time),
    };

    const response = await api.post(
      `${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/sessions/create`,
      payload
    );
    return response.data;
  },

  // Get list of schedules for dropdown
  getSchedules: async (): Promise<{
    success: boolean;
    data: Array<{
      schedule_id: number;
      schedule_name: string;
      course_name: string;
    }>;
  }> => {
    const response = await api.get("/schedules");
    const raw = (response?.data?.data?.schedules ?? []) as Array<{
      id: number;
      schedule_name: string;
      course_name: string;
    }>;
    return {
      success: response.data.success,
      data: raw.map((s) => ({
        schedule_id: s.id,
        schedule_name: s.schedule_name,
        course_name: s.course_name,
      })),
    };
  },

  // Create multiple sessions at once
  createMultipleSessions: async (sessionData: {
    schedule_id: number;
    session_count: number;
    start_date: string;
    start_time: string;
    end_time: string;
    repeat_frequency: "daily" | "weekly" | "monthly";
    notes?: string;
  }) => {
    // Backend expects time-only strings (HH:MM)
    const toTimeOnly = (timeStr: string) => {
      if (!timeStr) return timeStr;
      const hmMatch = timeStr.match(/^(\d{2}:\d{2})/);
      if (hmMatch) return hmMatch[1];
      const isoMatch = timeStr.match(/T(\d{2}):(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}:${isoMatch[2]}`;
      return timeStr;
    };

    const payload = {
      ...sessionData,
      start_time: toTimeOnly(sessionData.start_time),
      end_time: toTimeOnly(sessionData.end_time),
    };

    const response = await api.post(
      `/schedules/${sessionData.schedule_id}/sessions/bulk-create`,
      payload
    );
    return response.data;
  },

  // Enhanced Group-based Scheduling Methods

  /**
   * Get schedules relevant to current user
   * Returns schedules based on user role:
   * - Teachers: Schedules where they are assigned
   * - Students: Schedules of groups they belong to
   * - Admin/Owner: All schedules
   * Permissions: All authenticated users
   */
  getMySchedules: async (params?: {
    schedule_type?: "class" | "meeting" | "event" | "holiday" | "appointment";
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ScheduleListApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = queryParams.toString()
      ? `${SCHEDULE_ENDPOINTS_EXTENDED.MY_SCHEDULES}?${queryParams}`
      : SCHEDULE_ENDPOINTS_EXTENDED.MY_SCHEDULES;
    const response = await api.get(url);

    if (response.data.success) {
      return {
        success: true,
        data: {
          schedules:
            response.data.data?.schedules || response.data.schedules || [],
          pagination:
            response.data.data?.pagination || response.data.pagination,
        },
      };
    } else {
      throw new Error(
        response.data.message || "Failed to fetch user schedules"
      );
    }
  },

  /**
   * Confirm schedule
   * Permissions: Assigned teacher (for class schedules), Participants (for events), Admin/Owner
   */
  confirmSchedule: async (
    scheduleId: string,
    confirmData: ConfirmScheduleRequest
  ): Promise<{ message: string }> => {
    const response = await api.patch(
      SCHEDULE_ENDPOINTS_EXTENDED.CONFIRM(scheduleId),
      confirmData
    );

    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || "Schedule confirmed successfully",
      };
    } else {
      throw new Error(response.data.message || "Failed to confirm schedule");
    }
  },

  /**
   * Update session status
   * Permissions: Assigned teacher, Admin, Owner
   */
  updateSessionStatus: async (
    sessionId: string,
    statusData: UpdateSessionStatusRequest
  ): Promise<{ message: string }> => {
    const response = await api.patch(
      SCHEDULE_ENDPOINTS_EXTENDED.SESSION_STATUS(sessionId),
      statusData
    );

    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || "Session status updated successfully",
      };
    } else {
      throw new Error(
        response.data.message || "Failed to update session status"
      );
    }
  },

  /**
   * Update participation status for current user
   * Permissions: Participant only (for non-class schedules)
   */
  updateParticipationStatus: async (
    scheduleId: string,
    status: "confirmed" | "declined" | "tentative"
  ): Promise<{ message: string }> => {
    const response = await api.patch(
      SCHEDULE_ENDPOINTS_EXTENDED.PARTICIPATE(scheduleId),
      { status }
    );

    if (response.data.success || response.data.message) {
      return {
        message:
          response.data.message || "Participation status updated successfully",
      };
    } else {
      throw new Error(
        response.data.message || "Failed to update participation status"
      );
    }
  },

  /**
   * Create makeup session
   * Permissions: Teacher, Admin, Owner
   */
  createMakeupSession: async (
    makeupData: CreateMakeupSessionRequest
  ): Promise<{ message: string; session: Session }> => {
    const response = await api.post(
      SCHEDULE_ENDPOINTS_EXTENDED.MAKEUP_SESSION,
      makeupData
    );

    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || "Makeup session created successfully",
        session: response.data.data?.session || response.data.session,
      };
    } else {
      throw new Error(
        response.data.message || "Failed to create makeup session"
      );
    }
  },

  /**
   * Get session detail with comments
   * New API endpoint: GET /api/schedules/sessions/:sessionId
   */
  getSessionDetail: async (
    sessionId: string
  ): Promise<SessionDetailResponse> => {
    const response = await api.get(`/schedules/sessions/${sessionId}`);

    if (response.data) {
      return {
        comments: response.data.comments || [],
        group: response.data.group || null,
        session: response.data.session,
        students: response.data.students || [],
      };
    } else {
      throw new Error("Failed to fetch session details");
    }
  },

  /**
   * Get session comments
   * New API endpoint: GET /api/schedules/comments?session_id=:sessionId
   */
  getSessionComments: async (
    sessionId: number
  ): Promise<SessionCommentsResponse> => {
    const response = await api.get(
      `/schedules/comments?session_id=${sessionId}`
    );

    if (response.data) {
      return {
        comments: response.data.comments || [],
        count: response.data.count || 0,
      };
    } else {
      throw new Error("Failed to fetch session comments");
    }
  },

  /**
   * Create session comment
   * New API endpoint: POST /api/schedules/comments
   */
  createSessionComment: async (
    commentData: CreateSessionCommentRequest
  ): Promise<{ message: string; comment?: SessionComment }> => {
    const response = await api.post("/schedules/comments", commentData);

    if (response.data) {
      return {
        message: "Comment added successfully",
        comment: response.data.comment,
      };
    } else {
      throw new Error("Failed to create comment");
    }
  },

  /**
   * Get comments for schedule or session
   * Permissions: All authenticated users
   */
  getComments: async (params: {
    schedule_id?: number;
    session_id?: number;
    page?: number;
    limit?: number;
  }): Promise<CommentListResponse> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${SCHEDULE_ENDPOINTS_EXTENDED.COMMENTS}?${queryParams}`;
    const response = await api.get(url);

    if (response.data.success) {
      return {
        comments: response.data.data?.comments || response.data.comments || [],
        pagination: response.data.data?.pagination || response.data.pagination,
      };
    } else {
      throw new Error(response.data.message || "Failed to fetch comments");
    }
  },

  /**
   * Get teachers' schedules with enhanced group information
   * Permissions: Teacher, Admin, Owner
   */
  getTeachersSchedules: async (): Promise<TeachersScheduleResponse> => {
    const response = await api.get(
      SCHEDULE_ENDPOINTS_EXTENDED.TEACHERS_SCHEDULE
    );

    if (response.data.success) {
      return {
        schedules:
          response.data.data?.schedules || response.data.schedules || [],
        message:
          response.data.message ||
          "Basic schedule list - full calendar view to be implemented",
      };
    } else {
      throw new Error(
        response.data.message || "Failed to fetch teachers schedules"
      );
    }
  },

  /**
   * Confirm a session
   * Used for actionable notifications with session confirmation
   */
  confirmSession: async (
    sessionId: string | number,
    action: "confirm" | "decline" = "confirm"
  ): Promise<{ message: string; session?: SessionDetail }> => {
    const response = await api.patch(
      `/schedules/sessions/${sessionId}/confirm`,
      { action }
    );

    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || `Session ${action}ed successfully`,
        session: response.data.data?.session || response.data.session,
      };
    } else {
      throw new Error(response.data.message || `Failed to ${action} session`);
    }
  },

  /**
   * Execute a notification link with proper base URL handling
   * Helper function for data.link.href calls from WebSocket notifications
   */
  executeLink: async (
    link: { href: string; method?: string },
    baseUrl?: string
  ): Promise<unknown> => {
    const method = (link?.method || "GET").toUpperCase() as Method;
    let href = link?.href || "";

    if (!href) {
      throw new Error("Missing link.href");
    }

    // Normalize href: strip leading '/api' if present (e.g., '/api/schedules/..' -> '/schedules/..')
    if (href.startsWith("/api/")) {
      href = href.replace(/^\/api\//, "/");
    } else if (href === "/api") {
      href = "/";
    }

    // Use href directly if it's already absolute, otherwise prefix with base URL
    const url = href.startsWith("http")
      ? href
      : baseUrl
      ? `${baseUrl}${href.startsWith("/") ? href : `/${href}`}`
      : href; // Let api.request handle relative URLs

    try {
      const response = await api.request({
        method,
        url: href.startsWith("http") ? url : href, // Use full URL only for external links
      });

      return response.data;
    } catch (error) {
      console.error(`Failed to execute link ${method} ${href}:`, error);
      throw error;
    }
  },

  /**
   * Fetch resource details using notification link
   * Generic method to fetch any resource from notification data.link.href
   */
  fetchNotificationResource: async (
    href: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET"
  ): Promise<unknown> => {
    // Ensure href doesn't include base URL (client adds it)
    let cleanHref = href.startsWith("/") ? href : `/${href}`;
    // Normalize: strip leading '/api' if present
    if (cleanHref.startsWith("/api/")) {
      cleanHref = cleanHref.replace(/^\/api\//, "/");
    } else if (cleanHref === "/api") {
      cleanHref = "/";
    }

    const response = await api.request({
      method: method.toLowerCase() as Method,
      url: cleanHref,
    });

    return response.data;
  },

  /**
   * Get enhanced calendar view with session details
   * Permissions: Teacher, Admin, Owner
   */
  getEnhancedCalendarView: async (): Promise<CalendarViewApiResponse> => {
    const response = await api.get(API_ENDPOINTS.SCHEDULES.CALENDAR);

    if (response.data.success) {
      const rawData = response.data.data ?? {};

      return {
        success: true,
        data: {
          calendar_days: Array.isArray(rawData.calendar_days)
            ? rawData.calendar_days
            : [],
          date_range: rawData.date_range ?? {
            start: "",
            end: "",
            total_days: 0,
          },
          events: Array.isArray(rawData.events) ? rawData.events : [],
          holidays: Array.isArray(rawData.holidays) ? rawData.holidays : [],
          total_events: rawData.total_events ?? 0,
          user_context: rawData.user_context ?? {
            branch_id: "",
            role: "",
            user_id: 0,
          },
          view_type: (rawData.view_type ?? "day") as "day" | "week" | "month",
        },
      };
    } else {
      throw new Error(response.data.message || "Failed to fetch calendar view");
    }
  },

  // Legacy createGroupBasedSchedule removed in favor of unified createSchedule

  /**
   * Get schedule with enhanced group/participant information
   */
  getEnhancedScheduleDetails: async (
    scheduleId: string
  ): Promise<{
    schedule: Schedule;
    sessions: DetailedSession[];
    participants?: ScheduleParticipant[];
    comments: ScheduleComment[];
  }> => {
    try {
      // Get basic schedule details
      const scheduleResponse = await scheduleService.getScheduleDetails(
        scheduleId
      );

      // Get enhanced session information
      const sessionsResponse = await scheduleService.getScheduleSessions(
        scheduleId
      );

      // Get comments
      const commentsResponse = await scheduleService.getComments({
        schedule_id: parseInt(scheduleId),
      });

      return {
        schedule: {
          id: scheduleResponse.data.schedule.id,
          schedule_name: scheduleResponse.data.schedule.schedule_name,
          schedule_type: "class", // Default, would be enhanced from API
          group_id: undefined, // Would be populated from API
          created_by_user_id: 0, // Would be populated from API
          recurring_pattern: "weekly", // Would be populated from API
          total_hours: parseFloat(scheduleResponse.data.schedule.total_hours),
          hours_per_session: parseFloat(
            scheduleResponse.data.schedule.hours_per_session
          ),
          session_per_week: 1, // Would be populated from API
          start_date: scheduleResponse.data.schedule.start_date,
          estimated_end_date: scheduleResponse.data.schedule.start_date, // Would be populated from API
          status: scheduleResponse.data.schedule.status as
            | "scheduled"
            | "paused"
            | "completed"
            | "cancelled"
            | "assigned",
          auto_reschedule:
            scheduleResponse.data.schedule.auto_reschedule_holidays === 1,
        },
        sessions: sessionsResponse.data.sessions.map((session) => ({
          id: session.id,
          schedule_id: session.schedule_id,
          session_date: session.session_date,
          start_time: session.start_time,
          end_time: session.end_time,
          session_number: session.session_number,
          week_number: session.week_number,
          status: session.status as
            | "scheduled"
            | "confirmed"
            | "pending"
            | "completed"
            | "cancelled"
            | "rescheduled"
            | "no-show",
          is_makeup: false, // Would be populated from API
          notes: session.notes ?? undefined,
          assigned_teacher_id: session.teacher_id,
          room_id: undefined, // Would be populated from API
        })),
        comments: commentsResponse.comments,
      };
    } catch (error) {
      console.error("Error fetching enhanced schedule details:", error);
      throw error;
    }
  },
};

// Schedule Participation API Functions
export interface ScheduleParticipationRequest {
  status: "confirmed" | "declined";
}

export interface ScheduleParticipationResponse {
  id: number;
  schedule_id: number;
  user_id: number;
  status: "confirmed" | "declined" | "pending" | "tentative";
  confirmed_at?: string;
  declined_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Confirm or decline participation in a schedule invitation
 * PATCH /api/schedules/:id/participants/me
 */
export const confirmScheduleParticipation = async (
  scheduleId: number,
  status: "confirmed" | "declined" | "tentative"
): Promise<ScheduleParticipationResponse> => {
  const response = await api.patch<ScheduleParticipationResponse>(
    SCHEDULE_ENDPOINTS_EXTENDED.PARTICIPATE(scheduleId.toString()),
    { status }
  );
  return response.data;
};

/**
 * Get current user's participation status for a schedule
 * GET /api/schedules/:id/participants/me
 */
export const getScheduleParticipationStatus = async (
  scheduleId: number
): Promise<ScheduleParticipationResponse | null> => {
  try {
    const response = await api.get<ScheduleParticipationResponse>(
      SCHEDULE_ENDPOINTS_EXTENDED.PARTICIPATE(scheduleId.toString())
    );
    return response.data;
  } catch {
    // If 404, user is not a participant
    return null;
  }
};

/**
 * Get schedule details for invitation (lightweight version)
 * GET /api/schedules/:id
 */
export const getScheduleForInvitation = async (
  scheduleId: number
): Promise<{
  id: number;
  schedule_name: string;
  schedule_type: string;
  start_date: string;
  end_date?: string;
  description?: string;
}> => {
  const response = await api.get<{
    id: number;
    schedule_name: string;
    schedule_type: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>(`/schedules/${scheduleId}`);
  return response.data;
};

/**
 * Check room conflicts for schedule creation
 * POST /api/schedules/check-room-conflict
 */
export const checkRoomConflict = async (
  request: CheckRoomConflictRequest
): Promise<CheckRoomConflictResponse> => {
  const response = await api.post<{
    success: boolean;
    data: CheckRoomConflictResponse;
  }>(SCHEDULE_ENDPOINTS_EXTENDED.CHECK_ROOM_CONFLICT, request);
  return response.data.data;
};

/**
 * Get schedule details (full normalized version)
 * GET /api/schedules/:id
 */
export const getScheduleDetail = async (
  scheduleId: number
): Promise<{
  id: number;
  created_at: string;
  updated_at: string;
  schedule_name: string;
  schedule_type: string;
  status: string;
  recurring_pattern?: string;
  total_hours?: number;
  hours_per_session?: number;
  session_per_week?: number;
  start_date: string;
  estimated_end_date?: string;
  notes?: string;
  auto_reschedule: boolean;
  created_by: { id: number; username: string };
  default_teacher?: { id: number; username: string };
  default_room?: { id: number; name: string };
  group?: { id: number; name: string } | null;
  participants: Array<{
    user_id: number;
    role: string;
    status: string;
    user: { id: number; username: string };
  }>;
  sessions: Array<{
    id: number;
    schedule_id: number;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    session_number: number;
    week_number: number;
    is_makeup: boolean;
    notes?: string;
    teacher?: { id: number; username: string };
    room?: { id: number; name: string };
  }>;
}> => {
  const response = await api.get<{
    success: boolean;
    data: {
      id: number;
      created_at: string;
      updated_at: string;
      schedule_name: string;
      schedule_type: string;
      status: string;
      recurring_pattern?: string;
      total_hours?: number;
      hours_per_session?: number;
      session_per_week?: number;
      start_date: string;
      estimated_end_date?: string;
      notes?: string;
      auto_reschedule: boolean;
      created_by: { id: number; username: string };
      default_teacher?: { id: number; username: string };
      default_room?: { id: number; name: string };
      group?: { id: number; name: string } | null;
      participants: Array<{
        user_id: number;
        role: string;
        status: string;
        user: { id: number; username: string };
      }>;
      sessions: Array<{
        id: number;
        schedule_id: number;
        date: string;
        start_time: string;
        end_time: string;
        status: string;
        session_number: number;
        week_number: number;
        is_makeup: boolean;
        notes?: string;
        teacher?: { id: number; username: string };
        room?: { id: number; name: string };
      }>;
    };
  }>(`/schedules/${scheduleId}`);
  return response.data.data;
};

/**
 * Teacher confirm session (pending -> confirmed)
 */
export const teacherConfirmSession = async (
  sessionId: number
): Promise<{ message: string; session?: SessionDetail }> => {
  const response = await api.post(
    `/schedules/sessions/${sessionId}/teacher-confirm`
  );

  if (response.data.success || response.data.message) {
    return {
      message: response.data.message || "Session confirmed successfully",
      session: response.data.data?.session || response.data.session,
    };
  } else {
    throw new Error(response.data.message || "Failed to confirm session");
  }
};

/**
 * Teacher decline session (pending -> cancelled)
 */
export const teacherDeclineSession = async (
  sessionId: number,
  reason?: string
): Promise<{ message: string; session?: SessionDetail }> => {
  const response = await api.post(
    `/schedules/sessions/${sessionId}/teacher-decline`,
    { reason }
  );

  if (response.data.success || response.data.message) {
    return {
      message: response.data.message || "Session declined successfully",
      session: response.data.data?.session || response.data.session,
    };
  } else {
    throw new Error(response.data.message || "Failed to decline session");
  }
};

/**
 * Update Session Request Interface - Full Update Endpoint
 * PATCH /api/schedules/sessions/:id
 */
export interface UpdateSessionRequest {
  session_date?: string;
  start_time?: string;
  end_time?: string;
  assigned_teacher_id?: number;
  room_id?: number;
  status?:
    | "scheduled"
    | "confirmed"
    | "pending"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "no-show";
  notes?: string;
  cancelling_reason?: string;
  session_number?: number;
  week_number?: number;
}

/**
 * Update Session Response Interface
 */
export interface UpdateSessionResponse {
  message: string;
  session: SessionDetail;
}

/**
 * Admin/Owner update session (full update endpoint)
 * PATCH /api/schedules/sessions/:id
 * Allows updating time, room, teacher, status, notes, etc.
 * Permissions: Admin, Owner (Teachers can only update status & notes via this endpoint)
 */
export const updateSession = async (
  sessionId: number,
  updates: UpdateSessionRequest
): Promise<UpdateSessionResponse> => {
  const response = await api.patch(`/schedules/sessions/${sessionId}`, updates);

  if (response.data) {
    return {
      message: response.data.message || "Session updated successfully",
      session: response.data.session || response.data.data?.session,
    };
  } else {
    throw new Error(response.data.message || "Failed to update session");
  }
};
