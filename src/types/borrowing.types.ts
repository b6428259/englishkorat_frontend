export type ItemType = "book" | "equipment" | "material" | "other";
export type ItemStatus = "available" | "unavailable";
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";
export type TransactionStatus =
  | "borrowed"
  | "returned"
  | "overdue"
  | "lost"
  | "damaged";
export type ItemCondition =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "damaged"
  | "lost";

export interface BorrowableItem {
  id: number;
  branch_id: number;
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

  // Borrowing Rules
  max_borrow_days: number | null; // null = unlimited days
  renewable_count: number | null; // null = unlimited renewals
  late_fee_per_day: number; // can be 0 for no late fee
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
  status: RequestStatus;

  scheduled_pickup_date: string;
  scheduled_return_date: string;

  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  request_notes?: string;

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
    total_stock: number;
    available_stock: number;
    borrowed_stock: number;
  };
  transactions: {
    currently_borrowed: number;
    overdue_count: number;
    pending_requests: number;
  };
  fees: {
    total_collected: number;
    outstanding_fees: number;
  };
  this_month: {
    borrowed: number;
    returned: number;
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
  max_borrow_days: number | null; // null = unlimited days
  renewable_count: number | null; // null = unlimited renewals
  late_fee_per_day: number; // can be 0 for no late fee
  requires_approval?: boolean;
}

export type UpdateItemRequest = Partial<CreateItemRequest>;

export interface CreateBorrowRequestRequest {
  item_id: number;
  quantity: number;
  scheduled_pickup_date: string;
  scheduled_return_date: string;
  request_notes?: string;
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

// Filter Types
export interface ItemFilters {
  branch_id?: number;
  item_type?: ItemType;
  category?: string;
  status?: ItemStatus;
  search?: string;
  available_only?: boolean;
}

export interface RequestFilters {
  status?: RequestStatus;
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
