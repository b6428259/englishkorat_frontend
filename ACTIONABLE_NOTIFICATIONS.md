# Actionable Notifications Implementation

This document describes the implementation of actionable notifications with session confirmation functionality in the EnglishKorat frontend.

## Overview

The system now supports actionable notifications that can trigger specific API calls and display detailed information. The primary use case is session confirmation for scheduled classes.

## WebSocket Payload Structure

Example WebSocket payload that the client will receive:

```json
{
  "type": "notification",
  "data": {
    "id": 456,
    "created_at": "2025-09-22T08:30:00Z",
    "user_id": 1,
    "title": "New session scheduled",
    "title_th": "มีการสร้างคาบเรียน/นัดหมายใหม่",
    "message": "A new session for schedule 'Beginner A' is scheduled at 2025-09-25 09:00.",
    "message_th": "มีการสร้างคาบเรียน/นัดหมายสำหรับตาราง 'Beginner A' เวลา 2025-09-25 09:00",
    "type": "info",
    "channels": ["popup", "normal"],
    "read": false,
    "data": {
      "resource": {
        "type": "session",
        "id": 85
      },
      "link": {
        "method": "GET",
        "href": "/api/schedules/sessions/85"
      },
      "action": "confirm"
    }
  }
}
```

## Frontend Implementation

### 1. Type Definitions

Updated `Notification` interface in `src/types/notification.ts`:

```typescript
export interface Notification {
  // ... existing fields
  data?: {
    resource?: {
      type: string; // e.g., "session"
      id: number;
    };
    link?: {
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      href: string; // e.g., "/api/schedules/sessions/85"
    };
    action?: "confirm" | "approve" | "reject" | string;
  };
}
```

### 2. API Service Methods

Added to `src/services/api/schedules.ts`:

```typescript
// Session confirmation for actionable notifications
confirmSession: async (
  sessionId: string | number,
  action: "confirm" | "decline"
) => {
  // PATCH /api/schedules/sessions/:id/confirm
};

// Generic resource fetching using notification link
fetchNotificationResource: async (
  href: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
) => {
  // Fetch details using data.link.href and method
};
```

### 3. Enhanced Notification Modal

Updated `src/components/notifications/NotificationPopupModal.tsx`:

#### Features:

- **Conditional UI**: Different buttons for actionable notifications (Confirm/Decline vs Accept/Decline)
- **Session Details**: "View Details" button that fetches session information using `data.link.href`
- **Session Confirmation**: Direct integration with session confirmation API
- **Visual Indicators**: Green "Confirm" button for actionable notifications

#### UI Flow:

1. Notification popup displays with enhanced layout
2. If `data.link.href` exists, show "Session Details" section
3. User can click "View Details" to fetch and display session information
4. If `data.action === "confirm"`, show "Confirm/Decline" buttons instead of "Accept/Decline"
5. Confirmation triggers `PATCH /api/schedules/sessions/:id/confirm`

### 4. Context Enhancements

Updated `src/contexts/NotificationContext.tsx`:

#### Features:

- **Duplicate Prevention**: Tracks `lastOpenedNotificationId` to prevent duplicate popups
- **Auto-Read**: Automatically marks popup notifications as read when displayed
- **Enhanced Tracking**: Better notification state management

## API Integration

### Session Confirmation Endpoint

```
PATCH /api/schedules/sessions/:id/confirm
Body: { "action": "confirm" | "decline" }
```

### Session Details Endpoint

```
GET /api/schedules/sessions/:id
Response: SessionDetailResponse with session info, teacher, room, etc.
```

### Mark as Read Endpoint

```
PATCH /api/notifications/:id/read
```

## Frontend Guidelines

### 1. Resource Link Handling

- Use `href` and `method` directly from `data.link`
- Don't embed base URL in payload; client adds it
- Support all HTTP methods: GET, POST, PUT, PATCH, DELETE

### 2. Action-Based UI

```typescript
if (notification.data?.action === "confirm") {
  // Show "Confirm/Decline" buttons
  // Use green styling for confirm button
  // Integrate with session confirmation API
}
```

### 3. Session Detail Display

When `data.link` exists:

- Show "Session Details" section with "View Details" button
- Display session information in organized layout
- Show date, time, teacher, room details
- Support both Thai and English language

### 4. Notification State Management

- **Auto-read**: Mark as read when popup is shown
- **Duplicate prevention**: Track last opened notification ID
- **History tracking**: Store accepted notifications with timestamp

## Security Considerations

1. **API Validation**: All API endpoints validate user permissions
2. **Resource Access**: Users can only confirm sessions they're assigned to
3. **XSS Prevention**: All notification content is sanitized
4. **CSRF Protection**: API endpoints use proper CSRF tokens

## Testing

### Test Cases

1. **Basic Notification**: Standard notification without actionable data
2. **Session Confirmation**: Notification with `action: "confirm"`
3. **Resource Details**: Notification with `data.link.href`
4. **Duplicate Prevention**: Multiple identical notifications
5. **Error Handling**: Failed API calls, network errors
6. **Permissions**: Unauthorized access attempts

### Example Test Payloads

```javascript
// Standard notification
{
  "type": "notification",
  "data": {
    "id": 1,
    "title": "Standard notification",
    "message": "Regular notification message",
    "type": "info",
    "channels": ["normal"]
  }
}

// Actionable session confirmation
{
  "type": "notification",
  "data": {
    "id": 2,
    "title": "Session confirmation required",
    "message": "Please confirm your attendance for tomorrow's class",
    "type": "info",
    "channels": ["popup"],
    "data": {
      "resource": { "type": "session", "id": 123 },
      "link": { "method": "GET", "href": "/api/schedules/sessions/123" },
      "action": "confirm"
    }
  }
}
```

## Future Enhancements

1. **Multiple Actions**: Support for more than two action buttons
2. **Custom Forms**: Embedded forms within notifications
3. **File Attachments**: Support for document attachments
4. **Scheduled Actions**: Time-based automatic actions
5. **Workflow Integration**: Multi-step approval processes

## Troubleshooting

### Common Issues

1. **Session Details Not Loading**: Check API endpoint permissions and payload format
2. **Confirmation Not Working**: Verify session ID and user permissions
3. **Duplicate Notifications**: Ensure proper duplicate prevention logic
4. **UI Not Updating**: Check React state management and re-renders

### Debug Tools

- Browser Developer Tools Network tab for API calls
- Console logs for WebSocket message handling
- React DevTools for component state inspection
