/**
 * Session Cancellation & Makeup Types
 * Types for session cancellation requests, approvals, and makeup management
 */

export type SessionStatus =
  | "scheduled"
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled"
  | "rescheduled"
  | "no-show"
  | "pending_cancellation";

export interface CancellationRequest {
  reason: string;
}

export interface CancellationRequestResponse {
  success: boolean;
  message: string;
  session: {
    id: number;
    status: SessionStatus;
    cancellation_requested_at: string;
    cancellation_requested_by: string;
    reason: string;
  };
}

export interface ApproveCancellationResponse {
  success: boolean;
  message: string;
  session: {
    id: number;
    status: SessionStatus;
    makeup_class_needed: boolean;
    cancellation_approved_at: string;
    cancellation_approved_by: string;
  };
  affected_students: Array<{
    student_id: number;
    first_name: string;
    last_name: string;
    old_makeup_quota: number;
    new_makeup_quota: number;
    warning?: string;
  }>;
  next_step?: string;
}

export interface BulkApproveCancellationRequest {
  session_ids: number[];
}

export interface BulkApproveCancellationResponse {
  success: boolean;
  message: string;
  summary: {
    total_requested: number;
    successful: number;
    failed: number;
  };
  successful_approvals: Array<{
    session_id: number;
    session_date: string;
    affected_students: number;
    requester_notified: boolean;
    requester_id: number | null;
    makeup_class_needed: boolean;
  }>;
  failed_approvals: Array<{
    session_id: number;
    error: string;
  }>;
  next_step?: string;
}

export interface MakeupNeededSession {
  session_id: number;
  schedule_id: number;
  schedule_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  cancelling_reason: string;
  cancelled_at: string;
  group: {
    id: number;
    group_name: string;
    level: string;
  };
  course: {
    id: number;
    course_name: string;
  };
}

export interface MakeupNeededResponse {
  success: boolean;
  sessions_needing_makeup: MakeupNeededSession[];
  total: number;
}

export interface ScheduleCancellationStatusResponse {
  success: boolean;
  schedule_id: number;
  schedule_name: string;
  group_name: string;
  statistics: {
    total_sessions: number;
    completed_sessions: number;
    pending_cancellation: number;
    approved_cancellation: number;
    cancellation_rate: number;
  };
  pending_requests: {
    count: number;
    details: Array<{
      session_id: number;
      session_number: number;
      session_date: string;
      reason: string;
      requested_at: string;
      requested_by: string;
      requested_by_id: number;
      days_pending: number;
    }>;
  };
  recently_cancelled: {
    count: number;
    details: Array<{
      session_id: number;
      session_number: number;
      session_date: string;
      reason: string;
      approved_at: string;
      approved_by: string;
      approved_by_id: number;
      makeup_needed: boolean;
    }>;
  };
}

export interface CancellationRequest_AllParams {
  status?: "all" | "pending" | "cancelled";
  limit?: number;
  offset?: number;
}

export interface CancellationRequestItem {
  session_id: number;
  schedule_id: number;
  schedule_name: string;
  session_number: number;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  reason: string;
  requested_at: string;
  requested_by: string;
  requested_by_id: number;
  teacher_name?: string;
  days_pending?: number;
  approved_at?: string;
  approved_by?: string;
  approved_by_id?: number;
  makeup_needed: boolean;
  group: {
    id: number;
    group_name: string;
    level: string;
  };
  course: {
    id: number;
    name: string;
  };
  students: Array<{
    id: number;
    name: string;
  }>;
}

export interface AllCancellationsResponse {
  success: boolean;
  statistics: {
    total_pending: number;
    total_cancelled: number;
    total: number;
  };
  requests: CancellationRequestItem[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
  filter: {
    status: string;
  };
}

export interface DashboardStatsParams {
  period?: number; // Days to look back (default: 30, max: 365)
}

export interface DashboardStatsResponse {
  success: boolean;
  period: {
    days: number;
    start_date: string;
    end_date: string;
  };
  overall_statistics: {
    total_pending: number;
    total_cancelled: number;
    total_completed: number;
    total_scheduled: number;
    cancellation_rate: number;
    pending_needs_action: number;
  };
  weekly_trend: Array<{
    week: string;
    count: number;
  }>;
  top_cancellation_reasons: Array<{
    reason: string;
    count: number;
  }>;
  teachers_with_most_cancellations: Array<{
    user_id: number;
    username: string;
    count: number;
  }>;
  schedules_with_highest_cancellation_rate: Array<{
    schedule_id: number;
    schedule_name: string;
    total_sessions: number;
    cancelled_count: number;
    cancellation_rate: number;
  }>;
  urgent_pending_requests: {
    count: number;
    details: Array<{
      session_id: number;
      schedule_id: number;
      schedule_name: string;
      session_date: string;
      requested_by: string;
      requested_at: string;
      days_pending: number;
      reason: string;
    }>;
  };
  approval_metrics: {
    average_approval_time_hours: number;
    urgent_count_over_3_days: number;
  };
  makeup_class_status: {
    sessions_needing_makeup: number;
    makeup_sessions_created: number;
    pending_makeup_creation: number;
  };
}

export interface UpdateMakeupQuotaRequest {
  make_up_remaining: number;
  reason: string;
}

export interface UpdateMakeupQuotaResponse {
  success: boolean;
  message: string;
  student_id: number;
  old_quota: number;
  new_quota: number;
  make_up_remaining: number;
}
