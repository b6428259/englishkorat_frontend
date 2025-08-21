import { api } from './base';
import { API_ENDPOINTS } from './endpoints';
import { LoginRequest, RegisterRequest, AuthResponse, ProfileResponse, UpdateProfileRequest, ChangePasswordRequest } from '../../types/auth.types';
import { setSecureToken, getSecureToken, removeSecureToken, hasValidToken } from '../../utils/secureStorage';

export const authApi = {
  /**
   * Login user with credentials
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Store encrypted token in secure cookies
    if (response.data.success && response.data.data.token) {
      setSecureToken(response.data.data.token, response.data.data.user.id.toString());
    }
    
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    
    // Store encrypted token in secure cookies after successful registration
    if (response.data.success && response.data.data.token) {
      setSecureToken(response.data.data.token, response.data.data.user.id.toString());
    }
    
    return response.data;
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
    
    if (response.data.success && response.data.data.token) {
      setSecureToken(response.data.data.token, response.data.data.user.id.toString());
    }
    
    return response.data;
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