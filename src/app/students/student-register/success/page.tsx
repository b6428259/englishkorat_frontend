"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegistrationSuccess() {
  const { language } = useLanguage();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'th' ? 'ลงทะเบียนสำเร็จ!' : 'Registration Successful!'}
          </h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              {language === 'th' 
                ? 'ขอบคุณที่ลงทะเบียนเรียนกับ English Korat คุณได้กรอกข้อมูลเรียบร้อยแล้ว ให้รอแอดมินติดต่อไปครับ'
                : 'Thank you for registering with English Korat. You have successfully submitted your information. Please wait for admin to contact you.'
              }
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              {language === 'th' ? 'หากพบปัญหาหรือต้องการสอบถาม' : 'If you have any issues or questions'}
            </h3>
            <div className="space-y-2 text-blue-800">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-medium">063-762-3059</span>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">thanida09@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              {language === 'th' 
                ? 'แอดมินจะติดต่อกลับภายใน 1-2 วันทำการ กรุณาเปิดโทรศัพท์และตรวจสอบ LINE ให้พร้อมรับการติดต่อ'
                : 'Admin will contact you within 1-2 business days. Please keep your phone on and check LINE for contact.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {language === 'th' ? 'กลับหน้าหลัก' : 'Go to Homepage'}
            </button>
            
            <button
              onClick={() => router.push('/students/student-register')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              {language === 'th' ? 'ลงทะเบียนคนอื่น' : 'Register Another Person'}
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {language === 'th' 
                ? 'English Korat - โรงเรียนสอนภาษาอังกฤษและจีนคุณภาพ'
                : 'English Korat - Quality English and Chinese Language School'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
