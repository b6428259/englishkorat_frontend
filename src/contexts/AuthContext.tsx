"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest, AuthResponse, UpdateProfileRequest, ChangePasswordRequest } from '../types/auth.types';
import { authApi } from '../services/api/auth';
import { useRouter } from 'next/navigation';

export type UserRole = 'student' | 'teacher' | 'admin' | 'owner';

interface ApiError {
  response?: {
    status: number;
    data?: {
      message: string;
    };
  };
  message: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasMinRole: (minRole: UserRole) => boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  student: 1,
  teacher: 2,
  admin: 3,
  owner: 4,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isAuthenticated = authApi.isAuthenticated() && user !== null;

  // Check if user has specific role(s)
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  // Check if user has minimum role level
  const hasMinRole = (minRole: UserRole): boolean => {
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
  };

  // Load user profile on app initialization
  const loadUserProfile = useCallback(async () => {
    if (!authApi.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.getProfile();
      if (response.success) {
        setUser(response.data.user);
      } else {
        // Token might be invalid, logout
        await handleLogout();
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Failed to load user profile:', apiError);
      // If unauthorized, clear auth state
      if (apiError.response?.status === 401) {
        await handleLogout();
      }
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since this should only run on mount

  // Login function
  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        router.push('/dashboard');
      }
      return response;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(userData);
      if (response.success) {
        setUser(response.data.user);
        router.push('/dashboard');
      }
      return response;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
      router.push('/auth');
    }
  };

  // Update profile function
  const updateProfile = async (data: UpdateProfileRequest): Promise<void> => {
    if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้');
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.updateProfile(data);
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password function
  const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.changePassword(data);
      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh profile function
  const refreshProfile = async (): Promise<void> => {
    if (!authApi.isAuthenticated()) return;
    
    try {
      const response = await authApi.getProfile();
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Failed to refresh profile:', apiError);
      if (apiError.response?.status === 401) {
        await handleLogout();
      }
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout: handleLogout,
    updateProfile,
    changePassword,
    refreshProfile,
    hasRole,
    hasMinRole,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
