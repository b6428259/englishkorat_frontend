export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    VERIFY: "/auth/verify",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // User management endpoints
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: "/profile",
  },

  // Course management endpoints
  COURSES: {
    LIST: "/courses",
    CREATE: "/courses",
    GET_BY_ID: (id: string) => `/courses/${id}`,
    UPDATE: (id: string) => `/courses/${id}`,
    DELETE: (id: string) => `/courses/${id}`,
    ENROLL: (id: string) => `/courses/${id}/enroll`,
  },

  // Group management endpoints (group-based system)
  GROUPS: {
    LIST: "/groups",
    CREATE: "/groups",
    GET_BY_ID: (id: string) => `/groups/${id}`,
    UPDATE: (id: string) => `/groups/${id}`,
    DELETE: (id: string) => `/groups/${id}`,
    ADD_MEMBER: (id: string) => `/groups/${id}/members`,
    REMOVE_MEMBER: (id: string, studentId: string) =>
      `/groups/${id}/members/${studentId}`,
    UPDATE_PAYMENT: (id: string) => `/groups/${id}/payment-status`,
  },

  // Student management endpoints
  STUDENTS: {
    LIST: "/students",
    CREATE: "/students",
    GET_BY_ID: (id: string) => `/students/${id}`,
    UPDATE: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
    REGISTER: "/students/new-register",
    BY_STATUS: (status: string) => `/students/by-status/${status}`,
    EXAM_SCORES: (id: string) => `/students/${id}/exam-scores`,
  },

  // Enhanced Schedule management endpoints (Group-based system)
  SCHEDULES: {
    LIST: "/schedules",
    CREATE: "/schedules",
    GET_BY_ID: (id: string) => `/schedules/${id}`,
    UPDATE: (id: string) => `/schedules/${id}`,
    DELETE: (id: string) => `/schedules/${id}`,
    MY_SCHEDULES: "/schedules/my",
    CONFIRM: (id: string) => `/schedules/${id}/confirm`,
    TEACHERS: (dateFilter: "day" | "week" | "month") =>
      `/schedules/teachers?date_filter=${dateFilter}`,
    TEACHERS_LIST: "/schedules/teachers",
    SESSIONS: (id: string) => `/schedules/${id}/sessions`,
    SESSION_STATUS: (sessionId: string) =>
      `/schedules/sessions/${sessionId}/status`,
    MAKEUP_SESSION: "/schedules/sessions/makeup",
    COMMENTS: "/schedules/comments",
    WEEKLY: "/schedules/weekly",
    CALENDAR: "/schedules/calendar",
  },

  // System settings endpoints
  SETTINGS: {
    GET: "/settings",
    UPDATE: "/settings",
    SYSTEM: "/settings/system",
    ME: "/settings/me",
    CUSTOM_SOUND: "/settings/me/custom-sound",
  },

  // Notification endpoints (based on Enhanced Notification System Documentation)
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/mark-all-read",
    SEND: "/notifications/send",
    LOGS: "/notifications/logs",
    LOGS_SUMMARY: "/notifications/logs/summary",
    CLEANUP_STATUS: "/notifications/cleanup/status",
    CLEANUP_TRIGGER: "/notifications/cleanup/trigger",
    LOGS_ARCHIVE: "/notifications/logs/archive",
  },

  // Bills management endpoints (based on Bills System Documentation)
  BILLS: {
    LIST: "/bills",
    CREATE: "/bills",
    GET_BY_ID: (id: string) => `/bills/${id}`,
    UPDATE: (id: string) => `/bills/${id}`,
    DELETE: (id: string) => `/bills/${id}`,
    BY_TRANSACTION: (transactionId: string) =>
      `/bills/by-transaction/${transactionId}`,
    BY_INVOICE: (invoice: string) => `/bills/by-invoice/${invoice}`,
    IMPORT: "/import/bills",
  },

  // Borrowing System endpoints (based on Borrowing System Documentation)
  BORROWING: {
    // Items (Public/User)
    ITEMS: "/borrowing/items",
    ITEM_BY_ID: (id: number) => `/borrowing/items/${id}`,

    // Requests (User)
    MY_REQUESTS: "/borrowing/my-requests",
    CREATE_REQUEST: "/borrowing/requests",
    CANCEL_REQUEST: (id: number) => `/borrowing/requests/${id}/cancel`,

    // Borrows (User)
    MY_BORROWS: "/borrowing/my-borrows",
    RENEW_BORROW: (id: number) => `/borrowing/borrows/${id}/renew`,
    TRANSACTION: (id: number) => `/borrowing/transactions/${id}`,

    // Items Management (Admin)
    CREATE_ITEM: "/borrowing/items",
    UPDATE_ITEM: (id: number) => `/borrowing/items/${id}`,
    DELETE_ITEM: (id: number) => `/borrowing/items/${id}`,
    UPLOAD_IMAGE: (id: number) => `/borrowing/items/${id}/upload-image`,
    UPLOAD_PDF: (id: number) => `/borrowing/items/${id}/upload-pdf`,
    ADJUST_STOCK: (id: number) => `/borrowing/items/${id}/adjust-stock`,

    // Request Workflow (Admin)
    ALL_REQUESTS: "/borrowing/requests",
    APPROVE_REQUEST: (id: number) => `/borrowing/requests/${id}/approve`,
    REJECT_REQUEST: (id: number) => `/borrowing/requests/${id}/reject`,

    // Transaction Management (Admin)
    ALL_TRANSACTIONS: "/borrowing/transactions",
    CHECKIN: (id: number) => `/borrowing/borrows/${id}/checkin`,
    RECORD_PAYMENT: (id: number) =>
      `/borrowing/transactions/${id}/record-payment`,
    MARK_OVERDUE: "/borrowing/transactions/mark-overdue",
  },

  // Borrowing Dashboard (Admin)
  BORROW_DASHBOARD: {
    OVERVIEW: "/dashboard/borrow/overview",
    TRENDS: "/dashboard/borrow/trends",
    TOP_ITEMS: "/dashboard/borrow/top-items",
    TOP_USERS: "/dashboard/borrow/top-users",
    CATEGORIES: "/dashboard/borrow/categories",
    AUDIT_LOGS: "/dashboard/borrow/audit-logs",
  },
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
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || "English Korat",
  VERSION: "1.0.0",
  API_TIMEOUT: 10000,
  TOKEN_EXPIRY_HOURS: 2,
} as const;
