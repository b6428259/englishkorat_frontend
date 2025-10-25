/**
 * Attendance API Service
 * Handles all attendance-related API calls for teachers and students
 */

import type {
  DailyReportParams,
  DailyReportResponse,
  GenerateSessionCodeRequest,
  GenerateSessionCodeResponse,
  GetSessionCodeResponse,
  IndividualReportParams,
  IndividualReportResponse,
  MonthlyReportParams,
  MonthlyReportResponse,
  SessionStudentListResponse,
  StudentAttendanceHistoryParams,
  StudentAttendanceHistoryResponse,
  StudentCheckInRequest,
  StudentCheckInResponse,
  TeacherAttendanceHistoryParams,
  TeacherAttendanceHistoryResponse,
  TeacherCheckInRequest,
  TeacherCheckInResponse,
  TeacherCheckOutRequest,
  TeacherCheckOutResponse,
  TeacherTodayStatusResponse,
  WeeklyReportParams,
  WeeklyReportResponse,
  YearlyReportParams,
  YearlyReportResponse,
} from "@/types/attendance.types";
import { api } from "./base";

const BASE_PATH = "/attendance";

// ==================== Teacher Attendance ====================

/**
 * Teacher Check-in
 * POST /api/attendance/teacher/check-in
 * @permissions Teacher or above
 */
export const teacherCheckIn = async (
  data: TeacherCheckInRequest
): Promise<TeacherCheckInResponse> => {
  const response = await api.post<TeacherCheckInResponse>(
    `${BASE_PATH}/teacher/check-in`,
    data
  );
  return response.data;
};

/**
 * Teacher Check-out
 * POST /api/attendance/teacher/check-out
 * @permissions Teacher or above
 */
export const teacherCheckOut = async (
  data: TeacherCheckOutRequest
): Promise<TeacherCheckOutResponse> => {
  const response = await api.post<TeacherCheckOutResponse>(
    `${BASE_PATH}/teacher/check-out`,
    data
  );
  return response.data;
};

/**
 * Get Teacher's Today Status
 * GET /api/attendance/teacher/status
 * @permissions Teacher or above
 */
export const getTeacherTodayStatus =
  async (): Promise<TeacherTodayStatusResponse> => {
    const response = await api.get<TeacherTodayStatusResponse>(
      `${BASE_PATH}/teacher/status`
    );
    return response.data;
  };

/**
 * Get Teacher's Attendance History
 * GET /api/attendance/teacher/history
 * @permissions Teacher or above
 */
export const getTeacherHistory = async (
  params?: TeacherAttendanceHistoryParams
): Promise<TeacherAttendanceHistoryResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());

  const url = queryParams.toString()
    ? `${BASE_PATH}/teacher/history?${queryParams}`
    : `${BASE_PATH}/teacher/history`;

  const response = await api.get<TeacherAttendanceHistoryResponse>(url);
  return response.data;
};

// ==================== Student Attendance ====================

/**
 * Student Check-in with Session Code
 * POST /api/attendance/student/check-in
 * @permissions Student
 */
export const studentCheckIn = async (
  data: StudentCheckInRequest
): Promise<StudentCheckInResponse> => {
  const response = await api.post<StudentCheckInResponse>(
    `${BASE_PATH}/student/check-in`,
    data
  );
  return response.data;
};

/**
 * Get Student's Attendance History
 * GET /api/attendance/student/history
 * @permissions Student
 */
export const getStudentHistory = async (
  params?: StudentAttendanceHistoryParams
): Promise<StudentAttendanceHistoryResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());

  const url = queryParams.toString()
    ? `${BASE_PATH}/student/history?${queryParams}`
    : `${BASE_PATH}/student/history`;

  const response = await api.get<StudentAttendanceHistoryResponse>(url);
  return response.data;
};

// ==================== Session Management ====================

/**
 * Generate New Session Code
 * POST /api/attendance/sessions/generate-code
 * @permissions Teacher or above
 */
export const generateSessionCode = async (
  data: GenerateSessionCodeRequest
): Promise<GenerateSessionCodeResponse> => {
  const response = await api.post<GenerateSessionCodeResponse>(
    `${BASE_PATH}/sessions/generate-code`,
    data
  );
  return response.data;
};

/**
 * Get Session Code
 * GET /api/attendance/sessions/:id/code
 * @permissions Teacher or above
 */
export const getSessionCode = async (
  sessionId: number
): Promise<GetSessionCodeResponse> => {
  const response = await api.get<GetSessionCodeResponse>(
    `${BASE_PATH}/sessions/${sessionId}/code`
  );
  return response.data;
};

/**
 * Get Student List for Session
 * GET /api/attendance/sessions/:id/students
 * @permissions Teacher or above
 */
export const getSessionStudentList = async (
  sessionId: number
): Promise<SessionStudentListResponse> => {
  const response = await api.get<SessionStudentListResponse>(
    `${BASE_PATH}/sessions/${sessionId}/students`
  );
  return response.data;
};

// ==================== Reports (Admin Only) ====================

/**
 * Get Daily Report
 * GET /api/attendance/reports/daily
 * @permissions Admin or above
 */
export const getDailyReport = async (
  params: DailyReportParams
): Promise<DailyReportResponse> => {
  const queryParams = new URLSearchParams({ date: params.date });
  if (params.branch_id)
    queryParams.append("branch_id", params.branch_id.toString());

  const response = await api.get<DailyReportResponse>(
    `${BASE_PATH}/reports/daily?${queryParams}`
  );
  return response.data;
};

/**
 * Get Weekly Report
 * GET /api/attendance/reports/weekly
 * @permissions Admin or above
 */
export const getWeeklyReport = async (
  params: WeeklyReportParams
): Promise<WeeklyReportResponse> => {
  const queryParams = new URLSearchParams({
    start_date: params.start_date,
    end_date: params.end_date,
  });
  if (params.branch_id)
    queryParams.append("branch_id", params.branch_id.toString());

  const response = await api.get<WeeklyReportResponse>(
    `${BASE_PATH}/reports/weekly?${queryParams}`
  );
  return response.data;
};

/**
 * Get Monthly Report
 * GET /api/attendance/reports/monthly
 * @permissions Admin or above
 */
export const getMonthlyReport = async (
  params: MonthlyReportParams
): Promise<MonthlyReportResponse> => {
  const queryParams = new URLSearchParams({
    year: params.year.toString(),
    month: params.month.toString(),
  });
  if (params.branch_id)
    queryParams.append("branch_id", params.branch_id.toString());

  const response = await api.get<MonthlyReportResponse>(
    `${BASE_PATH}/reports/monthly?${queryParams}`
  );
  return response.data;
};

/**
 * Get Yearly Report
 * GET /api/attendance/reports/yearly
 * @permissions Admin or above
 */
export const getYearlyReport = async (
  params: YearlyReportParams
): Promise<YearlyReportResponse> => {
  const queryParams = new URLSearchParams({
    year: params.year.toString(),
  });
  if (params.branch_id)
    queryParams.append("branch_id", params.branch_id.toString());

  const response = await api.get<YearlyReportResponse>(
    `${BASE_PATH}/reports/yearly?${queryParams}`
  );
  return response.data;
};

/**
 * Get Individual Report
 * GET /api/attendance/reports/individual
 * @permissions Admin or above
 */
export const getIndividualReport = async (
  params: IndividualReportParams
): Promise<IndividualReportResponse> => {
  const queryParams = new URLSearchParams({
    user_id: params.user_id.toString(),
    start_date: params.start_date,
    end_date: params.end_date,
  });

  const response = await api.get<IndividualReportResponse>(
    `${BASE_PATH}/reports/individual?${queryParams}`
  );
  return response.data;
};

// ==================== Service Export ====================

export const attendanceApi = {
  // Teacher
  teacherCheckIn,
  teacherCheckOut,
  getTeacherTodayStatus,
  getTeacherHistory,

  // Student
  studentCheckIn,
  getStudentHistory,

  // Session
  generateSessionCode,
  getSessionCode,
  getSessionStudentList,

  // Reports
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getYearlyReport,
  getIndividualReport,
};
