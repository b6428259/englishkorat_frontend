import { api } from './base';
import { API_ENDPOINTS } from './endpoints';
import { LoginRequest, RegisterRequest, AuthResponse, ProfileResponse, UpdateProfileRequest, ChangePasswordRequest, LoginResponse } from '../../types/auth.types';
import { setSecureToken, getSecureToken, removeSecureToken, hasValidToken } from '../../utils/secureStorage';

export const authApi = {
  /**
   * Login user with credentials
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    // Support both old and new response shapes
    // Old: { success, message, data: { user, token }}
    // New: { message, token, user }
    const respData = response.data;
    // If new shape (no success flag but has token and user at top level)
    if (!respData.success && respData.token && respData.user) {
      const lr = respData as LoginResponse;
      setSecureToken(lr.token, lr.user.id.toString());
      // normalize to old AuthResponse shape for callers
      return { success: true, message: lr.message, data: { user: lr.user, token: lr.token } } as AuthResponse;
    }

    // Fallback to existing shape
    if (respData.success && respData.data?.token) {
      setSecureToken(respData.data.token, respData.data.user.id.toString());
    }

    return respData as AuthResponse;
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    const respData = response.data;
    if (!respData.success && respData.token && respData.user) {
      const lr = respData as LoginResponse;
      setSecureToken(lr.token, lr.user.id.toString());
      return { success: true, message: lr.message, data: { user: lr.user, token: lr.token } } as AuthResponse;
    }

    if (respData.success && respData.data?.token) {
      setSecureToken(respData.data.token, respData.data.user.id.toString());
    }

    return respData as AuthResponse;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Log but don't throw - we want to clear token regardless
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear secure token
      removeSecureToken();
    }
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated: (): boolean => {
    return hasValidToken();
  },

  /**
   * Get current auth token
   */
  getToken: (): string | null => {
    return getSecureToken();
  },

  /**
   * Refresh auth token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH);
    const respData = response.data;
    if (!respData.success && respData.token && respData.user) {
      const lr = respData as LoginResponse;
      setSecureToken(lr.token, lr.user.id.toString());
      return { success: true, message: lr.message, data: { user: lr.user, token: lr.token } } as AuthResponse;
    }

    if (respData.success && respData.data?.token) {
      setSecureToken(respData.data.token, respData.data.user.id.toString());
    }

    return respData as AuthResponse;
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData: UpdateProfileRequest): Promise<ProfileResponse> => {
    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      const value = profileData[key as keyof UpdateProfileRequest];
      if (value !== undefined) {
        if (key === 'avatar' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'string') {
          formData.append(key, value);
        }
      }
    });

    const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
    return response.data;
  }
};