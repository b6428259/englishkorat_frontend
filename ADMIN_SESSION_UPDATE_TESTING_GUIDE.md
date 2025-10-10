# Testing Guide - Admin Session Update Feature

## Prerequisites

- Backend API is running and accessible
- User accounts with different roles (admin, owner, teacher, student)
- At least one schedule with sessions created
- Test session IDs available

## Test Cases

### 1. Permission Tests

#### Test 1.1: Admin Can Edit

**Steps:**

1. Log in as admin
2. Navigate to schedule page
3. Click on any session to open detail modal
4. Verify "Edit" button is visible next to status badge
5. Click "Edit" button

**Expected Result:**

- Edit button appears
- Edit mode activates
- Form fields populate with current data
- Save/Cancel buttons appear

**Status:** ☐ Pass ☐ Fail

---

#### Test 1.2: Owner Can Edit

**Steps:**

1. Log in as owner
2. Navigate to schedule page
3. Click on any session to open detail modal
4. Verify "Edit" button is visible
5. Click "Edit" button

**Expected Result:**

- Same as Test 1.1

**Status:** ☐ Pass ☐ Fail

---

#### Test 1.3: Teacher Cannot Edit (No Button)

**Steps:**

1. Log in as teacher
2. Navigate to schedule page
3. Click on any session to open detail modal
4. Look for "Edit" button

**Expected Result:**

- No "Edit" button visible
- Only Confirm/Decline buttons visible (if session is pending)
- Cannot enter edit mode

**Status:** ☐ Pass ☐ Fail

---

#### Test 1.4: Student Cannot Edit

**Steps:**

1. Log in as student
2. Navigate to schedule page
3. Click on any session to open detail modal
4. Look for "Edit" button

**Expected Result:**

- No "Edit" button visible
- No edit controls available

**Status:** ☐ Pass ☐ Fail

---

### 2. Data Loading Tests

#### Test 2.1: Teacher Dropdown Loads

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Check Teacher dropdown

**Expected Result:**

- Loading spinner shows briefly
- Dropdown populates with teacher names
- Can select different teacher
- Current teacher is pre-selected if available

**Status:** ☐ Pass ☐ Fail

---

#### Test 2.2: Room Dropdown Loads

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Check Room dropdown

**Expected Result:**

- Loading spinner shows briefly
- Dropdown populates with room names
- Can select different room
- Current room is pre-selected if available

**Status:** ☐ Pass ☐ Fail

---

#### Test 2.3: Form Pre-population

**Steps:**

1. Log in as admin
2. Open session detail modal for session with known data
3. Click "Edit"
4. Check all form fields

**Expected Result:**

- Date field shows current session date
- Start time shows current start time
- End time shows current end time
- Status shows current status
- Teacher shows current teacher (if assigned)
- Room shows current room (if assigned)
- Notes are empty (ready for new notes)

**Status:** ☐ Pass ☐ Fail

---

### 3. Update Functionality Tests

#### Test 3.1: Update Date Only

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Change only the date field
5. Click "Save"

**Expected Result:**

- Success toast appears
- Modal refreshes with new date
- Other fields remain unchanged
- Returns to view mode

**Status:** ☐ Pass ☐ Fail
**API Request:**

```json
{ "session_date": "2025-01-20" }
```

---

#### Test 3.2: Update Time Only

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Change start_time and end_time
5. Click "Save"

**Expected Result:**

- Success toast appears
- Modal shows updated times
- Other fields remain unchanged

**Status:** ☐ Pass ☐ Fail
**API Request:**

```json
{
  "start_time": "14:00",
  "end_time": "16:00"
}
```

---

#### Test 3.3: Update Teacher Only

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Select different teacher from dropdown
5. Click "Save"

**Expected Result:**

- Success toast appears
- Teacher name updates in view mode

**Status:** ☐ Pass ☐ Fail
**API Request:**

```json
{ "assigned_teacher_id": 12 }
```

---

#### Test 3.4: Update Room Only

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Select different room from dropdown
5. Click "Save"

**Expected Result:**

- Success toast appears
- Room name updates in view mode

**Status:** ☐ Pass ☐ Fail
**API Request:**

```json
{ "room_id": 5 }
```

---

#### Test 3.5: Update Status Only

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Change status dropdown
5. Click "Save"

**Expected Result:**

- Success toast appears
- Status badge updates with new status and color

**Status:** ☐ Pass ☐ Fail
**API Request:**

```json
{ "status": "confirmed" }
```

---

#### Test 3.6: Update Multiple Fields

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Change date, time, teacher, room, and status
5. Add notes
6. Click "Save"

**Expected Result:**

- Success toast appears
- All changed fields update correctly
- View mode shows all new values

**Status:** ☐ Pass ☐ Fail
**API Request:**

```json
{
  "session_date": "2025-01-20",
  "start_time": "15:00",
  "end_time": "17:00",
  "assigned_teacher_id": 8,
  "room_id": 3,
  "status": "scheduled",
  "notes": "Complete reschedule"
}
```

---

#### Test 3.7: Cancel Session (With Reason)

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Change status to "Cancelled"
5. Verify cancelling reason textarea appears
6. Enter reason
7. Click "Save"

**Expected Result:**

- Cancelling reason field shows when status = cancelled
- Success toast appears
- Status shows as cancelled
- Reason is saved (can verify in API response)

**Status:** ☐ Pass ☐ Fail
**API Request:**

```json
{
  "status": "cancelled",
  "cancelling_reason": "Holiday - school closed"
}
```

---

### 4. Cancel/Exit Tests

#### Test 4.1: Cancel Edit (No Changes)

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Don't change anything
5. Click "Cancel"

**Expected Result:**

- Returns to view mode
- No API call made
- Original data still displayed

**Status:** ☐ Pass ☐ Fail

---

#### Test 4.2: Cancel Edit (With Changes)

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Change some fields
5. Click "Cancel"

**Expected Result:**

- Returns to view mode
- Changes are discarded
- Original data restored
- No API call made

**Status:** ☐ Pass ☐ Fail

---

### 5. Error Handling Tests

#### Test 5.1: Network Error

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Disconnect network/stop backend
5. Make changes and click "Save"

**Expected Result:**

- Error toast appears
- Stays in edit mode
- Data not lost
- User can retry

**Status:** ☐ Pass ☐ Fail

---

#### Test 5.2: Invalid Session ID

**Steps:**

1. Log in as admin
2. Manually trigger update with invalid session ID
3. Observe response

**Expected Result:**

- Error toast appears
- 404 error handled gracefully
- User-friendly error message

**Status:** ☐ Pass ☐ Fail

---

#### Test 5.3: API Error Response

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Try to update with invalid data (if backend validates)
5. Click "Save"

**Expected Result:**

- Error toast shows API error message
- Stays in edit mode
- User can correct and retry

**Status:** ☐ Pass ☐ Fail

---

### 6. UI/UX Tests

#### Test 6.1: Loading States

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Click "Edit"
4. Observe loading spinners

**Expected Result:**

- Teacher dropdown shows loading spinner while fetching
- Room dropdown shows loading spinner while fetching
- Save button shows loading spinner during API call
- Buttons disabled during loading

**Status:** ☐ Pass ☐ Fail

---

#### Test 6.2: Toast Notifications (Thai)

**Steps:**

1. Change language to Thai
2. Log in as admin
3. Open session detail modal
4. Click "Edit", make changes, Save

**Expected Result:**

- Success toast: "อัปเดตคาบเรียนสำเร็จ"
- All labels in Thai
- Status options in Thai

**Status:** ☐ Pass ☐ Fail

---

#### Test 6.3: Toast Notifications (English)

**Steps:**

1. Change language to English
2. Log in as admin
3. Open session detail modal
4. Click "Edit", make changes, Save

**Expected Result:**

- Success toast: "Session updated successfully"
- All labels in English
- Status options in English

**Status:** ☐ Pass ☐ Fail

---

#### Test 6.4: Button States

**Steps:**

1. Log in as admin
2. Open session detail modal
3. Observe Edit button states

**Expected Result:**

- Edit button has hover effect
- Disabled state during loading
- Proper icon display
- Clear visual feedback

**Status:** ☐ Pass ☐ Fail

---

### 7. Responsive Design Tests

#### Test 7.1: Desktop View (>1024px)

**Steps:**

1. View on desktop screen
2. Open session detail modal
3. Enter edit mode

**Expected Result:**

- Form fields in 2 columns
- All fields visible without scrolling
- Proper spacing and alignment

**Status:** ☐ Pass ☐ Fail

---

#### Test 7.2: Tablet View (768px-1023px)

**Steps:**

1. View on tablet or resize browser
2. Open session detail modal
3. Enter edit mode

**Expected Result:**

- Form fields stack appropriately
- Touch targets adequate size
- No horizontal scrolling

**Status:** ☐ Pass ☐ Fail

---

#### Test 7.3: Mobile View (<768px)

**Steps:**

1. View on mobile device
2. Open session detail modal
3. Enter edit mode

**Expected Result:**

- Form fields in single column
- Modal scrollable
- Dropdowns work properly
- Touch-friendly

**Status:** ☐ Pass ☐ Fail

---

### 8. Integration Tests

#### Test 8.1: Update Then View

**Steps:**

1. Log in as admin
2. Update session details
3. Close modal
4. Reopen same session
5. Verify changes persist

**Expected Result:**

- Changes are saved in database
- View mode shows updated data
- No data loss

**Status:** ☐ Pass ☐ Fail

---

#### Test 8.2: Update Then Teacher Views

**Steps:**

1. Log in as admin
2. Change session teacher
3. Log out
4. Log in as new assigned teacher
5. View session

**Expected Result:**

- Teacher sees updated session in their schedule
- Old teacher no longer sees it (if not default teacher)

**Status:** ☐ Pass ☐ Fail

---

#### Test 8.3: Update Session in Calendar

**Steps:**

1. Log in as admin
2. View session in calendar
3. Update session time/date
4. Return to calendar view

**Expected Result:**

- Calendar updates with new time/date
- Session appears in correct slot
- No duplicate entries

**Status:** ☐ Pass ☐ Fail

---

## Test Summary

| Category       | Total Tests | Passed | Failed | Blocked |
| -------------- | ----------- | ------ | ------ | ------- |
| Permission     | 4           | ☐      | ☐      | ☐       |
| Data Loading   | 3           | ☐      | ☐      | ☐       |
| Updates        | 7           | ☐      | ☐      | ☐       |
| Cancel/Exit    | 2           | ☐      | ☐      | ☐       |
| Error Handling | 3           | ☐      | ☐      | ☐       |
| UI/UX          | 4           | ☐      | ☐      | ☐       |
| Responsive     | 3           | ☐      | ☐      | ☐       |
| Integration    | 3           | ☐      | ☐      | ☐       |
| **TOTAL**      | **29**      | **0**  | **0**  | **0**   |

## Test Environment

- **Browser:** ******\_\_\_******
- **Screen Size:** ******\_\_\_******
- **OS:** ******\_\_\_******
- **API Version:** ******\_\_\_******
- **Date Tested:** ******\_\_\_******
- **Tester:** ******\_\_\_******

## Known Issues

| Issue | Severity | Status | Notes |
| ----- | -------- | ------ | ----- |
|       |          |        |       |

## Notes

---

---

---
