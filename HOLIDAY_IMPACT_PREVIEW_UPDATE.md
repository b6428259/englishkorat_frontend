# Holiday Impact Preview Update

## สรุป

อัปเดตการแสดงผล Holiday Impact Response ในส่วน Preview ของ Class Schedule Modal ให้มีรูปแบบที่สวยงามและอ่านง่ายขึ้น พร้อมรองรับทั้งภาษาไทยและภาษาอังกฤษ

## การเปลี่ยนแปลง

### 1. Date Formatting Utility

**ไฟล์:** `/src/utils/dateFormatter.ts`

สร้าง utility functions สำหรับแปลงวันที่ให้อ่านง่าย:

- `formatDateReadable()` - แปลงวันที่เป็นรูปแบบที่อ่านง่าย
- `formatDateShort()` - แปลงวันที่แบบสั้น

#### ตัวอย่างการใช้งาน:

```typescript
formatDateReadable("2025-10-13", "th");
// Output: "13 ตุลาคม 2568"

formatDateReadable("2025-10-13", "en");
// Output: "October 13, 2025"
```

### 2. Type Definition Update

**ไฟล์:** `/src/services/api/schedules.ts`

เพิ่ม field `holiday_name` ใน `HolidayImpact` interface:

```typescript
export interface HolidayImpact {
  session_number: number;
  date: string;
  holiday_name?: string; // ← เพิ่มใหม่
  shifted_to: string;
  was_rescheduled: boolean;
}
```

### 3. UI Component Update

**ไฟล์:** `/src/app/schedule/components/ClassScheduleModal.tsx`

#### การออกแบบใหม่:

- 🎨 ใช้ gradient background (amber/orange) ที่สะดุดตา
- 📅 แสดงข้อมูลวันหยุดแบบละเอียดและอ่านง่าย
- 🔢 แสดงเลขคาบแบบ badge กลม
- ➡️ ใช้ icon arrow สำหรับการเลื่อนวันที่
- 🌐 รองรับทั้งภาษาไทยและอังกฤษ

## ตัวอย่างการแสดงผล

### Backend Response:

```json
{
  "session_number": 2,
  "date": "2025-10-13",
  "holiday_name": "วันหยุดชดเชยวันปิยมหาราช",
  "shifted_to": "2025-11-03",
  "was_rescheduled": true
}
```

### การแสดงผลภาษาไทย:

```
┌──────────────────────────────────────────────┐
│ 🗓️ การปรับเปลี่ยนเนื่องจากวันหยุด          │
├──────────────────────────────────────────────┤
│  ⓶ คาบที่ 2                                 │
│     วันที่ 13 ตุลาคม 2568                    │
│     หยุดเนื่องจาก วันหยุดชดเชยวันปิยมหาราช  │
│     → ถูกเลื่อนไปเป็น 3 พฤศจิกายน 2568      │
└──────────────────────────────────────────────┘
```

### การแสดงผลภาษาอังกฤษ:

```
┌──────────────────────────────────────────────┐
│ 🗓️ Holiday Rescheduling                     │
├──────────────────────────────────────────────┤
│  ⓶ Session 2                                │
│     Date: October 13, 2025                   │
│     Closed for วันหยุดชดเชยวันปิยมหาราช      │
│     → Rescheduled to November 3, 2025        │
└──────────────────────────────────────────────┘
```

## คุณสมบัติ

### Visual Design:

- ✅ Gradient background (amber to orange)
- ✅ Border สีเหลืองเข้มเพื่อเน้นความสำคัญ
- ✅ Hover effect สำหรับแต่ละ card
- ✅ Icon calendar สำหรับหัวข้อ
- ✅ Icon arrow สำหรับแสดงการเลื่อนวันที่
- ✅ Badge แสดงเลขคาบแบบกลม

### Language Support:

- ✅ แปลงวันที่เป็นภาษาไทย (พร้อม พ.ศ.)
- ✅ แปลงวันที่เป็นภาษาอังกฤษ
- ✅ ข้อความแสดงผลเป็น 2 ภาษา
- ✅ ชื่อวันหยุดรองรับทั้งไทยและอังกฤษ

### Data Handling:

- ✅ รองรับ optional `holiday_name`
- ✅ Format วันที่จาก "YYYY-MM-DD" อัตโนมัติ
- ✅ Handle error ในกรณีวันที่ไม่ถูกต้อง
- ✅ Responsive design

## การทดสอบ

### Test Case 1: วันหยุดมีชื่อ

```json
{
  "session_number": 2,
  "date": "2025-10-13",
  "holiday_name": "วันหยุดชดเชยวันปิยมหาราช",
  "shifted_to": "2025-11-03",
  "was_rescheduled": true
}
```

✅ ควรแสดงชื่อวันหยุดแบบเต็ม

### Test Case 2: วันหยุดไม่มีชื่อ

```json
{
  "session_number": 5,
  "date": "2025-12-25",
  "shifted_to": "2025-12-26",
  "was_rescheduled": true
}
```

✅ ควรไม่แสดงบรรทัด "หยุดเนื่องจาก"

### Test Case 3: หลายวันหยุด

```json
[
  {
    "session_number": 2,
    "date": "2025-10-13",
    "holiday_name": "วันหยุดชดเชยวันปิยมหาราช",
    "shifted_to": "2025-11-03",
    "was_rescheduled": true
  },
  {
    "session_number": 8,
    "date": "2025-12-31",
    "holiday_name": "วันสิ้นปี",
    "shifted_to": "2026-01-02",
    "was_rescheduled": true
  }
]
```

✅ ควรแสดงทุก holiday แยกกันเป็น cards

## ไฟล์ที่เกี่ยวข้อง

1. `/src/utils/dateFormatter.ts` - Date formatting utilities
2. `/src/services/api/schedules.ts` - Type definitions
3. `/src/app/schedule/components/ClassScheduleModal.tsx` - UI Component

## Build Status

✅ Build สำเร็จ (no errors)
✅ TypeScript type checking passed
✅ ESLint warnings: 1 (unused function - not critical)

## การ Deploy

1. Build โปรเจ็กต์: `npm run build`
2. ทดสอบ dev server: `npm run dev`
3. ตรวจสอบใน Preview tab ของ Class Schedule Modal

## Notes

- วันที่ภาษาไทยจะแปลงเป็น พ.ศ. อัตโนมัติ (+543 ปี)
- วันที่ภาษาอังกฤษใช้รูปแบบ "Month DD, YYYY"
- ชื่อวันหยุดจะแสดงตามที่ backend ส่งมา (ไม่แปล)
- Component รองรับ dark mode ready

## Future Enhancements

- [ ] เพิ่ม tooltip สำหรับข้อมูลเพิ่มเติม
- [ ] Export calendar file (.ics) สำหรับวันที่เลื่อน
- [ ] Filter/search holiday impacts
- [ ] Animation เมื่อแสดง/ซ่อน section

---

อัพเดทโดย: GitHub Copilot
วันที่: 2 ตุลาคม 2025
Version: 1.0
