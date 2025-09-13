"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/contexts/LanguageContext';
import { studentService } from '@/services/student.service';
import { courseService } from '@/services/course.service';
import type { Course } from '@/services/api/courses';
import type { StudentRegistrationRequest } from '@/services/api/students';
import StudentRegistrationForm from '@/components/forms/StudentRegistrationForm';

export default function StudentRegister() {
  const { language } = useLanguage();
  const router = useRouter();
  const [registrationType, setRegistrationType] = useState<'quick' | 'full' | null>(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getCourses();
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

  if (loadingCourses) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-gray-600">
          {language === 'th' ? 'กำลังโหลด...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!registrationType) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'th' ? 'ลงทะเบียนเรียน' : 'Student Registration'}
            </h1>
            <p className="mt-2 text-gray-600">
              {language === 'th' 
                ? 'เลือกรูปแบบการลงทะเบียนที่เหมาะสมกับคุณ'
                : 'Choose the registration type that suits you'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Registration */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
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
                <button
                  onClick={() => setRegistrationType('quick')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  {language === 'th' ? 'เลือกแบบรวดเร็ว' : 'Choose Quick'}
                </button>
              </div>
            </div>

            {/* Full Registration */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
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
                <button
                  onClick={() => setRegistrationType('full')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  {language === 'th' ? 'เลือกแบบครบถ้วน' : 'Choose Full'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {language === 'th' 
                ? 'หมายเหตุ: ท่านสามารถเปลี่ยนข้อมูลได้ภายหลังหลังจากลงทะเบียนแล้ว'
                : 'Note: You can update your information later after registration'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => setRegistrationType(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {language === 'th' ? 'กลับ' : 'Back'}
          </button>
        </div>
        
        <StudentRegistrationForm
          registrationType={registrationType}
          onSubmit={async (data: StudentRegistrationRequest) => {
            setLoading(true);
            try {
              const result = await studentService.registerStudent(data);
              if (result.success) {
                router.push('/students/student-register/success');
              }
            } catch (error) {
              console.error('Registration error:', error);
              alert(language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
          availableCourses={courses}
        />
      </div>
    </div>
  );
}
