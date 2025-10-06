// Example: How to use WebSocket with sound notification
// ตัวอย่างการใช้งาน WebSocket service พร้อมเสียงแจ้งเตือน

import { useAuth } from "@/hooks/useAuth";
import { webSocketService } from "@/services/websocket.service";
import type { Notification } from "@/types/notification";
import { useEffect } from "react";

export function NotificationListener() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // เชื่อมต่อ WebSocket (token จะถูกส่งผ่าน auth headers หรือ cookies)
    webSocketService.connect(
      {
        url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws",
        options: {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        },
      },
      user.id
    );

    // ฟัง notification ใหม่
    const handleNewNotification = (data?: unknown) => {
      const notification = data as Notification;
      console.log("New notification received:", notification);
      // เสียงจะเล่นอัตโนมัติใน WebSocket service
      // UI updates จะทำที่นี่
    };

    // ฟัง popup notifications
    const handlePopupNotification = (data?: unknown) => {
      const notification = data as Notification;
      console.log("Popup notification:", notification);
      // แสดง modal/dialog
    };

    // ฟัง connection status
    const handleConnectionStatus = (data?: unknown) => {
      const status = data as { connected: boolean; reason?: string };
      console.log("WebSocket connection status:", status);
    };

    // เพิ่ม event listeners
    webSocketService.on("new-notification", handleNewNotification);
    webSocketService.on("popup-notification", handlePopupNotification);
    webSocketService.on("connection-status", handleConnectionStatus);

    // Cleanup
    return () => {
      webSocketService.off("new-notification", handleNewNotification);
      webSocketService.off("popup-notification", handlePopupNotification);
      webSocketService.off("connection-status", handleConnectionStatus);
    };
  }, [user]);

  return null; // This is a service component
}

// ตัวอย่าง WebSocket message ที่ server จะส่งมา
const exampleMessages = {
  // เคส 1: Custom sound
  customSound: {
    type: "notification",
    data: {
      id: 903,
      user_id: 45,
      title: "Schedule Conflict",
      title_th: "ตารางซ้อนกัน",
      message: "You have two sessions overlapping.",
      message_th: "คุณมี 2 คาบเรียนเวลาทับกัน",
      type: "warning",
      read: false,
      channels: ["popup", "normal"],
      data: {
        conflicts: [
          { session_id: 1001, starts_at: "2025-10-02T01:00:00Z" },
          { session_id: 1005, starts_at: "2025-10-02T01:30:00Z" },
        ],
        action: "resolve_conflict",
      },
      created_at: "2025-10-01T09:10:11Z",
    },
    settings: {
      notification_sound: "custom",
      notification_sound_file:
        "https://ekls-test-bucket.s3.ap-southeast-1.amazonaws.com/custom-notification-sounds/45/2025/10/01/mysound.mp3",
      custom_sound_url:
        "https://ekls-test-bucket.s3.ap-southeast-1.amazonaws.com/custom-notification-sounds/45/2025/10/01/mysound.mp3",
      custom_sound_filename: "mysound.mp3",
      enable_notification_sound: true,
    },
    available_sounds: [
      {
        id: "default",
        label: "Default",
        description: "Classic alert chime",
        file: "/sounds/default.mp3",
      },
      {
        id: "chime",
        label: "Bright Chime",
        description: "Upbeat tone for prominent alerts",
        file: "/sounds/chime.mp3",
      },
      {
        id: "bell",
        label: "Soft Bell",
        description: "Gentle bell suitable for focus mode",
        file: "/sounds/bell.mp3",
      },
      {
        id: "ding",
        label: "Digital Ding",
        description: "Short digital ping for quick updates",
        file: "/sounds/ding.mp3",
      },
      {
        id: "pop",
        label: "Pop",
        description: "Playful pop for casual notifications",
        file: "/sounds/pop.mp3",
      },
    ],
    settings_metadata: {
      allowed_custom_sound_extensions: ["mp3", "wav"],
      max_custom_sound_size_bytes: 5242880,
      supports_custom_sound: true,
    },
  },

  // เคส 2: Built-in sound
  builtinSound: {
    type: "notification",
    data: {
      id: 904,
      user_id: 45,
      title: "Class Reminder",
      title_th: "แจ้งเตือนคาบเรียน",
      message: "Your class starts in 15 minutes",
      message_th: "คาบเรียนจะเริ่มในอีก 15 นาที",
      type: "info",
      channels: ["normal"],
      created_at: "2025-10-01T09:15:00Z",
    },
    settings: {
      notification_sound: "ding",
      notification_sound_file: "/sounds/ding.mp3",
      enable_notification_sound: true,
      custom_sound_url: "",
      custom_sound_filename: "",
    },
    available_sounds: [
      // ... same as above
    ],
  },

  // เคส 3: Sound disabled
  soundDisabled: {
    type: "notification",
    data: {
      id: 905,
      user_id: 45,
      title: "Payment Reminder",
      title_th: "แจ้งเตือนการชำระเงิน",
      message: "Payment due tomorrow",
      message_th: "ครบกำหนดชำระพรุ่งนี้",
      type: "warning",
      channels: ["normal"],
      created_at: "2025-10-01T09:20:00Z",
    },
    settings: {
      enable_notification_sound: false,
    },
  },
};

export { exampleMessages };
