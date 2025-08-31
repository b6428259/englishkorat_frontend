"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import SidebarLayout from '../../../components/common/SidebarLayout';
import TeachersTable from '../../../components/common/TeachersTable';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { FormField } from '../../../components/forms/FormField';
import { Input } from '../../../components/forms/Input';
import { Select } from '../../../components/forms/Select';
import { useLanguage } from '../../../contexts/LanguageContext';
import { teachersApi, Teacher } from '../../../services/api/teachers';

export default function TeacherListPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherTypeFilter, setTeacherTypeFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Options for select components
  const teacherTypeOptions = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'Both', label: 'Both' },
    { value: 'Kid', label: 'Kid' },
    { value: 'Adults', label: 'Adults' },
    { value: 'Admin Team', label: 'Admin Team' }
  ];

  const statusOptions = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const fetchTeachers = useCallback(async (page: number = currentPage, limit: number = itemsPerPage) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (branchFilter) params.append('branch_id', branchFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (teacherTypeFilter) params.append('teacher_type', teacherTypeFilter);
      
      const response = await teachersApi.getTeachers(page, limit);
      
      if (response.success) {
        setTeachers(response.data.teachers);
        setTotalItems(response.data.pagination.total);
        setTotalPages(response.data.pagination.total_pages);
        setCurrentPage(response.data.pagination.current_page);
      } else {
        setError('ไม่สามารถโหลดข้อมูลครูได้');
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, branchFilter, statusFilter, teacherTypeFilter]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTeachers(page, itemsPerPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    fetchTeachers(1, newItemsPerPage);
  };

  const handleView = (teacher: Teacher) => {
    router.push(`/teachers/${teacher.id}`);
  };

  const handleEdit = (teacher: Teacher) => {
    router.push(`/teachers/${teacher.id}/edit`);
  };

  const handleDelete = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      setIsDeleting(true);
      const response = await teachersApi.deleteTeacher(teacherToDelete.id.toString());
      
      if (response.success) {
        // Remove deleted teacher from state
        setTeachers(prev => prev.filter(t => t.id !== teacherToDelete.id));
        setTotalItems(prev => prev - 1);
        
        // Close modal and reset state
        setShowDeleteModal(false);
        setTeacherToDelete(null);
      } else {
        setError('ไม่สามารถลบข้อมูลครูได้');
      }
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  const handleRefresh = () => {
    fetchTeachers(currentPage, itemsPerPage);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specializations?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !teacherTypeFilter || teacher.teacher_type === teacherTypeFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && teacher.active === 1) ||
      (statusFilter === 'inactive' && teacher.active === 0);
    const matchesBranch = !branchFilter || teacher.branch_id?.toString() === branchFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesBranch;
  });

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.teacherManagement },
        { label: t.teacherList }
      ]}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-sm p-8 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">รายชื่อครู</h1>
              <p className="text-gray-600 text-lg">
                จัดการและดูข้อมูลครูทั้งหมดในระบบ
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="secondary"
                className="inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                รีเฟรช
              </Button>
              <Button 
                onClick={() => router.push('/teachers/new')}
                variant="primary"
                className="inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                เพิ่มครูใหม่
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <FormField label="ค้นหาครู">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Input
                    type="text"
                    placeholder="ค้นหาด้วยชื่อ, นามสกุล, ชื่อเล่น..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormField>
            </div>

            {/* Teacher Type Filter */}
            <div>
              <FormField label="ประเภทครู">
                <Select
                  value={teacherTypeFilter}
                  onChange={(e) => setTeacherTypeFilter(e.target.value)}
                  options={teacherTypeOptions}
                />
              </FormField>
            </div>

            {/* Status Filter */}
            <div>
              <FormField label="สถานะ">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={statusOptions}
                />
              </FormField>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setSearchTerm('');
                setTeacherTypeFilter('');
                setStatusFilter('');
                setBranchFilter('');
              }}
              variant="outline"
              className="inline-flex items-center text-xs"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              ล้างตัวกรอง
            </Button>
            <Button
              onClick={() => setTeacherTypeFilter('Both')}
              variant={teacherTypeFilter === 'Both' ? 'primary' : 'outline'}
              className="text-xs"
            >
              Both
            </Button>
            <Button
              onClick={() => setTeacherTypeFilter('Kid')}
              variant={teacherTypeFilter === 'Kid' ? 'primary' : 'outline'}
              className="text-xs"
            >
              Kids
            </Button>
            <Button
              onClick={() => setTeacherTypeFilter('Adults')}
              variant={teacherTypeFilter === 'Adults' ? 'primary' : 'outline'}
              className="text-xs"
            >
              Adults
            </Button>
            <Button
              onClick={() => setStatusFilter('active')}
              variant={statusFilter === 'active' ? 'primary' : 'outline'}
              className="inline-flex items-center text-xs"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
              Active
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">ครูทั้งหมด</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalItems}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">ครูที่ใช้งานอยู่</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {teachers.filter(t => t.active === 1).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">ครูสำหรับเด็ก</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {teachers.filter(t => t.teacher_type === 'Kid' || t.teacher_type === 'Both').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">ครูสำหรับผู้ใหญ่</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {teachers.filter(t => t.teacher_type === 'Adults' || t.teacher_type === 'Both').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 text-lg font-medium">{error}</div>
              <button 
                onClick={handleRefresh}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : (
            <>
              <TeachersTable
                teachers={searchTerm || teacherTypeFilter ? filteredTeachers : teachers}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              {!searchTerm && !teacherTypeFilter && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  loading={loading}
                />
              )}
              {(searchTerm || teacherTypeFilter) && filteredTeachers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">ไม่พบข้อมูลครูที่ค้นหา</div>
                  <div className="text-gray-400 text-sm mt-2">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && teacherToDelete && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          title="ยืนยันการลบข้อมูลครู"
          message={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลครู "${teacherToDelete.first_name} ${teacherToDelete.last_name}" ? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
          type="danger"
          confirmText="ลบข้อมูล"
          cancelText="ยกเลิก"
          loading={isDeleting}
          advancedConfirm={true}
          confirmationText={teacherToDelete.nickname || teacherToDelete.first_name}
          confirmationPlaceholder={`พิมพ์ "${teacherToDelete.nickname || teacherToDelete.first_name}" เพื่อยืนยัน`}
          confirmationLabel={`กรุณาพิมพ์ "${teacherToDelete.nickname || teacherToDelete.first_name}" เพื่อยืนยัน`}
        />
      )}
    </SidebarLayout>
  );
}
