// Item Modes
export type ItemMode = "borrowable" | "requisition";

// Item Types
export type ItemType =
  | "book"
  | "equipment"
  | "material"
  | "stationery"
  | "office_supply"
  | "other";

export type ItemStatus = "available" | "unavailable" | "discontinued";

// Request Types
export type RequestType = "borrowing" | "requisition";
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

// Transaction Status
export type TransactionStatus =
  | "borrowed"
  | "returned"
  | "overdue"
  | "lost"
  | "damaged";

// Requisition Status
export type RequisitionStatus = "approved" | "picked_up" | "cancelled";

// Item Condition
export type ItemCondition =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "damaged"
  | "lost";

// Unit Types for Requisition
export type UnitType =
  | "piece"
  | "pack"
  | "box"
  | "set"
  | "ream"
  | "dozen"
  | "other";

export interface BorrowableItem {
  id: number;
  branch_id: number;

  // Mode: borrowable or requisition
  item_mode: ItemMode;

  item_type: ItemType;
  category: string;
  title: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  published_year?: number;
  description?: string;
  cover_image_url?: string;
  pdf_file_url?: string;

  // Inventory
  total_stock: number;
  available_stock: number;

  // ===== BORROWABLE MODE ONLY =====
  max_borrow_days?: number | null; // null = unlimited days
  renewable_count?: number | null; // null = unlimited renewals
  late_fee_per_day?: number; // can be 0 for no late fee

  // ===== REQUISITION MODE ONLY =====
  unit?: UnitType; // piece, pack, box, set, etc.
  max_quantity_per_request?: number | null; // null = unlimited
  reorder_level?: number; // alert when stock below this

  // Common
  requires_approval: boolean;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface BorrowRequest {
  id: number;
  user_id: number;
  item_id: number;
  quantity: number;

  // Type: borrowing or requisition
  request_type: RequestType;
  status: RequestStatus;

  // Pickup & Return
  scheduled_pickup_date: string;
  scheduled_return_date?: string; // null for requisition

  // Review Information
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;

  // User Notes
  request_notes?: string;
  purpose?: string; // For requisition: purpose/usage

  created_at: string;
  updated_at: string;

  // Preloaded relationships
  item?: BorrowableItem;
  user?: {
    id: number;
    username: string;
    email?: string;
    avatar?: string;
    student?: {
      first_name: string;
      last_name: string;
      nickname: string;
    };
  };
  reviewed_by_user?: {
    id: number;
    username: string;
  };
}

// Borrowing Transaction (Returnable Items)
export interface BorrowTransaction {
  id: number;
  request_id: number;
  item_id: number;
  user_id: number;
  quantity: number;
  status: TransactionStatus;

  borrowed_date: string;
  due_date: string;
  returned_date?: string;
  extended_until?: string;
  renewal_count: number;

  checked_out_by?: number;
  checked_in_by?: number;

  condition_on_borrow: ItemCondition;
  condition_on_return?: ItemCondition;

  late_days: number;
  late_fee: number;
  damage_fee: number;
  total_fee: number;
  fee_paid: boolean;

  borrow_notes?: string;
  return_notes?: string;

  created_at: string;
  updated_at: string;

  // Preloaded relationships
  item?: BorrowableItem;
  user?: {
    id: number;
    username: string;
    email?: string;
    avatar?: string;
    student?: {
      first_name: string;
      last_name: string;
      nickname: string;
    };
  };
  request?: BorrowRequest;
}

// Requisition Transaction (Permanent Withdrawal)
export interface RequisitionTransaction {
  id: number;
  request_id: number;
  item_id: number;
  user_id: number;
  quantity: number;
  status: RequisitionStatus; // approved, picked_up, cancelled

  // Pickup Information
  approved_date: string;
  pickup_date?: string; // When actually picked up
  scheduled_pickup_date: string;

  // Admin Tracking
  approved_by: number;
  confirmed_by?: number; // Admin who confirmed pickup

  // Purpose & Usage
  purpose?: string;
  notes?: string;

  created_at: string;
  updated_at: string;

  // Preloaded relationships
  item?: BorrowableItem;
  user?: {
    id: number;
    username: string;
    email?: string;
    avatar?: string;
    student?: {
      first_name: string;
      last_name: string;
      nickname: string;
    };
  };
  request?: BorrowRequest;
  approved_by_user?: {
    id: number;
    username: string;
  };
  confirmed_by_user?: {
    id: number;
    username: string;
  };
}

export interface BorrowAuditLog {
  id: number;
  item_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  performed_by: number;
  performed_at: string;

  old_value?: string;
  new_value?: string;
  change_type?: string;
  reason?: string;

  stock_before?: number;
  stock_after?: number;
  stock_delta?: number;

  ip_address?: string;
  user_agent?: string;

  // Preloaded
  item?: BorrowableItem;
  user?: {
    id: number;
    username: string;
  };
}

// Dashboard Types
export interface BorrowDashboardOverview {
  inventory: {
    total_items: number;
    borrowable_items: number;
    requisition_items: number;
    total_stock: number;
    available_stock: number;
    borrowed_stock: number;
  };
  borrowing: {
    currently_borrowed: number;
    overdue_count: number;
    pending_requests: number;
    this_month: {
      borrowed: number;
      returned: number;
    };
  };
  requisition: {
    pending_requests: number;
    this_month: {
      approved: number;
      total_quantity: number;
      items_consumed: number;
    };
    low_stock_items: number;
  };
  fees: {
    total_collected: number;
    outstanding_fees: number;
  };
}

export interface BorrowTrend {
  date: string;
  borrowed: number;
  returned: number;
  new_requests: number;
  overdue: number;
}

export interface TopItem {
  item_id: number;
  title: string;
  category: string;
  borrow_count: number;
  item?: BorrowableItem;
}

export interface TopBorrower {
  user_id: number;
  username: string;
  borrow_count: number;
  user?: {
    id: number;
    username: string;
    avatar?: string;
    student?: {
      first_name: string;
      last_name: string;
      nickname: string;
    };
  };
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

// Request/Response Types
export interface CreateItemRequest {
  branch_id: number;
  item_mode: ItemMode; // borrowable or requisition
  item_type: ItemType;
  category: string;
  title: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  published_year?: number;
  description?: string;
  total_stock: number;
  available_stock: number;

  // Borrowable Mode Fields
  max_borrow_days?: number | null; // null = unlimited days
  renewable_count?: number | null; // null = unlimited renewals
  late_fee_per_day?: number; // can be 0 for no late fee

  // Requisition Mode Fields
  unit?: UnitType;
  max_quantity_per_request?: number | null;
  reorder_level?: number;

  requires_approval?: boolean;
}

export type UpdateItemRequest = Partial<CreateItemRequest>;

export interface CreateBorrowRequestRequest {
  item_id: number;
  quantity: number;
  request_type: RequestType; // "borrowing" or "requisition"
  scheduled_pickup_date: string;
  scheduled_return_date?: string; // required for borrowing, null for requisition
  request_notes?: string;
  purpose?: string; // for requisition
}

export interface ApproveBorrowRequest {
  review_notes?: string;
}

export interface RejectBorrowRequest {
  review_notes: string;
}

export interface CheckInRequest {
  condition_on_return: ItemCondition;
  damage_fee?: number;
  return_notes?: string;
}

export interface RecordPaymentRequest {
  amount: number;
  payment_method?: string;
  payment_notes?: string;
}

export interface RenewBorrowRequest {
  reason?: string;
}

export interface AdjustStockRequest {
  total_stock?: number;
  available_stock?: number;
  reason: string;
}

export interface CompleteRequisitionRequest {
  notes?: string;
}

export type AlertLevel = "critical" | "warning" | "info";

export interface StockAlert {
  item_id: number;
  title: string;
  item_mode: ItemMode;
  item_type: ItemType;
  category: string;
  available_stock: number;
  total_stock: number;
  borrowed_stock: number;
  reorder_level: number;
  unit: string;
  estimated_cost_per_unit?: number;
  branch_name?: string;
  alert_level: AlertLevel;
  utilization_rate: number;
  days_since_last_restock?: number;
  pending_returns: number;
  status: ItemStatus;
}

export interface StockAlertSummary {
  total_alerts: number;
  critical_count: number;
  warning_count: number;
  info_count: number;
  estimated_reorder_cost: number;
}

export interface StockAlertsResponse {
  all_alerts: StockAlert[];
  critical: StockAlert[];
  warning: StockAlert[];
  info: StockAlert[];
}

export interface StockAlertsFilters {
  branch_id?: number;
  alert_type?: "all" | "critical" | "warning" | "info" | "high_utilization";
}

// Filter Types
export interface ItemFilters {
  branch_id?: number;
  item_mode?: ItemMode; // filter by borrowable or requisition
  item_type?: ItemType;
  category?: string;
  status?: ItemStatus;
  search?: string;
  available_only?: boolean;
}

export interface RequestFilters {
  request_type?: RequestType | "all"; // borrowing, requisition, or all
  status?: RequestStatus;
  user_id?: number;
  item_id?: number;
  branch_id?: number;
}

export interface RequisitionFilters {
  status?: RequisitionStatus;
  user_id?: number;
  item_id?: number;
  branch_id?: number;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  user_id?: number;
  item_id?: number;
  branch_id?: number;
  overdue_only?: boolean;
}
