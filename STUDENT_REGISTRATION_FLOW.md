# Student Registration System - Backend Requirements & Flow

This document outlines the complete student registration system requirements for the EnglishKorat platform. The system has been redesigned to reduce redundancy, improve UX, and implement a comprehensive workflow from initial registration to course assignment.

## 🎯 Overview

The new system replaces the old `/studentRegistration` endpoint with `/students/student-register` and implements a multi-stage workflow with proper status tracking and admin management.

## 📋 API Requirements

### 1. Student Registration Endpoint

**Endpoint:** `POST /api/v1/students/student-register`
**Access:** Public (no authentication required)
**Purpose:** Handle both quick and full registration forms

#### Request Body Structure:
```json
{
  "registration_type": "quick" | "full",
  "basic_information": {
    "first_name": "string (required)",
    "last_name": "string (required)", 
    "nickname_th": "string (required)",
    "nickname_en": "string (required)",
    "date_of_birth": "YYYY-MM-DD (required)",
    "gender": "male|female|other (required)",
    "age": "number (auto-calculated, read-only)"
  },
  "contact_information": {
    "phone": "string (required)",
    "email": "string (optional)",
    "line_id": "string (required)",
    "address": "string (optional)",
    "preferred_branch": "number (branch_id, required)"
  },
  "full_information": {
    // Only included when registration_type = "full"
    "citizen_id": "string (13 digits, required for full)",
    "first_name_en": "string (optional)",
    "last_name_en": "string (optional)",
    "current_education": "string (required)",
    "preferred_branch": "number (branch_id, required)",
    "preferred_language": "english|chinese (required)",
    "language_level": "string (required)",
    "learning_style": "private|pair|group (required)",
    "recent_cefr": "string (required)",
    "selected_courses": "array of course_ids (optional)",
    "learning_goals": "string (optional)",
    "teacher_type": "string (required)",
    "preferred_time_slots": "array (optional)",
    "unavailable_time_slots": "array (optional)",
    "emergency_contact": "string (optional)",
    "emergency_phone": "string (optional)"
  }
}
```

#### Response Structure:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "student_id": "number",
    "registration_status": "pending_review",
    "registration_type": "quick|full"
  }
}
```

### 2. Backend Processing Logic

When a registration is submitted:

1. **Create Student Record:**
   - Insert into `students` table with `registration_status = "pending_review"`
   - Auto-calculate `age` from `date_of_birth` to current date
   - Set `created_at` timestamp

2. **Send Admin Notification:**
   - Create notification for admin users
   - Notification type: "new_student_registration"
   - Include student basic info and registration type

3. **Return Success Response:**
   - Include student ID for tracking
   - Confirm registration status

## 🔄 Registration Status Workflow

### Status Flow:
```
pending_review → schedule_exam → waiting_for_group → active
     ↓               ↓               ↓              ↓
(Admin Review) → (Exam Scheduled) → (Exam Done) → (Assigned to Group)
```

### Status Descriptions:

1. **`pending_review`**
   - Initial status after registration
   - Requires admin to complete missing information
   - Shows in admin dashboard for processing

2. **`schedule_exam`**
   - Admin has completed student information
   - Requires teacher to create exam schedule session
   - Student ready for placement test

3. **`waiting_for_group`**
   - Exam completed with scores recorded
   - Requires admin to assign to appropriate group/course
   - All assessment data available

4. **`active`**
   - Student assigned to course/group
   - Regular student status
   - Can attend classes

## 🏗️ Database Requirements

### Students Table Updates Required:

Add/ensure these fields exist in the `students` table:
```sql
-- New/Updated fields needed
nickname_th VARCHAR(255) NOT NULL,
nickname_en VARCHAR(255) NOT NULL,
age INT GENERATED ALWAYS AS (YEAR(CURRENT_DATE) - YEAR(date_of_birth) - 
    CASE WHEN DAYOFYEAR(CURRENT_DATE) < DAYOFYEAR(date_of_birth) THEN 1 ELSE 0 END) STORED,
registration_status ENUM('pending_review', 'schedule_exam', 'waiting_for_group', 'active') DEFAULT 'pending_review',
registration_type ENUM('quick', 'full') DEFAULT 'full',
citizen_id VARCHAR(13) NULL, -- Allow NULL for quick registrations
address TEXT NULL, -- Make optional
```

### Schedule Sessions Integration:

When status = `schedule_exam`, create exam sessions using the existing schedule system:
```json
{
  "schedule_id": "exam_schedule_id",
  "session_type": "placement_exam",
  "student_id": "student_id",
  "session_date": "YYYY-MM-DD",
  "start_time": "HH:MM:SS",
  "end_time": "HH:MM:SS",
  "status": "scheduled"
}
```

## 🎯 Frontend Integration Points

### Admin Dashboard Requirements:

1. **Students Assignment Page (`/students/assign`):**
   - Categorize students by `registration_status`
   - Show tabs: "Pending Review", "Schedule Exam", "Waiting for Group", "Active"
   - Allow status progression through the workflow

2. **Quick Registration Processing:**
   - Admin can complete missing citizen_id and other optional fields
   - Form validation for required fields before status change

3. **Exam Scheduling:**
   - Integration with schedule system
   - Teacher can create exam sessions
   - Automatic status update after score entry

4. **Score Recording:**
   - Fields: grammar_score, speaking_score, listening_score, reading_score, writing_score
   - Automatic status change to "waiting_for_group" after scores entered

## 📧 Notification Requirements

### Admin Notifications:
```json
{
  "type": "new_student_registration",
  "title": "New Student Registration",
  "message": "Student [Name] has registered and needs review",
  "data": {
    "student_id": "number",
    "student_name": "string",
    "registration_type": "quick|full",
    "created_at": "timestamp"
  },
  "recipients": ["admin", "staff"]
}
```

## 🔧 Additional API Endpoints Needed

### 1. Update Student (Admin Only)
```
PATCH /api/v1/students/{id}
- Complete missing information
- Update registration_status
- Requires admin authentication
```

### 2. Get Students by Status
```
GET /api/v1/students/by-status/{status}
- Filter students by registration_status
- Pagination support
- Admin authentication required
```

### 3. Record Exam Scores
```
POST /api/v1/students/{id}/exam-scores
- Update test scores
- Auto-change status to "waiting_for_group"
- Teacher authentication required
```

## 🎨 UX Flow Summary

### Public Registration:
1. User visits `/students/student-register`
2. Chooses registration type (Quick/Full)
3. Fills appropriate form with age auto-calculation
4. Submits → Redirects to success page
5. Receives confirmation with contact info

### Admin Processing:
1. Receives notification of new registration
2. Goes to `/students/assign` → "Pending Review" tab
3. Reviews and completes student information
4. Updates status to "schedule_exam"
5. Teacher creates exam session
6. After exam: records scores → status becomes "waiting_for_group"
7. Admin assigns to appropriate course/group → status becomes "active"

## 🔒 Security Considerations

- Public registration endpoint should have rate limiting
- Validate Thai citizen ID format and checksum
- Sanitize all input data
- Admin authentication required for status changes
- Log all status changes for audit trail

## 📊 Success Metrics

- Registration completion rate
- Time from registration to active status
- Admin processing efficiency
- Student satisfaction with process

---

**Implementation Priority:**
1. Create `/students/student-register` endpoint
2. Update students table schema
3. Implement admin notification system
4. Update frontend forms and workflows
5. Test complete flow end-to-end

**Integration with Existing Systems:**
- Uses existing schedule system for exam sessions
- Integrates with existing notification system
- Leverages current admin authentication
- Compatible with existing student management

This flow ensures a smooth progression from initial interest to active student status while maintaining data integrity and providing clear admin oversight at each stage.
