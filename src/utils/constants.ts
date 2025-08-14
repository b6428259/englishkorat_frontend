export const API_ENDPOINTS = { 
  USERS: '/users', 
  AUTH: { 
    LOGIN: '/auth/login', 
    LOGOUT: '/auth/logout', 
    REGISTER: '/auth/register', 
  }, 
}; 
 
export const APP_CONFIG = { 
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'My App', 
  VERSION: '1.0.0', 
}; 
