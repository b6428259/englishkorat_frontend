"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { studentService } from '@/services/student.service';
import { useSuccessToast, useErrorToast } from '@/components/common/Toast';
import StudentForm, { StudentFormData } from '@/components/forms/StudentForm';
import type { Student } from '@/services/api/students';

export default function StudentEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if this is completion mode (from pending_review status)
  const isCompletionMode = searchParams.get('mode') === 'complete';

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getStudent(id as string);
      if (response.success && response.data.student) {
        setStudent(response.data.student);
      } else {
        setError('Failed to load student data');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      setError('Error loading student data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id, fetchStudent]);

  const handleSubmit = async (formData: StudentFormData) => {
    try {
      setSubmitting(true);
      
      // For completion mode, citizen_id is required
      if (isCompletionMode && !formData.citizenId.trim()) {
        errorToast(language === 'th' ? 'กรุณากรอกเลขบัตรประชาชน' : 'Citizen ID is required');
        return;
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        citizen_id: formData.citizenId,
        first_name_en: formData.firstNameEn,
        last_name_en: formData.lastNameEn,
        nickname_th: formData.nicknameTh,
        nickname_en: formData.nicknameEn,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        preferred_branch_id: formData.preferredBranch ? parseInt(formData.preferredBranch) : undefined,
        preferred_language: formData.preferredLanguage,
        language_level: formData.languageLevel,
        learning_style: formData.learningStyle,
        learning_goals: formData.learningGoals,
        parent_name: formData.parentName,
        parent_phone: formData.parentPhone,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone,
        line_id: formData.lineId,
        current_education: formData.currentEducation,
        recent_cefr: formData.recentCEFR,
        teacher_type: formData.teacherType,
        preferred_time_slots: formData.preferredTimeSlots,
        unavailable_time_slots: formData.unavailableTimeSlots
      };

      // If in completion mode, also update the registration status
      if (isCompletionMode) {
        updateData.registration_status = 'schedule_exam';
      }

      const response = await studentService.updateStudent(id as string, updateData);
      
      if (response.success) {
        successToast(language === 'th' ? 'บันทึกข้อมูลสำเร็จ' : 'Student updated successfully');
        
        if (isCompletionMode) {
          // Redirect back to assign page after completion
          router.push('/students/assign');
        } else {
          // Redirect to student list
          router.push('/students/list');
        }
      } else {
        errorToast(language === 'th' ? 'เกิดข้อผิดพลาดในการบันทึก' : 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      errorToast(language === 'th' ? 'เกิดข้อผิดพลาดในการบันทึก' : 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isCompletionMode) {
      router.push('/students/assign');
    } else {
      router.push('/students/list');
    }
  };

  // Convert Student to StudentFormData
  const convertToFormData = (student: Student): Partial<StudentFormData> => {
    return {
      firstName: student.first_name || '',
      lastName: student.last_name || '',
      citizenId: student.citizen_id || '',
      firstNameEn: student.first_name_en || '',
      lastNameEn: student.last_name_en || '',
      nicknameTh: student.nickname_th || '',
      nicknameEn: student.nickname_en || '',
      dateOfBirth: student.date_of_birth || '',
      gender: student.gender || '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      preferredBranch: student.preferred_branch_id?.toString() || '',
      preferredLanguage: student.preferred_language || '',
      languageLevel: student.language_level || '',
      learningStyle: student.learning_style || '',
      learningGoals: student.learning_goals || '',
      parentName: student.parent_name || '',
      parentPhone: student.parent_phone || '',
      emergencyContact: student.emergency_contact || '',
      emergencyPhone: student.emergency_phone || '',
      lineId: student.line_id || '',
      currentEducation: student.current_education || '',
      recentCEFR: student.recent_cefr || '',
      teacherType: student.teacher_type || '',
      preferredTimeSlots: student.preferred_time_slots || [],
      unavailableTimeSlots: student.unavailable_time_slots || []
    };
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-black">
            {language === 'th' ? 'กำลังโหลด...' : 'Loading...'}
          </span>
        </div>
      </SidebarLayout>
    );
  }

  if (error || !student) {
    return (
      <SidebarLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-2">
            {language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error occurred'}
          </div>
          <p className="text-black">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {language === 'th' ? 'กลับ' : 'Go Back'}
          </button>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: language === 'th' ? 'นักเรียน' : 'Students', href: '/students' },
        { label: language === 'th' ? 'จัดการ' : 'Manage', href: '/students/assign' },
        { 
          label: isCompletionMode 
            ? (language === 'th' ? 'ตรวจสอบและกรอกข้อมูล' : 'Review & Complete Info')
            : (language === 'th' ? 'แก้ไขข้อมูล' : 'Edit Student')
        }
      ]}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black mb-2">
              {isCompletionMode 
                ? (language === 'th' ? 'ตรวจสอบและกรอกข้อมูลนักเรียน' : 'Review & Complete Student Information')
                : (language === 'th' ? 'แก้ไขข้อมูลนักเรียน' : 'Edit Student Information')
              }
            </h1>
            <p className="text-gray-600">
              {isCompletionMode 
                ? (language === 'th' 
                    ? 'กรุณาตรวจสอบและกรอกข้อมูลที่ขาดหายไป โดยเฉพาะเลขบัตรประชาชน'
                    : 'Please review and complete missing information, especially the Citizen ID'
                  )
                : (language === 'th' 
                    ? 'แก้ไขข้อมูลนักเรียนตามต้องการ'
                    : 'Edit student information as needed'
                  )
              }
            </p>
            {isCompletionMode && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      {language === 'th' ? 'ข้อมูลที่จำเป็น' : 'Required Information'}
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        {language === 'th' 
                          ? 'เลขบัตรประชาชนเป็นข้อมูลที่จำเป็นต้องกรอก เมื่อบันทึกสำเร็จ สถานะจะเปลี่ยนเป็น "จัดสอบ"'
                          : 'Citizen ID is required. Once saved successfully, status will change to "Schedule Exam"'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <StudentForm
            initialData={convertToFormData(student)}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
            mode="edit"
          />
        </div>
      </div>
    </SidebarLayout>
  );
}