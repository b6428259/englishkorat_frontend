"use client"

import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";

export default function StudentRegistrationSuccessPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {language === 'th' ? 'ลงทะเบียนสำเร็จ' : 'Registration Successful'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {language === 'th' 
              ? 'ขอบคุณที่ลงทะเบียนกับเรา เราจะติดต่อกลับไปเร็วๆ นี้'
              : 'Thank you for registering with us. We will contact you soon.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}