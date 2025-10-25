# Attendance System Documentation

## Overview

The **Attendance System** provides comprehensive time tracking for both teachers and students with the following key features:

- **Teacher Check-in/out**: Location-validated attendance with late detection
- **Student Attendance**: Session code-based check-in (code or QR)
- **Field Staff Support**: Manual check-in/out without location/session requirements
- **Auto Check-out**: Automatic check-out when sessions end (handles consecutive classes)
- **Admin Reports**: Daily, weekly, monthly, yearly, and individual reports

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Database Models](#database-models)
3. [Teacher Workflows](#teacher-workflows)
4. [Student Workflows](#student-workflows)
5. [Field Staff Workflows](#field-staff-workflows)
6. [Admin Reports](#admin-reports)
7. [API Endpoints](#api-endpoints)
8. [Scheduler Details](#scheduler-details)
9. [Location Validation](#location-validation)
10. [Late Detection Rules](#late-detection-rules)
11. [Examples](#examples)
12. [Best Practices](#best-practices)

---

## System Requirements

### Location Validation
- **Maximum Distance**: 500 meters from branch location
- **GPS Coordinates**: Required for regular teachers **and all students**
- **Verification**: Automatic distance calculation using Haversine formula
- **Field Staff Exception**: Only field staff teachers are exempt from location verification

### Time Rules
- **Teacher Late**: >15 minutes after scheduled start time
- **Student Late**: >15 minutes after teacher check-in time
- **Check-in Window**: Can check-in starting from scheduled start time
- **Auto Check-out**: Runs every 5 minutes, checks for completed sessions

### Consecutive Classes
- **Definition**: Classes <15 minutes apart are considered consecutive
- **Check-out Behavior**: Auto check-out only after the last consecutive class

---

## Database Models

### AttendanceSession
Session codes for student check-in (generated when teacher checks in).

```go
type AttendanceSession struct {
	BaseModel
	SessionID       uint       // FK to Schedule_Sessions
	SessionCode     string     // 6-character random code (e.g., "A5K9P2")
	QRCodeURL       string     // Optional QR code image URL
	ExpiresAt       time.Time  // Expires when session ends
	IsActive        bool       // Active/Inactive
	TeacherCheckIn  *time.Time // When teacher checked in
	GeneratedBy     uint       // FK to User (teacher)
	GeneratedByName string     // Teacher username
}
```

**Indexes**: `session_code` (unique), `session_id`, `is_active`

---

### TeacherAttendance
Teacher check-in/out records with location tracking.

```go
type TeacherAttendance struct {
	BaseModel
	TeacherID        uint       // FK to User (role=teacher)
	SessionID        *uint      // FK to Schedule_Sessions (null for field staff)
	BranchID         uint       // FK to Branch
	AttendanceDate   time.Time  // Date of attendance (date only)
	CheckInTime      time.Time  // Check-in timestamp
	CheckOutTime     *time.Time // Check-out timestamp (null until checked out)
	ScheduledStart   *time.Time // Scheduled session start time
	ScheduledEnd     *time.Time // Scheduled session end time
	Status           string     // "on-time", "late", "absent", "field-work"
	LateMinutes      int        // Minutes late (0 if on-time)
	IsFieldStaff     bool       // true for field staff
	CheckInLocation  string     // GPS JSON: {lat, lng, address}
	CheckOutLocation string     // GPS JSON (optional)
	LocationVerified bool       // true if within 500m radius
	DistanceMeters   float64    // Distance from branch
	Notes            string     // Additional notes
	IsAutoCheckout   bool       // true if auto checked out
}
```

**Indexes**: `teacher_id`, `session_id`, `attendance_date`, `branch_id`

**Status Values**:
- `on-time`: Checked in on time or early
- `late`: Checked in >15 minutes after scheduled start
- `absent`: Did not check in
- `field-work`: Field staff attendance

---

### StudentAttendance
Student attendance records for each session.

```go
type StudentAttendance struct {
	BaseModel
	StudentID        uint       // FK to User (role=student)
	SessionID        uint       // FK to Schedule_Sessions
	SessionCodeID    uint       // FK to AttendanceSession
	AttendanceDate   time.Time  // Date of attendance
	CheckInTime      time.Time  // Check-in timestamp
	CheckOutTime     *time.Time // Check-out timestamp (null until session ends)
	Status           string     // "present", "late", "absent"
	LateMinutes      int        // Minutes late (0 if on-time)
	CheckInMethod    string     // "code" or "qr"
	CheckInLocation  string     // GPS JSON: {lat, lng, address}
	LocationVerified bool       // true if within 500m radius
	DistanceMeters   float64    // Distance from branch (meters)
	IsAutoCheckout   bool       // true if auto checked out
	Notes            string     // Additional notes
}
```

**Indexes**: `student_id`, `session_id`, `attendance_date`, `session_code_id`

**Status Values**:
- `present`: Checked in on time (within 15 minutes of teacher check-in)
- `late`: Checked in >15 minutes after teacher check-in
- `absent`: Did not check in

---

## Teacher Workflows

### 1. Regular Teacher Check-in (Session-based)

**Scenario**: Teacher arrives for scheduled class

**Steps**:
1. Teacher sends GPS location + session_id
2. System validates:
   - User is a teacher
   - Session exists and is scheduled for today
   - Session is not cancelled
   - Location is within 500m of branch
   - Teacher hasn't already checked in for this session
3. System calculates late status:
   - Can check in starting from scheduled start time
   - Late if >15 minutes after scheduled start
4. System creates TeacherAttendance record
5. System automatically generates AttendanceSession code for students
6. Returns check-in status + session code

**API**: `POST /api/attendance/teacher/check-in`

---

### 2. Field Staff Check-in (No Session)

**Scenario**: Field staff (sales, etc.) starts work day

**Steps**:
1. Field staff sends check-in request with `is_field_staff: true`
2. System validates:
   - User is a teacher
   - Haven't checked in today as field staff
3. System creates TeacherAttendance record:
   - No session_id
   - No location verification
   - Status: "field-work"
4. Returns check-in status

**API**: `POST /api/attendance/teacher/check-in`

**Request Body**:
```json
{
  "is_field_staff": true,
  "notes": "Visiting schools today"
}
```

---

### 3. Teacher Check-out (Manual)

**Scenario**: Teacher manually checks out before leaving

**Steps**:
1. Teacher sends check-out request with attendance_id
2. System validates:
   - Attendance record exists
   - Belongs to current user
   - Not already checked out
3. System updates CheckOutTime
4. Returns updated attendance

**API**: `POST /api/attendance/teacher/check-out`

---

### 4. Generate/Get Session Code

**Scenario**: Teacher needs to display session code to students

**Generate New Code**:
```
POST /api/attendance/sessions/generate-code
Body: { "session_id": 123 }
```

**Get Existing Code**:
```
GET /api/attendance/sessions/123/code
```

---

## Student Workflows

### 1. Student Check-in (Code-based)

**Scenario**: Student enters session code to mark attendance

**Steps**:
1. Student enters 6-character code (e.g., "A5K9P2") **and shares GPS location**
2. System validates:
   - User is a student
   - Session code exists and is active
   - Code hasn't expired
   - **Location is within 500m of branch**
   - Student hasn't already checked in for this session
3. System calculates late status:
   - On-time: Within 15 minutes of teacher check-in
   - Late: >15 minutes after teacher check-in
4. System creates StudentAttendance record with location data
5. Returns attendance status with location verification

**API**: `POST /api/attendance/student/check-in`

**Request Body**:
```json
{
  "session_code": "A5K9P2",
  "check_in_method": "code",
  "location": {
    "latitude": 15.248800,
    "longitude": 104.852800,
    "address": "English Korat School"
  }
}
```

---

### 2. Student Check-in (QR Code)

**Scenario**: Student scans QR code displayed by teacher

**Steps**:
1. Frontend scans QR code → extracts session_code
2. **Frontend gets GPS location**
3. Frontend calls check-in API with code and location
4. Same validation as code-based check-in (including location verification)
5. `check_in_method` set to "qr"

**Request Body**:
```json
{
  "session_code": "A5K9P2",
  "check_in_method": "qr",
  "location": {
    "latitude": 15.248800,
    "longitude": 104.852800,
    "address": "English Korat School"
  }
}
```

---

### 3. View My Attendance History

**Scenario**: Student views their attendance record

**API**: `GET /api/attendance/student/history?start_date=2025-01-01&end_date=2025-01-31&limit=30&offset=0`

**Response**:
```json
{
  "success": true,
  "total": 45,
  "limit": 30,
  "offset": 0,
  "summary": {
    "present": 40,
    "late": 5,
    "absent": 0
  },
  "attendances": [...]
}
```

---

## Field Staff Workflows

### Characteristics
- **No Session Binding**: Don't need to be assigned to a session
- **No Location Verification**: Can check in from anywhere
- **Manual Check-in/out**: Both check-in and check-out are manual
- **Status**: Always marked as "field-work"

### Check-in
```json
POST /api/attendance/teacher/check-in
{
  "is_field_staff": true,
  "notes": "Visiting branch A and B today"
}
```

### Check-out
```json
POST /api/attendance/teacher/check-out
{
  "attendance_id": 789,
  "notes": "Completed all visits"
}
```

---

## Admin Reports

### 1. Daily Report
View all attendance for a specific date.

```
GET /api/attendance/reports/daily?date=2025-10-14&branch_id=1
```

**Response**:
```json
{
  "success": true,
  "date": "2025-10-14",
  "teachers": {
    "total": 15,
    "on_time": 12,
    "late": 2,
    "field_work": 1,
    "records": [...]
  },
  "students": {
    "total": 120,
    "present": 110,
    "late": 10,
    "records": [...]
  }
}
```

---

### 2. Weekly Report
View attendance for a week (Monday-Sunday).

```
GET /api/attendance/reports/weekly?start_date=2025-10-14&branch_id=1
```

---

### 3. Monthly Report
View attendance for an entire month.

```
GET /api/attendance/reports/monthly?year=2025&month=10&branch_id=1
```

---

### 4. Yearly Report
View attendance for an entire year.

```
GET /api/attendance/reports/yearly?year=2025&branch_id=1
```

---

### 5. Individual Report
View attendance for a specific person (teacher or student).

```
GET /api/attendance/reports/individual?user_id=456&start_date=2025-01-01&end_date=2025-12-31
```

**Response for Teacher**:
```json
{
  "success": true,
  "user": {
    "id": 456,
    "username": "teacher_john",
    "role": "teacher"
  },
  "total": 180,
  "on_time": 170,
  "late": 8,
  "field_work": 2,
  "attendances": [...]
}
```

**Response for Student**:
```json
{
  "success": true,
  "user": {
    "id": 789,
    "username": "student_jane",
    "role": "student"
  },
  "total": 240,
  "present": 230,
  "late": 10,
  "attendances": [...]
}
```

---

## API Endpoints

### Teacher Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/attendance/teacher/check-in` | Teacher check-in | JWT | Teacher |
| POST | `/api/attendance/teacher/check-out` | Teacher check-out | JWT | Teacher |
| GET | `/api/attendance/teacher/status` | Today's attendance status | JWT | Teacher |
| GET | `/api/attendance/teacher/history` | Attendance history | JWT | Teacher |
| POST | `/api/attendance/sessions/generate-code` | Generate session code | JWT | Teacher |
| GET | `/api/attendance/sessions/:session_id/code` | Get session code | JWT | Teacher |

---

### Student Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/attendance/student/check-in` | Student check-in | JWT | Student |
| GET | `/api/attendance/student/history` | My attendance history | JWT | Student |

---

### Admin Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/attendance/sessions/:session_id/students` | View student list | JWT | Teacher/Admin |
| GET | `/api/attendance/reports/daily` | Daily report | JWT | Admin |
| GET | `/api/attendance/reports/weekly` | Weekly report | JWT | Admin |
| GET | `/api/attendance/reports/monthly` | Monthly report | JWT | Admin |
| GET | `/api/attendance/reports/yearly` | Yearly report | JWT | Admin |
| GET | `/api/attendance/reports/individual` | Individual report | JWT | Admin |

---

## Scheduler Details

### Auto Check-out Scheduler

**Frequency**: Every 5 minutes

**Tasks**:
1. **Auto Check-out Teachers**:
   - Finds teachers with `check_out_time = NULL` and `scheduled_end < now`
   - Checks for consecutive classes (sessions <15 minutes apart)
   - Checks out only if no consecutive class found
   - Sets `is_auto_checkout = true`

2. **Auto Check-out Students**:
   - Finds students with `check_out_time = NULL` and session ended
   - Checks for consecutive classes
   - Checks out only if no consecutive class found
   - Sets `is_auto_checkout = true`

3. **Deactivate Expired Session Codes**:
   - Finds `AttendanceSession` with `is_active = true` and `expires_at < now`
   - Sets `is_active = false`

**Consecutive Class Logic**:
```
If current_session.end_time - next_session.start_time <= 15 minutes:
    → Classes are consecutive
    → Don't check out yet
    → Wait for next_session to end
```

**Logs**:
- `🔄 Running auto checkout check...`
- `✅ Auto checked out teacher ID X`
- `✅ Auto checked out N students`
- `✅ Deactivated N expired session codes`

---

## Location Validation

### Distance Calculation (Haversine Formula)

```go
func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
    const R = 6371000 // Earth radius in meters
    
    dLat := (lat2 - lat1) * math.Pi / 180
    dLon := (lon2 - lon1) * math.Pi / 180
    
    a := math.Sin(dLat/2)*math.Sin(dLat/2) +
        math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
        math.Sin(dLon/2)*math.Sin(dLon/2)
    
    c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
    
    return R * c // Distance in meters
}
```

### Location Verification Rules

**Regular Teachers**:
- Must provide GPS coordinates (latitude, longitude)
- Distance from branch must be ≤500 meters
- If distance >500m → Check-in rejected

**Students**:
- Must provide GPS coordinates (latitude, longitude)
- Distance from branch must be ≤500 meters
- If distance >500m → Check-in rejected
- Location verified for both code and QR check-in methods

**Field Staff**:
- No location verification required
- Can check in from anywhere

**Location JSON Format**:
```json
{
  "latitude": 15.248800,
  "longitude": 104.852800,
  "address": "123 Main St, Korat, Thailand"
}
```

---

## Late Detection Rules

### Teacher Late Detection

**Rule**: Check-in >15 minutes after scheduled start time

**Timeline**:
```
08:00 - Scheduled start time (can start checking in)
08:00-08:15 - On-time window
08:16+ - Late
```

**Calculation**:
```
late_minutes = check_in_time - scheduled_start_time (in minutes)
if late_minutes > 15:
    status = "late"
else:
    status = "on-time"
```

---

### Student Late Detection

**Rule**: Check-in >15 minutes after teacher check-in time

**Timeline**:
```
08:05 - Teacher checks in
08:05-08:20 - On-time window for students
08:21+ - Late for students
```

**Calculation**:
```
late_minutes = student_check_in_time - teacher_check_in_time (in minutes)
if late_minutes > 15:
    status = "late"
    late_minutes = late_minutes - 15
else:
    status = "present"
    late_minutes = 0
```

---

## Examples

### Example 1: Regular Teacher Check-in

**Request**:
```json
POST /api/attendance/teacher/check-in
Authorization: Bearer <jwt_token>

{
  "session_id": 123,
  "location": {
    "latitude": 15.248800,
    "longitude": 104.852800,
    "address": "English Korat School"
  },
  "notes": "Ready for class"
}
```

**Response (On-time)**:
```json
{
  "success": true,
  "message": "Check-in successful",
  "attendance": {
    "id": 456,
    "teacher_id": 10,
    "session_id": 123,
    "attendance_date": "2025-10-14",
    "check_in_time": "2025-10-14T08:00:00Z",
    "status": "on-time",
    "late_minutes": 0,
    "location_verified": true,
    "distance_meters": 45.5
  },
  "session_code": "A5K9P2",
  "status_info": {
    "status": "on-time",
    "late_minutes": 0
  }
}
```

**Response (Late)**:
```json
{
  "success": true,
  "message": "Check-in successful",
  "attendance": {
    "id": 457,
    "teacher_id": 10,
    "session_id": 124,
    "attendance_date": "2025-10-14",
    "check_in_time": "2025-10-14T08:20:00Z",
    "status": "late",
    "late_minutes": 20
  },
  "session_code": "B3N7M4",
  "status_info": {
    "status": "late",
    "late_minutes": 20
  }
}
```

---

### Example 2: Field Staff Check-in

**Request**:
```json
POST /api/attendance/teacher/check-in

{
  "is_field_staff": true,
  "notes": "Sales visit to branches A, B, C"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Check-in successful (Field Staff)",
  "attendance": {
    "id": 458,
    "teacher_id": 15,
    "session_id": null,
    "attendance_date": "2025-10-14",
    "check_in_time": "2025-10-14T09:00:00Z",
    "status": "field-work",
    "is_field_staff": true,
    "location_verified": false
  }
}
```

---

### Example 3: Student Check-in

**Request**:
```json
POST /api/attendance/student/check-in

{
  "session_code": "A5K9P2",
  "check_in_method": "code",
  "location": {
    "latitude": 15.248800,
    "longitude": 104.852800,
    "address": "English Korat School"
  }
}
```

**Response (On-time)**:
```json
{
  "success": true,
  "message": "Check-in successful",
  "attendance": {
    "id": 789,
    "student_id": 50,
    "session_id": 123,
    "attendance_date": "2025-10-14",
    "check_in_time": "2025-10-14T08:10:00Z",
    "status": "present",
    "late_minutes": 0,
    "check_in_method": "code",
    "location_verified": true,
    "distance_meters": 45.5
  },
  "status_info": {
    "status": "present",
    "late_minutes": 0,
    "location_verified": true,
    "distance_meters": 45.5
  }
}
```

**Response (Late)**:
```json
{
  "success": true,
  "message": "Check-in successful",
  "attendance": {
    "id": 790,
    "student_id": 51,
    "session_id": 123,
    "attendance_date": "2025-10-14",
    "check_in_time": "2025-10-14T08:25:00Z",
    "status": "late",
    "late_minutes": 5,
    "check_in_method": "code",
    "location_verified": true,
    "distance_meters": 123.8
  },
  "status_info": {
    "status": "late",
    "late_minutes": 5,
    "location_verified": true,
    "distance_meters": 123.8
  }
}
```

**Response (Too Far)**:
```json
{
  "error": "Too far from branch location",
  "distance_meters": 650.5,
  "max_distance": 500,
  "branch_name": "สาขาโคราช"
}
```

---

### Example 4: Teacher Check-out

**Request**:
```json
POST /api/attendance/teacher/check-out

{
  "attendance_id": 456,
  "location": {
    "latitude": 15.248900,
    "longitude": 104.852900
  },
  "notes": "Class completed"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Check-out successful",
  "attendance": {
    "id": 456,
    "teacher_id": 10,
    "check_in_time": "2025-10-14T08:00:00Z",
    "check_out_time": "2025-10-14T09:30:00Z",
    "is_auto_checkout": false
  }
}
```

---

### Example 5: Daily Report

**Request**:
```
GET /api/attendance/reports/daily?date=2025-10-14&branch_id=1
```

**Response**:
```json
{
  "success": true,
  "date": "2025-10-14",
  "teachers": {
    "total": 8,
    "on_time": 6,
    "late": 1,
    "field_work": 1,
    "records": [
      {
        "id": 456,
        "teacher": {
          "id": 10,
          "username": "teacher_john"
        },
        "session": {
          "id": 123,
          "session_number": 1,
          "start_time": "2025-10-14T08:00:00Z"
        },
        "check_in_time": "2025-10-14T08:00:00Z",
        "check_out_time": "2025-10-14T09:30:00Z",
        "status": "on-time",
        "late_minutes": 0
      },
      // ... more records
    ]
  },
  "students": {
    "total": 95,
    "present": 90,
    "late": 5,
    "records": [
      {
        "id": 789,
        "student": {
          "id": 50,
          "username": "student_jane"
        },
        "session": {
          "id": 123,
          "session_number": 1
        },
        "check_in_time": "2025-10-14T08:10:00Z",
        "status": "present",
        "late_minutes": 0
      },
      // ... more records
    ]
  }
}
```

---

## Best Practices

### For Teachers

1. **Check-in Early**: Check in as soon as you arrive to give students time to check in
2. **Display Session Code**: Show the session code prominently for students
3. **Verify Location**: Ensure GPS is enabled and accurate
4. **Check Student List**: Review who has checked in during/after class
5. **Manual Check-out**: Check out manually if leaving before scheduled end time

---

### For Students

1. **Check-in Promptly**: Check in within 15 minutes of teacher check-in
2. **Enable GPS**: Ensure GPS/Location services are enabled on your device
3. **Check Location**: Make sure you're within 500 meters of the branch
4. **Keep Code Ready**: Have your phone ready to enter the session code
5. **Verify Session**: Make sure you're entering the code for the correct session
6. **Check History**: Review your attendance record regularly

---

### For Admins

1. **Monitor Reports**: Check daily reports for attendance patterns
2. **Address Late Patterns**: Follow up with staff/students with frequent late marks
3. **Verify Locations**: Ensure branch GPS coordinates are accurate
4. **Review Field Staff**: Monitor field staff check-in/out for work tracking
5. **Export Data**: Use API responses for external reporting/analytics

---

### For Developers

1. **Handle GPS Errors**: Gracefully handle location permission denials
2. **Cache Session Codes**: Cache active session codes for quick display
3. **Retry Logic**: Implement retry for failed check-ins (network issues)
4. **Offline Support**: Queue check-ins when offline, sync when online
5. **QR Code Generation**: Generate QR codes on frontend from session_code
6. **WebSocket Updates**: Use WebSocket for real-time attendance list updates

---

## Error Handling

### Common Errors

**Teacher Check-in**:
- `400`: Invalid request body, missing required fields
- `400`: Session not scheduled for today
- `400`: Session is cancelled
- `400`: Already checked in for this session
- `400`: Too far from branch location (>500m)
- `403`: Only teachers can check-in
- `404`: Teacher not found, Session not found

**Student Check-in**:
- `400`: Invalid request body, missing required fields
- `400`: GPS location is required
- `400`: Invalid session code
- `400`: Session code expired
- `400`: Already checked in for this session
- `400`: Too far from branch location (>500m)
- `403`: Only students can check-in to class
- `404`: Session code not found

**Check-out**:
- `400`: Already checked out
- `403`: Unauthorized (not your attendance record)
- `404`: Attendance record not found

**Reports**:
- `400`: Invalid date format, missing user_id
- `403`: Insufficient permissions (not admin)
- `404`: User not found

---

## Database Indexes

For optimal performance, ensure these indexes exist:

```sql
-- AttendanceSession
CREATE INDEX idx_attendance_sessions_session_id ON attendance_sessions(session_id);
CREATE UNIQUE INDEX idx_attendance_sessions_code ON attendance_sessions(session_code);
CREATE INDEX idx_attendance_sessions_active ON attendance_sessions(is_active);

-- TeacherAttendance
CREATE INDEX idx_teacher_attendance_teacher_id ON teacher_attendances(teacher_id);
CREATE INDEX idx_teacher_attendance_session_id ON teacher_attendances(session_id);
CREATE INDEX idx_teacher_attendance_date ON teacher_attendances(attendance_date);
CREATE INDEX idx_teacher_attendance_branch_id ON teacher_attendances(branch_id);
CREATE INDEX idx_teacher_attendance_checkout ON teacher_attendances(check_out_time);

-- StudentAttendance
CREATE INDEX idx_student_attendance_student_id ON student_attendances(student_id);
CREATE INDEX idx_student_attendance_session_id ON student_attendances(session_id);
CREATE INDEX idx_student_attendance_date ON student_attendances(attendance_date);
CREATE INDEX idx_student_attendance_checkout ON student_attendances(check_out_time);
```

---

## Changelog

### Version 1.0.0 (October 2025)
- ✅ Initial release
- ✅ Teacher check-in/out with location validation
- ✅ Student attendance with session codes
- ✅ Field staff support (no location/session required)
- ✅ Auto check-out scheduler (5-minute intervals)
- ✅ Consecutive class detection
- ✅ Admin reports (daily, weekly, monthly, yearly, individual)
- ✅ Late detection for teachers (>15 min) and students (>15 min after teacher)
- ✅ Session code generation and QR support

---

## Support

For questions or issues:
- Check API responses for error messages
- Review logs for scheduler activity
- Verify GPS coordinates are accurate
- Ensure JWT tokens are valid and not expired

---

**End of Documentation**
