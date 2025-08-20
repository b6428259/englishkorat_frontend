"use client";

import React from 'react';
import Link from 'next/link';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useLanguage } from '../../contexts/LanguageContext';

export default function StudentsPage() {
  const { t, language } = useLanguage();

  const studentOptions = [
    {
      title: t.studentList,
      description: language === 'th' ? 'ดูและจัดการรายชื่อนักเรียนทั้งหมด' : 'View and manage all students',
      href: '/students/list',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      title: t.studentNew,
      description: language === 'th' ? 'เพิ่มนักเรียนใหม่เข้าสู่ระบบ' : 'Add new student to the system',
      href: '/students/new',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      title: language === 'th' ? 'มอบหมาย' : 'Assign',
      description: language === 'th' ? 'มอบหมายนักเรียนให้กับครูและคอร์ส' : 'Assign students to teachers and courses',
      href: '/students/assign',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.studentManagement }
      ]}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.studentManagement}</h1>
            <p className="text-gray-600">
              {language === 'th' ? 'จัดการข้อมูลนักเรียนและการลงทะเบียน' : 'Manage student information and registrations'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentOptions.map((option, index) => (
              <Link
                key={index}
                href={option.href}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#334293] hover:shadow-md transition-all group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#334293] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform text-white">
                    {option.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
