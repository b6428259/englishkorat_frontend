import api from './base';
import { API_ENDPOINTS } from './endpoints';
import type {
  NotificationApiResponse,
  NotificationFilters,
  SendNotificationRequest,
  Notification
} from '../../types/notification';

export const notificationApi = {
  /**
   * Get user's notifications with filtering and pagination
   * Backend: GET /api/notifications?page=1&limit=20&read=true|false&type=info
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
   * Get single notification by ID
   * Backend: GET /api/notifications/:id
   */
  getNotification: async (id: number): Promise<Notification> => {
    const response = await api.get<Notification>(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${id}`);
    return response.data;
  },

  /**
   * Mark a specific notification as read
   * Backend: POST /api/notifications/:id/mark-read
   */
  markAsRead: async (notificationId: number): Promise<{ success: boolean }> => {
    const response = await api.patch<{ success: boolean }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId.toString())
    );
    return response.data;
  },

  /**
   * Mark all user's notifications as read
   * Backend: POST /api/notifications/mark-all-read
   */
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );
    return response.data;
  },

  /**
   * Get unread notification count
   * Backend: GET /notifications/unread-count
   */
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await api.get<{ unread_count: number }>('/notifications/unread-count');
    return response.data;
  },

  /**
   * Send notification - Admin only
   * Backend: POST /api/notifications
   * Body: { user_id, user_ids[], role, branch_id, title, title_th, message, message_th, type }
   */
  sendNotification: async (request: SendNotificationRequest): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>(
      API_ENDPOINTS.NOTIFICATIONS.SEND,
      request
    );
    return response.data;
  },

  /**
   * Send notification to single user - Admin only
   */
  sendToUser: async (data: {
    user_id: number;
    title: string;
    title_th?: string;
    message: string;
    message_th?: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>(
      API_ENDPOINTS.NOTIFICATIONS.SEND,
      data
    );
    return response.data;
  },

  /**
   * Send notification to multiple users - Admin only
   */
  sendToUsers: async (data: {
    user_ids: number[];
    title: string;
    title_th?: string;
    message: string;
    message_th?: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>(
      API_ENDPOINTS.NOTIFICATIONS.SEND,
      data
    );
    return response.data;
  },

  /**
   * Send notification to users by role - Admin only
   */
  sendToRole: async (data: {
    role: 'owner' | 'admin' | 'teacher' | 'student';
    branch_id?: number;
    title: string;
    title_th?: string;
    message: string;
    message_th?: string;
    type: 'info' | 'warning' | 'error' | 'success';
  }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post<{ success: boolean; message?: string }>(
      API_ENDPOINTS.NOTIFICATIONS.SEND,
      data
    );
    return response.data;
  }
};

export default notificationApi;
