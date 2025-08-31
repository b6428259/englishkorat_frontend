import { api } from './base';
import { API_ENDPOINTS } from './endpoints';

// Types for schedule data
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
export interface ScheduleListResponse {
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
export interface CreateScheduleRequest {
  course_id: number;
  teacher_id?: number;
  room_id?: number;
  schedule_name: string;
  total_hours: number;
  hours_per_session?: number;
  max_students?: number;
  start_date: string;
  time_slots: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
  }>;
  auto_reschedule_holidays?: boolean;
  notes?: string;
}

// Course interface for dropdowns
export interface Course {
  id: number;
  course_name: string;
  course_code: string;
  description?: string;
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

export interface CalendarViewResponse {
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
    const response = await api.get('/api/v1/courses');
    return response.data;
  },

  // Get list of rooms for dropdown
  getRooms: async (): Promise<{ success: boolean; data: Room[] }> => {
    const response = await api.get('/api/v1/rooms');
    return response.data;
  },

  // Get list of teachers for dropdown
  getTeachers: async (): Promise<{ success: boolean; data: TeacherOption[] }> => {
    const response = await api.get('/api/v1/teachers');
    return response.data;
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
  }): Promise<ScheduleListResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`${API_ENDPOINTS.SCHEDULES.LIST}?${queryParams}`);
    return response.data;
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
    return response.data;
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
  ): Promise<CalendarViewResponse> => {
    const queryParams = new URLSearchParams({ view, date });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`${API_ENDPOINTS.SCHEDULES.CALENDAR}?${queryParams}`);
    return response.data;
  },

  // Get detailed information about a specific schedule
  getScheduleDetails: async (scheduleId: string): Promise<ScheduleDetailResponse> => {
    // Use the sessions endpoint which returns schedule + students + sessions + summary
    const response = await api.get(API_ENDPOINTS.SCHEDULES.SESSIONS(scheduleId));
    return response.data;
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
    return response.data;
  },

  // Create a new schedule
  createSchedule: async (scheduleData: CreateScheduleRequest) => {
    const response = await api.post(API_ENDPOINTS.SCHEDULES.CREATE, scheduleData);
    return response.data;
  },

  // Update an existing schedule
  updateSchedule: async (scheduleId: string, updates: Partial<CreateScheduleRequest>) => {
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
  createMakeupSession: async (scheduleId: string, makeupData: {
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
    const response = await api.get('/api/v1/schedules');
    return response.data;
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
    const response = await api.post(`/api/v1/schedules/${sessionData.schedule_id}/sessions/bulk-create`, sessionData);
    return response.data;
  }
};
