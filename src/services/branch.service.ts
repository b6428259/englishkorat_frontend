import {
  BranchBanner,
  BranchLogo,
  DeleteResponse,
  UploadBannerResponse,
  UploadLogoResponse,
} from "@/types/branch.types";
import { api } from "./api";

class BranchService {
  /**
   * Get branch logo (Public API)
   */
  async getLogo(branchId: number): Promise<{ logo: BranchLogo | null }> {
    const response = await api.get(`/public/branches/${branchId}/logo`);
    return response.data;
  }

  /**
   * Get branch banner (Public API)
   */
  async getBanner(branchId: number): Promise<{ banner: BranchBanner | null }> {
    const response = await api.get(`/public/branches/${branchId}/banner`);
    return response.data;
  }

  /**
   * Upload or update branch logo (Admin only)
   */
  async uploadLogo(branchId: number, file: File): Promise<UploadLogoResponse> {
    const formData = new FormData();
    formData.append("logo", file);

    const response = await api.post(`/branches/${branchId}/logo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Upload or update branch banner (Admin only)
   */
  async uploadBanner(
    branchId: number,
    file: File
  ): Promise<UploadBannerResponse> {
    const formData = new FormData();
    formData.append("banner", file);

    const response = await api.post(`/branches/${branchId}/banner`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Delete branch logo (Admin only)
   */
  async deleteLogo(branchId: number): Promise<DeleteResponse> {
    const response = await api.delete(`/branches/${branchId}/logo`);
    return response.data;
  }

  /**
   * Delete branch banner (Admin only)
   */
  async deleteBanner(branchId: number): Promise<DeleteResponse> {
    const response = await api.delete(`/branches/${branchId}/banner`);
    return response.data;
  }
}

export const branchService = new BranchService();
