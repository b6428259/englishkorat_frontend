# WebSocket Notification Testing - Complete Guide

## 🎯 Overview

เอกสารนี้รวมข้อมูลทั้งหมดเกี่ยวกับการทดสอบระบบแจ้งเตือน WebSocket ทั้งจาก Frontend UI และ Backend API

---

## 📱 Frontend: Test Notifications Page

### เข้าถึงหน้า Test

**URL**: `/test-notifications`
**สิทธิ์**: Admin, Owner เท่านั้น
**เมนู**: การแจ้งเตือน → ทดสอบ WebSocket

### ฟีเจอร์หลัก

1. **เลือกเคสทดสอบ** - เลือกจาก 13 เคสที่มีให้
2. **เลือกผู้รับ** - ค้นหาและกรองผู้ใช้ตามบทบาท
3. **ส่งทดสอบ** - ส่งให้ตัวเองหรือผู้อื่น

### Quick Start

```typescript
1. เลือกเคส (เช่น "Schedule Reminder")
2. กดปุ่ม "🚀 ส่งให้ตัวเอง"
3. ตรวจสอบ popup และเสียงที่ได้รับ
```

---

## 🔌 Backend: Test API Endpoint

### Endpoint

```
GET /api/notifications/test/popup
```

### Authentication

```
Authorization: Bearer <JWT_TOKEN>
```

### Query Parameters

| Parameter | Type   | Required | Description                                       |
| --------- | ------ | -------- | ------------------------------------------------- |
| `user_id` | number | No       | รหัสผู้ใช้ที่จะรับการแจ้งเตือน (ไม่ระบุ = ตัวเอง) |
| `case`    | string | No       | ชื่อเคสหรือ shortcut (default: "basic")           |

---

## 📋 Test Cases Reference

### Quick Reference Table

| #   | Case ID            | Shortcut | Name                | Channels      | Sound | Description             |
| --- | ------------------ | -------- | ------------------- | ------------- | ----- | ----------------------- |
| 1   | `basic`            | `1`      | Basic Info          | popup, normal | ✅    | ข้อความแจ้งเตือนพื้นฐาน |
| 2   | `schedule`         | `2`      | Schedule Reminder   | popup, normal | ✅    | คาบเรียนใกล้ถึง 15 นาที |
| 3   | `warning`          | `3`      | Schedule Conflict   | popup, normal | ✅    | ตารางเรียนซ้อนกัน       |
| 4   | `success`          | `4`      | Success Message     | popup, normal | ✅    | ตารางได้รับการอนุมัติ   |
| 5   | `error`            | `5`      | Error Notification  | popup, normal | ✅    | การอัปโหลดล้มเหลว       |
| 6   | `normal_only`      | `6`      | Normal Only         | normal        | ✅    | ไม่มี popup             |
| 7   | `daily_reminder`   | `7`      | Daily Reminder      | popup, normal | ✅    | สรุปตารางประจำวัน       |
| 8   | `payment_due`      | `8`      | Payment Due         | popup, normal | ✅    | เตือนชำระเงิน           |
| 9   | `makeup_session`   | `9`      | Makeup Session      | popup, normal | ✅    | คาบเรียนชดเชย           |
| 10  | `absence_approved` | `10`     | Absence Approved    | popup, normal | ✅    | คำขอลาอนุมัติแล้ว       |
| 11  | `custom_sound`     | `11`     | Custom Sound        | popup, normal | 🎵    | ใช้เสียงที่ upload      |
| 12  | `long_message`     | `12`     | Long Message        | popup, normal | ✅    | ข้อความยาว              |
| 13  | `invitation`       | `13`     | Schedule Invitation | popup, normal | ✅    | คำเชิญเข้าร่วมตาราง     |

---

## 🧪 Testing Workflows

### Workflow 1: Frontend Testing (UI)

```
1. Login as Admin/Owner
2. Navigate to /test-notifications
3. Select test case (e.g., "Schedule Reminder")
4. Click "🚀 ส่งให้ตัวเอง"
5. Verify:
   - Popup appears ✓
   - Sound plays ✓
   - Notification in list ✓
```

### Workflow 2: API Testing (cURL)

```bash
# Test with yourself
curl -X GET "http://localhost:3000/api/notifications/test/popup?case=schedule" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test with specific user
curl -X GET "http://localhost:3000/api/notifications/test/popup?user_id=123&case=3" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test using shortcut
curl -X GET "http://localhost:3000/api/notifications/test/popup?case=2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Workflow 3: Postman/Insomnia

```
Method: GET
URL: {{base_url}}/api/notifications/test/popup
Query Params:
  - user_id: 123
  - case: schedule
Headers:
  - Authorization: Bearer {{token}}
```

---

## 📡 WebSocket Message Structure

### Standard Envelope

```json
{
  "type": "notification",
  "data": {
    "id": 903,
    "user_id": 45,
    "title": "Schedule Conflict",
    "title_th": "ตารางซ้อนกัน",
    "message": "You have two sessions overlapping.",
    "message_th": "คุณมี 2 คาบเรียนเวลาทับกัน",
    "type": "warning",
    "read": false,
    "channels": ["popup", "normal"],
    "data": {
      "action": "resolve_conflict",
      "conflicts": [...]
    },
    "created_at": "2025-10-01T09:10:11Z"
  },
  "settings": {
    "enable_notification_sound": true,
    "notification_sound": "custom",
    "notification_sound_file": "https://.../mysound.mp3",
    "custom_sound_url": "https://.../mysound.mp3",
    "custom_sound_filename": "mysound.mp3"
  },
  "available_sounds": [
    {
      "id": "default",
      "label": "Default",
      "description": "Classic alert chime",
      "file": "/sounds/default.mp3"
    }
  ],
  "settings_metadata": {
    "allowed_custom_sound_extensions": ["mp3", "wav"],
    "max_custom_sound_size_bytes": 5242880,
    "supports_custom_sound": true
  }
}
```

---

## 🎵 Sound Testing

### Test Sound Behaviors

1. **Default Sound**

   ```json
   "settings": {
     "enable_notification_sound": true,
     "notification_sound": "default"
   }
   ```

2. **Custom Sound**

   ```json
   "settings": {
     "enable_notification_sound": true,
     "notification_sound": "custom",
     "custom_sound_url": "https://.../mysound.mp3"
   }
   ```

3. **Sound Disabled**
   ```json
   "settings": {
     "enable_notification_sound": false
   }
   ```

### Verify Sound Playback

```javascript
// Check browser console
"Playing custom notification sound: https://.../mysound.mp3";
"Notification sound played successfully: https://.../mysound.mp3";
```

---

## ✅ Verification Checklist

### Frontend (UI) Tests

- [ ] Page loads without errors
- [ ] Test cases display correctly
- [ ] User list loads
- [ ] Filters work (search, role)
- [ ] Can select test case
- [ ] Can select user
- [ ] Quick test button works
- [ ] Send button works
- [ ] Success toast appears
- [ ] Loading states show correctly

### WebSocket Tests

- [ ] WebSocket connection established
- [ ] Notification received via WebSocket
- [ ] Popup modal appears (cases 1-5, 7-13)
- [ ] No popup for case 6 (normal_only)
- [ ] Notification appears in list
- [ ] Sound plays (if enabled)
- [ ] Custom sound plays (case 11)
- [ ] Browser console shows logs

### Backend Tests

- [ ] API endpoint responds
- [ ] Authentication required
- [ ] User ID validation
- [ ] Case ID validation
- [ ] WebSocket message sent
- [ ] Response format correct
- [ ] Error handling works

---

## 🐛 Troubleshooting

### Problem: No notification received

**Checks:**

1. WebSocket connected?
   ```javascript
   console.log(webSocketService.getConnectionStatus());
   ```
2. Target user online?
3. Browser console errors?
4. Network tab shows WebSocket frame?

**Solution:**

- Reconnect WebSocket
- Check user authentication
- Verify server is running

### Problem: No popup appears

**Checks:**

1. Case includes "popup" channel? (not case 6)
2. Popup handler registered?
3. Modal component rendered?

**Solution:**

- Use case 1-5, 7-13 for popup
- Check NotificationContext
- Verify popup event listener

### Problem: No sound plays

**Checks:**

1. Sound enabled in settings?
2. Custom sound uploaded (for case 11)?
3. Browser allows audio autoplay?
4. Console shows sound errors?

**Solution:**

- Enable sound in /settings/system
- Upload custom sound first
- User interaction required for autoplay
- Check audio URL validity

### Problem: API returns 403

**Checks:**

1. User role is admin/owner?
2. JWT token valid?
3. Authorization header correct?

**Solution:**

- Login as admin/owner
- Refresh token
- Check header format: `Bearer <token>`

---

## 📊 Expected Results

### Success Response

```json
{
  "message": "Test notification sent via WebSocket",
  "target_user": 123,
  "username": "john.doe",
  "test_case": "schedule",
  "description": "Schedule reminder (15 min)",
  "timestamp": "2025-10-01T10:30:00Z"
}
```

### Error Responses

```json
// Missing user_id
{
  "error": "User not found"
}

// Invalid case
{
  "error": "Invalid test case"
}

// Unauthorized
{
  "error": "Insufficient permissions"
}
```

---

## 🔍 Debug Information

### Browser Console Logs

```javascript
// WebSocket connection
"WebSocket connected successfully"

// Notification received
"New notification received via Socket.IO envelope: {...}"
"Processing notification with action: resolve_conflict channels: ["popup","normal"]"

// Sound playback
"Playing custom notification sound: https://.../mysound.mp3"
"Notification sound played successfully"
```

### Network Tab

Look for:

- WebSocket connection (ws:// or wss://)
- WebSocket frames (messages)
- API call to test endpoint
- Response status and body

---

## 📝 Notes

1. **WebSocket Requirement**: ผู้รับต้องเชื่อมต่อ WebSocket ก่อน
2. **Case 6 Special**: ไม่แสดง popup (normal channel เท่านั้น)
3. **Case 11 Requirement**: ต้อง upload custom sound ก่อน
4. **Sound Permission**: บางเบราว์เซอร์ต้องมี user interaction ก่อนเล่นเสียง
5. **Mobile Testing**: ทดสอบบนมือถือด้วย (behavior อาจต่าง)

---

## 🚀 Quick Commands

### cURL Examples

```bash
# Basic test
curl -X GET "http://localhost:3000/api/notifications/test/popup?case=1" \
  -H "Authorization: Bearer TOKEN"

# Warning test
curl -X GET "http://localhost:3000/api/notifications/test/popup?case=warning" \
  -H "Authorization: Bearer TOKEN"

# Send to user 123
curl -X GET "http://localhost:3000/api/notifications/test/popup?user_id=123&case=3" \
  -H "Authorization: Bearer TOKEN"
```

### JavaScript Test

```javascript
// Send test notification
const response = await fetch("/api/notifications/test/popup?case=schedule", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const data = await response.json();
console.log("Test sent:", data);
```

---

## 📚 Related Documentation

- [WEBSOCKET_SOUND_INTEGRATION.md](./WEBSOCKET_SOUND_INTEGRATION.md)
- [CUSTOM_SOUND_UPLOAD_ENHANCEMENT.md](./CUSTOM_SOUND_UPLOAD_ENHANCEMENT.md)
- [TEST_NOTIFICATIONS_PAGE_GUIDE.md](./TEST_NOTIFICATIONS_PAGE_GUIDE.md)
- [NOTIFICATION_SOUND_SYSTEM_COMPLETE.md](./NOTIFICATION_SOUND_SYSTEM_COMPLETE.md)
