import { User } from "../../types/auth.types";
import { api } from "./base";
import { API_ENDPOINTS } from "./endpoints";

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  phone?: string;
  line_id?: string;
  role?: "student" | "teacher" | "admin" | "owner";
  branch_id?: number;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  phone?: string;
  line_id?: string;
  role?: "student" | "teacher" | "admin" | "owner";
  branch_id?: number;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export const usersApi = {
  /**
   * Get list of all users
   */
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    filters?: { role?: User["role"]; search?: string }
  ): Promise<UsersListResponse> => {
    const params: Record<string, string | number> = { page, limit };
    if (filters?.role) params.role = filters.role;
    if (filters?.search) params.search = filters.search;
    const response = await api.get(API_ENDPOINTS.USERS.LIST, { params });
    return response.data;
  },

  /**
   * Search users by keyword (username/email/phone)
   */
  searchUsers: async (
    keyword: string,
    page: number = 1,
    limit: number = 10,
    role?: User["role"]
  ): Promise<UsersListResponse> => {
    const response = await api.get(API_ENDPOINTS.USERS.LIST, {
      params: { page, limit, search: keyword, role },
    });
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await api.get(API_ENDPOINTS.USERS.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Create new user
   */
  createUser: async (userData: CreateUserRequest): Promise<UserResponse> => {
    const response = await api.post(API_ENDPOINTS.USERS.CREATE, userData);
    return response.data;
  },

  /**
   * Update user by ID
   */
  updateUser: async (
    id: string,
    userData: UpdateUserRequest
  ): Promise<UserResponse> => {
    const response = await api.put(API_ENDPOINTS.USERS.UPDATE(id), userData);
    return response.data;
  },

  /**
   * Delete user by ID
   */
  deleteUser: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(API_ENDPOINTS.USERS.DELETE(id));
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserResponse> => {
    const response = await api.get(API_ENDPOINTS.USERS.PROFILE);
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (userData: {
    email?: string;
    phone?: string;
  }): Promise<UserResponse> => {
    const response = await api.put(API_ENDPOINTS.USERS.PROFILE, userData);
    return response.data;
  },
};
