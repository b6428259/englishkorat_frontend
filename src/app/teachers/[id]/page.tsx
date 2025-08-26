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
      return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200';
    case 'Kid':
      return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200';
    case 'Adults':
      return 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200';
    case 'Admin Team':
      return 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200';
    default:
      return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200';
  }
};

const getStatusColor = (active: number) => {
  return active === 1 
    ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200' 
    : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border border-red-200';
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            กลับไปรายชื่อครู
          </button>
          
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            แก้ไขข้อมูล
          </button>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-8 py-16 text-center border-b border-blue-100">
            <div className="max-w-md mx-auto">
              {/* Profile Image */}
              <div className="relative inline-block mb-8">
                <Avatar
                  src={imageUrl}
                  alt={`${teacher.first_name} ${teacher.last_name}`}
                  size="2xl"
                  className="ring-4 ring-white shadow-2xl"
                  fallbackInitials={`${teacher.first_name.charAt(0)}${teacher.last_name.charAt(0)}`}
                />
                
                {/* Status Badge */}
                <div className="absolute -bottom-1 -right-1">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(teacher.active)} shadow-lg ring-2 ring-white`}>
                    {teacher.active === 1 ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              {/* Name and Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                  {teacher.first_name} {teacher.last_name}
                </h1>
                {teacher.nickname && (
                  <p className="text-lg text-indigo-600 mb-4 font-medium">
                    "{teacher.nickname}"
                  </p>
                )}
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getTeacherTypeColor(teacher.teacher_type)} shadow-sm`}>
                  {teacher.teacher_type}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Personal Information */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">ข้อมูลส่วนตัว</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex justify-between items-center py-4">
                      <span className="text-gray-600 font-medium">ชื่อผู้ใช้</span>
                      <span className="text-gray-900 font-medium">{teacher.username}</span>
                    </div>
                    
                    {teacher.nationality && (
                      <div className="flex justify-between items-center py-4 border-t border-gray-50">
                        <span className="text-gray-600 font-medium">สัญชาติ</span>
                        <span className="text-gray-900 font-medium">{teacher.nationality}</span>
                      </div>
                    )}
                    
                    {teacher.email && (
                      <div className="flex justify-between items-center py-4 border-t border-gray-50">
                        <span className="text-gray-600 font-medium">อีเมล</span>
                        <span className="text-gray-900 font-medium text-right">{teacher.email}</span>
                      </div>
                    )}
                    
                    {teacher.phone && (
                      <div className="flex justify-between items-center py-4 border-t border-gray-50">
                        <span className="text-gray-600 font-medium">เบอร์โทร</span>
                        <span className="text-gray-900 font-medium">{teacher.phone}</span>
                      </div>
                    )}
                    
                    {teacher.line_id && (
                      <div className="flex justify-between items-center py-4 border-t border-gray-50">
                        <span className="text-gray-600 font-medium">Line ID</span>
                        <span className="text-gray-900 font-medium">{teacher.line_id}</span>
                      </div>
                    )}
                    
                    {teacher.hourly_rate && (
                      <div className="flex justify-between items-center py-4 border-t border-gray-50">
                        <span className="text-gray-600 font-medium">อัตราค่าจ้าง/ชั่วโมง</span>
                        <span className="text-emerald-600 font-semibold text-lg">{teacher.hourly_rate.toLocaleString()} ฿</span>
                      </div>
                    )}
                    
                    {teacher.branch_name && (
                      <div className="flex justify-between items-center py-4 border-t border-gray-50">
                        <span className="text-gray-600 font-medium">สาขา</span>
                        <span className="text-gray-900 font-medium">{teacher.branch_name} ({teacher.branch_code})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">ข้อมูลการสอน</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-green-700 mb-3">ความเชี่ยวชาญ</label>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                        {teacher.specializations ? (
                          <div className="grid grid-cols-1 gap-3">
                            {teacher.specializations.split(',').map((item, index) => (
                              <div key={index} className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                <span className="text-gray-700 font-medium">{item.trim()}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">ไม่ระบุ</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-purple-700 mb-3">คุณสมบัติและประกาศนียบัตร</label>
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
                        {teacher.certifications ? (
                          <div className="grid grid-cols-1 gap-3">
                            {teacher.certifications.split(',').map((item, index) => (
                              <div key={index} className="flex items-center">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                                <span className="text-gray-700 font-medium">{item.trim()}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">ไม่ระบุ</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Date */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-center">
                <div className="flex items-center text-sm text-indigo-600 bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-2 rounded-full border border-indigo-100">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  ลงทะเบียนเมื่อ {formatDate(teacher.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
