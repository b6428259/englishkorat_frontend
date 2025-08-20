"use client"

import React, { useState } from 'react';
import { HiUser, HiGlobeAlt, HiCheck } from 'react-icons/hi2';

interface TeacherType {
  value: 'thai' | 'native' | '';
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface TeacherTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  language?: 'th' | 'en';
}

export const TeacherTypeSelector: React.FC<TeacherTypeSelectorProps> = ({
  value,
  onChange,
  error = false,
  disabled = false,
  language = 'th'
}) => {
  const [focused, setFocused] = useState(false);

  const teacherTypes: TeacherType[] = [
    {
      value: '',
      label: language === 'th' ? 'เลือกประเภทครู' : 'Select Teacher Type',
      description: language === 'th' ? 'กรุณาเลือกประเภทครูที่ต้องการ' : 'Please select preferred teacher type',
      icon: <HiUser className="w-5 h-5" />,
      color: 'gray'
    },
    {
      value: 'thai',
      label: language === 'th' ? 'ครูไทย' : 'Thai Teacher',
      description: language === 'th' ? 'ครูชาวไทยที่สามารถสื่อสารภาษาไทยได้' : 'Thai teacher who can communicate in Thai',
      icon: <HiUser className="w-5 h-5" />,
      color: 'blue'
    },
    {
      value: 'native',
      label: language === 'th' ? 'ครู Native' : 'Native Teacher',
      description: language === 'th' ? 'ครูเจ้าของภาษาเพื่อการเรียนรู้ที่แท้จริง' : 'Native speaker for authentic language learning',
      icon: <HiGlobeAlt className="w-5 h-5" />,
      color: 'green'
    }
  ];

  const selectedTeacher = teacherTypes.find(t => t.value === value);

  return (
    <div className="space-y-3">
      {/* Header with current selection */}
      <div 
        className={`
          relative p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
          ${error ? 'border-red-400 bg-red-50/50' : 
            focused ? 'border-blue-400 bg-blue-50/50' : 
            'border-gray-200 bg-white hover:border-gray-300'}
        `}
        onClick={() => !disabled && setFocused(!focused)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              p-2 rounded-lg transition-colors duration-200
              ${selectedTeacher?.value === '' ? 'bg-gray-100 text-gray-400' : 
                selectedTeacher?.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                selectedTeacher?.color === 'green' ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-400'}
            `}>
              {selectedTeacher?.icon}
            </div>
            <div>
              <h3 className={`font-medium ${
                selectedTeacher?.value === '' ? 'text-gray-400' : 'text-gray-800'
              }`}>
                {selectedTeacher?.label}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedTeacher?.description}
              </p>
            </div>
          </div>
          <div className={`
            transform transition-transform duration-300
            ${focused ? 'rotate-180' : 'rotate-0'}
          `}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Options dropdown */}
      {focused && !disabled && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          {teacherTypes.filter(t => t.value !== '').map((teacher) => (
            <div
              key={teacher.value}
              className={`
                p-3 border-2 rounded-xl cursor-pointer transition-all duration-200
                hover:shadow-sm transform hover:scale-[1.02]
                ${value === teacher.value ? 
                  `${teacher.color === 'blue' ? 'border-blue-400 bg-blue-50' : 'border-green-400 bg-green-50'}` :
                  'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => {
                onChange(teacher.value);
                setFocused(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-2 rounded-lg transition-colors duration-200
                    ${teacher.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}
                  `}>
                    {teacher.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{teacher.label}</h4>
                    <p className="text-sm text-gray-500">{teacher.description}</p>
                  </div>
                </div>
                {value === teacher.value && (
                  <div className={`
                    p-1 rounded-full
                    ${teacher.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}
                  `}>
                    <HiCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {focused && (
        <div 
          className="fixed inset-0 z-[-1]"
          onClick={() => setFocused(false)}
        />
      )}
    </div>
  );
};
