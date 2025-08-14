import { api } from './api'; 
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types'; 
// Use window.localStorage directly, no import needed
 
export const authService = { 
  login: async (credentials: LoginRequest): Promise<AuthResponse> => { 
    const response = await api.post('/auth/login', credentials); 
    // เก็บ token ใน localStorage
    if (typeof window !== 'undefined' && response.data.success && response.data.data.token) {
      window.localStorage.setItem('token', response.data.data.token);
    }
    return response.data; 
  }, 

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    // เก็บ token ใน localStorage หลังจากสมัครสมาชิกสำเร็จ
    if (typeof window !== 'undefined' && response.data.success && response.data.data.token) {
      window.localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },
 
  logout: async (): Promise<void> => { 
    await api.post('/auth/logout'); 
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token'); 
    }
  },

  // ตรวจสอบว่ายังล็อกอินอยู่หรือไม่
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!window.localStorage.getItem('token');
  },

  // ดึง token ปัจจุบัน
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('token');
  },
}; 
