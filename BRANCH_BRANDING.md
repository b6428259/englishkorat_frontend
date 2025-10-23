# Branch Branding System (Logo & Banner)

ระบบจัดการ Logo และ Banner สำหรับแต่ละสาขา โดยแต่ละสาขาสามารถมี Logo และ Banner ได้อย่างละ 1 อัน

## 📋 คุณสมบัติหลัก

- ✅ แต่ละสาขามี Logo ได้แค่ 1 อัน
- ✅ แต่ละสาขามี Banner ได้แค่ 1 อัน
- ✅ อัปโหลดและเก็บไฟล์ใน AWS S3
- ✅ แปลงรูปภาพเป็น WebP อัตโนมัติ (ถ้าติดตั้ง cwebp)
- ✅ ลบไฟล์เก่าออกจาก S3 ทันทีเมื่อมีการอัปเดต
- ✅ Public API สำหรับดู Logo และ Banner (ไม่ต้อง authentication)
- ✅ Protected API สำหรับอัปโหลดและลบ (เฉพาะ Admin/Owner)

---

## 📊 Database Schema

### `branch_logos` Table
```sql
CREATE TABLE `branch_logos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `branch_id` bigint unsigned NOT NULL,
  `logo_url` varchar(500) NOT NULL,
  `s3_key` varchar(500) NOT NULL,
  `file_size` bigint DEFAULT '0',
  `mime_type` varchar(100),
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `branch_id` (`branch_id`),
  KEY `idx_branch_logos_deleted_at` (`deleted_at`)
);
```

### `branch_banners` Table
```sql
CREATE TABLE `branch_banners` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `branch_id` bigint unsigned NOT NULL,
  `banner_url` varchar(500) NOT NULL,
  `s3_key` varchar(500) NOT NULL,
  `file_size` bigint DEFAULT '0',
  `mime_type` varchar(100),
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `branch_id` (`branch_id`),
  KEY `idx_branch_banners_deleted_at` (`deleted_at`)
);
```

---

## 🔌 API Endpoints

### 1. Get Branch Logo (Public)

**Endpoint**: `GET /api/public/branches/:branch_id/logo`

**Authentication**: ❌ ไม่ต้อง

**Description**: ดึงข้อมูล Logo ของสาขา

**Response Success (200)**:
```json
{
  "logo": {
    "id": 1,
    "branch_id": 1,
    "logo_url": "https://bucket.s3.region.amazonaws.com/branch-logos/1/2025/10/23/abc123.webp",
    "s3_key": "branch-logos/1/2025/10/23/abc123.webp",
    "file_size": 125678,
    "mime_type": "image/webp",
    "created_at": "2025-10-23T10:00:00Z",
    "updated_at": "2025-10-23T10:00:00Z"
  }
}
```

**Response Error (404)**:
```json
{
  "error": "Logo not found for this branch"
}
```

---

### 2. Upload/Update Branch Logo (Admin Only)

**Endpoint**: `POST /api/branches/:branch_id/logo`

**Authentication**: ✅ ต้องมี JWT Token (Admin/Owner เท่านั้น)

**Content-Type**: `multipart/form-data`

**Request Body**:
- `logo` (file): ไฟล์รูปภาพ (jpg, jpeg, png, gif, webp, bmp)

**Description**: อัปโหลดหรืออัปเดต Logo ของสาขา
- ถ้าสาขามี Logo อยู่แล้ว จะลบไฟล์เก่าออกจาก S3 และอัปเดตเป็น Logo ใหม่
- ถ้าสาขายังไม่มี Logo จะสร้างใหม่

**Response Success (200)**:
```json
{
  "message": "Logo uploaded successfully",
  "logo": {
    "id": 1,
    "branch_id": 1,
    "logo_url": "https://bucket.s3.region.amazonaws.com/branch-logos/1/2025/10/23/abc123.webp",
    "s3_key": "branch-logos/1/2025/10/23/abc123.webp",
    "file_size": 125678,
    "mime_type": "image/webp",
    "created_at": "2025-10-23T10:00:00Z",
    "updated_at": "2025-10-23T10:00:00Z"
  }
}
```

**Response Errors**:
```json
// 400 Bad Request
{
  "error": "Invalid branch ID"
}
{
  "error": "Logo file is required"
}
{
  "error": "Only image files are allowed (jpg, jpeg, png, gif, webp)"
}

// 401 Unauthorized
{
  "error": "Unauthorized"
}

// 403 Forbidden
{
  "error": "Permission denied"
}

// 500 Internal Server Error
{
  "error": "Failed to initialize storage service"
}
{
  "error": "Failed to upload logo"
}
{
  "error": "Failed to create logo"
}
{
  "error": "Failed to update logo"
}
```

---

### 3. Delete Branch Logo (Admin Only)

**Endpoint**: `DELETE /api/branches/:branch_id/logo`

**Authentication**: ✅ ต้องมี JWT Token (Admin/Owner เท่านั้น)

**Description**: ลบ Logo ของสาขา (ลบทั้งจาก database และ S3)

**Response Success (200)**:
```json
{
  "message": "Logo deleted successfully"
}
```

**Response Errors**:
```json
// 400 Bad Request
{
  "error": "Invalid branch ID"
}

// 404 Not Found
{
  "error": "Logo not found for this branch"
}

// 500 Internal Server Error
{
  "error": "Failed to delete logo"
}
```

---

### 4. Get Branch Banner (Public)

**Endpoint**: `GET /api/public/branches/:branch_id/banner`

**Authentication**: ❌ ไม่ต้อง

**Description**: ดึงข้อมูล Banner ของสาขา

**Response Success (200)**:
```json
{
  "banner": {
    "id": 1,
    "branch_id": 1,
    "banner_url": "https://bucket.s3.region.amazonaws.com/branch-banners/1/2025/10/23/xyz789.webp",
    "s3_key": "branch-banners/1/2025/10/23/xyz789.webp",
    "file_size": 256789,
    "mime_type": "image/webp",
    "created_at": "2025-10-23T10:00:00Z",
    "updated_at": "2025-10-23T10:00:00Z"
  }
}
```

**Response Error (404)**:
```json
{
  "error": "Banner not found for this branch"
}
```

---

### 5. Upload/Update Branch Banner (Admin Only)

**Endpoint**: `POST /api/branches/:branch_id/banner`

**Authentication**: ✅ ต้องมี JWT Token (Admin/Owner เท่านั้น)

**Content-Type**: `multipart/form-data`

**Request Body**:
- `banner` (file): ไฟล์รูปภาพ (jpg, jpeg, png, gif, webp, bmp)

**Description**: อัปโหลดหรืออัปเดต Banner ของสาขา
- ถ้าสาขามี Banner อยู่แล้ว จะลบไฟล์เก่าออกจาก S3 และอัปเดตเป็น Banner ใหม่
- ถ้าสาขายังไม่มี Banner จะสร้างใหม่

**Response Success (200)**:
```json
{
  "message": "Banner uploaded successfully",
  "banner": {
    "id": 1,
    "branch_id": 1,
    "banner_url": "https://bucket.s3.region.amazonaws.com/branch-banners/1/2025/10/23/xyz789.webp",
    "s3_key": "branch-banners/1/2025/10/23/xyz789.webp",
    "file_size": 256789,
    "mime_type": "image/webp",
    "created_at": "2025-10-23T10:00:00Z",
    "updated_at": "2025-10-23T10:00:00Z"
  }
}
```

**Response Errors**: (เหมือนกับ Logo)

---

### 6. Delete Branch Banner (Admin Only)

**Endpoint**: `DELETE /api/branches/:branch_id/banner`

**Authentication**: ✅ ต้องมี JWT Token (Admin/Owner เท่านั้น)

**Description**: ลบ Banner ของสาขา (ลบทั้งจาก database และ S3)

**Response Success (200)**:
```json
{
  "message": "Banner deleted successfully"
}
```

**Response Errors**: (เหมือนกับ Logo)

---

## 💡 Usage Examples

### Upload Logo (cURL)
```bash
curl -X POST http://localhost:3000/api/branches/1/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "logo=@/path/to/logo.png"
```

### Upload Banner (cURL)
```bash
curl -X POST http://localhost:3000/api/branches/1/banner \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "banner=@/path/to/banner.jpg"
```

### Get Logo (Public - No Auth)
```bash
curl http://localhost:3000/api/public/branches/1/logo
```

### Get Banner (Public - No Auth)
```bash
curl http://localhost:3000/api/public/branches/1/banner
```

### Delete Logo
```bash
curl -X DELETE http://localhost:3000/api/branches/1/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Banner
```bash
curl -X DELETE http://localhost:3000/api/branches/1/banner \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 Business Rules

1. **One Logo/Banner per Branch**: แต่ละสาขามีได้เพียง Logo 1 อัน และ Banner 1 อัน
2. **Automatic Replacement**: เมื่ออัปโหลดใหม่ ระบบจะลบไฟล์เก่าออกจาก S3 ทันที
3. **WebP Conversion**: รูปภาพจะถูกแปลงเป็น WebP อัตโนมัติ (ถ้ามี cwebp tool)
4. **Public Access**: ทุกคนสามารถดู Logo และ Banner ได้โดยไม่ต้อง login
5. **Admin Control**: เฉพาะ Admin และ Owner เท่านั้นที่สามารถอัปโหลด/ลบได้

---

## 🔒 Security & Permissions

| Action | Student | Teacher | Admin | Owner |
|--------|---------|---------|-------|-------|
| Get Logo/Banner (Public) | ✅ | ✅ | ✅ | ✅ |
| Upload Logo/Banner | ❌ | ❌ | ✅ | ✅ |
| Delete Logo/Banner | ❌ | ❌ | ✅ | ✅ |

---

## 📝 Notes

1. ระบบใช้ **uniqueIndex** บน `branch_id` เพื่อให้แต่ละสาขามี Logo/Banner ได้เพียง 1 อัน
2. ไฟล์จะถูกเก็บใน S3 ที่ folder:
   - Logos: `branch-logos/{branch_id}/{year}/{month}/{day}/{random_id}.webp`
   - Banners: `branch-banners/{branch_id}/{year}/{month}/{day}/{random_id}.webp`
3. เมื่อมีการอัปเดต ระบบจะลบไฟล์เก่าออกจาก S3 ทันที (ไม่เก็บ history)
4. Activity Log จะถูกบันทึกทุกครั้งที่มีการอัปโหลด/ลบ

---

## 🔄 Update History

- **2025-10-23**: สร้างระบบ Branch Branding (Logo & Banner)
