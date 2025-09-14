import { api } from './base';
import {
  Group,
  GroupMember,
  CreateGroupRequest,
  AddGroupMemberRequest,
  UpdatePaymentStatusRequest,
  GroupResponse,
  GroupListResponse
} from '@/types/group.types';

// API endpoints for groups
export const GROUP_ENDPOINTS = {
  LIST: '/groups',
  CREATE: '/groups',
  GET_BY_ID: (id: string) => `/groups/${id}`,
  UPDATE: (id: string) => `/groups/${id}`,
  DELETE: (id: string) => `/groups/${id}`,
  ADD_MEMBER: (id: string) => `/groups/${id}/members`,
  REMOVE_MEMBER: (id: string, studentId: string) => `/groups/${id}/members/${studentId}`,
  UPDATE_PAYMENT: (id: string) => `/groups/${id}/payment-status`
} as const;

export const groupService = {
  /**
   * Get list of groups with optional filters
   * Permissions: Teacher, Admin, Owner
   */
  getGroups: async (params?: {
    course_id?: number;
    status?: 'active' | 'inactive' | 'suspended' | 'full' | 'need-feeling' | 'empty';
    payment_status?: 'pending' | 'deposit_paid' | 'fully_paid';
    page?: number;
    limit?: number;
  }): Promise<GroupListResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = queryParams.toString() ? `${GROUP_ENDPOINTS.LIST}?${queryParams}` : GROUP_ENDPOINTS.LIST;
    const response = await api.get(url);
    
    if (response.data.success) {
      return {
        groups: response.data.data.groups || response.data.groups || [],
        pagination: response.data.data.pagination || response.data.pagination
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch groups');
    }
  },

  /**
   * Get specific group by ID
   * Permissions: Teacher, Admin, Owner
   */
  getGroupById: async (id: string): Promise<Group> => {
    const response = await api.get(GROUP_ENDPOINTS.GET_BY_ID(id));
    
    if (response.data.success) {
      return response.data.data.group || response.data.group;
    } else {
      throw new Error(response.data.message || 'Failed to fetch group');
    }
  },

  /**
   * Create new group
   * Permissions: Admin, Owner
   */
  createGroup: async (groupData: CreateGroupRequest): Promise<GroupResponse> => {
    const response = await api.post(GROUP_ENDPOINTS.CREATE, groupData);
    
    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || 'Group created successfully',
        group: response.data.data?.group || response.data.group
      };
    } else {
      throw new Error(response.data.message || 'Failed to create group');
    }
  },

  /**
   * Update existing group
   * Permissions: Admin, Owner
   */
  updateGroup: async (id: string, updates: Partial<CreateGroupRequest>): Promise<GroupResponse> => {
    const response = await api.put(GROUP_ENDPOINTS.UPDATE(id), updates);
    
    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || 'Group updated successfully',
        group: response.data.data?.group || response.data.group
      };
    } else {
      throw new Error(response.data.message || 'Failed to update group');
    }
  },

  /**
   * Delete group
   * Permissions: Admin, Owner
   */
  deleteGroup: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(GROUP_ENDPOINTS.DELETE(id));
    
    if (response.data.success) {
      return {
        message: response.data.message || 'Group deleted successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to delete group');
    }
  },

  /**
   * Add member to group
   * Permissions: Admin, Owner
   */
  addMember: async (groupId: string, memberData: AddGroupMemberRequest): Promise<{ message: string; member: GroupMember }> => {
    const response = await api.post(GROUP_ENDPOINTS.ADD_MEMBER(groupId), memberData);
    
    if (response.data.success || response.data.message) {
      return {
        message: response.data.message || 'Member added successfully',
        member: response.data.data?.member || response.data.member
      };
    } else {
      throw new Error(response.data.message || 'Failed to add member');
    }
  },

  /**
   * Remove member from group
   * Permissions: Admin, Owner
   */
  removeMember: async (groupId: string, studentId: string): Promise<{ message: string }> => {
    const response = await api.delete(GROUP_ENDPOINTS.REMOVE_MEMBER(groupId, studentId));
    
    if (response.data.success) {
      return {
        message: response.data.message || 'Member removed successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to remove member');
    }
  },

  /**
   * Update payment status
   * Permissions: Admin, Owner
   */
  updatePaymentStatus: async (groupId: string, paymentData: UpdatePaymentStatusRequest): Promise<{ message: string }> => {
    const response = await api.patch(GROUP_ENDPOINTS.UPDATE_PAYMENT(groupId), paymentData);
    
    if (response.data.success) {
      return {
        message: response.data.message || 'Payment status updated successfully'
      };
    } else {
      throw new Error(response.data.message || 'Failed to update payment status');
    }
  },

  /**
   * Get groups for dropdown selection
   * Returns simplified group data suitable for dropdowns
   */
  getGroupOptions: async (): Promise<Array<{
    id: number;
    group_name: string;
    course_name: string;
    level: string;
    current_students: number;
    max_students: number;
    payment_status: string;
  }>> => {
    try {
      const response = await groupService.getGroups({ status: 'active' });
      
      return response.groups.map(group => ({
        id: group.id,
        group_name: group.group_name,
        course_name: group.course?.name || 'Unknown Course',
        level: group.level,
        current_students: group.members?.length || 0,
        max_students: group.max_students,
        payment_status: group.payment_status
      }));
    } catch (error) {
      console.error('Error fetching group options:', error);
      return [];
    }
  },

  /**
   * Get group members
   * Returns detailed member information for a specific group
   */
  getGroupMembers: async (groupId: string): Promise<GroupMember[]> => {
    try {
      const group = await groupService.getGroupById(groupId);
      return group.members || [];
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  },

  /**
   * Get groups by course
   * Returns groups filtered by course ID
   */
  getGroupsByCourse: async (courseId: number): Promise<Group[]> => {
    try {
      const response = await groupService.getGroups({ course_id: courseId });
      return response.groups;
    } catch (error) {
      console.error('Error fetching groups by course:', error);
      return [];
    }
  },

  /**
   * Get groups by payment status
   * Returns groups filtered by payment status
   */
  getGroupsByPaymentStatus: async (paymentStatus: 'pending' | 'deposit_paid' | 'fully_paid'): Promise<Group[]> => {
    try {
      const response = await groupService.getGroups({ payment_status: paymentStatus });
      return response.groups;
    } catch (error) {
      console.error('Error fetching groups by payment status:', error);
      return [];
    }
  }
};

export default groupService;