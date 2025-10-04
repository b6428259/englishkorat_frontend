import { api } from "./base";

export interface Branch {
  id: number;
  deleted_at?: string | null;
  name_en: string;
  name_th: string;
  code: string;
  address: string;
  phone: string;
  type: string;
  active: boolean;
}

export interface BranchListResponse {
  branches: Branch[];
  total: number;
}

class BranchService {
  /**
   * Get all active branches
   */
  async getBranches(): Promise<Branch[]> {
    try {
      const response = await api.get("/branches");
      // Handle both array response and object with branches property
      if (Array.isArray(response.data)) {
        return response.data as Branch[];
      } else if (response.data.branches) {
        return response.data.branches as Branch[];
      }
      return [];
    } catch (error) {
      console.error("Error fetching branches:", error);
      return [];
    }
  }

  /**
   * Get active branches only
   */
  async getActiveBranches(): Promise<Branch[]> {
    try {
      const branches = await this.getBranches();
      return branches.filter((branch) => branch.active);
    } catch (error) {
      console.error("Error fetching active branches:", error);
      return [];
    }
  }

  /**
   * Get branch by ID
   */
  async getBranch(id: number): Promise<Branch | null> {
    try {
      const response = await api.get(`/branches/${id}`);
      return response.data as Branch;
    } catch (error) {
      console.error("Error fetching branch:", error);
      return null;
    }
  }
}

export const branchService = new BranchService();
