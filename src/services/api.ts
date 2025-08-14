import axios from 'axios'; 
 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'; 
 
export const api = axios.create({ 
  baseURL: API_BASE_URL, 
  headers: { 
    'Content-Type': 'application/json', 
  }, 
}); 
 
// Request interceptor for adding auth token 
api.interceptors.request.use( 
  (config) => { 
    const token = localStorage.getItem('token'); 
    if (token) { 
      config.headers.Authorization = `Bearer ${token}`; 
    } 
    return config; 
  }, 
  (error) => Promise.reject(error) 
); 

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ถ้า token หมดอายุหรือไม่ valid ให้ลบออกและ redirect ไป login
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
); 
