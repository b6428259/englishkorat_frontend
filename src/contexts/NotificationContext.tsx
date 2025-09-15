import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { webSocketService } from '../services/websocket.service';
import { notificationApi } from '../services/api/notifications';
import { getSecureToken } from '@/utils/secureStorage';
import { useAuth } from './AuthContext';
import type { Notification } from '../types/notification';
import toast, { Toaster } from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const getNotificationIcon = (type: string): string => {
    const icons: Record<string, string> = {
      info: '📢',
      warning: '⚠️',
      error: '❌',
      success: '✅',
      class_confirmation: '✅',
      class_cancellation: '❌',
      schedule_change: '📅',
      payment_reminder: '💰',
      student_registration: '👨‍🎓',
      appointment_reminder: '🕐',
      class_reminder: '🎓',
      system_maintenance: '🔧',
      leave_approval: '📋',
      report_deadline: '📊',
      room_conflict: '⚠️',
      general: '📢',
    };
    return icons[type] || '📢';
  };

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    const setupWebSocketListeners = () => {
      // Connection status updates
      webSocketService.on('connection-status', (data: unknown) => {
        const statusData = data as { connected: boolean };
        setIsConnected(statusData.connected);
        if (statusData.connected) {
          toast.success('เชื่อมต่อระบบแจ้งเตือนสำเร็จ', {
        icon: '🔔',
        duration: 2000,
        position: 'bottom-right',
          });
        } else {
          toast.error('เชื่อมต่อระบบแจ้งเตือนไม่สำเร็จ', {
        icon: '❌',
        duration: 3000,
        position: 'bottom-right',
          });
        }
      });

      // New notification received
      webSocketService.on('new-notification', (notification: unknown) => {
        const newNotification = notification as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast.success(newNotification.title_th || newNotification.title, {
          icon: getNotificationIcon(newNotification.type),
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e5e5',
          },
        });
      });

      // Notification marked as read
      webSocketService.on('notification-read', (data: unknown) => {
        const readData = data as { notificationId: number };
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === readData.notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      });

      // Unread count update
      webSocketService.on('unread-count-update', (data: unknown) => {
        const countData = data as { unreadCount: number };
        setUnreadCount(countData.unreadCount);
      });
    };

    const refreshNotifications = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const response = await notificationApi.getNotifications({ page: 1, limit: 20 });
        
        // Handle both old and new API response formats
        const notificationData = 'data' in response ? response.data : response;
        const typedData = notificationData as { 
          notifications: Notification[]; 
          pagination: { total: number } 
        };
        
        setNotifications(typedData.notifications || []);
        setUnreadCount(typedData.notifications?.filter((n: Notification) => !n.read).length || 0);
        setHasMore((typedData.pagination?.total || 0) > 20);
        setPage(1);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        toast.error('ไม่สามารถโหลดการแจ้งเตือนได้', {
          icon: '❌',
          position: 'top-center',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      // Get token from secure storage (cookies) instead of localStorage
      const token = getSecureToken();
      
      if (!token) {
        console.warn('Authentication token not found for WebSocket connection');
        return;
      }
      
      // Initialize WebSocket connection
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws';
      
      webSocketService.connect(
        {
          url: wsUrl,
          options: {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          }
        },
        user.id,
        token
      );

      // Setup WebSocket event listeners
      setupWebSocketListeners();

      // Load initial notifications
      refreshNotifications();

      return () => {
        // Cleanup WebSocket listeners
        webSocketService.off('connection-status');
        webSocketService.off('new-notification');
        webSocketService.off('notification-read');
        webSocketService.off('unread-count-update');
      };
    } else {
      // Disconnect WebSocket when user is not authenticated
      webSocketService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
      setIsConnected(false);
    }
  }, [isAuthenticated, user?.id]);

  const refreshNotifications = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await notificationApi.getNotifications({ page: 1, limit: 20 });
      
      // Handle both old and new API response formats
      const notificationData = 'data' in response ? response.data : response;
      const typedData = notificationData as { 
        notifications: Notification[]; 
        pagination: { total: number } 
      };
      
      setNotifications(typedData.notifications || []);
      setUnreadCount(typedData.notifications?.filter((n: Notification) => !n.read).length || 0);
      setHasMore((typedData.pagination?.total || 0) > 20);
      setPage(1);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('ไม่สามารถโหลดการแจ้งเตือนได้', {
        icon: '❌',
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading || !isAuthenticated) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const response = await notificationApi.getNotifications({ 
        page: nextPage, 
        limit: 20 
      });
      
      // Handle both old and new API response formats
      const notificationData = 'data' in response ? response.data : response;
      const typedData = notificationData as { 
        notifications: Notification[]; 
        pagination: { total: number } 
      };
      
      const newNotifications = typedData.notifications || [];
      setNotifications(prev => [...prev, ...newNotifications]);
      setHasMore(newNotifications.length === 20);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more notifications:', error);
      toast.error('ไม่สามารถโหลดการแจ้งเตือนเพิ่มเติมได้', {
        icon: '❌',
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้', {
        icon: '❌',
        position: 'top-center',
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success('ทำเครื่องหมายว่าอ่านทั้งหมดแล้ว', {
        icon: '✅',
        position: 'top-center',
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('ไม่สามารถทำเครื่องหมายว่าอ่านทั้งหมดได้', {
        icon: '❌',
        position: 'top-center',
      });
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
