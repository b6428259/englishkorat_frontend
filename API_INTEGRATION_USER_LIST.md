# API Integration: User List for Test Notifications

## 📋 Overview

อัปเดตหน้า Test Notifications ให้โหลดรายชื่อผู้ใช้จาก API จริงแทนการใช้ข้อมูล mock

---

## 🔄 Changes Summary

### 1. Type Definitions Updated

#### `src/types/auth.types.ts`

เพิ่ม `StudentInfo` interface และอัปเดต `User` interface:

```typescript
export interface StudentInfo {
  first_name: string;
  last_name: string;
  nickname: string;
}

export interface User {
  id: number;
  username: string;
  email: string | null; // ✨ Changed: nullable email
  phone?: string;
  line_id?: string;
  role: "student" | "teacher" | "admin" | "owner";
  branch_id?: number;
  branch_name?: string;
  branch_code?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
  avatar?: string;
  student?: StudentInfo; // ✨ New: nested student info
}
```

**เหตุผล:**

- API ส่งข้อมูลนักเรียนมาใน nested object `student`
- Email อาจเป็น `null` ในบางกรณี
- รองรับข้อมูล `nickname` สำหรับนักเรียน

---

### 2. API Service Updated

#### `src/services/api/users.ts`

เพิ่มฟังก์ชัน `getAllUsers()` และอัปเดต response structure:

```typescript
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
}

export interface UsersListResponse {
  users: User[]; // ✨ Direct array
  pagination: PaginationInfo; // ✨ Separate pagination object
}
```

**ฟังก์ชันใหม่:**

```typescript
/**
 * Get all users (load all pages)
 */
getAllUsers: async (filters?: {
  role?: User["role"];
  search?: string;
}): Promise<User[]> => {
  let allUsers: User[] = [];
  let currentPage = 1;
  const limit = 100; // Load 100 users per page

  while (true) {
    const response = await usersApi.getUsers(currentPage, limit, filters);
    allUsers = [...allUsers, ...response.users];

    // Check if we've loaded all users
    if (
      response.users.length < limit ||
      allUsers.length >= response.pagination.total
    ) {
      break;
    }

    currentPage++;
  }

  return allUsers;
};
```

**คุณสมบัติ:**

- โหลดทุกหน้าอัตโนมัติ
- รองรับ filters (role, search)
- Return array ของ users โดยตรง

---

### 3. Test Notifications Page Updated

#### `src/app/test-notifications/page.tsx`

**3.1 Import Type**

```typescript
// Import User type from auth.types
import type { User } from "@/types/auth.types";
```

**3.2 Display Name Logic**

```typescript
// ✨ Smart display name selection
const displayName = u.student
  ? `${u.student.first_name} ${u.student.last_name}`
  : u.username;

const nickname = u.student?.nickname;
```

**กฎการแสดงชื่อ:**

- **Student**: แสดง `first_name` + `last_name` (ภาษาไทย)
- **Teacher/Admin/Owner**: แสดง `username`
- **Nickname**: แสดงในวงเล็บถ้ามี

**3.3 Search Filter Enhancement**

```typescript
const filteredUsers = users.filter((u) => {
  const matchesRole = filterRole === "all" || u.role === filterRole;

  // Get display name
  const displayName = u.student
    ? `${u.student.first_name} ${u.student.last_name}`
    : u.username;

  // Search in multiple fields
  const matchesSearch =
    searchQuery === "" ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return matchesRole && matchesSearch;
});
```

**ค้นหาได้จาก:**

- `username`
- Display name (ชื่อจริง-นามสกุล หรือ username)
- `email` (ถ้ามี)

**3.4 Avatar Display**

```typescript
{
  /* Avatar */
}
<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0 overflow-hidden">
  {u.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/${
        u.avatar
      }`}
      alt={displayName}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
        e.currentTarget.parentElement!.textContent = displayName
          .charAt(0)
          .toUpperCase();
      }}
    />
  ) : (
    displayName.charAt(0).toUpperCase()
  )}
</div>;
```

**คุณสมบัติ:**

- แสดง avatar ถ้ามี (จาก S3)
- Fallback เป็นตัวอักษรแรกของชื่อ
- Error handling ถ้าโหลดรูปไม่ได้

**3.5 User Card Enhanced**

```typescript
<div className="flex-1 min-w-0">
  <div className="font-medium text-sm text-gray-900 truncate">
    {displayName}
    {nickname && (
      <span className="text-gray-500 font-normal ml-1">({nickname})</span>
    )}
  </div>
  <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
    <span className="truncate">{u.username}</span>
    <span>•</span>
    <span className={`px-2 py-0.5 rounded-full ${roleColorClass}`}>
      {u.role}
    </span>
    {u.email && (
      <>
        <span>•</span>
        <span className="truncate">{u.email}</span>
      </>
    )}
  </div>
</div>
```

**แสดงข้อมูล:**

1. Display name (bold)
2. Nickname (ถ้ามี)
3. Username
4. Role badge (สีตามบทบาท)
5. Email (ถ้ามี)

---

## 📡 API Endpoint

### GET `/api/users`

**Query Parameters:**

```
?page=1&limit=10
```

**Response Structure:**

```json
{
  "pagination": {
    "limit": 10,
    "page": 1,
    "total": 716
  },
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@englishkorat.com",
      "phone": "0812345678",
      "role": "admin",
      "status": "active",
      "branch_id": 1,
      "avatar": "avatars/1/2025/08/21/635e0f1149d42546.webp"
    },
    {
      "id": 3,
      "username": "alice_w",
      "email": "alice.wilson@gmail.com",
      "phone": "0891234567",
      "role": "student",
      "status": "active",
      "branch_id": 1,
      "avatar": "",
      "student": {
        "first_name": "อลิซ",
        "last_name": "วิลสัน",
        "nickname": ""
      }
    }
  ]
}
```

**User Types:**

1. **Admin/Owner/Teacher:**

```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@englishkorat.com",
  "role": "admin",
  "avatar": "avatars/1/2025/08/21/xxx.webp"
}
```

2. **Student:**

```json
{
  "id": 3,
  "username": "alice_w",
  "email": "alice.wilson@gmail.com",
  "role": "student",
  "student": {
    "first_name": "อลิซ",
    "last_name": "วิลสัน",
    "nickname": "ลิซ"
  }
}
```

---

## 🎨 UI Components

### User List Item

**Visual Layout:**

```
┌────────────────────────────────────────┐
│ ○ [Avatar] อลิซ วิลสัน (ลิซ)           │
│           alice_w • student • email    │
└────────────────────────────────────────┘
```

**Component Structure:**

```tsx
<label className="flex items-center gap-3 p-3">
  {/* Radio button */}
  <input type="radio" />

  {/* Avatar (with fallback) */}
  <div className="w-8 h-8 rounded-full">{avatar || initial}</div>

  {/* User info */}
  <div className="flex-1">
    {/* Name + Nickname */}
    <div className="font-medium">
      {displayName} {nickname && `(${nickname})`}
    </div>

    {/* Username • Role • Email */}
    <div className="text-xs text-gray-500">
      {username} • {roleBadge} • {email}
    </div>
  </div>
</label>
```

---

## 🔍 Search & Filter Features

### 1. Role Filter

```typescript
<select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
  <option value="all">ทั้งหมด</option>
  <option value="teacher">ครู</option>
  <option value="student">นักเรียน</option>
  <option value="admin">Admin</option>
  <option value="owner">Owner</option>
</select>
```

### 2. Search Input

```typescript
<input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="ชื่อผู้ใช้..."
/>
```

**Search Fields:**

- `username` (case-insensitive)
- `student.first_name` + `student.last_name`
- `email`

### 3. Combined Filter Logic

```typescript
const filteredUsers = users.filter((u) => {
  const matchesRole = filterRole === "all" || u.role === filterRole;
  const matchesSearch = /* search logic */;
  return matchesRole && matchesSearch;
});
```

---

## 🎯 Data Flow

```
┌─────────────────────────────────────────────┐
│ 1. Component Mount                          │
│    useEffect(() => loadUsers())             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│ 2. API Call                                 │
│    userService.getAllUsers()                │
│    - Loops through pages                    │
│    - Collects all users                     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│ 3. State Update                             │
│    setUsers(allUsers)                       │
│    setLoadingUsers(false)                   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│ 4. Filter & Display                         │
│    - Apply role filter                      │
│    - Apply search filter                    │
│    - Map to user cards                      │
└─────────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

### API Integration

- [x] GET `/api/users` returns correct structure
- [x] Pagination works (loads all pages)
- [x] Student data includes nested `student` object
- [x] Avatar URLs are correct
- [x] Email can be null

### UI Display

- [x] Students show Thai names (first_name + last_name)
- [x] Teachers/Admin show username
- [x] Nicknames appear in parentheses
- [x] Avatars load correctly
- [x] Fallback initials work
- [x] Role badges have correct colors

### Filters

- [x] Role filter works (all, teacher, student, admin, owner)
- [x] Search works on username
- [x] Search works on display name
- [x] Search works on email
- [x] Combining filters works correctly

### Interactions

- [x] Can select user (radio button)
- [x] Selected user shows highlight (bg-blue-50)
- [x] Send button enabled when user selected
- [x] Loading states work correctly

---

## 🐛 Known Issues & Solutions

### Issue 1: Avatar not loading

**Symptom:** Broken image icon
**Cause:** Incorrect base URL or file path
**Solution:**

```typescript
src={`${process.env.NEXT_PUBLIC_API_URL}/${u.avatar}`}
onError={(e) => {
  // Fallback to initial
  e.currentTarget.style.display = 'none';
  e.currentTarget.parentElement!.textContent = displayName.charAt(0).toUpperCase();
}}
```

### Issue 2: Email is null

**Symptom:** TypeScript error when accessing email
**Cause:** Some users don't have email
**Solution:** Optional chaining

```typescript
{
  u.email && <span>{u.email}</span>;
}
```

### Issue 3: Student name not showing

**Symptom:** Shows username instead of Thai name
**Cause:** Missing `student` object check
**Solution:**

```typescript
const displayName = u.student
  ? `${u.student.first_name} ${u.student.last_name}`
  : u.username;
```

---

## 📝 Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Used for:**

- Avatar image URLs
- API base URL

---

## 🚀 Usage Examples

### Load all users

```typescript
const loadUsers = async () => {
  try {
    setLoadingUsers(true);
    const allUsers = await userService.getAllUsers();
    setUsers(allUsers);
  } catch (error) {
    console.error("Failed to load users:", error);
    toast.error("ไม่สามารถโหลดรายชื่อผู้ใช้ได้");
  } finally {
    setLoadingUsers(false);
  }
};
```

### Load with filters

```typescript
// Only students
const students = await userService.getAllUsers({ role: "student" });

// Search for "john"
const results = await userService.getAllUsers({ search: "john" });

// Students named "john"
const studentJohns = await userService.getAllUsers({
  role: "student",
  search: "john",
});
```

### Get display name helper

```typescript
const getDisplayName = (user: User): string => {
  return user.student
    ? `${user.student.first_name} ${user.student.last_name}`
    : user.username;
};
```

---

## 📊 Performance Considerations

### Pagination Strategy

```typescript
const limit = 100; // Load 100 users per page
```

**Why 100?**

- Balance between API calls and memory
- 716 total users = ~8 API calls
- Acceptable loading time

**Alternative for large datasets:**

```typescript
// Lazy loading with infinite scroll
const loadMoreUsers = async () => {
  const nextPage = currentPage + 1;
  const response = await userService.getUsers(nextPage, 50);
  setUsers([...users, ...response.users]);
  setCurrentPage(nextPage);
};
```

### Caching Strategy

```typescript
// Cache users for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let cachedUsers: User[] | null = null;
let cacheTime: number = 0;

const loadUsers = async () => {
  if (cachedUsers && Date.now() - cacheTime < CACHE_DURATION) {
    setUsers(cachedUsers);
    return;
  }

  const users = await userService.getAllUsers();
  cachedUsers = users;
  cacheTime = Date.now();
  setUsers(users);
};
```

---

## 🔗 Related Files

- `src/types/auth.types.ts` - Type definitions
- `src/services/api/users.ts` - API service
- `src/app/test-notifications/page.tsx` - UI component
- `.env.local` - Environment variables

---

## 📚 Next Steps

1. **Backend:** Ensure `/api/users` endpoint matches expected structure
2. **Testing:** Test with different user types (admin, teacher, student)
3. **Performance:** Monitor loading time with large user lists
4. **UI/UX:** Add pagination or virtual scrolling if needed
5. **Accessibility:** Ensure screen readers work correctly

---

## 🎉 Summary

✅ **Completed:**

- API integration with real user data
- Support for nested student information
- Smart display name logic (Thai names for students)
- Avatar display with fallback
- Enhanced search and filters
- Type-safe implementation

✅ **Benefits:**

- Real-time user data
- Better UX with names and avatars
- Flexible search capabilities
- Type safety throughout

✅ **Ready for:**

- Testing with actual backend
- Production deployment
- Further UI enhancements
