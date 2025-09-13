import { api } from './base';

// Normalized teacher shape used across the app
export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  nickname?: string;
  nationality?: string | null;
  teacher_type: 'Both' | 'Kid' | 'Adults' | 'Admin Team';
  hourly_rate?: number | null;
  specializations?: string | null;
  certifications?: string | null;
  active: number; // 1 or 0
  username?: string;
  email?: string | null;
  phone?: string | null;
  line_id?: string | null;
  status?: 'active' | 'inactive';
  branch_id?: number;
  branch_name?: string;
  branch_code?: string;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
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
    teacher: Teacher;
  };
}

export interface CreateTeacherRequest {
  first_name: string;
  last_name?: string;
  nickname: string;
  nationality?: string;
  teacher_type: 'Both' | 'Kid' | 'Adults' | 'Admin Team';
  hourly_rate?: number;
  specializations?: string[];
  certifications?: string[];
  username: string;
  password: string;
  email?: string;
  phone?: string;
  line_id?: string;
  branch_id: number;
  active?: boolean;
  avatar?: File;
}

export interface UpdateTeacherRequest {
  first_name?: string;
  last_name?: string;
  nickname?: string;
  nationality?: string;
  teacher_type?: 'Both' | 'Kid' | 'Adults' | 'Admin Team';
  hourly_rate?: number | null;
  specializations?: string[];
  certifications?: string[];
  email?: string;
  phone?: string;
  line_id?: string;
  active?: boolean;
  branch_id?: number;
}

// Helper to normalize API teacher object to our Teacher interface
const isRecord = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const asString = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const asNumber = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);
const asBoolean = (v: unknown): boolean | undefined => (typeof v === 'boolean' ? v : undefined);

const isTeacherType = (v: unknown): v is Teacher['teacher_type'] => {
  return typeof v === 'string' && ['Both', 'Kid', 'Adults', 'Admin Team'].includes(v);
};

const normalizeTeacher = (raw: unknown): Teacher => {
  const r = isRecord(raw) ? raw : {};

  const id = asNumber(r['id']) ?? asNumber(r['user_id']) ?? asNumber(isRecord(r['user']) ? r['user']['id'] : undefined) ?? 0;

  const first_name = asString(r['first_name']) ?? asString(r['first_name_en']) ?? asString(isRecord(r['name']) ? r['name']['first_en'] : undefined) ?? '';
  const last_name = asString(r['last_name']) ?? asString(r['last_name_en']) ?? asString(isRecord(r['name']) ? r['name']['last_en'] : undefined) ?? '';
  const nickname = asString(r['nickname']) ?? asString(r['nickname_en']) ?? asString(isRecord(r['name']) ? r['name']['nickname_en'] : undefined) ?? '';

  const user = isRecord(r['user']) ? r['user'] : {};
  const branch = isRecord(r['branch']) ? r['branch'] : {};

  const rawActive = asBoolean(r['active']);
  const rawActiveNum = asNumber(r['active']);
  const active = rawActive !== undefined ? (rawActive ? 1 : 0) : (rawActiveNum ?? 0);

  const tt = r['teacher_type'];
  const teacher_type = isTeacherType(tt) ? tt : 'Both';

  return {
    id,
    first_name,
    last_name,
    nickname,
    nationality: asString(r['nationality']) ?? null,
    teacher_type,
    hourly_rate: asNumber(r['hourly_rate']) ?? null,
    specializations: asString(r['specializations']) ?? null,
    certifications: asString(r['certifications']) ?? null,
    active,
    username: asString(user['username']) ?? asString(r['username']) ?? undefined,
    email: asString(user['email']) ?? asString(r['email']) ?? null,
    phone: asString(user['phone']) ?? asString(r['phone']) ?? null,
    line_id: asString(user['line_id']) ?? asString(r['line_id']) ?? null,
    status: (asString(r['status']) as Teacher['status']) ?? undefined,
    branch_id: asNumber(branch['id']) ?? asNumber(r['branch_id']) ?? undefined,
    branch_name: asString(branch['name_th']) ?? asString(branch['name_en']) ?? asString(r['branch_name']) ?? undefined,
    branch_code: asString(branch['code']) ?? asString(r['branch_code']) ?? undefined,
    created_at: asString(r['created_at']) ?? undefined,
    updated_at: asString(r['updated_at']) ?? null,
    deleted_at: asString(r['deleted_at']) ?? null,
    avatar: asString(user['avatar']) ?? asString(r['avatar']) ?? undefined,
  };
};

export const teachersApi = {
  /**
   * Get list of all teachers with pagination
   * Accepts new API shape and returns the normalized TeachersListResponse
   */
  getTeachers: async (page = 1, limit = 10): Promise<TeachersListResponse> => {
    const response = await api.get('/teachers', {
      params: { page, limit }
    });

    // New API returns { pagination: { limit, page, total }, teachers: [...] }
    const data = response.data || {};
    const rawTeachers = data.teachers ?? [];

  const teachers = rawTeachers.map((t: unknown) => normalizeTeacher(t));

    const paginationRaw = data.pagination || { page, limit, total: teachers.length };
    const per_page = paginationRaw.limit ?? limit;
    const current_page = paginationRaw.page ?? page;
    const total = paginationRaw.total ?? teachers.length;
    const total_pages = per_page > 0 ? Math.ceil(total / per_page) : 1;

    return {
      success: true,
      data: {
        teachers,
        pagination: {
          current_page,
          per_page,
          total,
          total_pages,
        }
      }
    };
  },

  /**
   * Get teacher by ID
   * Accepts new API shape and returns normalized TeacherResponse
   */
  getTeacherById: async (id: string): Promise<TeacherResponse> => {
    const response = await api.get(`/teachers/${id}`);
    const data = response.data || {};
    const raw = data.teacher ?? data;

    return {
      success: true,
      data: {
        teacher: normalizeTeacher(raw),
      }
    };
  },

  /** Create new teacher */
  createTeacher: async (teacherData: FormData): Promise<TeacherResponse> => {
    const response = await api.post('/teachers/register', teacherData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = response.data || {};
    const raw = data.teacher ?? data;
    return { success: true, data: { teacher: normalizeTeacher(raw) } };
  },

  /** Update teacher by ID */
  updateTeacher: async (id: string, teacherData: UpdateTeacherRequest): Promise<TeacherResponse> => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    const data = response.data || {};
    const raw = data.teacher ?? data;
    return { success: true, data: { teacher: normalizeTeacher(raw) } };
  },

  /** Update teacher avatar */
  updateTeacherAvatar: async (id: string, avatarData: FormData): Promise<TeacherResponse> => {
    const response = await api.put(`/teachers/${id}/avatar`, avatarData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = response.data || {};
    const raw = data.teacher ?? data;
    return { success: true, data: { teacher: normalizeTeacher(raw) } };
  },

  /** Delete teacher by ID */
  deleteTeacher: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },
};
