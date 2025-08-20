import { api } from './base';

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  nickname: string;
  nationality: string | null;
  teacher_type: 'Both' | 'Kid' | 'Adults' | 'Admin Team';
  hourly_rate: number | null;
  specializations: string;
  certifications: string;
  active: number;
  username: string;
  email: string | null;
  phone: string | null;
  line_id: string | null;
  status: 'active' | 'inactive';
  branch_id: number;
  created_at: string;
  avatar?: string;
}

export interface TeachersListResponse {
  success: boolean;
  data: {
    teachers: Teacher[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface TeacherResponse {
  success: boolean;
  data: {
    teacher: Teacher & {
      avatar?: string;
      branch_name?: string;
      branch_code?: string;
      updated_at?: string;
    };
  };
}

export interface CreateTeacherRequest {
  first_name: string;
  last_name: string;
  nickname?: string;
  nationality?: string;
  teacher_type: 'Both' | 'Kid' | 'Adults' | 'Admin Team';
  hourly_rate?: number;
  specializations?: string;
  certifications?: string;
  username: string;
  email?: string;
  phone?: string;
  line_id?: string;
  branch_id?: number;
}

export interface UpdateTeacherRequest {
  first_name?: string;
  last_name?: string;
  nickname?: string;
  nationality?: string;
  teacher_type?: 'Both' | 'Kid' | 'Adults' | 'Admin Team';
  hourly_rate?: number;
  specializations?: string;
  certifications?: string;
  email?: string;
  phone?: string;
  line_id?: string;
  active?: boolean;
}

export const teachersApi = {
  /**
   * Get list of all teachers with pagination
   */
  getTeachers: async (page = 1, limit = 10): Promise<TeachersListResponse> => {
    const response = await api.get('/teachers', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get teacher by ID
   */
  getTeacherById: async (id: string): Promise<TeacherResponse> => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  /**
   * Create new teacher
   */
  createTeacher: async (teacherData: CreateTeacherRequest): Promise<TeacherResponse> => {
    const response = await api.post('/teachers', teacherData);
    return response.data;
  },

  /**
   * Update teacher by ID
   */
  updateTeacher: async (id: string, teacherData: UpdateTeacherRequest): Promise<TeacherResponse> => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  },

  /**
   * Delete teacher by ID
   */
  deleteTeacher: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },
};
