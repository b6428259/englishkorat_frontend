import { getSecureToken } from "@/utils/secureStorage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import NotificationPopupModal from "../components/notifications/NotificationPopupModal";
import { notificationApi } from "../services/api/notifications";
import { getScheduleDetail } from "../services/api/schedules";
import { webSocketService } from "../services/websocket.service";
import type {
  AcceptedPopupNotification,
  Notification,
} from "../types/notification";
import { useAuth } from "./AuthContext";
import { usePopupStack } from "./PopupStackContext";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  popupNotification: Notification | null;
  acceptedNotifications: AcceptedPopupNotification[];
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  acceptPopupNotification: () => Promise<void>;
  declinePopupNotification: () => Promise<void>;
  dismissPopupNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { addPopup } = usePopupStack();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [popupNotification, setPopupNotification] =
    useState<Notification | null>(null);
  const [acceptedNotifications, setAcceptedNotifications] = useState<
    AcceptedPopupNotification[]
  >([]);
  const [lastOpenedNotificationId, setLastOpenedNotificationId] = useState<
    number | null
  >(null);

  // Ref to track if initial data has been loaded to avoid dependency issues
  const hasLoadedInitialDataRef = useRef(false);

  // Track persistent invitation notifications
  const [persistentInvitations, setPersistentInvitations] = useState<
    Map<number, Notification>
  >(new Map());

  // Re-show persistent invitations on connection
  const reshowPersistentInvitations = useCallback(() => {
    persistentInvitations.forEach((notification: Notification) => {
      addPopup({
        type: "schedule-invitation",
        notification,
        priority: 100,
        persistent: true,
        onConfirm: (status) => {
          setPersistentInvitations((prev) => {
            const next = new Map(prev);
            next.delete(notification.id);
            return next;
          });
          console.log("Reshown invitation response:", status);
        },
      });
    });
  }, [persistentInvitations, addPopup, setPersistentInvitations]);
  const getNotificationIcon = (type: string): string => {
    const icons: Record<string, string> = {
      info: "📢",
      warning: "⚠️",
      error: "❌",
      success: "✅",
      class_confirmation: "✅",
      class_cancellation: "❌",
      schedule_change: "📅",
      payment_reminder: "💰",
      student_registration: "👨‍🎓",
      appointment_reminder: "🕐",
      class_reminder: "🎓",
      system_maintenance: "🔧",
      leave_approval: "📋",
      report_deadline: "📊",
      room_conflict: "⚠️",
      general: "📢",
    };
    return icons[type] || "📢";
  };

  // Action handlers for new WebSocket patterns
  const handleSessionAction = useCallback(
    (actionData: {
      action: string;
      notification: Notification;
      sessionId?: number;
      scheduleId?: number;
      link?: { href: string; method?: string };
    }) => {
      console.log("Handling session action:", actionData.action);
      // For session actions, we could:
      // 1. Auto-navigate to session detail
      // 2. Pre-load session data for faster modal display
      // 3. Show specific toast messages based on action type

      const { action, notification } = actionData;
      const actionLabels = {
        "confirm-session": "กรุณายืนยันเซสชัน",
        "open-session": "เซสชันกำลังจะเริ่ม",
        "review-missed-session": "เซสชันที่พลาด - ต้องการการตรวจสอบ",
      };

      const message =
        actionLabels[action as keyof typeof actionLabels] ||
        "มีการดำเนินการเซสชัน";
      toast(message, {
        icon: getNotificationIcon(notification.type),
        duration: 3000,
        position: "bottom-right",
      });
    },
    []
  );

  const handleParticipationAction = useCallback(
    (actionData: {
      action: string;
      notification: Notification;
      scheduleId?: number;
      link?: { href: string; method?: string };
    }) => {
      console.log("Handling participation action:", actionData.action);
      // For participation actions like schedule invitations
      toast("คุณได้รับคำเชิญเข้าร่วมตารางเรียน", {
        icon: "📋",
        duration: 4000,
        position: "bottom-right",
      });
    },
    []
  );

  const handleScheduleAction = useCallback(
    async (actionData: {
      action: string;
      notification: Notification;
      scheduleId?: number;
      link?: { href: string; method?: string };
    }) => {
      console.log("Handling schedule action:", actionData.action);

      const { action, notification, scheduleId } = actionData;

      // If we have a scheduleId, fetch full schedule details
      if (scheduleId) {
        try {
          console.log("Fetching schedule details for ID:", scheduleId);

          // Fetch full schedule details using the normalized API
          const scheduleData = await getScheduleDetail(scheduleId);
          console.log("Schedule data:", scheduleData);

          const actionMessages = {
            "schedule-invitation": `คุณได้รับเชิญเข้าร่วม "${scheduleData.schedule_name}"`,
            "schedule-assignment": `คุณได้รับมอบหมาย "${scheduleData.schedule_name}"`,
            "schedule-update": `"${scheduleData.schedule_name}" มีการเปลี่ยนแปลง`,
            "schedule-cancellation": `"${scheduleData.schedule_name}" ถูกยกเลิก`,
          };

          const message =
            actionMessages[action as keyof typeof actionMessages] ||
            `มีการดำเนินการเกี่ยวกับ "${scheduleData.schedule_name}"`;

          // Show schedule invitation popup for invitation actions
          if (action === "schedule-invitation") {
            // Add schedule data to notification for the popup to use
            const enhancedNotification = {
              ...notification,
              scheduleData,
            };

            // Add to popup stack with high priority and persistent flag
            addPopup({
              type: "schedule-invitation",
              notification: enhancedNotification,
              priority: 100, // High priority for invitations
              persistent: true, // Cannot be dismissed without response
              onConfirm: (status) => {
                // Remove from persistent tracking when user responds
                setPersistentInvitations((prev) => {
                  const next = new Map(prev);
                  next.delete(notification.id);
                  return next;
                });
                console.log("Schedule invitation response:", status);
              },
            });

            // Track as persistent invitation
            setPersistentInvitations(
              (prev) => new Map(prev.set(notification.id, enhancedNotification))
            );
          } else {
            // Show regular toast for other schedule actions
            toast(message, {
              icon: "📚",
              duration: 4000,
              position: "bottom-right",
            });
          }
        } catch (error) {
          console.error("Failed to fetch schedule details:", error);
          // Fallback to basic message without schedule name
          const fallbackMessage = "มีการแจ้งเตือนเกี่ยวกับตารางเรียน";

          if (action === "schedule-invitation") {
            // Add basic notification to popup stack even without schedule data
            addPopup({
              type: "schedule-invitation",
              notification,
              priority: 100,
              persistent: true,
              onConfirm: (status) => {
                setPersistentInvitations((prev) => {
                  const next = new Map(prev);
                  next.delete(notification.id);
                  return next;
                });
                console.log("Schedule invitation response:", status);
              },
            });

            setPersistentInvitations(
              (prev) => new Map(prev.set(notification.id, notification))
            );
          } else {
            toast(fallbackMessage, {
              icon: "📚",
              duration: 4000,
              position: "bottom-right",
            });
          }
        }
      } else {
        // Fallback for actions without scheduleId
        toast("คุณได้รับการแจ้งเตือนเกี่ยวกับตารางเรียน", {
          icon: "📚",
          duration: 4000,
          position: "bottom-right",
        });
      }
    },
    [addPopup, setPersistentInvitations]
  );

  const handleScheduleNavigation = useCallback(
    (actionData: {
      action: string;
      notification: Notification;
      target: string;
    }) => {
      console.log(
        "Handling schedule navigation:",
        actionData.action,
        actionData.target
      );
      // For navigation actions like "open-today-schedule"
      if (actionData.target === "today") {
        toast("แสดงตารางเรียนวันนี้", {
          icon: "📅",
          duration: 3000,
          position: "bottom-right",
        });
        // Could trigger navigation to /schedule with today filter
        // router.push('/schedule?view=today');
      }
    },
    []
  );

  const handleGenericAction = useCallback(
    (actionData: {
      action: string;
      notification: Notification;
      payload: Record<string, unknown>;
    }) => {
      console.log("Handling generic action:", actionData.action);
      // For any other custom actions not covered by specific handlers
      toast("การแจ้งเตือนใหม่", {
        icon: getNotificationIcon(actionData.notification.type),
        duration: 3000,
        position: "bottom-right",
      });
    },
    []
  );

  const markAsRead = useCallback(
    async (id: number) => {
      // Optimistic update: mark locally first so UI responds instantly
      const wasAlreadyRead = notifications.find((n) => n.id === id)?.read;
      if (!wasAlreadyRead) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await notificationApi.markAsRead(id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        // Revert optimistic update on failure
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, read: false } : notif
          )
        );
        setUnreadCount((prev) => prev + (wasAlreadyRead ? 0 : 1));
        toast.error("ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้", {
          icon: "❌",
          position: "top-center",
        });
      }
    },
    [notifications]
  );

  // Manual refresh function for user-triggered refresh only
  const refreshNotifications = useCallback(async () => {
    console.log("📡 Manual refreshNotifications called by user");

    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await notificationApi.getNotifications({
        page: 1,
        limit: 20,
      });

      // Handle both old and new API response formats
      const notificationData = "data" in response ? response.data : response;
      const typedData = notificationData as {
        notifications: Notification[];
        pagination: { total: number };
      };

      setNotifications(typedData.notifications || []);
      setUnreadCount(
        typedData.notifications?.filter((n: Notification) => !n.read).length ||
          0
      );
      setHasMore((typedData.pagination?.total || 0) > 20);
      setPage(1);

      // Also fetch unread count separately to ensure accuracy (only if needed)
      // Commenting out separate unread count call to reduce API load
      // try {
      //   const unreadResponse = await notificationApi.getUnreadCount();
      //   const actualUnreadCount = unreadResponse.unread_count;
      //
      //   // Only update if there's a significant difference
      //   const calculatedUnread = typedData.notifications?.filter((n: Notification) => !n.read).length || 0;
      //   if (Math.abs(actualUnreadCount - calculatedUnread) > 0) {
      //     setUnreadCount(actualUnreadCount);
      //   }
      // } catch (unreadError) {
      //   console.warn("Failed to fetch unread count separately:", unreadError);
      // }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("ไม่สามารถโหลดการแจ้งเตือนได้", {
        icon: "❌",
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load initial data only when needed (first connection)
  const loadInitialData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await notificationApi.getNotifications({
        page: 1,
        limit: 20,
      });

      const notificationData = "data" in response ? response.data : response;
      const typedData = notificationData as {
        notifications: Notification[];
        pagination: { total: number };
      };

      setNotifications(typedData.notifications || []);
      setUnreadCount(
        typedData.notifications?.filter((n: Notification) => !n.read).length ||
          0
      );
      setHasMore((typedData.pagination?.total || 0) > 20);
      setPage(1);
    } catch (error) {
      console.error("Failed to load initial notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !isAuthenticated) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const response = await notificationApi.getNotifications({
        page: nextPage,
        limit: 20,
      });

      // Handle both old and new API response formats
      const notificationData = "data" in response ? response.data : response;
      const typedData = notificationData as {
        notifications: Notification[];
        pagination: { total: number };
      };

      const newNotifications = typedData.notifications || [];
      setNotifications((prev) => [...prev, ...newNotifications]);
      setHasMore(newNotifications.length === 20);
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more notifications:", error);
      toast.error("ไม่สามารถโหลดการแจ้งเตือนเพิ่มเติมได้", {
        icon: "❌",
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, isAuthenticated, page]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success("ทำเครื่องหมายว่าอ่านทั้งหมดแล้ว", {
        icon: "✅",
        position: "top-center",
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("ไม่สามารถทำเครื่องหมายว่าอ่านทั้งหมดได้", {
        icon: "❌",
        position: "top-center",
      });
    }
  }, []);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    console.log("🔄 NotificationContext useEffect triggered:", {
      isAuthenticated,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    });

    const setupWebSocketListeners = () => {
      // Connection status updates
      webSocketService.on("connection-status", (data: unknown) => {
        const statusData = data as { connected: boolean };
        setIsConnected(statusData.connected);
        if (statusData.connected) {
          toast.success("เชื่อมต่อระบบแจ้งเตือนสำเร็จ", {
            icon: "🔔",
            duration: 2000,
            position: "bottom-right",
          });

          // Load initial notifications only when first connected and not loaded yet
          if (!hasLoadedInitialDataRef.current) {
            hasLoadedInitialDataRef.current = true;
            loadInitialData();
          }

          // Re-show any persistent invitations that haven't been responded to
          reshowPersistentInvitations();
        } else {
          toast.error("เชื่อมต่อระบบแจ้งเตือนไม่สำเร็จ", {
            icon: "❌",
            duration: 3000,
            position: "bottom-right",
          });
        }
      });

      // New notification received
      webSocketService.on("new-notification", (notification: unknown) => {
        const newNotification = notification as Notification;
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast notification (only if it's a normal channel)
        // Popup notifications are handled separately
        const channels = newNotification.channels || ["normal"];
        if (channels.includes("normal") && !channels.includes("popup")) {
          toast.success(newNotification.title_th || newNotification.title, {
            icon: getNotificationIcon(newNotification.type),
            duration: 5000,
            position: "top-right",
            style: {
              background: "#fff",
              color: "#333",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e5e5e5",
            },
          });
        }
      });

      // Popup notification received
      webSocketService.on("popup-notification", (notification: unknown) => {
        const popupNotif = notification as Notification;

        // Prevent duplicate notifications
        if (lastOpenedNotificationId === popupNotif.id) {
          console.log("Duplicate popup notification prevented:", popupNotif.id);
          return;
        }

        // Check if this is a schedule invitation
        if (popupNotif.data?.action === "confirm-participation") {
          // Add to popup stack instead of old state
          addPopup({
            type: "schedule-invitation",
            notification: popupNotif,
            priority: 100,
            persistent: true,
            onConfirm: (status) => {
              setPersistentInvitations((prev) => {
                const next = new Map(prev);
                next.delete(popupNotif.id);
                return next;
              });
              console.log("Popup invitation response:", status);
            },
          });

          setPersistentInvitations(
            (prev) => new Map(prev.set(popupNotif.id, popupNotif))
          );
        } else {
          setPopupNotification(popupNotif);
        }

        setLastOpenedNotificationId(popupNotif.id);

        // Auto-mark as read when popup is shown
        markAsRead(popupNotif.id).catch((error) => {
          console.error(
            "Failed to auto-mark popup notification as read:",
            error
          );
        });
      });

      // Notification marked as read
      webSocketService.on("notification-read", (data: unknown) => {
        const readData = data as { notificationId: number };
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === readData.notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });

      // Unread count update
      webSocketService.on("unread-count-update", (data: unknown) => {
        const countData = data as { unreadCount: number };
        setUnreadCount(countData.unreadCount);
      });

      // Action-based routing handlers from new WebSocket patterns
      webSocketService.on("session-action", (data: unknown) => {
        const actionData = data as {
          action: string;
          notification: Notification;
          sessionId?: number;
          scheduleId?: number;
          link?: { href: string; method?: string };
        };
        handleSessionAction(actionData);
      });

      webSocketService.on("participation-action", (data: unknown) => {
        const actionData = data as {
          action: string;
          notification: Notification;
          scheduleId?: number;
          link?: { href: string; method?: string };
        };
        handleParticipationAction(actionData);
      });

      webSocketService.on("schedule-action", (data: unknown) => {
        const actionData = data as {
          action: string;
          notification: Notification;
          scheduleId?: number;
          link?: { href: string; method?: string };
        };
        handleScheduleAction(actionData);
      });

      webSocketService.on("schedule-navigation", (data: unknown) => {
        const actionData = data as {
          action: string;
          notification: Notification;
          target: string;
        };
        handleScheduleNavigation(actionData);
      });

      webSocketService.on("notification-action", (data: unknown) => {
        const actionData = data as {
          action: string;
          notification: Notification;
          payload: Record<string, unknown>;
        };
        handleGenericAction(actionData);
      });
    };

    if (isAuthenticated && user?.id) {
      // Get token from secure storage (cookies) instead of localStorage
      const token = getSecureToken();

      if (!token) {
        console.warn("Authentication token not found for WebSocket connection");
        return;
      }

      // Initialize WebSocket connection
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/ws";

      webSocketService.connect(
        {
          url: wsUrl,
          options: {
            transports: ["websocket", "polling"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          },
        },
        user.id,
        token
      );

      // Setup WebSocket event listeners
      setupWebSocketListeners();

      // WebSocket will provide all notifications via real-time events
      // No need to load initial notifications from API

      return () => {
        // Cleanup WebSocket listeners
        webSocketService.off("connection-status");
        webSocketService.off("new-notification");
        webSocketService.off("popup-notification");
        webSocketService.off("notification-read");
        webSocketService.off("unread-count-update");
        webSocketService.off("session-action");
        webSocketService.off("participation-action");
        webSocketService.off("schedule-action");
        webSocketService.off("schedule-navigation");
        webSocketService.off("notification-action");
      };
    } else {
      // Disconnect WebSocket when user is not authenticated
      webSocketService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
      setIsConnected(false);
      // Reset initial data loading flag
      hasLoadedInitialDataRef.current = false;
    }
  }, [
    isAuthenticated,
    user?.id,
    markAsRead,
    handleSessionAction,
    handleParticipationAction,
    handleScheduleAction,
    handleScheduleNavigation,
    handleGenericAction,
    lastOpenedNotificationId,
    loadInitialData,
    addPopup,
    setPersistentInvitations,
    reshowPersistentInvitations,
  ]);

  const acceptPopupNotification = async () => {
    if (!popupNotification) return;

    try {
      // Add to accepted notifications first
      const acceptedNotification: AcceptedPopupNotification = {
        ...popupNotification,
        acceptedAt: new Date().toISOString(),
        popupStatus: "accepted",
      };
      setAcceptedNotifications((prev) => [acceptedNotification, ...prev]);

      // Mark notification as read when accepted (if not already marked)
      if (!popupNotification.read) {
        await markAsRead(popupNotification.id);
      }

      setPopupNotification(null);
      toast.success("การแจ้งเตือนได้รับการยอมรับแล้ว", {
        icon: "✅",
        position: "top-center",
      });
    } catch (error) {
      console.error("Failed to accept notification:", error);
      toast.error("ไม่สามารถยอมรับการแจ้งเตือนได้", {
        icon: "❌",
        position: "top-center",
      });
    }
  };

  const declinePopupNotification = async () => {
    if (!popupNotification) return;

    try {
      // Mark notification as read when declined (if not already marked)
      if (!popupNotification.read) {
        await markAsRead(popupNotification.id);
      }

      setPopupNotification(null);
      toast.success("การแจ้งเตือนได้รับการปฏิเสธแล้ว", {
        icon: "❌",
        position: "top-center",
      });
    } catch (error) {
      console.error("Failed to decline notification:", error);
      toast.error("ไม่สามารถปฏิเสธการแจ้งเตือนได้", {
        icon: "❌",
        position: "top-center",
      });
    }
  };

  const dismissPopupNotification = () => {
    setPopupNotification(null);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    popupNotification,
    acceptedNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore,
    acceptPopupNotification,
    declinePopupNotification,
    dismissPopupNotification,
  };

  // Update the useEffect dependency array to include addPopup
  useEffect(() => {
    return () => {
      // Clean up persistent invitations on logout
      if (!isAuthenticated) {
        setPersistentInvitations(new Map());
      }
    };
  }, [isAuthenticated, setPersistentInvitations]);

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Popup notification modal */}
      {/* Regular popup notifications */}
      {popupNotification && (
        <NotificationPopupModal
          notification={popupNotification}
          isOpen={true}
          onAccept={acceptPopupNotification}
          onDecline={declinePopupNotification}
        />
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
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
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

export default NotificationContext;
