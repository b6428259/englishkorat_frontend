import { studentsApi } from './api/students';

// Re-export types and API functions for convenience
export * from './api/students';

// Main student service
export const studentService = studentsApi;