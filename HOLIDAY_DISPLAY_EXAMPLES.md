# Holiday Impact Display - Visual Examples

## Example 1: Single Holiday (Thai)

```
╔════════════════════════════════════════════════════════════╗
║  🗓️  การปรับเปลี่ยนเนื่องจากวันหยุด                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │  ② คาบที่ 2                                          │ ║
║  │                                                       │ ║
║  │  วันที่ 13 ตุลาคม 2568                               │ ║
║  │  หยุดเนื่องจาก วันหยุดชดเชยวันปิยมหาราช             │ ║
║  │                                                       │ ║
║  │  → ถูกเลื่อนไปเป็น 3 พฤศจิกายน 2568                 │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Example 2: Single Holiday (English)

```
╔════════════════════════════════════════════════════════════╗
║  🗓️  Holiday Rescheduling                                 ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │  ② Session 2                                         │ ║
║  │                                                       │ ║
║  │  Date: October 13, 2025                              │ ║
║  │  Closed for วันหยุดชดเชยวันปิยมหาราช                │ ║
║  │                                                       │ ║
║  │  → Rescheduled to November 3, 2025                   │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Example 3: Multiple Holidays (Thai)

```
╔════════════════════════════════════════════════════════════╗
║  🗓️  การปรับเปลี่ยนเนื่องจากวันหยุด                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │  ② คาบที่ 2                                          │ ║
║  │  วันที่ 13 ตุลาคม 2568                               │ ║
║  │  หยุดเนื่องจาก วันหยุดชดเชยวันปิยมหาราช             │ ║
║  │  → ถูกเลื่อนไปเป็น 3 พฤศจิกายน 2568                 │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │  ⑤ คาบที่ 5                                          │ ║
║  │  วันที่ 5 ธันวาคม 2568                               │ ║
║  │  หยุดเนื่องจาก วันพ่อแห่งชาติ                        │ ║
║  │  → ถูกเลื่อนไปเป็น 7 ธันวาคม 2568                   │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │  ⑧ คาบที่ 8                                          │ ║
║  │  วันที่ 31 ธันวาคม 2568                              │ ║
║  │  หยุดเนื่องจาก วันสิ้นปี                             │ ║
║  │  → ถูกเลื่อนไปเป็น 2 มกราคม 2569                    │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Example 4: Holiday without name

```
╔════════════════════════════════════════════════════════════╗
║  🗓️  การปรับเปลี่ยนเนื่องจากวันหยุด                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │  ⑦ คาบที่ 7                                          │ ║
║  │                                                       │ ║
║  │  วันที่ 25 ธันวาคม 2568                              │ ║
║  │                                                       │ ║
║  │  → ถูกเลื่อนไปเป็น 26 ธันวาคม 2568                  │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Color Scheme

- **Background**: Gradient from amber-50 to orange-50
- **Border**: 2px solid amber-200
- **Card Background**: White
- **Card Border**: 1px solid amber-200
- **Session Badge**: amber-100 background, amber-700 text
- **Original Date**: red-600 (indicating closure)
- **New Date**: green-600 (indicating new schedule)
- **Holiday Name**: amber-700 italic

## Interactive States

### Hover State

- Card shadow increases from `shadow-sm` to `shadow-md`
- Smooth transition (200ms)

### Responsive Behavior

- Full width on mobile
- Maintains padding and readability
- Icons scale appropriately

## Accessibility

- ✅ Semantic HTML structure
- ✅ Clear color contrast (WCAG AA compliant)
- ✅ Icon + text for better understanding
- ✅ Readable font sizes
- ✅ Screen reader friendly

## Component Props

```typescript
interface HolidayImpact {
  session_number: number; // Required
  date: string; // Required (YYYY-MM-DD)
  holiday_name?: string; // Optional
  shifted_to: string; // Required (YYYY-MM-DD)
  was_rescheduled: boolean; // Required
}
```

## Usage in Component

```tsx
{
  previewData.holiday_impacts?.map((impact, idx) => (
    <div key={idx} className="holiday-card">
      <span className="badge">{impact.session_number}</span>
      <p>วันที่ {formatDateReadable(impact.date, "th")}</p>
      {impact.holiday_name && <p>หยุดเนื่องจาก {impact.holiday_name}</p>}
      <p>→ ถูกเลื่อนไปเป็น {formatDateReadable(impact.shifted_to, "th")}</p>
    </div>
  ));
}
```
