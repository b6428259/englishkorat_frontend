"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import StudentForm from '../../components/forms/StudentForm';

export default function StudentRegistrationPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      // TODO: API call to register student
      console.log('Registering student:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert(language === 'th' ? 'ลงทะเบียนนักเรียนสำเร็จ!' : 'Student registration successful!');
      
      // Redirect to dashboard or student list
      router.push('/dashboard');
    } catch (error) {
      console.error('Error registering student:', error);
      alert(language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <SidebarLayout>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.studentRegTitle}</h1>
          <p className="text-gray-600">
            {language === 'th' ? 'กรอกข้อมูลสำหรับลงทะเบียนเรียน' : 'Fill in information to register for courses'}
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
