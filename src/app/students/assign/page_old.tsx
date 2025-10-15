"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { studentService } from '@/services/student.service';
import type { Student } from '@/services/api/students';

type RegistrationStatus = 'pending_review' | 'schedule_exam' | 'waiting_for_group' | 'active';

export default function StudentAssignPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RegistrationStatus>('pending_review');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusTabs = [
    {
      key: 'pending_review' as RegistrationStatus,
      label: language === 'th' ? 'รอตรวจสอบ' : 'Pending Review',
      description: language === 'th' ? 'นักเรียนที่ลงทะเบียนใหม่ รอการตรวจสอบและกรอกข้อมูลเพิ่มเติม' : 'New registrations waiting for review and additional information',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      key: 'schedule_exam' as RegistrationStatus,
      label: language === 'th' ? 'จัดสอบ' : 'Schedule Exam',
      description: language === 'th' ? 'นักเรียนที่พร้อมทำการสอบ placement test' : 'Students ready for placement testing',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      key: 'waiting_for_group' as RegistrationStatus,
      label: language === 'th' ? 'รอจัดกลุ่ม' : 'Waiting for Group',
      description: language === 'th' ? 'นักเรียนที่ทำการสอบแล้ว รอการจัดเข้ากลุ่มเรียน' : 'Students who completed testing, waiting for group assignment',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      key: 'active' as RegistrationStatus,
      label: language === 'th' ? 'ใช้งานอยู่' : 'Active',
      description: language === 'th' ? 'นักเรียนที่จัดเข้ากลุ่มแล้วและเรียนอยู่' : 'Students assigned to groups and actively learning',
      color: 'bg-green-100 text-green-800 border-green-200'
    }
  ];

  useEffect(() => {
    fetchStudentsByStatus(activeTab);
  }, [activeTab]);

  const fetchStudentsByStatus = async (status: RegistrationStatus) => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.getStudentsByStatus(status);
      setStudents(response.students);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    const tab = statusTabs.find(t => t.key === status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tab?.color}`}>
        {tab?.label}
      </span>
    );
  };

  const handleStudentClick = (student: Student) => {
    if (activeTab === 'pending_review') {
      // Redirect to edit student for completing information
      router.push(`/students/${student.id}/edit?mode=complete`);
    } else if (activeTab === 'schedule_exam') {
      // Redirect to record exam scores
      router.push(`/students/${student.id}/exam`);
    } else if (activeTab === 'waiting_for_group') {
      // Redirect to assign to group/course
      router.push(`/students/${student.id}/assign-group`);
    } else {
      // View student details
      router.push(`/students/${student.id}`);
    }
  };

  const getActionText = (status: RegistrationStatus) => {
    switch (status) {
      case 'pending_review':
        return language === 'th' ? 'ตรวจสอบและกรอกข้อมูล' : 'Review & Complete Info';
      case 'schedule_exam':
        return language === 'th' ? 'บันทึกคะแนนสอบ' : 'Record Exam Scores';
      case 'waiting_for_group':
        return language === 'th' ? 'จัดเข้ากลุ่ม' : 'Assign to Group';
      case 'active':
        return language === 'th' ? 'ดูรายละเอียด' : 'View Details';
      default:
        return language === 'th' ? 'จัดการ' : 'Manage';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: language === 'th' ? 'จัดการนักเรียน' : 'Student Management', href: '/students' },
        { label: language === 'th' ? 'มอบหมาย' : 'Assign' }
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'th' ? 'จัดการนักเรียน' : 'Student Management'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {language === 'th' 
              ? 'จัดการนักเรียนตามสถานะการลงทะเบียน และดำเนินการขั้นตอนต่อไป'
              : 'Manage students by registration status and proceed with next steps'
            }
          </p>
        </div>

        {/* Status Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {/* Show count badge if available */}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Tab Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {statusTabs.find(t => t.key === activeTab)?.label}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusTabs.find(t => t.key === activeTab)?.description}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">
                  {language === 'th' ? 'กำลังโหลด...' : 'Loading...'}
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-2">
                  {language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error occurred'}
                </div>
                <p className="text-gray-500">{error}</p>
                <button
                  onClick={() => fetchStudentsByStatus(activeTab)}
                  className="mt-2 text-blue-600 hover:text-blue-500"
                >
                  {language === 'th' ? 'ลองใหม่' : 'Try again'}
                </button>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a9 9 0 01-9 9v-1a9 9 0 009-9z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {language === 'th' ? 'ไม่มีนักเรียน' : 'No students'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {language === 'th' 
                    ? `ไม่มีนักเรียนในสถานะ "${statusTabs.find(t => t.key === activeTab)?.label}"`
                    : `No students in "${statusTabs.find(t => t.key === activeTab)?.label}" status`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'th' ? 'นักเรียน' : 'Student'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'th' ? 'ข้อมูลติดต่อ' : 'Contact'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'th' ? 'วันที่ลงทะเบียน' : 'Registration Date'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'th' ? 'ประเภท' : 'Type'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'th' ? 'การดำเนินการ' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr 
                        key={student.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleStudentClick(student)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.nickname_th && student.nickname_en 
                                  ? `${student.nickname_th} (${student.nickname_en})`
                                  : student.nickname_th || student.nickname_en || 'N/A'
                                }
                              </div>
                              <div className="text-xs text-gray-400">
                                {language === 'th' ? 'อายุ' : 'Age'}: {student.age || calculateAge(student.date_of_birth)} {language === 'th' ? 'ปี' : 'years'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.phone}</div>
                          {student.email && <div className="text-sm text-gray-500">{student.email}</div>}
                          {student.line_id && <div className="text-xs text-gray-400">LINE: {student.line_id}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {getStatusBadge(student.registration_status)}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              student.registration_type === 'quick' 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {student.registration_type === 'quick' 
                                ? (language === 'th' ? 'รวดเร็ว' : 'Quick')
                                : (language === 'th' ? 'ครบถ้วน' : 'Full')
                              }
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStudentClick(student);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {getActionText(activeTab)}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            {language === 'th' ? 'การดำเนินการด่วน' : 'Quick Actions'}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/students/new')}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              {language === 'th' ? 'เพิ่มนักเรียนใหม่' : 'Add New Student'}
            </button>
            <button
              onClick={() => router.push('/students/list')}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            >
              {language === 'th' ? 'ดูรายการทั้งหมด' : 'View All Students'}
            </button>
            <button
              onClick={() => fetchStudentsByStatus(activeTab)}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
            >
              {language === 'th' ? 'รีเฟรช' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
