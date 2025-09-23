// Notification system types based on Backend NotificationDTO
// Updated to match Go backend specification

export interface User {
  id: number;
  first_name_en: string;
  first_name_th: string;
  last_name_en: string;
  last_name_th: string;
}

export interface Branch {
  id: number;
  name_en: string;
  name_th: string;
}

export interface Sender {
  type: "system" | "user";
  id?: number;
  name: string;
}

export interface Recipient {
  type: "user";
  id: number;
}

// NotificationDTO - matches backend exactly
export interface Notification {
  id: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  user_id: number; // recipient user ID
  title: string;
  title_th?: string; // optional Thai title
  message: string;
  message_th?: string; // optional Thai message
  type: NotificationType; // Use the full NotificationType enum
  channels: NotificationChannel[]; // Delivery channels (defaults to ["normal"] if missing)
  read: boolean;
  read_at?: string; // ISO timestamp, optional
  user: User; // recipient user details
  branch: Branch; // branch information
  sender: Sender; // who sent the notification
  recipient: Recipient; // recipient details

  // Actionable notification data - updated to match new WebSocket patterns
  data?: {
    // Link for API calls (required for actionable notifications)
    link?: {
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      href: string; // e.g., "/api/schedules/sessions/2051"
    };
    // Action type for UI routing and button display
    action?:
      | "confirm-session" // New session created - show confirm/decline
      | "open-session" // Upcoming session reminder - show open button
      | "review-missed-session" // Missed session alert - show review button
      | "confirm-participation" // Schedule invitation - show confirm/decline participation
      | "review-schedule" // Teacher assigned to new class - show review sessions
      | "open-today-schedule" // Daily schedule reminder - show today view
      | string; // Allow other custom actions
    // Session/Schedule IDs for direct reference
    session_id?: number;
    schedule_id?: number;
    // Reminder timing (for upcoming session reminders)
    reminder_before_minutes?: number; // 5, 30, 60 minutes before start
    // Legacy support
    resource?: {
      type: string; // e.g., "session"
      id: number;
    };
  };

  // Legacy fields for backward compatibility
  isRead?: boolean; // maps to `read`
  metadata?: { [key: string]: string | number | boolean };
}

export type NotificationType =
  // Backend core types
  | "info"
  | "warning"
  | "error"
  | "success"
  // Extended types for UI categorization
  | "class_confirmation"
  | "leave_approval"
  | "class_cancellation"
  | "schedule_change"
  | "payment_reminder"
  | "report_deadline"
  | "room_conflict"
  | "general"
  | "student_registration"
  | "appointment_reminder"
  | "class_reminder"
  | "system_maintenance";

export type NotificationChannel =
  | "normal" // Add to notifications list and increment unread count
  | "popup" // Show immediate modal/dialog with Accept/Decline buttons
  | "line"; // LINE delivery hint (server-side only)

export type NotificationPriority = "high" | "medium" | "low";

export type UserRole = "owner" | "admin" | "teacher" | "student";

export interface NotificationConfig {
  type: NotificationType;
  priority: NotificationPriority;
  requiresAction: boolean;
  expiresIn?: number;
  autoReminder: boolean;
  reminderInterval?: number;
  roles: UserRole[];
}

// Backend API response format
export interface NotificationApiResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: "info" | "warning" | "error" | "success";
}

// Backend notification creation request
export interface SendNotificationRequest {
  // Single user
  user_id?: number;
  // Multiple users
  user_ids?: number[];
  // Role-based
  role?: UserRole;
  branch_id?: number;
  // Content
  title: string;
  title_th?: string;
  message: string;
  message_th?: string;
  type: "info" | "warning" | "error" | "success";
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

// WebSocket message envelope from backend
export interface WebSocketNotificationMessage {
  type: "notification";
  data: Notification;
}

// Accepted popup notification for history tracking
export interface AcceptedPopupNotification extends Notification {
  acceptedAt: string; // ISO timestamp when user accepted
  popupStatus: "accepted" | "declined";
}
