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

export const scheduleService = {
  // Get teachers with their schedules for a specific date filter
  getTeachersSchedule: async (dateFilter: 'day' | 'week' | 'month' = 'day'): Promise<ScheduleTeachersResponse> => {
    const response = await api.get(API_ENDPOINTS.SCHEDULES.TEACHERS(dateFilter));
    return response.data;
  },

  // Get detailed information about a specific schedule
  getScheduleDetails: async (scheduleId: string): Promise<ScheduleDetailResponse> => {
    const response = await api.get(API_ENDPOINTS.SCHEDULES.SESSIONS(scheduleId));
    return response.data;
  },

  // Create a new schedule (mock for now)
  createSchedule: async (scheduleData: any) => {
    // Mock implementation for now
    console.log('Creating schedule:', scheduleData);
    return { success: true, message: 'Schedule created successfully (mock)' };
  }
};
