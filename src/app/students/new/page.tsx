"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from '../../../components/common/SidebarLayout';
import { useLanguage } from '../../../contexts/LanguageContext';
import StudentForm from '../../../components/forms/StudentForm';

export default function StudentNewPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      // TODO: API call to create student
      console.log('Creating student:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message (you can implement a toast notification here)
      alert(language === 'th' ? 'เพิ่มนักเรียนสำเร็จ!' : 'Student added successfully!');
      
      // Redirect to student list or dashboard
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

  return (
    <SidebarLayout 
      breadcrumbItems={[
        { label: language === 'th' ? 'นักเรียน' : 'Students', href: '/students/list' },
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
        />
      </div>
    </SidebarLayout>
  );
}
