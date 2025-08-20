export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout', 
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify'
  },
  
  // User management endpoints
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile'
  },
  
  // Course management endpoints
  COURSES: {
    LIST: '/courses',
    CREATE: '/courses',
    GET_BY_ID: (id: string) => `/courses/${id}`,
    UPDATE: (id: string) => `/courses/${id}`,
    DELETE: (id: string) => `/courses/${id}`,
    ENROLL: (id: string) => `/courses/${id}/enroll`
  },
  
  // Student management endpoints
  STUDENTS: {
    LIST: '/students',
    CREATE: '/students',
    GET_BY_ID: (id: string) => `/students/${id}`,
    UPDATE: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
    REGISTER: '/students/register'
  },
  
  // Schedule management endpoints
  SCHEDULES: {
    LIST: '/schedules',
    CREATE: '/schedules',
    GET_BY_ID: (id: string) => `/schedules/${id}`,
    UPDATE: (id: string) => `/schedules/${id}`,
    DELETE: (id: string) => `/schedules/${id}`
  },
  
  // System settings endpoints
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
    SYSTEM: '/settings/system'
  }
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'English Korat',
  VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  TOKEN_EXPIRY_HOURS: 2
} as const;