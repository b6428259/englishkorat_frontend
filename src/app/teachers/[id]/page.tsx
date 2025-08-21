"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from 'next/navigation';
import SidebarLayout from '../../../components/common/SidebarLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Avatar from '../../../components/common/Avatar';
import { useLanguage } from '../../../contexts/LanguageContext';
import { teachersApi, Teacher } from '../../../services/api/teachers';
import { getAvatarUrl } from '../../../utils/config';
import { formatDate } from '../../../utils/dateUtils';

interface TeacherDetail extends Teacher {
  avatar?: string;
  branch_name?: string;
  branch_code?: string;
}

const getTeacherTypeColor = (type: string) => {
  switch (type) {
    case 'Both':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Kid':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Adults':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Admin Team':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (active: number) => {
  return active === 1 
    ? 'bg-green-100 text-green-800 border-green-200' 
    : 'bg-red-100 text-red-800 border-red-200';
};

export default function TeacherDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeacherDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teachersApi.getTeacherById(teacherId);
      
      if (response.success) {
        setTeacher(response.data.teacher);
      } else {
        setError('ไม่สามารถโหลดข้อมูลครูได้');
      }
    } catch (err) {
      console.error('Error fetching teacher detail:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      fetchTeacherDetail();
    }
  }, [teacherId, fetchTeacherDetail]);

  const handleBack = () => {
    router.push('/teachers/list');
  };

  const handleEdit = () => {
    // TODO: Navigate to edit page
    router.push(`/teachers/${teacherId}/edit`);
  };

  if (loading) {
    return (
      <SidebarLayout
        breadcrumbItems={[
          { label: t.teacherManagement },
          { label: t.teacherList, href: '/teachers/list' },
          { label: 'รายละเอียดครู' }
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">กำลังโหลดข้อมูลครู...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error || !teacher) {
    return (
      <SidebarLayout
        breadcrumbItems={[
          { label: t.teacherManagement },
          { label: t.teacherList, href: '/teachers/list' },
          { label: 'รายละเอียดครู' }
        ]}
      >
        <ErrorMessage 
          message={error || 'ไม่พบข้อมูลครู'} 
          onRetry={fetchTeacherDetail}
        />
      </SidebarLayout>
    );
  }

  const imageUrl = getAvatarUrl(teacher.avatar);

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.teacherManagement },
        { label: t.teacherList, href: '/teachers/list' },
        { label: `${teacher.first_name} ${teacher.last_name}` }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4 sm:mb-0"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับไปรายชื่อครู
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              แก้ไขข้อมูล
            </button>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 px-8 py-12">
            <div className="flex flex-col items-center text-center">
              {/* Profile Image */}
              <div className="relative mb-6">
                <Avatar
                  src={imageUrl}
                  alt={`${teacher.first_name} ${teacher.last_name}`}
                  size="2xl"
                  className="border-4 border-white shadow-lg"
                  fallbackInitials={`${teacher.first_name.charAt(0)}${teacher.last_name.charAt(0)}`}
                />
                
                {/* Status Badge */}
                <div className="absolute -bottom-2 -right-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border-2 border-white shadow-md ${getStatusColor(teacher.active)}`}>
                    {teacher.active === 1 ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              {/* Name and Title */}
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">
                  {teacher.first_name} {teacher.last_name}
                </h1>
                <p className="text-xl opacity-90 mb-4">
                  {teacher.nickname && `"${teacher.nickname}"`}
                </p>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 border-white/30 ${getTeacherTypeColor(teacher.teacher_type)} bg-white/90`}>
                  {teacher.teacher_type}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    ข้อมูลส่วนตัว
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-600">ชื่อผู้ใช้:</span>
                      <span className="text-gray-900">{teacher.username}</span>
                    </div>
                    
                    {teacher.nationality && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">สัญชาติ:</span>
                        <span className="text-gray-900">{teacher.nationality}</span>
                      </div>
                    )}
                    
                    {teacher.email && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">อีเมล:</span>
                        <span className="text-gray-900">{teacher.email}</span>
                      </div>
                    )}
                    
                    {teacher.phone && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">เบอร์โทร:</span>
                        <span className="text-gray-900">{teacher.phone}</span>
                      </div>
                    )}
                    
                    {teacher.line_id && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Line ID:</span>
                        <span className="text-gray-900">{teacher.line_id}</span>
                      </div>
                    )}
                    
                    {teacher.hourly_rate && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">อัตราค่าจ้าง/ชั่วโมง:</span>
                        <span className="text-gray-900">{teacher.hourly_rate.toLocaleString()} บาท</span>
                      </div>
                    )}
                    
                    {teacher.branch_name && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-600">สาขา:</span>
                        <span className="text-gray-900">{teacher.branch_name} ({teacher.branch_code})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    ข้อมูลการสอน
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium text-gray-600 mb-2">ความเชี่ยวชาญ:</label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-900 leading-relaxed">
                          {teacher.specializations || 'ไม่ระบุ'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block font-medium text-gray-600 mb-2">คุณสมบัติและประกาศนียบัตร:</label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                          {teacher.certifications || 'ไม่ระบุ'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Date */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ลงทะเบียนเมื่อ: {formatDate(teacher.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
