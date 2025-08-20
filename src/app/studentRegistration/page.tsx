"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from '@/components/common/SidebarLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import StudentForm from '@/components/forms/StudentForm';
import { courseService } from '@/services/course.service';
import { authService } from '@/services/auth.service';
import type { Course } from '@/services/api/courses'; // Import the Course type from the correct location

export default function studentRegistration() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/auth');
          return;
        }

        const coursesData = await courseService.getCourses();
        // Map courses to include missing branch_id, branch_name, branch_code if needed
        const mappedCourses = coursesData.data.courses.map((course: any) => ({
          ...course,
          branch_id: course.branch_id ?? 0,
          branch_name: course.branch_name ?? '',
          branch_code: course.branch_code ?? '',
        }));
        setCourses(mappedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        // If token is invalid, redirect to login
        if (error instanceof Error && error.message.includes('authentication')) {
          router.push('/auth');
          return;
        }
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [router]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        alert(language === 'th' ? 'กรุณาเข้าสู่ระบบใหม่' : 'Please login again');
        router.push('/auth');
        return;
      }

      console.log('Creating student:', data);
      
      // API call to create student - replace with actual endpoint
      const response = await fetch('http://54.254.53.52:3000/api/v1/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Show success message
      alert(language === 'th' ? 'เพิ่มนักเรียนสำเร็จ!' : 'Student added successfully!');
      
      // Redirect to student list
      router.push('/students/list');
    } catch (error) {
      console.error('Error creating student:', error);
      alert(language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loadingCourses) {
    return (
      <SidebarLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">
            {language === 'th' ? 'กำลังโหลดข้อมูลคอร์ส...' : 'Loading courses...'}
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.studentRegistration }
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
  );
}
