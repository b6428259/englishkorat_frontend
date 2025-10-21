# Teacher Working Hours API Documentation

ระบบจัดการเวลาทำงานของครู - รองรับหลายช่วงเวลาต่อวัน

## 📋 Table of Contents
- [Overview](#overview)
- [Data Model](#data-model)
- [API Endpoints](#api-endpoints)
- [Use Cases & Examples](#use-cases--examples)
- [Error Handling](#error-handling)

---

## Overview

ระบบนี้ช่วยให้สามารถจัดการเวลาทำงานของครูได้อย่างยืดหยุ่น โดยครูหนึ่งคนสามารถมีหลายช่วงเวลาทำงานในแต่ละวันได้ เช่น:
- วันจันทร์: 08:00-12:00 (เช้า) และ 14:00-18:00 (บ่าย)
- วันพุธ: 09:00-11:00, 13:00-15:00, 16:00-20:00 (3 ช่วง)

### Key Features
✅ รองรับหลายช่วงเวลาต่อวัน  
✅ ตรวจสอบเวลาซ้ำซ้อนอัตโนมัติ  
✅ ค้นหาครูที่ว่างในช่วงเวลาที่ต้องการ  
✅ Batch update - ตั้งเวลาทั้งอาทิตย์พร้อมกัน  
✅ Soft delete - เก็บประวัติไว้ตรวจสอบได้

---

## Data Model

### TeacherWorkingHours

```json
{
  "id": 1,
  "teacher_id": 5,
  "day_of_week": 1,
  "start_time": "08:00",
  "end_time": "12:00",
  "is_active": true,
  "notes": "Morning shift",
  "created_at": "2025-10-20T10:00:00Z",
  "updated_at": "2025-10-20T10:00:00Z"
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | uint | Primary key |
| `teacher_id` | uint | Foreign key ไปยัง Teacher |
| `day_of_week` | int | วันในสัปดาห์ (0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์) |
| `start_time` | string | เวลาเริ่มต้น รูปแบบ "HH:MM" (24 ชั่วโมง) |
| `end_time` | string | เวลาสิ้นสุด รูปแบบ "HH:MM" (24 ชั่วโมง) |
| `is_active` | bool | สถานะการใช้งาน (true/false) |
| `notes` | string | หมายเหตุเพิ่มเติม (optional) |

### Day of Week Reference
```
0 = Sunday (อาทิตย์)
1 = Monday (จันทร์)
2 = Tuesday (อังคาร)
3 = Wednesday (พุธ)
4 = Thursday (พฤหัสบดี)
5 = Friday (ศุกร์)
6 = Saturday (เสาร์)
```

---

## API Endpoints

### 1. Get Teacher Working Hours

ดูเวลาทำงานทั้งหมดของครู

**Endpoint:** `GET /api/teachers/:id/working-hours`

**Authorization:** Teacher ขึ้นไป

**Response:**
```json
{
  "success": true,
  "teacher_id": 5,
  "working_hours": [
    {
      "id": 1,
      "teacher_id": 5,
      "day_of_week": 1,
      "start_time": "08:00",
      "end_time": "12:00",
      "is_active": true,
      "notes": "Morning class"
    },
    {
      "id": 2,
      "teacher_id": 5,
      "day_of_week": 1,
      "start_time": "14:00",
      "end_time": "18:00",
      "is_active": true,
      "notes": "Afternoon class"
    }
  ],
  "grouped": {
    "1": [
      { "id": 1, "start_time": "08:00", "end_time": "12:00" },
      { "id": 2, "start_time": "14:00", "end_time": "18:00" }
    ]
  }
}
```

---

### 2. Add Working Hours

เพิ่มช่วงเวลาทำงานใหม่

**Endpoint:** `POST /api/teachers/:id/working-hours`

**Authorization:** Owner/Admin เท่านั้น

**Request Body:**
```json
{
  "day_of_week": 1,
  "start_time": "08:00",
  "end_time": "12:00",
  "notes": "Morning shift"
}
```

**Response:**
```json
{
  "success": true,
  "working_hour": {
    "id": 1,
    "teacher_id": 5,
    "day_of_week": 1,
    "start_time": "08:00",
    "end_time": "12:00",
    "is_active": true,
    "notes": "Morning shift"
  }
}
```

**Validation:**
- `day_of_week`: 0-6 เท่านั้น
- `start_time` & `end_time`: ต้องเป็นรูปแบบ HH:MM
- `end_time` > `start_time`
- ห้ามช่วงเวลาทับซ้อนกับที่มีอยู่

---

### 3. Update Working Hours

แก้ไขช่วงเวลาทำงาน

**Endpoint:** `PUT /api/teachers/:id/working-hours/:whid`

**Authorization:** Owner/Admin เท่านั้น

**Request Body (ส่งเฉพาะที่ต้องการแก้):**
```json
{
  "start_time": "09:00",
  "end_time": "13:00",
  "notes": "Updated morning shift"
}
```

**Response:**
```json
{
  "success": true,
  "working_hour": {
    "id": 1,
    "teacher_id": 5,
    "day_of_week": 1,
    "start_time": "09:00",
    "end_time": "13:00",
    "is_active": true,
    "notes": "Updated morning shift"
  }
}
```

---

### 4. Delete Working Hours

ลบ (ปิดการใช้งาน) ช่วงเวลาทำงาน

**Endpoint:** `DELETE /api/teachers/:id/working-hours/:whid`

**Authorization:** Owner/Admin เท่านั้น

**Response:**
```json
{
  "success": true,
  "message": "working hour deactivated successfully"
}
```

**Note:** ไม่ได้ลบจริงออกจากฐานข้อมูล แต่จะตั้งค่า `is_active = false`

---

### 5. Batch Set Working Hours

ตั้งเวลาทำงานหลายช่วงพร้อมกัน

**Endpoint:** `POST /api/teachers/:id/working-hours/batch`

**Authorization:** Owner/Admin เท่านั้น

**Request Body:**
```json
{
  "replace_existing": true,
  "working_hours": [
    {
      "day_of_week": 1,
      "start_time": "08:00",
      "end_time": "12:00",
      "notes": "Monday morning"
    },
    {
      "day_of_week": 1,
      "start_time": "14:00",
      "end_time": "18:00",
      "notes": "Monday afternoon"
    },
    {
      "day_of_week": 3,
      "start_time": "09:00",
      "end_time": "17:00",
      "notes": "Wednesday full day"
    }
  ]
}
```

**Parameters:**
- `replace_existing`: 
  - `true` = ปิดการใช้งานเวลาเดิมทั้งหมดและสร้างใหม่
  - `false` = เพิ่มเข้าไปกับที่มีอยู่

**Response:**
```json
{
  "success": true,
  "message": "working hours updated successfully",
  "working_hours": [
    { "id": 10, "day_of_week": 1, "start_time": "08:00", "end_time": "12:00" },
    { "id": 11, "day_of_week": 1, "start_time": "14:00", "end_time": "18:00" },
    { "id": 12, "day_of_week": 3, "start_time": "09:00", "end_time": "17:00" }
  ]
}
```

---

### 6. Find Available Teachers

ค้นหาครูที่ว่างในช่วงเวลาที่ระบุ

**Endpoint:** `GET /api/teachers/available`

**Authorization:** Teacher ขึ้นไป

**Query Parameters:**
- `day_of_week` (required): วันในสัปดาห์ (0-6)
- `start_time` (required): เวลาเริ่มต้น (HH:MM)
- `end_time` (required): เวลาสิ้นสุด (HH:MM)

**Example:**
```
GET /api/teachers/available?day_of_week=1&start_time=14:00&end_time=16:00
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "teachers": [
    {
      "id": 5,
      "user_id": 10,
      "first_name_th": "สมชาย",
      "last_name_th": "ใจดี",
      "nickname_th": "ครูเจมส์",
      "teacher_type": "Both",
      "hourly_rate": 500,
      "active": true
    },
    {
      "id": 8,
      "user_id": 15,
      "first_name_en": "Sarah",
      "last_name_en": "Johnson",
      "nickname_en": "Teacher Sarah",
      "teacher_type": "Adults",
      "hourly_rate": 600,
      "active": true
    }
  ]
}
```

---

## Use Cases & Examples

### Use Case 1: ตั้งเวลาทำงานครูใหม่

**สถานการณ์:** ครู John เพิ่งเข้ามาใหม่ ต้องตั้งเวลาทำงานให้
- วันจันทร์-ศุกร์: 09:00-12:00 และ 14:00-17:00

**Step 1:** ตั้งเวลาแบบ Batch
```bash
POST /api/teachers/25/working-hours/batch
Content-Type: application/json

{
  "replace_existing": true,
  "working_hours": [
    // Monday
    {"day_of_week": 1, "start_time": "09:00", "end_time": "12:00", "notes": "Mon morning"},
    {"day_of_week": 1, "start_time": "14:00", "end_time": "17:00", "notes": "Mon afternoon"},
    // Tuesday
    {"day_of_week": 2, "start_time": "09:00", "end_time": "12:00", "notes": "Tue morning"},
    {"day_of_week": 2, "start_time": "14:00", "end_time": "17:00", "notes": "Tue afternoon"},
    // Wednesday
    {"day_of_week": 3, "start_time": "09:00", "end_time": "12:00", "notes": "Wed morning"},
    {"day_of_week": 3, "start_time": "14:00", "end_time": "17:00", "notes": "Wed afternoon"},
    // Thursday
    {"day_of_week": 4, "start_time": "09:00", "end_time": "12:00", "notes": "Thu morning"},
    {"day_of_week": 4, "start_time": "14:00", "end_time": "17:00", "notes": "Thu afternoon"},
    // Friday
    {"day_of_week": 5, "start_time": "09:00", "end_time": "12:00", "notes": "Fri morning"},
    {"day_of_week": 5, "start_time": "14:00", "end_time": "17:00", "notes": "Fri afternoon"}
  ]
}
```

---

### Use Case 2: เพิ่มช่วงเวลาพิเศษ

**สถานการณ์:** ครูมีคลาสพิเศษเพิ่มวันเสาร์ 10:00-12:00

```bash
POST /api/teachers/25/working-hours
Content-Type: application/json

{
  "day_of_week": 6,
  "start_time": "10:00",
  "end_time": "12:00",
  "notes": "Saturday special class"
}
```

---

### Use Case 3: แก้ไขเวลาทำงาน

**สถานการณ์:** ครูขอเปลี่ยนเวลาวันจันทร์เช้าจาก 09:00-12:00 เป็น 08:00-11:00

**Step 1:** ดูเวลาปัจจุบันเพื่อหา ID
```bash
GET /api/teachers/25/working-hours
```

**Step 2:** แก้ไข
```bash
PUT /api/teachers/25/working-hours/101
Content-Type: application/json

{
  "start_time": "08:00",
  "end_time": "11:00"
}
```

---

### Use Case 4: ครูลาพัก/ยกเลิกวัน

**สถานการณ์:** ครูลาป่วยทั้งวันพุธ ต้องปิดการทำงาน

**Step 1:** หา IDs ของวันพุธ
```bash
GET /api/teachers/25/working-hours
```

**Step 2:** ปิดการใช้งานทีละช่วง
```bash
DELETE /api/teachers/25/working-hours/105  # พุธเช้า
DELETE /api/teachers/25/working-hours/106  # พุธบ่าย
```

---

### Use Case 5: หาครูที่ว่าง

**สถานการณ์:** ต้องการจัดคลาสวันอังคาร 15:00-17:00 หาครูที่ว่าง

```bash
GET /api/teachers/available?day_of_week=2&start_time=15:00&end_time=17:00
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "teachers": [
    {
      "id": 25,
      "first_name_th": "สมชาย",
      "last_name_th": "ใจดี",
      "teacher_type": "Both",
      "hourly_rate": 500
    },
    {
      "id": 30,
      "first_name_en": "Emma",
      "last_name_en": "Wilson",
      "teacher_type": "Adults",
      "hourly_rate": 700
    }
  ]
}
```

---

### Use Case 6: ครูมีเวลาทำงานไม่ต่อเนื่อง

**สถานการณ์:** ครูทำงาน 3 ช่วงในวันเดียว
- 08:00-10:00 (คลาสเด็ก)
- 14:00-16:00 (คลาสผู้ใหญ่)
- 18:00-20:00 (คลาสพิเศษ)

```bash
POST /api/teachers/30/working-hours/batch
Content-Type: application/json

{
  "replace_existing": false,
  "working_hours": [
    {
      "day_of_week": 1,
      "start_time": "08:00",
      "end_time": "10:00",
      "notes": "Kids class"
    },
    {
      "day_of_week": 1,
      "start_time": "14:00",
      "end_time": "16:00",
      "notes": "Adults class"
    },
    {
      "day_of_week": 1,
      "start_time": "18:00",
      "end_time": "20:00",
      "notes": "Evening special"
    }
  ]
}
```

---

### Use Case 7: Reset เวลาทำงานทั้งหมด

**สถานการณ์:** เทอมใหม่ ต้องการเปลี่ยนตารางครูใหม่หมด

```bash
POST /api/teachers/25/working-hours/batch
Content-Type: application/json

{
  "replace_existing": true,
  "working_hours": [
    // ตารางใหม่
    {"day_of_week": 1, "start_time": "13:00", "end_time": "18:00"},
    {"day_of_week": 3, "start_time": "13:00", "end_time": "18:00"},
    {"day_of_week": 5, "start_time": "13:00", "end_time": "18:00"}
  ]
}
```

---

### Use Case 8: ตรวจสอบเวลาว่างของครูหลายคน

**สถานการณ์:** ต้องการหาครูสำหรับคลาส 3 วัน

**ช่วงที่ต้องการ:**
- จันทร์ 14:00-16:00
- พุธ 10:00-12:00  
- ศุกร์ 15:00-17:00

```bash
# Check Monday
GET /api/teachers/available?day_of_week=1&start_time=14:00&end_time=16:00

# Check Wednesday
GET /api/teachers/available?day_of_week=3&start_time=10:00&end_time=12:00

# Check Friday
GET /api/teachers/available?day_of_week=5&start_time=15:00&end_time=17:00
```

---

## Error Handling

### Common Errors

#### 1. Invalid Day of Week
```json
{
  "error": "day_of_week must be between 0 (Sunday) and 6 (Saturday)"
}
```

#### 2. Invalid Time Format
```json
{
  "error": "invalid start_time format, must be HH:MM (e.g., 08:00)"
}
```

#### 3. End Time Before Start Time
```json
{
  "error": "end_time must be after start_time"
}
```

#### 4. Overlapping Time Slots
```json
{
  "error": "time slot overlaps with existing working hours"
}
```

**Example:** ถ้ามีเวลา 08:00-12:00 อยู่แล้ว และพยายามเพิ่ม 10:00-14:00 จะถูกปฏิเสธ

#### 5. Teacher Not Found
```json
{
  "error": "teacher not found"
}
```

#### 6. Working Hour Not Found
```json
{
  "error": "working hour not found"
}
```

#### 7. Unauthorized
```json
{
  "error": "unauthorized"
}
```

---

## Best Practices

### 1. ตั้งเวลาครูใหม่
✅ ใช้ **batch endpoint** เพื่อตั้งเวลาทั้งอาทิตย์พร้อมกัน  
✅ ตั้ง `replace_existing: true` เพื่อหลีกเลี่ยงเวลาเก่าที่ไม่ต้องการ

### 2. แก้ไขเวลา
✅ ดูเวลาปัจจุบันก่อนด้วย GET endpoint  
✅ ใช้ PUT เฉพาะช่วงที่ต้องการแก้

### 3. ลบเวลา
✅ ใช้ DELETE (soft delete) เพื่อเก็บประวัติ  
✅ หากต้องการลบจริงๆ ให้ติดต่อ DBA

### 4. ค้นหาครูว่าง
✅ ระบุช่วงเวลาที่แน่นอน  
✅ ตรวจสอบ `active` status ของครูด้วย  
✅ พิจารณา `teacher_type` และ `hourly_rate`

### 5. Validation
✅ ใช้เวลา 24 ชั่วโมง (00:00 - 23:59)  
✅ ใช้รูปแบบ HH:MM เสมอ (เติม 0 ข้างหน้าเช่น 09:00)  
✅ ตรวจสอบว่าครูอยู่ในสาขาที่ถูกต้อง

---

## Testing Examples

### cURL Examples

**Get working hours:**
```bash
curl -X GET "http://localhost:3000/api/teachers/5/working-hours" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Add working hours:**
```bash
curl -X POST "http://localhost:3000/api/teachers/5/working-hours" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "day_of_week": 1,
    "start_time": "09:00",
    "end_time": "12:00",
    "notes": "Morning class"
  }'
```

**Find available teachers:**
```bash
curl -X GET "http://localhost:3000/api/teachers/available?day_of_week=1&start_time=14:00&end_time=16:00" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/Axios Example

```javascript
// Get teacher working hours
const response = await axios.get(
  `${API_BASE_URL}/teachers/${teacherId}/working-hours`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);

// Add working hours
await axios.post(
  `${API_BASE_URL}/teachers/${teacherId}/working-hours`,
  {
    day_of_week: 1,
    start_time: "09:00",
    end_time: "12:00",
    notes: "Morning shift"
  },
  {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

// Find available teachers
const available = await axios.get(
  `${API_BASE_URL}/teachers/available`,
  {
    params: {
      day_of_week: 1,
      start_time: "14:00",
      end_time: "16:00"
    },
    headers: { Authorization: `Bearer ${token}` }
  }
);
```

---

## Migration SQL

```sql
CREATE TABLE teacher_working_hours (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT UNSIGNED NOT NULL,
    day_of_week INT NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
    start_time VARCHAR(5) NOT NULL COMMENT 'Format: HH:MM (24-hour)',
    end_time VARCHAR(5) NOT NULL COMMENT 'Format: HH:MM (24-hour)',
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME,
    
    INDEX idx_teacher_day (teacher_id, day_of_week),
    INDEX idx_active (is_active),
    INDEX idx_time_range (start_time, end_time),
    
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Support

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อ:
- 📧 Email: dev@englishkorat.com
- 💬 LINE: @englishkorat-dev
- 📞 Tel: 044-123-456

---

**Last Updated:** October 21, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
