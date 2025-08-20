import { api } from './base';
import { API_ENDPOINTS } from './endpoints';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../types/auth.types';
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
  }
};