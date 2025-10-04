# Schedule Preview Feature (Dry Run) Implementation

## Overview

This document describes the implementation of the schedule preview feature that validates schedule creation before final submission. The preview feature uses the `/api/schedules/preview` endpoint to perform a dry run, checking for conflicts, payment status, and other validation requirements.

## Feature Summary

### Purpose

- **Validate schedule before creation** - Check all requirements without actually creating the schedule
- **Prevent errors** - Identify conflicts and issues before committing
- **Guide users** - Provide clear feedback on what needs to be fixed
- **Smart UI** - Disable preview tab until required fields are complete
- **Block creation** - Only allow schedule creation when preview shows `can_create: true`

## Implementation Details

### 1. API Integration

#### New Types Added to `schedules.ts`

```typescript
// Preview Issue
export interface PreviewIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  details?: unknown;
}

// Preview Session
export interface PreviewSession {
  session_number: number;
  week_number: number;
  date: string;
  start_time: string;
  end_time: string;
}

// Holiday Impact
export interface HolidayImpact {
  session_number: number;
  date: string;
  shifted_to: string;
  was_rescheduled: boolean;
}

// Conflict Details
export interface PreviewConflictDetail {
  schedule_id: number;
  schedule_name: string;
  session_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
}

// Teacher Conflict
export interface PreviewTeacherConflict {
  teacher_id: number;
  teacher_name: string;
  conflicts: PreviewConflictDetail[];
}

// Room Conflict
export interface PreviewRoomConflict {
  room_id: number;
  conflicts: Array<{
    room_id: number;
    existing_room_id: number;
    session_id: number;
    schedule_id: number;
    schedule_name: string;
    session_date: string;
    start_time: string;
    end_time: string;
  }>;
}

// Group Payment Status
export interface GroupPaymentStatus {
  group_id: number;
  group_name: string;
  group_payment_status: string;
  eligible_members: number;
  ineligible_members: number;
  member_totals: {
    pending: number;
    deposit_paid: number;
    fully_paid: number;
  };
  require_deposit: boolean;
}

// Preview Response
export interface SchedulePreviewResponse {
  can_create: boolean;
  issues: PreviewIssue[];
  summary: {
    schedule_name: string;
    schedule_type: string;
    start_date: string;
    estimated_end_date: string;
    total_hours: number;
    hours_per_session: number;
    session_per_week: number;
    total_sessions: number;
  };
  sessions: PreviewSession[];
  original_sessions?: PreviewSession[];
  holiday_impacts: HolidayImpact[];
  conflicts: {
    group: unknown | null;
    rooms: PreviewRoomConflict[];
    teachers: PreviewTeacherConflict[];
    participants: PreviewConflictDetail[];
    students: PreviewConflictDetail[];
  };
  group_payment?: GroupPaymentStatus;
  auto_reschedule: boolean;
  branch_hours: {
    open_minutes: number;
    close_minutes: number;
    open_time: string;
    close_time: string;
  };
  checked_room_ids: number[];
}
```

#### New Endpoint

```typescript
PREVIEW: "/schedules/preview";
```

#### New Service Method

```typescript
previewSchedule: async (
  scheduleData: CreateScheduleInput
): Promise<SchedulePreviewResponse>
```

The method transforms the schedule data using the same logic as `createSchedule` to ensure consistency between preview and actual creation.

### 2. Modal Component Changes

#### New State Variables

```typescript
const [previewLoading, setPreviewLoading] = useState(false);
const [previewData, setPreviewData] = useState<SchedulePreviewResponse | null>(
  null
);
```

#### New Validation Function

```typescript
const isPreviewReady = useCallback(() => {
  return !!(
    scheduleForm.schedule_name &&
    scheduleForm.group_id &&
    scheduleForm.default_teacher_id &&
    scheduleForm.start_date &&
    scheduleForm.total_hours &&
    scheduleForm.hours_per_session &&
    scheduleForm.session_times &&
    scheduleForm.session_times.length > 0 &&
    selectedRoomIds.length > 0
  );
}, [scheduleForm, selectedRoomIds]);
```

**Required Fields for Preview:**

1. ✅ Schedule Name
2. ✅ Group ID
3. ✅ Teacher ID
4. ✅ Room ID (at least one selected)
5. ✅ Start Date
6. ✅ Total Hours
7. ✅ Hours Per Session
8. ✅ At least one session time

#### Preview Function

```typescript
const previewSchedule = useCallback(async () => {
  if (!isPreviewReady()) return;

  setPreviewLoading(true);
  setPreviewData(null);

  try {
    const payload: CreateScheduleRequest = {
      ...scheduleForm,
      schedule_name: scheduleForm.schedule_name || "",
      start_date: scheduleForm.start_date || "",
      schedule_type: "class",
      default_room_id: selectedRoomIds[0],
    };

    // Format and transform payload
    // ... (same logic as handleConfirm)

    const preview = await scheduleService.previewSchedule(payload);
    setPreviewData(preview);
  } catch (err) {
    console.error("Failed to preview schedule:", err);
  } finally {
    setPreviewLoading(false);
  }
}, [scheduleForm, selectedRoomIds, isPreviewReady]);
```

#### Auto-Trigger Effect

```typescript
useEffect(() => {
  if (activeTab === "preview" && isPreviewReady()) {
    previewSchedule();
  }
}, [activeTab, previewSchedule, isPreviewReady]);
```

Automatically calls the preview endpoint when:

- User navigates to preview tab
- All required fields are filled

### 3. UI Components

#### Preview Tab Trigger (Disabled State)

```typescript
<TabsTrigger
  value="preview"
  disabled={!isPreviewReady()}
  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
>
  <CheckCircleIcon className="h-4 w-4" />
  {language === "th" ? "พรีวิว" : "Preview"}
</TabsTrigger>
```

Tab remains disabled until all required fields are complete.

#### Preview Content Sections

##### 1. Can Create Status

```typescript
<div
  className={`p-4 rounded-xl border-2 ${
    previewData.can_create
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200"
  }`}
>
  // Shows ✓ Ready or ✗ Cannot Create
</div>
```

##### 2. Issues Display

```typescript
{
  previewData.issues.map((issue) => (
    <div
      className={`p-4 rounded-lg border ${
        issue.severity === "error"
          ? "bg-red-50 border-red-200"
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      // Error: ❌ or Warning: ⚠️
      <p>{issue.message}</p>
    </div>
  ));
}
```

**Issue Severity:**

- **ERROR** (red) - Blocking issues that prevent creation
- **WARNING** (yellow) - Non-blocking alerts for user awareness

##### 3. Schedule Summary

```typescript
<div className="grid grid-cols-2 gap-4">
  <div>Total Sessions: {previewData.summary.total_sessions}</div>
  <div>Total Hours: {previewData.summary.total_hours}</div>
  <div>Start: {previewData.summary.start_date}</div>
  <div>End: {previewData.summary.estimated_end_date}</div>
</div>
```

##### 4. Holiday Impacts

```typescript
{
  previewData.holiday_impacts.map((impact) => (
    <div className="p-3 bg-blue-50 rounded-lg">
      Session #{impact.session_number}: Moved from {impact.date} to{" "}
      {impact.shifted_to}
    </div>
  ));
}
```

Shows which sessions fall on Thai public holidays and where they will be rescheduled.

##### 5. Group Payment Status (Class Only)

```typescript
{
  previewData.group_payment && (
    <div>
      <div>Group Status: {previewData.group_payment.group_payment_status}</div>
      <div>Eligible Members: {previewData.group_payment.eligible_members}</div>
      <div>
        Ineligible Members: {previewData.group_payment.ineligible_members}
      </div>
    </div>
  );
}
```

#### Create Button (Conditional Enable)

```typescript
<Button
  onClick={handleConfirm}
  disabled={
    isLoading || isSubmitting || !previewData || !previewData.can_create
  }
  variant="monthViewClicked"
>
  {isSubmitting || isLoading ? <LoadingSpinner /> : "Create"}
</Button>
```

**Button is disabled when:**

- Loading or submitting
- No preview data available
- `can_create` is `false`

## User Flow

### Step-by-Step Process

#### 1. Basic Tab

User fills:

- Schedule Name ✅
- Group Selection ✅
- Teacher Selection ✅
- Start Date ✅
- Total Hours ✅
- Hours Per Session ✅

#### 2. Schedule Tab

User adds:

- Session times (weekday + start_time) ✅
- Auto-calculates `session_per_week`

#### 3. Room Tab

User selects:

- Room(s) for the class ✅
- Auto-checks room conflicts

#### 4. Preview Tab (🔒 Locked until complete)

When all fields are filled:

- ✅ Tab becomes **enabled**
- 🔄 Auto-triggers preview API call
- 📊 Displays validation results

**If `can_create: false`:**

- ❌ Shows ERROR issues in red
- ⚠️ Shows WARNING issues in yellow
- 🔒 Create button is **disabled**
- User must go back and fix issues

**If `can_create: true`:**

- ✅ Shows green success banner
- ✓ Create button is **enabled**
- User can proceed to create schedule

#### 5. Create Schedule

- User clicks "Create" button
- Sends `POST /api/schedules` with same payload
- Shows success modal
- Closes modal and refreshes schedule list

## API Request/Response Examples

### Request Example

```json
POST /api/schedules/preview

{
  "schedule_name": "IELTS Intensive",
  "schedule_type": "class",
  "group_id": 51,
  "recurring_pattern": "custom",
  "total_hours": 36,
  "hours_per_session": 2,
  "session_per_week": 3,
  "start_date": "2025-10-07T00:00:00Z",
  "estimated_end_date": "2025-11-18T00:00:00Z",
  "session_times": [
    { "weekday": 1, "start_time": "09:00" },
    { "weekday": 3, "start_time": "09:00" },
    { "weekday": 5, "start_time": "09:00" }
  ],
  "default_teacher_id": 23,
  "default_room_id": 4,
  "auto_reschedule": true
}
```

### Response Example (Success)

```json
{
  "can_create": true,
  "issues": [],
  "summary": {
    "schedule_name": "IELTS Intensive",
    "schedule_type": "class",
    "start_date": "2025-10-07",
    "estimated_end_date": "2025-11-18",
    "total_hours": 36,
    "hours_per_session": 2,
    "session_per_week": 3,
    "total_sessions": 18
  },
  "sessions": [...],
  "holiday_impacts": [],
  "conflicts": {
    "group": null,
    "rooms": [],
    "teachers": [],
    "participants": [],
    "students": []
  },
  "group_payment": {
    "group_id": 51,
    "group_payment_status": "fully_paid",
    "eligible_members": 4,
    "ineligible_members": 0,
    "member_totals": {
      "pending": 0,
      "deposit_paid": 0,
      "fully_paid": 4
    }
  }
}
```

### Response Example (With Errors)

```json
{
  "can_create": false,
  "issues": [
    {
      "severity": "error",
      "code": "teacher_conflict",
      "message": "teacher JaneDoe has 1 conflicting session(s)",
      "details": {
        "teacher_id": 23,
        "teacher_name": "JaneDoe",
        "conflicts": [
          {
            "schedule_id": 440,
            "schedule_name": "IELTS Intensive (Existing)",
            "session_id": 9123,
            "session_date": "2025-10-14",
            "start_time": "09:00",
            "end_time": "11:00"
          }
        ]
      }
    },
    {
      "severity": "warning",
      "code": "holiday_overlap",
      "message": "some sessions fall on Thai public holidays",
      "details": [...]
    }
  ],
  ...
}
```

## Error Codes Reference

### Severity: ERROR (Blocking)

- `teacher_conflict` - Teacher has conflicting sessions
- `room_conflict` - Room is already booked
- `student_conflict` - Student has conflicting classes
- `participant_conflict` - Participant unavailable
- `group_payment_invalid` - Payment requirements not met
- `invalid_schedule` - Schedule configuration invalid
- `outside_branch_hours` - Sessions outside business hours

### Severity: WARNING (Non-blocking)

- `holiday_overlap` - Sessions fall on public holidays (will be rescheduled)
- `partial_payment` - Some students haven't paid fully
- `capacity_warning` - Room near capacity
- `long_session` - Session duration unusually long

## Benefits

### For Users

1. **Confidence** - Know schedule is valid before creating
2. **Clarity** - See exactly what issues need fixing
3. **Efficiency** - Fix problems early, avoid creation failures
4. **Transparency** - Understand holiday impacts and conflicts
5. **Guidance** - Clear error messages guide corrections

### For System

1. **Data Quality** - Only valid schedules get created
2. **Error Prevention** - Catch conflicts before database insertion
3. **Consistency** - Preview uses same validation as creation
4. **Performance** - No rollback needed for failed creations
5. **User Experience** - Smooth, guided creation process

## Testing Recommendations

### Test Case 1: Happy Path

1. Fill all required fields correctly
2. Navigate to preview tab
3. Verify preview loads automatically
4. Verify `can_create: true` with green banner
5. Verify Create button is enabled
6. Create schedule successfully

### Test Case 2: Missing Fields

1. Fill only some required fields
2. Try to navigate to preview tab
3. Verify tab is disabled
4. Verify cannot access preview
5. Fill remaining fields
6. Verify tab becomes enabled

### Test Case 3: Teacher Conflict

1. Fill all fields with conflicting teacher
2. Navigate to preview
3. Verify `can_create: false`
4. Verify ERROR issue displayed for teacher conflict
5. Verify Create button disabled
6. Change teacher
7. Re-preview and verify success

### Test Case 4: Room Conflict

1. Fill all fields with booked room
2. Navigate to preview
3. Verify room conflict ERROR
4. Change room selection
5. Re-preview and verify success

### Test Case 5: Holiday Rescheduling

1. Create schedule with sessions on holidays
2. Navigate to preview
3. Verify holiday_impacts section shows
4. Verify sessions are rescheduled
5. Verify WARNING (not ERROR)
6. Verify Create button still enabled

### Test Case 6: Payment Status

1. Create schedule with group having unpaid members
2. Navigate to preview
3. Verify group_payment section displays
4. Verify eligible vs ineligible counts
5. Verify appropriate warning/error

## Future Enhancements

### Potential Improvements

1. **Real-time validation** - Show preview as user types
2. **Conflict resolution** - Suggest alternative times/rooms
3. **Bulk preview** - Preview multiple schedules at once
4. **Export preview** - Download preview as PDF
5. **History** - Show previous preview attempts
6. **Comparison** - Compare different schedule options
7. **Calendar view** - Visual calendar of generated sessions
8. **Notification** - Alert when preview becomes ready

## Technical Notes

### Performance Considerations

- Preview API call only triggered when entering tab (not on every field change)
- Loading state prevents multiple simultaneous calls
- Auto-calculation reduces preview payload size
- Validation done server-side for accuracy

### Security

- Preview endpoint requires authentication
- Same permissions as schedule creation
- No data persisted to database
- Temporary session generation only

### Compatibility

- Works for all schedule types (class, meeting, event, etc.)
- Non-class schedules skip group_payment section
- Supports both single-slot and multi-slot patterns
- Holiday rescheduling respects auto_reschedule flag

## Conclusion

The schedule preview feature provides a comprehensive dry-run validation system that ensures schedules are correct before creation. By disabling the preview tab until requirements are met and only allowing creation when `can_create: true`, the system prevents invalid schedules from being created while providing clear guidance to users on how to fix any issues.

The implementation maintains consistency with the existing schedule creation logic by reusing the same payload transformation, ensuring that what users see in the preview is exactly what will be created.
