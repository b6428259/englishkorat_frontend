# Auth System Documentation

## โครงสร้างไฟล์ Auth System

```
src/
├── app/
│   ├── auth/
│   │   └── page.tsx           # หน้า Auth (Login/Register)
│   └── dashboard/
│       └── page.tsx           # หน้า Dashboard (หลังจาก login สำเร็จ)
├── components/
│   └── forms/
│       └── AuthForm.tsx       # Component สำหรับฟอร์ม Login/Register
├── hooks/
│   └── useAuth.ts            # Custom Hook สำหรับจัดการ Authentication
├── services/
│   ├── api.ts                # Axios instance และ interceptors
│   └── auth.service.ts       # Service สำหรับ API calls ที่เกี่ยวข้องกับ Auth
└── types/
    └── auth.types.ts         # TypeScript types สำหรับ Auth
```

## การใช้งาน

### 1. เข้าถึงหน้า Auth
```
http://localhost:3000/auth
```

### 2. คุณสมบัติของหน้า Auth
- **สลับโหมด**: สามารถสลับระหว่าง Login และ Register ในหน้าเดียวกัน
- **Validation**: ตรวจสอบข้อมูลก่อนส่ง
- **Error Handling**: แสดงข้อผิดพลาดที่เข้าใจง่าย
- **Loading State**: แสดงสถานะกำลังโหลดระหว่างประมวลผล

### 3. ฟิลด์ในฟอร์ม

#### Login
- ชื่อผู้ใช้ (username) - บังคับ
- รหัสผ่าน (password) - บังคับ

#### Register
- ชื่อผู้ใช้ (username) - บังคับ
- รหัสผ่าน (password) - บังคับ
- อีเมล (email) - บังคับ
- เบอร์โทรศัพท์ (phone) - ไม่บังคับ
- Line ID (line_id) - ไม่บังคับ

## API Integration

### Base URL
```typescript
// ใน .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

### Endpoints ที่ใช้
- **POST /auth/login** - เข้าสู่ระบบ
- **POST /auth/register** - สมัครสมาชิก

### Token Management
- Token จะถูกเก็บใน localStorage
- Auto-attach ใน Authorization header สำหรับ API calls ต่างๆ
- Auto-logout เมื่อ token หมดอายุ (401 response)

## การพัฒนาต่อ

### 1. เพิ่มฟิลด์ใหม่ในฟอร์ม
1. อัปเดต `auth.types.ts` เพิ่มฟิลด์ใน interface
2. อัปเดต `AuthForm.tsx` เพิ่ม input field
3. อัปเดต state ใน `formData`

### 2. เพิ่ม validation
- ใช้ library อย่าง `react-hook-form` หรือ `formik`
- เพิ่ม validation rules ใน `AuthForm.tsx`

### 3. เพิ่ม social login
- เพิ่ม button สำหรับ Google/Facebook login
- สร้าง service methods ใหม่ใน `auth.service.ts`

### 4. Protected Routes
```typescript
// ตัวอย่างการใช้งาน
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>กำลังตรวจสอบสิทธิ์...</div>;
  }

  return <div>Protected Content</div>;
};
```

### 5. Role-based Access
- เพิ่ม role checking ใน `useAuth` hook
- สร้าง higher-order component สำหรับ role protection

## Testing

### Manual Testing Checklist
- [ ] สามารถสลับระหว่าง Login/Register ได้
- [ ] ฟอร์ม validation ทำงานถูกต้อง
- [ ] Login สำเร็จ redirect ไป dashboard
- [ ] Register สำเร็จ redirect ไป dashboard
- [ ] แสดง error message เมื่อ credentials ผิด
- [ ] Token ถูกเก็บใน localStorage
- [ ] Auto-logout เมื่อ token หมดอายุ

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

## Notes สำหรับ Developer

1. **Security**: ในการใช้งานจริง ควรใช้ httpOnly cookies แทน localStorage
2. **Error Handling**: สามารถปรับแต่ง error messages ใน `useAuth.ts`
3. **Styling**: ใช้ Tailwind CSS สามารถปรับแต่ง style ได้ใน `AuthForm.tsx`
4. **TypeScript**: มี type safety เต็มรูปแบบ ช่วยลด bugs
5. **Responsive**: ออกแบบให้ใช้งานได้ทั้ง desktop และ mobile
