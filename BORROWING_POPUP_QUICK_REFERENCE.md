# 🎯 Quick Reference: Borrowing Popup Notifications

## ✅ สิ่งที่ทำเสร็จแล้ว (Completed)

### 1. WebSocket Handler ✅

- เพิ่ม handler ใน `NotificationContext.tsx` ที่ตรวจจับ `borrow_due_soon` และ `borrow_overdue`
- แสดง popup อัตโนมัติเมื่อได้รับ notification เหล่านี้
- กดปุ่ม "ดูรายการยืม" แล้วไปหน้า `/borrowing/my-borrows` ทันที

### 2. Popup Component ✅

- สร้าง `BorrowingUrgentPopup.tsx` ใหม่
- รองรับ 2 ภาษา (ไทย/อังกฤษ)
- มีสีแยกตามความเร่งด่วน:
  - **ครบกำหนดพรุ่งนี้**: สีเหลือง/ทอง ⏰
  - **เกินกำหนด**: สีแดง ❌
- แสดงข้อมูล:
  - วันครบกำหนด (สำหรับ due_soon)
  - จำนวนวันเกิน + ค่าปรับ (สำหรับ overdue)

### 3. Type Definitions ✅

- อัปเดต `notification.ts` ให้รองรับ borrowing data fields
- เพิ่ม type: `borrow_due_soon`, `borrow_overdue`, etc.

### 4. Build Status ✅

- Build สำเร็จ ไม่มี error
- ทดสอบ compile ผ่านทั้งหมด

---

## 📋 สิ่งที่ต้องทำต่อ (Pending Tasks)

### 1. Validate Features ตาม Documentation

- ตรวจสอบว่าระบบ borrowing มีครบ 7 core features หรือไม่
- ตรวจสอบ 6 notification types ว่าทำงานถูกต้องหรือไม่
- ตรวจสอบ workflow ตาม BORROWING_SYSTEM.md v1.1.0

### 2. เปลี่ยนหน้า my-borrows ใหม่

- เปลี่ยนจาก page.tsx เดิม → page-old.tsx
- เปลี่ยนจาก page-nextui.tsx → page.tsx
- ทดสอบ debounce และ optimization

### 3. แปลง Component อื่นๆ เป็น NextUI

- Management page
- ItemCard, RequestCard, TransactionCard
- StatusBadge
- BorrowingDashboard

---

## 🧪 วิธีทดสอบ (How to Test)

### ทดสอบ Notification แบบ Manual:

1. **เปิด Browser Console**
2. **Connect WebSocket**:

```javascript
const ws = new WebSocket("ws://localhost:3000/ws");
ws.onopen = () => {
  ws.send(
    JSON.stringify({
      type: "auth",
      token: localStorage.getItem("jwt_token"),
    })
  );
};
```

3. **ส่ง Test Notification (ครบกำหนดพรุ่งนี้)**:

```javascript
ws.send(
  JSON.stringify({
    type: "notification",
    channels: ["normal", "popup"],
    title: "Item Due Tomorrow",
    title_th: "รายการครบกำหนดพรุ่งนี้",
    message: "Your item is due tomorrow",
    message_th: "รายการจะครบกำหนดพรุ่งนี้",
    data: {
      type: "borrow_due_soon",
      transaction_id: 10,
      due_date: "2025-02-03T23:59:59Z",
    },
  })
);
```

4. **ส่ง Test Notification (เกินกำหนด)**:

```javascript
ws.send(
  JSON.stringify({
    type: "notification",
    channels: ["normal", "popup"],
    title: "Item Overdue",
    title_th: "รายการเกินกำหนด",
    message: "Your item is overdue",
    message_th: "รายการเกินกำหนดแล้ว",
    data: {
      type: "borrow_overdue",
      transaction_id: 10,
      days_overdue: 3,
      late_fee: 30.0,
    },
  })
);
```

5. **คาดหวังผลลัพธ์**:
   - Popup แสดงขึ้นมาทันที
   - มี Toast notification ที่มุมบนกลางจอ
   - กดปุ่ม "ดูรายการยืม" แล้วไปหน้า `/borrowing/my-borrows`
   - กดปุ่ม "ปิด" แล้ว popup หายไป

---

## 📄 ไฟล์ที่เกี่ยวข้อง (Related Files)

### Modified:

- `src/types/notification.ts` - เพิ่ม borrowing types
- `src/contexts/NotificationContext.tsx` - เพิ่ม popup handler
- `src/contexts/PopupStackContext.tsx` - เพิ่ม borrowing-urgent type

### Created:

- `src/components/notifications/BorrowingUrgentPopup.tsx` - NEW popup component
- `BORROWING_URGENT_NOTIFICATION_IMPLEMENTATION.md` - เอกสารเต็ม

---

## 🎨 UI Design

### Due Soon (ครบกำหนดพรุ่งนี้):

```
┌─────────────────────────────────┐
│ 🟡 ⏰ รายการครบกำหนดพรุ่งนี้    │ ← สีเหลือง/ทอง
├─────────────────────────────────┤
│ รายการ "Clean Code"              │
│ จะครบกำหนดพรุ่งนี้               │
│                                  │
│ ┌───────────────────────────┐   │
│ │ กำหนดคืน: 3 ก.พ. 2025     │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ [ ปิด ]    [ ดูรายการยืม ]      │
└─────────────────────────────────┘
```

### Overdue (เกินกำหนด):

```
┌─────────────────────────────────┐
│ 🔴 ❌ รายการเกินกำหนด           │ ← สีแดง
│    เกินกำหนด 3 วัน              │
├─────────────────────────────────┤
│ รายการ "Clean Code"              │
│ เกินกำหนดแล้ว 3 วัน             │
│                                  │
│ ┌───────────────────────────┐   │
│ │ ค่าปรับที่สะสม: 30.00 บาท │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ [ ปิด ]    [ ดูรายการยืม ]      │
└─────────────────────────────────┘
```

---

## 🔔 Notification Types Summary

| Type                      | Popup? | Color     | Icon   | Priority |
| ------------------------- | ------ | --------- | ------ | -------- |
| `borrow_request_approved` | ❌     | -         | 📢     | Normal   |
| `borrow_request_rejected` | ❌     | -         | ❌     | Normal   |
| **`borrow_due_soon`**     | **✅** | **Amber** | **⏰** | **90**   |
| **`borrow_overdue`**      | **✅** | **Red**   | **❌** | **90**   |
| `borrow_fees_due`         | ❌     | -         | 💰     | Normal   |
| `pending_pickup_reminder` | ❌     | -         | 📦     | Normal   |

---

## 🚀 Next Steps

1. ✅ **เสร็จแล้ว**: WebSocket handler + Popup component
2. ⏸️ **รอทำ**: Validate features ตาม documentation
3. ⏸️ **รอทำ**: Replace old page with NextUI version
4. ⏸️ **รอทำ**: Convert remaining components to NextUI

---

## 📞 Support

หากมีปัญหา:

1. ตรวจสอบ browser console สำหรับ errors
2. ตรวจสอบ WebSocket connection status
3. ตรวจสอบ notification payload structure
4. อ่านเอกสารเต็มใน `BORROWING_URGENT_NOTIFICATION_IMPLEMENTATION.md`

---

**สถานะปัจจุบัน**: ✅ พร้อมใช้งาน
**วันที่**: 21 มกราคม 2025
