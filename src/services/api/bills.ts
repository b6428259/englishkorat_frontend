import { api } from './base';
import { API_ENDPOINTS } from './endpoints';

// Enums for bill-related fields
export type BillSource = 'wave' | 'manual';
export type BillType = 'normal' | 'deposit' | 'installment' | 'payment' | 'adjustment';
export type BillStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid';
export type PaymentMethod = 'cash' | 'debit_card' | 'credit_card' | 'transfer' | 'other' | 'unknown';

// Core Bill interface based on the documentation
export interface Bill {
  id?: number;
  source: BillSource;
  transaction_id: string;
  source_transaction_id?: string;
  row_uid: string;
  transaction_date: string;
  bill_type: BillType;
  installment_no?: number;
  total_installments?: number;
  
  // Wave columns
  account_name?: string;
  transaction_description?: string;
  transaction_line_description?: string;
  amount?: number;
  debit_amount?: number;
  credit_amount?: number;
  other_account?: string;
  customer?: string;
  invoice_number?: string;
  notes_memo?: string;
  amount_before_sales_tax?: number;
  sales_tax_amount?: number;
  sales_tax_name?: string;
  transaction_date_added?: string;
  transaction_date_last_modified?: string;
  account_group?: string;
  account_type?: string;
  account_id?: string;
  
  // Derived fields
  payment_method: PaymentMethod;
  currency?: string;
  status: BillStatus;
  due_date?: string;
  paid_date?: string;
  
  // System fields
  raw?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

// Request/Response interfaces
export interface BillListParams {
  page?: number;
  page_size?: number;
  invoice?: string;
  transaction_id?: string;
  bill_type?: BillType;
  customer?: string;
  account?: string;
  date_from?: string; // YYYY-MM-DD format
  date_to?: string; // YYYY-MM-DD format
  status?: BillStatus;
}

export interface BillListResponse {
  bills: Bill[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BillLine {
  account_name: string;
  description: string;
  amount: number;
  notes?: string;
}

export interface CreateBillRequest {
  invoice_number: string;
  transaction_date: string; // YYYY-MM-DD format
  bill_type?: BillType;
  installment_no?: number;
  total_installments?: number;
  transaction_id?: string;
  customer?: string;
  currency?: string;
  lines: BillLine[];
}

export interface CreateBillResponse {
  success: boolean;
  transaction_id: string;
  message?: string;
}

export interface UpdateBillRequest {
  status?: BillStatus;
  due_date?: string; // YYYY-MM-DD format
  paid_date?: string; // YYYY-MM-DD format
  notes_memo?: string;
  bill_type?: BillType;
  installment_no?: number;
  total_installments?: number;
}

export interface ImportBillsResponse {
  success: boolean;
  file_name: string;
  data_rows: number;
  inserted: number;
  skipped: number;
  duplicates: number;
  errors_count: number;
  errors: string[];
}

// Bills API service
export const billsApi = {
  /**
   * Get list of bills with filtering and pagination
   */
  getBills: async (params?: BillListParams): Promise<BillListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = queryParams.toString() 
      ? `${API_ENDPOINTS.BILLS.LIST}?${queryParams}`
      : API_ENDPOINTS.BILLS.LIST;
      
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get a specific bill by ID
   */
  getBillById: async (id: string): Promise<Bill> => {
    const response = await api.get(API_ENDPOINTS.BILLS.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Get all bills for a specific transaction ID
   */
  getBillsByTransaction: async (transactionId: string): Promise<Bill[]> => {
    const response = await api.get(API_ENDPOINTS.BILLS.BY_TRANSACTION(transactionId));
    return response.data;
  },

  /**
   * Get all bills for a specific invoice number
   */
  getBillsByInvoice: async (invoice: string): Promise<Bill[]> => {
    const response = await api.get(API_ENDPOINTS.BILLS.BY_INVOICE(invoice));
    return response.data;
  },

  /**
   * Create a new manual bill
   */
  createBill: async (billData: CreateBillRequest): Promise<CreateBillResponse> => {
    const response = await api.post(API_ENDPOINTS.BILLS.CREATE, billData);
    return response.data;
  },

  /**
   * Update an existing bill
   */
  updateBill: async (id: string, updateData: UpdateBillRequest): Promise<Bill> => {
    const response = await api.patch(API_ENDPOINTS.BILLS.UPDATE(id), updateData);
    return response.data;
  },

  /**
   * Delete a bill (soft delete)
   */
  deleteBill: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.BILLS.DELETE(id));
  },

  /**
   * Import bills from Wave CSV/XLSX file
   */
  importBills: async (file: File): Promise<ImportBillsResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(API_ENDPOINTS.BILLS.IMPORT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

// Helper functions for formatting and validation
export const formatBillAmount = (amount: number | undefined, currency = 'THB'): string => {
  if (amount === undefined || amount === null) return '-';
  
  const formatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

export const getBillStatusColor = (status: BillStatus): string => {
  const colors: Record<BillStatus, string> = {
    'Paid': 'bg-green-100 text-green-800',
    'Unpaid': 'bg-gray-200 text-gray-700',
    'Overdue': 'bg-red-100 text-red-800',
    'Partially Paid': 'bg-yellow-100 text-yellow-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-500';
};

export const isValidBillStatus = (status: string): status is BillStatus => {
  return ['Paid', 'Unpaid', 'Overdue', 'Partially Paid'].includes(status);
};

export const isValidBillType = (type: string): type is BillType => {
  return ['normal', 'deposit', 'installment', 'payment', 'adjustment'].includes(type);
};

// Calculate due amount based on total and paid amounts
export const calculateDueAmount = (bill: Bill): number => {
  const total = bill.amount || 0;
  if (bill.status === 'Paid') return 0;
  if (bill.status === 'Partially Paid') {
    // This would need to be calculated based on payment records
    // For now, we'll use a simple calculation
    return total * 0.5; // Placeholder - should be actual remaining amount
  }
  return total;
};