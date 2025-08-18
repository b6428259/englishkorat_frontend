"use client";

import { useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import Dropdown from '../../components/common/Dropdown';

export default function StudentRegistrationPage() {
  const { t, language } = useLanguage();
  const [englishLevel, setEnglishLevel] = useState<string>('');
  const [gender, setGender] = useState<string>('');

  const englishLevelOptions = [
    { value: '', label: t.selectLevel },
    { value: 'beginner', label: t.beginner },
    { value: 'elementary', label: t.elementary },
    { value: 'intermediate', label: t.intermediate },
    { value: 'upper-intermediate', label: t.upperIntermediate },
    { value: 'advanced', label: t.advanced },
  ];

  const genderOptions = [
    { 
      value: '', 
      label: language === 'th' ? 'เลือกเพศ' : 'Select Gender' 
    },
    { 
      value: 'male', 
      label: language === 'th' ? 'ชาย' : 'Male' 
    },
    { 
      value: 'female', 
      label: language === 'th' ? 'หญิง' : 'Female' 
    },
    { 
      value: 'other', 
      label: language === 'th' ? 'อื่นๆ' : 'Other' 
    },
  ];

  return (
    <SidebarLayout>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.studentRegTitle}</h1>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">{t.basicInfo}</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.firstNameTh}</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder={t.pleaseEnterName}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.lastNameTh}</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder={t.pleaseEnterLastName}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'th' ? 'วันเกิด' : 'Date of Birth'}
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  required
                />
              </div>
              
              <Dropdown
                label={language === 'th' ? 'เพศ' : 'Gender'}
                options={genderOptions}
                value={gender}
                onChange={(value) => setGender(String(value))}
                placeholder={language === 'th' ? 'เลือกเพศ' : 'Select Gender'}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                {language === 'th' ? 'ข้อมูลติดต่อ' : 'Contact Information'}
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder={t.pleaseEnterEmail}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder={t.pleaseEnterPhone}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.address}</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  rows={3}
                  placeholder={t.pleaseEnterAddress}
                />
              </div>
              
              <Dropdown
                label={t.englishLevel}
                options={englishLevelOptions}
                value={englishLevel}
                onChange={(value) => setEnglishLevel(String(value))}
                placeholder={t.selectLevel}
              />
            </div>
          </div>
          
          {/* Course Preferences */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">{t.coursePreferences}</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {language === 'th' ? 'ประเภทคอร์สที่สนใจ (เลือกได้หลายอัน)' : 'Course Types of Interest (Multiple Selection)'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>
                    {language === 'th' ? 'การสนทนาทั่วไป (General Conversation)' : 'General Conversation'}
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>
                    {language === 'th' ? 'ภาษาอังกฤษเพื่อธุรกิจ (Business English)' : 'Business English'}
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>
                    {language === 'th' ? 'การเตรียมสอบ TOEIC/IELTS' : 'TOEIC/IELTS Test Preparation'}
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>
                    {language === 'th' ? 'ไวยากรณ์และการเขียน' : 'Grammar and Writing'}
                  </span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'th' ? 'เหตุผลในการเรียนภาษาอังกฤษ' : 'Reason for Learning English'}
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                rows={4}
                placeholder={
                  language === 'th' 
                    ? 'กรุณาอธิบายเหตุผลและเป้าหมายในการเรียน' 
                    : 'Please describe your reasons and learning goals'
                }
              />
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button 
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t.cancel}
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-[#334293] text-white rounded-md hover:bg-[#2a3875] transition-colors"
            >
              {t.register}
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
