"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from '@/components/common/SidebarLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import StudentForm, { StudentFormData } from '@/components/forms/StudentForm';
import StudentRegistrationForm from '@/components/forms/StudentRegistrationForm';
import { courseService } from '@/services/course.service';
import { studentService } from '@/services/student.service';
import type { Course } from '@/services/api/courses';
import type { StudentRegistrationRequest } from '@/services/api/students';

export default function NewStudentRegistrationByAdmin() {
  const { language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [registrationType, setRegistrationType] = useState<'quick' | 'full' | 'legacy' | null>(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getCourses();
        // Map courses to include missing branch_id, branch_name, branch_code if needed
        const mappedCourses = coursesData.data.courses.map((course: Course) => ({
          ...course,
          branch_id: course.branch_id ?? 0,
          branch_name: course.branch_name ?? '',
          branch_code: course.branch_code ?? '',
        }));
        setCourses(mappedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const handleNewSystemSubmit = async (data: StudentRegistrationRequest) => {
    setLoading(true);
    try {
      const result = await studentService.registerStudent(data);
      if (result.success) {
        alert(language === 'th' ? 'ลงทะเบียนนักเรียนสำเร็จ!' : 'Student registration successful!');
        router.push('/students/assign');
      }
    } catch (error) {
      console.error('Error registering student:', error);
      alert(language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLegacySubmit = async (data: StudentFormData) => {
    setLoading(true);
    try {
      // ตัวอย่าง log request ที่จะส่งไปหลังบ้าน
      const requestPayload = {
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/students/register`,
        headers: {
          'Content-Type': 'application/json'
          // หมายเหตุ: endpoint นี้ไม่ต้องใช้ token
        },
        body: data
      };
      
      console.log('=== Sample Request to Backend ===');
      console.log('URL:', requestPayload.url);
      console.log('Method:', requestPayload.method);
      console.log('Headers:', JSON.stringify(requestPayload.headers, null, 2));
      console.log('Body:', JSON.stringify(requestPayload.body, null, 2));
      console.log('================================');

      // ส่ง request จริง
      const response = await fetch(requestPayload.url, {
        method: requestPayload.method,
        headers: requestPayload.headers,
        body: JSON.stringify(requestPayload.body)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Response error:', result);
        
        // Show specific error message from backend
        const errorMessage = result.message || 'An error occurred';
        alert(language === 'th' 
          ? `เกิดข้อผิดพลาด: ${errorMessage}` 
          : `Error: ${errorMessage}`
        );
        return;
      }

      console.log('Registration successful:', result);
      
      alert(language === 'th' ? 'ลงทะเบียนนักเรียนสำเร็จ!' : 'Student registration successful!');
      router.push('/students/list');
    } catch (error) {
      console.error('Error registering student:', error);
      alert(language === 'th' 
        ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง' 
        : 'Connection error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loadingCourses) {
    return (
      <ProtectedRoute minRole="teacher">
        <SidebarLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">
              {language === 'th' ? 'กำลังโหลดข้อมูลคอร์ส...' : 'Loading courses...'}
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (!registrationType) {
    return (
      <ProtectedRoute minRole="teacher">
        <SidebarLayout
          breadcrumbItems={[
            { label: language === 'th' ? 'จัดการนักเรียน' : 'Student Management', href: '/students' },
            { label: language === 'th' ? 'เพิ่มนักเรียนใหม่' : 'Add New Student' }
          ]}
        >
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'th' ? 'เพิ่มนักเรียนใหม่' : 'Add New Student'}
              </h1>
              <p className="text-gray-600">
                {language === 'th' ? 'เลือกรูปแบบการกรอกข้อมูลนักเรียน' : 'Choose the student registration form type'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Registration */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setRegistrationType('quick')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {language === 'th' ? 'ลงทะเบียนแบบรวดเร็ว' : 'Quick Registration'}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {language === 'th' 
                      ? 'กรอกข้อมูลพื้นฐาน ติดต่อ และสาขาที่ต้องการ รวดเร็วและง่าย'
                      : 'Fill basic information, contact details, and preferred branch. Fast and simple'
                    }
                  </p>
                  <div className="text-left space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {language === 'th' ? 'ข้อมูลพื้นฐาน' : 'Basic Information'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {language === 'th' ? 'ข้อมูลติดต่อ' : 'Contact Information'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {language === 'th' ? 'เลือกสาขาที่ต้องการ' : 'Branch Selection'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {language === 'th' ? 'ไม่ต้องใส่เลขบัตรประชาชน' : 'No Citizen ID required'}
                    </div>
                  </div>
                  <button className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium">
                    {language === 'th' ? 'เลือกแบบรวดเร็ว' : 'Choose Quick'}
                  </button>
                </div>
              </div>

              {/* Full Registration */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setRegistrationType('full')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {language === 'th' ? 'ลงทะเบียนแบบครบถ้วน' : 'Full Registration'}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {language === 'th' 
                      ? 'กรอกข้อมูลครบถ้วนรวมถึงความต้องการในการเรียน'
                      : 'Complete information including learning preferences'
                    }
                  </p>
                  <div className="text-left space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {language === 'th' ? 'ข้อมูลครบถ้วน' : 'Complete Information'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {language === 'th' ? 'ความต้องการในการเรียน' : 'Learning Preferences'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {language === 'th' ? 'ข้อมูลเลขบัตรประชาชน' : 'Citizen ID Information'}
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
                    {language === 'th' ? 'เลือกแบบครบถ้วน' : 'Choose Full'}
                  </button>
                </div>
              </div>

              {/* Legacy Form */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setRegistrationType('legacy')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {language === 'th' ? 'ฟอร์มเดิม (Legacy)' : 'Legacy Form'}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {language === 'th' 
                      ? 'ฟอร์มแบบเดิมที่ใช้งานอยู่ สำหรับความเข้ากันได้'
                      : 'Original form for backward compatibility'
                    }
                  </p>
                  <div className="text-left space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {language === 'th' ? 'ฟอร์มแบบดั้งเดิม' : 'Traditional Form'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {language === 'th' ? 'ใช้ระบบเดิม' : 'Uses Legacy System'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {language === 'th' ? 'อาจเลิกใช้ในอนาคต' : 'May be deprecated'}
                    </div>
                  </div>
                  <button className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium">
                    {language === 'th' ? 'เลือกฟอร์มเดิม' : 'Choose Legacy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                {language === 'th' 
                  ? 'แนะนำให้ใช้ "ลงทะเบียนแบบครบถ้วน" สำหรับข้อมูลที่สมบูรณ์ หรือ "ลงทะเบียนแบบรวดเร็ว" เพื่อความรวดเร็ว'
                  : 'Recommended to use "Full Registration" for complete information or "Quick Registration" for speed'
                }
              </p>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute minRole="teacher">
      <SidebarLayout
        breadcrumbItems={[
          { label: language === 'th' ? 'จัดการนักเรียน' : 'Student Management', href: '/students' },
          { label: language === 'th' ? 'เพิ่มนักเรียนใหม่' : 'Add New Student' }
        ]}
      >
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <button
              onClick={() => setRegistrationType(null)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {language === 'th' ? 'กลับ' : 'Back'}
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'th' ? 'เพิ่มนักเรียนใหม่' : 'Add New Student'}
              <span className="ml-2 text-lg font-normal text-gray-500">
                ({registrationType === 'quick' 
                  ? (language === 'th' ? 'แบบรวดเร็ว' : 'Quick')
                  : registrationType === 'full' 
                  ? (language === 'th' ? 'แบบครบถ้วน' : 'Full')
                  : (language === 'th' ? 'แบบเดิม' : 'Legacy')
                })
              </span>
            </h1>
            <p className="text-gray-600">
              {registrationType === 'legacy' 
                ? (language === 'th' ? 'กรอกข้อมูลนักเรียนใหม่เข้าสู่ระบบด้วยฟอร์มแบบเดิม' : 'Enter new student information using the legacy form')
                : (language === 'th' ? 'กรอกข้อมูลนักเรียนใหม่เข้าสู่ระบบ' : 'Enter new student information into the system')
              }
            </p>
          </div>
          
          {registrationType === 'legacy' ? (
            <StudentForm
              onSubmit={handleLegacySubmit}
              onCancel={handleCancel}
              loading={loading}
              mode="create"
              availableCourses={courses}
            />
          ) : (
            <StudentRegistrationForm
              registrationType={registrationType}
              onSubmit={handleNewSystemSubmit}
              loading={loading}
              availableCourses={courses}
            />
          )}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}
