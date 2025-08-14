export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone?: string;
  line_id?: string;
  role?: 'student' | 'teacher' | 'admin' | 'owner';
  branch_id?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  line_id?: string;
  role: 'student' | 'teacher' | 'admin' | 'owner';
  branch_id?: number;
  branch_name?: string;
  branch_code?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface AuthError {
  success: false;
  message: string;
}
