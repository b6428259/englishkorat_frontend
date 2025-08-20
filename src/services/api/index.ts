// Central API exports
export { api as apiClient } from './base';
export { API_ENDPOINTS, HTTP_STATUS, APP_CONFIG } from './endpoints';

// Service exports
export { authApi } from './auth';
export { usersApi } from './users';
export { coursesApi } from './courses';
export { teachersApi } from './teachers';

// Type exports
export type { 
  CreateUserRequest, 
  UpdateUserRequest, 
  UsersListResponse, 
  UserResponse 
} from './users';

export type { 
  Course, 
  CreateCourseRequest, 
  UpdateCourseRequest, 
  CoursesListResponse, 
  CourseResponse 
} from './courses';

export type { 
  Teacher, 
  CreateTeacherRequest, 
  UpdateTeacherRequest, 
  TeachersListResponse, 
  TeacherResponse 
} from './teachers';

// Re-export auth types for convenience
export type { LoginRequest, RegisterRequest, AuthResponse } from '../../types/auth.types';