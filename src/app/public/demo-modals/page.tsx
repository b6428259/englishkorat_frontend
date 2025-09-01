'use client';

import React, { useState } from 'react';
import { ModernSessionsModal } from '@/app/schedule/components/ModernSessionsModal';
import ModernScheduleModal from '@/app/schedule/components/ModernScheduleModal';
import { HiSparkles, HiCalendarDays } from 'react-icons/hi2';

// Mock data for testing
const mockCourses = [
  { 
    id: 1, 
    name: 'Basic English', 
    code: 'ENG001',
    course_name: 'Basic English', 
    course_code: 'ENG001',
    course_type: 'General',
    branch_id: 1,
    description: 'Basic English course for beginners',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category_id: 1,
    duration_id: 1,
    level: 'beginner',
    branch_name_en: 'Main Branch',
    branch_name_th: 'สาขาหลัก',
    branch_code: 'MAIN'
  },
  { 
    id: 2, 
    name: 'Intermediate English', 
    code: 'ENG002',
    course_name: 'Intermediate English',
    course_code: 'ENG002', 
    course_type: 'General',
    branch_id: 1,
    description: 'Intermediate English course',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category_id: 1,
    duration_id: 2,
    level: 'intermediate',
    branch_name_en: 'Main Branch',
    branch_name_th: 'สาขาหลัก',
    branch_code: 'MAIN'
  },
  { 
    id: 3, 
    name: 'Advanced English', 
    code: 'ENG003',
    course_name: 'Advanced English',
    course_code: 'ENG003',
    course_type: 'General',
    branch_id: 1,
    description: 'Advanced English course',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    category_id: 1,
    duration_id: 3,
    level: 'advanced',
    branch_name_en: 'Main Branch',
    branch_name_th: 'สาขาหลัก',
    branch_code: 'MAIN'
  },
];

const mockTeachers = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com' },
  { id: '2', name: 'Mike Wilson', email: 'mike@example.com' },
  { id: '3', name: 'Anna Chen', email: 'anna@example.com' },
];

const mockStudents = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
];

const mockRooms = [
  { id: 1, room_name: 'Room A', capacity: 20, branch_id: 1 },
  { id: 2, room_name: 'Room B', capacity: 15, branch_id: 1 },
  { id: 3, room_name: 'Room C', capacity: 10, branch_id: 1 },
];

const mockTeacherOptions = mockTeachers.map(teacher => ({
  id: parseInt(teacher.id),
  teacher_name: teacher.name,
  teacher_nickname: teacher.name.split(' ')[0], // Use first name as nickname
  teacher_email: teacher.email,
}));

// Transform courses for ModernSessionsModal (expects simplified format)
const mockCoursesForSessionModal = mockCourses.map(course => ({
  id: course.id.toString(),
  name: course.name,
  level: course.level,
  duration_hours: 60 // Default duration
}));

export default function ModalsDemo() {
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-center gap-3">
            <HiSparkles className="w-10 h-10 text-indigo-500" />
            Modernized Modals Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Experience the new modern, mobile-friendly modal designs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sessions Modal Demo */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4">
                <HiCalendarDays className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Sessions Modal
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage learning sessions with modern UX
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Smart Validation</span>
                <span className="text-green-500">✓</span>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Level Selection</span>
                <span className="text-green-500">✓</span>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Mobile Optimized</span>
                <span className="text-green-500">✓</span>
              </div>
            </div>

            <button
              onClick={() => setShowSessionsModal(true)}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
            >
              Open Sessions Modal
            </button>
          </div>

          {/* Schedule Modal Demo */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4">
                <HiSparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Schedule Modal
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create schedules with smart calculations and modern design
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Auto Calculations</span>
                <span className="text-green-500">✓</span>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Enhanced Options</span>
                <span className="text-green-500">✓</span>
              </div>
              <div className="flex items-center justify-between py-2 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Success States</span>
                <span className="text-green-500">✓</span>
              </div>
            </div>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              Open Schedule Modal
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            🎉 Modernization Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mobile First</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Touch-friendly interface optimized for all devices
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Modern Design</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Beautiful gradients, animations, and micro-interactions
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Smart UX</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time validation and intelligent suggestions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModernSessionsModal
        isOpen={showSessionsModal}
        onClose={() => setShowSessionsModal(false)}
        onConfirm={async () => {
          console.log('Sessions created!');
          setShowSessionsModal(false);
        }}
        selectedScheduleId="demo-schedule"
        scheduleName="Demo Schedule - English Basics"
        courses={mockCoursesForSessionModal}
        teachers={mockTeachers}
        students={mockStudents}
        availableSlots={[
          { day_of_week: 'monday', start_time: '09:00', end_time: '12:00' },
          { day_of_week: 'wednesday', start_time: '14:00', end_time: '17:00' },
          { day_of_week: 'friday', start_time: '10:00', end_time: '13:00' }
        ]}
      />

      <ModernScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={async () => {
          console.log('Schedule created!');
          setShowScheduleModal(false);
        }}
        courses={mockCourses}
        rooms={mockRooms}
        teachers={mockTeacherOptions}
      />
    </div>
  );
}