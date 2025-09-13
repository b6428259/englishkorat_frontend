# Backend Notification Navigation Guidelines

## 📋 Overview

This document provides guidelines for implementing notification navigation in the Go Fiber backend to support the frontend notification system's routing capabilities.

## 🎯 Notification Types and Navigation Routes

### Notification Routing Matrix

When sending notifications through the WebSocket, the backend should include routing information to guide the frontend on where to navigate when a notification is clicked.

```go
type NotificationDTO struct {
    ID        uint      `json:"id"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    UserID    uint      `json:"user_id"`
    Title     string    `json:"title"`
    TitleTh   *string   `json:"title_th,omitempty"`
    Message   string    `json:"message"`
    MessageTh *string   `json:"message_th,omitempty"`
    Type      string    `json:"type"` // "info", "warning", "error", "success"
    Read      bool      `json:"read"`
    ReadAt    *time.Time `json:"read_at,omitempty"`
    
    // Navigation fields
    NavigationType string                 `json:"navigation_type,omitempty"` // NEW: navigation category
    NavigationData map[string]interface{} `json:"navigation_data,omitempty"` // NEW: specific navigation data
    
    // Existing fields
    User      UserDTO      `json:"user"`
    Branch    BranchDTO    `json:"branch"`
    Sender    SenderDTO    `json:"sender"`
    Recipient RecipientDTO `json:"recipient"`
}
```

### Navigation Type Categories

| Navigation Type | Frontend Route | Navigation Data Required | Description |
|----------------|----------------|-------------------------|-------------|
| `student_new` | `/students/new` | `student_id` | New student registration |
| `student_profile` | `/students/list` | `student_id` | Student-related updates |
| `schedule_class` | `/schedule` | `schedule_id`, `class_id` | Class schedule updates |
| `schedule_session` | `/schedule` | `session_id`, `schedule_id` | Specific session details |
| `teacher_profile` | `/teachers/list` | `teacher_id` | Teacher-related updates |
| `teacher_report` | `/teachers/teachingReport` | `teacher_id`, `report_id` | Teaching reports |
| `payment_reminder` | `/students/list` | `student_id`, `payment_id` | Payment-related |
| `system_maintenance` | `/dashboard` | `maintenance_id` | System announcements |
| `general` | `/notifications` | - | General notifications |

## 🔧 Implementation Examples

### 1. New Student Registration Notification

```go
func SendStudentRegistrationNotification(userID uint, studentID uint, studentName string) {
    notification := NotificationDTO{
        UserID:    userID,
        Title:     "New Student Registration",
        TitleTh:   "นักเรียนใหม่ลงทะเบียน",
        Message:   fmt.Sprintf("New student %s has registered", studentName),
        MessageTh: fmt.Sprintf("นักเรียนใหม่ %s ได้ลงทะเบียนแล้ว", studentName),
        Type:      "info",
        
        // Navigation setup
        NavigationType: "student_new",
        NavigationData: map[string]interface{}{
            "student_id": studentID,
            "action":     "view_profile",
        },
    }
    
    // Send via WebSocket
    BroadcastToUser(userID, notification)
}
```

### 2. Class Schedule Update Notification

```go
func SendScheduleChangeNotification(userID uint, scheduleID uint, sessionID uint, changeType string) {
    notification := NotificationDTO{
        UserID:    userID,
        Title:     "Schedule Update",
        TitleTh:   "ตารางเรียนมีการเปลี่ยนแปลง",
        Message:   fmt.Sprintf("Your class schedule has been %s", changeType),
        MessageTh: fmt.Sprintf("ตารางเรียนของคุณได้รับการ%s", getThaiChangeType(changeType)),
        Type:      "warning",
        
        // Navigation setup
        NavigationType: "schedule_session",
        NavigationData: map[string]interface{}{
            "schedule_id": scheduleID,
            "session_id":  sessionID,
            "action":      "view_details",
            "change_type": changeType,
        },
    }
    
    BroadcastToUser(userID, notification)
}
```

### 3. Payment Reminder Notification

```go
func SendPaymentReminderNotification(userID uint, studentID uint, paymentID uint, amount float64) {
    notification := NotificationDTO{
        UserID:    userID,
        Title:     "Payment Reminder",
        TitleTh:   "แจ้งเตือนการชำระเงิน",
        Message:   fmt.Sprintf("Payment of %.2f THB is due", amount),
        MessageTh: fmt.Sprintf("ค่าธรรมเนียม %.2f บาท ครบกำหนดชำระ", amount),
        Type:      "warning",
        
        // Navigation setup
        NavigationType: "student_profile",
        NavigationData: map[string]interface{}{
            "student_id":  studentID,
            "payment_id":  paymentID,
            "amount":      amount,
            "action":      "payment_details",
        },
    }
    
    BroadcastToUser(userID, notification)
}
```

### 4. Class Reminder Notification

```go
func SendClassReminderNotification(userID uint, sessionID uint, scheduleID uint, startTime time.Time) {
    notification := NotificationDTO{
        UserID:    userID,
        Title:     "Class Starting Soon",
        TitleTh:   "คลาสเรียนจะเริ่มแล้ว",
        Message:   fmt.Sprintf("Your class will start at %s", startTime.Format("15:04")),
        MessageTh: fmt.Sprintf("คลาสเรียนของคุณจะเริ่มเวลา %s", startTime.Format("15:04")),
        Type:      "info",
        
        // Navigation setup
        NavigationType: "schedule_session",
        NavigationData: map[string]interface{}{
            "session_id":  sessionID,
            "schedule_id": scheduleID,
            "start_time":  startTime.Unix(),
            "action":      "view_session",
        },
    }
    
    BroadcastToUser(userID, notification)
}
```

## 🎨 Frontend Integration

The frontend automatically handles navigation based on the `navigation_type` field:

### Frontend Route Mapping (Already Implemented)

```typescript
const getNotificationRoute = (notification: Notification): string => {
  const routes: Record<string, string> = {
    'student_registration': '/students/new',
    'class_confirmation': '/schedule',
    'class_cancellation': '/schedule',
    'schedule_change': '/schedule', 
    'payment_reminder': '/students/list',
    'appointment_reminder': '/schedule',
    'class_reminder': '/schedule',
    'leave_approval': '/teachers/list',
    'report_deadline': '/dashboard',
    'room_conflict': '/schedule',
    'system_maintenance': '/dashboard'
  };
  
  return routes[notification.type] || '/notifications';
};
```

### Enhanced Navigation with Data

To support more specific navigation, update the frontend handler:

```typescript
const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  if (!notification.read) {
    await markAsRead(notification.id);
  }
  
  // Navigate with specific data
  let route = getNotificationRoute(notification);
  
  // Add query parameters based on navigation data
  if (notification.navigation_data) {
    const params = new URLSearchParams();
    Object.entries(notification.navigation_data).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    route += `?${params.toString()}`;
  }
  
  router.push(route);
  onClose();
};
```

## 📊 Notification Service Structure

### Recommended Service Organization

```go
// notification_service.go
type NotificationService struct {
    db          *gorm.DB
    wsHub       *WebSocketHub
    userService *UserService
}

// Notification categories
func (ns *NotificationService) SendStudentNotification(...)
func (ns *NotificationService) SendScheduleNotification(...)
func (ns *NotificationService) SendPaymentNotification(...)
func (ns *NotificationService) SendTeacherNotification(...)
func (ns *NotificationService) SendSystemNotification(...)

// Generic sender
func (ns *NotificationService) SendNotification(notification NotificationDTO) error {
    // Save to database
    if err := ns.saveNotification(notification); err != nil {
        return err
    }
    
    // Broadcast via WebSocket
    return ns.wsHub.BroadcastToUser(notification.UserID, notification)
}
```

## 🔄 Auto-Read Functionality

When a user navigates to a specific page from a notification, automatically mark related notifications as read:

```go
// Auto-mark related notifications as read
func (ns *NotificationService) MarkRelatedNotificationsRead(userID uint, navigationType string, resourceID uint) error {
    query := ns.db.Model(&Notification{}).
        Where("user_id = ? AND read = false", userID)
    
    switch navigationType {
    case "student_new", "student_profile":
        query = query.Where("navigation_data->>'student_id' = ?", resourceID)
    case "schedule_session", "schedule_class":
        query = query.Where("navigation_data->>'schedule_id' = ? OR navigation_data->>'session_id' = ?", resourceID, resourceID)
    }
    
    return query.Update("read", true).Error
}
```

## 🎯 Testing Guidelines

### Test Notification Creation

```go
func TestNotificationNavigation(t *testing.T) {
    // Test student notification
    studentNotif := CreateStudentNotification(userID, studentID)
    assert.Equal(t, "student_new", studentNotif.NavigationType)
    assert.Equal(t, studentID, studentNotif.NavigationData["student_id"])
    
    // Test schedule notification
    scheduleNotif := CreateScheduleNotification(userID, scheduleID, sessionID)
    assert.Equal(t, "schedule_session", scheduleNotif.NavigationType)
}
```

## 📝 Summary

### Implementation Checklist

- [ ] Add `navigation_type` and `navigation_data` fields to `NotificationDTO`
- [ ] Create notification service methods for each category
- [ ] Implement auto-read functionality for related notifications
- [ ] Add proper error handling and logging
- [ ] Test notification routing with frontend
- [ ] Document all notification types and their navigation patterns

### Benefits

1. **Smart Navigation**: Users are taken directly to relevant pages
2. **Better UX**: Reduces clicks and improves workflow
3. **Context Awareness**: Notifications carry specific action data
4. **Automatic Cleanup**: Related notifications are marked read automatically
5. **Scalable**: Easy to add new notification types and routes

This system provides a seamless notification experience where users can click on any notification and be taken directly to the relevant content or action page.
