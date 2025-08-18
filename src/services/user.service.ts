import { api } from './api'; 
import { User } from '../types/auth.types'; 

interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  phone?: string;
  line_id?: string;
  role?: 'student' | 'teacher' | 'admin' | 'owner';
  branch_id?: number;
} 
 
export const userService = { 
  getUsers: async (): Promise<User[]> => { 
    const response = await api.get('/users'); 
    return response.data; 
  }, 
 
  getUserById: async (id: string): Promise<User> => { 
    const response = await api.get(`/users/${id}`); 
    return response.data; 
  }, 
 
  createUser: async (userData: CreateUserRequest): Promise<User> => { 
    const response = await api.post('/users', userData); 
    return response.data; 
  }, 
}; 
