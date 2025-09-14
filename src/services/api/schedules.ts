import { api } from './base';
import { API_ENDPOINTS } from './endpoints';
import {
  Schedule,
  ScheduleParticipant,
  ScheduleComment,
  Session as DetailedSession,
  ConfirmScheduleRequest,
  UpdateSessionStatusRequest,
  CreateMakeupSessionRequest,
  CreateCommentRequest,
  ScheduleResponse,
  CommentListResponse,
  TeachersScheduleResponse
} from '@/types/group.types';

// Updated API endpoints for Group-based scheduling
export const SCHEDULE_ENDPOINTS_EXTENDED = {
  ...API_ENDPOINTS.SCHEDULES,
  MY_SCHEDULES: '/schedules/my',
  CONFIRM: (id: string) => `/schedules/${id}/confirm`,
  SESSION_STATUS: (sessionId: string) => `/schedules/sessions/${sessionId}/status`,
  MAKEUP_SESSION: '/schedules/sessions/makeup',
  COMMENTS: '/schedules/comments',
  TEACHERS_SCHEDULE: '/schedules/teachers'
} as const;
export interface Teacher {
  teacher_id: number;
  teacher_name: string;
  teacher_nickname: string;
  teacher_avatar: string | null;
  sessions: Session[];
}

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

export interface ScheduleTeachersResponse {
  success: boolean;
  data: {
    teachers: Teacher[];
    filter_info: {
      date_filter: 'day' | 'week' | 'month';
      start_date: string;
      end_date: string;
      total_sessions: number;
    };
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
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
  course_id: number;
  teacher_id?: number;
  room_id?: number;
  schedule_name: string;
  total_hours: number;
  hours_per_session?: number;
  // New spec fields
  schedule_type?: 'class' | 'meeting' | 'event' | 'holiday' | 'appointment';
  // For class schedules, associate to a group
  group_id?: number;
  recurring_pattern?: 'none' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly' | 'custom';
  session_per_week?: number;
  assigned_to_user_id?: number; // teacher id alias
  max_students?: number;
  start_date: string;
  estimated_end_date?: string;
  // For event/appointment schedules, specify participants
  participant_user_ids?: number[];
  time_slots: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
  }>;
  auto_reschedule_holidays?: boolean;
  auto_reschedule?: boolean; // spec naming
  notes?: string;
}

// Raw course response from API
interface RawCourseResponse {
  id: number;
  name: string;
  code: string;
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

// Raw teacher response from API
interface RawTeacherResponse {
  id: number;
  first_name: string;
  last_name: string | null;
  nickname: string | null;
  email: string | null;
  phone: string | null;
}

// Raw course response from API
interface RawCourseResponse {
  id: number;
  name: string;
  code: string;
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
  id: number;
  room_name: string;
  capacity: number;
  branch_id: number;
}

// Teacher interface for dropdowns
export interface TeacherOption {
  id: number;
  teacher_name: string;
  teacher_nickname: string;
  teacher_email?: string;
  teacher_phone?: string;
}

// Session creation request
export interface CreateSessionRequest {
  session_date: string;
  start_time: string;
  end_time: string;
  repeat?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    end: {
      type: 'never' | 'after' | 'on';
      count?: number;
      date?: string;
    };
    days_of_week?: string[];
  };
  is_makeup_session?: boolean;
  notes?: string;
  appointment_notes?: string;
  
  // Extended properties for comprehensive session creation
  mode?: 'single' | 'multiple' | 'bulk';
  schedule_id?: number;
  session_count?: number;
  repeat_frequency?: 'daily' | 'weekly' | 'monthly';
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
  students?: Array<{ id: number; name: string; level: string | null }>;
}

// Internal API shape used by legacy calendar endpoints
export interface CalendarViewApiResponse {
  success: boolean;
  data: {
    view: 'day' | 'week' | 'month';
    period: {
      start_date: string;
      end_date: string;
      total_days: number;
    };
    calendar: Record<string, {
      date: string;
      day_of_week: string;
      is_holiday: boolean;
      holiday_info: Record<string, unknown> | null;
      sessions: CalendarSession[];
      exceptions: Record<string, unknown>[];
      session_count: number;
      branch_distribution: Record<string, number>;
    }>;
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

export const scheduleService = {
  // Get list of courses for dropdown
  getCourses: async (): Promise<{ success: boolean; data: Course[] }> => {
    const response = await api.get('/courses');
    return {
      success: response.data.success,
      data: response.data.data.courses.map((course: RawCourseResponse) => ({
        ...course,
        course_name: course.name,
        course_code: course.code
      }))
    };
  },

  // Get list of rooms for dropdown
  getRooms: async (): Promise<{ success: boolean; data: Room[] }> => {
    const response = await api.get('/rooms');
    return {
      success: response.data.success,
      data: response.data.data.rooms
    };
  },

  // Get list of teachers for dropdown
  getTeachers: async (): Promise<{ success: boolean; data: TeacherOption[] }> => {
    const response = await api.get('/teachers');
    const raw: RawTeacherResponse[] = response?.data?.data?.teachers ?? [];
    const mapped: TeacherOption[] = raw.map(t => ({
      id: t.id,
      teacher_name: `${t.first_name}${t.last_name ? ' ' + t.last_name : ''}`.trim(),
      teacher_nickname: t.nickname ?? t.first_name,
      teacher_email: t.email ?? undefined,
      teacher_phone: t.phone ?? undefined,
    }));
    return {
      success: response.data.success,
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
    const response = await api.get(`${API_ENDPOINTS.SCHEDULES.LIST}?${queryParams}`);
    return {
      success: response.data.success,
      data: response.data.data
    };
  },

  // Get teachers with their schedules for a specific date filter
  getTeachersSchedule: async (
    dateFilter: 'day' | 'week' | 'month' = 'day',
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
    const response = await api.get(`${API_ENDPOINTS.SCHEDULES.TEACHERS(dateFilter)}&${queryParams}`);
    return {
      success: response.data.success,
      data: response.data.data
    };
  },

  // Get calendar view of schedules
  getCalendarView: async (
    view: 'day' | 'week' | 'month',
    date: string,
    params?: {
      branch_id?: number;
      teacher_id?: number;
      room_id?: number;
      course_id?: number;
      status?: string;
      include_students?: boolean;
      include_holidays?: boolean;
    }
  ): Promise<CalendarViewApiResponse> => {
    const queryParams = new URLSearchParams({ view, date });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`${API_ENDPOINTS.SCHEDULES.CALENDAR}?${queryParams}`);
    return {
      success: response.data.success,
      data: response.data.data
    };
  },

  // Get detailed information about a specific schedule
  getScheduleDetails: async (scheduleId: string): Promise<ScheduleDetailResponse> => {
    // Use the sessions endpoint which returns schedule + students + sessions + summary
    const response = await api.get(API_ENDPOINTS.SCHEDULES.SESSIONS(scheduleId));
    return {
      success: response.data.success,
      data: response.data.data
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
      sort_order?: 'asc' | 'desc';
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
    const response = await api.get(`${API_ENDPOINTS.SCHEDULES.SESSIONS(scheduleId)}?${queryParams}`);
    return {
      success: response.data.success,
      data: response.data.data
    };
  },

  // Create a new schedule
  createSchedule: async (scheduleData: CreateScheduleInput) => {
    const response = await api.post(API_ENDPOINTS.SCHEDULES.CREATE, scheduleData);
    return response.data;
  },

  // Update an existing schedule
  updateSchedule: async (scheduleId: string, updates: Partial<CreateScheduleInput>) => {
    const response = await api.put(API_ENDPOINTS.SCHEDULES.UPDATE(scheduleId), updates);
    return response.data;
  },

  // Delete a schedule
  deleteSchedule: async (scheduleId: string) => {
    const response = await api.delete(API_ENDPOINTS.SCHEDULES.DELETE(scheduleId));
    return response.data;
  },

  // Assign student to schedule
  assignStudent: async (scheduleId: string, studentData: {
    student_id: number;
    total_amount?: number;
    notes?: string;
  }) => {
    const response = await api.post(`${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/students`, studentData);
    return response.data;
  },

  // Remove student from schedule
  removeStudent: async (scheduleId: string, studentId: string, reason?: string) => {
    const response = await api.delete(`${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/students/${studentId}`, {
      data: { reason }
    });
    return response.data;
  },

  // Get students in a schedule
  getScheduleStudents: async (scheduleId: string, status: string = 'active') => {
    const response = await api.get(`${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/students?status=${status}`);
    return response.data;
  },

  // Create schedule exception
  createScheduleException: async (scheduleId: string, exceptionData: {
    exception_date: string;
    exception_type: 'cancellation' | 'reschedule' | 'time_change';
    new_date?: string;
    new_start_time?: string;
    new_end_time?: string;
    new_teacher_id?: number;
    new_room_id?: number;
    reason: string;
    notes?: string;
  }) => {
    const response = await api.post(`${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/exceptions`, exceptionData);
    return response.data;
  },

  // Create makeup session
  createScheduleMakeupSession: async (scheduleId: string, makeupData: {
    original_session_id: number;
    makeup_date: string;
    makeup_start_time: string;
    makeup_end_time: string;
    teacher_id?: number;
    room_id?: number;
    reason?: string;
    notes?: string;
  }) => {
    const response = await api.post(`${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/makeup`, makeupData);
    return response.data;
  },

  // Update session
  updateSession: async (scheduleId: string, sessionId: string, updates: {
    session_date?: string;
    start_time?: string;
    end_time?: string;
    status?: string;
    notes?: string;
  }) => {
    const response = await api.put(`${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/sessions/${sessionId}`, updates);
    return response.data;
  },

  // Create session(s) with repeat options
  createSessions: async (scheduleId: string, sessionData: {
    session_date: string;
    start_time: string;
    end_time: string;
    repeat?: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      end: {
        type: 'never' | 'after' | 'on';
        count?: number;
        date?: string;
      };
      days_of_week?: string[];
    };
    is_makeup_session?: boolean;
    notes?: string;
    appointment_notes?: string;
  }) => {
    const response = await api.post(`${API_ENDPOINTS.SCHEDULES.GET_BY_ID(scheduleId)}/sessions/create`, sessionData);
    return response.data;
  },

  // Get list of schedules for dropdown
  getSchedules: async (): Promise<{ success: boolean; data: Array<{
    schedule_id: number;
    schedule_name: string;
    course_name: string;
  }> }> => {
    const response = await api.get('/schedules');
    const raw = (response?.data?.data?.schedules ?? []) as Array<{
      id: number;
      schedule_name: string;
      course_name: string;
    }>;
    return {
      success: response.data.success,
      data: raw.map(s => ({
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
    repeat_frequency: 'daily' | 'weekly' | 'monthly';
    notes?: string;
  }) => {
    const response = await api.post(`/schedules/${sessionData.schedule_id}/sessions/bulk-create`, sessionData);
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
    schedule_type?: 'class' | 'meeting' | 'event' | 'holiday' | 'appointment';
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
    
    const url = queryParams.toString() ? `${SCHEDULE_ENDPOINTS_EXTENDED.MY_SCHEDULES}?${queryParams}` : SCHEDULE_ENDPOINTS_EXTENDED.MY_SCHEDULES;
    const response = await api.get(url);
    
    if (response.data.success) {
      return {
        success: true,
        data: {
          schedules: response.data.data?.schedules || response.data.schedules || [],
          pagination: response.data.data?.pagination || response.data.pagination
        }
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch user schedules');
    }
  },

  /**
   * Confirm schedule
   * Permissions: Assigned teacher (for class schedules), Participants (for events), Admin/Owner
   */
  confirmSchedule: async (scheduleId: string, confirmData: ConfirmScheduleRequest): Promise<{ message: string }> => {
    const response = await api.patch(SCHEDULE_ENDPOINTS_EXTENDED.CONFIRM(scheduleId), confirmData);
    
    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || 'Schedule confirmed successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to confirm schedule');
    }
  },

  /**
   * Update session status
   * Permissions: Assigned teacher, Admin, Owner
   */
  updateSessionStatus: async (sessionId: string, statusData: UpdateSessionStatusRequest): Promise<{ message: string }> => {
    const response = await api.patch(SCHEDULE_ENDPOINTS_EXTENDED.SESSION_STATUS(sessionId), statusData);
    
    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || 'Session status updated successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to update session status');
    }
  },

  /**
   * Create makeup session
   * Permissions: Teacher, Admin, Owner
   */
  createMakeupSession: async (makeupData: CreateMakeupSessionRequest): Promise<{ message: string; session: Session }> => {
    const response = await api.post(SCHEDULE_ENDPOINTS_EXTENDED.MAKEUP_SESSION, makeupData);
    
    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || 'Makeup session created successfully',
        session: response.data.data?.session || response.data.session
      };
    } else {
      throw new Error(response.data.message || 'Failed to create makeup session');
    }
  },

  /**
   * Add comment to schedule or session
   * Permissions: All authenticated users
   */
  addComment: async (commentData: CreateCommentRequest): Promise<{ message: string; comment: ScheduleComment }> => {
    const response = await api.post(SCHEDULE_ENDPOINTS_EXTENDED.COMMENTS, commentData);
    
    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || 'Comment added successfully',
        comment: response.data.data?.comment || response.data.comment
      };
    } else {
      throw new Error(response.data.message || 'Failed to add comment');
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
        pagination: response.data.data?.pagination || response.data.pagination
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch comments');
    }
  },

  /**
   * Get teachers' schedules with enhanced group information
   * Permissions: Teacher, Admin, Owner
   */
  getTeachersSchedules: async (): Promise<TeachersScheduleResponse> => {
    const response = await api.get(SCHEDULE_ENDPOINTS_EXTENDED.TEACHERS_SCHEDULE);
    
    if (response.data.success) {
      return {
        schedules: response.data.data?.schedules || response.data.schedules || [],
        message: response.data.message || 'Basic schedule list - full calendar view to be implemented'
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch teachers schedules');
    }
  },

  /**
   * Get enhanced calendar view with session details
   * Permissions: Teacher, Admin, Owner
   */
  getEnhancedCalendarView: async (): Promise<CalendarViewApiResponse> => {
    const response = await api.get(API_ENDPOINTS.SCHEDULES.CALENDAR);
    
    if (response.data.success) {
      return {
        success: true,
        data: {
          view: response.data.data?.view ?? 'day',
          period: response.data.data?.period ?? { start_date: '', end_date: '', total_days: 0 },
          calendar: response.data.data?.calendar ?? {},
          holidays: response.data.data?.holidays ?? [],
          summary: response.data.data?.summary ?? {
            total_sessions: 0,
            total_holidays: 0,
            total_exceptions: 0,
            sessions_by_status: {},
            sessions_by_branch: {},
            sessions_by_teacher: {},
            days_with_sessions: 0,
            days_with_holidays: 0
          }
        }
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch calendar view');
    }
  },

  /**
   * Create Group-based Class Schedule
   * Enhanced version that supports the new group-based workflow
   */
  createGroupBasedSchedule: async (scheduleData: CreateScheduleInput): Promise<ScheduleResponse> => {
    // Validate that for class schedules, group_id is provided
    if (scheduleData.schedule_type === 'class' && !scheduleData.group_id) {
      throw new Error('Group ID is required for class schedules');
    }
    
    // Validate that for event/appointment schedules, participant_user_ids is provided
  if (scheduleData.schedule_type && ['event', 'appointment'].includes(scheduleData.schedule_type) && (!scheduleData.participant_user_ids || scheduleData.participant_user_ids.length === 0)) {
      throw new Error('Participant user IDs are required for event/appointment schedules');
    }

    const response = await api.post(API_ENDPOINTS.SCHEDULES.CREATE, scheduleData);
    
    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || 'Schedule created successfully',
        schedule: response.data.data?.schedule || response.data.schedule
      };
    } else {
      throw new Error(response.data.message || 'Failed to create schedule');
    }
  },

  /**
   * Get schedule with enhanced group/participant information
   */
  getEnhancedScheduleDetails: async (scheduleId: string): Promise<{
    schedule: Schedule;
    sessions: DetailedSession[];
    participants?: ScheduleParticipant[];
    comments: ScheduleComment[];
  }> => {
    try {
      // Get basic schedule details
      const scheduleResponse = await scheduleService.getScheduleDetails(scheduleId);
      
      // Get enhanced session information
      const sessionsResponse = await scheduleService.getScheduleSessions(scheduleId);
      
      // Get comments
      const commentsResponse = await scheduleService.getComments({ schedule_id: parseInt(scheduleId) });
      
      return {
        schedule: {
          id: scheduleResponse.data.schedule.id,
          schedule_name: scheduleResponse.data.schedule.schedule_name,
          schedule_type: 'class', // Default, would be enhanced from API
          group_id: undefined, // Would be populated from API
          created_by_user_id: 0, // Would be populated from API
          recurring_pattern: 'weekly', // Would be populated from API
          total_hours: parseFloat(scheduleResponse.data.schedule.total_hours),
          hours_per_session: parseFloat(scheduleResponse.data.schedule.hours_per_session),
          session_per_week: 1, // Would be populated from API
          start_date: scheduleResponse.data.schedule.start_date,
          estimated_end_date: scheduleResponse.data.schedule.start_date, // Would be populated from API
          status: scheduleResponse.data.schedule.status as 'scheduled' | 'paused' | 'completed' | 'cancelled' | 'assigned',
          auto_reschedule: scheduleResponse.data.schedule.auto_reschedule_holidays === 1
        },
  sessions: sessionsResponse.data.sessions.map(session => ({
          id: session.id,
          schedule_id: session.schedule_id,
          session_date: session.session_date,
          start_time: session.start_time,
          end_time: session.end_time,
          session_number: session.session_number,
          week_number: session.week_number,
          status: session.status as 'scheduled' | 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show',
          is_makeup: false, // Would be populated from API
          notes: session.notes ?? undefined,
          assigned_teacher_id: session.teacher_id,
          room_id: undefined // Would be populated from API
        })),
        comments: commentsResponse.comments
      };
    } catch (error) {
      console.error('Error fetching enhanced schedule details:', error);
      throw error;
    }
  }
};
