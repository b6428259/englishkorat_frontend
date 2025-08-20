"use client"

import React from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';

interface FormErrorSummaryProps {
  errors: Record<string, string>;
  language?: 'th' | 'en';
  className?: string;
  autoScroll?: boolean;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  language = 'th',
  className = '',
  autoScroll = true
}) => {
  const errorEntries = Object.entries(errors);
  
  const scrollToFirstError = React.useCallback(() => {
    if (!autoScroll || errorEntries.length === 0) return;
    
    const firstErrorField = errorEntries[0][0];
    
    // Try to find the field by various selectors
    const selectors = [
      `[name="${firstErrorField}"]`,
      `[data-field="${firstErrorField}"]`,
      `#${firstErrorField}`,
      `.field-${firstErrorField}`
    ];

    let element: HTMLElement | null = null;
    
    for (const selector of selectors) {
      element = document.querySelector(selector);
      if (element) break;
    }

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Focus the element if it's focusable
      if (element.focus) {
        setTimeout(() => {
          element?.focus();
        }, 300);
      }
    }
  }, [errorEntries, autoScroll]);

  // Auto-scroll to first error when errors appear
  React.useEffect(() => {
    if (errorEntries.length > 0) {
      scrollToFirstError();
    }
  }, [errorEntries.length, scrollToFirstError]);
  
  if (errorEntries.length === 0) {
    return null;
  }

  const getFieldDisplayName = (fieldName: string): string => {
    const fieldNames = language === 'th' ? {
      firstName: 'ชื่อ',
      lastName: 'นามสกุล',
      firstNameEn: 'ชื่อ (อังกฤษ)',
      lastNameEn: 'นามสกุล (อังกฤษ)',
      dateOfBirth: 'วันเกิด',
      gender: 'เพศ',
      email: 'อีเมล',
      phone: 'เบอร์โทรศัพท์',
      address: 'ที่อยู่',
      preferredBranch: 'สาขา',
      preferredLanguage: 'ภาษาที่ต้องการเรียน',
      languageLevel: 'ระดับภาษา',
      learningStyle: 'รูปแบบการเรียน',
      currentEducation: 'ระดับการศึกษา',
      recentCEFR: 'ระดับทดสอบล่าสุด',
      lineId: 'LINE ID',
      nickName: 'ชื่อเล่น',
      teacherType: 'ประเภทครู',
      learningGoals: 'เหตุผลและเป้าหมาย',
      emergencyContact: 'ผู้ติดต่อฉุกเฉิน',
      emergencyPhone: 'เบอร์โทรฉุกเฉิน'
    } : {
      firstName: 'First Name',
      lastName: 'Last Name',
      firstNameEn: 'First Name (English)',
      lastNameEn: 'Last Name (English)',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      preferredBranch: 'Branch',
      preferredLanguage: 'Preferred Language',
      languageLevel: 'Language Level',
      learningStyle: 'Learning Style',
      currentEducation: 'Education Level',
      recentCEFR: 'Recent Test Level',
      lineId: 'LINE ID',
      nickName: 'Nickname',
      teacherType: 'Teacher Type',
      learningGoals: 'Learning Goals',
      emergencyContact: 'Emergency Contact',
      emergencyPhone: 'Emergency Phone'
    };

    return fieldNames[fieldName as keyof typeof fieldNames] || fieldName;
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <HiExclamationTriangle className="w-5 h-5 text-red-500 mt-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            {language === 'th' 
              ? `พบข้อผิดพลาด ${errorEntries.length} รายการ`
              : `${errorEntries.length} Error${errorEntries.length > 1 ? 's' : ''} Found`
            }
          </h3>
          <ul className="space-y-1">
            {errorEntries.map(([field, message]) => (
              <li key={field} className="text-sm text-red-700">
                <span className="font-medium">
                  {getFieldDisplayName(field)}:
                </span>{' '}
                {message}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={scrollToFirstError}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500/20 rounded transition-colors duration-200"
          >
            {language === 'th' ? 'ไปที่ข้อผิดพลาดแรก' : 'Go to First Error'}
          </button>
        </div>
      </div>
    </div>
  );
};
