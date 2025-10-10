# API Integration Examples - Session Update

## Base Configuration

```typescript
// API Base URL (from environment)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Headers
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
```

## Example 1: Update Session Time

### Request

```http
PATCH /api/schedules/sessions/123 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "start_time": "14:00",
  "end_time": "16:00"
}
```

### Response (Success)

```json
{
  "message": "Session updated successfully",
  "session": {
    "id": 123,
    "schedule_id": 45,
    "session_date": "2025-01-15T00:00:00Z",
    "start_time": "2025-01-15T14:00:00Z",
    "end_time": "2025-01-15T16:00:00Z",
    "session_number": 3,
    "week_number": 2,
    "status": "scheduled",
    "assigned_teacher_id": 8,
    "room_id": 5
  }
}
```

### TypeScript Implementation

```typescript
import { updateSession } from "@/services/api/schedules";

const handleUpdateTime = async () => {
  try {
    const result = await updateSession(123, {
      start_time: "14:00",
      end_time: "16:00",
    });

    console.log("Updated session:", result.session);
    toast.success("Time updated successfully");
  } catch (error) {
    console.error("Update failed:", error);
    toast.error("Failed to update time");
  }
};
```

## Example 2: Reassign Teacher and Room

### Request

```http
PATCH /api/schedules/sessions/123 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "assigned_teacher_id": 15,
  "room_id": 8,
  "notes": "Original teacher unavailable, reassigned"
}
```

### Response (Success)

```json
{
  "message": "Session updated successfully",
  "session": {
    "id": 123,
    "assigned_teacher_id": 15,
    "room_id": 8,
    "notes": "Original teacher unavailable, reassigned",
    "assigned_teacher": {
      "id": 15,
      "username": "teacher.john",
      "role": "teacher"
    },
    "room": {
      "id": 8,
      "room_name": "Room B",
      "capacity": 15
    }
  }
}
```

### TypeScript Implementation

```typescript
const handleReassignTeacherAndRoom = async (
  sessionId: number,
  teacherId: number,
  roomId: number
) => {
  try {
    const result = await updateSession(sessionId, {
      assigned_teacher_id: teacherId,
      room_id: roomId,
      notes: "Original teacher unavailable, reassigned",
    });

    console.log("Reassigned:", result.session.assigned_teacher);
    toast.success("Teacher and room updated");
  } catch (error) {
    console.error("Reassignment failed:", error);
    toast.error("Failed to reassign");
  }
};
```

## Example 3: Cancel Session with Reason

### Request

```http
PATCH /api/schedules/sessions/123 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "status": "cancelled",
  "cancelling_reason": "Holiday - school closed",
  "notes": "Will reschedule next week"
}
```

### Response (Success)

```json
{
  "message": "Session updated successfully",
  "session": {
    "id": 123,
    "status": "cancelled",
    "cancelling_reason": "Holiday - school closed",
    "notes": "Will reschedule next week"
  }
}
```

### TypeScript Implementation

```typescript
const handleCancelSession = async (sessionId: number, reason: string) => {
  try {
    const result = await updateSession(sessionId, {
      status: "cancelled",
      cancelling_reason: reason,
      notes: "Will reschedule next week",
    });

    console.log("Session cancelled:", result.message);
    toast.success("Session cancelled");
  } catch (error) {
    console.error("Cancellation failed:", error);
    toast.error("Failed to cancel session");
  }
};
```

## Example 4: Reschedule Session (Date + Time)

### Request

```http
PATCH /api/schedules/sessions/123 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "session_date": "2025-01-20",
  "start_time": "15:00",
  "end_time": "17:00",
  "status": "rescheduled",
  "notes": "Moved from morning to afternoon slot"
}
```

### Response (Success)

```json
{
  "message": "Session updated successfully",
  "session": {
    "id": 123,
    "session_date": "2025-01-20T00:00:00Z",
    "start_time": "2025-01-20T15:00:00Z",
    "end_time": "2025-01-20T17:00:00Z",
    "status": "rescheduled",
    "notes": "Moved from morning to afternoon slot"
  }
}
```

### TypeScript Implementation

```typescript
const handleReschedule = async (
  sessionId: number,
  newDate: string,
  newStartTime: string,
  newEndTime: string
) => {
  try {
    const result = await updateSession(sessionId, {
      session_date: newDate,
      start_time: newStartTime,
      end_time: newEndTime,
      status: "rescheduled",
      notes: "Moved from morning to afternoon slot",
    });

    console.log("Rescheduled to:", result.session.session_date);
    toast.success("Session rescheduled");
  } catch (error) {
    console.error("Reschedule failed:", error);
    toast.error("Failed to reschedule");
  }
};
```

## Example 5: Complete Update (All Fields)

### Request

```http
PATCH /api/schedules/sessions/123 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "session_date": "2025-02-10",
  "start_time": "10:00",
  "end_time": "12:00",
  "assigned_teacher_id": 15,
  "room_id": 3,
  "status": "scheduled",
  "notes": "Complete reschedule due to facility maintenance"
}
```

### Response (Success)

```json
{
  "message": "Session updated successfully",
  "session": {
    "id": 123,
    "session_date": "2025-02-10T00:00:00Z",
    "start_time": "2025-02-10T10:00:00Z",
    "end_time": "2025-02-10T12:00:00Z",
    "assigned_teacher_id": 15,
    "room_id": 3,
    "status": "scheduled",
    "notes": "Complete reschedule due to facility maintenance",
    "assigned_teacher": {
      "id": 15,
      "username": "teacher.sarah"
    },
    "room": {
      "id": 3,
      "room_name": "Room C"
    }
  }
}
```

### TypeScript Implementation

```typescript
const handleCompleteUpdate = async (formData: UpdateSessionRequest) => {
  try {
    const result = await updateSession(sessionId, formData);

    console.log("Full update complete:", result.session);
    toast.success("Session updated successfully");

    // Refresh UI
    await fetchSessionDetail();
  } catch (error) {
    console.error("Update failed:", error);
    toast.error("Failed to update session");
  }
};
```

## Error Response Examples

### 400 Bad Request - No Fields to Update

```json
{
  "error": "No fields to update"
}
```

### 400 Bad Request - Invalid Status

```json
{
  "error": "Invalid status value"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden - Teacher Trying Full Update

```json
{
  "error": "Only admin/owner can update session details. Teachers can only update status and notes."
}
```

### 404 Not Found

```json
{
  "error": "Session not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to update session"
}
```

## Error Handling Pattern

```typescript
const handleSessionUpdate = async (
  sessionId: number,
  updates: UpdateSessionRequest
) => {
  try {
    const result = await updateSession(sessionId, updates);

    // Success handling
    toast.success(
      language === "th"
        ? "อัปเดตคาบเรียนสำเร็จ"
        : "Session updated successfully"
    );

    return result.session;
  } catch (error: any) {
    // Error handling
    const errorMessage =
      error.response?.data?.error || error.message || "Unknown error occurred";

    console.error("Session update failed:", {
      sessionId,
      updates,
      error: errorMessage,
    });

    // User-friendly error messages
    let userMessage =
      language === "th"
        ? "ไม่สามารถอัปเดตคาบเรียนได้"
        : "Failed to update session";

    if (error.response?.status === 403) {
      userMessage =
        language === "th"
          ? "คุณไม่มีสิทธิ์แก้ไขคาบเรียนนี้"
          : "You do not have permission to edit this session";
    } else if (error.response?.status === 404) {
      userMessage =
        language === "th" ? "ไม่พบคาบเรียนนี้" : "Session not found";
    }

    toast.error(userMessage);
    throw error;
  }
};
```

## Testing with cURL

### Update Time

```bash
curl -X PATCH "http://localhost:8080/api/schedules/sessions/123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "14:00",
    "end_time": "16:00"
  }'
```

### Cancel Session

```bash
curl -X PATCH "http://localhost:8080/api/schedules/sessions/123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled",
    "cancelling_reason": "Holiday"
  }'
```

### Update Teacher

```bash
curl -X PATCH "http://localhost:8080/api/schedules/sessions/123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_teacher_id": 15
  }'
```

## Testing with Postman

### Collection Variables

```json
{
  "api_url": "http://localhost:8080",
  "token": "YOUR_JWT_TOKEN",
  "session_id": "123"
}
```

### Request Setup

1. Method: `PATCH`
2. URL: `{{api_url}}/api/schedules/sessions/{{session_id}}`
3. Headers:
   - `Authorization`: `Bearer {{token}}`
   - `Content-Type`: `application/json`
4. Body (raw JSON):

```json
{
  "start_time": "14:00",
  "end_time": "16:00"
}
```

## Common Patterns

### Pattern 1: Optimistic Update

```typescript
// Update UI immediately
setSessionDetail({
  ...sessionDetail,
  session: {
    ...sessionDetail.session,
    status: "confirmed",
  },
});

// Then sync with server
try {
  await updateSession(sessionId, { status: "confirmed" });
} catch (error) {
  // Revert on error
  await fetchSessionDetail();
  toast.error("Update failed");
}
```

### Pattern 2: Batch Update

```typescript
const updates: UpdateSessionRequest = {};

if (dateChanged) updates.session_date = newDate;
if (timeChanged) {
  updates.start_time = newStartTime;
  updates.end_time = newEndTime;
}
if (teacherChanged) updates.assigned_teacher_id = newTeacherId;

// Single API call
await updateSession(sessionId, updates);
```

### Pattern 3: Conditional Update

```typescript
const handleStatusChange = async (newStatus: string) => {
  const updates: UpdateSessionRequest = { status: newStatus };

  // Require reason for cancellation
  if (newStatus === "cancelled") {
    const reason = prompt("Enter cancelling reason:");
    if (!reason) return;
    updates.cancelling_reason = reason;
  }

  await updateSession(sessionId, updates);
};
```

## Debugging Tips

### Log Request Payload

```typescript
console.log("Sending update:", {
  sessionId,
  updates,
  url: `/schedules/sessions/${sessionId}`,
  method: "PATCH",
});
```

### Log Response Data

```typescript
const result = await updateSession(sessionId, updates);
console.log("Update response:", {
  message: result.message,
  updatedFields: Object.keys(updates),
  session: result.session,
});
```

### Network Inspection

Open Chrome DevTools → Network tab:

- Check request payload
- Check response status code
- View response headers
- Inspect timing information
