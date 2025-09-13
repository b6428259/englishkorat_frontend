# 🔔 ระบบ Notification และ WebSocket

ระบบ notification แบบ real-time ที่ใช้ WebSocket สำหรับแอปพลิเคชัน EnglishKorat ที่มี UI สวยงามและใช้งานง่าย

## ✨ ฟีเจอร์หลัก

### 🚀 Real-time Notifications
- ✅ WebSocket connection สำหรับการแจ้งเตือนแบบ real-time
- ✅ Toast notifications ที่สวยงามขณะได้รับข้อความใหม่
- ✅ การนับจำนวน notification ที่ยังไม่อ่าน
- ✅ การแสดงสถานะการเชื่อมต่อ WebSocket

### 🎨 UI Components ที่สวยงาม
- ✅ NotificationBell - ปุ่มแจ้งเตือนใน header พร้อม badge
- ✅ NotificationDropdown - รายการ notification แบบ dropdown
- ✅ Notification List Page - หน้าแสดง notification ทั้งหมด
- ✅ Demo Page - หน้าทดสอบระบบ

### 🔧 ระบบจัดการ
- ✅ Context API สำหรับจัดการ state
- ✅ การ mark as read/unread
- ✅ การกรองตามประเภทและสถานะ
- ✅ การค้นหา notification
- ✅ Pagination สำหรับ notification จำนวนมาก

## 📁 โครงสร้างไฟล์ที่สร้างขึ้น

```
src/
├── services/
│   └── websocket.service.ts          # WebSocket service
├── contexts/
│   └── NotificationContext.tsx       # Context สำหรับจัดการ state
├── components/
│   └── notifications/
│       ├── NotificationBell.tsx      # ปุ่ม notification ใน header
│       ├── NotificationDropdown.tsx  # Dropdown list
│       └── index.ts                  # Export file
├── types/
│   └── notification.ts               # Types ที่อัปเดตแล้ว
└── app/
    ├── notifications/
    │   └── page.tsx                  # หน้า notification ทั้งหมด
    └── demo-notifications/
        └── page.tsx                  # หน้าทดสอบระบบ
```

## 🛠️ การติดตั้งและใช้งาน

### 1. Dependencies ที่เพิ่มใหม่
```bash
npm install socket.io-client react-hot-toast
```

### 2. Environment Variables
```bash
# .env.local
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### 3. การใช้งาน

#### ในหน้าต่างๆ
```tsx
import { useNotifications } from '@/contexts/NotificationContext';

const MyComponent = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  // ใช้งานได้เลย
};
```

#### การส่ง notification แบบ manual (สำหรับทดสอบ)
```tsx
import { webSocketService } from '@/services/websocket.service';

// ส่ง notification
webSocketService.send('demo-notification', {
  notification: mockNotification,
  isRealTime: true,
});
```

## 🎯 การทดสอบระบบ

### เข้าไปที่หน้าทดสอบ
```
http://localhost:3001/demo-notifications
```

### ฟีเจอร์ที่ทดสอบได้
1. **การส่ง notification แบบต่างๆ**
   - การสมัครนักเรียนใหม่
   - การยืนยันการเรียน
   - แจ้งเตือนการชำระเงิน
   - เปลี่ยนแปลงตารางเรียน
   - การบำรุงรักษาระบบ

2. **ประกาศระบบ**
   - ข้อมูลทั่วไป (info)
   - คำเตือน (warning)
   - ข้อผิดพลาด (error)

3. **การทำงานของ UI**
   - Toast notification ขณะได้รับข้อความ
   - การนับ unread count
   - การ mark as read
   - การแสดงสถานะการเชื่อมต่อ

## 🔗 API Format ที่รองรับ

### GET /api/notifications
```json
{
  "notifications": [
    {
      "id": 2,
      "created_at": "2025-09-11T16:28:24.129+07:00",
      "updated_at": "2025-09-11T16:28:24.129+07:00",
      "user_id": 3,
      "title": "New IELTS Course Available",
      "title_th": "คอร์ส IELTS ใหม่มาแล้ว",
      "message": "We have a new IELTS preparation course...",
      "message_th": "เรามีคอร์สเตรียมสอบ IELTS ใหม่...",
      "type": "info",
      "read": false,
      "user": {
        "id": 3,
        "first_name_en": "alice",
        "first_name_th": "อลิซ",
        "last_name_en": "wilson",
        "last_name_th": "วิลสัน"
      },
      "branch": {
        "id": 1,
        "name_en": "Branch 1 The Mall Branch",
        "name_th": "สาขา 1 เดอะมอลล์โคราช"
      },
      "sender": {
        "type": "system",
        "name": "Notification Service"
      },
      "recipient": {
        "type": "user",
        "id": 3
      }
    }
  ],
  "pagination": {
    "limit": 10,
    "page": 1,
    "total": 1
  }
}
```

## 🎨 การปรับแต่ง UI

### สี notification ตามประเภท
```tsx
const colors = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  // ...
};
```

### Icon สำหรับแต่ละประเภท
```tsx
const icons = {
  info: '📢',
  student_registration: '👨‍🎓',
  class_confirmation: '✅',
  payment_reminder: '💰',
  // ...
};
```

## 🔧 การขยายระบบ

### เพิ่มประเภท notification ใหม่
1. อัปเดต `NotificationType` ใน `types/notification.ts`
2. เพิ่ม icon และสีใน notification components
3. เพิ่ม demo template ในหน้าทดสอบ

### เชื่อมต่อกับ backend
1. แทนที่ demo WebSocket events ด้วย real server events
2. อัปเดต API endpoints ให้ตรงกับ backend
3. จัดการ authentication สำหรับ WebSocket connection

## 🐛 การแก้ไขปัญหา

### WebSocket ไม่เชื่อมต่อ
- ตรวจสอบ `NEXT_PUBLIC_WS_URL` ใน `.env.local`
- ตรวจสอบว่า WebSocket server ทำงานอยู่
- ดูใน browser console สำหรับ error messages

### Notification ไม่แสดง
- ตรวจสอบว่า `NotificationProvider` wrap app แล้ว
- ตรวจสอบ user authentication status
- ดู network tab สำหรับ API calls

## 📱 การใช้งานบนมือถือ

ระบบถูกออกแบบให้ responsive และใช้งานได้ดีบนทุกขนาดหน้าจอ:
- Mobile-friendly dropdown
- Touch-friendly buttons
- Responsive layout
- Optimized animations

## 🚀 สิ่งที่พร้อมใช้งาน

✅ ระบบ notification แบบ real-time พร้อม WebSocket  
✅ UI components ที่สวยงามและใช้งานง่าย  
✅ การจัดการ state ด้วย Context API  
✅ หน้าทดสอบระบบ  
✅ การรองรับ API format ที่กำหนด  
✅ การกรองและค้นหา notification  
✅ Mobile responsive design  
✅ Error handling และ loading states  

ระบบพร้อมใช้งานและสามารถเชื่อมต่อกับ backend WebSocket server ได้ทันที!
