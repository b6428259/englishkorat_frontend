"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest, AuthResponse, UpdateProfileRequest, ChangePasswordRequest, ProfileResponse } from '../types/auth.types';
import { authApi } from '../services/api/auth';
import { removeSecureToken } from '../utils/secureStorage';
import { useRouter } from 'next/navigation';

export type UserRole = 'student' | 'teacher' | 'admin' | 'owner';

// Type guard for API errors
interface ApiError {
  response?: {
    status: number;
    data?: {
      message: string;
    };
  };
  message?: string;
}

function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === 'object' &&
    ('response' in error || 'message' in error)
  );
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

  // Consider user authenticated if a valid token exists.
  // The profile may still be loading/populating `user` after refresh.
  const isAuthenticated = authApi.isAuthenticated();

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

  // Logout function
  const handleLogout = useCallback(async (localOnly: boolean = false) => {
    setIsLoading(true);
    try {
      if (!localOnly) {
        await authApi.logout();
      } else {
        // Clear only client-side token/caches
        removeSecureToken();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
      router.push('/auth');
    }
  }, [router]);

  // Load user profile on app initialization
  const loadUserProfile = useCallback(async () => {
    if (!authApi.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response: ProfileResponse = await authApi.getProfile();
      if (response?.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        // Don't logout on non-401/unknown shapes; keep token and let app continue
        console.warn('Profile response not in expected shape; skipping logout.');
      }
    } catch (err: unknown) {
      console.error('Failed to load user profile:', err);
      // If unauthorized, clear auth state
      if (isApiError(err) && err.response?.status === 401) {
        await handleLogout(true); // local-only on 401
      }
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  // Login function
  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      // response may be normalized AuthResponse or already normalized by service
      if (response && (response as AuthResponse).data && (response as AuthResponse).data.user) {
        setUser((response as AuthResponse).data.user);
        router.push('/dashboard');
      }
      return response;
    } catch (err: unknown) {
      const errorMessage = (isApiError(err) && err.response?.data?.message) || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
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
      const errorMessage = (isApiError(err) && err.response?.data?.message) || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
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
      const errorMessage = (isApiError(err) && err.response?.data?.message) || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์';
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
      const errorMessage = (isApiError(err) && err.response?.data?.message) || 
        (err instanceof Error ? err.message : '') || 
        'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
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
      console.error('Failed to refresh profile:', err);
      if (isApiError(err) && err.response?.status === 401) {
        await handleLogout(true);
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
