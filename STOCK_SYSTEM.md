# Borrowing & Requisition System Documentation

> **📖 Complete Reference**: This document serves as both **user guide** and **technical API documentation** > **👥 For End Users**: See [Quick Reference Guide](#-quick-reference-guide-for-end-users) > **👨‍💻 For Developers**: Full API documentation with endpoints, models, and workflows included below

---

## Overview

The **Borrowing & Requisition System** is a comprehensive inventory management system that supports two main workflows:

1. **Borrowing System** - For items that must be returned (books, equipment, laptops) with due dates and return tracking
2. **Requisition System** - For permanent withdrawal of consumable items (pens, paper, chalk, stationery) that don't require return

Both systems include features for inventory management, request processing, transaction tracking, automated notifications, audit logging, and analytics dashboards.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [System Architecture](#system-architecture)
3. [Core Features](#core-features)
4. [UX/UI Design](#uxui-design) ⭐ NEW
5. [API Endpoints](#api-endpoints)
6. [Workflow](#workflow)
7. [Data Models](#data-models)
8. [Examples](#examples)
9. [Setup Guide](#setup-guide)
10. [Best Practices](#best-practices)

---

## System Overview

### Two Types of Inventory Management

#### 🔄 Borrowing System (Returnable Items)

For items that **must be returned** to the inventory:

- **Books** - Reference books, textbooks, novels
- **Equipment** - Laptops, projectors, cameras
- **Lab Materials** - Scientific instruments, teaching aids
- **Features**: Due dates, late fees, return tracking, renewal options

#### 📦 Requisition System (Consumable Items)

For items that are **permanently withdrawn** (no return required):

- **Stationery** - Pens, pencils, erasers, rulers
- **Office Supplies** - Paper, notebooks, folders
- **Teaching Materials** - Chalk, markers, tape
- **Features**: Permanent stock reduction, quantity tracking, no due dates

### Quick Comparison

| Feature             | Borrowing System   | Requisition System   |
| ------------------- | ------------------ | -------------------- |
| **Purpose**         | Temporary loan     | Permanent withdrawal |
| **Return Required** | ✅ Yes             | ❌ No                |
| **Due Date**        | ✅ Yes             | ❌ No                |
| **Late Fees**       | ✅ Yes             | ❌ No                |
| **Renewals**        | ✅ Yes             | ❌ No                |
| **Stock Tracking**  | Borrowed/Available | Consumed/Available   |
| **Typical Items**   | Books, Equipment   | Pens, Paper, Chalk   |
| **Approval Flow**   | Same               | Same                 |

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│              Borrowing & Requisition System                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Items      │  │   Requests   │  │ Transactions │          │
│  │  Management  │  │   Workflow   │  │   Tracking   │          │
│  │              │  │              │  │              │          │
│  │ • Borrowable │  │ • Approval   │  │ • Borrowing  │          │
│  │ • Requisition│  │ • Rejection  │  │ • Requisition│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Notifications│  │   Scheduler  │  │  Audit Logs  │          │
│  │   Service    │  │   (Daily)    │  │   Service    │          │
│  │              │  │              │  │              │          │
│  │ • Approval   │  │ • Due Dates  │  │ • Stock      │          │
│  │ • Reminders  │  │ • Overdue    │  │ • Actions    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │              Dashboard & Analytics                  │         │
│  │  • Borrowing Trends    • Requisition History       │         │
│  │  • Stock Levels        • Top Items                 │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend Framework**: Go Fiber
- **Database**: PostgreSQL/MySQL with GORM
- **File Storage**: AWS S3
- **Cache**: Redis
- **Real-time**: WebSocket
- **Scheduler**: Cron-like time-based jobs

### Key Concepts

**🔄 Borrowing (ยืม-คืน)**

- Items must be returned
- Temporary stock reduction
- Has due dates and late fees
- Can renew if allowed
- Condition tracking on return
- Examples: Books, laptops, equipment

**📦 Requisition (เบิกใช้แบบถาวร)**

- Items are permanently withdrawn (no return)
- Permanent stock reduction
- No due dates or late fees
- No renewal needed
- Purpose/usage tracking
- Examples: Pens, paper, chalk, stationery

---

## Core Features

### 1. **Item Management** (Admin)

- Create, update, delete items
- **Two modes**: Borrowable (returnable) or Requisition (permanent withdrawal)
- Support multiple item types: books, equipment, materials, stationery, office supplies
- Upload cover images and PDF files (stored in S3)
- Inventory tracking (total stock, available stock, consumed stock)
- Multi-branch support
- Category management

### 2. **Request Workflow** (User + Admin)

- Users submit requests (borrow or requisition)
- Admins approve/reject requests with notes
- Stock automatically adjusted upon approval:
  - **Borrowing**: Available stock reduced (can be returned)
  - **Requisition**: Total stock reduced permanently (no return)
- Users can cancel pending requests
- Scheduled pickup dates with auto-cancellation after 3 days

### 3. **Transaction Management**

#### For Borrowable Items:

- Complete borrowing lifecycle tracking
- Check-in/check-out process
- Automatic late fee calculation
- Condition tracking (excellent → good → fair → poor → damaged → lost)
- Renewal system with limits
- Fee payment recording

#### For Requisition Items:

- Permanent withdrawal tracking
- Quantity consumed recording
- No return process required
- Purpose/usage notes
- Historical consumption tracking

### 4. **Automated Notifications**

- Request approved/rejected notifications (both types)
- **Borrowing only**: Item due tomorrow reminders, overdue alerts
- Pending pickup reminders (both types)
- Fee payment notifications (borrowing only)
- Requisition approved notifications
- Multi-channel: normal, popup

### 5. **Scheduler Service** (Daily)

- **Borrowing**: Automatic overdue detection and status updates
- **Borrowing**: Daily reminders for items due soon
- **Both**: Pending pickup alerts
- **Both**: Auto-cancellation of unclaimed approvals

### 6. **Audit Trail**

- Complete history of all stock adjustments
- Track who, when, what, why for all changes
- **Borrowing**: Return tracking and condition changes
- **Requisition**: Consumption tracking
- IP address and user agent logging
- Support filtering by entity, action, date range

### 7. **Analytics Dashboard** (Admin)

- Key metrics overview (separated by type)
- Borrowing trends over time
- Requisition consumption tracking
- Top borrowed/requisitioned items
- Top users (borrowers and requisitioners)
- Category distribution
- Stock depletion alerts

---

## UX/UI Design

### 🎨 **Modern Toast Notifications**

The system uses **react-hot-toast** for all user feedback instead of browser dialogs (`alert`, `confirm`, `prompt`).

#### Toast Types

| Type              | Color     | Usage                   |
| ----------------- | --------- | ----------------------- |
| `toast.success()` | 🟢 Green  | Successful operations   |
| `toast.error()`   | 🔴 Red    | Errors and failures     |
| `toast.warning()` | 🟠 Orange | Warnings and validation |
| `toast.info()`    | 🔵 Blue   | Information messages    |
| `toast.confirm()` | Custom    | Confirmation dialogs    |
| `toast.prompt()`  | Custom    | Input dialogs           |

#### Examples

```tsx
// Success
toast.success("บันทึกรายการสำเร็จ");
toast.success("อนุมัติคำขอยืมสำเร็จ");

// Error
toast.error("เกิดข้อผิดพลาดในการบันทึก");

// Warning
toast.warning("กรุณาระบุเหตุผลในการปฏิเสธ");

// Confirm (async)
const confirmed = await toast.confirm("ต้องการลบรายการนี้ใช่หรือไม่?");
if (!confirmed) return;

// Prompt (async)
const reason = await toast.prompt("โปรดระบุเหตุผล:", "", "ยืนยัน", "ยกเลิก");
if (!reason) return;
```

### 📱 **Navigation Structure**

#### Sidebar Menu

```
📂 ระบบยืม-คืน & เบิกของ
  ├─ 📄 การยืมของฉัน (/borrowing/my-borrows)
  │   ├─ Tab: Browse Items (ค้นหาสินค้า)
  │   ├─ Tab: My Requests (คำขอของฉัน)
  │   └─ Tab: My Borrows (รายการยืม)
  │
  ├─ 📦 การเบิกของฉัน (/borrowing/my-requisitions)
  │   ├─ Tab: My Requests (คำขอเบิก)
  │   └─ Tab: My Requisitions (ประวัติการเบิก)
  │
  └─ ⚙️ จัดการระบบ (แอดมิน) (/borrowing/management)
      ├─ Tab: Requests (คำขอรอ approve)
      ├─ Tab: Transactions (รายการยืมปัจจุบัน)
      ├─ Tab: Requisitions (รายการเบิกรอรับของ)
      └─ Tab: Items (จัดการสินค้าและสต็อก)
```

### 🎯 **User Flows**

#### For Regular Users (Teachers)

1. **Browse Items** → Select item → Submit request
2. **Track Requests** → Wait for approval
3. **View Active Borrows** → Renew if needed
4. **View Requisitions** → Track pickup status

#### For Admins

1. **Review Requests** → Approve/Reject
2. **Monitor Transactions** → Check-in returns
3. **Manage Requisitions** → Confirm pickup
4. **Manage Items** → Add/Edit/Delete stock

### 📊 **Dashboard Widgets**

#### Borrowing Dashboard (Visible to Teachers+)

- Total items in system
- Currently borrowed items count
- Overdue items alert
- Pending approvals
- Monthly statistics
- Low stock warnings (Admin only)

### 🎨 **Color Scheme**

| Element | Color     | Usage                           |
| ------- | --------- | ------------------------------- |
| Primary | `#334293` | Main brand color, buttons       |
| Success | `#10B981` | Success toasts, approved status |
| Error   | `#EF4444` | Error toasts, rejected status   |
| Warning | `#F59E0B` | Warning toasts, pending status  |
| Info    | `#3B82F6` | Info toasts, neutral actions    |
| Purple  | `#6B46C1` | Requisition system theme        |

### ✅ **UX Best Practices Implemented**

1. ✅ **No Browser Dialogs** - All feedback via Toast
2. ✅ **Loading States** - Spinners and disable buttons during operations
3. ✅ **Confirmation Dialogs** - Custom styled confirm/prompt modals
4. ✅ **Responsive Design** - Works on desktop and mobile
5. ✅ **Keyboard Shortcuts** - Enter to confirm, Esc to cancel
6. ✅ **Clear Status Indicators** - Color-coded badges
7. ✅ **Breadcrumbs** - Navigation context
8. ✅ **Role-Based Access** - Different views for users/admins
9. ✅ **Real-time Updates** - Dashboard refreshes automatically
10. ✅ **Intuitive Workflows** - Step-by-step guidance

---

## API Endpoints

### **Base URL**: `/api/borrowing`

### Items (Public/User Access)

| Method | Endpoint     | Description            | Auth |
| ------ | ------------ | ---------------------- | ---- |
| GET    | `/items`     | Browse available items | User |
| GET    | `/items/:id` | View item details      | User |

**Query Parameters for `/items`:**

- `branch_id` - Filter by branch
- `item_type` - book, equipment, material, stationery, office_supply, other
- `category` - Category name
- `status` - available, unavailable
- `mode` - borrowable, requisition (filter by item mode)
- `search` - Search in title, author, description
- `available_only` - true/false

### Requests (User)

| Method | Endpoint               | Description                         | Auth |
| ------ | ---------------------- | ----------------------------------- | ---- |
| POST   | `/requests`            | Submit request (borrow/requisition) | User |
| GET    | `/my-requests`         | View my requests                    | User |
| DELETE | `/requests/:id/cancel` | Cancel pending request              | User |

**POST `/requests` Body:**

```json
{
  "item_id": 1,
  "quantity": 1,
  "request_type": "borrowing", // or "requisition"
  "scheduled_pickup_date": "2025-01-20",
  "scheduled_return_date": "2025-02-03", // only for borrowing
  "request_notes": "Purpose or reason"
}
```

### Borrows (User)

| Method | Endpoint             | Description                      | Auth |
| ------ | -------------------- | -------------------------------- | ---- |
| GET    | `/my-borrows`        | My borrow history                | User |
| POST   | `/borrows/:id/renew` | Request renewal (borrowing only) | User |
| GET    | `/transactions/:id`  | View transaction detail          | User |

### Requisitions (User)

| Method | Endpoint            | Description             | Auth |
| ------ | ------------------- | ----------------------- | ---- |
| GET    | `/my-requisitions`  | My requisition history  | User |
| GET    | `/requisitions/:id` | View requisition detail | User |

### Items Management (Admin)

| Method | Endpoint                  | Description                              | Auth  |
| ------ | ------------------------- | ---------------------------------------- | ----- |
| POST   | `/items`                  | Create new item (borrowable/requisition) | Admin |
| PUT    | `/items/:id`              | Update item                              | Admin |
| DELETE | `/items/:id`              | Delete item                              | Admin |
| POST   | `/items/:id/upload-image` | Upload cover image                       | Admin |
| POST   | `/items/:id/upload-pdf`   | Upload PDF file                          | Admin |
| POST   | `/items/:id/adjust-stock` | Manually adjust stock                    | Admin |

**POST `/items` Body for Borrowable Item:**

```json
{
  "item_mode": "borrowable",
  "item_type": "book",
  "title": "Clean Code",
  "max_borrow_days": 14,
  "renewable_count": 2,
  "late_fee_per_day": 10.0,
  ...
}
```

**POST `/items` Body for Requisition Item:**

```json
{
  "item_mode": "requisition",
  "item_type": "stationery",
  "title": "Blue Ballpoint Pen",
  "unit": "piece",
  "max_quantity_per_request": 10,
  ...
}
```

### Request Workflow (Admin)

| Method | Endpoint                | Description                    | Auth  |
| ------ | ----------------------- | ------------------------------ | ----- |
| GET    | `/requests`             | View all requests (both types) | Admin |
| PUT    | `/requests/:id/approve` | Approve request (both types)   | Admin |
| PUT    | `/requests/:id/reject`  | Reject request (both types)    | Admin |

**Query Parameters for `/requests`:**

- `request_type` - borrowing, requisition, all (default: all)
- `status` - pending, approved, rejected, cancelled
- `branch_id` - Filter by branch

### Transaction Management (Admin)

| Method | Endpoint                           | Description                  | Auth  |
| ------ | ---------------------------------- | ---------------------------- | ----- |
| GET    | `/transactions`                    | View all borrow transactions | Admin |
| POST   | `/borrows/:id/checkin`             | Check in returned item       | Admin |
| POST   | `/transactions/mark-overdue`       | Update overdue status        | Admin |
| POST   | `/transactions/:id/record-payment` | Record fee payment           | Admin |

**Query Parameters for `/transactions`:**

- `status` - borrowed, returned, overdue, lost
- `branch_id` - Filter by branch
- `user_id` - Filter by user
- `start_date`, `end_date` - Date range

### Requisition Management (Admin)

| Method | Endpoint                     | Description              | Auth  |
| ------ | ---------------------------- | ------------------------ | ----- |
| GET    | `/requisitions`              | View all requisitions    | Admin |
| POST   | `/requisitions/:id/complete` | Mark as picked up        | Admin |
| DELETE | `/requisitions/:id/cancel`   | Cancel and restore stock | Admin |

**Query Parameters for `/requisitions`:**

- `status` - approved, picked_up, cancelled
- `branch_id` - Filter by branch
- `start_date`, `end_date` - Approved date range

**POST `/requisitions/:id/complete` Body:**

```json
{
  "notes": "User signed and received items"
}
```

**DELETE `/requisitions/:id/cancel` Body:**

```json
{
  "reason": "User no longer needs the items"
}
```

**Cancel Requisition Behavior:**

- Restores both `available_stock` AND `total_stock`
- Sets status to `cancelled`
- Appends reason to notes
- Audit logged

---

### **Dashboard Base URL**: `/api/dashboard/borrow`

### Analytics (Admin Only)

| Method | Endpoint        | Description                                  | Auth  |
| ------ | --------------- | -------------------------------------------- | ----- |
| GET    | `/overview`     | Key metrics overview (separated by type)     | Admin |
| GET    | `/trends`       | Borrowing trends over time                   | Admin |
| GET    | `/top-items`    | Most popular items                           | Admin |
| GET    | `/top-users`    | Top borrowers/requisitioners                 | Admin |
| GET    | `/categories`   | Distribution by category                     | Admin |
| GET    | `/low-stock`    | ⚠️ Low stock items alert (reorder needed)    | Admin |
| GET    | `/stock-alerts` | 🚨 Comprehensive stock monitoring and alerts | Admin |
| GET    | `/audit-logs`   | Recent audit trail                           | Admin |

**Query Parameters:**

- `branch_id` - Filter by branch (all endpoints)
- `days` - Number of days for trends (default: 30)
- `limit` - Limit results (default: 10, max: 100)
- `offset` - Pagination offset
- `alert_type` - Filter alerts: "critical", "low", "high_utilization", "all" (stock-alerts only)

**Dashboard Overview Response Structure:**

```json
{
  "success": true,
  "data": {
    "inventory": {
      "total_items": 150,
      "borrowable_items": 100,
      "requisition_items": 50,
      "total_stock": 500,
      "available_stock": 350,
      "borrowed_stock": 150,
      "low_stock_alerts": 5
    },
    "borrowing": {
      "currently_borrowed": 20,
      "overdue_count": 3,
      "pending_requests": 5,
      "borrowed_this_month": 45,
      "returned_this_month": 38
    },
    "requisition": {
      "approved_waiting_pickup": 8,
      "pending_requests": 3,
      "requisitioned_this_month": 25
    },
    "fees": {
      "total_collected": 1500.0,
      "outstanding_fees": 350.0
    }
  }
}
```

**Low Stock Alerts Response:**

```json
{
  "success": true,
  "data": [
    {
      "item_id": 45,
      "title": "Blue Ballpoint Pen",
      "item_mode": "requisition",
      "category": "Stationery",
      "available_stock": 15,
      "reorder_level": 20,
      "unit": "piece",
      "estimated_cost": 5.0,
      "branch_name": "Main Branch"
    }
  ],
  "total": 5,
  "message": "Items with stock at or below reorder level"
}
```

**Comprehensive Stock Alerts Response (NEW - `/stock-alerts`):**

```json
{
  "success": true,
  "data": {
    "all_alerts": [
      {
        "item_id": 15,
        "title": "Red Markers",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 0,
        "total_stock": 100,
        "borrowed_stock": 0,
        "reorder_level": 20,
        "unit": "pieces",
        "estimated_cost_per_unit": 8.5,
        "branch_name": "Main Branch",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 45,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 10,
        "title": "Blue Ballpoint Pen",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 15,
        "total_stock": 200,
        "borrowed_stock": 0,
        "reorder_level": 50,
        "unit": "pieces",
        "estimated_cost_per_unit": 5.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 92.5,
        "days_since_last_restock": 30,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 5,
        "title": "Programming Laptops",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 2,
        "total_stock": 10,
        "borrowed_stock": 8,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 15000.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 120,
        "pending_returns": 8,
        "status": "available"
      }
    ],
    "critical": [...],
    "warning": [...],
    "info": [...]
  },
  "summary": {
    "total_alerts": 3,
    "critical_count": 1,
    "warning_count": 1,
    "info_count": 1,
    "estimated_reorder_cost": 345.0
  },
  "filters": {
    "branch_id": "1",
    "alert_type": "all"
  },
  "message": "Stock alerts retrieved successfully"
}
```

**Alert Levels:**

- **critical**: Out of stock (available_stock = 0) - Immediate action required 🚨
- **warning**: Below reorder level (requisition items) - Reorder needed soon ⚠️
- **info**: High utilization (borrowable items ≥ 80%) - Monitor closely ℹ️

**Query Parameters for `/stock-alerts`:**

- `branch_id` - Filter by branch ID
- `alert_type` - Filter by alert level:
  - `critical` - Only out of stock items
  - `low` - Only items below reorder level
  - `high_utilization` - Only borrowable items with 80%+ utilization
  - `all` (default) - All alerts

---

## Workflow

### 🔄 Borrowing Workflow (Returnable Items)

```
┌─────────────────────────────────────────────────────────────────┐
│                     BORROWING WORKFLOW                           │
│                   (Items must be returned)                       │
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

### 📦 Requisition Workflow (Permanent Withdrawal)

```
┌─────────────────────────────────────────────────────────────────┐
│                   REQUISITION WORKFLOW                           │
│              (Items are permanently withdrawn)                   │
└─────────────────────────────────────────────────────────────────┘

1. USER SUBMITS REQUISITION REQUEST
   ├─ POST /api/borrowing/requests
   ├─ request_type: "requisition"
   ├─ No return date needed
   ├─ Specify quantity and purpose
   ├─ Status: "pending"
   └─ Notification sent to admins

2. ADMIN REVIEWS REQUEST
   ├─ GET /api/borrowing/requests?request_type=requisition
   │
   ├─ APPROVE:
   │  ├─ PUT /api/borrowing/requests/:id/approve
   │  ├─ Reduce both total_stock AND available_stock (PERMANENT)
   │  ├─ Create RequisitionTransaction (status: "approved")
   │  ├─ No due_date (not applicable)
   │  ├─ Record purpose/usage
   │  └─ Send notification to user (approved)
   │
   └─ REJECT:
      ├─ PUT /api/borrowing/requests/:id/reject
      ├─ Require review_notes
      └─ Send notification to user (rejected)

3. USER PICKS UP ITEMS
   ├─ POST /api/borrowing/requisitions/:id/complete
   ├─ Admin marks as "picked_up"
   ├─ Record pickup_date and confirmed_by
   └─ Transaction becomes permanent

4. NO RETURN PROCESS
   ├─ Items are consumed/used permanently
   ├─ No due dates or late fees
   ├─ No renewal needed
   └─ Stock is permanently reduced

5. AUDIT LOGGING
   └─ Track all requisitions:
      ├─ Who requested
      ├─ What items and quantities
      ├─ Purpose/usage
      ├─ Admin who approved
      ├─ Pickup date
      └─ Historical consumption tracking

┌─────────────────────────────────────────────────────────────────┐
│                   KEY DIFFERENCES                                │
└─────────────────────────────────────────────────────────────────┘

BORROWING vs REQUISITION:

Stock Management:
  Borrowing:     available_stock -= quantity (temporary)
                 total_stock unchanged
  Requisition:   available_stock -= quantity (permanent)
                 total_stock -= quantity (consumed)

Return Process:
  Borrowing:     Must return → stock restored
  Requisition:   No return → stock gone forever

Tracking:
  Borrowing:     Due dates, late fees, condition
  Requisition:   Purpose, consumption rate, stock depletion

Use Cases:
  Borrowing:     Books, laptops, equipment
  Requisition:   Pens, paper, chalk, stationery
```

---

## Data Models

### BorrowableItem (Items Model)

```go
{
  "id": 1,
  "branch_id": 1,

  // Mode: borrowable or requisition
  "item_mode": "borrowable",      // "borrowable" or "requisition"

  // Item Information
  "item_type": "book",            // book, equipment, material, stationery, office_supply, other
  "category": "Programming",
  "title": "Clean Code",
  "author": "Robert C. Martin",  // optional
  "isbn": "978-0132350884",      // optional, for books
  "publisher": "Prentice Hall",   // optional
  "published_year": 2008,         // optional
  "description": "A handbook of agile software craftsmanship",
  "cover_image_url": "https://s3.../cover.webp",
  "pdf_file_url": "https://s3.../book.pdf",  // optional

  // Inventory
  "total_stock": 5,               // Total items owned
  "available_stock": 3,           // Currently available

  // ===== BORROWABLE MODE ONLY =====
  "max_borrow_days": 14,          // Maximum days to borrow (null = unlimited)
  "renewable_count": 2,           // Times can renew (null = unlimited)
  "late_fee_per_day": 10.00,     // Late fee per day (0 = no fee)

  // ===== REQUISITION MODE ONLY =====
  "unit": "piece",                // Unit: piece, pack, box, set, etc.
  "max_quantity_per_request": 10, // Max quantity per request (null = unlimited)
  "reorder_level": 20,            // Alert when stock below this

  // Common
  "requires_approval": true,
  "status": "available",          // available, unavailable, discontinued
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Examples:**

**Borrowable Item (Book):**

```json
{
  "item_mode": "borrowable",
  "item_type": "book",
  "title": "Clean Code",
  "max_borrow_days": 14,
  "renewable_count": 2,
  "late_fee_per_day": 10.0
}
```

**Requisition Item (Stationery):**

```json
{
  "item_mode": "requisition",
  "item_type": "stationery",
  "title": "Blue Ballpoint Pen",
  "unit": "piece",
  "max_quantity_per_request": 10,
  "reorder_level": 50
}
```

### Request (Universal Request Model)

```go
{
  "id": 1,
  "user_id": 123,
  "item_id": 1,
  "quantity": 1,

  // Type: borrowing or requisition
  "request_type": "borrowing",    // "borrowing" or "requisition"

  "status": "approved",           // pending, approved, rejected, cancelled

  // Pickup & Return
  "scheduled_pickup_date": "2025-01-20T00:00:00Z",
  "scheduled_return_date": "2025-02-03T00:00:00Z",  // null for requisition

  // Review Information
  "reviewed_by": 5,
  "reviewed_at": "2025-01-16T14:30:00Z",
  "review_notes": "Approved for academic use",

  // User Notes
  "request_notes": "Needed for project",
  "purpose": "Educational materials for class",  // For requisition

  // Preloaded relationships
  "item": { /* BorrowableItem */ },
  "user": { /* User */ },
  "reviewed_by_user": { /* User */ }
}
```

**Example - Borrowing Request:**

```json
{
  "request_type": "borrowing",
  "item_id": 1,
  "quantity": 1,
  "scheduled_pickup_date": "2025-01-20",
  "scheduled_return_date": "2025-02-03",
  "request_notes": "Need for programming course"
}
```

**Example - Requisition Request:**

```json
{
  "request_type": "requisition",
  "item_id": 10,
  "quantity": 5,
  "scheduled_pickup_date": "2025-01-20",
  "purpose": "Office supplies for teacher's room",
  "request_notes": "Blue pens for marking exams"
}
```

### BorrowTransaction (Borrowing Only)

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

### RequisitionTransaction (Requisition Only)

```go
{
  "id": 1,
  "request_id": 1,
  "item_id": 10,
  "user_id": 123,
  "quantity": 5,
  "status": "approved",           // approved, picked_up, cancelled

  // Pickup Information
  "approved_date": "2025-01-16T14:30:00Z",
  "pickup_date": "2025-01-20T10:00:00Z",  // When actually picked up
  "scheduled_pickup_date": "2025-01-20T00:00:00Z",

  // Admin Tracking
  "approved_by": 5,
  "confirmed_by": 5,              // Admin who confirmed pickup

  // Purpose & Usage
  "purpose": "Office supplies for teacher's room",
  "notes": "Blue pens for marking exams",

  // No return-related fields (permanent withdrawal)
  // No fees (not applicable)

  // Preloaded relationships
  "item": { /* BorrowableItem */ },
  "user": { /* User */ },
  "approved_by_user": { /* User */ },
  "confirmed_by_user": { /* User */ }
}
```

**Requisition Status Flow:**

- `approved` → Request approved, waiting for pickup
- `picked_up` → User has picked up items
- `cancelled` → Request cancelled (stock restored)

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

### 1. Create a Borrowable Item (Book)

**Request:**

```http
POST /api/borrowing/items
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "branch_id": 1,
  "item_mode": "borrowable",
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
    "item_mode": "borrowable",
    "item_type": "book",
    "title": "Clean Code",
    ...
  }
}
```

---

### 1B. Create a Requisition Item (Stationery)

**Request:**

```http
POST /api/borrowing/items
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "branch_id": 1,
  "item_mode": "requisition",
  "item_type": "stationery",
  "category": "Writing Tools",
  "title": "Blue Ballpoint Pen",
  "description": "Standard blue ink ballpoint pen for general use",
  "total_stock": 200,
  "available_stock": 200,
  "unit": "piece",
  "max_quantity_per_request": 10,
  "reorder_level": 50,
  "requires_approval": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": 10,
    "branch_id": 1,
    "item_mode": "requisition",
    "item_type": "stationery",
    "title": "Blue Ballpoint Pen",
    "unit": "piece",
    "total_stock": 200,
    "available_stock": 200,
    ...
  }
}
```

---

### 2. Upload Cover Image

**Behavior:**

- 🔄 **Automatic replacement**: If an item already has a cover image, the old file will be automatically deleted from S3 before uploading the new one
- This prevents accumulation of unused files and saves storage space
- Only the latest uploaded image is kept

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

**Note:** The same automatic replacement behavior applies to PDF file uploads via `/items/:id/upload-pdf`.

### 3. User Submits Borrow Request

**Request:**

```http
POST /api/borrowing/requests
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "item_id": 1,
  "quantity": 1,
  "request_type": "borrowing",
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
    "request_type": "borrowing",
    "status": "pending",
    ...
  }
}
```

---

### 3B. User Submits Requisition Request

**Request:**

```http
POST /api/borrowing/requests
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "item_id": 10,
  "quantity": 5,
  "request_type": "requisition",
  "scheduled_pickup_date": "2025-01-20",
  "purpose": "Office supplies for teacher's room",
  "request_notes": "Blue pens needed for marking student exams"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Requisition request created successfully",
  "data": {
    "id": 2,
    "user_id": 123,
    "item_id": 10,
    "quantity": 5,
    "request_type": "requisition",
    "status": "pending",
    "purpose": "Office supplies for teacher's room",
    ...
  }
}
```

**Note**: No `scheduled_return_date` for requisition requests.

### 4. Admin Approves Borrow Request

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

**Stock Changes (Borrowing):**

- `available_stock`: 200 → 199 (temporary reduction)
- `total_stock`: 200 (unchanged)

**Notification Sent to User:**

```
Title: "Borrow Request Approved"
Message: "Your request to borrow 'Clean Code' has been approved.
          Please pick up by Jan 20, 2025"
Type: success
Channels: ["normal"]
```

---

### 4B. Admin Approves Requisition Request

**Request:**

```http
PUT /api/borrowing/requests/2/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "review_notes": "Approved for office use."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Requisition request approved successfully",
  "data": {
    "id": 2,
    "status": "approved",
    "reviewed_by": 5,
    "reviewed_at": "2025-01-16T14:30:00Z",
    ...
  },
  "requisition_id": 1
}
```

**Stock Changes (Requisition):**

- `available_stock`: 200 → 195 (permanent reduction)
- `total_stock`: 200 → 195 (consumed permanently)

**Notification Sent to User:**

```
Title: "Requisition Request Approved"
Message: "Your request for 5 Blue Ballpoint Pen(s) has been approved.
          Please pick up by Jan 20, 2025"
Type: success
Channels: ["normal"]
```

### 5. Admin Checks In Returned Item (Borrowing Only)

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

**Stock Restored:**

- `available_stock`: 199 → 200 (item returned to inventory)

---

### 5B. Admin Confirms Requisition Pickup

**Request:**

```http
POST /api/borrowing/requisitions/1/complete
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Items picked up by teacher, signed requisition form received"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Requisition marked as picked up",
  "data": {
    "id": 1,
    "status": "picked_up",
    "pickup_date": "2025-01-20T10:00:00Z",
    "confirmed_by": 5,
    "notes": "Items picked up by teacher, signed requisition form received",
    ...
  }
}
```

**Stock Status:**

- Stock already permanently reduced on approval
- No return expected
- Transaction is now complete

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
      "total_items": 55,
      "borrowable_items": 45,
      "requisition_items": 10,
      "total_stock": 380,
      "available_stock": 342,
      "borrowed_stock": 38
    },
    "borrowing": {
      "currently_borrowed": 32,
      "overdue_count": 3,
      "pending_requests": 5,
      "this_month": {
        "borrowed": 68,
        "returned": 61
      }
    },
    "requisition": {
      "pending_requests": 3,
      "this_month": {
        "approved": 45,
        "total_quantity": 230,
        "items_consumed": 15
      },
      "low_stock_items": 2
    },
    "fees": {
      "total_collected": 1250.0,
      "outstanding_fees": 180.0
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

### 8. Get Comprehensive Stock Alerts (NEW)

**Request - Get all alerts:**

```http
GET /api/dashboard/borrow/stock-alerts?branch_id=1
Authorization: Bearer <admin_token>
```

**Request - Get only critical alerts:**

```http
GET /api/dashboard/borrow/stock-alerts?branch_id=1&alert_type=critical
Authorization: Bearer <admin_token>
```

**Request - Get only low stock warnings:**

```http
GET /api/dashboard/borrow/stock-alerts?alert_type=low
Authorization: Bearer <admin_token>
```

**Request - Get high utilization items:**

```http
GET /api/dashboard/borrow/stock-alerts?alert_type=high_utilization
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "all_alerts": [
      {
        "item_id": 15,
        "title": "Red Markers",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 0,
        "total_stock": 100,
        "borrowed_stock": 0,
        "reorder_level": 20,
        "unit": "pieces",
        "estimated_cost_per_unit": 8.5,
        "branch_name": "Main Branch",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 45,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 10,
        "title": "Blue Ballpoint Pen",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 15,
        "total_stock": 200,
        "borrowed_stock": 0,
        "reorder_level": 50,
        "unit": "pieces",
        "estimated_cost_per_unit": 5.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 92.5,
        "days_since_last_restock": 30,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 5,
        "title": "Programming Laptops",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 2,
        "total_stock": 10,
        "borrowed_stock": 8,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 15000.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 120,
        "pending_returns": 8,
        "status": "available"
      }
    ],
    "critical": [
      {
        "item_id": 15,
        "title": "Red Markers",
        "item_mode": "requisition",
        "available_stock": 0,
        "alert_level": "critical"
      }
    ],
    "warning": [
      {
        "item_id": 10,
        "title": "Blue Ballpoint Pen",
        "available_stock": 15,
        "reorder_level": 50,
        "alert_level": "warning"
      }
    ],
    "info": [
      {
        "item_id": 5,
        "title": "Programming Laptops",
        "utilization_rate": 80.0,
        "pending_returns": 8,
        "alert_level": "info"
      }
    ]
  },
  "summary": {
    "total_alerts": 3,
    "critical_count": 1,
    "warning_count": 1,
    "info_count": 1,
    "estimated_reorder_cost": 345.0
  },
  "filters": {
    "branch_id": "1",
    "alert_type": "all"
  },
  "message": "Stock alerts retrieved successfully"
}
```

**Use Cases:**

1. **Critical Alerts (Out of Stock)**

   - Items with `available_stock = 0`
   - Requires immediate reordering
   - Cannot fulfill new requests

2. **Warning Alerts (Low Stock)**

   - Requisition items below `reorder_level`
   - Plan reordering soon
   - Monitor consumption rate

3. **Info Alerts (High Utilization)**

   - Borrowable items with 80%+ utilization
   - Most items are currently borrowed
   - Consider increasing stock if demand is consistent

4. **Estimated Reorder Cost**
   - Automatic calculation of reorder costs
   - Based on `(reorder_level - available_stock) * estimated_cost_per_unit`
   - Helps with budget planning

---

### 📚 Complete Examples for `/dashboard/borrow/stock-alerts`

#### Example 1: Get All Alerts (Default)

**Request:**

```http
GET /api/dashboard/borrow/stock-alerts
Authorization: Bearer <admin_token>
```

**Response - Complete with All Alert Types:**

```json
{
  "success": true,
  "data": {
    "all_alerts": [
      {
        "item_id": 15,
        "title": "Red Whiteboard Markers",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 0,
        "total_stock": 100,
        "borrowed_stock": 0,
        "reorder_level": 20,
        "unit": "pieces",
        "estimated_cost_per_unit": 8.5,
        "branch_name": "Main Branch",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 45,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 23,
        "title": "A4 Copy Paper",
        "item_mode": "requisition",
        "item_type": "office_supply",
        "category": "Paper Products",
        "available_stock": 0,
        "total_stock": 500,
        "borrowed_stock": 0,
        "reorder_level": 100,
        "unit": "reams",
        "estimated_cost_per_unit": 85.0,
        "branch_name": "Tech Campus",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 12,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 10,
        "title": "Blue Ballpoint Pen",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 15,
        "total_stock": 200,
        "borrowed_stock": 0,
        "reorder_level": 50,
        "unit": "pieces",
        "estimated_cost_per_unit": 5.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 92.5,
        "days_since_last_restock": 30,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 18,
        "title": "Chalk - White Box",
        "item_mode": "requisition",
        "item_type": "material",
        "category": "Teaching Supplies",
        "available_stock": 8,
        "total_stock": 50,
        "borrowed_stock": 0,
        "reorder_level": 10,
        "unit": "boxes",
        "estimated_cost_per_unit": 35.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 84.0,
        "days_since_last_restock": 18,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 5,
        "title": "Programming Laptops - Dell XPS 15",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 2,
        "total_stock": 10,
        "borrowed_stock": 8,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 35000.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 120,
        "pending_returns": 8,
        "status": "available"
      },
      {
        "item_id": 12,
        "title": "English Grammar Textbooks",
        "item_mode": "borrowable",
        "item_type": "book",
        "category": "Language Learning",
        "available_stock": 3,
        "total_stock": 15,
        "borrowed_stock": 12,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 450.0,
        "branch_name": "Main Branch",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 90,
        "pending_returns": 12,
        "status": "available"
      },
      {
        "item_id": 7,
        "title": "Projectors - Epson EB-X51",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Presentation Equipment",
        "available_stock": 1,
        "total_stock": 5,
        "borrowed_stock": 4,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 18000.0,
        "branch_name": "Main Branch",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 200,
        "pending_returns": 4,
        "status": "available"
      }
    ],
    "critical": [
      {
        "item_id": 15,
        "title": "Red Whiteboard Markers",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 0,
        "total_stock": 100,
        "borrowed_stock": 0,
        "reorder_level": 20,
        "unit": "pieces",
        "estimated_cost_per_unit": 8.5,
        "branch_name": "Main Branch",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 45,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 23,
        "title": "A4 Copy Paper",
        "item_mode": "requisition",
        "item_type": "office_supply",
        "category": "Paper Products",
        "available_stock": 0,
        "total_stock": 500,
        "borrowed_stock": 0,
        "reorder_level": 100,
        "unit": "reams",
        "estimated_cost_per_unit": 85.0,
        "branch_name": "Tech Campus",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 12,
        "pending_returns": 0,
        "status": "available"
      }
    ],
    "warning": [
      {
        "item_id": 10,
        "title": "Blue Ballpoint Pen",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 15,
        "total_stock": 200,
        "borrowed_stock": 0,
        "reorder_level": 50,
        "unit": "pieces",
        "estimated_cost_per_unit": 5.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 92.5,
        "days_since_last_restock": 30,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 18,
        "title": "Chalk - White Box",
        "item_mode": "requisition",
        "item_type": "material",
        "category": "Teaching Supplies",
        "available_stock": 8,
        "total_stock": 50,
        "borrowed_stock": 0,
        "reorder_level": 10,
        "unit": "boxes",
        "estimated_cost_per_unit": 35.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 84.0,
        "days_since_last_restock": 18,
        "pending_returns": 0,
        "status": "available"
      }
    ],
    "info": [
      {
        "item_id": 5,
        "title": "Programming Laptops - Dell XPS 15",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 2,
        "total_stock": 10,
        "borrowed_stock": 8,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 35000.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 120,
        "pending_returns": 8,
        "status": "available"
      },
      {
        "item_id": 12,
        "title": "English Grammar Textbooks",
        "item_mode": "borrowable",
        "item_type": "book",
        "category": "Language Learning",
        "available_stock": 3,
        "total_stock": 15,
        "borrowed_stock": 12,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 450.0,
        "branch_name": "Main Branch",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 90,
        "pending_returns": 12,
        "status": "available"
      },
      {
        "item_id": 7,
        "title": "Projectors - Epson EB-X51",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Presentation Equipment",
        "available_stock": 1,
        "total_stock": 5,
        "borrowed_stock": 4,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 18000.0,
        "branch_name": "Main Branch",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 200,
        "pending_returns": 4,
        "status": "available"
      }
    ]
  },
  "summary": {
    "total_alerts": 7,
    "critical_count": 2,
    "warning_count": 2,
    "info_count": 3,
    "estimated_reorder_cost": 9020.0
  },
  "filters": {
    "branch_id": "",
    "alert_type": ""
  },
  "message": "Stock alerts retrieved successfully"
}
```

**Analysis of the Response:**

- 🚨 **2 Critical**: Red Markers (0 stock), A4 Paper (0 stock) - Need **immediate** action
- ⚠️ **2 Warning**: Blue Pens (15/200, reorder at 50), Chalk (8/50, reorder at 10) - Order **soon**
- ℹ️ **3 Info**: Laptops (80% borrowed), Textbooks (80% borrowed), Projectors (80% borrowed) - **Monitor** closely
- 💰 **Reorder Cost**: ฿9,020 needed for restocking

---

#### Example 2: Critical Alerts Only (Out of Stock)

**Request:**

```http
GET /api/dashboard/borrow/stock-alerts?alert_type=critical
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "all_alerts": [
      {
        "item_id": 15,
        "title": "Red Whiteboard Markers",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 0,
        "total_stock": 100,
        "borrowed_stock": 0,
        "reorder_level": 20,
        "unit": "pieces",
        "estimated_cost_per_unit": 8.5,
        "branch_name": "Main Branch",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 45,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 23,
        "title": "A4 Copy Paper",
        "item_mode": "requisition",
        "item_type": "office_supply",
        "category": "Paper Products",
        "available_stock": 0,
        "total_stock": 500,
        "borrowed_stock": 0,
        "reorder_level": 100,
        "unit": "reams",
        "estimated_cost_per_unit": 85.0,
        "branch_name": "Tech Campus",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 12,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 31,
        "title": "Erasers - White",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 0,
        "total_stock": 200,
        "borrowed_stock": 0,
        "reorder_level": 30,
        "unit": "pieces",
        "estimated_cost_per_unit": 3.0,
        "branch_name": "Main Branch",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 7,
        "pending_returns": 0,
        "status": "available"
      }
    ],
    "critical": [
      {
        "item_id": 15,
        "title": "Red Whiteboard Markers",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 0,
        "total_stock": 100,
        "borrowed_stock": 0,
        "reorder_level": 20,
        "unit": "pieces",
        "estimated_cost_per_unit": 8.5,
        "branch_name": "Main Branch",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 45,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 23,
        "title": "A4 Copy Paper",
        "item_mode": "requisition",
        "item_type": "office_supply",
        "category": "Paper Products",
        "available_stock": 0,
        "total_stock": 500,
        "borrowed_stock": 0,
        "reorder_level": 100,
        "unit": "reams",
        "estimated_cost_per_unit": 85.0,
        "branch_name": "Tech Campus",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 12,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 31,
        "title": "Erasers - White",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 0,
        "total_stock": 200,
        "borrowed_stock": 0,
        "reorder_level": 30,
        "unit": "pieces",
        "estimated_cost_per_unit": 3.0,
        "branch_name": "Main Branch",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 7,
        "pending_returns": 0,
        "status": "available"
      }
    ],
    "warning": [],
    "info": []
  },
  "summary": {
    "total_alerts": 3,
    "critical_count": 3,
    "warning_count": 0,
    "info_count": 0,
    "estimated_reorder_cost": 8760.0
  },
  "filters": {
    "branch_id": "",
    "alert_type": "critical"
  },
  "message": "Stock alerts retrieved successfully"
}
```

**Action Required:**

- 🛒 **Order immediately**: 20 markers (฿170) + 100 reams (฿8,500) + 30 erasers (฿90) = **฿8,760**
- 📞 Contact suppliers today
- ❌ Cannot fulfill new requisition requests for these items

---

#### Example 3: Low Stock Warnings Only

**Request:**

```http
GET /api/dashboard/borrow/stock-alerts?alert_type=low&branch_id=1
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "all_alerts": [
      {
        "item_id": 10,
        "title": "Blue Ballpoint Pen",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 15,
        "total_stock": 200,
        "borrowed_stock": 0,
        "reorder_level": 50,
        "unit": "pieces",
        "estimated_cost_per_unit": 5.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 92.5,
        "days_since_last_restock": 30,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 18,
        "title": "Chalk - White Box",
        "item_mode": "requisition",
        "item_type": "material",
        "category": "Teaching Supplies",
        "available_stock": 8,
        "total_stock": 50,
        "borrowed_stock": 0,
        "reorder_level": 10,
        "unit": "boxes",
        "estimated_cost_per_unit": 35.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 84.0,
        "days_since_last_restock": 18,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 25,
        "title": "Sticky Notes - Yellow 3x3",
        "item_mode": "requisition",
        "item_type": "office_supply",
        "category": "Stationery",
        "available_stock": 12,
        "total_stock": 100,
        "borrowed_stock": 0,
        "reorder_level": 20,
        "unit": "pads",
        "estimated_cost_per_unit": 15.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 88.0,
        "days_since_last_restock": 22,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 28,
        "title": "Permanent Markers - Black",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 5,
        "total_stock": 80,
        "borrowed_stock": 0,
        "reorder_level": 15,
        "unit": "pieces",
        "estimated_cost_per_unit": 12.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 93.75,
        "days_since_last_restock": 25,
        "pending_returns": 0,
        "status": "available"
      }
    ],
    "critical": [],
    "warning": [
      {
        "item_id": 10,
        "title": "Blue Ballpoint Pen",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 15,
        "total_stock": 200,
        "borrowed_stock": 0,
        "reorder_level": 50,
        "unit": "pieces",
        "estimated_cost_per_unit": 5.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 92.5,
        "days_since_last_restock": 30,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 18,
        "title": "Chalk - White Box",
        "item_mode": "requisition",
        "item_type": "material",
        "category": "Teaching Supplies",
        "available_stock": 8,
        "total_stock": 50,
        "borrowed_stock": 0,
        "reorder_level": 10,
        "unit": "boxes",
        "estimated_cost_per_unit": 35.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 84.0,
        "days_since_last_restock": 18,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 25,
        "title": "Sticky Notes - Yellow 3x3",
        "item_mode": "requisition",
        "item_type": "office_supply",
        "category": "Stationery",
        "available_stock": 12,
        "total_stock": 100,
        "borrowed_stock": 0,
        "reorder_level": 20,
        "unit": "pads",
        "estimated_cost_per_unit": 15.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 88.0,
        "days_since_last_restock": 22,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 28,
        "title": "Permanent Markers - Black",
        "item_mode": "requisition",
        "item_type": "stationery",
        "category": "Writing Tools",
        "available_stock": 5,
        "total_stock": 80,
        "borrowed_stock": 0,
        "reorder_level": 15,
        "unit": "pieces",
        "estimated_cost_per_unit": 12.0,
        "branch_name": "Main Branch",
        "alert_level": "warning",
        "utilization_rate": 93.75,
        "days_since_last_restock": 25,
        "pending_returns": 0,
        "status": "available"
      }
    ],
    "info": []
  },
  "summary": {
    "total_alerts": 4,
    "critical_count": 0,
    "warning_count": 4,
    "info_count": 0,
    "estimated_reorder_cost": 365.0
  },
  "filters": {
    "branch_id": "1",
    "alert_type": "low"
  },
  "message": "Stock alerts retrieved successfully"
}
```

**Planning:**

- 📅 **Order within 1 week**: Total ฿365
  - 35 Blue Pens (฿175) - Will run out in ~10 days at current rate
  - 2 Chalk boxes (฿70) - Will run out in ~12 days
  - 8 Sticky Notes (฿120) - Will run out in ~15 days
  - 10 Permanent Markers (฿120) - Will run out in ~8 days
- 📊 Monitor consumption rate to adjust reorder levels

---

#### Example 4: High Utilization Items Only

**Request:**

```http
GET /api/dashboard/borrow/stock-alerts?alert_type=high_utilization
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "all_alerts": [
      {
        "item_id": 5,
        "title": "Programming Laptops - Dell XPS 15",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 2,
        "total_stock": 10,
        "borrowed_stock": 8,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 35000.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 120,
        "pending_returns": 8,
        "status": "available"
      },
      {
        "item_id": 12,
        "title": "English Grammar Textbooks - Advanced",
        "item_mode": "borrowable",
        "item_type": "book",
        "category": "Language Learning",
        "available_stock": 3,
        "total_stock": 15,
        "borrowed_stock": 12,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 450.0,
        "branch_name": "Main Branch",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 90,
        "pending_returns": 12,
        "status": "available"
      },
      {
        "item_id": 7,
        "title": "Projectors - Epson EB-X51",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Presentation Equipment",
        "available_stock": 1,
        "total_stock": 5,
        "borrowed_stock": 4,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 18000.0,
        "branch_name": "Main Branch",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 200,
        "pending_returns": 4,
        "status": "available"
      },
      {
        "item_id": 20,
        "title": "Webcams - Logitech C920",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 1,
        "total_stock": 6,
        "borrowed_stock": 5,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 2500.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 83.33,
        "days_since_last_restock": 60,
        "pending_returns": 5,
        "status": "available"
      },
      {
        "item_id": 33,
        "title": "TOEIC Preparation Books",
        "item_mode": "borrowable",
        "item_type": "book",
        "category": "Test Preparation",
        "available_stock": 2,
        "total_stock": 12,
        "borrowed_stock": 10,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 550.0,
        "branch_name": "Main Branch",
        "alert_level": "info",
        "utilization_rate": 83.33,
        "days_since_last_restock": 75,
        "pending_returns": 10,
        "status": "available"
      }
    ],
    "critical": [],
    "warning": [],
    "info": [
      {
        "item_id": 5,
        "title": "Programming Laptops - Dell XPS 15",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 2,
        "total_stock": 10,
        "borrowed_stock": 8,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 35000.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 120,
        "pending_returns": 8,
        "status": "available"
      },
      {
        "item_id": 12,
        "title": "English Grammar Textbooks - Advanced",
        "item_mode": "borrowable",
        "item_type": "book",
        "category": "Language Learning",
        "available_stock": 3,
        "total_stock": 15,
        "borrowed_stock": 12,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 450.0,
        "branch_name": "Main Branch",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 90,
        "pending_returns": 12,
        "status": "available"
      },
      {
        "item_id": 7,
        "title": "Projectors - Epson EB-X51",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Presentation Equipment",
        "available_stock": 1,
        "total_stock": 5,
        "borrowed_stock": 4,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 18000.0,
        "branch_name": "Main Branch",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 200,
        "pending_returns": 4,
        "status": "available"
      },
      {
        "item_id": 20,
        "title": "Webcams - Logitech C920",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 1,
        "total_stock": 6,
        "borrowed_stock": 5,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 2500.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 83.33,
        "days_since_last_restock": 60,
        "pending_returns": 5,
        "status": "available"
      },
      {
        "item_id": 33,
        "title": "TOEIC Preparation Books",
        "item_mode": "borrowable",
        "item_type": "book",
        "category": "Test Preparation",
        "available_stock": 2,
        "total_stock": 12,
        "borrowed_stock": 10,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 550.0,
        "branch_name": "Main Branch",
        "alert_level": "info",
        "utilization_rate": 83.33,
        "days_since_last_restock": 75,
        "pending_returns": 10,
        "status": "available"
      }
    ]
  },
  "summary": {
    "total_alerts": 5,
    "critical_count": 0,
    "warning_count": 0,
    "info_count": 5,
    "estimated_reorder_cost": 0.0
  },
  "filters": {
    "branch_id": "",
    "alert_type": "high_utilization"
  },
  "message": "Stock alerts retrieved successfully"
}
```

**Insights:**

- 📈 **High Demand Items**: All items have 80%+ utilization
- 💡 **Consider Action**:
  - **Laptops**: 8/10 borrowed - Consider buying 3-5 more units (฿105,000-175,000)
  - **Textbooks**: 12/15 borrowed - Popular item, consider +5 units (฿2,250)
  - **Projectors**: 4/5 borrowed - May need 2-3 more (฿36,000-54,000)
  - **Webcams**: 5/6 borrowed - Consider +3 units (฿7,500)
  - **TOEIC Books**: 10/12 borrowed - High demand, +5 units (฿2,750)
- 🔄 **Action**: If this utilization persists for 2+ weeks, increase stock

---

#### Example 5: Filter by Specific Branch

**Request:**

```http
GET /api/dashboard/borrow/stock-alerts?branch_id=2
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "all_alerts": [
      {
        "item_id": 23,
        "title": "A4 Copy Paper",
        "item_mode": "requisition",
        "item_type": "office_supply",
        "category": "Paper Products",
        "available_stock": 0,
        "total_stock": 500,
        "borrowed_stock": 0,
        "reorder_level": 100,
        "unit": "reams",
        "estimated_cost_per_unit": 85.0,
        "branch_name": "Tech Campus",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 12,
        "pending_returns": 0,
        "status": "available"
      },
      {
        "item_id": 5,
        "title": "Programming Laptops - Dell XPS 15",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 2,
        "total_stock": 10,
        "borrowed_stock": 8,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 35000.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 120,
        "pending_returns": 8,
        "status": "available"
      },
      {
        "item_id": 20,
        "title": "Webcams - Logitech C920",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 1,
        "total_stock": 6,
        "borrowed_stock": 5,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 2500.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 83.33,
        "days_since_last_restock": 60,
        "pending_returns": 5,
        "status": "available"
      }
    ],
    "critical": [
      {
        "item_id": 23,
        "title": "A4 Copy Paper",
        "item_mode": "requisition",
        "item_type": "office_supply",
        "category": "Paper Products",
        "available_stock": 0,
        "total_stock": 500,
        "borrowed_stock": 0,
        "reorder_level": 100,
        "unit": "reams",
        "estimated_cost_per_unit": 85.0,
        "branch_name": "Tech Campus",
        "alert_level": "critical",
        "utilization_rate": 100.0,
        "days_since_last_restock": 12,
        "pending_returns": 0,
        "status": "available"
      }
    ],
    "warning": [],
    "info": [
      {
        "item_id": 5,
        "title": "Programming Laptops - Dell XPS 15",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 2,
        "total_stock": 10,
        "borrowed_stock": 8,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 35000.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 80.0,
        "days_since_last_restock": 120,
        "pending_returns": 8,
        "status": "available"
      },
      {
        "item_id": 20,
        "title": "Webcams - Logitech C920",
        "item_mode": "borrowable",
        "item_type": "equipment",
        "category": "Electronics",
        "available_stock": 1,
        "total_stock": 6,
        "borrowed_stock": 5,
        "reorder_level": 0,
        "unit": "units",
        "estimated_cost_per_unit": 2500.0,
        "branch_name": "Tech Campus",
        "alert_level": "info",
        "utilization_rate": 83.33,
        "days_since_last_restock": 60,
        "pending_returns": 5,
        "status": "available"
      }
    ]
  },
  "summary": {
    "total_alerts": 3,
    "critical_count": 1,
    "warning_count": 0,
    "info_count": 2,
    "estimated_reorder_cost": 8500.0
  },
  "filters": {
    "branch_id": "2",
    "alert_type": ""
  },
  "message": "Stock alerts retrieved successfully"
}
```

**Branch-Specific Actions (Tech Campus):**

- 🚨 **Immediate**: Order 100 reams of A4 paper (฿8,500)
- 📊 **Monitor**: Laptops and webcams are heavily utilized
- 💡 **Consider**: Expanding tech equipment inventory if demand continues

---

#### Example 6: Empty Response (No Alerts)

**Request:**

```http
GET /api/dashboard/borrow/stock-alerts?branch_id=3
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "all_alerts": [],
    "critical": [],
    "warning": [],
    "info": []
  },
  "summary": {
    "total_alerts": 0,
    "critical_count": 0,
    "warning_count": 0,
    "info_count": 0,
    "estimated_reorder_cost": 0.0
  },
  "filters": {
    "branch_id": "3",
    "alert_type": ""
  },
  "message": "Stock alerts retrieved successfully"
}
```

**Status:**

- ✅ **All Good!** No stock issues at this branch
- 📦 All inventory levels are healthy
- 💚 No action required

---

### 🎯 Query Parameter Summary

| Parameter    | Values              | Description                                   |
| ------------ | ------------------- | --------------------------------------------- |
| `alert_type` | `all` (default)     | Show all alerts (critical + warning + info)   |
|              | `critical`          | Only out of stock items (available_stock = 0) |
|              | `low`               | Only items below reorder level (requisition)  |
|              | `high_utilization`  | Only heavily borrowed items (≥ 80% borrowed)  |
| `branch_id`  | `1`, `2`, `3`, etc. | Filter by specific branch                     |
|              | _(empty)_           | Show all branches                             |

### 📊 Understanding Alert Levels

```
🚨 CRITICAL (Red)
├─ Condition: available_stock = 0
├─ Impact: Cannot fulfill new requests
├─ Action: Order immediately (today)
└─ Priority: P0 - URGENT

⚠️ WARNING (Yellow)
├─ Condition: available_stock ≤ reorder_level
├─ Impact: Will run out soon (7-14 days)
├─ Action: Plan order within this week
└─ Priority: P1 - High

ℹ️ INFO (Blue)
├─ Condition: utilization_rate ≥ 80%
├─ Impact: High demand, limited availability
├─ Action: Monitor & consider increasing stock
└─ Priority: P2 - Medium
```

### 💰 Reorder Cost Calculation

The `estimated_reorder_cost` is automatically calculated:

```
For each alert where alert_level = 'critical' or 'warning':
  reorder_quantity = reorder_level - available_stock
  item_cost = reorder_quantity × estimated_cost_per_unit

total_estimated_reorder_cost = SUM(all item_costs)
```

**Example:**

- Blue Pens: (50 - 15) × ฿5 = ฿175
- Chalk: (10 - 8) × ฿35 = ฿70
- **Total**: ฿245

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

1. **Choose the correct item mode**

   - **Borrowable**: Items that MUST be returned (books, laptops, equipment)
   - **Requisition**: Consumable items that are permanently withdrawn (pens, paper, chalk)
   - Cannot change mode after creation - plan carefully!

2. **Always set realistic stock levels**

   - total_stock = physical items you own
   - available_stock ≤ total_stock
   - System prevents available > total

3. **Configure rules based on item mode**

   **For Borrowable Items:**

   - max_borrow_days: 7-30 days typical, or `null` for unlimited
   - renewable_count: 1-3 times typical, or `null` for unlimited renewals
   - late_fee_per_day: reasonable amount, or `0` for no late fees

   **For Requisition Items:**

   - unit: "piece", "pack", "box", "set", "ream", etc.
   - max_quantity_per_request: prevent excessive requests
   - reorder_level: set alert threshold (e.g., 20% of total stock)

4. **Use categories consistently**
   - Create a standard category list
   - Use same naming convention
   - Examples:
     - Borrowable: "Programming", "Fiction", "Lab Equipment", "Electronics"
     - Requisition: "Writing Tools", "Paper Products", "Office Supplies", "Teaching Materials"

#### Request Processing

1. **Review requests promptly**

   - Check within 24 hours
   - Provide clear review notes
   - Consider user history

2. **Approval criteria**

   - Verify user status (student/teacher/staff)
   - Check for existing overdue items (borrowing only)
   - Ensure stock availability
   - Verify purpose for requisitions (office use, teaching, etc.)
   - Check quantity reasonableness for requisitions

3. **Special considerations**

   **For Borrowing:**

   - Confirm return date is realistic
   - Consider item condition before lending
   - Note any existing damage

   **For Requisition:**

   - Verify purpose aligns with job role
   - Check if quantity exceeds max_quantity_per_request
   - Consider consumption rate vs. available stock
   - Document requisition for budget tracking

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

   - "Added new batch from supplier - 50 units"
   - "Found damaged during inventory check - removing 3 units"
   - "Lost item - reducing stock permanently"
   - "Annual inventory adjustment"
   - "Transferred to another branch"

2. **Different adjustment types**

   **For Borrowable Items:**

   - Adjust available_stock for temporary unavailability
   - Adjust total_stock for permanent changes (lost, damaged beyond repair)

   **For Requisition Items:**

   - Always adjust both total_stock and available_stock together
   - Items consumed are permanently gone
   - Use reorder_level to trigger purchase orders

3. **Audit logs are permanent**
   - Cannot be deleted
   - Include admin username
   - Track IP and timestamp

#### Inventory Management & Reorder Alerts

1. **Monitor low stock alerts daily**

   - Check dashboard `/low-stock` endpoint every morning
   - Requisition items below reorder_level need attention
   - Plan procurement based on consumption rate

2. **Set appropriate reorder levels**

   - Calculate: `reorder_level = (average_daily_consumption × lead_time_days) + safety_stock`
   - Example: If you use 10 pens/day, supplier takes 5 days, and you want 3 days safety:
     - `reorder_level = (10 × 5) + (10 × 3) = 80 pens`
   - Update quarterly based on actual usage

3. **Track consumption patterns**

   - Use dashboard `/overview` to see monthly requisition stats
   - Compare `requisitioned_this_month` across periods
   - Identify seasonal trends (e.g., start of term = more requisitions)
   - Adjust reorder_level accordingly

4. **Budget planning**

   - Use `estimated_cost_per_unit` × quantity for budget forecasts
   - Track requisition history for annual budget planning
   - Monitor top requisitioned items
   - Consider bulk purchasing for cost savings

5. **Preventive actions**

   - When low stock alert appears:
     - Check pending requisitions for that item
     - Review typical consumption rate
     - Place order before stockout
     - Consider temporary max_quantity_per_request reduction if critical
   - Update item description with last order date
   - Note preferred suppliers in item notes

6. **Emergency procedures**
   - If item runs out: Set status to "unavailable" temporarily
   - Reject pending requests with explanation
   - Notify users of expected restock date
   - Consider emergency procurement if critical
   - Record before/after values

### For Users

#### Submitting Requests

1. **Choose the right request type**

   - **Borrowing**: For items you will return (books, equipment)
   - **Requisition**: For items you will consume/keep (pens, paper)
   - Check item mode before requesting

2. **Check availability first**

   - Use search/filter to find items
   - Verify available_stock > 0
   - Read item description carefully
   - Check unit size for requisition items (piece, pack, box)

3. **Plan pickup dates realistically**

   - Admins may approve within 1-2 days
   - Pick up within scheduled date
   - System auto-cancels after 3 days

4. **Provide clear request notes**
   - State your purpose clearly
   - **Borrowing**: Mention course/project name
   - **Requisition**: Specify intended use (office, teaching, classroom)
   - Request reasonable quantities

#### During Borrowing (Borrowable Items Only)

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

#### For Requisition Items

1. **Use responsibly**

   - Request only what you need
   - Items are permanently consumed
   - Consider office/teaching budget

2. **Pickup promptly**

   - Pick up on scheduled date
   - Items already deducted from stock
   - Unclaimed items may be returned to stock

3. **Track your consumption**
   - View history in `/my-requisitions`
   - Monitor your usage patterns
   - Be mindful of frequent requests

#### Avoiding Fees (Borrowing Only)

1. **Late fees**

   - Return before due_date
   - Renew in advance if needed
   - late_fee = days_late × late_fee_per_day

2. **Damage fees**
   - Handle items carefully
   - Store properly
   - Admin determines damage_fee

**Note**: Requisition items have no fees (no return required)

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

## 📋 Quick Reference Guide (For End Users)

### What Can I Do?

#### 🔄 Borrow Items (Must Return)

**Examples**: Books, Laptops, Projectors, Cameras

**Steps:**

1. Browse available items → Filter by `mode=borrowable`
2. Submit borrow request → Set return date
3. Wait for admin approval (1-2 days)
4. Pick up item on scheduled date
5. Use item responsibly
6. **Return on time** to avoid late fees
7. Can renew if needed (check renewal limit)

**Important:**

- ⏰ Return before due date
- 💰 Late fees apply after due date
- 🔄 Can renew (if allowed)
- 📝 Condition checked on return

---

#### 📦 Requisition Items (Keep Forever)

**Examples**: Pens, Paper, Chalk, Notebooks, Markers

**Steps:**

1. Browse requisition items → Filter by `mode=requisition`
2. Submit requisition request → Specify quantity & purpose
3. Wait for admin approval (1-2 days)
4. Pick up items on scheduled date
5. **Items are yours to keep** (no return needed)

**Important:**

- ✅ No return required
- ❌ No late fees
- 📊 Request reasonable quantities
- 💼 Specify purpose (office/teaching/classroom use)

---

### Comparison Chart

| Feature            | Borrowing 🔄              | Requisition 📦        |
| ------------------ | ------------------------- | --------------------- |
| **Items**          | Books, Equipment, Laptops | Pens, Paper, Supplies |
| **Return?**        | ✅ YES - Must return      | ❌ NO - Keep forever  |
| **Due Date?**      | ✅ YES                    | ❌ NO                 |
| **Late Fees?**     | ✅ YES (if overdue)       | ❌ NO                 |
| **Can Renew?**     | ✅ YES (if allowed)       | ❌ N/A                |
| **Purpose**        | Temporary use             | Permanent consumption |
| **Typical Period** | 7-30 days                 | N/A                   |

---

### Common Questions

**Q: How do I know if an item is borrowable or requisition?**
A: Check the `item_mode` field. You can also filter items by mode when browsing.

**Q: Can I borrow pens or paper?**
A: No, stationery items are requisition-only (permanent withdrawal). Use requisition request instead.

**Q: What happens if I'm late returning a borrowed item?**
A: Late fees apply based on `late_fee_per_day` × number of days late. System sends reminders before due date.

**Q: Can I request more than the max quantity for requisition items?**
A: No, each item has `max_quantity_per_request` limit. Submit multiple requests if needed, with clear justification.

**Q: Do I need approval for both types?**
A: Yes, both borrowing and requisition requests require admin approval (if `requires_approval = true`).

**Q: Can I cancel my request?**
A: Yes, you can cancel pending requests. Once approved, contact admin for cancellation.

**Q: What if I don't pick up on time?**
A: Requests are auto-cancelled 3 days after scheduled pickup date. You'll need to submit a new request.

**Q: Can I see my history?**
A: Yes:

- Borrowing: `/my-borrows`
- Requisition: `/my-requisitions`
- All requests: `/my-requests`

---

### Tips for Success

#### For Borrowing:

✅ **DO:**

- Return on time
- Renew early if needed
- Report damage immediately
- Handle with care

❌ **DON'T:**

- Forget due dates
- Lend to others
- Return damaged items without notice
- Ignore reminder notifications

#### For Requisition:

✅ **DO:**

- Request only what you need
- Specify clear purpose
- Pick up promptly
- Use responsibly

❌ **DON'T:**

- Request excessive quantities
- Hoard supplies
- Miss pickup dates
- Make frivolous requests

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
  "data": {
    /* result */
  }
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
  "data": [
    /* items */
  ],
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
    "type": "notification_type"
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
    "late_fee": 30.0
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
    "total_fee": 50.0,
    "late_fee": 30.0,
    "damage_fee": 20.0,
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
const ws = new WebSocket("ws://your-domain.com/ws");

ws.onopen = () => {
  console.log("WebSocket connected");
  // Send authentication token
  ws.send(
    JSON.stringify({
      type: "auth",
      token: localStorage.getItem("jwt_token"),
    })
  );
};

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);

  // Check if it's a borrowing system notification
  if (notification.data?.type?.startsWith("borrow_")) {
    handleBorrowingNotification(notification);
  }

  // Show popup for popup channel
  if (notification.channels.includes("popup")) {
    showPopupNotification(notification);
  }

  // Add to notification list for normal channel
  if (notification.channels.includes("normal")) {
    addToNotificationList(notification);
  }
};

function handleBorrowingNotification(notification) {
  const { type, ...data } = notification.data;

  switch (type) {
    case "borrow_request_approved":
      // Navigate to transaction page
      showNotification({
        title: notification.title,
        message: notification.message,
        type: "success",
        action: () => router.push(`/transactions/${data.transaction_id}`),
      });
      break;

    case "borrow_overdue":
      // Show urgent alert
      showUrgentAlert({
        title: notification.title,
        message: notification.message,
        daysOverdue: data.days_overdue,
        lateFee: data.late_fee,
      });
      break;

    case "borrow_fees_due":
      // Show payment prompt
      showPaymentPrompt({
        transactionId: data.transaction_id,
        totalFee: data.total_fee,
        breakdown: {
          late: data.late_fee,
          damage: data.damage_fee,
        },
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
const ws = new WebSocket("ws://localhost:3000/ws");

// 2. Authenticate
ws.onopen = () => {
  ws.send(
    JSON.stringify({
      type: "auth",
      token: "your_jwt_token_here",
    })
  );
};

// 3. Listen for messages
ws.onmessage = (event) => {
  console.log("Received:", JSON.parse(event.data));
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

### Version 1.3.0 - October 16, 2025

**🚀 NEW FEATURES: Enhanced Dashboard & Reorder Alerts**

**Major Changes:**

- **Dashboard Separated Metrics**: Overview now shows borrowing and requisition separately
  - `borrowing` object: currently_borrowed, overdue_count, pending_requests, monthly stats
  - `requisition` object: approved_waiting_pickup, pending_requests, monthly requisitions
  - `inventory` object: total_items, borrowable_items, requisition_items, low_stock_alerts
- **Low Stock Alerts**: New endpoint for reorder notifications
  - Tracks requisition items below `reorder_level`
  - Includes estimated costs and unit information
  - Branch-specific filtering
- **Requisition Controllers**: Complete CRUD for requisition management
  - User endpoints: GetMyRequisitions, GetRequisitionDetail
  - Admin endpoints: GetAllRequisitions, CompleteRequisitionPickup, CancelRequisition
- **Stock Restoration**: Cancel requisition returns stock to inventory (both available + total)

**New Endpoints:**

- `GET /borrowing/my-requisitions` - User's requisition history (with status filter)
- `GET /borrowing/requisitions/:id` - Requisition detail (user can see own, admin sees all)
- `GET /borrowing/requisitions` - Admin view all requisitions (with filters)
- `POST /borrowing/requisitions/:id/complete` - Admin marks item as picked up
- `DELETE /borrowing/requisitions/:id/cancel` - Admin cancels and restores stock
- `GET /dashboard/borrow/low-stock` - ⚠️ Items needing reorder

**Dashboard Response Changes:**

```json
{
  "inventory": {
    "total_items": 150,
    "borrowable_items": 100, // NEW
    "requisition_items": 50, // NEW
    "low_stock_alerts": 5 // NEW - Items below reorder level
  },
  "borrowing": {
    // SEPARATED from requisition
    "currently_borrowed": 20,
    "overdue_count": 3,
    "pending_requests": 5,
    "borrowed_this_month": 45,
    "returned_this_month": 38
  },
  "requisition": {
    // NEW OBJECT
    "approved_waiting_pickup": 8,
    "pending_requests": 3,
    "requisitioned_this_month": 25
  }
}
```

**Requisition Status Flow:**

1. `pending` → User creates request
2. `approved` → Admin approves (stock reduced permanently)
3. `picked_up` → Admin confirms pickup
4. `cancelled` → Admin cancels (stock restored)

**Technical Details:**

- Import path fixed: `englishkorat_go/` (not `englishkorat/`)
- All controllers use proper error handling
- Branch filtering supported in all requisition endpoints
- Audit logging integrated for all actions

**Breaking Changes:**

- Dashboard `/overview` response structure changed (added `borrowing` and `requisition` objects)
- Clients should update to handle new response format

---

### Version 1.2.0 - October 16, 2025

**🎉 NEW FEATURE: Requisition System (Permanent Withdrawal)**

**Major Changes:**

- **Dual-Mode System**: Items can now be either "borrowable" (returnable) or "requisition" (permanent withdrawal)
- **New Item Mode Field**: `item_mode` - "borrowable" or "requisition"
- **Requisition Items**: For consumable items like pens, paper, chalk, office supplies
- **Request Type**: `request_type` field added - "borrowing" or "requisition"
- **New Item Types**: Added "stationery", "office_supply" to item types
- **Requisition-Specific Fields**:
  - `unit` - piece, pack, box, set, etc.
  - `max_quantity_per_request` - limit per request
  - `reorder_level` - low stock alert threshold
- **New Transaction Type**: `RequisitionTransaction` for tracking permanent withdrawals
- **Dashboard Updates**: Separated metrics for borrowing vs. requisition
- **Stock Management**:
  - Borrowing: Temporary stock reduction (available_stock only)
  - Requisition: Permanent reduction (both available_stock AND total_stock)

**New Endpoints:**

- `GET /my-requisitions` - User's requisition history
- `GET /requisitions/:id` - Requisition detail
- `GET /requisitions` - Admin view all requisitions
- `POST /requisitions/:id/complete` - Mark as picked up

**API Changes:**

- All `/requests` endpoints now support both types via `request_type` parameter
- Query parameter `?request_type=borrowing|requisition|all` added
- Query parameter `?mode=borrowable|requisition` added to `/items`

**Documentation Updates:**

- Added "System Overview" section with comparison table
- Added "Requisition Workflow" diagram
- Added "Quick Reference Guide" for end users
- Expanded examples for both borrowing and requisition
- Updated best practices for both modes
- Added common questions and tips

**Breaking Changes:**

- None - fully backward compatible
- Existing items default to `item_mode: "borrowable"`
- Existing requests default to `request_type: "borrowing"`

**Use Cases:**

```json
// Borrowable Item (Equipment)
{
  "item_mode": "borrowable",
  "title": "Laptop",
  "max_borrow_days": 7,
  "renewable_count": 2
}

// Requisition Item (Stationery)
{
  "item_mode": "requisition",
  "title": "Blue Pen",
  "unit": "piece",
  "max_quantity_per_request": 10,
  "reorder_level": 50
}
```

---

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

---

**Version**: 1.2.0
**Last Updated**: October 16, 2025
**Author**: English Korat Development Team
**Document Purpose**: Technical & User Reference Documentation
