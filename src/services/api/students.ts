import { api } from "./base";
import { API_ENDPOINTS } from "./endpoints";

// Student interfaces
export interface Student {
  id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  first_name_en?: string;
  last_name_en?: string;
  nickname_th: string;
  nickname_en: string;
  date_of_birth: string;
  age: number;
  age_group?: string;
  gender: "male" | "female" | "other";
  address?: string;
  citizen_id?: string;
  phone: string;
  email?: string;
  line_id: string;
  grade_level?: string;
  current_education?: string;
  cefr_level?: string;
  preferred_language?: "english" | "chinese";
  language_level?: string;
  learning_style?: "private" | "pair" | "group";
  recent_cefr?: string;
  selected_courses?: number[];
  learning_goals?: string;
  preferred_branch_id?: number;
  teacher_type?: string;
  parent_name?: string;
  parent_phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferred_time_slots?: TimeSlot[];
  unavailable_time_slots?: TimeSlot[];
  availability_schedule?: TimeSlot[] | null;
  unavailable_times?: TimeSlot[] | null;
  grammar_score?: number;
  speaking_score?: number;
  listening_score?: number;
  reading_score?: number;
  writing_score?: number;
  registration_status:
    | "pending_review"
    | "schedule_exam"
    | "waiting_for_group"
    | "active";
  registration_type: "quick" | "full";
  learning_preferences?: string;
  preferred_teacher_type?: string;
  contact_source?: string;
  deposit_amount?: number;
  payment_status?: string;
  last_status_update?: string;
  days_waiting?: number;
  admin_contact?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // Nested objects from API
  user?: {
    id: number;
    username: string;
    email: string;
    phone: string;
    line_id: string;
    role: string;
    branch_id: number;
    status: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
    branch?: {
      id: number;
      name_en: string;
      name_th: string;
      code: string;
      address: string;
      phone: string;
      type: string;
      active: boolean;
      created_at: string;
      updated_at: string;
    };
  };
  preferred_branch?: {
    id: number;
    name_en: string;
    name_th: string;
    code: string;
    address: string;
    phone: string;
    type: string;
    active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface TimeSlot {
  id: string;
  day: string;
  timeFrom: string;
  timeTo: string;
}

export interface BasicInformation {
  first_name: string;
  last_name: string;
  nickname_th: string;
  nickname_en: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
}

export interface ContactInformation {
  phone: string;
  email?: string;
  line_id: string;
  address?: string;
  preferred_branch: number;
}

export interface FullInformation {
  citizen_id: string;
  first_name_en?: string;
  last_name_en?: string;
  current_education: string;
  preferred_branch: number;
  preferred_language: "english" | "chinese";
  language_level: string;
  learning_style: "private" | "pair" | "group";
  recent_cefr: string;
  selected_courses?: number[];
  learning_goals?: string;
  teacher_type: string;
  preferred_time_slots?: TimeSlot[];
  unavailable_time_slots?: TimeSlot[];
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface StudentRegistrationRequest {
  registration_type: "quick" | "full";
  basic_information: BasicInformation;
  contact_information: ContactInformation;
  full_information?: FullInformation;
}

export interface StudentRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    student_id: number;
    registration_status: "pending_review";
    registration_type: "quick" | "full";
  };
}

export interface StudentsListResponse {
  success: boolean;
  data: {
    students: Student[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface StudentResponse {
  success: boolean;
  data: {
    student: Student;
  };
}

export interface PaginatedStudentsResponse {
  students: Student[];
  total: number;
  total_pages: number;
  page: number;
  limit: number;
  status: string;
}

export interface CreateStudentRequest {
  first_name: string;
  last_name: string;
  first_name_en?: string;
  last_name_en?: string;
  nickname_th: string;
  nickname_en: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  citizen_id: string;
  phone: string;
  email?: string;
  line_id: string;
  address?: string;
  current_education: string;
  preferred_language: "english" | "chinese";
  language_level: string;
  learning_style: "private" | "pair" | "group";
  recent_cefr: string;
  selected_courses?: number[];
  learning_goals?: string;
  teacher_type: string;
  preferred_time_slots?: TimeSlot[];
  unavailable_time_slots?: TimeSlot[];
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface UpdateStudentRequest {
  first_name?: string;
  last_name?: string;
  first_name_en?: string;
  last_name_en?: string;
  nickname_th?: string;
  nickname_en?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  citizen_id?: string;
  phone?: string;
  email?: string;
  line_id?: string;
  address?: string;
  current_education?: string;
  preferred_language?: "english" | "chinese";
  language_level?: string;
  learning_style?: "private" | "pair" | "group";
  recent_cefr?: string;
  selected_courses?: number[];
  learning_goals?: string;
  teacher_type?: string;
  preferred_time_slots?: TimeSlot[];
  unavailable_time_slots?: TimeSlot[];
  emergency_contact?: string;
  emergency_phone?: string;
  registration_status?:
    | "pending_review"
    | "schedule_exam"
    | "waiting_for_group"
    | "active";
}

export interface ExamScoresRequest {
  grammar_score: number;
  speaking_score: number;
  listening_score: number;
  reading_score: number;
  writing_score: number;
}

export interface StudentsByStatusResponse {
  students: Student[];
  status: string;
  total: number;
  total_pages: number;
  page: number;
  limit: number;
}

// Helper function to normalize student data from API response
const normalizeStudent = (raw: Record<string, unknown>): Student => {
  const asString = (value: unknown): string | undefined =>
    value !== null && value !== undefined ? String(value) : undefined;

  const asNumber = (value: unknown): number | undefined => {
    const num = Number(value);
    return !isNaN(num) ? num : undefined;
  };

  const asBoolean = (value: unknown): boolean | undefined => {
    if (value === null || value === undefined) return undefined;
    return Boolean(value);
  };

  return {
    id: asNumber(raw.id) ?? 0,
    user_id: asNumber(raw.user_id),
    first_name: asString(raw.first_name) ?? "",
    last_name: asString(raw.last_name) ?? "",
    first_name_en: asString(raw.first_name_en),
    last_name_en: asString(raw.last_name_en),
    nickname_th: asString(raw.nickname_th) ?? "",
    nickname_en: asString(raw.nickname_en) ?? "",
    date_of_birth: asString(raw.date_of_birth) ?? "",
    age: asNumber(raw.age) ?? 0,
    age_group: asString(raw.age_group),
    gender: (asString(raw.gender) as Student["gender"]) ?? "other",
    address: asString(raw.address),
    citizen_id: asString(raw.citizen_id),
    phone: asString(raw.phone) ?? "",
    email: asString(raw.email),
    line_id: asString(raw.line_id) ?? "",
    grade_level: asString(raw.grade_level),
    current_education: asString(raw.current_education),
    cefr_level: asString(raw.cefr_level),
    preferred_language: asString(
      raw.preferred_language
    ) as Student["preferred_language"],
    language_level: asString(raw.language_level),
    learning_style: asString(raw.learning_style) as Student["learning_style"],
    recent_cefr: asString(raw.recent_cefr),
    selected_courses: Array.isArray(raw.selected_courses)
      ? raw.selected_courses
      : [],
    learning_goals: asString(raw.learning_goals),
    preferred_branch_id: asNumber(raw.preferred_branch_id),
    teacher_type: asString(raw.teacher_type),
    parent_name: asString(raw.parent_name),
    parent_phone: asString(raw.parent_phone),
    emergency_contact: asString(raw.emergency_contact),
    emergency_phone: asString(raw.emergency_phone),
    preferred_time_slots: Array.isArray(raw.preferred_time_slots)
      ? raw.preferred_time_slots
      : [],
    unavailable_time_slots: Array.isArray(raw.unavailable_time_slots)
      ? raw.unavailable_time_slots
      : [],
    availability_schedule: Array.isArray(raw.availability_schedule)
      ? raw.availability_schedule
      : null,
    unavailable_times: Array.isArray(raw.unavailable_times)
      ? raw.unavailable_times
      : null,
    registration_status:
      (asString(raw.registration_status) as Student["registration_status"]) ??
      "pending_review",
    registration_type:
      (asString(raw.registration_type) as Student["registration_type"]) ??
      "full",
    learning_preferences: asString(raw.learning_preferences),
    preferred_teacher_type: asString(raw.preferred_teacher_type),
    contact_source: asString(raw.contact_source),
    deposit_amount: asNumber(raw.deposit_amount) ?? 0,
    payment_status: asString(raw.payment_status),
    last_status_update: asString(raw.last_status_update),
    days_waiting: asNumber(raw.days_waiting) ?? 0,
    admin_contact: asBoolean(raw.admin_contact),
    grammar_score: asNumber(raw.grammar_score),
    speaking_score: asNumber(raw.speaking_score),
    listening_score: asNumber(raw.listening_score),
    reading_score: asNumber(raw.reading_score),
    writing_score: asNumber(raw.writing_score),
    created_at: asString(raw.created_at),
    updated_at: asString(raw.updated_at),
    deleted_at: asString(raw.deleted_at),
    // Handle nested objects
    user: raw.user
      ? {
          id: asNumber((raw.user as Record<string, unknown>).id) ?? 0,
          username:
            asString((raw.user as Record<string, unknown>).username) ?? "",
          email: asString((raw.user as Record<string, unknown>).email) ?? "",
          phone: asString((raw.user as Record<string, unknown>).phone) ?? "",
          line_id:
            asString((raw.user as Record<string, unknown>).line_id) ?? "",
          role: asString((raw.user as Record<string, unknown>).role) ?? "",
          branch_id:
            asNumber((raw.user as Record<string, unknown>).branch_id) ?? 0,
          status: asString((raw.user as Record<string, unknown>).status) ?? "",
          avatar: asString((raw.user as Record<string, unknown>).avatar),
          created_at:
            asString((raw.user as Record<string, unknown>).created_at) ?? "",
          updated_at:
            asString((raw.user as Record<string, unknown>).updated_at) ?? "",
          branch: (raw.user as Record<string, unknown>).branch
            ? {
                id:
                  asNumber(
                    (
                      (raw.user as Record<string, unknown>).branch as Record<
                        string,
                        unknown
                      >
                    ).id
                  ) ?? 0,
                name_en:
                  asString(
                    (
                      (raw.user as Record<string, unknown>).branch as Record<
                        string,
                        unknown
                      >
                    ).name_en
                  ) ?? "",
                name_th:
                  asString(
                    (
                      (raw.user as Record<string, unknown>).branch as Record<
                        string,
                        unknown
                      >
                    ).name_th
                  ) ?? "",
                code:
                  asString(
                    (
                      (raw.user as Record<string, unknown>).branch as Record<
                        string,
                        unknown
                      >
                    ).code
                  ) ?? "",
                address:
                  asString(
                    (
                      (raw.user as Record<string, unknown>).branch as Record<
                        string,
                        unknown
                      >
                    ).address
                  ) ?? "",
                phone:
                  asString(
                    (
                      (raw.user as Record<string, unknown>).branch as Record<
                        string,
                        unknown
                      >
                    ).phone
                  ) ?? "",
                type:
                  asString(
                    (
                      (raw.user as Record<string, unknown>).branch as Record<
                        string,
                        unknown
                      >
                    ).type
                  ) ?? "",
                active:
                  asBoolean(
                    (
                      (raw.user as Record<string, unknown>).branch as Record<
                        string,
                        unknown
                      >
                    ).active
                  ) ?? false,
                created_at:
                  asString(
                    (
                      (raw.user as Record<string, unknown>).branch as Record<
                        string,
                        unknown
                      >
                    ).created_at
                  ) ?? "",
                updated_at:
                  asString(
                    (
                      (raw.user as Record<string, unknown>).branch as Record<
                        string,
                        unknown
                      >
                    ).updated_at
                  ) ?? "",
              }
            : undefined,
        }
      : undefined,
    preferred_branch: raw.preferred_branch
      ? {
          id:
            asNumber((raw.preferred_branch as Record<string, unknown>).id) ?? 0,
          name_en:
            asString(
              (raw.preferred_branch as Record<string, unknown>).name_en
            ) ?? "",
          name_th:
            asString(
              (raw.preferred_branch as Record<string, unknown>).name_th
            ) ?? "",
          code:
            asString((raw.preferred_branch as Record<string, unknown>).code) ??
            "",
          address:
            asString(
              (raw.preferred_branch as Record<string, unknown>).address
            ) ?? "",
          phone:
            asString((raw.preferred_branch as Record<string, unknown>).phone) ??
            "",
          type:
            asString((raw.preferred_branch as Record<string, unknown>).type) ??
            "",
          active:
            asBoolean(
              (raw.preferred_branch as Record<string, unknown>).active
            ) ?? false,
          created_at:
            asString(
              (raw.preferred_branch as Record<string, unknown>).created_at
            ) ?? "",
          updated_at:
            asString(
              (raw.preferred_branch as Record<string, unknown>).updated_at
            ) ?? "",
        }
      : undefined,
  };
};

// New response interface matching API structure
export interface StudentsApiResponse {
  students: Student[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Filter parameters for students API
export interface StudentsFilterParams {
  page?: number;
  limit?: number;
  age_group?: "kids" | "teens" | "adults";
  cefr_level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  branch_id?: number;
  search?: string;
  status?: string;
}

export const studentsApi = {
  /**
   * Register new student (public endpoint)
   */
  registerStudent: async (
    registrationData: StudentRegistrationRequest
  ): Promise<StudentRegistrationResponse> => {
    const response = await api.post(
      API_ENDPOINTS.STUDENTS.REGISTER,
      registrationData
    );
    return response.data;
  },

  /**
   * Get list of students with optional filters
   * All query parameters are optional
   * @param params - Optional filter parameters (page, limit, age_group, cefr_level, branch_id, search, status)
   * @returns Promise<StudentsApiResponse> - Direct API response structure
   */
  getStudents: async (
    params?: StudentsFilterParams
  ): Promise<StudentsApiResponse> => {
    const queryParams: Record<string, string> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = String(value);
        }
      });
    }

    const response = await api.get(API_ENDPOINTS.STUDENTS.LIST, {
      params: queryParams,
    });
    const data = response.data;

    // Normalize students data
    const students = (data.students || []).map(normalizeStudent);

    return {
      students,
      page: data.page || 1,
      limit: data.limit || 10,
      total: data.total || 0,
      total_pages: data.total_pages || 0,
    };
  },

  /**
   * Get all students (load all pages automatically)
   * @param filters - Optional filter parameters (age_group, cefr_level, branch_id, search, status)
   * @returns Promise<Student[]> - Array of all students
   */
  getAllStudents: async (
    filters?: Omit<StudentsFilterParams, "page" | "limit">
  ): Promise<Student[]> => {
    let allStudents: Student[] = [];
    let currentPage = 1;
    const limit = 100; // Load 100 students per page

    while (true) {
      const response = await studentsApi.getStudents({
        ...filters,
        page: currentPage,
        limit,
      });

      allStudents = [...allStudents, ...response.students];

      // Check if we've loaded all students
      if (
        response.students.length < limit ||
        allStudents.length >= response.total
      ) {
        break;
      }

      currentPage++;
    }

    return allStudents;
  },

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use getStudents() instead
   */
  getStudentsList: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<StudentsListResponse> => {
    const response = await studentsApi.getStudents(params);

    return {
      success: true,
      data: {
        students: response.students,
        pagination: {
          current_page: response.page,
          per_page: response.limit,
          total: response.total,
          total_pages: response.total_pages,
        },
      },
    };
  },

  /**
   * Get students by registration status
   */
  getStudentsByStatus: async (
    status: "pending_review" | "schedule_exam" | "waiting_for_group" | "active",
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<StudentsByStatusResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.STUDENTS.BY_STATUS(status)}?${queryParams}`
      : API_ENDPOINTS.STUDENTS.BY_STATUS(status);

    const response = await api.get(url);
    const data = response.data || {};

    return {
      students: (data.students || []).map(normalizeStudent),
      status: data.status || status,
      total: data.total || 0,
      total_pages: data.total_pages || 0,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  },

  /**
   * Get single student by ID
   */
  getStudent: async (id: string): Promise<StudentResponse> => {
    const response = await api.get(API_ENDPOINTS.STUDENTS.GET_BY_ID(id));
    const data = response.data || {};
    const raw = data.student ?? data.data?.student ?? data;

    return {
      success: data.success ?? true,
      data: {
        student: normalizeStudent(raw),
      },
    };
  },

  /**
   * Create new student (admin only)
   */
  createStudent: async (
    studentData: CreateStudentRequest
  ): Promise<StudentResponse> => {
    const response = await api.post(API_ENDPOINTS.STUDENTS.CREATE, studentData);
    const data = response.data || {};
    const raw = data.student ?? data.data?.student ?? data;

    return {
      success: data.success ?? true,
      data: {
        student: normalizeStudent(raw),
      },
    };
  },

  /**
   * Update student by ID (admin only)
   */
  updateStudent: async (
    id: string,
    studentData: UpdateStudentRequest
  ): Promise<StudentResponse> => {
    const response = await api.patch(
      API_ENDPOINTS.STUDENTS.UPDATE(id),
      studentData
    );
    const data = response.data || {};
    const raw = data.student ?? data.data?.student ?? data;

    return {
      success: data.success ?? true,
      data: {
        student: normalizeStudent(raw),
      },
    };
  },

  /**
   * Delete student by ID (admin only)
   */
  deleteStudent: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(API_ENDPOINTS.STUDENTS.DELETE(id));
    return response.data;
  },

  /**
   * Record exam scores for student
   */
  recordExamScores: async (
    id: string,
    scores: ExamScoresRequest
  ): Promise<StudentResponse> => {
    const response = await api.post(
      API_ENDPOINTS.STUDENTS.EXAM_SCORES(id),
      scores
    );
    const data = response.data || {};
    const raw = data.student ?? data.data?.student ?? data;

    return {
      success: data.success ?? true,
      data: {
        student: normalizeStudent(raw),
      },
    };
  },
};
