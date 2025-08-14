import { api } from './api'; 
import { User, CreateUserRequest } from '../types/user.types'; 
 
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
