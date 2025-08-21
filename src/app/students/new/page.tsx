"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from '@/components/common/SidebarLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import StudentForm, { StudentFormData } from '@/components/forms/StudentForm';
import { courseService } from '@/services/course.service';
import type { Course } from '@/services/api/courses';

export default function NewStudentRegistrationByAdmin() {
  const { language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

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

const handleSubmit = async (data: StudentFormData) => {
  setLoading(true);
  try {
    // ตัวอย่าง log request ที่จะส่งไปหลังบ้าน
    const requestPayload = {
      method: 'POST',
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/students/register`,
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'th' ? 'เพิ่มนักเรียนใหม่' : 'Add New Student'}
          </h1>
          <p className="text-gray-600">
            {language === 'th' ? 'กรอกข้อมูลนักเรียนใหม่เข้าสู่ระบบ' : 'Enter new student information into the system'}
          </p>
        </div>
        
        <StudentForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          mode="create"
          availableCourses={courses}
        />
      </div>
    </SidebarLayout>
    </ProtectedRoute>
  );
}
