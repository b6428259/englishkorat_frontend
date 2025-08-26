"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarLayout from '../../../components/common/SidebarLayout';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { FormField } from '../../../components/forms/FormField';
import { Select } from '../../../components/forms/Select';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function TeacherAssignPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  // Mock data - replace with real API calls
  const teacherOptions = [
    { value: '', label: 'เลือกครู' },
    { value: '1', label: 'ครูจอห์น (John)' },
    { value: '2', label: 'ครูเจน (Jane)' },
    { value: '3', label: 'ครูมาร์ค (Mark)' }
  ];

  const courseOptions = [
    { value: '', label: 'เลือกคอร์ส' },
    { value: '1', label: 'General English - Beginner' },
    { value: '2', label: 'IELTS Preparation' },
    { value: '3', label: 'Business English' },
    { value: '4', label: 'Kids English' }
  ];

  const studentOptions = [
    { value: '', label: 'เลือกนักเรียน' },
    { value: '1', label: 'นาย สมชาย ใจดี' },
    { value: '2', label: 'นางสาว มาลี รักเรียน' },
    { value: '3', label: 'เด็กชาย ปีเตอร์ สมิท' }
  ];

  const handleAssign = async () => {
    if (!selectedTeacher || !selectedCourse || !selectedStudent) {
      alert('กรุณาเลือกครู คอร์ส และนักเรียนให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      // API call to assign teacher
      console.log('Assigning:', { selectedTeacher, selectedCourse, selectedStudent });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('มอบหมายงานสำเร็จ!');
      
      // Reset form
      setSelectedTeacher('');
      setSelectedCourse('');
      setSelectedStudent('');
    } catch (error) {
      console.error('Assignment failed:', error);
      alert('เกิดข้อผิดพลาดในการมอบหมายงาน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.teacherManagement },
        { label: 'มอบหมายงาน' }
      ]}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">มอบหมายงานให้ครู</h1>
          <p className="text-gray-600">เลือกครู คอร์ส และนักเรียนเพื่อทำการมอบหมายงาน</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <FormField label="เลือกครู" required>
            <Select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              options={teacherOptions}
              required
            />
          </FormField>

          <FormField label="เลือกคอร์ส" required>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              options={courseOptions}
              required
            />
          </FormField>

          <FormField label="เลือกนักเรียน" required>
            <Select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              options={studentOptions}
              required
            />
          </FormField>

          {/* Assignment Summary */}
          {selectedTeacher && selectedCourse && selectedStudent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">สรุปการมอบหมายงาน</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><span className="font-medium">ครู:</span> {teacherOptions.find(t => t.value === selectedTeacher)?.label}</p>
                <p><span className="font-medium">คอร์ส:</span> {courseOptions.find(c => c.value === selectedCourse)?.label}</p>
                <p><span className="font-medium">นักเรียน:</span> {studentOptions.find(s => s.value === selectedStudent)?.label}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/teachers/list')}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleAssign}
              disabled={loading || !selectedTeacher || !selectedCourse || !selectedStudent}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  กำลังมอบหมาย...
                </>
              ) : (
                'มอบหมายงาน'
              )}
            </Button>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">การมอบหมายงานล่าสุด</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">ครูจอห์น → IELTS Preparation</p>
                <p className="text-sm text-gray-600">นักเรียน: นาย สมชาย ใจดี</p>
              </div>
              <span className="text-xs text-gray-500">2 ชั่วโมงที่แล้ว</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">ครูเจน → Kids English</p>
                <p className="text-sm text-gray-600">นักเรียน: เด็กชาย ปีเตอร์ สมิท</p>
              </div>
              <span className="text-xs text-gray-500">1 วันที่แล้ว</span>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}