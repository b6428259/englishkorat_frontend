# Session Update UI Guide

## View Mode (Default)

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Session Details #123                              [X]     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Introduction to English A1                                  │
│  [🟢 Confirmed]  [✏️ Edit]  ← Admin/Owner only              │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 📅 Date  │ │ 🕐 Time  │ │ 📍 Room  │ │ 👥 Session│       │
│  │ Jan 15   │ │10:00-12:00│ │ Room A  │ │ 3 / Week 2│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Additional Information                                │   │
│  │ Schedule ID: #123                                     │   │
│  │ Makeup Session: No                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Edit Mode (Admin/Owner)

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Session Details #123                              [X]     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Introduction to English A1                                  │
│  [❌ Cancel]  [💾 Save]  ← Edit mode controls               │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Date                    │ Start Time                 │    │
│  │ [2025-01-15        ▼]  │ [10:00              ▼]    │    │
│  │                         │                            │    │
│  │ End Time                │ Status                     │    │
│  │ [12:00              ▼]  │ [Confirmed          ▼]    │    │
│  │                         │                            │    │
│  │ Teacher                 │ Room                       │    │
│  │ [Sarah Johnson      ▼]  │ [Room A             ▼]    │    │
│  │                         │                            │    │
│  │ Notes                                                │    │
│  │ [Teacher changed due to availability...          ]  │    │
│  │                                                       │    │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Status Dropdown Options

```
┌─────────────────────────┐
│ Status              [▼] │
├─────────────────────────┤
│ ○ Scheduled             │
│ ● Confirmed     ✓       │  ← Currently selected
│ ○ Pending               │
│ ○ Completed             │
│ ○ Cancelled             │
│ ○ Rescheduled           │
│ ○ No-show               │
└─────────────────────────┘
```

## Cancelling Reason (Conditional - Only when status = Cancelled)

```
┌─────────────────────────────────────────────────────────────┐
│  Status                                                      │
│  [Cancelled                                             ▼]  │
│                                                               │
│  Cancelling Reason                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Holiday - school closed                                 │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Toast Notifications

### Success (Thai)

```
┌──────────────────────────────┐
│ ✅ อัปเดตคาบเรียนสำเร็จ       │
└──────────────────────────────┘
```

### Success (English)

```
┌──────────────────────────────┐
│ ✅ Session updated successfully │
└──────────────────────────────┘
```

### Error (Thai)

```
┌────────────────────────────────────┐
│ ❌ ไม่สามารถอัปเดตคาบเรียนได้    │
└────────────────────────────────────┘
```

### Error (English)

```
┌──────────────────────────────┐
│ ❌ Failed to update session   │
└──────────────────────────────┘
```

## Button States

### Normal

```
[✏️ Edit]     - Default state
```

### Loading (Fetching options)

```
[⏳ Edit]     - Disabled while loading teachers/rooms
```

### Saving

```
[⏳ Saving...] - Shows spinner while API request
```

### Disabled

```
[✏️ Edit]     - Grayed out, no hover effect
```

## Permission Matrix

| Role    | Can See Edit Button | Can Edit Time | Can Edit Teacher | Can Edit Room | Can Edit Status | Can Edit Notes |
| ------- | ------------------- | ------------- | ---------------- | ------------- | --------------- | -------------- |
| Owner   | ✅                  | ✅            | ✅               | ✅            | ✅              | ✅             |
| Admin   | ✅                  | ✅            | ✅               | ✅            | ✅              | ✅             |
| Teacher | ❌                  | ❌            | ❌               | ❌            | ⚠️\*            | ⚠️\*           |
| Student | ❌                  | ❌            | ❌               | ❌            | ❌              | ❌             |

\*Teachers can update status and notes via API, but UI doesn't show edit button (they use Confirm/Decline buttons instead)

## Workflow Diagram

```
┌─────────────┐
│ View Mode   │
│ (Default)   │
└──────┬──────┘
       │
       │ Click "Edit" (Admin/Owner only)
       ▼
┌─────────────┐
│ Load Options│ ← Fetch Teachers & Rooms
│  (Loading)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Edit Mode  │ ← Form with all fields
│  (Editing)  │
└──────┬──────┘
       │
       ├─────► Click "Cancel" → Return to View Mode
       │
       └─────► Click "Save"
               │
               ▼
        ┌─────────────┐
        │   Saving    │ ← API Request
        │  (Loading)  │
        └──────┬──────┘
               │
               ├─────► Success → Toast + Refresh + View Mode
               │
               └─────► Error → Toast + Stay in Edit Mode
```

## Responsive Layout

### Desktop (>= 1024px)

- 4 columns for date/time/room/session info
- 2 columns for form fields
- Full-width notes textarea

### Tablet (768px - 1023px)

- 2 columns for date/time/room/session info
- 2 columns for form fields
- Full-width notes textarea

### Mobile (< 768px)

- 1 column for all info
- 1 column for form fields
- Full-width notes textarea

## Keyboard Navigation

- **Tab**: Move between form fields
- **Shift+Tab**: Move backwards
- **Enter**: Submit form (when focused on button)
- **Escape**: Cancel edit mode (future enhancement)

## Accessibility

- All form fields have labels
- Dropdowns have descriptive options
- Loading states announced
- Error messages visible
- Color contrast meets WCAG AA
- Touch targets >= 44x44px
