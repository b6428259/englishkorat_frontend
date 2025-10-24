# Session Management API - Frontend Guide

คู่มือการจัดการ Session และ Makeup Class สำหรับ Frontend Developers

---

## Table of Contents

1. [การสร้าง Session ธรรมดา](#1-การสร้าง-session-ธรรมดา)
2. [การสร้าง Makeup Session](#2-การสร้าง-makeup-session)
3. [การอัปเดต Session](#3-การอัปเดต-session)
4. [Status และ Error Cases](#4-status-และ-error-cases)
5. [Flow Diagrams](#5-flow-diagrams)

---

## 1. การสร้าง Session ธรรมดา

### Endpoint
```
POST /api/schedules/:schedule_id/sessions
```

### Authentication
Required: `Bearer Token` (Admin, Owner, หรือ Teacher ที่เป็น Default Teacher ของ Schedule)

### Request Body

```typescript
interface AddSessionRequest {
  date: string;                    // Required: "2025-10-23" (YYYY-MM-DD)
  start_time: string;              // Required: "14:00" (HH:MM)
  end_time?: string;               // Optional: "16:00" (HH:MM)
  hours?: number;                  // Optional: จำนวนชั่วโมง (ถ้าไม่ใส่ end_time)
  assigned_teacher_id?: number;    // Optional: ID ของครูที่สอน
  room_id?: number;                // Optional: ID ของห้องเรียน
  notes?: string;                  // Optional: หมายเหตุ
}
```

### สำคัญ! การจัดเรียง Session Number

⚠️ **Session Number จะถูกกำหนดตามลำดับเวลา (Chronological Order) โดยอัตโนมัติ**

เมื่อสร้าง session ใหม่:
- ระบบจะเช็คว่ามี session ที่มีเวลาหลังจาก session ใหม่หรือไม่
- ถ้ามี: session ใหม่จะแทรกตัวเองเข้าไปตามลำดับเวลา และ session ที่อยู่หลังจะถูกเลื่อน session_number ขึ้นทั้งหมด
- ถ้าไม่มี: session ใหม่จะเป็น session สุดท้าย

**ตัวอย่าง:**

สถานการณ์ก่อนสร้าง:
```
Session #15 - Week 15 - 23/10/25 เวลา 14:00-15:00
Session #16 - Week 16 - 24/10/25 เวลา 11:00-12:00
Session #17 - Week 17 - 30/10/25 เวลา 14:00-15:00
```

สร้าง Session ใหม่ วันที่ 25/10/25 เวลา 13:00-14:00:
```
Session #15 - Week 15 - 23/10/25 เวลา 14:00-15:00
Session #16 - Week 16 - 24/10/25 เวลา 11:00-12:00
Session #17 - Week 17 - 25/10/25 เวลา 13:00-14:00 ⭐ (ใหม่ แทรกตรงนี้)
Session #18 - Week 18 - 30/10/25 เวลา 14:00-15:00 (เลื่อนจาก #17 → #18)
```

### Use Cases ที่พบบ่อย

#### Case 1: สร้าง Session พื้นฐาน (มีเวลาเริ่ม-จบ)
```javascript
const createBasicSession = async (scheduleId) => {
  const response = await fetch(`/api/schedules/${scheduleId}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      date: "2025-10-25",
      start_time: "14:00",
      end_time: "16:00",
      room_id: 3,
      assigned_teacher_id: 5
    })
  });
  
  const result = await response.json();
  return result;
};
```

#### Case 2: สร้าง Session โดยระบุระยะเวลา (hours)
```javascript
const createSessionWithDuration = async (scheduleId) => {
  const response = await fetch(`/api/schedules/${scheduleId}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      date: "2025-10-25",
      start_time: "09:00",
      hours: 2,  // เรียน 2 ชั่วโมง (09:00-11:00)
      room_id: 1
    })
  });
  
  return await response.json();
};
```

#### Case 3: สร้าง Session แบบเร็ว (ใช้ค่า default จาก schedule)
```javascript
// ระบบจะใช้ duration จาก schedule.minutes_per_session หรือ hours_per_session
const createQuickSession = async (scheduleId) => {
  const response = await fetch(`/api/schedules/${scheduleId}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      date: "2025-10-26",
      start_time: "15:30"
      // ไม่ระบุ end_time หรือ hours - จะใช้ค่าจาก schedule
    })
  });
  
  return await response.json();
};
```

#### Case 4: แทรก Session ตรงกลาง (Admin สร้างให้ครู)
```javascript
// สร้าง session แทรกระหว่าง session ที่มีอยู่
// ระบบจะจัดการ session_number อัตโนมัติตามลำดับเวลา
const insertMiddleSession = async (scheduleId) => {
  const response = await fetch(`/api/schedules/${scheduleId}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      date: "2025-10-25",
      start_time: "13:00",
      end_time: "14:00",
      assigned_teacher_id: 3,
      room_id: 2,
      notes: "Session พิเศษเพิ่มเติมสำหรับทบทวนบทเรียน"
    })
  });
  
  const result = await response.json();
  
  // result.session.session_number จะถูกกำหนดตามลำดับเวลาอัตโนมัติ
  // Sessions ที่มีเวลาหลังจากนี้จะถูกเลื่อน session_number ขึ้นอัตโนมัติ
  
  return result;
};
```

### Response

#### Success Response (201 Created)
```json
{
  "message": "Session added successfully",
  "session": {
    "id": 156,
    "schedule_id": 12,
    "session_date": "2025-10-25T00:00:00Z",
    "start_time": "2025-10-25T14:00:00+07:00",
    "end_time": "2025-10-25T16:00:00+07:00",
    "session_number": 8,
    "week_number": 3,
    "status": "assigned",
    "room_id": 3,
    "assigned_teacher_id": 5,
    "notes": "",
    "created_at": "2025-10-23T10:30:00Z"
  }
}
```

### Error Cases

#### 1. Invalid Schedule ID (404)
```json
{
  "error": "Schedule not found"
}
```

#### 2. Missing Required Fields (400)
```json
{
  "error": "date and start_time are required"
}
```

#### 3. Invalid Date Format (400)
```json
{
  "error": "Invalid date format (use YYYY-MM-DD)"
}
```

#### 4. Invalid Time Format (400)
```json
{
  "error": "Invalid start_time format (use HH:MM)"
}
```

#### 5. End Time Before Start Time (400)
```json
{
  "error": "end_time must be after start_time"
}
```

#### 6. Unauthorized (403)
```json
{
  "error": "You are not authorized to add a session to this schedule"
}
```

---

## 2. การสร้าง Makeup Session

### 🔄 Workflow: 3-Step Cancellation Approval Process

**การสร้าง Makeup Session ต้องผ่าน 3 ขั้นตอน:**

```
Step 1: Teacher Request → Step 2: Admin Approve → Step 3: Create Makeup
```

#### Step 1: Teacher ขอยกเลิก Session (Request Cancellation)

**Endpoint:**
```
POST /api/schedules/sessions/:id/request-cancellation
```

**Authentication:** Teacher, Admin, Owner

**Request Body:**
```typescript
interface CancellationRequest {
  reason: string; // Required: เหตุผลในการขอยกเลิก
}
```

**Example:**
```javascript
const requestCancellation = async (sessionId, reason) => {
  const response = await fetch(`/api/schedules/sessions/${sessionId}/request-cancellation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });

  const result = await response.json();
  
  if (response.ok) {
    console.log('Cancellation request submitted');
    // Session status จะเปลี่ยนเป็น "cancellation_pending"
    // Admin จะได้รับ notification
  } else {
    console.error(result.error);
  }
};

// ตัวอย่างการใช้งาน
await requestCancellation(123, 'ครูป่วย ไม่สามารถสอนได้');
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Cancellation request submitted successfully",
  "session": {
    "id": 123,
    "status": "cancellation_pending",
    "reason": "ครูป่วย ไม่สามารถสอนได้"
  }
}
```

---

#### Step 2: Admin อนุมัติการยกเลิก (Approve Cancellation)

**Endpoint:**
```
POST /api/schedules/sessions/:id/approve-cancellation
```

**Authentication:** Admin, Owner only

**No request body required**

**Example:**
```javascript
const approveCancellation = async (sessionId) => {
  const response = await fetch(`/api/schedules/sessions/${sessionId}/approve-cancellation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  
  if (response.ok) {
    console.log('Cancellation approved');
    // Session status จะเปลี่ยนเป็น "cancelled"
    // Teacher จะได้รับ notification ว่าสามารถสร้าง makeup ได้แล้ว
  } else {
    console.error(result.error);
  }
};
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Cancellation approved successfully. Teacher can now create makeup session.",
  "session": {
    "id": 123,
    "status": "cancelled",
    "cancelling_reason": "ครูป่วย ไม่สามารถสอนได้"
  }
}
```

**Response (Error - Not Pending):**
```json
{
  "error": "Session is not pending cancellation approval",
  "current_status": "scheduled"
}
```

---

#### Step 3: สร้าง Makeup Session (หลังจาก Admin อนุมัติแล้ว)

**⚠️ สำคัญ:** 
- ต้องได้รับการอนุมัติจาก Admin ก่อน (Step 2) ถึงจะสร้าง Makeup Session ได้
- ถ้ายังไม่ได้รับการอนุมัติ API จะ return error: `"Cannot create makeup session - cancellation has not been approved by admin"`

### ⚠️ สำคัญ: Makeup Quota System

**แต่ละ Schedule มีจำนวน makeup class จำกัด** (default: 2 classes)

- **make_up_quota**: จำนวนสิทธิ์ makeup ทั้งหมดที่มี (default: 2)
- **make_up_remaining**: จำนวนสิทธิ์ที่เหลืออยู่
- **make_up_used**: จำนวนที่ใช้ไปแล้ว

**ระบบจะตรวจสอบ quota อัตโนมัติ:**
- ✅ ถ้ามีสิทธิ์เหลือ (`make_up_remaining > 0`): สร้าง makeup session และหักสิทธิ์ทันที
- ❌ ถ้าสิทธิ์หมด (`make_up_remaining = 0`): ไม่สามารถสร้าง makeup session ได้

### Endpoint
```
POST /api/schedules/sessions/makeup
```

### Authentication
Required: `Bearer Token` (Admin, Owner, หรือ Teacher)

### Request Body

```typescript
interface CreateMakeupSessionRequest {
  original_session_id: number;     // Required: ID ของ session เดิมที่ต้องเรียนชดเชย
  new_session_date: string;        // Required: "2025-10-30T00:00:00Z" (ISO 8601)
  new_start_time: string;          // Required: "16:00" (HH:MM)
  cancelling_reason: string;       // Required: เหตุผลที่ยกเลิก session เดิม
  new_session_status: string;      // Required: "cancelled" | "rescheduled" | "no-show"
}
```

### Status Options

| Status | ความหมาย | Use Case |
|--------|----------|----------|
| `cancelled` | ยกเลิกคาบเรียน | คาบเรียนถูกยกเลิก ต้องเรียนชดเชย |
| `rescheduled` | เลื่อนคาบเรียน | เลื่อนคาบเรียนไปวันใหม่ |
| `no-show` | ไม่มาเรียน | นักเรียนไม่มาเรียน ต้องเรียนชดเชย |

### Use Cases ที่พบบ่อย

#### Case 0: ตรวจสอบ Makeup Quota ก่อนสร้าง (แนะนำ)
```javascript
const checkMakeupQuota = async (scheduleId) => {
  // ดึงข้อมูล schedule เพื่อเช็ค quota
  const response = await fetch(`/api/schedules/${scheduleId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const schedule = await response.json();
  
  if (schedule.make_up_remaining <= 0) {
    alert(`ไม่สามารถสร้าง Makeup Class ได้\nใช้สิทธิ์หมดแล้ว (${schedule.make_up_used}/${schedule.make_up_quota})`);
    return false;
  }
  
  // แสดงจำนวนสิทธิ์ที่เหลือ
  console.log(`Makeup Quota Remaining: ${schedule.make_up_remaining}/${schedule.make_up_quota}`);
  return true;
};

// ใช้งาน
const createMakeupWithCheck = async (scheduleId, makeupData) => {
  // เช็ค quota ก่อน
  const hasQuota = await checkMakeupQuota(scheduleId);
  if (!hasQuota) {
    return null;
  }
  
  // สร้าง makeup session
  return await createMakeupSession(makeupData);
};
```

#### Case 1: สร้าง Makeup เพราะคาบเรียนถูกยกเลิก
```javascript
const createMakeupForCancelled = async () => {
  const response = await fetch('/api/schedules/sessions/makeup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      original_session_id: 45,
      new_session_date: "2025-10-30T00:00:00Z",
      new_start_time: "16:00",
      cancelling_reason: "ครูป่วย ไม่สามารถสอนได้",
      new_session_status: "cancelled"
    })
  });
  
  const result = await response.json();
  return result;
};
```

#### Case 2: สร้าง Makeup เพราะนักเรียนไม่มาเรียน
```javascript
const createMakeupForNoShow = async () => {
  const response = await fetch('/api/schedules/sessions/makeup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      original_session_id: 47,
      new_session_date: "2025-11-02T00:00:00Z",
      new_start_time: "14:30",
      cancelling_reason: "นักเรียนไม่มาเรียนโดยไม่แจ้งล่วงหน้า",
      new_session_status: "no-show"
    })
  });
  
  return await response.json();
};
```

#### Case 3: เลื่อนคาบเรียน (Reschedule)
```javascript
const rescheduleSession = async () => {
  const response = await fetch('/api/schedules/sessions/makeup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      original_session_id: 50,
      new_session_date: "2025-11-05T00:00:00Z",
      new_start_time: "10:00",
      cancelling_reason: "เลื่อนคาบเรียนเนื่องจากวันหยุดนักขัตฤกษ์",
      new_session_status: "rescheduled"
    })
  });
  
  return await response.json();
};
```

### Response

#### Success Response (201 Created)
```json
{
  "message": "Makeup session created successfully",
  "makeup_session": {
    "id": 158,
    "schedule_id": 12,
    "session_date": "2025-10-30T00:00:00Z",
    "start_time": "2025-10-30T16:00:00+07:00",
    "end_time": "2025-10-30T18:00:00+07:00",
    "session_number": 5,
    "week_number": 4,
    "status": "scheduled",
    "is_makeup": true,
    "makeup_for_session_id": 45,
    "assigned_teacher_id": 5,
    "room_id": 3,
    "created_at": "2025-10-23T11:00:00Z"
  }
}
```

**สังเกต:**
- `is_makeup: true` - บ่งบอกว่าเป็น makeup session
- `makeup_for_session_id: 45` - อ้างอิงถึง session เดิมที่ถูกยกเลิก
- `status: "scheduled"` - makeup session จะมีสถานะ "scheduled" ใหม่
- เวลาเรียนคือ duration เดียวกับ session เดิม

### Error Cases

#### 1. ⚠️ Makeup Quota Exhausted (400) - สำคัญ!
```json
{
  "error": "No makeup quota remaining for this schedule",
  "makeup_used": 2,
  "makeup_quota": 2,
  "schedule_id": 12
}
```

**การจัดการ:**
```javascript
const handleMakeupCreation = async (makeupData) => {
  try {
    const response = await fetch('/api/schedules/sessions/makeup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(makeupData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // ถ้าสิทธิ์หมด
      if (result.makeup_used !== undefined) {
        alert(`ไม่สามารถสร้าง Makeup Class ได้
        
สิทธิ์ใช้หมดแล้ว: ${result.makeup_used}/${result.makeup_quota}
        
กรุณาติดต่อแอดมินเพื่อเพิ่มสิทธิ์`);
        
        // นำทางไปหน้าติดต่อแอดมิน
        // window.location.href = '/contact-admin';
      }
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};
```

#### 2. Original Session Not Found (404)
```json
{
  "error": "Original session not found"
}
```

#### 3. Schedule Not Found (404)
```json
{
  "error": "Schedule not found"
}
```

#### 4. Invalid Time Format (400)
```json
{
  "error": "Invalid time format, use HH:MM"
}
```

#### 5. Invalid Status (400)
```json
{
  "error": "new_session_status must be one of: cancelled, rescheduled, no-show"
}
```

#### 6. Missing Required Fields (400)
```json
{
  "error": "original_session_id, new_session_date, new_start_time, cancelling_reason, and new_session_status are required"
}
```

#### 7. Unauthorized (403)
```json
{
  "error": "Only admin, owner, and teacher can create makeup sessions"
}
```

---

## 3. การอัปเดต Session

### Endpoint
```
PATCH /api/schedules/sessions/:session_id
```

### Authentication
Required: `Bearer Token` (Admin, Owner, หรือ Teacher)

### Request Body

```typescript
interface UpdateSessionRequest {
  // Timing
  session_date?: string;           // "2025-10-25" or "2025-10-25T00:00:00Z"
  start_time?: string;             // "14:00" or "2025-10-25T14:00:00+07:00"
  end_time?: string;               // "16:00" or "2025-10-25T16:00:00+07:00"
  
  // Assignments
  assigned_teacher_id?: number;
  room_id?: number;
  
  // Status & Notes
  status?: string;                 // "scheduled" | "assigned" | "confirmed" | etc.
  notes?: string;
  cancelling_reason?: string;
  
  // Metadata
  session_number?: number;
  week_number?: number;
}
```

### Use Cases ที่พบบ่อย

#### Case 1: เปลี่ยนเวลาเรียน
```javascript
const changeSessionTime = async (sessionId) => {
  const response = await fetch(`/api/schedules/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      start_time: "15:00",
      end_time: "17:00"
    })
  });
  
  return await response.json();
};
```

#### Case 2: เปลี่ยนห้องเรียน
```javascript
const changeRoom = async (sessionId, newRoomId) => {
  const response = await fetch(`/api/schedules/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      room_id: newRoomId
    })
  });
  
  return await response.json();
};
```

#### Case 3: เปลี่ยนครูผู้สอน
```javascript
const changeTeacher = async (sessionId, newTeacherId) => {
  const response = await fetch(`/api/schedules/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assigned_teacher_id: newTeacherId
    })
  });
  
  return await response.json();
};
```

#### Case 4: อัปเดตสถานะและหมายเหตุ
```javascript
const updateSessionStatus = async (sessionId) => {
  const response = await fetch(`/api/schedules/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: "completed",
      notes: "นักเรียนทำการบ้านเสร็จแล้ว"
    })
  });
  
  return await response.json();
};
```

#### Case 5: อัปเดตทั้งวันที่และเวลา
```javascript
const rescheduleSessionFull = async (sessionId) => {
  const response = await fetch(`/api/schedules/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      session_date: "2025-11-01",
      start_time: "10:00",
      end_time: "12:00",
      room_id: 5
    })
  });
  
  return await response.json();
};
```

### Response

#### Success Response (200 OK)
```json
{
  "message": "Session updated successfully",
  "session": {
    "id": 45,
    "schedule_id": 12,
    "session_date": "2025-11-01T00:00:00Z",
    "start_time": "2025-11-01T10:00:00+07:00",
    "end_time": "2025-11-01T12:00:00+07:00",
    "session_number": 5,
    "week_number": 3,
    "status": "assigned",
    "room_id": 5,
    "assigned_teacher_id": 5,
    "notes": "",
    "updated_at": "2025-10-23T12:00:00Z"
  }
}
```

### Error Cases

#### 1. Session Not Found (404)
```json
{
  "error": "Session not found"
}
```

#### 2. Invalid Date/Time Format (400)
```json
{
  "error": "invalid date format: 2025/10/25 (expected: 2006-01-02 or RFC3339)"
}
```

#### 3. Invalid Status (400)
```json
{
  "error": "invalid status: invalid_status (must be one of: scheduled, assigned, confirmed, completed, cancelled, rescheduled, no-show)"
}
```

#### 4. Unauthorized (403)
```json
{
  "error": "You don't have permission to update this session"
}
```

---

## 4. Makeup Quota Management

### เข้าใจระบบ Makeup Quota

ตั้งแต่ **2025-01-23** ระบบ makeup quota ถูกย้ายมาอยู่ที่ **Schedule level** (ไม่ใช่ Student level อีกต่อไป)

**ความหมาย:**
- แต่ละ **Schedule** มีสิทธิ์ makeup ของตัวเอง
- Default: 2 makeup classes ต่อ 1 schedule
- เมื่อสร้าง makeup session สำเร็จ → `make_up_remaining` ลดลง 1, `make_up_used` เพิ่มขึ้น 1
- เมื่อ `make_up_remaining = 0` → ไม่สามารถสร้าง makeup session ได้อีก

### ดึงข้อมูล Makeup Quota

#### ดูสิทธิ์ของ Schedule
```javascript
const getScheduleQuota = async (scheduleId) => {
  const response = await fetch(`/api/schedules/${scheduleId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const schedule = await response.json();
  
  return {
    total: schedule.make_up_quota,        // เช่น 2
    remaining: schedule.make_up_remaining, // เช่น 1
    used: schedule.make_up_used           // เช่น 1
  };
};
```

#### แสดง Quota Badge ใน UI
```javascript
const MakeupQuotaBadge = ({ schedule }) => {
  const percentage = (schedule.make_up_remaining / schedule.make_up_quota) * 100;
  
  // สีตามเปอร์เซ็นต์ที่เหลือ
  const color = percentage > 50 ? 'green' : percentage > 0 ? 'orange' : 'red';
  
  return (
    <div className={`quota-badge ${color}`}>
      <span className="icon">🎫</span>
      <span className="text">
        Makeup Quota: {schedule.make_up_remaining}/{schedule.make_up_quota}
      </span>
      {schedule.make_up_remaining === 0 && (
        <span className="warning">⚠️ สิทธิ์หมดแล้ว</span>
      )}
    </div>
  );
};
```

### ตั้งค่า Default Makeup Quota (Admin Only)

Admin สามารถปรับค่า default quota ได้ผ่าน **System Settings API**

#### ดูการตั้งค่าปัจจุบัน
```javascript
const getMakeupSettings = async () => {
  const response = await fetch('/api/system-settings/makeup/quota', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  return await response.json();
  // {
  //   "default_makeup_quota": { "value": 2, "type": "int" },
  //   "max_makeup_quota": { "value": 10, "type": "int" }
  // }
};
```

#### อัปเดต Default Quota
```javascript
const updateDefaultQuota = async (newQuota) => {
  const response = await fetch('/api/system-settings/default_makeup_quota', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      setting_value: newQuota.toString() // ต้องเป็น string
    })
  });
  
  return await response.json();
};

// ตัวอย่าง: เปลี่ยนจาก 2 เป็น 3
await updateDefaultQuota(3);
```

### Best Practices

#### 1. เช็ค Quota ก่อนแสดงปุ่ม "Create Makeup"
```javascript
const MakeupButton = ({ schedule, session }) => {
  const [canCreateMakeup, setCanCreateMakeup] = useState(false);
  
  useEffect(() => {
    // เช็คว่า schedule มีสิทธิ์เหลือหรือไม่
    const hasQuota = schedule.make_up_remaining > 0;
    
    // เช็คว่า session ยังไม่มี makeup
    const noExistingMakeup = !session.has_makeup_session;
    
    setCanCreateMakeup(hasQuota && noExistingMakeup);
  }, [schedule, session]);
  
  if (!canCreateMakeup) {
    return (
      <Tooltip content="ไม่สามารถสร้าง Makeup ได้ (สิทธิ์หมดแล้ว)">
        <Button disabled>
          🚫 No Makeup Quota
        </Button>
      </Tooltip>
    );
  }
  
  return (
    <Button onClick={() => openMakeupModal(session)}>
      🔄 Create Makeup ({schedule.make_up_remaining} left)
    </Button>
  );
};
```

#### 2. แสดง Warning เมื่อสิทธิ์ใกล้หมด
```javascript
const QuotaWarning = ({ schedule }) => {
  if (schedule.make_up_remaining === 0) {
    return (
      <Alert type="error">
        ⚠️ <strong>Makeup quota exhausted!</strong><br/>
        Used: {schedule.make_up_used}/{schedule.make_up_quota}<br/>
        Please contact admin to increase quota.
      </Alert>
    );
  }
  
  if (schedule.make_up_remaining === 1) {
    return (
      <Alert type="warning">
        ⚡ <strong>Only 1 makeup session remaining!</strong><br/>
        Used: {schedule.make_up_used}/{schedule.make_up_quota}
      </Alert>
    );
  }
  
  return null;
};
```

#### 3. Refresh Schedule หลังสร้าง Makeup
```javascript
const createMakeupAndRefresh = async (scheduleId, makeupData) => {
  // สร้าง makeup session
  const result = await fetch('/api/schedules/sessions/makeup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(makeupData)
  });
  
  if (result.ok) {
    // ⚠️ สำคัญ: ดึงข้อมูล schedule ใหม่เพื่ออัปเดต quota
    const scheduleResponse = await fetch(`/api/schedules/${scheduleId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const updatedSchedule = await scheduleResponse.json();
    
    // อัปเดต state ใน component
    setSchedule(updatedSchedule);
    
    // แสดงข้อความสำเร็จ
    toast.success(`Makeup session created! Remaining quota: ${updatedSchedule.make_up_remaining}`);
  }
  
  return result;
};
```

### Admin: เพิ่ม/ลดสิทธิ์ของ Schedule เฉพาะ

Admin สามารถปรับสิทธิ์ของ schedule เฉพาะได้ผ่าน endpoint:

#### Endpoint
```
PATCH /api/schedules/:id/makeup-quota
```

#### Authentication
Required: `Bearer Token` (Admin/Owner only)

#### Request Body
```typescript
interface UpdateScheduleQuotaRequest {
  new_quota: number;  // Required: จำนวนสิทธิ์ใหม่ (0-20)
  reason?: string;    // Optional: เหตุผลในการเปลี่ยน (สำหรับ audit log)
}
```

#### ตัวอย่างการใช้งาน

**Case 1: เพิ่มสิทธิ์ให้ schedule (VIP student)**
```javascript
const increaseScheduleQuota = async (scheduleId) => {
  const response = await fetch(`/api/schedules/${scheduleId}/makeup-quota`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      new_quota: 5,  // เพิ่มจาก 2 เป็น 5
      reason: "VIP student - special case requested by management"
    })
  });
  
  return await response.json();
};
```

**Case 2: ลดสิทธิ์ของ schedule (disciplinary)**
```javascript
const decreaseScheduleQuota = async (scheduleId) => {
  const response = await fetch(`/api/schedules/${scheduleId}/makeup-quota`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      new_quota: 1,  // ลดจาก 2 เป็น 1
      reason: "Student frequently misses classes without notice"
    })
  });
  
  return await response.json();
};
```

**Case 3: รีเซ็ตสิทธิ์กลับเป็น default**
```javascript
const resetScheduleQuota = async (scheduleId) => {
  const response = await fetch(`/api/schedules/${scheduleId}/makeup-quota`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      new_quota: 2,  // กลับเป็น default
      reason: "Reset to default quota"
    })
  });
  
  return await response.json();
};
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Makeup quota updated successfully",
  "schedule": {
    "id": 12,
    "old_quota": 2,
    "new_quota": 5,
    "old_remaining": 1,
    "new_remaining": 4,
    "make_up_used": 1,
    "quota_difference": 3
  }
}
```

**คำอธิบาย:**
- `old_quota`: จำนวนสิทธิ์เดิม (2)
- `new_quota`: จำนวนสิทธิ์ใหม่ (5)
- `old_remaining`: สิทธิ์ที่เหลือเดิม (1)
- `new_remaining`: สิทธิ์ที่เหลือใหม่ (4) = old_remaining + (new_quota - old_quota)
- `make_up_used`: จำนวนที่ใช้ไปแล้ว (1) - ไม่เปลี่ยน
- `quota_difference`: ผลต่างของ quota (+3)

#### Error Cases

**1. Invalid Schedule ID (400)**
```json
{
  "error": "Invalid schedule ID"
}
```

**2. Schedule Not Found (404)**
```json
{
  "error": "Schedule not found"
}
```

**3. Invalid Quota Range (400)**
```json
{
  "error": "new_quota must be between 0 and 20"
}
```

**4. Unauthorized (403)**
```json
{
  "error": "Forbidden"
}
```

#### Best Practice: แสดง Admin Panel

```javascript
const ScheduleQuotaManager = ({ schedule }) => {
  const [newQuota, setNewQuota] = useState(schedule.make_up_quota);
  const [reason, setReason] = useState('');
  
  const handleUpdateQuota = async () => {
    if (!reason.trim()) {
      alert('กรุณาระบุเหตุผล');
      return;
    }
    
    const result = await fetch(`/api/schedules/${schedule.id}/makeup-quota`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        new_quota: newQuota,
        reason: reason
      })
    });
    
    const data = await result.json();
    
    if (result.ok) {
      alert(`✅ อัปเดตสำเร็จ!\n\nเดิม: ${data.schedule.old_remaining}/${data.schedule.old_quota}\nใหม่: ${data.schedule.new_remaining}/${data.schedule.new_quota}`);
      
      // Refresh schedule data
      window.location.reload();
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  };
  
  return (
    <div className="quota-manager">
      <h3>🎫 Manage Makeup Quota</h3>
      
      <div className="current-status">
        <p>Current: {schedule.make_up_remaining}/{schedule.make_up_quota}</p>
        <p>Used: {schedule.make_up_used}</p>
      </div>
      
      <div className="form">
        <label>
          New Quota (0-20):
          <input 
            type="number" 
            min="0" 
            max="20"
            value={newQuota}
            onChange={(e) => setNewQuota(parseInt(e.target.value))}
          />
        </label>
        
        <label>
          Reason:
          <textarea 
            placeholder="e.g., VIP student, special case..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        
        <button onClick={handleUpdateQuota}>
          Update Quota
        </button>
      </div>
      
      {newQuota !== schedule.make_up_quota && (
        <div className="preview">
          <strong>Preview:</strong>
          <p>
            Remaining will change: {schedule.make_up_remaining} → {schedule.make_up_remaining + (newQuota - schedule.make_up_quota)}
          </p>
        </div>
      )}
    </div>
  );
};
```

---

## 5. Status และ Error Cases

### Session Status Types

| Status | ความหมาย | Use Case |
|--------|----------|----------|
| `scheduled` | กำหนดการแล้ว | Session ถูกสร้างแล้ว รอการยืนยัน |
| `assigned` | มอบหมายแล้ว | มีการมอบหมายครูแล้ว |
| `confirmed` | ยืนยันแล้ว | ครูยืนยันการสอนแล้ว |
| `completed` | เสร็จสิ้น | เรียนจบแล้ว |
| `cancelled` | ยกเลิก | ยกเลิกคาบเรียน |
| `rescheduled` | เลื่อนเวลา | เลื่อนไปวันอื่น |
| `no-show` | ไม่มาเรียน | นักเรียนไม่มา |

### Common Error Response Format

```typescript
interface ErrorResponse {
  error: string;  // ข้อความแสดง error
}
```

### HTTP Status Codes

| Status Code | ความหมาย | เมื่อไหร่ |
|-------------|----------|----------|
| 200 | OK | อัปเดตสำเร็จ |
| 201 | Created | สร้าง session สำเร็จ |
| 400 | Bad Request | ข้อมูลไม่ถูกต้อง (format, missing fields) |
| 403 | Forbidden | ไม่มีสิทธิ์เข้าถึง |
| 404 | Not Found | ไม่พบ session หรือ schedule |
| 500 | Internal Server Error | เกิดข้อผิดพลาดในระบบ |

---

## Best Practices

### 1. Date/Time Format
- **แนะนำ:** ใช้ ISO 8601 format สำหรับ full datetime: `2025-10-25T14:00:00+07:00`
- **Date only:** `2025-10-25` (YYYY-MM-DD)
- **Time only:** `14:00` (HH:MM)

### 2. Error Handling
```javascript
const createSession = async (scheduleId, sessionData) => {
  try {
    const response = await fetch(`/api/schedules/${scheduleId}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // Handle error
      console.error('Error:', result.error);
      alert(`Failed to create session: ${result.error}`);
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error occurred');
    return null;
  }
};
```

### 3. Validation ก่อนส่ง Request
```javascript
const validateSessionData = (data) => {
  if (!data.date) {
    throw new Error('Date is required');
  }
  
  if (!data.start_time) {
    throw new Error('Start time is required');
  }
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.date)) {
    throw new Error('Invalid date format (use YYYY-MM-DD)');
  }
  
  // Validate time format
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(data.start_time)) {
    throw new Error('Invalid time format (use HH:MM)');
  }
  
  if (data.end_time && !timeRegex.test(data.end_time)) {
    throw new Error('Invalid end time format (use HH:MM)');
  }
  
  return true;
};
```

### 4. Display Session Information
```javascript
const formatSession = (session) => {
  const date = new Date(session.session_date);
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);
  
  return {
    displayDate: date.toLocaleDateString('th-TH'),
    displayTime: `${startTime.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${endTime.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`,
    sessionNumber: session.session_number,
    weekNumber: session.week_number,
    status: session.status,
    isMakeup: session.is_makeup || false
  };
};
```

---

## Summary Table

| Feature | Endpoint | Method | Auth | Common Use |
|---------|----------|--------|------|-----------|
| สร้าง Session | `/api/schedules/:id/sessions` | POST | Required | เพิ่มคาบเรียนใหม่ |
| ขอยกเลิก Session | `/api/schedules/sessions/:id/request-cancellation` | POST | Teacher+ | Teacher ขอยกเลิกคาบ |
| อนุมัติการยกเลิก | `/api/schedules/sessions/:id/approve-cancellation` | POST | Admin | Admin อนุมัติให้ยกเลิก |
| สร้าง Makeup | `/api/schedules/sessions/makeup` | POST | Required | เรียนชดเชย (ต้อง approve ก่อน) |
| อัปเดต Session | `/api/schedules/sessions/:id` | PATCH | Required | แก้ไขเวลา/ห้อง/ครู |
| เช็ค Quota | `/api/schedules/:id` | GET | Required | ดูสิทธิ์ makeup ที่เหลือ |
| อัปเดต Schedule Quota | `/api/schedules/:id/makeup-quota` | PATCH | Admin | เพิ่ม/ลดสิทธิ์ของ schedule |
| ตั้งค่า Default Quota | `/api/system-settings/default_makeup_quota` | PUT | Admin | เปลี่ยนค่า default (เช่น 2→3) |

---

## Key Changes (2025-01-23 Makeup System Refactoring)

### ⚡ Breaking Changes
1. **Quota Tracking Moved**: จาก `Student.make_up_remaining` → `Schedule.make_up_remaining`
2. **3-Step Approval Workflow**: ต้องผ่าน Request → Approve → Create Makeup (ไม่สามารถสร้าง makeup โดยตรงได้)
3. **New Fields Added**: `CancellationRequestedAt`, `CancellationRequestedBy`, `CancellationApprovedAt`, `CancellationApprovedBy`

### 🆕 New Features
1. **Schedule-Level Quota**: แต่ละ schedule มี quota ของตัวเอง (independent)
2. **System Settings API**: Admin ปรับค่า default quota ได้ผ่าน API
3. **Better Error Messages**: บอกจำนวนสิทธิ์ที่ใช้/เหลือเมื่อ quota หมด
4. **Cancellation Approval System**: Teacher ขอยกเลิก → Admin อนุมัติ → สามารถสร้าง makeup ได้

### 📝 Frontend Action Items
- [ ] เพิ่มการแสดง quota badge ใน schedule list
- [ ] เพิ่ม UI สำหรับ Teacher ขอยกเลิก session
- [ ] เพิ่ม UI สำหรับ Admin อนุมัติการยกเลิก
- [ ] แสดง status "cancellation_pending" ใน session list
- [ ] แสดง warning เมื่อสิทธิ์ใกล้หมด (remaining = 1)
- [ ] Disable ปุ่ม "Create Makeup" ถ้ายังไม่ได้รับการอนุมัติ
- [ ] จัดการ error case เมื่อ quota หมด (แสดง contact admin message)
- [x] ให้ admin ดู/แก้ไข quota ของแต่ละ schedule ใน session details ได้ ✅ (API ready: `PATCH /api/schedules/:id/makeup-quota`)

---

---

## 6. Flow Diagrams

### Flow 1: การสร้าง Session ธรรมดา (Admin สร้างให้ครู)

```
[Admin เข้าสู่ระบบ]
        ↓
[เลือก Schedule ที่ต้องการเพิ่ม Session]
        ↓
[กรอกข้อมูล Session]
├─ วันที่ (date)
├─ เวลาเริ่ม (start_time)
├─ เวลาจบ (end_time) หรือ ระยะเวลา (hours)
├─ ครูผู้สอน (assigned_teacher_id)
├─ ห้องเรียน (room_id)
└─ หมายเหตุ (notes)
        ↓
[ส่ง POST /api/schedules/:id/sessions]
        ↓
[ระบบตรวจสอบสิทธิ์]
├─ ✅ Admin/Owner: ผ่าน
├─ ✅ Teacher (เป็น Default Teacher): ผ่าน
└─ ❌ อื่นๆ: 403 Forbidden
        ↓
[ระบบ Parse วันที่และเวลา]
├─ แปลงเป็น Asia/Bangkok timezone
├─ คำนวณ end_time (ถ้าไม่ระบุ)
└─ Validate เวลาจบต้องหลังเวลาเริ่ม
        ↓
[ระบบคำนวณ Session Number] ⭐
├─ หา Sessions ที่มีเวลาหลังจาก Session ใหม่
├─ ถ้ามี:
│   ├─ Session ใหม่ใช้ session_number ของ session แรกที่หา
│   └─ เลื่อน session_number ของ sessions หลังจากนั้นขึ้น +1
└─ ถ้าไม่มี: ใช้ MAX(session_number) + 1
        ↓
[คำนวณ Week Number]
└─ days = (session_date - schedule.start_date) / 7 + 1
        ↓
[สร้าง Session ใหม่ในฐานข้อมูล]
├─ ScheduleID
├─ Session_date, Start_time, End_time
├─ Session_number (คำนวณแล้ว)
├─ Week_number
├─ Status: "assigned" (class) หรือ "scheduled" (อื่นๆ)
├─ RoomID, AssignedTeacherID
└─ Notes
        ↓
[ส่ง Notification]
├─ ถ้ามี assigned_teacher_id: แจ้งครู
└─ ถ้าไม่ใช่ class: แจ้ง participants
        ↓
[Return 201 Created พร้อม session object]
        ↓
[Admin/Teacher เห็น Session ใหม่ในตาราง]
```

---

### Flow 2: การทำ Makeup Class (ตั้งแต่ยกเลิกจนสร้างใหม่)

#### Scenario 1: ครูป่วย ต้องยกเลิกคาบเรียน

```
[เหตุการณ์: ครูป่วยไม่สามารถสอนได้]
        ↓
[ครู/Admin ตัดสินใจยกเลิก Session]
        ↓
[เข้าสู่หน้าจัดการ Makeup Class]
        ↓
[⚠️ เช็ค Makeup Quota ก่อน] ⭐ NEW
├─ GET /api/schedules/:id
├─ ดู make_up_remaining
├─ ถ้า = 0: แสดง "สิทธิ์หมดแล้ว" และหยุด
└─ ถ้า > 0: ดำเนินการต่อ
        ↓
[กรอกข้อมูล Makeup Session]
├─ 📌 Original Session ID: 45 (session ที่ถูกยกเลิก)
├─ 📅 New Session Date: 2025-10-30T00:00:00Z
├─ ⏰ New Start Time: 16:00
├─ 💬 Cancelling Reason: "ครูป่วย ไม่สามารถสอนได้"
└─ 🔖 New Session Status: "cancelled"
        ↓
[ส่ง POST /api/schedules/sessions/makeup]
        ↓
[ระบบตรวจสอบสิทธิ์]
├─ ✅ Admin/Owner: ผ่าน
├─ ✅ Teacher: ผ่าน
└─ ❌ อื่นๆ: 403 Forbidden
        ↓
[ระบบ Validate ข้อมูล]
├─ ตรวจสอบ original_session_id มีอยู่จริง
├─ ตรวจสอบ new_session_status: "cancelled", "rescheduled", "no-show"
└─ ตรวจสอบ time format: HH:MM
        ↓
[⚠️ ระบบเช็ค Schedule Makeup Quota] ⭐ NEW
├─ โหลด Schedule โดยใช้ originalSession.ScheduleID
├─ ตรวจสอบ schedule.MakeUpRemaining > 0
├─ ถ้า <= 0:
│   └─ Return 400 Bad Request: "No makeup quota remaining"
│       {
│         "error": "No makeup quota remaining for this schedule",
│         "makeup_used": 2,
│         "makeup_quota": 2,
│         "schedule_id": 12
│       }
└─ ถ้า > 0: ดำเนินการต่อ
        ↓
[โหลด Original Session จากฐานข้อมูล]
├─ ID: 45
├─ Schedule ID: 12
├─ Start Time: 2025-10-23 14:00
├─ End Time: 2025-10-23 16:00
├─ Session Number: 17
└─ Status: "assigned" → จะเปลี่ยนเป็น "cancelled"
        ↓
[คำนวณ Duration จาก Original Session]
└─ Duration = End Time - Start Time = 2 ชั่วโมง
        ↓
[สร้าง Makeup Session ใหม่] ⭐
├─ Schedule ID: 12 (เดียวกับ original)
├─ Session Date: 2025-10-30
├─ Start Time: 16:00
├─ End Time: 18:00 (ใช้ duration เดียวกับ original)
├─ Session Number: 17 (copy จาก original)
├─ Week Number: คำนวณใหม่จาก new_session_date
├─ Status: "scheduled" (status ใหม่)
├─ is_makeup: true ⭐
├─ makeup_for_session_id: 45 ⭐ (อ้างอิงถึง original)
├─ Assigned Teacher ID: (copy จาก original)
└─ Room ID: (copy จาก original)
        ↓
[อัปเดต Original Session]
├─ Status: "cancelled" ⭐
├─ Cancelling Reason: "ครูป่วย ไม่สามารถสอนได้" ⭐
└─ บันทึกการเปลี่ยนแปลงในฐานข้อมูล
        ↓
[⚠️ หัก Makeup Quota] ⭐ NEW
├─ schedule.MakeUpRemaining -= 1  (2 → 1)
├─ schedule.MakeUpUsed += 1        (0 → 1)
└─ อัปเดต Schedule ในฐานข้อมูล
        ↓
[Commit Transaction]
└─ บันทึกทั้ง Original Session + Makeup Session + Schedule Quota
        ↓
[ส่ง Notification]
├─ แจ้งครู: "คาบเรียนถูกยกเลิก และสร้าง Makeup Session แล้ว"
├─ แจ้งนักเรียน: "คาบเรียนถูกยกเลิก กำหนดเรียนชดเชยวันที่ 30/10/25"
└─ แจ้งผู้ปกครอง (ถ้ามี)
        ↓
[Return 201 Created พร้อม makeup_session object]
        ↓
[⚠️ Frontend รับ Response และ Refresh] ⭐ NEW
├─ แสดง success message
├─ ดึง Schedule ใหม่ (GET /api/schedules/:id)
├─ อัปเดต quota display: "Makeup Quota: 1/2"
└─ อัปเดตรายการ sessions
        ↓
[Frontend แสดง]
├─ ❌ Session เดิม (23/10/25 14:00) - Status: cancelled
├─ 🔄 Makeup Session (30/10/25 16:00) - Status: scheduled, is_makeup: true
└─ 🎫 Makeup Quota Badge: 1/2 remaining (สีเหลือง)
```

---

#### Scenario 2: นักเรียนไม่มาเรียน (No-Show)

```
[เหตุการณ์: นักเรียนไม่มาเรียนโดยไม่แจ้ง]
        ↓
[ครู/Admin เช็คเข้าเรียน]
├─ Session ID: 47
├─ Date: 2025-10-24 11:00-12:00
└─ ❌ นักเรียนไม่มา
        ↓
[ครู/Admin สร้าง Makeup Session]
        ↓
[กรอกข้อมูล]
├─ Original Session ID: 47
├─ New Session Date: 2025-11-02T00:00:00Z
├─ New Start Time: 14:30
├─ Cancelling Reason: "นักเรียนไม่มาเรียนโดยไม่แจ้งล่วงหน้า"
└─ New Session Status: "no-show" ⭐
        ↓
[ส่ง POST /api/schedules/sessions/makeup]
        ↓
[ระบบประมวลผล]
├─ สร้าง Makeup Session ใหม่ (is_makeup: true)
├─ อัปเดต Original Session (Status: no-show)
└─ เก็บ Cancelling Reason
        ↓
[แจ้งนักเรียน/ผู้ปกครอง]
├─ "คุณไม่ได้เข้าเรียนในวันที่ 24/10/25"
├─ "กรุณาเข้าเรียนชดเชยในวันที่ 02/11/25 เวลา 14:30"
└─ แจ้งเตือนทาง LINE/Email
        ↓
[Return 201 Created]
        ↓
[Frontend แสดง]
├─ ⚠️ Session เดิม (24/10/25 11:00) - Status: no-show
└─ 🔄 Makeup Session (02/11/25 14:30) - is_makeup: true
```

---

#### Scenario 3: เลื่อนคาบเรียน (Reschedule) เนื่องจากวันหยุด

```
[เหตุการณ์: วันหยุดนักขัตฤกษ์]
        ↓
[Admin ต้องเลื่อนคาบเรียน]
├─ Session ID: 50
├─ Original Date: 2025-10-31 (วันหยุด)
└─ ต้องเลื่อนไปวันอื่น
        ↓
[กรอกข้อมูล Reschedule]
├─ Original Session ID: 50
├─ New Session Date: 2025-11-05T00:00:00Z
├─ New Start Time: 10:00
├─ Cancelling Reason: "เลื่อนคาบเรียนเนื่องจากวันหยุดนักขัตฤกษ์"
└─ New Session Status: "rescheduled" ⭐
        ↓
[ส่ง POST /api/schedules/sessions/makeup]
        ↓
[ระบบประมวลผล]
├─ สร้าง Session ใหม่ที่วันที่ 05/11/25
├─ อัปเดต Original Session (Status: rescheduled)
├─ is_makeup: true (เป็นการเรียนทดแทน)
└─ makeup_for_session_id: 50
        ↓
[ส่ง Notification ทันทีไปยังทุกคน]
├─ ครู: "คาบเรียนเลื่อนไปวันที่ 05/11/25 เวลา 10:00"
├─ นักเรียน: "แจ้งเตือน: คาบเรียนวันที่ 31/10/25 เลื่อนไปวันที่ 05/11/25"
└─ ผู้ปกครอง: "กรุณาทราบ คาบเรียนถูกเลื่อน..."
        ↓
[Return 201 Created]
        ↓
[Frontend แสดง]
├─ 🔄 Session เดิม (31/10/25) - Status: rescheduled
│   └─ Badge: "เลื่อนไปวันที่ 05/11/25"
└─ ✅ Session ใหม่ (05/11/25 10:00) - is_makeup: true
    └─ Badge: "Makeup for Session #50"
```

---

### Flow 3: สรุปความแตกต่างของ Status

| Status | เมื่อไหร่ใช้ | Original Session | Makeup Session | Use Case |
|--------|-------------|------------------|----------------|----------|
| **cancelled** | ยกเลิกคาบเรียน | Status: cancelled | is_makeup: true | ครูป่วย, ฉุกเฉิน |
| **rescheduled** | เลื่อนคาบเรียน | Status: rescheduled | is_makeup: true | วันหยุด, เปลี่ยนตาราง |
| **no-show** | นักเรียนไม่มา | Status: no-show | is_makeup: true | นักเรียนขาดเรียนไม่แจ้ง |

---

### Flow 4: การตรวจสอบ Makeup Session

```typescript
// ตรวจสอบว่า session เป็น makeup หรือไม่
const isMakeupSession = (session: any): boolean => {
  return session.is_makeup === true && session.makeup_for_session_id > 0;
};

// แสดง badge สำหรับ makeup session
const renderSessionBadge = (session: any) => {
  if (isMakeupSession(session)) {
    return (
      <Badge color="blue">
        🔄 Makeup for Session #{session.makeup_for_session_id}
      </Badge>
    );
  }
  
  if (session.status === 'cancelled') {
    return <Badge color="red">❌ Cancelled</Badge>;
  }
  
  if (session.status === 'rescheduled') {
    return <Badge color="orange">🔄 Rescheduled</Badge>;
  }
  
  if (session.status === 'no-show') {
    return <Badge color="yellow">⚠️ No Show</Badge>;
  }
  
  return <Badge color="green">✅ {session.status}</Badge>;
};

// หา makeup session สำหรับ original session ที่ถูกยกเลิก
const findMakeupSession = async (originalSessionId: number) => {
  const response = await fetch(
    `/api/schedules/sessions?makeup_for_session_id=${originalSessionId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return await response.json();
};
```

---

### Flow 5: Best Practices สำหรับ Frontend

#### 1. แสดง Session ในปฏิทิน
```javascript
const renderCalendarEvent = (session) => {
  const baseStyle = {
    title: `Session #${session.session_number}`,
    start: new Date(session.start_time),
    end: new Date(session.end_time),
  };
  
  // Makeup sessions - สีน้ำเงิน
  if (session.is_makeup) {
    return {
      ...baseStyle,
      backgroundColor: '#3B82F6',
      icon: '🔄',
      title: `🔄 Makeup Session #${session.session_number}`
    };
  }
  
  // Cancelled - เส้นทับ, สีแดง
  if (session.status === 'cancelled') {
    return {
      ...baseStyle,
      backgroundColor: '#EF4444',
      textDecoration: 'line-through',
      icon: '❌'
    };
  }
  
  // No-show - สีเหลือง
  if (session.status === 'no-show') {
    return {
      ...baseStyle,
      backgroundColor: '#F59E0B',
      icon: '⚠️'
    };
  }
  
  // Rescheduled - สีส้ม
  if (session.status === 'rescheduled') {
    return {
      ...baseStyle,
      backgroundColor: '#F97316',
      icon: '🔄'
    };
  }
  
  // Normal session - สีเขียว
  return {
    ...baseStyle,
    backgroundColor: '#10B981',
    icon: '✅'
  };
};
```

#### 2. แสดงความสัมพันธ์ระหว่าง Original และ Makeup
```javascript
const SessionCard = ({ session, allSessions }) => {
  // หา makeup session ถ้า session นี้ถูกยกเลิก/เลื่อน
  const makeupSession = session.status !== 'scheduled' && session.status !== 'completed'
    ? allSessions.find(s => s.makeup_for_session_id === session.id)
    : null;
  
  // หา original session ถ้า session นี้เป็น makeup
  const originalSession = session.is_makeup
    ? allSessions.find(s => s.id === session.makeup_for_session_id)
    : null;
  
  return (
    <Card>
      <h3>Session #{session.session_number}</h3>
      <p>{formatDateTime(session.start_time)} - {formatDateTime(session.end_time)}</p>
      <Badge status={session.status} />
      
      {/* แสดง link ไป makeup session */}
      {makeupSession && (
        <Alert type="info">
          This session has been {session.status}. 
          <Link to={`/sessions/${makeupSession.id}`}>
            View makeup session on {formatDate(makeupSession.session_date)}
          </Link>
        </Alert>
      )}
      
      {/* แสดง link กลับไป original session */}
      {originalSession && (
        <Alert type="info">
          This is a makeup session for 
          <Link to={`/sessions/${originalSession.id}`}>
            Session #{originalSession.session_number} on {formatDate(originalSession.session_date)}
          </Link>
        </Alert>
      )}
    </Card>
  );
};
```

#### 3. Validation ก่อนสร้าง Makeup Session
```javascript
const validateMakeupSession = (data) => {
  // ตรวจสอบ required fields
  const requiredFields = [
    'original_session_id',
    'new_session_date',
    'new_start_time',
    'cancelling_reason',
    'new_session_status'
  ];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }
  
  // ตรวจสอบ status
  const validStatuses = ['cancelled', 'rescheduled', 'no-show'];
  if (!validStatuses.includes(data.new_session_status)) {
    throw new Error(`new_session_status must be one of: ${validStatuses.join(', ')}`);
  }
  
  // ตรวจสอบ time format
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(data.new_start_time)) {
    throw new Error('new_start_time must be in HH:MM format');
  }
  
  // ตรวจสอบวันที่ใหม่ไม่ควรเป็นอดีต
  const newDate = new Date(data.new_session_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (newDate < today) {
    throw new Error('Cannot create makeup session in the past');
  }
  
  return true;
};
```

---

**Note:** เอกสารนี้ครอบคลุม use cases ที่พบบ่อยที่สุด สำหรับ edge cases หรือ advanced features อื่นๆ กรุณาดูเพิ่มเติมใน API documentation ฉบับเต็ม
