"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { studentService } from '@/services/student.service';
import { useSuccessToast, useErrorToast } from '@/components/common/Toast';
import { FormField, Input, FormActions } from '@/components/forms';
import type { Student } from '@/services/api/students';

interface ExamScores {
  grammar_score: number;
  speaking_score: number;
  listening_score: number;
  reading_score: number;
  writing_score: number;
}

export default function StudentExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [scores, setScores] = useState<ExamScores>({
    grammar_score: 0,
    speaking_score: 0,
    listening_score: 0,
    reading_score: 0,
    writing_score: 0
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ExamScores, string>>>({});

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getStudent(id as string);
      if (response.success && response.data.student) {
        const studentData = response.data.student;
        setStudent(studentData);
        
        // Pre-fill scores if they exist
        if (studentData.grammar_score !== undefined) {
          setScores({
            grammar_score: studentData.grammar_score || 0,
            speaking_score: studentData.speaking_score || 0,
            listening_score: studentData.listening_score || 0,
            reading_score: studentData.reading_score || 0,
            writing_score: studentData.writing_score || 0
          });
        }
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

  const handleScoreChange = (field: keyof ExamScores, value: string) => {
    const numValue = parseInt(value) || 0;
    
    // Validate score range (0-100)
    if (numValue < 0 || numValue > 100) {
      setErrors(prev => ({
        ...prev,
        [field]: language === 'th' ? 'คะแนนต้องอยู่ระหว่าง 0-100' : 'Score must be between 0-100'
      }));
      return;
    }

    // Clear error if valid
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    setScores(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const validateScores = (): boolean => {
    const newErrors: Partial<Record<keyof ExamScores, string>> = {};
    let isValid = true;

    // Check all scores are within valid range
    Object.entries(scores).forEach(([field, value]) => {
      if (value < 0 || value > 100) {
        newErrors[field as keyof ExamScores] = language === 'th' ? 'คะแนนต้องอยู่ระหว่าง 0-100' : 'Score must be between 0-100';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateScores()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await studentService.recordExamScores(id as string, scores);
      
      if (response.success) {
        successToast(language === 'th' ? 'บันทึกคะแนนสำเร็จ' : 'Exam scores recorded successfully');
        
        // Redirect back to assign page
        router.push('/students/assign');
      } else {
        errorToast(language === 'th' ? 'เกิดข้อผิดพลาดในการบันทึก' : 'Failed to record exam scores');
      }
    } catch (error) {
      console.error('Error recording exam scores:', error);
      errorToast(language === 'th' ? 'เกิดข้อผิดพลาดในการบันทึก' : 'Failed to record exam scores');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/students/assign');
  };

  const calculateAverage = (): number => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return Math.round(total / 5);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
        { label: language === 'th' ? 'บันทึกคะแนนสอบ' : 'Record Exam Scores' }
      ]}
    >
      <div className="space-y-6">
        {/* Student Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                {language === 'th' ? 'บันทึกคะแนนสอบ' : 'Record Exam Scores'}
              </h1>
              <p className="text-gray-600">
                {language === 'th' 
                  ? 'บันทึกคะแนนการสอบวัดระดับสำหรับนักเรียน'
                  : 'Record placement test scores for the student'
                }
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-black mb-2">
              {language === 'th' ? 'ข้อมูลนักเรียน' : 'Student Information'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-black">
                  {language === 'th' ? 'ชื่อ:' : 'Name:'} 
                </span>
                <span className="ml-2 text-black">
                  {student.first_name} {student.last_name}
                </span>
              </div>
              <div>
                <span className="font-medium text-black">
                  {language === 'th' ? 'ชื่อเล่น:' : 'Nickname:'} 
                </span>
                <span className="ml-2 text-black">
                  {student.nickname_th}
                </span>
              </div>
              <div>
                <span className="font-medium text-black">
                  {language === 'th' ? 'อีเมล:' : 'Email:'} 
                </span>
                <span className="ml-2 text-black">
                  {student.email || '-'}
                </span>
              </div>
              <div>
                <span className="font-medium text-black">
                  {language === 'th' ? 'โทรศัพท์:' : 'Phone:'} 
                </span>
                <span className="ml-2 text-black">
                  {student.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Score Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Grammar Score */}
              <FormField
                label={language === 'th' ? 'คะแนนไวยากรณ์' : 'Grammar Score'}
                error={errors.grammar_score}
                required
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.grammar_score.toString()}
                  onChange={(e) => handleScoreChange('grammar_score', e.target.value)}
                  placeholder="0-100"
                  error={!!errors.grammar_score}
                  className="text-black"
                />
              </FormField>

              {/* Speaking Score */}
              <FormField
                label={language === 'th' ? 'คะแนนการพูด' : 'Speaking Score'}
                error={errors.speaking_score}
                required
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.speaking_score.toString()}
                  onChange={(e) => handleScoreChange('speaking_score', e.target.value)}
                  placeholder="0-100"
                  error={!!errors.speaking_score}
                  className="text-black"
                />
              </FormField>

              {/* Listening Score */}
              <FormField
                label={language === 'th' ? 'คะแนนการฟัง' : 'Listening Score'}
                error={errors.listening_score}
                required
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.listening_score.toString()}
                  onChange={(e) => handleScoreChange('listening_score', e.target.value)}
                  placeholder="0-100"
                  error={!!errors.listening_score}
                  className="text-black"
                />
              </FormField>

              {/* Reading Score */}
              <FormField
                label={language === 'th' ? 'คะแนนการอ่าน' : 'Reading Score'}
                error={errors.reading_score}
                required
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.reading_score.toString()}
                  onChange={(e) => handleScoreChange('reading_score', e.target.value)}
                  placeholder="0-100"
                  error={!!errors.reading_score}
                  className="text-black"
                />
              </FormField>

              {/* Writing Score */}
              <FormField
                label={language === 'th' ? 'คะแนนการเขียน' : 'Writing Score'}
                error={errors.writing_score}
                required
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.writing_score.toString()}
                  onChange={(e) => handleScoreChange('writing_score', e.target.value)}
                  placeholder="0-100"
                  error={!!errors.writing_score}
                  className="text-black"
                />
              </FormField>

              {/* Average Score Display */}
              <div className="md:col-span-1 lg:col-span-1">
                <label className="block text-sm font-medium text-black mb-2">
                  {language === 'th' ? 'คะแนนเฉลี่ย' : 'Average Score'}
                </label>
                <div className={`p-3 border rounded-lg bg-gray-50 text-center ${getScoreColor(calculateAverage())}`}>
                  <span className="text-2xl font-bold">
                    {calculateAverage()}
                  </span>
                  <span className="text-sm ml-1">/ 100</span>
                </div>
              </div>
            </div>

            {/* Score Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-black mb-3">
                {language === 'th' ? 'สรุปคะแนน' : 'Score Summary'}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                {Object.entries(scores).map(([key, value]) => {
                  const labels = {
                    grammar_score: language === 'th' ? 'ไวยากรณ์' : 'Grammar',
                    speaking_score: language === 'th' ? 'การพูด' : 'Speaking',
                    listening_score: language === 'th' ? 'การฟัง' : 'Listening',
                    reading_score: language === 'th' ? 'การอ่าน' : 'Reading',
                    writing_score: language === 'th' ? 'การเขียน' : 'Writing'
                  };
                  
                  return (
                    <div key={key} className="text-center">
                      <div className="text-black font-medium">
                        {labels[key as keyof typeof labels]}
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(value)}`}>
                        {value}
                      </div>
                    </div>
                  );
                })}
                <div className="text-center">
                  <div className="text-black font-medium">
                    {language === 'th' ? 'เฉลี่ย' : 'Average'}
                  </div>
                  <div className={`text-lg font-bold ${getScoreColor(calculateAverage())}`}>
                    {calculateAverage()}
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {language === 'th' ? 'หมายเหตุ' : 'Note'}
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      {language === 'th' 
                        ? 'เมื่อบันทึกคะแนนสำเร็จ สถานะของนักเรียนจะเปลี่ยนเป็น "รอจัดกลุ่ม" โดยอัตโนมัติ'
                        : 'Once scores are recorded successfully, the student status will automatically change to "Waiting for Group"'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <FormActions
              onCancel={handleCancel}
              cancelText={language === 'th' ? 'ยกเลิก' : 'Cancel'}
              submitText={language === 'th' ? 'บันทึกคะแนน' : 'Record Scores'}
              loading={submitting}
            />
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}