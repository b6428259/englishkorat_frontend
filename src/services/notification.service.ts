import { notificationApi } from './api/notifications';
import type { 
  Notification, 
  NotificationType
} from '../types/notification';

/**
 * Configuration for notification icons and colors based on type
 */
export interface NotificationDisplayConfig {
  emoji: string;
  bgColor: string;
  textColor: string;
}

/**
 * Higher-level notification service that handles business logic
 * and UI transformations for the Enhanced Notification System
 */
export class NotificationService {
  /**
   * Configuration for notification icons and colors based on type
   */
  private static getNotificationConfig(type: NotificationType): NotificationDisplayConfig {
    const configs: Record<NotificationType, NotificationDisplayConfig> = {
      // Backend core types
      info: {
        emoji: 'ℹ️',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600'
      },
      warning: {
        emoji: '⚠️',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600'
      },
      error: {
        emoji: '❌',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600'
      },
      success: {
        emoji: '✅',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600'
      },
      // Extended UI types
      class_confirmation: {
        emoji: '✅',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600'
      },
      leave_approval: {
        emoji: '📋',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-600'
      },
      class_cancellation: {
        emoji: '❌',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600'
      },
      schedule_change: {
        emoji: '📅',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600'
      },
      payment_reminder: {
        emoji: '💰',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600'
      },
      report_deadline: {
        emoji: '📊',
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-600'
      },
      room_conflict: {
        emoji: '⚠️',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600'
      },
      general: {
        emoji: '📢',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600'
      },
      // Enhanced Types
      student_registration: {
        emoji: '👨‍🎓',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600'
      },
      appointment_reminder: {
        emoji: '🕐',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600'
      },
      class_reminder: {
        emoji: '🎓',
        bgColor: 'bg-teal-100',
        textColor: 'text-teal-600'
      },
      system_maintenance: {
        emoji: '🔧',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600'
      }
    };

    return configs[type] || configs.general;
  }

  /**
   * Get route for notification based on type and metadata
   */
  private static getNotificationRoute(notification: Notification): string {
    const { type, metadata } = notification;
    
    switch (type) {
      case 'student_registration':
        return '/students/list';
      case 'class_reminder':
      case 'class_confirmation':
      case 'class_cancellation':
        return metadata?.classId ? `/classes/${metadata.classId}` : '/classes';
      case 'appointment_reminder':
        return metadata?.appointmentId ? `/appointments/${metadata.appointmentId}` : '/appointments';
      case 'schedule_change':
        return '/schedules';
      case 'payment_reminder':
        return '/payments';
      case 'leave_approval':
        return '/leaves';
      case 'room_conflict':
        return '/rooms';
      case 'report_deadline':
        return '/reports';
      case 'system_maintenance':
        return '/settings/system';
      default:
        return '/dashboard';
    }
  }

  /**
   * Format time ago string from ISO date
   */
  private static formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    
    return date.toLocaleDateString('th-TH');
  }

  /**
   * Transform API notification to UI notification
   */
  private static transformToUINotification(notification: Notification): Omit<{
    id: number;
    title: string;
    description: string;
    route: string;
    time: string;
    unread: boolean;
    type: NotificationType;
    metadata?: { [key: string]: string | number | boolean };
  }, 'icon'> & { 
    iconConfig: NotificationDisplayConfig 
  } {
    const config = this.getNotificationConfig(notification.type);
    
    return {
      id: notification.id,
      title: notification.title,
      description: notification.message,
      route: this.getNotificationRoute(notification),
      time: this.formatTimeAgo(notification.created_at),
      unread: !notification.isRead,
      type: notification.type,
      metadata: notification.metadata,
      iconConfig: config
    };
  }

  /**
   * Get notifications for current user
   */
  static async getNotifications(page: number = 1, limit: number = 20): Promise<{
    notifications: (Omit<{
      id: number;
      title: string;
      description: string;
      route: string;
      time: string;
      unread: boolean;
      type: NotificationType;
      metadata?: { [key: string]: string | number | boolean };
    }, 'icon'> & { iconConfig: NotificationDisplayConfig })[];
    hasMore: boolean;
    total: number;
  }> {
    try {
      const response = await notificationApi.getNotifications({ page, limit });
      
      const uiNotifications = response.notifications.map(notification => 
        this.transformToUINotification(notification)
      );

      return {
        notifications: uiNotifications,
        hasMore: response.pagination.page < Math.ceil(response.pagination.total / (response.pagination.limit || 20)),
        total: response.pagination.total
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return fallback mock data if API fails
      return this.getMockNotifications();
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const response = await notificationApi.getNotifications({ limit: 1, read: false });
      return response.pagination.total;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const response = await notificationApi.markAsRead(notificationId);
      return response.success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      const response = await notificationApi.markAllAsRead();
      return response.success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Fallback mock notifications for when API is not available
   */
  private static getMockNotifications(): {
    notifications: (Omit<{
      id: number;
      title: string;
      description: string;
      route: string;
      time: string;
      unread: boolean;
      type: NotificationType;
      metadata?: { [key: string]: string | number | boolean };
    }, 'icon'> & { iconConfig: NotificationDisplayConfig })[];
    hasMore: boolean;
    total: number;
  } {
    const mockNotifications = [
      {
        id: 1,
        title: 'มีนักเรียนใหม่',
        description: 'จอห์น สมิธ สมัครเรียนคอร์สใหม่',
        route: '/students/list',
        time: '5 นาทีที่แล้ว',
        unread: true,
        type: 'student_registration' as NotificationType,
        iconConfig: this.getNotificationConfig('student_registration')
      },
      {
        id: 2,
        title: 'อัปเดตระบบ',
        description: 'ระบบได้รับการอัปเดตเวอร์ชัน 2.1.0',
        route: '/settings/system',
        time: '1 ชั่วโมงที่แล้ว',
        unread: true,
        type: 'system_maintenance' as NotificationType,
        iconConfig: this.getNotificationConfig('system_maintenance')
      },
      {
        id: 3,
        title: 'การชำระเงิน',
        description: 'นักเรียน 3 คนชำระค่าเรียนแล้ว',
        route: '/dashboard',
        time: '3 ชั่วโมงที่แล้ว',
        unread: false,
        type: 'payment_reminder' as NotificationType,
        iconConfig: this.getNotificationConfig('payment_reminder')
      }
    ];

    return {
      notifications: mockNotifications,
      hasMore: false,
      total: mockNotifications.length
    };
  }
}