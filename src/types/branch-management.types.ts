// Branch Management Types based on BRANCH_API_FRONTEND.md

export interface Branch {
  id: number;
  name_en: string;
  name_th: string;
  code: string;
  address: string;
  phone: string;
  type: string;
  active: boolean;
  color: string; // Hex color code (e.g., "#3B82F6")
  open_time: string;
  close_time: string;
  created_at: string;
  updated_at: string;
}

export interface BranchLogo {
  id: number;
  branch_id: number;
  logo_url: string;
  s3_key: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

export interface BranchBanner {
  id: number;
  branch_id: number;
  banner_url: string;
  s3_key: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

export interface BranchWithBranding {
  branch: Branch;
  logo: BranchLogo | null;
  banner: BranchBanner | null;
}

export interface GetBranchesResponse {
  branches: BranchWithBranding[];
  total: number;
}

export interface GetSingleBranchResponse {
  branch: Branch;
  logo: BranchLogo | null;
  banner: BranchBanner | null;
}

export interface CreateBranchRequest {
  name_en: string;
  name_th: string;
  code: string;
  address: string;
  phone: string;
  type: string;
  active: boolean;
  color: string;
  open_time: string;
  close_time: string;
}

export interface UpdateBranchRequest {
  name_en?: string;
  name_th?: string;
  code?: string;
  address?: string;
  phone?: string;
  type?: string;
  active?: boolean;
  color?: string;
  open_time?: string;
  close_time?: string;
}

export interface CreateBranchResponse {
  message: string;
  branch: Branch;
}

export interface UpdateBranchResponse {
  message: string;
  branch: Branch;
}

export interface DeleteBranchResponse {
  message: string;
}

export interface BranchFormData extends UpdateBranchRequest {
  logo?: File | null;
  banner?: File | null;
}
