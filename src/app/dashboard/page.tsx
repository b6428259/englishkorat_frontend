"use client";

import SidebarLayout from '../../components/common/SidebarLayout';
import { ProtectedRoute } from '../../components/common/ProtectedRoute';
import { RoleGuard } from '../../components/common/RoleGuard';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'owner': return 'เจ้าของ';
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'teacher': return 'อาจารย์';
      case 'student': return 'นักเรียน';
      default: return role;
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout
        breadcrumbItems={[
          { label: t.dashboard }
        ]}
      >
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.dashboard}</h1>
            
            <div className="bg-gradient-to-r from-[#334293] to-[#4a5cb8] text-white rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    สวัสดี, {user?.username}!
                  </h2>
                  <p className="text-blue-100 mb-2">
                    {language === 'th' ? 'ยินดีต้อนรับเข้าสู่ระบบ English Korat' : 'Welcome to English Korat System'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-blue-100">
                    <span>บทบาท: {getRoleDisplayName(user?.role || '')}</span>
                    {user?.branch_name && <span>สาขา: {user.branch_name}</span>}
                  </div>
                </div>
                {user?.avatar && (
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${user.avatar}`}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Actions - Role-based */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Students - Available to all roles */}
              <RoleGuard requireAuth={true}>
                <Link 
                  href="/students" 
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#334293] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#334293] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">นักเรียน</h4>
                  <p className="text-sm text-gray-600">
                    จัดการข้อมูลนักเรียนและการลงทะเบียน
                  </p>
                </Link>
              </RoleGuard>

              {/* Teachers - Admin and Owner only */}
              <RoleGuard roles={['admin', 'owner']}>
                <Link 
                  href="/teachers" 
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#334293] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">อาจารย์</h4>
                  <p className="text-sm text-gray-600">
                    จัดการข้อมูลอาจารย์และมอบหมายงาน
                  </p>
                </Link>
              </RoleGuard>
              
              {/* Schedule */}
              <Link 
                href="/schedule" 
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#334293] hover:shadow-md transition-all group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">ตารางเรียน</h4>
                <p className="text-sm text-gray-600">
                  ดูตารางเรียนและการนัดหมาย
                </p>
              </Link>

              {/* System Settings - Owner only */}
              <RoleGuard roles={['owner']}>
                <Link 
                  href="/systemSettings" 
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#334293] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">ตั้งค่าระบบ</h4>
                  <p className="text-sm text-gray-600">
                    จัดการการตั้งค่าระบบและสิทธิ์การเข้าถึง
                  </p>
                </Link>
              </RoleGuard>

              {/* Profile Settings */}
              <Link 
                href="/settings/profile" 
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#334293] hover:shadow-md transition-all group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">โปรไฟล์</h4>
                <p className="text-sm text-gray-600">
                  จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี
                </p>
              </Link>
            </div>
          </div>

          {/* Stats Dashboard - Role based */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RoleGuard minRole="teacher">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">นักเรียนทั้งหมด</p>
                    <p className="text-3xl font-bold text-gray-900">145</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </RoleGuard>

            <RoleGuard roles={['admin', 'owner']}>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">อาจารย์</p>
                    <p className="text-3xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </RoleGuard>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">คลาสวันนี้</p>
                  <p className="text-3xl font-bold text-gray-900">8</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <RoleGuard minRole="admin">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">รายได้เดือนนี้</p>
                    <p className="text-3xl font-bold text-gray-900">₿45,000</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>
            </RoleGuard>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมล่าสุด</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">เข้าสู่ระบบสำเร็จ</p>
                  <p className="text-xs text-gray-500">เมื่อ {new Date().toLocaleTimeString('th-TH')}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">อัปเดตโปรไฟล์</p>
                  <p className="text-xs text-gray-500">เมื่อ 2 ชั่วโมงที่แล้ว</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}
