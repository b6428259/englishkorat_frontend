# Borrowing System API Documentation

## Overview

The Borrowing System is a comprehensive library and equipment management system that allows users to borrow items (books, equipment, materials) with an admin approval workflow. The system includes features for inventory management, request processing, transaction tracking, automated notifications, audit logging, and analytics dashboards.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Core Features](#core-features)
3. [API Endpoints](#api-endpoints)
4. [Workflow](#workflow)
5. [Data Models](#data-models)
6. [Examples](#examples)
7. [Setup Guide](#setup-guide)
8. [Best Practices](#best-practices)

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Borrowing System                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Items      │  │   Requests   │  │ Transactions │      │
│  │  Management  │  │   Workflow   │  │   Tracking   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Notifications│  │   Scheduler  │  │  Audit Logs  │      │
│  │   Service    │  │   (Daily)    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Dashboard & Analytics                │       │
│  └──────────────────────────────────────────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend Framework**: Go Fiber
- **Database**: PostgreSQL/MySQL with GORM
- **File Storage**: AWS S3
- **Cache**: Redis
- **Real-time**: WebSocket
- **Scheduler**: Cron-like time-based jobs

---

## Core Features

### 1. **Item Management** (Admin)
- Create, update, delete borrowable items
- Support multiple item types: books, equipment, materials, other
- Upload cover images and PDF files (stored in S3)
- Inventory tracking (total stock, available stock)
- Multi-branch support
- Category management

### 2. **Request Workflow** (User + Admin)
- Users submit borrow requests
- Admins approve/reject requests with notes
- Stock automatically reduced upon approval
- Users can cancel pending requests
- Scheduled pickup dates with auto-cancellation after 3 days

### 3. **Transaction Management**
- Complete borrowing lifecycle tracking
- Check-in/check-out process
- Automatic late fee calculation
- Condition tracking (excellent → good → fair → poor → damaged → lost)
- Renewal system with limits
- Fee payment recording

### 4. **Automated Notifications**
- Request approved/rejected notifications
- Item due tomorrow reminders
- Overdue item alerts
- Pending pickup reminders
- Fee payment notifications
- Multi-channel: normal, popup

### 5. **Scheduler Service** (Daily)
- Automatic overdue detection and status updates
- Daily reminders for items due soon
- Pending pickup alerts
- Auto-cancellation of unclaimed approvals

### 6. **Audit Trail**
- Complete history of all stock adjustments
- Track who, when, what, why for all changes
- IP address and user agent logging
- Support filtering by entity, action, date range

### 7. **Analytics Dashboard** (Admin)
- Key metrics overview
- Borrowing trends over time
- Top borrowed items
- Top borrowers
- Category distribution
- Borrow rate analysis

---

## API Endpoints

### **Base URL**: `/api/borrowing`

### Items (Public/User Access)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/items` | Browse available items | User |
| GET | `/items/:id` | View item details | User |

**Query Parameters for `/items`:**
- `branch_id` - Filter by branch
- `item_type` - book, equipment, material, other
- `category` - Category name
- `status` - available, unavailable
- `search` - Search in title, author, description
- `available_only` - true/false

### Requests (User)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/requests` | Submit borrow request | User |
| GET | `/my-requests` | View my requests | User |
| DELETE | `/requests/:id/cancel` | Cancel pending request | User |

### Borrows (User)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/my-borrows` | My borrow history | User |
| POST | `/borrows/:id/renew` | Request renewal | User |
| GET | `/transactions/:id` | View transaction detail | User |

### Items Management (Admin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/items` | Create new item | Admin |
| PUT | `/items/:id` | Update item | Admin |
| DELETE | `/items/:id` | Delete item | Admin |
| POST | `/items/:id/upload-image` | Upload cover image | Admin |
| POST | `/items/:id/upload-pdf` | Upload PDF file | Admin |
| POST | `/items/:id/adjust-stock` | Manually adjust stock | Admin |

### Request Workflow (Admin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/requests` | View all requests | Admin |
| PUT | `/requests/:id/approve` | Approve request | Admin |
| PUT | `/requests/:id/reject` | Reject request | Admin |

### Transaction Management (Admin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/transactions` | View all transactions | Admin |
| POST | `/borrows/:id/checkin` | Check in returned item | Admin |
| POST | `/transactions/mark-overdue` | Update overdue status | Admin |
| POST | `/transactions/:id/record-payment` | Record fee payment | Admin |

---

### **Dashboard Base URL**: `/api/dashboard/borrow`

### Analytics (Admin Only)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/overview` | Key metrics overview | Admin |
| GET | `/trends` | Borrowing trends over time | Admin |
| GET | `/top-items` | Most popular items | Admin |
| GET | `/top-users` | Top borrowers | Admin |
| GET | `/categories` | Distribution by category | Admin |
| GET | `/audit-logs` | Recent audit trail | Admin |

**Query Parameters:**
- `branch_id` - Filter by branch (all endpoints)
- `days` - Number of days for trends (default: 30)
- `limit` - Limit results (default: 10, max: 100)
- `offset` - Pagination offset

---

## Workflow

### Complete Borrowing Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                     BORROWING WORKFLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. USER SUBMITS REQUEST
   ├─ POST /api/borrowing/requests
   ├─ Status: "pending"
   └─ Notification sent to admins

2. ADMIN REVIEWS REQUEST
   ├─ GET /api/borrowing/requests (view all)
   │
   ├─ APPROVE:
   │  ├─ PUT /api/borrowing/requests/:id/approve
   │  ├─ Reduce available_stock (transaction-safe)
   │  ├─ Create BorrowTransaction (status: "borrowed")
   │  ├─ Calculate due_date (based on max_borrow_days)
   │  └─ Send notification to user (approved)
   │
   └─ REJECT:
      ├─ PUT /api/borrowing/requests/:id/reject
      ├─ Require review_notes
      └─ Send notification to user (rejected)

3. USER PICKS UP ITEM
   ├─ Admin marks as checked out
   └─ Transaction becomes active

4. DURING BORROW PERIOD
   ├─ SCHEDULER (Daily 8:00 AM):
   │  ├─ Check items due tomorrow → Send reminder
   │  ├─ Check overdue items → Update status + Send alert
   │  └─ Check pending pickups → Send reminder or auto-cancel
   │
   └─ USER CAN RENEW:
      ├─ POST /api/borrowing/borrows/:id/renew
      ├─ Check renewal_count < renewable_count
      ├─ Extend due_date
      └─ Update extended_until

5. RETURN PROCESS
   ├─ POST /api/borrowing/borrows/:id/checkin
   ├─ Admin records condition_on_return
   ├─ Calculate late_fee (if overdue)
   ├─ Record damage_fee (if damaged)
   ├─ Return available_stock (unless lost)
   ├─ Update status: "returned"
   └─ Send notification if fees due

6. FEE PAYMENT (if applicable)
   └─ POST /api/borrowing/transactions/:id/record-payment
      └─ Mark fee_paid = true

┌─────────────────────────────────────────────────────────────────┐
│                     AUDIT TRAIL                                  │
└─────────────────────────────────────────────────────────────────┘

Every action is logged:
- Stock adjustments (with before/after values)
- Request approvals/rejections
- Transaction status changes
- Who, when, why, IP address, user agent
```

---

## Data Models

### BorrowableItem

```go
{
  "id": 1,
  "branch_id": 1,
  "item_type": "book",           // book, equipment, material, other
  "category": "Programming",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0132350884",
  "publisher": "Prentice Hall",
  "published_year": 2008,
  "description": "A handbook of agile software craftsmanship",
  "cover_image_url": "https://s3.../cover.webp",
  "pdf_file_url": "https://s3.../book.pdf",
  
  // Inventory
  "total_stock": 5,
  "available_stock": 3,
  
  // Borrowing Rules
  "max_borrow_days": 14,           // จำนวนวันยืมสูงสุด (null = unlimited)
  "renewable_count": 2,            // จำนวนครั้งที่ต่ออายุได้ (null = unlimited)
  "late_fee_per_day": 10.00,      // ค่าปรับต่อวัน (0 = ไม่มีค่าปรับ)
  "requires_approval": true,
  
  "status": "available",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### BorrowRequest

```go
{
  "id": 1,
  "user_id": 123,
  "item_id": 1,
  "quantity": 1,
  "status": "approved",           // pending, approved, rejected, cancelled
  
  "scheduled_pickup_date": "2025-01-20T00:00:00Z",
  "scheduled_return_date": "2025-02-03T00:00:00Z",
  
  "reviewed_by": 5,
  "reviewed_at": "2025-01-16T14:30:00Z",
  "review_notes": "Approved for academic use",
  
  "request_notes": "Needed for project",
  
  // Preloaded relationships
  "item": { /* BorrowableItem */ },
  "user": { /* User */ },
  "reviewed_by_user": { /* User */ }
}
```

### BorrowTransaction

```go
{
  "id": 1,
  "request_id": 1,
  "item_id": 1,
  "user_id": 123,
  "quantity": 1,
  "status": "borrowed",           // borrowed, returned, overdue, lost, damaged
  
  "borrowed_date": "2025-01-20T10:00:00Z",
  "due_date": "2025-02-03T23:59:59Z",
  "returned_date": null,
  "extended_until": null,
  "renewal_count": 0,
  
  "checked_out_by": 5,
  "checked_in_by": null,
  
  "condition_on_borrow": "excellent",
  "condition_on_return": null,
  
  "late_days": 0,
  "late_fee": 0.00,
  "damage_fee": 0.00,
  "total_fee": 0.00,
  "fee_paid": false,
  
  "borrow_notes": "",
  "return_notes": ""
}
```

### BorrowAuditLog

```go
{
  "id": 1,
  "item_id": 1,
  "action": "adjust_available_stock",
  "entity_type": "item",
  "entity_id": 1,
  "performed_by": 5,
  "performed_at": "2025-01-16T15:00:00Z",
  
  "old_value": "5",
  "new_value": "4",
  "change_type": "stock_decrease",
  "reason": "Approved borrow request #1",
  
  "stock_before": 5,
  "stock_after": 4,
  "stock_delta": -1,
  
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

---

## Examples

### 1. Create a New Book

**Request:**
```http
POST /api/borrowing/items
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "branch_id": 1,
  "item_type": "book",
  "category": "Programming",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0132350884",
  "publisher": "Prentice Hall",
  "published_year": 2008,
  "description": "A handbook of agile software craftsmanship",
  "total_stock": 5,
  "available_stock": 5,
  "max_borrow_days": 14,
  "renewable_count": 2,
  "late_fee_per_day": 10.00
}
```

**Note**: 
- Set `max_borrow_days` to `null` for unlimited borrowing period
- Set `renewable_count` to `null` for unlimited renewals
- Set `late_fee_per_day` to `0` for no late fees

**Examples:**
```json
// Unlimited borrowing period, no renewals, no fees
{
  "max_borrow_days": null,
  "renewable_count": 0,
  "late_fee_per_day": 0.0
}

// 7-day borrow, unlimited renewals, 5 baht/day late fee
{
  "max_borrow_days": 7,
  "renewable_count": null,
  "late_fee_per_day": 5.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": 1,
    "branch_id": 1,
    "item_type": "book",
    "title": "Clean Code",
    ...
  }
}
```

### 2. Upload Cover Image

**Request:**
```http
POST /api/borrowing/items/1/upload-image
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

image: <file>
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "image_url": "https://bucket.s3.region.amazonaws.com/borrowable-items/1/cover-image/..."
}
```

### 3. User Submits Borrow Request

**Request:**
```http
POST /api/borrowing/requests
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "item_id": 1,
  "quantity": 1,
  "scheduled_pickup_date": "2025-01-20",
  "scheduled_return_date": "2025-02-03",
  "request_notes": "Needed for my programming course project"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Borrow request created successfully",
  "data": {
    "id": 1,
    "user_id": 123,
    "item_id": 1,
    "status": "pending",
    ...
  }
}
```

### 4. Admin Approves Request

**Request:**
```http
PUT /api/borrowing/requests/1/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "review_notes": "Approved for academic use. Please return on time."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Borrow request approved successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "reviewed_by": 5,
    "reviewed_at": "2025-01-16T14:30:00Z",
    ...
  },
  "transaction_id": 1
}
```

**Notification Sent to User:**
```
Title: "Borrow Request Approved"
Message: "Your request to borrow 'Clean Code' has been approved. 
          Please pick up by Jan 20, 2025"
Type: success
Channels: ["normal"]
```

### 5. Admin Checks In Returned Item

**Request:**
```http
POST /api/borrowing/borrows/1/checkin
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "condition_on_return": "good",
  "damage_fee": 0.00,
  "return_notes": "Returned in good condition, no issues"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item checked in successfully",
  "data": {
    "id": 1,
    "status": "returned",
    "returned_date": "2025-02-03T10:30:00Z",
    "condition_on_return": "good",
    ...
  },
  "fees": {
    "late_days": 0,
    "late_fee": 0.00,
    "damage_fee": 0.00,
    "total_fee": 0.00
  }
}
```

### 6. Get Dashboard Overview

**Request:**
```http
GET /api/dashboard/borrow/overview?branch_id=1
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inventory": {
      "total_items": 45,
      "total_stock": 180,
      "available_stock": 142,
      "borrowed_stock": 38
    },
    "transactions": {
      "currently_borrowed": 32,
      "overdue_count": 3,
      "pending_requests": 5
    },
    "fees": {
      "total_collected": 1250.00,
      "outstanding_fees": 180.00
    },
    "this_month": {
      "borrowed": 68,
      "returned": 61
    }
  }
}
```

### 7. Get Borrowing Trends

**Request:**
```http
GET /api/dashboard/borrow/trends?days=7&branch_id=1
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-10",
      "borrowed": 5,
      "returned": 4,
      "new_requests": 3,
      "overdue": 1
    },
    {
      "date": "2025-01-11",
      "borrowed": 8,
      "returned": 6,
      "new_requests": 5,
      "overdue": 1
    },
    ...
  ],
  "period": {
    "start_date": "2025-01-10",
    "end_date": "2025-01-16",
    "days": 7
  }
}
```

---

## Setup Guide

### 1. Environment Variables

Add to your `.env` file:

```bash
# AWS S3 Configuration (for file uploads)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
S3_USE_ACL=true

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=englishkorat

# Redis (for notifications)
USE_REDIS_NOTIFICATIONS=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 2. Database Migration

The system will automatically create tables on first run:

- `borrowable_items`
- `borrow_requests`
- `borrow_transactions`
- `borrow_audit_logs`

### 3. S3 Bucket Setup

Create S3 bucket with structure:
```
your-bucket/
  └── borrowable-items/
      ├── {item_id}/
      │   ├── cover-image/
      │   │   └── {year}/{month}/{day}/{uuid}.webp
      │   └── pdf/
      │       └── {year}/{month}/{day}/{uuid}.pdf
```

Set bucket policy for public read (if using ACL):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/*"
    }
  ]
}
```

### 4. Start the Application

```bash
# Build
go build -o englishkorat.exe .

# Run
./englishkorat.exe
```

The borrowing scheduler will start automatically and run daily checks at 8:00 AM.

### 5. Test the System

1. **Create an admin user** (via user management API)
2. **Create a borrowable item**
3. **Upload cover image** (optional)
4. **Create a user account** (for testing borrowing)
5. **Submit a borrow request** (as user)
6. **Approve the request** (as admin)
7. **Check in the item** (as admin)

---

## Best Practices

### For Administrators

#### Item Management
1. **Always set realistic stock levels**
   - total_stock = physical items you own
   - available_stock ≤ total_stock
   - System prevents available > total

2. **Configure borrowing rules carefully**
   - max_borrow_days: 7-30 days typical, or `null` for unlimited
   - renewable_count: 1-3 times typical, or `null` for unlimited renewals
   - late_fee_per_day: reasonable amount, or `0` for no late fees

3. **Use categories consistently**
   - Create a standard category list
   - Use same naming convention
   - Examples: "Programming", "Fiction", "Lab Equipment"

#### Request Processing
1. **Review requests promptly**
   - Check within 24 hours
   - Provide clear review notes
   - Consider user history

2. **Approval criteria**
   - Verify student status
   - Check for existing overdue items
   - Ensure stock availability

#### Check-in Process
1. **Inspect item condition carefully**
   - Use condition scale consistently:
     - excellent: Like new
     - good: Normal wear
     - fair: Noticeable wear
     - poor: Significant damage
     - damaged: Unusable damage
     - lost: Item missing

2. **Calculate fees fairly**
   - System auto-calculates late fees
   - Add damage fees based on condition
   - Document fees in return_notes

#### Stock Adjustments
1. **Always provide clear reason**
   - "Added new batch from supplier"
   - "Found damaged during inventory check"
   - "Lost item - reducing stock"

2. **Audit logs are permanent**
   - Cannot be deleted
   - Include admin username
   - Track IP and timestamp

### For Users

#### Submitting Requests
1. **Check availability first**
   - Use search/filter to find items
   - Verify available_stock > 0
   - Read item description carefully

2. **Plan pickup dates realistically**
   - Admins may approve within 1-2 days
   - Pick up within scheduled date
   - System auto-cancels after 3 days

3. **Provide clear request notes**
   - State your purpose
   - Mention any special requirements
   - Be professional

#### During Borrowing
1. **Return on time**
   - Check due_date in transaction
   - Set your own reminders
   - System sends reminders 1 day before

2. **Use renewal wisely**
   - Only if genuinely needed
   - Cannot renew if overdue
   - Limited by renewable_count

3. **Take care of items**
   - Note condition_on_borrow
   - Report damage immediately
   - Return in same/better condition

#### Avoiding Fees
1. **Late fees**
   - Return before due_date
   - Renew in advance if needed
   - late_fee = days_late × late_fee_per_day

2. **Damage fees**
   - Handle items carefully
   - Store properly
   - Admin determines damage_fee

### For Developers

#### Extending the System

1. **Adding new item types**
```go
// In models.go BorrowableItem
// Update enum constraint:
ItemType string `gorm:"type:enum('book','equipment','material','other','your_new_type')"`

// No database migration needed - GORM handles it
```

2. **Custom validation**
```go
// Add to CreateItem controller
if req.ItemType == "book" && req.ISBN == "" {
    return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
        "error": "ISBN required for books",
    })
}
```

3. **Additional notifications**
```go
// In controllers
notifService := notifsvc.NewService()
notifMsg := notifsvc.QueuedWithData(
    "Your Title",
    "หัวข้อภาษาไทย",
    "Your message",
    "ข้อความภาษาไทย",
    "info",  // info, success, warning, error
    fiber.Map{
        "type": "your_custom_type",
        "data": "your_data",
    },
    "normal", "popup",  // channels
)
notifService.EnqueueOrCreate([]uint{userID}, notifMsg)
```

4. **Custom dashboard widgets**
```go
// In dashboard_borrow.go
func (bdc *BorrowDashboardController) GetYourCustomMetric(c *fiber.Ctx) error {
    // Your logic here
    var result YourStruct
    database.DB.Model(&models.BorrowTransaction{}).
        // Your query
        Scan(&result)
    
    return c.JSON(fiber.Map{
        "success": true,
        "data": result,
    })
}

// Add route in routes.go
dashboard.Get("/your-metric", dashboardController.GetYourCustomMetric)
```

#### Testing

1. **Unit Tests**
```go
// Test stock reduction in approval
func TestApproveBorrowRequest(t *testing.T) {
    // Setup test database
    // Create test item with stock = 5
    // Create test request
    // Call ApproveBorrowRequest
    // Assert: available_stock = 4
    // Assert: transaction created
}
```

2. **Integration Tests**
```go
// Test complete workflow
func TestCompleteBorrowingWorkflow(t *testing.T) {
    // 1. Create item
    // 2. Submit request
    // 3. Approve request
    // 4. Check in item
    // Assert each step
}
```

3. **Load Testing**
```bash
# Using Apache Bench
ab -n 1000 -c 10 -H "Authorization: Bearer <token>" \
   http://localhost:3000/api/borrowing/items
```

---

## Troubleshooting

### Common Issues

#### 1. Stock Mismatch
**Problem**: Available stock doesn't match actual borrowed items

**Solution**:
```sql
-- Check discrepancies
SELECT 
    item_id,
    title,
    available_stock,
    total_stock,
    (SELECT COUNT(*) FROM borrow_transactions 
     WHERE item_id = borrowable_items.id 
     AND status IN ('borrowed', 'overdue')) as active_borrows
FROM borrowable_items
WHERE available_stock != (total_stock - 
    (SELECT COUNT(*) FROM borrow_transactions 
     WHERE item_id = borrowable_items.id 
     AND status IN ('borrowed', 'overdue')));

-- Fix manually via adjust-stock API with reason
```

#### 2. Scheduler Not Running
**Problem**: Overdue items not being detected

**Check**:
```bash
# Look for scheduler logs
grep "Borrowing Scheduler" logs/app.log

# Expected output:
# [Borrowing Scheduler] Running daily checks...
# [Borrowing Scheduler] Marked X transactions as overdue
```

**Solution**:
- Verify scheduler started in main.go
- Check database connectivity
- Restart application

#### 3. Notifications Not Sending
**Problem**: Users not receiving notifications

**Check**:
1. Redis connection (if USE_REDIS_NOTIFICATIONS=true)
2. Notification queue: `redis-cli LLEN notifications:queue`
3. WebSocket connection
4. User notification preferences

**Solution**:
- Check notification service logs
- Verify WebSocket hub is running
- Test with `/api/public/notifications/test` endpoint (dev only)

---

## API Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* result */ }
}
```

### Error Response
```json
{
  "error": "Detailed error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* items */ ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

---

## WebSocket Notifications

The borrowing system sends real-time notifications via WebSocket to users. Notifications are sent through two channels:
- **normal**: Standard notification in notification list
- **popup**: Real-time popup notification (appears immediately) - **Used only for urgent reminders: "Due Tomorrow" and "Overdue" items**

### Notification Structure

All notifications follow this structure:

```json
{
  "id": 123,
  "user_id": 456,
  "title": "English Title",
  "title_th": "หัวข้อภาษาไทย",
  "message": "English message text",
  "message_th": "ข้อความภาษาไทย",
  "type": "success",
  "channels": ["normal", "popup"],
  "data": {
    "type": "notification_type",
    // ... additional data fields
  },
  "is_read": false,
  "created_at": "2025-01-16T14:30:00Z"
}
```

### Notification Types

#### 1. Borrow Request Approved

**When**: Admin approves a borrow request

**WebSocket Payload**:
```json
{
  "title": "Borrow Request Approved",
  "title_th": "คำขอยืมของได้รับการอนุมัติ",
  "message": "Your request to borrow 'Clean Code' has been approved. Please pick up by Jan 20, 2025",
  "message_th": "คำขอยืม 'Clean Code' ของคุณได้รับการอนุมัติแล้ว กรุณามารับภายใน 20 ม.ค. 2025",
  "type": "success",
  "channels": ["normal"],
  "data": {
    "type": "borrow_request_approved",
    "request_id": 1,
    "item_id": 5,
    "transaction_id": 10
  }
}
```

**Frontend Usage**:
```javascript
// Navigate to transaction detail
router.push(`/transactions/${notification.data.transaction_id}`);
```

---

#### 2. Borrow Request Rejected

**When**: Admin rejects a borrow request

**WebSocket Payload**:
```json
{
  "title": "Borrow Request Rejected",
  "title_th": "คำขอยืมถูกปฏิเสธ",
  "message": "Your request to borrow 'Clean Code' has been rejected. Reason: Item currently unavailable",
  "message_th": "คำขอยืม 'Clean Code' ของคุณถูกปฏิเสธ เหตุผล: รายการไม่พร้อมใช้งาน",
  "type": "error",
  "channels": ["normal"],
  "data": {
    "type": "borrow_request_rejected",
    "request_id": 1,
    "item_id": 5,
    "reason": "Item currently unavailable"
  }
}
```

---

#### 3. Item Due Tomorrow

**When**: Daily scheduler detects item due tomorrow (sent at 8:00 AM)

**WebSocket Payload**:
```json
{
  "title": "Item Due Tomorrow",
  "title_th": "รายการครบกำหนดพรุ่งนี้",
  "message": "Your borrowed item 'Clean Code' is due tomorrow (Feb 3, 2025). Please return on time.",
  "message_th": "รายการ 'Clean Code' ที่คุณยืมจะครบกำหนดพรุ่งนี้ (3 ก.พ. 2025) กรุณาคืนตามกำหนด",
  "type": "info",
  "channels": ["normal", "popup"],
  "data": {
    "type": "borrow_due_soon",
    "transaction_id": 10,
    "item_id": 5,
    "due_date": "2025-02-03T23:59:59Z"
  }
}
```

**Note**: Due-soon reminders are sent once per day only (popup appears immediately for urgency)

---

#### 4. Item Overdue

**When**: Daily scheduler detects overdue items (sent at 8:00 AM)

**WebSocket Payload**:
```json
{
  "title": "Item Overdue",
  "title_th": "รายการเกินกำหนด",
  "message": "Your borrowed item 'Clean Code' is overdue by 3 days. Late fee: 30.00 baht. Please return immediately.",
  "message_th": "รายการ 'Clean Code' เกินกำหนดแล้ว 3 วัน ค่าปรับ: 30.00 บาท กรุณาคืนโดยด่วน",
  "type": "error",
  "channels": ["normal", "popup"],
  "data": {
    "type": "borrow_overdue",
    "transaction_id": 10,
    "item_id": 5,
    "days_overdue": 3,
    "late_fee": 30.00
  }
}
```

---

#### 5. Fees Due (Check-in)

**When**: Admin checks in returned item with late/damage fees

**WebSocket Payload**:
```json
{
  "title": "Fees Due for Returned Item",
  "title_th": "ค่าธรรมเนียมสำหรับรายการที่คืน",
  "message": "Your return of 'Clean Code' has been processed. Fees due: 50.00 baht (Late: 30.00, Damage: 20.00). Please pay at the counter.",
  "message_th": "การคืน 'Clean Code' ของคุณดำเนินการแล้ว ค่าธรรมเนียม: 50.00 บาท (ค่าปรับ: 30.00, ค่าเสียหาย: 20.00) กรุณาชำระที่เคาน์เตอร์",
  "type": "warning",
  "channels": ["normal"],
  "data": {
    "type": "borrow_fees_due",
    "transaction_id": 10,
    "item_id": 5,
    "total_fee": 50.00,
    "late_fee": 30.00,
    "damage_fee": 20.00,
    "late_days": 3
  }
}
```

---

#### 6. Pending Pickup Reminder

**When**: Daily scheduler detects approved requests not picked up (sent at 8:00 AM)

**WebSocket Payload**:
```json
{
  "title": "Pending Pickup Reminder",
  "title_th": "แจ้งเตือนรายการรอรับ",
  "message": "You have an approved request for 'Clean Code' waiting for pickup. Pickup deadline: Jan 23, 2025 (2 days remaining). Request will be auto-cancelled if not picked up in time.",
  "message_th": "คุณมีคำขอยืม 'Clean Code' ที่อนุมัติแล้วรอรับ กำหนดรับ: 23 ม.ค. 2025 (เหลือ 2 วัน) คำขอจะถูกยกเลิกอัตโนมัติหากไม่มารับตามกำหนด",
  "type": "info",
  "channels": ["normal"],
  "data": {
    "type": "pending_pickup_reminder",
    "request_id": 1,
    "item_id": 5,
    "days_past_pickup": 1,
    "deadline": "2025-01-23T00:00:00Z"
  }
}
```

**Note**: Auto-cancelled after 3 days past scheduled pickup date

---

### Connecting to WebSocket

#### Frontend Setup

```javascript
// WebSocket connection
const ws = new WebSocket('ws://your-domain.com/ws');

ws.onopen = () => {
  console.log('WebSocket connected');
  // Send authentication token
  ws.send(JSON.stringify({
    type: 'auth',
    token: localStorage.getItem('jwt_token')
  }));
};

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  
  // Check if it's a borrowing system notification
  if (notification.data?.type?.startsWith('borrow_')) {
    handleBorrowingNotification(notification);
  }
  
  // Show popup for popup channel
  if (notification.channels.includes('popup')) {
    showPopupNotification(notification);
  }
  
  // Add to notification list for normal channel
  if (notification.channels.includes('normal')) {
    addToNotificationList(notification);
  }
};

function handleBorrowingNotification(notification) {
  const { type, ...data } = notification.data;
  
  switch(type) {
    case 'borrow_request_approved':
      // Navigate to transaction page
      showNotification({
        title: notification.title,
        message: notification.message,
        type: 'success',
        action: () => router.push(`/transactions/${data.transaction_id}`)
      });
      break;
      
    case 'borrow_overdue':
      // Show urgent alert
      showUrgentAlert({
        title: notification.title,
        message: notification.message,
        daysOverdue: data.days_overdue,
        lateFee: data.late_fee
      });
      break;
      
    case 'borrow_fees_due':
      // Show payment prompt
      showPaymentPrompt({
        transactionId: data.transaction_id,
        totalFee: data.total_fee,
        breakdown: {
          late: data.late_fee,
          damage: data.damage_fee
        }
      });
      break;
      
    // ... handle other types
  }
}
```

---

### Testing WebSocket Notifications

#### Using Browser Console

```javascript
// 1. Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/ws');

// 2. Authenticate
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your_jwt_token_here'
  }));
};

// 3. Listen for messages
ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};

// 4. Trigger notification by approving a request (as admin)
// Use API: PUT /api/borrowing/requests/{id}/approve
```

---

### Notification Deduplication

The system prevents duplicate notifications using these strategies:

1. **Due-soon reminders**: Checked once per day, not sent if already sent today
2. **Overdue alerts**: Only sent when status changes from "borrowed" to "overdue"
3. **Pending pickup**: Sent daily until picked up or auto-cancelled (max 3 days)

### Notification Preferences (Future Enhancement)

Users may customize notification preferences in the future:
- Disable popup for certain types
- Set quiet hours
- Choose notification channels
- Email integration

---

## Security Considerations

1. **Authentication**
   - All endpoints require JWT token
   - Admin routes require role check
   - Token stored in Authorization header

2. **Authorization**
   - Users can only view/cancel their own requests
   - Admins have full access
   - Branch isolation supported

3. **Data Validation**
   - Input validation on all endpoints
   - Stock quantity checks
   - Date range validation

4. **Audit Trail**
   - All changes logged with user info
   - IP address tracking
   - Cannot modify audit logs

5. **File Upload**
   - Images converted to WebP
   - File size limits enforced
   - S3 bucket permissions configured

---

## Performance Optimization

1. **Database**
   - Indexes on foreign keys
   - Indexes on frequently queried fields
   - Preload relationships to avoid N+1

2. **Caching**
   - Redis for notification queue
   - Consider caching dashboard metrics

3. **File Storage**
   - Images auto-converted to WebP
   - CDN distribution recommended
   - Lazy loading for lists

---

## Future Enhancements

Potential features to consider:

1. **Digital Books**
   - PDF reader integration
   - Online reading permissions
   - Download limits

2. **Reservation System**
   - Reserve items that are currently borrowed
   - Queue management
   - Auto-notification when available

3. **Rating & Reviews**
   - Users rate borrowed items
   - Reviews visible to other users
   - Popular items tracking

4. **Mobile App**
   - Scan ISBN barcode
   - Push notifications
   - Quick check-in/out

5. **Integration**
   - Google Books API for metadata
   - Library management systems
   - Student information systems

---

## Support

For issues or questions:
- Check existing documentation
- Review audit logs for debugging
- Contact system administrator

---

## Changelog

### Version 1.1.0 - October 14, 2025

**New Features:**
- **Unlimited Borrowing Period**: Set `max_borrow_days` to `null` for items that can be borrowed indefinitely
- **Unlimited Renewals**: Set `renewable_count` to `null` for items with no renewal limits
- **Zero Late Fees**: Set `late_fee_per_day` to `0` for items with no late fees

**Changes:**
- `max_borrow_days` now accepts `null` (unlimited) in addition to positive integers
- `renewable_count` now accepts `null` (unlimited) in addition to positive integers
- `late_fee_per_day` can be set to `0` for no late fees (already supported, now documented)
- Renewal endpoint now returns `"unlimited"` string when no renewal limit
- WebSocket notification documentation added with all 6 notification types

**Migration Notes:**
- Existing items with `max_borrow_days` or `renewable_count` will retain their numeric values
- To enable unlimited for existing items, update them with `null` values
- No database migration required - GORM handles nullable integer fields automatically

**Examples:**
```json
// Reference book - unlimited borrow, no renewals, no fees
{
  "title": "Dictionary",
  "max_borrow_days": null,
  "renewable_count": 0,
  "late_fee_per_day": 0
}

// Equipment - 7 days, unlimited renewals, 10 baht/day late fee
{
  "title": "Laptop",
  "max_borrow_days": 7,
  "renewable_count": null,
  "late_fee_per_day": 10.0
}

// Regular book - 14 days, 2 renewals, 5 baht/day late fee
{
  "title": "Novel",
  "max_borrow_days": 14,
  "renewable_count": 2,
  "late_fee_per_day": 5.0
}
```

---

**Version**: 1.1.0  
**Last Updated**: October 14, 2025  
**Author**: English Korat Development Team
