import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import type { Notification } from "../types/notification";

export interface WebSocketConfig {
  url: string;
  options?: {
    transports?: string[];
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
  };
}

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private nativeSocket: WebSocket | null = null;
  private listeners: Map<string, ((data?: unknown) => void)[]> = new Map();
  private isConnected = false;
  private userId: number | null = null;
  private transport: "socketio" | "native" | null = null;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Initialize WebSocket connection with token authentication
   * Supports both native WebSocket and socket.io-client based on URL
   */
  connect(config: WebSocketConfig, userId?: number, token?: string): void {
    if (
      this.socket?.connected ||
      this.nativeSocket?.readyState === WebSocket.OPEN
    ) {
      console.log("WebSocket already connected");
      return;
    }

    this.userId = userId || null;

    try {
      // Add token to WebSocket URL if provided (backend expects ?token=JWT)
      const wsUrl = token
        ? `${config.url}${
            config.url.includes("?") ? "&" : "?"
          }token=${encodeURIComponent(token)}`
        : config.url;

      // If the URL is a raw ws:// or wss:// endpoint, use native WebSocket
      if (wsUrl.startsWith("ws://") || wsUrl.startsWith("wss://")) {
        this.transport = "native";
        this.nativeSocket = new WebSocket(wsUrl);

        this.nativeSocket.onopen = () => {
          console.log("WebSocket connected successfully");
          this.isConnected = true;
          this.emit("connection-status", { connected: true });
        };

        this.nativeSocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            // Handle new envelope structure: { "type": "notification", "data": { ...NotificationDTO } }
            if (message && typeof message === "object") {
              if (message.type === "notification" && message.data) {
                this.handleNewNotification(message.data as Notification);
                this.emit("new-notification", message.data);
              } else if (message.id) {
                // Legacy: Backend sends NotificationDTO directly
                this.handleNewNotification(message as Notification);
                this.emit("new-notification", message);
              } else {
                // Handle other message types
                this.emit("message", message);
              }
            }
          } catch {
            console.warn("Invalid JSON message received");
            this.emit("message", event.data);
          }
        };

        this.nativeSocket.onerror = () => {
          console.error("WebSocket connection error");
          this.emit("connection-error", {
            error: "WebSocket connection error",
          });
        };

        this.nativeSocket.onclose = (ev) => {
          console.log("WebSocket connection closed");
          this.isConnected = false;
          this.emit("connection-status", {
            connected: false,
            reason: ev.reason || `Code: ${ev.code}`,
          });

          // Auto-reconnect after delay if not intentionally closed
          if (ev.code !== 1000 && ev.code !== 1001) {
            setTimeout(
              () => this.attemptReconnect(config, userId, token),
              3000
            );
          }
        };

        console.log("WebSocket connection initiated");
        return;
      }

      // For HTTP/HTTPS URLs, use socket.io-client
      // Convert HTTP URL to socket.io compatible format
      let socketIoUrl = wsUrl;
      if (wsUrl.startsWith("http://") || wsUrl.startsWith("https://")) {
        // Remove /ws path if present for socket.io
        socketIoUrl = wsUrl.replace(/\/ws(\?.*)?$/, "$1");
      }

      const socketIoOptions = {
        path: "/ws", // Backend WebSocket path
        transports: ["websocket"],
        query: token ? { token } : {},
        auth: token ? { token } : {},
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        ...config.options,
      };

      this.transport = "socketio";
      this.socket = io(socketIoUrl, socketIoOptions);

      this.setupEventListeners();
      console.log("Socket.IO connection initiated to:", socketIoUrl);
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(
    config: WebSocketConfig,
    userId?: number,
    token?: string
  ): void {
    if (this.isConnected) return;

    console.log("Attempting to reconnect WebSocket...");
    this.connect(config, userId, token);
  }

  /**
   * Setup default WebSocket event listeners for socket.io transport
   */
  private setupEventListeners(): void {
    // If we're using socket.io, wire up its events
    if (this.transport === "socketio" && this.socket) {
      // Connection events
      this.socket.on("connect", () => {
        console.log("Socket.IO WebSocket connected - authenticated with JWT");
        this.isConnected = true;
        this.emit("connection-status", { connected: true });
      });

      this.socket.on("disconnect", (reason: string) => {
        console.log("Socket.IO WebSocket disconnected:", reason);
        this.isConnected = false;
        this.emit("connection-status", { connected: false, reason });
      });

      this.socket.on("connect_error", (error: unknown) => {
        console.error("Socket.IO connection error:", error);
        const message =
          error &&
          typeof error === "object" &&
          "message" in (error as Record<string, unknown>)
            ? String((error as Record<string, unknown>).message)
            : "connect_error";
        this.emit("connection-error", { error: message });
      });

      // Listen for raw messages (backend sends envelope structure)
      this.socket.on("message", (data: unknown) => {
        try {
          // Handle new envelope structure: { "type": "notification", "data": { ...NotificationDTO } }
          if (data && typeof data === "object") {
            const message = data as Record<string, unknown>;
            if (message.type === "notification" && message.data) {
              console.log(
                "New notification received via Socket.IO envelope:",
                data
              );
              this.handleNewNotification(message.data as Notification);
              this.emit("new-notification", message.data);
            } else if ("id" in message) {
              // Legacy: Backend sends NotificationDTO directly
              console.log(
                "New notification received via Socket.IO legacy:",
                data
              );
              this.handleNewNotification(data as Notification);
              this.emit("new-notification", data);
            } else {
              this.emit("message", data);
            }
          }
        } catch (error) {
          console.error("Error handling Socket.IO message:", error);
        }
      });

      // Also listen for 'notification' event in case backend uses that
      this.socket.on("notification", (data: unknown) => {
        console.log(
          "New notification received via Socket.IO notification event:",
          data
        );
        // Handle both envelope and direct formats
        if (data && typeof data === "object") {
          const message = data as Record<string, unknown>;
          if (message.type === "notification" && message.data) {
            this.handleNewNotification(message.data as Notification);
            this.emit("new-notification", message.data);
          } else {
            this.handleNewNotification(data as Notification);
            this.emit("new-notification", data);
          }
        }
      });

      // Legacy support for wrapped payloads
      this.socket.on(
        "notification-read",
        (data: { notificationId: number; userId: number }) => {
          console.log("Notification marked as read (Socket.IO):", data);
          this.emit("notification-read", data);
        }
      );

      this.socket.on(
        "notification-count-update",
        (data: { unreadCount: number; userId: number }) => {
          console.log("Unread count updated (Socket.IO):", data);
          this.emit("unread-count-update", data);
        }
      );

      this.socket.on(
        "system-announcement",
        (data: {
          message: string;
          type: "info" | "warning" | "error";
          title?: string;
        }) => {
          console.log("System announcement (Socket.IO):", data);
          this.handleSystemAnnouncement(data);
          this.emit("system-announcement", data);
        }
      );
    }
  }

  private handleIncomingEvent(event: string, data: unknown) {
    switch (event) {
      case "notification":
      case "new-notification":
      case "notification:new":
        this.handleNewNotification(data as Notification);
        this.emit("new-notification", data);
        break;
      case "notification-read":
        this.emit("notification-read", data);
        break;
      case "notification-count-update":
      case "unread-count-update":
        this.emit("unread-count-update", data);
        break;
      case "system-announcement":
        this.handleSystemAnnouncement(
          data as {
            message: string;
            type: "info" | "warning" | "error";
            title?: string;
          }
        );
        this.emit("system-announcement", data);
        break;
      default:
        this.emit(event, data);
        break;
    }
  }

  /**
   * Handle new notification with channel-based routing and action-based UI behavior
   */
  private handleNewNotification(notification: Notification): void {
    // Get channels (defaults to ["normal"] if missing)
    const channels = notification.channels || ["normal"];
    const payload = notification.data || {};

    console.log(
      "Processing notification with action:",
      payload.action,
      "channels:",
      channels
    );

    // Always add to notifications list and increment unread count
    // This is handled by the NotificationContext

    // Handle popup notifications first (blocking modal behavior)
    if (channels.includes("popup")) {
      this.emit("popup-notification", notification);
    }

    // Handle normal channel notifications (toast/list behavior)
    if (channels.includes("normal")) {
      this.showToastNotification(notification);
    }

    // Handle action-based routing for deep-linking and UI behavior
    this.handleNotificationAction(notification);

    // Note: 'line' channel is handled server-side, no client UI required
  }

  /**
   * Show toast notification for normal channel
   */
  private showToastNotification(notification: Notification): void {
    const toastConfig = this.getToastConfig(notification.type);

    toast.success(
      `${toastConfig.emoji} ${notification.title_th || notification.title}\n${
        notification.message_th || notification.message
      }`,
      {
        duration: 5000,
        position: "top-right",
        style: {
          border: "1px solid #713200",
          padding: "16px",
          color: "#713200",
        },
        iconTheme: {
          primary: "#713200",
          secondary: "#FFFAEE",
        },
      }
    );
  }

  /**
   * Handle action-based routing for notifications
   */
  private handleNotificationAction(notification: Notification): void {
    const payload = notification.data || {};
    const action = payload.action;

    if (!action) {
      return; // No action to handle
    }

    // Emit action-specific events for the UI to handle
    switch (action) {
      case "confirm-session":
      case "open-session":
      case "review-missed-session":
        // Session-related actions
        this.emit("session-action", {
          action,
          notification,
          sessionId: payload.session_id,
          scheduleId: payload.schedule_id,
          link: payload.link,
        });
        break;

      case "confirm-participation":
        // Schedule participation actions
        this.emit("participation-action", {
          action,
          notification,
          scheduleId: payload.schedule_id,
          link: payload.link,
        });
        break;

      case "review-schedule":
        // Schedule review actions
        this.emit("schedule-action", {
          action,
          notification,
          scheduleId: payload.schedule_id,
          link: payload.link,
        });
        break;

      case "open-today-schedule":
        // Today view actions
        this.emit("schedule-navigation", {
          action,
          notification,
          target: "today",
        });
        break;

      default:
        // Generic action handler
        this.emit("notification-action", {
          action,
          notification,
          payload,
        });
        break;
    }
  }

  /**
   * Handle system announcements
   */
  private handleSystemAnnouncement(data: {
    message: string;
    type: "info" | "warning" | "error";
    title?: string;
  }): void {
    const toastFunction = {
      info: toast.success,
      warning: toast,
      error: toast.error,
    }[data.type];

    toastFunction(
      data.title ? `${data.title}: ${data.message}` : data.message,
      {
        duration: data.type === "error" ? 8000 : 4000,
        position: "top-center",
      }
    );
  }

  /**
   * Get toast configuration based on notification type
   */
  private getToastConfig(type: string): {
    emoji: string;
    bgColor: string;
    borderColor: string;
  } {
    const configs: Record<
      string,
      { emoji: string; bgColor: string; borderColor: string }
    > = {
      info: {
        emoji: "📢",
        bgColor: "bg-blue-100",
        borderColor: "border-l-4 border-blue-500",
      },
      warning: {
        emoji: "⚠️",
        bgColor: "bg-yellow-100",
        borderColor: "border-l-4 border-yellow-500",
      },
      error: {
        emoji: "❌",
        bgColor: "bg-red-100",
        borderColor: "border-l-4 border-red-500",
      },
      success: {
        emoji: "✅",
        bgColor: "bg-green-100",
        borderColor: "border-l-4 border-green-500",
      },
      class_confirmation: {
        emoji: "✅",
        bgColor: "bg-blue-100",
        borderColor: "border-l-4 border-blue-500",
      },
      class_cancellation: {
        emoji: "❌",
        bgColor: "bg-red-100",
        borderColor: "border-l-4 border-red-500",
      },
      schedule_change: {
        emoji: "📅",
        bgColor: "bg-purple-100",
        borderColor: "border-l-4 border-purple-500",
      },
      payment_reminder: {
        emoji: "💰",
        bgColor: "bg-yellow-100",
        borderColor: "border-l-4 border-yellow-500",
      },
      student_registration: {
        emoji: "👨‍🎓",
        bgColor: "bg-blue-100",
        borderColor: "border-l-4 border-blue-500",
      },
    };

    return configs[type] || configs.info;
  }

  /**
   * Add event listener
   */
  on(event: string, callback: (data?: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (data?: unknown) => void): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in WebSocket event listener for ${event}:`,
            error
          );
        }
      });
    }
  }

  /**
   * Join specific room
   */
  joinRoom(roomName: string): void {
    if (this.socket?.connected) {
      this.socket.emit("join-room", { room: roomName });
    }
  }

  /**
   * Leave specific room
   */
  leaveRoom(roomName: string): void {
    if (this.socket?.connected) {
      this.socket.emit("leave-room", { room: roomName });
    }
  }

  /**
   * Send message through WebSocket
   */
  send(event: string, data: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("WebSocket not connected. Message not sent:", {
        event,
        data,
      });
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.nativeSocket) {
      this.nativeSocket.close(1000, "Client disconnect");
      this.nativeSocket = null;
    }
    this.isConnected = false;
    this.transport = null;
    this.listeners.clear();
    console.log("WebSocket disconnected");
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Manually reconnect
   */
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else if (
      this.nativeSocket &&
      this.nativeSocket.readyState === WebSocket.CLOSED
    ) {
      // For native WebSocket, we need to recreate the connection
      console.log("Native WebSocket reconnection requires re-initialization");
    }
  }
}

// Export singleton instance
export const webSocketService = WebSocketService.getInstance();
export default webSocketService;
