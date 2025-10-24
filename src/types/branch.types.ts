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

export interface BranchBranding {
  logo: BranchLogo | null;
  banner: BranchBanner | null;
}

export interface UploadLogoResponse {
  message: string;
  logo: BranchLogo;
}

export interface UploadBannerResponse {
  message: string;
  banner: BranchBanner;
}

export interface DeleteResponse {
  message: string;
}
