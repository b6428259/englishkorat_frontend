"use client"

import React from "react";
import SidebarLayout from '../../../components/common/SidebarLayout';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function StudentListPage() {
  const { t } = useLanguage();
  return (
    <SidebarLayout>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-4">รายชื่อนักเรียน</h1>
        <p className="text-gray-700">แสดงรายชื่อนักเรียนทั้งหมดที่ลงทะเบียนในระบบ</p>
        {/* TODO: Add student list table here */}
      </div>
    </SidebarLayout>
  );
}
