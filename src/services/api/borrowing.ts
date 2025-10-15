import type {
  AdjustStockRequest,
  ApproveBorrowRequest,
  BorrowableItem,
  BorrowAuditLog,
  BorrowDashboardOverview,
  BorrowRequest,
  BorrowTransaction,
  BorrowTrend,
  CategoryDistribution,
  CheckInRequest,
  CreateBorrowRequestRequest,
  CreateItemRequest,
  ItemFilters,
  RecordPaymentRequest,
  RejectBorrowRequest,
  RenewBorrowRequest,
  RequestFilters,
  TopBorrower,
  TopItem,
  TransactionFilters,
  UpdateItemRequest,
} from "@/types/borrowing.types";
import api from "./base";

const BASE_PATH = "/borrowing";
const DASHBOARD_PATH = "/dashboard/borrow";

// Helper to build query string
const buildQueryString = (params: Record<string, unknown>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

// Items (Public/User Access)
export const getItems = async (filters?: ItemFilters) => {
  const queryString = filters
    ? buildQueryString(filters as Record<string, unknown>)
    : "";
  const response = await api.get<{
    success: boolean;
    data: BorrowableItem[];
    total: number;
  }>(`${BASE_PATH}/items${queryString}`);
  return response.data;
};

export const getItemById = async (id: number) => {
  const response = await api.get<{ success: boolean; data: BorrowableItem }>(
    `${BASE_PATH}/items/${id}`
  );
  return response.data;
};

// Requests (User)
export const createBorrowRequest = async (data: CreateBorrowRequestRequest) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: BorrowRequest;
  }>(`${BASE_PATH}/requests`, data);
  return response.data;
};

export const getMyRequests = async (filters?: RequestFilters) => {
  const queryString = filters
    ? buildQueryString(filters as Record<string, unknown>)
    : "";
  const response = await api.get<{
    success: boolean;
    data: BorrowRequest[];
    total: number;
  }>(`${BASE_PATH}/my-requests${queryString}`);
  return response.data;
};

export const cancelBorrowRequest = async (id: number) => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `${BASE_PATH}/requests/${id}/cancel`
  );
  return response.data;
};

// Borrows (User)
export const getMyBorrows = async (filters?: TransactionFilters) => {
  const queryString = filters
    ? buildQueryString(filters as Record<string, unknown>)
    : "";
  const response = await api.get<{
    success: boolean;
    data: BorrowTransaction[];
    total: number;
  }>(`${BASE_PATH}/my-borrows${queryString}`);
  return response.data;
};

export const renewBorrow = async (id: number, data?: RenewBorrowRequest) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: BorrowTransaction;
  }>(`${BASE_PATH}/borrows/${id}/renew`, data || {});
  return response.data;
};

export const getTransactionById = async (id: number) => {
  const response = await api.get<{ success: boolean; data: BorrowTransaction }>(
    `${BASE_PATH}/transactions/${id}`
  );
  return response.data;
};

// Items Management (Admin)
export const createItem = async (data: CreateItemRequest) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: BorrowableItem;
  }>(`${BASE_PATH}/items`, data);
  return response.data;
};

export const updateItem = async (id: number, data: UpdateItemRequest) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    data: BorrowableItem;
  }>(`${BASE_PATH}/items/${id}`, data);
  return response.data;
};

export const deleteItem = async (id: number) => {
  const response = await api.delete<{ success: boolean; message: string }>(
    `${BASE_PATH}/items/${id}`
  );
  return response.data;
};

export const uploadItemImage = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post<{
    success: boolean;
    message: string;
    image_url: string;
  }>(`${BASE_PATH}/items/${id}/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadItemPDF = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("pdf", file);
  const response = await api.post<{
    success: boolean;
    message: string;
    pdf_url: string;
  }>(`${BASE_PATH}/items/${id}/upload-pdf`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const adjustStock = async (id: number, data: AdjustStockRequest) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: BorrowableItem;
  }>(`${BASE_PATH}/items/${id}/adjust-stock`, data);
  return response.data;
};

// Request Workflow (Admin)
export const getAllRequests = async (filters?: RequestFilters) => {
  const queryString = filters
    ? buildQueryString(filters as Record<string, unknown>)
    : "";
  const response = await api.get<{
    success: boolean;
    data: BorrowRequest[];
    total: number;
  }>(`${BASE_PATH}/requests${queryString}`);
  return response.data;
};

export const approveBorrowRequest = async (
  id: number,
  data?: ApproveBorrowRequest
) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    data: BorrowRequest;
    transaction_id: number;
  }>(`${BASE_PATH}/requests/${id}/approve`, data || {});
  return response.data;
};

export const rejectBorrowRequest = async (
  id: number,
  data: RejectBorrowRequest
) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    data: BorrowRequest;
  }>(`${BASE_PATH}/requests/${id}/reject`, data);
  return response.data;
};

// Transaction Management (Admin)
export const getAllTransactions = async (filters?: TransactionFilters) => {
  const queryString = filters
    ? buildQueryString(filters as Record<string, unknown>)
    : "";
  const response = await api.get<{
    success: boolean;
    data: BorrowTransaction[];
    total: number;
  }>(`${BASE_PATH}/transactions${queryString}`);
  return response.data;
};

export const checkInBorrow = async (id: number, data: CheckInRequest) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: BorrowTransaction;
    fees: {
      late_days: number;
      late_fee: number;
      damage_fee: number;
      total_fee: number;
    };
  }>(`${BASE_PATH}/borrows/${id}/checkin`, data);
  return response.data;
};

export const recordPayment = async (id: number, data: RecordPaymentRequest) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: BorrowTransaction;
  }>(`${BASE_PATH}/transactions/${id}/record-payment`, data);
  return response.data;
};

export const markOverdue = async () => {
  const response = await api.post<{
    success: boolean;
    message: string;
    updated_count: number;
  }>(`${BASE_PATH}/transactions/mark-overdue`);
  return response.data;
};

// Dashboard Analytics (Admin)
export const getDashboardOverview = async (branchId?: number) => {
  const queryString = branchId ? `?branch_id=${branchId}` : "";
  const response = await api.get<{
    success: boolean;
    data: BorrowDashboardOverview;
  }>(`${DASHBOARD_PATH}/overview${queryString}`);
  return response.data;
};

export const getBorrowingTrends = async (
  days: number = 30,
  branchId?: number
) => {
  const params: Record<string, unknown> = { days };
  if (branchId) params.branch_id = branchId;
  const queryString = buildQueryString(params);
  const response = await api.get<{
    success: boolean;
    data: BorrowTrend[];
    period: {
      start_date: string;
      end_date: string;
      days: number;
    };
  }>(`${DASHBOARD_PATH}/trends${queryString}`);
  return response.data;
};

export const getTopItems = async (limit: number = 10, branchId?: number) => {
  const params: Record<string, unknown> = { limit };
  if (branchId) params.branch_id = branchId;
  const queryString = buildQueryString(params);
  const response = await api.get<{ success: boolean; data: TopItem[] }>(
    `${DASHBOARD_PATH}/top-items${queryString}`
  );
  return response.data;
};

export const getTopBorrowers = async (
  limit: number = 10,
  branchId?: number
) => {
  const params: Record<string, unknown> = { limit };
  if (branchId) params.branch_id = branchId;
  const queryString = buildQueryString(params);
  const response = await api.get<{ success: boolean; data: TopBorrower[] }>(
    `${DASHBOARD_PATH}/top-users${queryString}`
  );
  return response.data;
};

export const getCategoryDistribution = async (branchId?: number) => {
  const queryString = branchId ? `?branch_id=${branchId}` : "";
  const response = await api.get<{
    success: boolean;
    data: CategoryDistribution[];
  }>(`${DASHBOARD_PATH}/categories${queryString}`);
  return response.data;
};

export const getAuditLogs = async (
  limit: number = 50,
  offset: number = 0,
  branchId?: number
) => {
  const params: Record<string, unknown> = { limit, offset };
  if (branchId) params.branch_id = branchId;
  const queryString = buildQueryString(params);
  const response = await api.get<{
    success: boolean;
    data: BorrowAuditLog[];
    total: number;
  }>(`${DASHBOARD_PATH}/audit-logs${queryString}`);
  return response.data;
};
