import api from './base';
import { API_ENDPOINTS } from './endpoints';
import type { 
  NotificationApiResponse, 
  NotificationFilters, 
  SendNotificationRequest
} from '../../types/notification';

export const notificationApi = {
  /**
   * Get user's notifications with filtering and pagination
   */
  getNotifications: async (filters: NotificationFilters = {}): Promise<NotificationApiResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.read !== undefined) params.append('read', filters.read.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.NOTIFICATIONS.LIST}?${queryString}` : API_ENDPOINTS.NOTIFICATIONS.LIST;
    
    const response = await api.get<NotificationApiResponse>(url);
    return response.data;
  },

  /**
   * Mark a specific notification as read
   */
  markAsRead: async (notificationId: number): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId.toString())
    );
    return response.data;
  },

  /**
   * Mark all user's notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );
    return response.data;
  },

  /**
   * Send notification to specific user(s) or role(s) - Admin/Owner only
   */
  sendNotification: async (request: SendNotificationRequest): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>(
      API_ENDPOINTS.NOTIFICATIONS.SEND,
      request
    );
    return response.data;
  },

  /**
   * Get notification logs - Owner only
   */
  getLogs: async (filters: {
    startDate?: string;
    endDate?: string;
    userId?: number;
    type?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; data: { logs: unknown[]; pagination: unknown } }> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.NOTIFICATIONS.LOGS}?${queryString}` : API_ENDPOINTS.NOTIFICATIONS.LOGS;
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get cleanup status and database statistics - Owner only
   */
  getCleanupStatus: async (): Promise<{ 
    success: boolean; 
    data: { 
      isRunning: boolean; 
      lastCleanup: string; 
      totalNotifications: number;
      notificationsByType: Record<string, number>;
      ageDistribution: Record<string, number>;
      config: Record<string, unknown>;
    } 
  }> => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.CLEANUP_STATUS);
    return response.data;
  },

  /**
   * Manually trigger notification cleanup - Owner only
   */
  triggerCleanup: async (params?: { type?: string; retentionDays?: number }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.CLEANUP_TRIGGER, params || {});
    return response.data;
  },

  /**
   * Manually trigger log archival to S3 - Owner only
   */
  archiveLogs: async (params?: { targetDate?: string }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.LOGS_ARCHIVE, params || {});
    return response.data;
  }
};

export default notificationApi;