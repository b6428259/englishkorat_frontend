"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthForm from '../../components/forms/AuthForm';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const handleBack = () => {
    if (redirectUrl && redirectUrl !== '/auth') {
      router.push(redirectUrl);
    } else {
      router.push('/');
    }
  };

  const handleAuthSuccess = () => {
    if (redirectUrl && redirectUrl !== '/auth') {
      router.push(redirectUrl);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header with back button */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#334293] transition-colors group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">ย้อนกลับ</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#334293] rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-xl">EK</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">English Korat</h1>
            <p className="text-gray-600">เข้าสู่ระบบเพื่อจัดการการเรียนของคุณ</p>
          </div>

          {/* Auth Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <AuthForm onSuccess={handleAuthSuccess} />
          </div>

          {/* Footer links */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>
              ยังไม่มีบัญชี?{' '}
              <button 
                onClick={() => router.push('/public/student/new')}
                className="text-[#334293] hover:text-[#2a3875] font-medium underline"
              >
                สมัครเรียนที่นี่
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20"></div>
      </div>
    </div>
  );
}
