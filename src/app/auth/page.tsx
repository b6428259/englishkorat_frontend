"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import AuthForm from '../../components/forms/AuthForm';
import Button from '../../components/common/Button';
import { SuccessModal, ErrorModal } from '../../components/common';
import { hasValidToken } from '@/utils/secureStorage';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  // // If already authenticated, skip login page
  // useEffect(() => {
  //   if (hasValidToken()) {
  //     setRedirecting(true);
  //     if (redirectUrl && redirectUrl !== '/auth') {
  //       router.replace(redirectUrl);
  //     } else {
  //       router.replace('/dashboard');
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [redirectUrl]);

  const handleBack = () => {
    router.push('/');
  };

  const handleAuthSuccess = () => {
    setShowSuccessModal(true);
    
    setTimeout(() => {
      if (redirectUrl && redirectUrl !== '/auth') {
        router.push(redirectUrl);
      } else {
        router.push('/dashboard');
      }
    }, 2000);
  };

  const handleAuthError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  return (
    redirecting ? (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Redirecting...</div>
      </div>
    ) : (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="เข้าสู่ระบบสำเร็จ!"
        message="กำลังนำคุณไปยังหน้าหลัก..."
        loadingMessage="กำลังเปลี่ยนหน้า..."
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="เข้าสู่ระบบไม่สำเร็จ"
        message={errorMessage}
      />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-indigo-200 to-blue-300 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Header with back button */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#334293] transition-all duration-200 group hover:bg-gray-50/50 px-3 py-2 rounded-lg cursor-pointer"
          >
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">หน้าแรก</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-xl">
          {/* Auth Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 rounded-3xl"></div>
            <div className="relative z-10">
              <AuthForm 
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
