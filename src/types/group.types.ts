// Group-based Scheduling System Types
// Based on the comprehensive API documentation

// Group Model Types
export interface Group {
  id: number;
  group_name: string;
  course_id: number;
  level: string;
  max_students: number;
  status: 'active' | 'inactive' | 'suspended' | 'full' | 'need-feeling' | 'empty';
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid';
  description?: string;
  created_at: string;
  updated_at: string;
  course?: {
    id: number;
    name: string;
    level: string;
  };
  members?: GroupMember[];
}

export interface GroupMember {
  id: number;
  group_id: number;
  student_id: number;
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid';
  joined_at: string;
  status: 'active' | 'inactive' | 'suspended';
  student?: {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    nickname: string;
    email: string;
    phone: string;
  };
}

// Enhanced Schedule Model for Group-based System
export interface Schedule {
  id: number;
  schedule_name: string;
  schedule_type: 'class' | 'meeting' | 'event' | 'holiday' | 'appointment';
  group_id?: number; // For class schedules
  created_by_user_id: number;
  recurring_pattern: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly' | 'custom';
  total_hours: number;
  hours_per_session: number;
  session_per_week: number;
  start_date: string;
  estimated_end_date: string;
  actual_end_date?: string;
  default_teacher_id?: number;
  default_room_id?: number;
  status: 'scheduled' | 'paused' | 'completed' | 'cancelled' | 'assigned';
  auto_reschedule: boolean;
  notes?: string;
  admin_assigned?: string;
  session_start_time?: string;
  custom_recurring_days?: number[]; // 1=Monday, 2=Tuesday, etc.
  
  // Relations
  group?: Group;
  participants?: ScheduleParticipant[];
  default_teacher?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  default_room?: {
    id: number;
    room_name: string;
  };
}

// Schedule Participant Model for events/appointments
export interface ScheduleParticipant {
  id: number;
  schedule_id: number;
  user_id: number;
  role: 'organizer' | 'participant' | 'observer';
  status: 'invited' | 'confirmed' | 'declined' | 'tentative';
  user?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

// Enhanced Session Model
export interface Session {
  id: number;
  schedule_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  session_number: number;
  week_number: number;
  status: 'scheduled' | 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  cancelling_reason?: string;
  is_makeup: boolean;
  makeup_for_session_id?: number;
  notes?: string;
  assigned_teacher_id?: number;
  room_id?: number;
  confirmed_at?: string;
  confirmed_by_user_id?: number;
  
  // Relations
  assigned_teacher?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  room?: {
    id: number;
    room_name: string;
  };
  schedule?: {
    id: number;
    schedule_name: string;
    schedule_type: string;
    group?: Group;
  };
}

// Comment System
export interface ScheduleComment {
  id: number;
  schedule_id?: number;
  session_id?: number;
  user_id: number;
  comment: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

// API Request/Response Types
export interface CreateGroupRequest {
  group_name: string;
  course_id: number;
  level: string;
  max_students: number;
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid';
  description?: string;
}

export interface AddGroupMemberRequest {
  student_id: number;
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid';
}

export interface UpdatePaymentStatusRequest {
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid';
  student_id?: number; // Optional: update specific member, otherwise update group
}

// Enhanced Schedule Creation Request
export interface CreateScheduleRequest {
  schedule_name: string;
  schedule_type: 'class' | 'meeting' | 'event' | 'holiday' | 'appointment';
  group_id?: number; // For class schedules
  participant_user_ids?: number[]; // For event/appointment schedules
  recurring_pattern: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly' | 'custom';
  total_hours: number;
  hours_per_session: number;
  session_per_week: number;
  start_date: string;
  estimated_end_date?: string;
  default_teacher_id?: number;
  default_room_id?: number;
  auto_reschedule: boolean;
  session_start_time: string;
  custom_recurring_days?: number[];
  notes?: string;
}

export interface ConfirmScheduleRequest {
  status: 'scheduled' | 'confirmed' | 'declined';
}

export interface UpdateSessionStatusRequest {
  status: 'scheduled' | 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  notes?: string;
}

export interface CreateMakeupSessionRequest {
  original_session_id: number;
  new_session_date: string;
  new_start_time: string;
  cancelling_reason: string;
  new_session_status: 'cancelled' | 'rescheduled' | 'no-show';
}

export interface CreateCommentRequest {
  schedule_id?: number;
  session_id?: number;
  comment: string;
}

// API Response Types
export interface GroupResponse {
  message: string;
  group: Group;
}

export interface GroupListResponse {
  groups: Group[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ScheduleResponse {
  message: string;
  schedule: Schedule;
}

export interface ScheduleListResponse {
  schedules: Schedule[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface SessionListResponse {
  sessions: Session[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface CommentListResponse {
  comments: ScheduleComment[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface TeachersScheduleResponse {
  schedules: Array<{
    id: number;
    schedule_name: string;
    schedule_type: string;
    status: string;
    start_date: string;
    estimated_end_date: string;
    group?: {
      group_name: string;
      course: {
        name: string;
        level: string;
      };
    };
    default_teacher?: {
      id: number;
      username: string;
    };
  }>;
  message: string;
}

export interface CalendarViewResponse {
  sessions: Array<{
    id: number;
    schedule_id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    status: string;
    schedule: {
      schedule_name: string;
      group?: {
        course: {
          name: string;
        };
      };
    };
  }>;
  message: string;
}

// Utility Types for UI Components
export interface GroupOption {
  id: number;
  group_name: string;
  course_name: string;
  level: string;
  current_students: number;
  max_students: number;
  payment_status: string;
}

export interface StudentOption {
  id: number;
  name: string;
  email: string;
  payment_status?: string;
}

// Error Types
export interface GroupError {
  error: string;
  code: number;
  path: string;
  method: string;
}