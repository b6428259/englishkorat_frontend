import { api } from './base';
import { API_ENDPOINTS } from './endpoints';

export interface Course {
  id: number;
  name: string;
  code: string;
  course_type: string;
  description: string;
  price: string;
  hours_total: number;
  max_students: number;
  level: string;
  branch_id: number;
  branch_name: string;
  branch_code: string;
}

export interface CreateCourseRequest {
  name: string;
  code: string;
  course_type: string;
  description: string;
  price: string;
  hours_total: number;
  max_students: number;
  level: string;
  branch_id: number;
}

export interface UpdateCourseRequest {
  name?: string;
  code?: string;
  course_type?: string;
  description?: string;
  price?: string;
  hours_total?: number;
  max_students?: number;
  level?: string;
}

export interface CoursesListResponse {
  success: boolean;
  data: {
    courses: Course[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface CourseResponse {
  success: boolean;
  data: {
    course: Course;
  };
}

export const coursesApi = {
  /**
   * Get list of all courses
   */
  getCourses: async (page = 1, limit = 10): Promise<CoursesListResponse> => {
    const response = await api.get(API_ENDPOINTS.COURSES.LIST, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get course by ID
   */
  getCourseById: async (id: string): Promise<CourseResponse> => {
    const response = await api.get(API_ENDPOINTS.COURSES.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Create new course
   */
  createCourse: async (courseData: CreateCourseRequest): Promise<CourseResponse> => {
    const response = await api.post(API_ENDPOINTS.COURSES.CREATE, courseData);
    return response.data;
  },

  /**
   * Update course by ID
   */
  updateCourse: async (id: string, courseData: UpdateCourseRequest): Promise<CourseResponse> => {
    const response = await api.put(API_ENDPOINTS.COURSES.UPDATE(id), courseData);
    return response.data;
  },

  /**
   * Delete course by ID
   */
  deleteCourse: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(API_ENDPOINTS.COURSES.DELETE(id));
    return response.data;
  },

  /**
   * Enroll in course
   */
  enrollInCourse: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(API_ENDPOINTS.COURSES.ENROLL(id));
    return response.data;
  }
};