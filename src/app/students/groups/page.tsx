'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConditionalAuth } from '@/components/common/ConditionalAuth';
import Breadcrumb from '@/components/common/Breadcrumb';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { GroupsGrid } from '@/components/groups/GroupsGrid';
import { GroupFilters } from '@/components/groups/GroupFilters';
import { GroupDetailsModal } from '@/components/groups/GroupDetailsModal';
import { AssignStudentModal } from '@/components/groups/AssignStudentModal';
import { Group, GetGroupsParams } from '@/types/group.types';
import { groupService } from '@/services/api/groups';
import Pagination from '@/components/common/Pagination';

interface GroupsPageState {
  groups: Group[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
  filters: GetGroupsParams;
}

export default function StudentsGroupsPage() {
  const { language } = useLanguage();
  
  // Page state
  const [state, setState] = useState<GroupsPageState>({
    groups: [],
    loading: true,
    error: null,
    totalPages: 1,
    currentPage: 1,
  total: 0,
    filters: {
      page: 1,
      per_page: 20
    }
  });

  // Modal states
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Breadcrumb data
  const breadcrumbItems = [
    {
      label: language === 'th' ? 'หน้าหลัก' : 'Dashboard',
      href: '/dashboard'
    },
    {
      label: language === 'th' ? 'นักเรียน' : 'Students',
      href: '/students'
    },
    {
      label: language === 'th' ? 'กลุ่มเรียน' : 'Study Groups',
      href: '/students/groups'
    }
  ];

  // Load groups data
  const loadGroups = useCallback(async (params: GetGroupsParams = state.filters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await groupService.getGroups(params);
      
      setState(prev => ({
        ...prev,
        groups: response.groups || [],
        totalPages: response.total_pages || 1,
        currentPage: response.page || 1,
        total: response.total || 0,
        loading: false,
        filters: params
      }));
    } catch (error) {
      console.error('Error loading groups:', error);
      setState(prev => ({
        ...prev,
        error: language === 'th' ? 'ไม่สามารถโหลดข้อมูลกลุ่มเรียนได้' : 'Failed to load groups',
        loading: false
      }));
    }
  }, [language, state.filters]);

  // Initial data load
  useEffect(() => {
    loadGroups();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<GetGroupsParams>) => {
    const updatedFilters = {
      ...state.filters,
      ...newFilters,
      page: newFilters.page || 1 // Reset to first page on filter change unless page is specifically set
    };
    loadGroups(updatedFilters);
  }, [state.filters, loadGroups]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
      handleFilterChange({ page });
    }
  }, [state.totalPages, state.currentPage, handleFilterChange]);

  const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
    const updatedFilters: GetGroupsParams = {
      ...state.filters,
      per_page: itemsPerPage,
      page: 1
    };
    loadGroups(updatedFilters);
  }, [state.filters, loadGroups]);

  // Handle group selection for details
  const handleViewDetails = useCallback((group: Group) => {
    setSelectedGroup(group);
    setShowDetailsModal(true);
  }, []);

  // Handle assign student to group
  const handleAssignStudent = useCallback((group: Group) => {
    setSelectedGroup(group);
    setShowAssignModal(true);
  }, []);

  // Handle modal close
  const handleCloseModals = useCallback(() => {
    setSelectedGroup(null);
    setShowDetailsModal(false);
    setShowAssignModal(false);
  }, []);

  // Handle successful assignment
  const handleAssignmentSuccess = useCallback(() => {
    handleCloseModals();
    loadGroups(); // Refresh data
  }, [handleCloseModals, loadGroups]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const defaultFilters: GetGroupsParams = {
      page: 1,
      per_page: 20
    };
    loadGroups(defaultFilters);
  }, [loadGroups]);

  return (
    <ConditionalAuth requiredRoles={['teacher', 'admin', 'owner'] as const}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language === 'th' ? 'จัดการกลุ่มเรียน' : 'Manage Study Groups'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {language === 'th' 
                    ? 'ดูรายละเอียดกลุ่มเรียนและจัดการนักเรียน' 
                    : 'View group details and manage students'
                  }
                </p>
              </div>
              
              <div className="flex gap-3 mt-4 sm:mt-0">
                <Button
                  onClick={handleClearFilters}
                  variant="monthView"
                  className="px-4 py-2 text-sm"
                >
                  {language === 'th' ? 'ล้างตัวกรอง' : 'Clear Filters'}
                </Button>
                <Button
                  onClick={() => loadGroups()}
                  variant="monthViewClicked"
                  className="px-4 py-2 text-sm"
                >
                  {language === 'th' ? 'รีเฟรช' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <GroupFilters
              filters={state.filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm">
            {state.loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">
                  {language === 'th' ? 'กำลังโหลด...' : 'Loading...'}
                </span>
              </div>
            ) : state.error ? (
              <div className="p-6">
                <ErrorMessage message={state.error} />
                <div className="mt-4 text-center">
                  <Button
                    onClick={() => loadGroups()}
                    variant="monthViewClicked"
                    className="px-6 py-2"
                  >
                    {language === 'th' ? 'ลองใหม่' : 'Try Again'}
                  </Button>
                </div>
              </div>
            ) : state.groups.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'th' ? 'ไม่พบกลุ่มเรียน' : 'No groups found'}
                </h3>
                <p className="text-gray-600">
                  {language === 'th' 
                    ? 'ลองเปลี่ยนเงื่อนไขการค้นหาหรือสร้างกลุ่มเรียนใหม่' 
                    : 'Try adjusting your filters or create a new group'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Groups Grid */}
                <div className="p-6">
                  <GroupsGrid
                    groups={state.groups}
                    onViewDetails={handleViewDetails}
                    onAssignStudent={handleAssignStudent}
                  />
                </div>

                {/* Pagination */}
                <div className="border-t">
                  <Pagination
                    currentPage={state.currentPage}
                    totalPages={state.totalPages}
                    totalItems={state.total}
                    itemsPerPage={state.filters.per_page || 20}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    loading={state.loading}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modals */}
        {selectedGroup && showDetailsModal && (
          <GroupDetailsModal
            group={selectedGroup}
            isOpen={showDetailsModal}
            onClose={handleCloseModals}
            onGroupUpdated={() => loadGroups()}
          />
        )}

        {selectedGroup && showAssignModal && (
          <AssignStudentModal
            group={selectedGroup}
            isOpen={showAssignModal}
            onClose={handleCloseModals}
            onAssignmentSuccess={handleAssignmentSuccess}
          />
        )}
      </div>
    </ConditionalAuth>
  );
}
