import { authService } from './auth.service';

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

interface CourseResponse {
  success: boolean;
  data: {
    courses: Course[];
  };
}

export const courseService = {
  getCourses: async (): Promise<Course[]> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3000/api/v1/courses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CourseResponse = await response.json();
      
      if (!data.success || !data.data.courses) {
        throw new Error('Invalid response format');
      }

      return data.data.courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }
};
