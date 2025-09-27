import {
  Group,
  GroupMember,
  GroupListResponse,
  GroupResponse,
  GroupMemberResponse,
  GetGroupsParams,
  CreateGroupRequest,
  AddGroupMemberRequest,
  UpdatePaymentStatusRequest,
  Student,
  GroupOption,
} from "@/types/group.types";
import { API_ENDPOINTS } from "./endpoints";
import { api } from "./base";

class GroupService {
  // Uses shared axios instance `api` which applies auth token via interceptor

  /**
   * Get all groups with optional filters
   */
  async getGroups(params: GetGroupsParams = {}): Promise<GroupListResponse> {
    try {
      const searchParams = new URLSearchParams();

      // Add filter parameters
      if (params.course_id)
        searchParams.append("course_id", params.course_id.toString());
      if (params.branch_id)
        searchParams.append("branch_id", params.branch_id.toString());
      if (params.status) searchParams.append("status", params.status);
      if (params.payment_status)
        searchParams.append("payment_status", params.payment_status);
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.per_page)
        searchParams.append("per_page", params.per_page.toString());

      const response = await api.get(API_ENDPOINTS.GROUPS.LIST, {
        params: Object.fromEntries(searchParams),
      });
      return response.data as GroupListResponse;
    } catch (error) {
      console.error("Error fetching groups:", error);
      // Return empty response structure for defensive programming
      return {
        groups: [],
        page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0,
      };
    }
  }

  /**
   * Get specific group by ID
   */
  async getGroup(id: string): Promise<Group | null> {
    try {
      const response = await api.get(API_ENDPOINTS.GROUPS.GET_BY_ID(id));
      const data: GroupResponse = response.data;
      return data.group;
    } catch (error) {
      console.error("Error fetching group:", error);
      return null;
    }
  }

  /**
   * Create a new group
   */
  async createGroup(groupData: CreateGroupRequest): Promise<Group | null> {
    try {
      const response = await api.post(API_ENDPOINTS.GROUPS.CREATE, groupData);
      const data: GroupResponse = response.data;
      return data.group;
    } catch (error) {
      console.error("Error creating group:", error);
      return null;
    }
  }

  /**
   * Update an existing group
   */
  async updateGroup(
    groupId: string,
    updates: Partial<CreateGroupRequest>,
  ): Promise<Group | null> {
    try {
      const response = await api.put(
        API_ENDPOINTS.GROUPS.UPDATE(groupId),
        updates,
      );
      const data: GroupResponse = response.data;
      return data.group;
    } catch (error) {
      console.error("Error updating group:", error);
      return null;
    }
  }

  /**
   * Add member to group
   */
  async addMember(
    groupId: string,
    memberData: AddGroupMemberRequest,
  ): Promise<GroupMember | null> {
    try {
      const response = await api.post(
        API_ENDPOINTS.GROUPS.ADD_MEMBER(groupId),
        memberData,
      );
      const data: GroupMemberResponse = response.data;
      return data.member;
    } catch (error) {
      console.error("Error adding member:", error);
      return null;
    }
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, studentId: string): Promise<boolean> {
    try {
      const response = await api.delete(
        API_ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId, studentId),
      );
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Error removing member:", error);
      return false;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    groupId: string,
    paymentData: UpdatePaymentStatusRequest,
  ): Promise<boolean> {
    try {
      const response = await api.patch(
        API_ENDPOINTS.GROUPS.UPDATE_PAYMENT(groupId),
        paymentData,
      );
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error("Error updating payment status:", error);
      return false;
    }
  }

  /**
   * Get available students for assignment
   */
  async getAvailableStudents(search?: string): Promise<Student[]> {
    try {
      const searchParams = new URLSearchParams();
      if (search) searchParams.append("search", search);

      const response = await api.get(API_ENDPOINTS.STUDENTS.LIST, {
        params: Object.fromEntries(searchParams),
      });
      const data = response.data;
      return Array.isArray(data.students) ? data.students : data.students || [];
    } catch (error) {
      console.error("Error fetching students:", error);
      return []; // Return empty array on error for defensive programming
    }
  }

  /**
   * Get courses for filtering
   */
  async getCourses(): Promise<
    Array<{ id: number; name: string; level: string }>
  > {
    try {
      const response = await api.get(API_ENDPOINTS.COURSES.LIST);
      const data = response.data;
      return Array.isArray(data.courses) ? data.courses : data.courses || [];
    } catch (error) {
      console.error("Error fetching courses:", error);
      return []; // Return empty array on error for defensive programming
    }
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const group = await this.getGroup(groupId);
      return group?.members || [];
    } catch (error) {
      console.error("Error fetching group members:", error);
      return [];
    }
  }

  /**
   * Get groups for dropdown selection
   */
  async getGroupOptions(): Promise<GroupOption[]> {
    try {
      const response = await this.getGroups({ status: "active" });

      return response.groups.map((group) => ({
        id: group.id,
        group_name: group.group_name,
        course_id: group.course_id,
        course_name: group.course?.name || "Unknown Course",
        level: group.level,
        current_students: group.members?.length || 0,
        max_students: group.max_students,
        payment_status: group.payment_status,
      }));
    } catch (error) {
      console.error("Error fetching group options:", error);
      return [];
    }
  }
}

export const groupService = new GroupService();

export default groupService;
