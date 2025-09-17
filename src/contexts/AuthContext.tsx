"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest, AuthResponse, UpdateProfileRequest, ChangePasswordRequest } from '../types/auth.types';
import { authApi } from '../services/api/auth';
import { removeSecureToken, getSecureToken } from '@/utils/secureStorage';
import { useRouter } from 'next/navigation';
import { ENV_CONFIG } from '@/utils/config';
import { API_ENDPOINTS } from '../services/api/endpoints';

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
      const token = getSecureToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      const url = `${ENV_CONFIG.API.BASE_URL}${API_ENDPOINTS.USERS.PROFILE}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      if (res.status === 401) {
        await handleLogout(true);
        return;
      }
      if (!res.ok) {
        console.warn('Profile fetch failed with status:', res.status);
      } else {
        const json = await res.json();
        const fetchedUser = (json?.user || json?.data?.user || json?.data || json) as User;
        if (fetchedUser && typeof fetchedUser === 'object' && 'id' in fetchedUser) {
          setUser(fetchedUser);
        } else {
          console.warn('Profile response not in expected shape; skipping user update.');
        }
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
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!authApi.isAuthenticated()) return;

    try {
      const token = getSecureToken();
      if (!token) return;
      const url = `${ENV_CONFIG.API.BASE_URL}${API_ENDPOINTS.USERS.PROFILE}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      if (res.status === 401) {
        await handleLogout(true);
        return;
      }
      if (res.ok) {
        const json = await res.json();
        const fetchedUser = (json?.user || json?.data?.user || json?.data || json) as User;
        if (fetchedUser && typeof fetchedUser === 'object' && 'id' in fetchedUser) {
          setUser(fetchedUser);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to refresh profile:', err);
    }
  }, [handleLogout]);

  // Initialize auth state on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Revalidate profile on focus/visibility/online and periodically (every ~10 minutes)
  useEffect(() => {
    if (!authApi.isAuthenticated()) return;

    const revalidate = () => {
      refreshProfile();
    };

    // Focus and visibility
    const onFocus = () => revalidate();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') revalidate();
    };
    const onOnline = () => revalidate();

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);

    // Interval between 5–15 minutes; choose 10 minutes
    const intervalMs = 10 * 60 * 1000;
    const intervalId = window.setInterval(revalidate, intervalMs);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
      window.clearInterval(intervalId);
    };
  }, [refreshProfile]);

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
