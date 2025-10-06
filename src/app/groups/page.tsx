"use client";

import { useState, useEffect, useCallback } from "react";
import SidebarLayout from "../../components/common/SidebarLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { groupService } from "@/services/api/groups";
import { Group, CreateGroupRequest } from "@/types/group.types";
import { GroupCard } from "./components/GroupCard";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { GroupDetailsModal } from "./components/GroupDetailsModal";
import { AddMemberModal } from "./components/AddMemberModal";

export default function GroupsPage() {
  const { language } = useLanguage();

  // State management
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  // const [courseFilter, setCourseFilter] = useState<number | null>(null); // TODO: Implement course filtering

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Helper: normalize filter values to API-accepted union types
  const toStatusParam = (value: string): Group['status'] | undefined => {
    if (value === 'all') return undefined;
    const allowed: Group['status'][] = ['active', 'inactive', 'suspended', 'full', 'need-feeling', 'empty'];
    return (allowed as readonly string[]).includes(value) ? (value as Group['status']) : undefined;
  };

  const toPaymentParam = (value: string): Group['payment_status'] | undefined => {
    if (value === 'all') return undefined;
    const allowed: Group['payment_status'][] = ['pending', 'deposit_paid', 'fully_paid'];
    return (allowed as readonly string[]).includes(value) ? (value as Group['payment_status']) : undefined;
  };

  // Fetch groups data
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: {
        status?: Group['status'];
        payment_status?: Group['payment_status'];
        // course_id?: number; // TODO: Implement course filtering
      } = {};
      const s = toStatusParam(statusFilter);
      const p = toPaymentParam(paymentFilter);
      if (s) params.status = s;
      if (p) params.payment_status = p;
      // if (courseFilter) params.course_id = courseFilter;

      const response = await groupService.getGroups(params);
      setGroups(response.groups);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch groups';
      setError(language === 'th' ? 'ไม่สามารถโหลดข้อมูลกลุ่มได้' : errorMessage);
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentFilter, language]); // Removed courseFilter since it's commented out

  // Load groups on mount and when filters change
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Handle group creation
  const handleCreateGroup = async (groupData: CreateGroupRequest) => {
    try {
      setFormLoading(true);
      setFormError(null);

      await groupService.createGroup(groupData);
      setIsCreateModalOpen(false);
      await fetchGroups(); // Refresh the list

      // Success notification would go here
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
      setFormError(language === 'th' ? 'เกิดข้อผิดพลาดในการสร้างกลุ่ม' : errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle group details view
  const handleViewDetails = (group: Group) => {
    setSelectedGroup(group);
    setIsDetailsModalOpen(true);
  };

  // Handle add member
  const handleAddMember = (group: Group) => {
    setSelectedGroup(group);
    setIsAddMemberModalOpen(true);
  };

  // Handle member addition
  const handleMemberAdded = async () => {
    setIsAddMemberModalOpen(false);
    await fetchGroups(); // Refresh to show updated member count
  };

  // Handle group status update
  const handleUpdateGroup = async (groupId: string, updates: Partial<CreateGroupRequest>) => {
    try {
      await groupService.updateGroup(groupId, updates);
      await fetchGroups(); // Refresh the list
    } catch (err) {
      console.error('Error updating group:', err);
    }
  };

  // Filter counts for display
  const getStatusCounts = () => {
    return {
      all: groups.length,
      active: groups.filter(g => g.status === 'active').length,
      full: groups.filter(g => g.status === 'full').length,
      empty: groups.filter(g => g.status === 'empty').length,
      'need-feeling': groups.filter(g => g.status === 'need-feeling').length
    };
  };

  const getPaymentCounts = () => {
    return {
      all: groups.length,
      pending: groups.filter(g => g.payment_status === 'pending').length,
      deposit_paid: groups.filter(g => g.payment_status === 'deposit_paid').length,
      fully_paid: groups.filter(g => g.payment_status === 'fully_paid').length
    };
  };

  const statusCounts = getStatusCounts();
  const paymentCounts = getPaymentCounts();

  if (loading) {
    return (
      <SidebarLayout breadcrumbItems={[{ label: language === 'th' ? 'จัดการกลุ่ม' : 'Groups' }]}>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout breadcrumbItems={[{ label: language === 'th' ? 'จัดการกลุ่ม' : 'Groups' }]}>
        <ErrorMessage message={error} onRetry={fetchGroups} />
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout breadcrumbItems={[{ label: language === 'th' ? 'จัดการกลุ่ม' : 'Groups' }]}>
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen text-gray-700">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 flex-shrink-0 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {language === 'th' ? 'จัดการกลุ่มเรียน' : 'Group Management'}
            </h1>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="monthViewClicked"
              className="px-6 py-3 rounded-lg text-sm font-semibold"
            >
              + {language === 'th' ? 'สร้างกลุ่มใหม่' : 'Create New Group'}
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'สถานะกลุ่ม' : 'Group Status'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{language === 'th' ? 'ทั้งหมด' : 'All'} ({statusCounts.all})</option>
                <option value="active">{language === 'th' ? 'ใช้งาน' : 'Active'} ({statusCounts.active})</option>
                <option value="full">{language === 'th' ? 'เต็ม' : 'Full'} ({statusCounts.full})</option>
                <option value="empty">{language === 'th' ? 'ว่าง' : 'Empty'} ({statusCounts.empty})</option>
                <option value="need-feeling">{language === 'th' ? 'ต้องการนักเรียน' : 'Need Students'} ({statusCounts['need-feeling']})</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'สถานะการชำระเงิน' : 'Payment Status'}
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{language === 'th' ? 'ทั้งหมด' : 'All'} ({paymentCounts.all})</option>
                <option value="pending">{language === 'th' ? 'รอชำระ' : 'Pending'} ({paymentCounts.pending})</option>
                <option value="deposit_paid">{language === 'th' ? 'ชำระมัดจำ' : 'Deposit Paid'} ({paymentCounts.deposit_paid})</option>
                <option value="fully_paid">{language === 'th' ? 'ชำระครบ' : 'Fully Paid'} ({paymentCounts.fully_paid})</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'ค้นหา' : 'Search'}
              </label>
              <input
                type="text"
                placeholder={language === 'th' ? 'ค้นหาชื่อกลุ่ม...' : 'Search group name...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {language === 'th' ? 'ไม่มีกลุ่มเรียน' : 'No groups found'}
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="monthViewClicked"
                className="px-6 py-3"
              >
                {language === 'th' ? 'สร้างกลุ่มแรก' : 'Create First Group'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onViewDetails={handleViewDetails}
                  onAddMember={handleAddMember}
                  onUpdateGroup={handleUpdateGroup}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onConfirm={handleCreateGroup}
          isLoading={formLoading}
          error={formError}
        />
      )}

      {isDetailsModalOpen && selectedGroup && (
        <GroupDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          group={selectedGroup}
          onGroupUpdated={() => fetchGroups()}
        />
      )}

      {isAddMemberModalOpen && selectedGroup && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          group={selectedGroup}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </SidebarLayout>
  );
}
