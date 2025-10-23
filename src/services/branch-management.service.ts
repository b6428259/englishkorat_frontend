import {
  Branch,
  BranchFormData,
  CreateBranchRequest,
  CreateBranchResponse,
  DeleteBranchResponse,
  GetBranchesResponse,
  GetSingleBranchResponse,
  UpdateBranchResponse,
} from "@/types/branch-management.types";
import { api } from "./api";

class BranchManagementService {
  /**
   * Get all branches with branding (Public API)
   */
  async getAllBranches(
    active?: "true" | "false" | "all",
    type?: string
  ): Promise<GetBranchesResponse> {
    const params = new URLSearchParams();
    if (active) params.append("active", active);
    if (type) params.append("type", type);

    const queryString = params.toString();
    const url = queryString
      ? `/public/branches?${queryString}`
      : "/public/branches";

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get single branch with branding (Public API)
   */
  async getBranchById(id: number): Promise<GetSingleBranchResponse> {
    const response = await api.get(`/public/branches/${id}`);
    return response.data;
  }

  /**
   * Get all branches (Protected - requires authentication)
   */
  async getAllBranchesProtected(): Promise<{ branches: Branch[] }> {
    const response = await api.get("/branches");
    return response.data;
  }

  /**
   * Get single branch (Protected)
   */
  async getBranchByIdProtected(id: number): Promise<{ branch: Branch }> {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  }

  /**
   * Create new branch (Admin/Owner only)
   */
  async createBranch(data: CreateBranchRequest): Promise<CreateBranchResponse> {
    const response = await api.post("/branches", data);
    return response.data;
  }

  /**
   * Update branch basic info (Admin/Owner only)
   */
  async updateBranch(
    id: number,
    data: Partial<CreateBranchRequest>
  ): Promise<UpdateBranchResponse> {
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
  }

  /**
   * Update branch with logo and banner (Admin/Owner only)
   */
  async updateBranchWithMedia(
    id: number,
    data: BranchFormData
  ): Promise<UpdateBranchResponse> {
    const formData = new FormData();

    // Add text fields
    for (const [key, value] of Object.entries(data)) {
      if (
        key !== "logo" &&
        key !== "banner" &&
        value !== undefined &&
        value !== null
      ) {
        formData.append(key, String(value));
      }
    }

    // Add logo file if provided
    if (data.logo instanceof File) {
      formData.append("logo", data.logo);
    }

    // Add banner file if provided
    if (data.banner instanceof File) {
      formData.append("banner", data.banner);
    }

    const response = await api.put(`/branches/${id}/media`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Delete branch (Admin/Owner only)
   */
  async deleteBranch(id: number): Promise<DeleteBranchResponse> {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  }
}

export const branchManagementService = new BranchManagementService();
