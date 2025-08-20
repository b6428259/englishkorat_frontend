"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import SidebarLayout from '../../../components/common/SidebarLayout';
import TeachersTable from '../../../components/common/TeachersTable';
import Pagination from '../../../components/common/Pagination';
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

  const fetchTeachers = async (page: number = currentPage, limit: number = itemsPerPage) => {
    try {
      setLoading(true);
      setError(null);
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
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

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
    // TODO: Implement teacher edit functionality
    console.log('Edit teacher:', teacher);
  };

  const handleDelete = (teacher: Teacher) => {
    // TODO: Implement teacher delete functionality with confirmation
    console.log('Delete teacher:', teacher);
  };

  const handleRefresh = () => {
    fetchTeachers(currentPage, itemsPerPage);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specializations.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !teacherTypeFilter || teacher.teacher_type === teacherTypeFilter;
    
    return matchesSearch && matchesType;
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">รายชื่อครู</h1>
              <p className="mt-1 text-sm text-gray-600">
                จัดการและดูข้อมูลครูทั้งหมดในระบบ
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                รีเฟรช
              </button>
              <button 
                onClick={() => router.push('/teachers/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                เพิ่มครูใหม่
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                ค้นหาครู
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="ค้นหาด้วยชื่อ, นามสกุล, ชื่อเล่น หรือความเชี่ยวชาญ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label htmlFor="teacherType" className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทครู
              </label>
              <select
                id="teacherType"
                value={teacherTypeFilter}
                onChange={(e) => setTeacherTypeFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                <option value="">ทั้งหมด</option>
                <option value="Both">Both</option>
                <option value="Kid">Kid</option>
                <option value="Adults">Adults</option>
                <option value="Admin Team">Admin Team</option>
              </select>
            </div>
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
    </SidebarLayout>
  );
}
