import axios, { AxiosResponse, AxiosError } from 'axios';
import { getSecureToken, removeSecureToken } from '../../utils/secureStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = getSecureToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token and redirect to auth
      removeSecureToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    } else if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    } else if ((error.response?.status ?? 0) >= 500) {
      console.error('Server error:', error.response?.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    
    return Promise.reject(error);
  }
);

export default api;