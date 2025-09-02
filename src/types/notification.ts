// Notification system types based on Enhanced Notification System Documentation

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: { [key: string]: string | number | boolean };
  isRead: boolean;
  created_at: string;
  updated_at?: string;
  user_id?: number;
}

export type NotificationType = 
  // Core Types
  | 'class_confirmation'
  | 'leave_approval'
  | 'class_cancellation'
  | 'schedule_change'
  | 'payment_reminder'
  | 'report_deadline'
  | 'room_conflict'
  | 'general'
  // Enhanced Types
  | 'student_registration'
  | 'appointment_reminder'
  | 'class_reminder'
  | 'system_maintenance';

export type NotificationPriority = 'high' | 'medium' | 'low';

export type UserRole = 'owner' | 'admin' | 'teacher' | 'student';

export interface NotificationConfig {
  type: NotificationType;
  priority: NotificationPriority;
  requiresAction: boolean;
  expiresIn?: number;
  autoReminder: boolean;
  reminderInterval?: number;
  roles: UserRole[];
}

export interface NotificationApiResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: NotificationType;
  read?: boolean;
}

export interface SendNotificationRequest {
  type: NotificationType;
  userId?: number;
  roleTargets?: UserRole[];
  data: {
    title: string;
    [key: string]: string | number | boolean;
  };
  channels?: string[];
}

export interface NotificationIconConfig {
  emoji: string;
  bgColor: string;
  textColor: string;
}

// UI-specific notification interface for Header component
export interface UINotification {
  id: number;
  title: string;
  description: string;
  route: string;
  time: string;
  unread: boolean;
  icon: React.ReactNode;
  type: NotificationType;
  metadata?: { [key: string]: string | number | boolean };
}