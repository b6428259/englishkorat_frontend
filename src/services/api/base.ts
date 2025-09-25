import { getSecureToken } from "@/utils/secureStorage";
import axios, { AxiosError, AxiosRequestHeaders, AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = getSecureToken();
    // Ensure headers object exists with correct Axios type
    if (!config.headers) config.headers = {} as AxiosRequestHeaders;
    if (token) {
      // Prefer setting Authorization on the request headers
      (config.headers as AxiosRequestHeaders)[
        "Authorization"
      ] = `Bearer ${token}`;
      // Also set default header on axios instance so future requests include it
      api.defaults.headers.common =
        (api.defaults.headers.common as unknown as AxiosRequestHeaders) || {};
      (api.defaults.headers.common as AxiosRequestHeaders)[
        "Authorization"
      ] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Helpers for setting/clearing auth token programmatically (e.g., after login/logout)
export const setAuthToken = (token: string | null) => {
  const defaults = api.defaults.headers
    .common as unknown as AxiosRequestHeaders;
  if (token) {
    api.defaults.headers.common = defaults || {};
    (api.defaults.headers.common as AxiosRequestHeaders)[
      "Authorization"
    ] = `Bearer ${token}`;
  } else {
    if (api.defaults.headers.common)
      delete (api.defaults.headers.common as AxiosRequestHeaders)[
        "Authorization"
      ];
  }
};

export const clearAuthToken = () => setAuthToken(null);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Let callers/AuthContext handle 401 to avoid clearing tokens during refresh
    } else if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);
    } else if ((error.response?.status ?? 0) >= 500) {
      console.error("Server error:", error.response?.data);
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    }

    return Promise.reject(error);
  }
);

export default api;
