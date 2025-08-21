# Student Form Updates

## การอัปเดต StudentForm Component

### ฟีเจอร์ใหม่ที่เพิ่ม

1. **การเลือกภาษาที่ต้องการเรียน**
   - อังกฤษ (English)
   - จีน (Chinese)

2. **ระดับภาษาแยกตามภาษา**
   - สำหรับอังกฤษ: Beginner (A1), Elementary (A2), Intermediate (B1), Upper-Intermediate (B2), Advanced (C1-C2)
   - สำหรับจีน: Beginner, Elementary, Intermediate, Advanced

3. **รูปแบบการเรียน**
   - เรียนเดี่ยว (Private 1-on-1)
   - เรียนคู่ (Pair 2 คน)
   - เรียนกลุ่ม (Group 3+ คน)

4. **การกรองคอร์สอัตโนมัติ**
   - กรองตามภาษาที่เลือก (อังกฤษ/จีน)
   - กรองตามรูปแบบการเรียน (จำนวนนักเรียนสูงสุดในคอร์ส)
   - **🆕 กรองตามระดับภาษาที่เลือก (Level Matching)**

5. **การเชื่อมต่อ API จริง**
   - ดึงข้อมูลคอร์สจาก `https://api.englishkorat.site/api/v1/course`
   - จัดการ Authentication Token ผ่าน localStorage
   - สร้าง Service layer สำหรับจัดการ API calls

### การแมป Level กับคอร์ส

```typescript
const levelMatching: Record<string, string[]> = {
  'beginner': ['a1', 'beginner', 'foundation', 'basic'],
  'elementary': ['a2', 'elementary', 'foundation'],
  'intermediate': ['b1', 'intermediate'],
  'upper-intermediate': ['b2', 'upper-intermediate', 'upper-int'],
  'advanced': ['advanced', 'c1', 'c2']
};

// Special levels ที่สามารถเรียนได้ทุกระดับ
const specialLevels = ['private', 'business', 'travel', 'corporate', 'preparation', 'intensive', 'general training'];
```

### ตัวอย่างการแมปคอร์ส

| Course Name | Level | แสดงให้ User Level |
|-------------|-------|-------------------|
| Adults Conversation A1 | A1 | Beginner |
| English 4 Skills Foundation | Foundation | Beginner, Elementary |
| Business Conversation | Business | ทุกระดับ |
| TOEIC Intensive | Intensive | ทุกระดับ |
| Chinese 4 Skills Advanced | Advanced | Advanced |

### การใช้งาน

```tsx
import StudentForm from '../../../components/forms/StudentForm';
import { courseService } from '../../../services/course.service';

// ดึงข้อมูลคอร์สจาก API
const courses = await courseService.getCourses();

<StudentForm
  availableCourses={courses}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  loading={loading}
  mode="create"
/>
```

### โครงสร้างข้อมูล Course (อัปเดต)

```typescript
interface Course {
  id: number;
  name: string;
  code: string;
  course_type: string;
  description: string;
  price: string;
  hours_total: number;
  max_students: number;
  level: string;                // 🆕 เพิ่ม level field
  branch_name: string;
  branch_code: string;
}
```

### Services ที่เพิ่ม

1. **courseService** (`src/services/course.service.ts`)
   - `getCourses()`: ดึงข้อมูลคอร์สทั้งหมด

2. **authService** (อัปเดต)
   - เปลี่ยนจาก `'token'` เป็น `'authToken'` ใน localStorage
   - เพิ่ม `isAuthenticated()` และ `getToken()` methods

### การกรองคอร์ส (Enhanced)

ระบบจะกรองคอร์สตามลำดับ:

1. **ตามภาษา**: อังกฤษ หรือ จีน
2. **ตามรูปแบบการเรียน**: เดี่ยว/คู่/กลุ่ม
3. **🆕 ตามระดับภาษา**: แมป user level กับ course level

### API Integration

```typescript
// GET Courses
GET https://api.englishkorat.site/api/v1/course
Headers: {
  "Authorization": "Bearer {{token}}",
  "Content-Type": "application/json"
}

// POST Student (TODO)
POST https://api.englishkorat.site/api/v1/students
Headers: {
  "Authorization": "Bearer {{token}}",
  "Content-Type": "application/json"
}
Body: StudentFormData
```

### Authentication Flow

1. Login → เก็บ token ใน `localStorage.setItem('authToken', token)`
2. Page load → ตรวจสอบ `authService.isAuthenticated()`
3. API calls → ส่ง `Authorization: Bearer ${token}`
4. Token invalid → Redirect ไป `/auth`

### ไฟล์ที่ได้รับการอัปเดต

1. `src/components/forms/StudentForm.tsx` - เพิ่ม level filtering
2. `src/services/auth.service.ts` - เปลี่ยน token key
3. `src/services/course.service.ts` - ✨ ไฟล์ใหม่
4. `src/app/students/new/page.tsx` - ใช้ API จริง
5. `STUDENT_FORM_UPDATE.md` - เอกสารอัปเดต

### การทดสอบ

1. ✅ เลือกภาษาอังกฤษ → แสดงแต่คอร์สอังกฤษ
2. ✅ เลือกภาษาจีน → แสดงแต่คอร์สจีน  
3. ✅ เลือก Beginner → แสดงคอร์ส A1, Foundation, Basic + Special levels
4. ✅ เลือก Advanced → แสดงคอร์ส Advanced, C1, C2 + Special levels
5. ✅ เลือกเรียนเดี่ยว → แสดงคอร์สที่ max_students = 1
6. ✅ API Integration → ดึงข้อมูลจาก backend จริง

### TODO

- [ ] เพิ่ม error handling สำหรับ network failures
- [ ] เพิ่ม retry mechanism สำหรับ API calls
- [ ] สร้าง student creation API endpoint
- [ ] เพิ่ม loading skeleton สำหรับ course list
- [ ] เพิ่ม toast notifications แทน alert()
- [ ] เพิ่ม course preview/details modal
