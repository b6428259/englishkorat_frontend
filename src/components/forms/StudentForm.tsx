"use client"

import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  FormField,
  Input,
  DateInput,
  Textarea,
  Select,
  Checkbox,
  FormActions,
  FormSection
} from '../forms';

interface StudentFormData {
  firstName: string;
  lastName: string;
  firstNameEn?: string;
  lastNameEn?: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  englishLevel: string;
  courseInterests: string[];
  learningGoals: string;
  parentName?: string;
  parentPhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const StudentForm: React.FC<StudentFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create'
}) => {
  const { t, language } = useLanguage();
  
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    firstNameEn: initialData.firstNameEn || '',
    lastNameEn: initialData.lastNameEn || '',
    dateOfBirth: initialData.dateOfBirth || '',
    gender: initialData.gender || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    englishLevel: initialData.englishLevel || '',
    courseInterests: initialData.courseInterests || [],
    learningGoals: initialData.learningGoals || '',
    parentName: initialData.parentName || '',
    parentPhone: initialData.parentPhone || '',
    emergencyContact: initialData.emergencyContact || '',
    emergencyPhone: initialData.emergencyPhone || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});

  // Options for dropdowns
  const genderOptions = [
    { value: '', label: language === 'th' ? 'เลือกเพศ' : 'Select Gender' },
    { value: 'male', label: language === 'th' ? 'ชาย' : 'Male' },
    { value: 'female', label: language === 'th' ? 'หญิง' : 'Female' },
    { value: 'other', label: language === 'th' ? 'อื่นๆ' : 'Other' },
  ];

  const englishLevelOptions = [
    { value: '', label: t.selectLevel },
    { value: 'beginner', label: t.beginner },
    { value: 'elementary', label: t.elementary },
    { value: 'intermediate', label: t.intermediate },
    { value: 'upper-intermediate', label: t.upperIntermediate },
    { value: 'advanced', label: t.advanced },
  ];

  const courseOptions = [
    { 
      id: 'conversation', 
      label: language === 'th' ? 'การสนทนาทั่วไป (General Conversation)' : 'General Conversation',
      description: language === 'th' ? 'พัฒนาทักษะการสนทนาในชีวิตประจำวัน' : 'Develop everyday conversation skills'
    },
    { 
      id: 'business', 
      label: language === 'th' ? 'ภาษาอังกฤษเพื่อธุรกิจ (Business English)' : 'Business English',
      description: language === 'th' ? 'เน้นการใช้ภาษาในสถานการณ์ทางธุรกิจ' : 'Focus on business communication'
    },
    { 
      id: 'test-prep', 
      label: language === 'th' ? 'การเตรียมสอบ TOEIC/IELTS' : 'TOEIC/IELTS Test Preparation',
      description: language === 'th' ? 'เตรียมความพร้อมสำหรับการสอบมาตรฐาน' : 'Prepare for standardized tests'
    },
    { 
      id: 'grammar', 
      label: language === 'th' ? 'ไวยากรณ์และการเขียน' : 'Grammar and Writing',
      description: language === 'th' ? 'เสริมสร้างพื้นฐานไวยากรณ์และทักษะการเขียน' : 'Strengthen grammar foundation and writing skills'
    },
  ];

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCourseInterestChange = (courseId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      courseInterests: checked 
        ? [...prev.courseInterests, courseId]
        : prev.courseInterests.filter(id => id !== courseId)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StudentFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = language === 'th' ? 'กรุณากรอกชื่อ' : 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = language === 'th' ? 'กรุณากรอกนามสกุล' : 'Last name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = language === 'th' ? 'กรุณาเลือกวันเกิด' : 'Date of birth is required';
    }
    if (!formData.gender) {
      newErrors.gender = language === 'th' ? 'กรุณาเลือกเพศ' : 'Gender is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = language === 'th' ? 'กรุณากรอกอีเมล' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = language === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์' : 'Phone number is required';
    }
    if (!formData.englishLevel) {
      newErrors.englishLevel = language === 'th' ? 'กรุณาเลือกระดับภาษาอังกฤษ' : 'English level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <FormSection title={t.basicInfo}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField 
            label={t.firstNameTh} 
            required 
            error={errors.firstName}
          >
            <Input
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder={t.pleaseEnterName}
              error={!!errors.firstName}
            />
          </FormField>

          <FormField 
            label={t.lastNameTh} 
            required 
            error={errors.lastName}
          >
            <Input
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder={t.pleaseEnterLastName}
              error={!!errors.lastName}
            />
          </FormField>

          <FormField 
            label={language === 'th' ? 'ชื่อ (อังกฤษ)' : 'First Name (English)'}
          >
            <Input
              value={formData.firstNameEn}
              onChange={(e) => handleInputChange('firstNameEn', e.target.value)}
              placeholder={language === 'th' ? 'ชื่อภาษาอังกฤษ (ไม่บังคับ)' : 'English first name (optional)'}
            />
          </FormField>

          <FormField 
            label={language === 'th' ? 'นามสกุล (อังกฤษ)' : 'Last Name (English)'}
          >
            <Input
              value={formData.lastNameEn}
              onChange={(e) => handleInputChange('lastNameEn', e.target.value)}
              placeholder={language === 'th' ? 'นามสกุลภาษาอังกฤษ (ไม่บังคับ)' : 'English last name (optional)'}
            />
          </FormField>

          <FormField 
            label={language === 'th' ? 'วันเกิด' : 'Date of Birth'} 
            required 
            error={errors.dateOfBirth}
          >
            <DateInput
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              error={!!errors.dateOfBirth}
            />
          </FormField>

          <FormField 
            label={language === 'th' ? 'เพศ' : 'Gender'} 
            required 
            error={errors.gender}
          >
            <Select
              options={genderOptions}
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              error={!!errors.gender}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Contact Information */}
      <FormSection title={language === 'th' ? 'ข้อมูลติดต่อ' : 'Contact Information'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField 
            label={t.email} 
            required 
            error={errors.email}
          >
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t.pleaseEnterEmail}
              error={!!errors.email}
            />
          </FormField>

          <FormField 
            label={t.phone} 
            required 
            error={errors.phone}
          >
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t.pleaseEnterPhone}
              error={!!errors.phone}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label={t.address}>
              <Textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={t.pleaseEnterAddress}
                rows={3}
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* Academic Information */}
      <FormSection title={language === 'th' ? 'ข้อมูลการเรียน' : 'Academic Information'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField 
            label={t.englishLevel} 
            required 
            error={errors.englishLevel}
          >
            <Select
              options={englishLevelOptions}
              value={formData.englishLevel}
              onChange={(e) => handleInputChange('englishLevel', e.target.value)}
              error={!!errors.englishLevel}
            />
          </FormField>
        </div>

        <div className="space-y-4">
          <FormField 
            label={language === 'th' ? 'ประเภทคอร์สที่สนใจ (เลือกได้หลายอัน)' : 'Course Types of Interest (Multiple Selection)'}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courseOptions.map((course) => (
                <Checkbox
                  key={course.id}
                  label={course.label}
                  description={course.description}
                  checked={formData.courseInterests.includes(course.id)}
                  onChange={(e) => handleCourseInterestChange(course.id, e.target.checked)}
                />
              ))}
            </div>
          </FormField>

          <FormField 
            label={language === 'th' ? 'เหตุผลและเป้าหมายในการเรียน' : 'Learning Reasons and Goals'}
          >
            <Textarea
              value={formData.learningGoals}
              onChange={(e) => handleInputChange('learningGoals', e.target.value)}
              placeholder={language === 'th' ? 'กรุณาอธิบายเหตุผลและเป้าหมายในการเรียน' : 'Please describe your reasons and learning goals'}
              rows={4}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Emergency Contact */}
      <FormSection title={language === 'th' ? 'ข้อมูลติดต่อฉุกเฉิน' : 'Emergency Contact'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label={language === 'th' ? 'ชื่อผู้ปกครอง/ติดต่อฉุกเฉิน' : 'Parent/Emergency Contact Name'}>
            <Input
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder={language === 'th' ? 'ชื่อผู้ติดต่อฉุกเฉิน' : 'Emergency contact name'}
            />
          </FormField>

          <FormField label={language === 'th' ? 'เบอร์โทรติดต่อฉุกเฉิน' : 'Emergency Contact Phone'}>
            <Input
              type="tel"
              value={formData.emergencyPhone}
              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
              placeholder={language === 'th' ? 'เบอร์โทรฉุกเฉิน' : 'Emergency phone number'}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Form Actions */}
      <FormActions
        onCancel={onCancel}
        cancelText={t.cancel}
        submitText={mode === 'create' ? (language === 'th' ? 'เพิ่มนักเรียน' : 'Add Student') : t.saveData}
        loading={loading}
      />
    </form>
  );
};

export default StudentForm;
