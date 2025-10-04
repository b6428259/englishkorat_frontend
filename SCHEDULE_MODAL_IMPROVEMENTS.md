# Schedule Modal Improvements

## Summary of Changes

This document outlines all the improvements made to the ClassScheduleModal component for better UX and functionality.

## 1. Single Room Selection ✅

### Previous Behavior

- Users could select multiple rooms
- Used `selectedRoomIds: number[]` state

### New Behavior

- **Users can only select ONE room at a time**
- Uses `selectedRoomId: number | null` state
- Click behavior: Clicking a selected room deselects it, clicking an unselected room selects it (radio-like behavior)

### Code Changes

```typescript
// Before
const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);

// After
const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
```

### UI Behavior

```typescript
onClick={() => {
  setSelectedRoomId(isSelected ? null : room.id);
}}
```

## 2. Room Conflict Check - Next Button Logic ✅

### Behavior

- The "Next" button on the Room tab is **disabled** when:
  1. No room is selected (`selectedRoomId === null`)
  2. OR there are room conflicts (`roomConflicts?.has_conflict === true`)

### Code

```typescript
<Button
  disabled={
    activeTab === "room" &&
    (selectedRoomId === null || (roomConflicts?.has_conflict ?? false))
  }
  variant="monthViewClicked"
  className="px-6 py-2 ... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {language === "th" ? "ต่อไป" : "Next"}
</Button>
```

## 3. Schedule Summary - Full Date Format ✅

### Previous Display

```
Start: 2025-10-03
End: 2025-10-31
```

### New Display (Thai)

```
เริ่ม: 3 ตุลาคม 2568
สิ้นสุด: 31 ตุลาคม 2568
```

### New Display (English)

```
Start: October 3, 2025
End: October 31, 2025
```

### Implementation

Uses `formatDateReadable()` utility function from `/src/utils/dateFormatter.ts`:

```typescript
<span className="font-medium text-indigo-600">
  {formatDateReadable(previewData.summary.start_date, language)}
</span>
```

## 4. Removed Estimated End Date Input Field ✅

### Previous Behavior

- Users had to manually input the estimated end date
- Field was shown in the Basic Info tab

### New Behavior

- **Estimated end date input field removed**
- The system automatically calculates it from the preview API
- Preview API returns `summary.estimated_end_date` based on:
  - Start date
  - Total hours
  - Hours per session
  - Session schedule
  - Holidays (auto-rescheduling)

### Code Changes

```typescript
// Removed from state
estimated_end_date: undefined, // ❌ REMOVED

// Removed from form
<div>
  <label>Estimated End Date</label>
  <input type="date" ... />
</div>
// ❌ ENTIRE FIELD REMOVED
```

## 5. Sessions List Display ✅

### New Section: "All Sessions"

Shows **all scheduled sessions** from the preview API with:

- Session number badge
- Week number
- Full date (Thai/English format)
- Start and end time
- Notes (if rescheduled due to holiday)

### Example Session Display

```
┌─────────────────────────────────────┐
│  1  Week 1                          │
│  October 6, 2025 (6 ตุลาคม 2568)  │
│  🕐 10:00 - 11:00                  │
├─────────────────────────────────────┤
│  5  Week 5                          │
│  November 4, 2025 (4 พฤศจิกายน 2568)│
│  🕐 10:00 - 11:00                  │
│  📝 Rescheduled due to holiday      │
└─────────────────────────────────────┘
```

### API Response Structure

```json
{
  "sessions": [
    {
      "session_number": 1,
      "week_number": 1,
      "date": "2025-10-06",
      "start_time": "10:00",
      "end_time": "11:00"
    },
    {
      "session_number": 5,
      "week_number": 5,
      "date": "2025-11-04",
      "start_time": "10:00",
      "end_time": "11:00",
      "notes": "Rescheduled due to holiday"
    }
  ]
}
```

### Type Definition Update

```typescript
export interface PreviewSession {
  session_number: number;
  week_number: number;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string; // ✅ ADDED
}
```

## 6. Full Responsive Design ✅

### Mobile Optimizations

#### Dialog Container

```typescript
// Mobile: 95% viewport width, tablets+: max 4xl
className = "w-[95vw] max-w-4xl max-h-[90vh]";
```

#### Tab Navigation

```typescript
// Mobile: 2x2 grid, Desktop: 1x4 grid
className="grid grid-cols-2 md:grid-cols-4 mb-6"

// Mobile: Smaller text and icons
className="text-xs md:text-sm"
<Icon className="h-3 w-3 md:h-4 md:w-4" />

// Mobile: Short labels, Desktop: Full labels
<span className="hidden sm:inline">Time Schedule</span>
<span className="sm:hidden">Time</span>
```

#### Header

```typescript
// Responsive padding and spacing
className="pb-4 md:pb-6 px-4 md:px-6 pt-4 md:pt-6"

// Title size
className="text-xl md:text-3xl font-bold"

// Icon size
<UsersIcon className="h-5 w-5 md:h-8 md:w-8" />
```

#### Footer Buttons

```typescript
// Mobile: Full width buttons, Desktop: Auto width
className = "flex-1 sm:flex-none px-4 sm:px-6 py-2";

// Button container
className = "flex flex-wrap items-center gap-2 sm:gap-3";
```

#### Content Grids

All grids use responsive patterns:

```typescript
// Single column mobile, 2 columns tablet, 3 columns desktop
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

// Single column mobile, 2 columns desktop
className = "grid grid-cols-1 md:grid-cols-2 gap-4";
```

#### Summary Dates

```typescript
// Mobile: Stack vertically, Desktop: Horizontal
className = "flex flex-col sm:flex-row sm:items-center gap-2";
```

#### Sessions List

```typescript
// Mobile: Stack vertically, Desktop: Side-by-side
className = "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3";

// Scrollable list with max height
className = "space-y-3 max-h-96 overflow-y-auto";
```

## Testing Checklist

### Room Selection

- [ ] Can only select one room at a time
- [ ] Clicking selected room deselects it
- [ ] Clicking different room switches selection
- [ ] Selected room shows checkmark and blue border

### Room Conflicts

- [ ] Next button disabled when no room selected
- [ ] Next button disabled when conflicts exist
- [ ] Next button enabled when room selected and no conflicts
- [ ] Conflict details displayed correctly

### Preview Summary

- [ ] Start date shows full format (Thai/English)
- [ ] End date shows full format (Thai/English)
- [ ] No estimated end date input field in Basic tab
- [ ] End date calculated automatically from API

### Sessions List

- [ ] All sessions displayed with correct formatting
- [ ] Session numbers shown correctly
- [ ] Week numbers shown correctly
- [ ] Dates shown in full format (Thai/English)
- [ ] Time range displayed correctly
- [ ] Notes shown for rescheduled sessions
- [ ] List scrollable if many sessions

### Responsive Design

- [ ] Modal fits properly on mobile (320px)
- [ ] Tabs displayed in 2x2 grid on mobile
- [ ] Tab labels shortened on mobile
- [ ] Buttons stack vertically on mobile
- [ ] Buttons full width on mobile
- [ ] Grids adapt to screen size
- [ ] Text sizes appropriate for screen
- [ ] No horizontal scrolling on any device

## Files Modified

1. **`src/app/schedule/components/ClassScheduleModal.tsx`**

   - Changed room selection from multiple to single
   - Added Next button disable logic
   - Updated summary date formatting
   - Removed estimated_end_date input
   - Added sessions list display
   - Enhanced responsive design

2. **`src/services/api/schedules.ts`**
   - Added `notes?: string` to `PreviewSession` interface

## Summary

All requested features have been successfully implemented:
✅ Single room selection only
✅ Next button disabled when conflicts exist
✅ Full date format in summary (Thai/English)
✅ Removed estimated end date input field
✅ Display all sessions from preview API
✅ Full responsive design for all screen sizes

The build succeeds with no TypeScript errors or warnings.
