# Test Notifications Page - User Guide

## Overview

หน้า Test Notifications เป็นเครื่องมือสำหรับ Admin และ Owner ในการทดสอบระบบแจ้งเตือน WebSocket โดยสามารถเลือกเคสทดสอบต่างๆ และส่งการแจ้งเตือนไปยังผู้ใช้ที่ต้องการได้

## เข้าถึงหน้า Test Notifications

### ผ่าน Sidebar Menu

1. เปิด sidebar
2. คลิกที่เมนู **การแจ้งเตือน**
3. เลือก **ทดสอบ WebSocket**

### URL

```
/test-notifications
```

### สิทธิ์การเข้าถึง

- ✅ Admin
- ✅ Owner
- ❌ Teacher
- ❌ Student

## ฟีเจอร์หลัก

### 1. เลือกเคสทดสอบ (13 เคส)

| เคส              | Shortcut | ชื่อ                | คำอธิบาย                           | ประเภท  |
| ---------------- | -------- | ------------------- | ---------------------------------- | ------- |
| basic            | #1       | Basic Info          | ข้อความแจ้งเตือนพื้นฐาน            | info    |
| schedule         | #2       | Schedule Reminder   | แจ้งเตือนคาบเรียนใกล้ถึง (15 นาที) | info    |
| warning          | #3       | Schedule Conflict   | เตือนตารางเรียนซ้อนกัน             | warning |
| success          | #4       | Success Message     | ตารางได้รับการอนุมัติ              | success |
| error            | #5       | Error Notification  | การอัปโหลดล้มเหลว                  | error   |
| normal_only      | #6       | Normal Only         | แจ้งเตือนปกติ (ไม่มี popup)        | info    |
| daily_reminder   | #7       | Daily Reminder      | สรุปตารางประจำวัน                  | info    |
| payment_due      | #8       | Payment Due         | เตือนชำระเงิน                      | warning |
| makeup_session   | #9       | Makeup Session      | คาบเรียนชดเชย                      | info    |
| absence_approved | #10      | Absence Approved    | คำขอลาได้รับอนุมัติ                | success |
| custom_sound     | #11      | Custom Sound        | ทดสอบเสียงที่อัปโหลด               | info    |
| long_message     | #12      | Long Message        | ข้อความยาว                         | info    |
| invitation       | #13      | Schedule Invitation | คำเชิญเข้าร่วมตาราง                | info    |

### 2. เลือกผู้รับ

#### ฟิลเตอร์

- **ค้นหา**: ค้นหาด้วยชื่อผู้ใช้หรือชื่อจริง
- **กรองตามบทบาท**:
  - ทั้งหมด
  - Teacher
  - Student
  - Admin
  - Owner

#### รายการผู้ใช้

- แสดงชื่อภาษาไทย
- แสดง username
- แสดงบทบาท (role badge)
- เลือกได้ทีละ 1 คน

### 3. ส่งการแจ้งเตือน

#### Quick Test (ทดสอบด่วน)

- ส่งให้ตัวเองทันที
- ไม่ต้องเลือกผู้ใช้
- ใช้สำหรับทดสอบรวดเร็ว

#### Send to User

- เลือกผู้ใช้ก่อน
- กดปุ่ม "ส่งการแจ้งเตือนทดสอบ"
- จะแสดงผลยืนยันหลังส่งสำเร็จ

## การใช้งาน

### Workflow ทั่วไป

1. **เลือกเคสทดสอบ**

   - คลิกที่การ์ดเคสที่ต้องการ
   - ดูรายละเอียดด้านล่าง

2. **เลือกผู้รับ**

   - ใช้ฟิลเตอร์เพื่อค้นหา (optional)
   - คลิกเลือกผู้ใช้

3. **ส่งการแจ้งเตือน**
   - กด "ส่งการแจ้งเตือนทดสอบ"
   - รอข้อความยืนยัน

### ทดสอบด่วน (Quick Test)

1. เลือกเคสทดสอบ
2. กดปุ่ม "🚀 ส่งให้ตัวเอง" ในกล่องสีม่วง
3. ตรวจสอบการแจ้งเตือนที่ได้รับ

## API Endpoint

```
GET /api/notifications/test/popup
```

### Query Parameters

- `user_id` (optional): รหัสผู้ใช้ที่จะรับการแจ้งเตือน
- `case` (required): ชื่อเคสหรือ shortcut number

### Examples

```bash
# Send to yourself
curl -X GET "http://localhost:3000/api/notifications/test/popup?case=schedule" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send to specific user
curl -X GET "http://localhost:3000/api/notifications/test/popup?user_id=123&case=3" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Behavior

### เคสที่มี Popup

- เคส 1-5, 7-13 จะแสดง popup modal
- ผู้รับจะเห็นแจ้งเตือนใน notification list ด้วย
- เสียงจะเล่นตามการตั้งค่า

### เคส Normal Only (#6)

- ไม่แสดง popup modal
- แสดงเฉพาะใน notification list
- เสียงจะเล่นตามปกติ

### Custom Sound Test (#11)

- ต้องมีเสียง custom upload แล้ว
- จะเล่นเสียงที่ user ตั้งค่าไว้
- ถ้าไม่มีจะใช้เสียงเริ่มต้น

## Troubleshooting

### ไม่มีผู้ใช้แสดง

- ตรวจสอบสิทธิ์ (ต้องเป็น admin/owner)
- รอให้โหลดข้อมูลเสร็จ
- ลองรีเฟรชหน้า

### ส่งไม่สำเร็จ

- ตรวจสอบการเชื่อมต่อ API
- ตรวจสอบว่าเลือกผู้ใช้แล้ว
- ดู error message ใน toast

### ผู้รับไม่ได้การแจ้งเตือน

- ตรวจสอบว่าผู้รับเชื่อมต่อ WebSocket
- ดู browser console ของผู้รับ
- ตรวจสอบ WebSocket connection status

## UI Components

### Cards

- **Test Case Cards**: แสดงรายการเคสทดสอบ
- **Selected Case Details**: แสดงข้อมูลเคสที่เลือก
- **Quick Test Box**: กล่องสีม่วงสำหรับทดสอบด่วน
- **User Selection**: รายการผู้ใช้พร้อมฟิลเตอร์
- **Info Box**: หมายเหตุและคำแนะนำ

### Visual Feedback

- ✓ Selected indicator (เครื่องหมายถูก)
- 🔄 Loading spinner
- 🎨 Color-coded badges (role และ type)
- ⚡ Hover animations

## Best Practices

### การทดสอบ

1. เริ่มจากทดสอบให้ตัวเอง (Quick Test)
2. ตรวจสอบ popup และเสียง
3. ทดสอบส่งให้ผู้อื่นที่เชื่อมต่อ WebSocket
4. ทดสอบหลายเคสต่างๆ

### การ Debug

1. เปิด Browser DevTools
2. ดู Console logs
3. ตรวจสอบ Network tab (WebSocket)
4. ตรวจสอบ notification list

## Technical Details

### State Management

- `selectedCase`: เคสที่เลือก (default: "basic")
- `selectedUserId`: ผู้ใช้ที่เลือก
- `users`: รายชื่อผู้ใช้ทั้งหมด
- `filterRole`: กรองตามบทบาท
- `searchQuery`: คำค้นหา

### Filters

```typescript
const filteredUsers = users.filter((u) => {
  const matchesRole = filterRole === "all" || u.role === filterRole;
  const matchesSearch =
    searchQuery === "" ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.first_name_th.includes(searchQuery) ||
    u.last_name_th.includes(searchQuery);
  return matchesRole && matchesSearch;
});
```

## Future Enhancements

- [ ] ส่งให้หลายคนพร้อมกัน
- [ ] บันทึกประวัติการทดสอบ
- [ ] Export test logs
- [ ] Schedule test notifications
- [ ] Custom test message editor
- [ ] Real-time notification preview
