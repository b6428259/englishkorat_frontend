// Central API exports
export { api as apiClient } from './base';
export { API_ENDPOINTS, HTTP_STATUS, APP_CONFIG } from './endpoints';

// Service exports
export { authApi } from './auth';
export { usersApi } from './users';
export { coursesApi } from './courses';
export { teachersApi } from './teachers';
export { groupService } from './groups';
export { scheduleService } from './schedules';
export { billsApi } from './bills';

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

export type {
  Bill,
  BillListParams,
  BillListResponse,
  CreateBillRequest,
  CreateBillResponse,
  UpdateBillRequest,
  ImportBillsResponse,
  BillType,
  BillStatus,
  PaymentMethod,
  BillSource,
  BillLine
} from './bills';

// Group-based scheduling types
export type {
  Group,
  GroupMember,
  Schedule,
  Session,
  ScheduleParticipant,
  ScheduleComment,
  CreateGroupRequest,
  AddGroupMemberRequest,
  UpdatePaymentStatusRequest,
  CreateScheduleRequest,
  ConfirmScheduleRequest,
  UpdateSessionStatusRequest,
  CreateMakeupSessionRequest,
  CreateCommentRequest,
  GroupResponse,
  GroupListResponse,
  ScheduleResponse,
  ScheduleListResponse,
  SessionListResponse,
  CommentListResponse
} from '../../types/group.types';

// Re-export auth types for convenience
export type { LoginRequest, RegisterRequest, AuthResponse } from '../../types/auth.types';