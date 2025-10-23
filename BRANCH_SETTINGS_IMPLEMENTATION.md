# Branch Branding System - Frontend Implementation

วันที่: 23 ตุลาคม 2025

## 📋 Overview

ระบบจัดการ Logo และ Banner สำหรับแต่ละสาขา ที่ Admin และ Owner สามารถอัปโหลดและจัดการได้ผ่านหน้า Settings

## 🎯 Features Implemented

### 1. **New Types** (`src/types/branch.types.ts`)

- `BranchLogo` - ข้อมูล Logo ของสาขา
- `BranchBanner` - ข้อมูล Banner ของสาขา
- `BranchBranding` - รวมทั้ง Logo และ Banner
- Response types สำหรับ API

### 2. **Branch Service** (`src/services/branch.service.ts`)

API Methods:

- `getLogo(branchId)` - ดึงข้อมูล Logo (Public API)
- `getBanner(branchId)` - ดึงข้อมูล Banner (Public API)
- `uploadLogo(branchId, file)` - อัปโหลด/อัปเดต Logo (Admin only)
- `uploadBanner(branchId, file)` - อัปโหลด/อัปเดต Banner (Admin only)
- `deleteLogo(branchId)` - ลบ Logo (Admin only)
- `deleteBanner(branchId)` - ลบ Banner (Admin only)

### 3. **Updated Auth Types** (`src/types/auth.types.ts`)

เพิ่ม `BranchBrandingInfo` interface และ `branding` field ใน User type:

```typescript
export interface User {
  // ... existing fields
  branding?: {
    logo?: {
      id: number;
      logo_url: string;
      file_size: number;
      mime_type: string;
      created_at: string;
      updated_at: string;
    } | null;
    banner?: {
      id: number;
      banner_url: string;
      file_size: number;
      mime_type: string;
      created_at: string;
      updated_at: string;
    } | null;
  };
}
```

### 4. **BranchBrandingUpload Component** (`src/components/settings/BranchBrandingUpload.tsx`)

Component สำหรับอัปโหลดและจัดการ Logo และ Banner:

**Features:**

- ✅ Preview รูปปัจจุบัน (Logo และ Banner)
- ✅ Drag & Drop / Click to upload
- ✅ File validation (type และ size)
- ✅ Upload progress indicator
- ✅ Error handling และแสดงผล
- ✅ Delete functionality พร้อม confirmation
- ✅ Responsive design

**Validation:**

- รองรับไฟล์: JPG, JPEG, PNG, GIF, WebP, BMP
- ขนาดไฟล์สูงสุด: 10MB
- Logo: แนะนำ 200x200px (square ratio)
- Banner: แนะนำ 1920x400px (wide ratio)

### 5. **Branch Settings Page** (`src/app/settings/branch/page.tsx`)

หน้าตั้งค่าสาขาสำหรับ Admin/Owner:

**Features:**

- ✅ Access control (เฉพาะ Admin และ Owner)
- ✅ แสดงชื่อสาขาปัจจุบัน
- ✅ โหลด branding จาก user profile (GET /profile)
- ✅ แสดง tips และคำแนะนำ
- ✅ Breadcrumb navigation
- ✅ Multi-language support (TH/EN)

**Access Control:**

- ✅ Redirect to dashboard ถ้าไม่ใช่ Admin/Owner
- ✅ แสดง error message ถ้าไม่มี branch_id

### 6. **Updated Settings Menu** (`src/app/settings/page.tsx`)

เพิ่มตัวเลือก "Branch Settings" ในเมนู Settings:

- ✅ แสดงเฉพาะสำหรับ Admin และ Owner
- ✅ Icon: Building/Branch icon
- ✅ Role-based filtering

## 🔐 Permission Matrix

| Action                    | Student | Teacher | Admin | Owner |
| ------------------------- | ------- | ------- | ----- | ----- |
| View Branch Settings Menu | ❌      | ❌      | ✅    | ✅    |
| Access Settings Page      | ❌      | ❌      | ✅    | ✅    |
| Upload Logo               | ❌      | ❌      | ✅    | ✅    |
| Upload Banner             | ❌      | ❌      | ✅    | ✅    |
| Delete Logo               | ❌      | ❌      | ✅    | ✅    |
| Delete Banner             | ❌      | ❌      | ✅    | ✅    |

## 📁 File Structure

```
src/
├── types/
│   ├── branch.types.ts          ✅ NEW - Branch branding types
│   └── auth.types.ts             ✅ UPDATED - Added branding field
├── services/
│   └── branch.service.ts         ✅ NEW - Branch API service
├── components/
│   └── settings/
│       └── BranchBrandingUpload.tsx  ✅ NEW - Upload component
└── app/
    └── settings/
        ├── page.tsx              ✅ UPDATED - Added branch option
        └── branch/
            └── page.tsx          ✅ NEW - Branch settings page
```

## 🎨 UI/UX Features

### Logo Section

- 🏢 Icon indicator
- 📐 Square preview (80x80px)
- 📊 File size และ MIME type display
- 🗑️ Delete button with confirmation
- 🔄 Upload/Update functionality

### Banner Section

- 🎨 Icon indicator
- 📐 Wide preview (800x200px)
- 📊 File size และ MIME type display
- 🗑️ Delete button with confirmation
- 🔄 Upload/Update functionality

### Upload Area

- 🎯 Drag & drop support
- 📁 Click to upload
- ⚡ Upload progress indicator
- ⚠️ Error handling พร้อม user-friendly messages
- ℹ️ File requirements และคำแนะนำ

## 🔄 User Flow

1. **Admin/Owner เข้าสู่ระบบ**
2. **ไปที่ Settings** (`/settings`)
3. **เลือก "Branch Settings"** (จะเห็นเฉพาะ Admin/Owner)
4. **หน้า Branch Settings แสดง:**

   - ชื่อสาขา
   - Logo ปัจจุบัน (ถ้ามี)
   - Banner ปัจจุบัน (ถ้ามี)
   - Upload areas สำหรับทั้งสองอัน

5. **อัปโหลด Logo:**

   - คลิก "Choose File" หรือ drag & drop
   - ระบบ validate ไฟล์
   - แสดง preview
   - อัปโหลดไปยัง backend
   - อัปเดตแสดงผลทันที

6. **อัปโหลด Banner:**

   - เหมือน Logo flow
   - แต่ preview เป็นแบบ wide format

7. **ลบ Logo/Banner:**
   - คลิกปุ่ม "Remove"
   - Confirm dialog
   - ลบจาก backend และ S3
   - อัปเดต UI

## 🌐 API Integration

### Backend Requirements (ตาม BRANCH_BRANDING.md)

**Public Endpoints:**

- `GET /api/public/branches/:branch_id/logo`
- `GET /api/public/branches/:branch_id/banner`

**Protected Endpoints (Admin/Owner only):**

- `POST /api/branches/:branch_id/logo` - Upload/Update
- `DELETE /api/branches/:branch_id/logo` - Delete
- `POST /api/branches/:branch_id/banner` - Upload/Update
- `DELETE /api/branches/:branch_id/banner` - Delete

**Profile Endpoint (Updated):**

- `GET /api/profile` - รวม `branding` object ที่มี logo และ banner

## 📱 Responsive Design

- ✅ Mobile-friendly upload areas
- ✅ Responsive image previews
- ✅ Touch-friendly buttons
- ✅ Responsive grid layout

## 🚀 Next Steps

### For Backend Integration:

1. ตรวจสอบว่า `GET /profile` return `branding` object ตามที่กำหนด
2. ทดสอบ API endpoints ทั้งหมด
3. ตรวจสอบ CORS settings สำหรับ multipart/form-data

### For Frontend:

1. เพิ่ม loading states ระหว่างอัปโหลด
2. เพิ่ม success toast notifications
3. เพิ่ม image cropping/resizing ก่อนอัปโหลด (optional)
4. Cache invalidation หลังจากอัปเดต branding

### For UX Improvements:

1. Drag & drop visual feedback
2. Upload progress bar
3. Image preview modal (zoom)
4. Batch upload support (future)

## 🧪 Testing Checklist

- [ ] Admin สามารถเข้าหน้า Branch Settings ได้
- [ ] Owner สามารถเข้าหน้า Branch Settings ได้
- [ ] Teacher/Student ไม่เห็นเมนู Branch Settings
- [ ] Teacher/Student ถูก redirect ถ้าพยายามเข้า URL โดยตรง
- [ ] อัปโหลด Logo สำเร็จ
- [ ] อัปโหลด Banner สำเร็จ
- [ ] อัปเดต Logo/Banner ที่มีอยู่แล้วสำเร็จ
- [ ] ลบ Logo/Banner สำเร็จ
- [ ] File validation ทำงานถูกต้อง (type, size)
- [ ] Error messages แสดงผลชัดเจน
- [ ] Preview รูปภาพถูกต้อง
- [ ] Responsive ทุก breakpoint

## 💡 Implementation Notes

1. **Type Safety**: ใช้ TypeScript interfaces ที่ชัดเจนทุก layer
2. **Error Handling**: Catch errors และแสดงผลที่เป็นมิตรกับผู้ใช้
3. **Validation**: ทำทั้ง client-side และ server-side
4. **Cleanup**: ทำ URL.revokeObjectURL() เพื่อป้องกัน memory leaks
5. **Access Control**: Check role ทั้งใน UI และ backend
6. **State Management**: ใช้ local state สำหรับ upload flow
7. **Image Optimization**: Backend จะแปลงเป็น WebP อัตโนมัติ

## 📖 References

- Backend Documentation: `BRANCH_BRANDING.md`
- API Endpoints: ดูใน backend documentation
- Image Optimization: Next.js Image Component best practices
