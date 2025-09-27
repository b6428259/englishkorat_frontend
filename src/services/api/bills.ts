import { api } from "./base";
import { API_ENDPOINTS } from "./endpoints";

// Enums for bill-related fields
export type BillSource = "wave" | "manual";
export type BillType =
  | "normal"
  | "deposit"
  | "installment"
  | "payment"
  | "adjustment";
export type BillStatus = "Paid" | "Unpaid" | "Overdue" | "Partially Paid";
export type PaymentMethod =
  | "cash"
  | "debit_card"
  | "credit_card"
  | "transfer"
  | "other"
  | "unknown";

// Core Bill interface based on the documentation
export interface Bill {
  id?: number;
  source?: BillSource | string | null;
  transaction_id?: string | null;
  source_transaction_id?: string | null;
  row_uid?: string;
  transaction_date?: string | null;
  bill_type?: BillType | string | null;
  installment_no?: number | null;
  total_installments?: number | null;

  // Wave columns
  account_name?: string | null;
  transaction_description?: string | null;
  transaction_line_description?: string | null;
  amount?: number | null;
  debit_amount?: number | null;
  credit_amount?: number | null;
  other_account?: string | null;
  customer?: string | null;
  invoice_number?: string | null;
  notes_memo?: string | null;
  amount_before_sales_tax?: number | null;
  sales_tax_amount?: number | null;
  sales_tax_name?: string | null;
  transaction_date_added?: string | null;
  transaction_date_last_modified?: string | null;
  account_group?: string | null;
  account_type?: string | null;
  account_id?: string | null;

  // Derived fields
  payment_method?: PaymentMethod | string | null;
  currency?: string | null;
  status?: string | null;
  due_date?: string | null;
  paid_date?: string | null;

  // System fields
  raw?: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
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
  success: boolean;
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

interface BillApiItem {
  id?: number | null;
  source?: string | null;
  transaction_id?: string | null;
  source_transaction_id?: string | null;
  row_uid?: string | null;
  transaction_date?: string | null;
  bill_type?: string | null;
  installment_no?: number | null;
  total_installments?: number | null;
  account_name?: string | null;
  transaction_description?: string | null;
  transaction_line_description?: string | null;
  amount?: number | string | null;
  debit_amount?: number | string | null;
  credit_amount?: number | string | null;
  other_account?: string | null;
  customer?: string | null;
  invoice_number?: string | null;
  notes_memo?: string | null;
  amount_before_sales_tax?: number | string | null;
  sales_tax_amount?: number | string | null;
  sales_tax_name?: string | null;
  transaction_date_added?: string | null;
  transaction_date_last_modified?: string | null;
  account_group?: string | null;
  account_type?: string | null;
  account_id?: string | null;
  payment_method?: string | null;
  currency?: string | null;
  status?: string | null;
  due_date?: string | null;
  paid_date?: string | null;
  raw?: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

interface BillsApiListResponse {
  items?: BillApiItem[];
  bills?: BillApiItem[];
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  success?: boolean;
}

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const ensureRowUid = (bill: BillApiItem): string => {
  if (bill.row_uid && bill.row_uid.trim().length > 0) {
    return bill.row_uid;
  }
  const fallbackSource =
    bill.transaction_id ?? bill.invoice_number ?? bill.customer ?? bill.id;
  return `tmp-${fallbackSource ?? "bill"}`;
};

const normalizeBill = (bill: BillApiItem | Bill): Bill => {
  const amount = parseNumber((bill as BillApiItem).amount);
  const debitAmount = parseNumber((bill as BillApiItem).debit_amount);
  const creditAmount = parseNumber((bill as BillApiItem).credit_amount);
  const amountBeforeTax = parseNumber(
    (bill as BillApiItem).amount_before_sales_tax
  );
  const salesTaxAmount = parseNumber((bill as BillApiItem).sales_tax_amount);

  return {
    id: bill.id ?? undefined,
    source: bill.source ?? null,
    transaction_id: bill.transaction_id ?? null,
    source_transaction_id: bill.source_transaction_id ?? null,
    row_uid: ensureRowUid(bill as BillApiItem),
    transaction_date: bill.transaction_date ?? null,
    bill_type: bill.bill_type ?? null,
    installment_no: bill.installment_no ?? null,
    total_installments: bill.total_installments ?? null,
    account_name: bill.account_name ?? null,
    transaction_description: bill.transaction_description ?? null,
    transaction_line_description: bill.transaction_line_description ?? null,
    amount: amount ?? null,
    debit_amount: debitAmount ?? null,
    credit_amount: creditAmount ?? null,
    other_account: bill.other_account ?? null,
    customer: bill.customer ?? null,
    invoice_number: bill.invoice_number ?? null,
    notes_memo: bill.notes_memo ?? null,
    amount_before_sales_tax: amountBeforeTax ?? null,
    sales_tax_amount: salesTaxAmount ?? null,
    sales_tax_name: bill.sales_tax_name ?? null,
    transaction_date_added: bill.transaction_date_added ?? null,
    transaction_date_last_modified: bill.transaction_date_last_modified ?? null,
    account_group: bill.account_group ?? null,
    account_type: bill.account_type ?? null,
    account_id: bill.account_id ?? null,
    payment_method: bill.payment_method ?? null,
    currency: bill.currency ?? null,
    status: bill.status ?? null,
    due_date: bill.due_date ?? null,
    paid_date: bill.paid_date ?? null,
    raw: bill.raw,
    created_at: bill.created_at ?? null,
    updated_at: bill.updated_at ?? null,
    deleted_at: bill.deleted_at ?? null,
  };
};

const ensureBillsArray = (input: unknown): BillApiItem[] => {
  if (Array.isArray(input)) {
    return input as BillApiItem[];
  }
  if (input && typeof input === "object") {
    const maybeArray = Object.values(input);
    if (maybeArray.every((item) => typeof item === "object")) {
      return maybeArray as BillApiItem[];
    }
  }
  return [];
};

const computeTotalPages = (total?: number, pageSize?: number): number => {
  if (!pageSize || pageSize <= 0) {
    return total && total > 0 ? 1 : 0;
  }
  return Math.max(1, Math.ceil((total ?? 0) / pageSize));
};

const mapBillsListResponse = (
  data: BillsApiListResponse | BillListResponse | unknown,
  fallbackPageSize = 0
): BillListResponse => {
  if (!data || typeof data !== "object") {
    return {
      bills: [],
      total: 0,
      page: 1,
      page_size: fallbackPageSize || 0,
      total_pages: 0,
      success: false,
    };
  }

  if ((data as BillListResponse).bills) {
    const legacy = data as BillListResponse;
    return {
      bills: legacy.bills.map((bill) => normalizeBill(bill)),
      total: legacy.total,
      page: legacy.page,
      page_size: legacy.page_size,
      total_pages: legacy.total_pages,
      success: legacy.success ?? true,
    };
  }

  const raw = data as BillsApiListResponse;
  const items = ensureBillsArray(raw.items ?? raw.bills ?? []);
  const inferredPageSize =
    raw.page_size && raw.page_size > 0
      ? raw.page_size
      : fallbackPageSize > 0
      ? fallbackPageSize
      : items.length;
  const total = raw.total ?? items.length;
  const page = raw.page ?? 1;
  const success = raw.success ?? true;
  const totalPages =
    raw.total_pages ?? computeTotalPages(total, inferredPageSize);

  return {
    bills: items.map((bill) => normalizeBill(bill)),
    total,
    page,
    page_size: inferredPageSize,
    total_pages: totalPages,
    success,
  };
};

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
    return mapBillsListResponse(response.data, params?.page_size ?? 0);
  },

  /**
   * Get a specific bill by ID
   */
  getBillById: async (id: string): Promise<Bill> => {
    const response = await api.get(API_ENDPOINTS.BILLS.GET_BY_ID(id));
    const data = response.data;
    if (data && typeof data === "object" && "item" in data && data.item) {
      return normalizeBill((data as { item: BillApiItem }).item);
    }
    return normalizeBill(data as BillApiItem);
  },

  /**
   * Get all bills for a specific transaction ID
   */
  getBillsByTransaction: async (transactionId: string): Promise<Bill[]> => {
    const response = await api.get(
      API_ENDPOINTS.BILLS.BY_TRANSACTION(transactionId)
    );
    const data = response.data;
    const items = Array.isArray(data)
      ? data
      : ensureBillsArray(
          (data as BillsApiListResponse)?.items ??
            (data as BillsApiListResponse)?.bills
        );
    return items.map((bill) => normalizeBill(bill));
  },

  /**
   * Get all bills for a specific invoice number
   */
  getBillsByInvoice: async (invoice: string): Promise<Bill[]> => {
    const response = await api.get(API_ENDPOINTS.BILLS.BY_INVOICE(invoice));
    const data = response.data;
    const items = Array.isArray(data)
      ? data
      : ensureBillsArray(
          (data as BillsApiListResponse)?.items ??
            (data as BillsApiListResponse)?.bills
        );
    return items.map((bill) => normalizeBill(bill));
  },

  /**
   * Create a new manual bill
   */
  createBill: async (
    billData: CreateBillRequest
  ): Promise<CreateBillResponse> => {
    const response = await api.post(API_ENDPOINTS.BILLS.CREATE, billData);
    return response.data;
  },

  /**
   * Update an existing bill
   */
  updateBill: async (
    id: string,
    updateData: UpdateBillRequest
  ): Promise<Bill> => {
    const response = await api.patch(
      API_ENDPOINTS.BILLS.UPDATE(id),
      updateData
    );
    return normalizeBill(response.data as BillApiItem);
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
    formData.append("file", file);

    const response = await api.post(API_ENDPOINTS.BILLS.IMPORT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};

// Helper functions for formatting and validation
export const formatBillAmount = (
  amount: number | null | undefined,
  currency = "THB"
): string => {
  if (amount === undefined || amount === null || Number.isNaN(amount))
    return "-";

  const normalizeCurrencyCode = (code?: string | null): string | null => {
    if (!code) return null;
    const trimmed = code.trim();
    if (trimmed.length !== 3) return null;
    const upper = trimmed.toUpperCase();
    return /^[A-Z]{3}$/.test(upper) ? upper : null;
  };

  const resolvedCurrency = normalizeCurrencyCode(currency) ?? "THB";

  const createFormatter = (code: string): Intl.NumberFormat =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
    });

  try {
    const formatter = createFormatter(resolvedCurrency);
    return formatter.format(amount);
  } catch (error) {
    console.warn("formatBillAmount: invalid currency code", {
      provided: currency,
      resolvedCurrency,
      error,
    });

    try {
      const fallbackFormatter = createFormatter("THB");
      return fallbackFormatter.format(amount);
    } catch {
      return new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  }
};

export const getBillStatusColor = (status?: string | null): string => {
  const normalized = status?.toLowerCase();
  switch (normalized) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    case "partially paid":
      return "bg-yellow-100 text-yellow-800";
    case "unpaid":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

export const isValidBillStatus = (status: string): boolean => {
  const normalized = status.trim().toLowerCase();
  return ["paid", "unpaid", "overdue", "partially paid"].includes(normalized);
};

export const isValidBillType = (type: string): boolean => {
  const normalized = type.trim().toLowerCase();
  return ["normal", "deposit", "installment", "payment", "adjustment"].includes(
    normalized
  );
};

// Calculate due amount based on total and paid amounts
export const calculateDueAmount = (bill: Bill): number => {
  const total = bill.amount ?? 0;
  const status = bill.status?.toLowerCase();
  if (status === "paid") return 0;
  if (status === "partially paid") {
    // This would need to be calculated based on payment records
    // For now, we'll use a simple calculation
    return total * 0.5; // Placeholder - should be actual remaining amount
  }
  return total;
};
