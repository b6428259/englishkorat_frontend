# Branch Management API - Frontend Documentation

This document provides comprehensive API documentation for branch management with integrated branding (logo and banner) features. All endpoints are designed for frontend developers to easily integrate branch information and branding assets.

---

## Table of Contents

1. [Public Endpoints (No Authentication Required)](#public-endpoints-no-authentication-required)
2. [Protected Endpoints (Authentication Required)](#protected-endpoints-authentication-required)
3. [Response Structures](#response-structures)
4. [Error Handling](#error-handling)
5. [Usage Examples](#usage-examples)

---

## Public Endpoints (No Authentication Required)

These endpoints are accessible without authentication, perfect for public-facing pages, landing pages, and branch selectors.

### 1. Get All Branches with Branding

**Endpoint:** `GET /api/public/branches`

**Description:** Returns a list of all branches with their logo and banner information.

**Query Parameters:**
- `active` (optional): Filter by active status
  - `"true"` - Only active branches (default)
  - `"false"` - Only inactive branches
  - `"all"` - All branches regardless of status
- `type` (optional): Filter by branch type (e.g., "main", "branch")

**Example Request:**
```http
GET /api/public/branches?active=true
```

**Example Response:**
```json
{
  "branches": [
    {
      "branch": {
        "id": 1,
        "name_en": "English Korat Main",
        "name_th": "อิงลิชโคราช สำนักงานใหญ่",
        "code": "EK-MAIN",
        "address": "123 Main Street, Korat",
        "phone": "044-123456",
        "type": "main",
        "active": true,
        "open_time": "08:00:00",
        "close_time": "20:00:00",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      },
      "logo": {
        "id": 1,
        "logo_url": "https://bucket.s3.amazonaws.com/branch-logos/logo_123.webp",
        "file_size": 45678,
        "mime_type": "image/webp",
        "created_at": "2024-01-10T12:00:00Z",
        "updated_at": "2024-01-10T12:00:00Z"
      },
      "banner": {
        "id": 1,
        "banner_url": "https://bucket.s3.amazonaws.com/branch-banners/banner_123.webp",
        "file_size": 123456,
        "mime_type": "image/webp",
        "created_at": "2024-01-10T12:05:00Z",
        "updated_at": "2024-01-10T12:05:00Z"
      }
    },
    {
      "branch": {
        "id": 2,
        "name_en": "English Korat Mall Branch",
        "name_th": "อิงลิชโคราช สาขาห้าง",
        "code": "EK-MALL",
        "address": "456 Mall Avenue, Korat",
        "phone": "044-654321",
        "type": "branch",
        "active": true,
        "open_time": "10:00:00",
        "close_time": "21:00:00",
        "created_at": "2024-02-01T00:00:00Z",
        "updated_at": "2024-02-10T14:20:00Z"
      },
      "logo": null,
      "banner": null
    }
  ],
  "total": 2
}
```

**Notes:**
- If a branch doesn't have a logo or banner, those fields will be `null`
- Images are automatically converted to WebP format for optimal performance
- Use this endpoint for branch selection dropdowns, branch listings, and public branch directories

---

### 2. Get Single Branch with Branding

**Endpoint:** `GET /api/public/branches/:id`

**Description:** Returns detailed information about a specific branch including logo and banner.

**Path Parameters:**
- `id` (required): Branch ID

**Example Request:**
```http
GET /api/public/branches/1
```

**Example Response:**
```json
{
  "branch": {
    "id": 1,
    "name_en": "English Korat Main",
    "name_th": "อิงลิชโคราช สำนักงานใหญ่",
    "code": "EK-MAIN",
    "address": "123 Main Street, Korat",
    "phone": "044-123456",
    "type": "main",
    "active": true,
    "open_time": "08:00:00",
    "close_time": "20:00:00",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "logo": {
    "id": 1,
    "logo_url": "https://bucket.s3.amazonaws.com/branch-logos/logo_123.webp",
    "file_size": 45678,
    "mime_type": "image/webp",
    "created_at": "2024-01-10T12:00:00Z",
    "updated_at": "2024-01-10T12:00:00Z"
  },
  "banner": {
    "id": 1,
    "banner_url": "https://bucket.s3.amazonaws.com/branch-banners/banner_123.webp",
    "file_size": 123456,
    "mime_type": "image/webp",
    "created_at": "2024-01-10T12:05:00Z",
    "updated_at": "2024-01-10T12:05:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid branch ID format
- `404 Not Found` - Branch doesn't exist

**Notes:**
- Perfect for branch detail pages
- Can be used to display branch information on public registration pages

---

### 3. Get Branch Logo (Direct URL)

**Endpoint:** `GET /api/public/branches/:branch_id/logo`

**Description:** Returns the logo information for a specific branch.

**Example Response:**
```json
{
  "logo": {
    "id": 1,
    "branch_id": 1,
    "logo_url": "https://bucket.s3.amazonaws.com/branch-logos/logo_123.webp",
    "s3_key": "branch-logos/logo_123.webp",
    "file_size": 45678,
    "mime_type": "image/webp",
    "created_at": "2024-01-10T12:00:00Z",
    "updated_at": "2024-01-10T12:00:00Z"
  }
}
```

---

### 4. Get Branch Banner (Direct URL)

**Endpoint:** `GET /api/public/branches/:branch_id/banner`

**Description:** Returns the banner information for a specific branch.

**Example Response:**
```json
{
  "banner": {
    "id": 1,
    "branch_id": 1,
    "banner_url": "https://bucket.s3.amazonaws.com/branch-banners/banner_123.webp",
    "s3_key": "branch-banners/banner_123.webp",
    "file_size": 123456,
    "mime_type": "image/webp",
    "created_at": "2024-01-10T12:05:00Z",
    "updated_at": "2024-01-10T12:05:00Z"
  }
}
```

---

## Protected Endpoints (Authentication Required)

These endpoints require a valid JWT token in the Authorization header.

**Authentication Header:**
```http
Authorization: Bearer <your_jwt_token>
```

---

### 5. Get All Branches (Protected)

**Endpoint:** `GET /api/branches`

**Description:** Returns all branches (for authenticated users with teacher role or above).

**Required Role:** Teacher, Admin, or Owner

**Example Response:**
```json
{
  "branches": [
    {
      "id": 1,
      "name_en": "English Korat Main",
      "name_th": "อิงลิชโคราช สำนักงานใหญ่",
      "code": "EK-MAIN",
      "address": "123 Main Street, Korat",
      "phone": "044-123456",
      "type": "main",
      "active": true,
      "open_time": "08:00:00",
      "close_time": "20:00:00",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 6. Get Single Branch (Protected)

**Endpoint:** `GET /api/branches/:id`

**Description:** Get a specific branch by ID (authenticated users only).

**Required Role:** Teacher, Admin, or Owner

---

### 7. Create Branch

**Endpoint:** `POST /api/branches`

**Description:** Create a new branch.

**Required Role:** Admin or Owner

**Request Body (JSON):**
```json
{
  "name_en": "English Korat North",
  "name_th": "อิงลิชโคราช สาขาเหนือ",
  "code": "EK-NORTH",
  "address": "789 North Road, Korat",
  "phone": "044-999888",
  "type": "branch",
  "active": true,
  "open_time": "09:00:00",
  "close_time": "19:00:00"
}
```

**Example Response:**
```json
{
  "message": "Branch created successfully",
  "branch": {
    "id": 3,
    "name_en": "English Korat North",
    "name_th": "อิงลิชโคราช สาขาเหนือ",
    "code": "EK-NORTH",
    "address": "789 North Road, Korat",
    "phone": "044-999888",
    "type": "branch",
    "active": true,
    "open_time": "09:00:00",
    "close_time": "19:00:00",
    "created_at": "2024-03-01T10:00:00Z",
    "updated_at": "2024-03-01T10:00:00Z"
  }
}
```

---

### 8. Update Branch (Basic Info Only)

**Endpoint:** `PUT /api/branches/:id`

**Description:** Update branch information (without logo/banner).

**Required Role:** Admin or Owner

**Request Body (JSON):**
```json
{
  "name_en": "English Korat Main Office",
  "name_th": "อิงลิชโคราช สำนักงานใหญ่",
  "address": "123 Updated Street, Korat",
  "phone": "044-111222",
  "active": true
}
```

---

### 9. Update Branch with Logo and Banner

**Endpoint:** `PUT /api/branches/:id/media`

**Description:** Update branch information along with logo and/or banner images. This is a multipart form endpoint that accepts both branch data and image files in a single request.

**Required Role:** Admin or Owner

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `name_en` (optional): English name
- `name_th` (optional): Thai name
- `code` (optional): Branch code
- `address` (optional): Branch address
- `phone` (optional): Phone number
- `type` (optional): Branch type
- `active` (optional): Active status ("true" or "false")
- `logo` (optional): Logo image file (JPEG, PNG, WebP)
- `banner` (optional): Banner image file (JPEG, PNG, WebP)

**Example Request (JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('name_en', 'English Korat Main Office');
formData.append('name_th', 'อิงลิชโคราช สำนักงานใหญ่');
formData.append('address', '123 Updated Street, Korat');
formData.append('phone', '044-111222');
formData.append('active', 'true');

// Optional: Add logo file
const logoFile = document.getElementById('logoInput').files[0];
if (logoFile) {
  formData.append('logo', logoFile);
}

// Optional: Add banner file
const bannerFile = document.getElementById('bannerInput').files[0];
if (bannerFile) {
  formData.append('banner', bannerFile);
}

const response = await fetch('/api/branches/1/media', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + yourToken
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

**Example Request (cURL):**
```bash
curl -X PUT "http://localhost:3000/api/branches/1/media" \
  -H "Authorization: Bearer <your_token>" \
  -F "name_en=English Korat Main Office" \
  -F "name_th=อิงลิชโคราช สำนักงานใหญ่" \
  -F "address=123 Updated Street, Korat" \
  -F "phone=044-111222" \
  -F "active=true" \
  -F "logo=@/path/to/logo.jpg" \
  -F "banner=@/path/to/banner.jpg"
```

**Example Response:**
```json
{
  "message": "Branch updated successfully",
  "branch": {
    "id": 1,
    "name_en": "English Korat Main Office",
    "name_th": "อิงลิชโคราช สำนักงานใหญ่",
    "code": "EK-MAIN",
    "address": "123 Updated Street, Korat",
    "phone": "044-111222",
    "type": "main",
    "active": true,
    "open_time": "08:00:00",
    "close_time": "20:00:00",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-03-15T14:30:00Z"
  }
}
```

**Important Notes:**
- Old logo/banner files are **automatically deleted** from S3 when new ones are uploaded
- Each branch can have only **one logo and one banner**
- Images are automatically converted to **WebP format** for optimal performance
- You can update logo and banner separately or together
- You can update branch info without touching logo/banner by simply not including those files
- File size limit: Typically 5MB per image (configurable in storage settings)

---

### 10. Delete Branch

**Endpoint:** `DELETE /api/branches/:id`

**Description:** Delete a branch (soft delete).

**Required Role:** Admin or Owner

**Example Response:**
```json
{
  "message": "Branch deleted successfully"
}
```

**Notes:**
- Cannot delete a branch that has associated users
- Logo and banner files are **not automatically deleted** from S3 when branch is deleted (this is intentional for data recovery purposes)

---

## Response Structures

### Branch Object

```typescript
interface Branch {
  id: number;
  name_en: string;
  name_th: string;
  code: string;           // Unique branch code
  address: string;
  phone: string;
  type: string;           // e.g., "main", "branch"
  active: boolean;
  open_time: string;      // HH:MM:SS format
  close_time: string;     // HH:MM:SS format
  created_at: string;     // ISO 8601 format
  updated_at: string;     // ISO 8601 format
}
```

### Logo Object

```typescript
interface BranchLogo {
  id: number;
  branch_id: number;
  logo_url: string;       // Full S3 URL
  s3_key: string;         // S3 object key
  file_size: number;      // Bytes
  mime_type: string;      // e.g., "image/webp"
  created_at: string;
  updated_at: string;
}
```

### Banner Object

```typescript
interface BranchBanner {
  id: number;
  branch_id: number;
  banner_url: string;     // Full S3 URL
  s3_key: string;         // S3 object key
  file_size: number;      // Bytes
  mime_type: string;      // e.g., "image/webp"
  created_at: string;
  updated_at: string;
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid branch ID"
}
```

**404 Not Found:**
```json
{
  "error": "Branch not found"
}
```

**409 Conflict:**
```json
{
  "error": "Branch code already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to initialize storage service"
}
```

---

## Usage Examples

### Frontend: Display Branch Selector

```javascript
// Fetch all active branches with branding
async function loadBranches() {
  try {
    const response = await fetch('/api/public/branches?active=true');
    const data = await response.json();
    
    const branchSelector = document.getElementById('branchSelector');
    data.branches.forEach(item => {
      const option = document.createElement('option');
      option.value = item.branch.id;
      option.textContent = `${item.branch.name_en} (${item.branch.code})`;
      
      // You can also access logo and banner URLs
      if (item.logo) {
        console.log('Branch logo:', item.logo.logo_url);
      }
      
      branchSelector.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load branches:', error);
  }
}
```

### Frontend: Display Branch Card with Branding

```javascript
async function displayBranchCard(branchId) {
  try {
    const response = await fetch(`/api/public/branches/${branchId}`);
    const data = await response.json();
    
    const card = document.getElementById('branchCard');
    
    // Set banner as background
    if (data.banner) {
      card.style.backgroundImage = `url(${data.banner.banner_url})`;
    }
    
    // Display logo
    if (data.logo) {
      document.getElementById('branchLogo').src = data.logo.logo_url;
    }
    
    // Display branch info
    document.getElementById('branchName').textContent = data.branch.name_en;
    document.getElementById('branchAddress').textContent = data.branch.address;
    document.getElementById('branchPhone').textContent = data.branch.phone;
    
    // Display opening hours
    document.getElementById('openingHours').textContent = 
      `${data.branch.open_time} - ${data.branch.close_time}`;
      
  } catch (error) {
    console.error('Failed to load branch details:', error);
  }
}
```

### Admin Panel: Update Branch with New Logo

```javascript
async function updateBranchWithLogo(branchId) {
  const formData = new FormData();
  
  // Get branch info from form
  formData.append('name_en', document.getElementById('nameEn').value);
  formData.append('name_th', document.getElementById('nameTh').value);
  formData.append('address', document.getElementById('address').value);
  formData.append('phone', document.getElementById('phone').value);
  formData.append('active', document.getElementById('active').checked ? 'true' : 'false');
  
  // Get logo file if selected
  const logoInput = document.getElementById('logoFile');
  if (logoInput.files.length > 0) {
    formData.append('logo', logoInput.files[0]);
  }
  
  // Get banner file if selected
  const bannerInput = document.getElementById('bannerFile');
  if (bannerInput.files.length > 0) {
    formData.append('banner', bannerInput.files[0]);
  }
  
  try {
    const response = await fetch(`/api/branches/${branchId}/media`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      alert('Branch updated successfully!');
      console.log(result);
    } else {
      const error = await response.json();
      alert('Error: ' + error.error);
    }
  } catch (error) {
    console.error('Failed to update branch:', error);
    alert('Network error occurred');
  }
}
```

---

## Best Practices

1. **Image Optimization:**
   - Upload high-quality images; the system automatically converts them to WebP
   - Recommended logo size: 500x500px or larger (square)
   - Recommended banner size: 1920x400px or larger (wide aspect ratio)

2. **Caching:**
   - S3 URLs are stable and can be cached
   - Consider implementing browser caching for logo/banner images

3. **Error Handling:**
   - Always check if `logo` or `banner` fields are `null` before accessing their properties
   - Handle 404 errors gracefully (branch not found)

4. **Performance:**
   - Use the public endpoints for listing branches on public pages
   - Implement lazy loading for branch images
   - Consider using CDN for S3 assets

5. **Security:**
   - Public endpoints are read-only
   - All write operations (create/update/delete) require authentication and proper roles
   - Validate file types on frontend before upload

---

## Summary

This API provides a complete solution for branch management with integrated branding:

- ✅ Public access to branch information for frontend display
- ✅ Combined update endpoint for branch info + logo/banner
- ✅ Automatic WebP conversion for optimal performance
- ✅ One logo and one banner per branch (old files auto-deleted)
- ✅ Comprehensive error handling
- ✅ Role-based access control

For questions or support, please contact the backend development team.
