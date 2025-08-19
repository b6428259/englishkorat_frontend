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
  preferredBranch: string;
  preferredLanguage: string;
  languageLevel: string;
  selectedCourses: number[];
  learningStyle: string;
  learningGoals: string;
  parentName?: string;
  parentPhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  lineId: string;
  nickName: string;
  currentEducation: string;
  recentCEFR: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
  course_type: string;
  description: string;
  price: string;
  hours_total: number;
  max_students: number;
  level: string;
  branch_id: number;
  branch_name: string;
  branch_code: string;
}

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
  availableCourses?: Course[];
}

const StudentForm: React.FC<StudentFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create',
  availableCourses = []
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
    preferredBranch: initialData.preferredBranch || '',
    preferredLanguage: initialData.preferredLanguage || '',
    languageLevel: initialData.languageLevel || '',
    selectedCourses: initialData.selectedCourses || [],
    learningStyle: initialData.learningStyle || '',
    learningGoals: initialData.learningGoals || '',
    parentName: initialData.parentName || '',
    parentPhone: initialData.parentPhone || '',
    emergencyContact: initialData.emergencyContact || '',
    emergencyPhone: initialData.emergencyPhone || '',
    lineId: initialData.lineId || '',
    nickName: initialData.nickName || '',
    currentEducation: initialData.currentEducation || '',
    recentCEFR: initialData.recentCEFR || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});

  const currentEducationLevelOptions = [
    { value: '', label: language === 'th' ? 'ระดับการศึกษาปัจจุบัน' : 'Current Education Level' },
    { value: 'noCurrentEducation', label: language === 'th' ? 'ไม่ได้ศึกษาในปัจจุบัน' : 'No Current Education' },
    { value: 'kindergarten', label: language === 'th' ? 'ระดับอนุบาล' : 'Kindergarten' },
    { value: 'grade1', label: language === 'th' ? 'ชั้นประถมศึกษาปีที่ 1' : 'Grade 1' },
    { value: 'grade2', label: language === 'th' ? 'ชั้นประถมศึกษาปีที่ 2' : 'Grade 2' },
    { value: 'grade3', label: language === 'th' ? 'ชั้นประถมศึกษาปีที่ 3' : 'Grade 3' },
    { value: 'grade4', label: language === 'th' ? 'ชั้นประถมศึกษาปีที่ 4' : 'Grade 4' },
    { value: 'grade5', label: language === 'th' ? 'ชั้นประถมศึกษาปีที่ 5' : 'Grade 5' },
    { value: 'grade6', label: language === 'th' ? 'ชั้นประถมศึกษาปีที่ 6' : 'Grade 6' },
    { value: 'grade7', label: language === 'th' ? 'ชั้นมัธยมศึกษาปีที่ 1' : 'Grade 7' },
    { value: 'grade8', label: language === 'th' ? 'ชั้นมัธยมศึกษาปีที่ 2' : 'Grade 8' },
    { value: 'grade9', label: language === 'th' ? 'ชั้นมัธยมศึกษาปีที่ 3' : 'Grade 9' },
    { value: 'grade10', label: language === 'th' ? 'ชั้นมัธยมศึกษาปีที่ 4' : 'Grade 10' },
    { value: 'grade11', label: language === 'th' ? 'ชั้นมัธยมศึกษาปีที่ 5' : 'Grade 11' },
    { value: 'grade12', label: language === 'th' ? 'ชั้นมัธยมศึกษาปีที่ 6' : 'Grade 12' },
    { value: 'uniandabove', label: language === 'th' ? 'ระดับมหาวิทยาลัยขึ้นไป' : 'University and Above' }
  ];

  const recentCEFROptions = [
    { value: '', label: language === 'th' ? 'ระดับ CEFR ล่าสุด' : 'Recent CEFR Level' },
    { value: 'notest', label: language === 'th' ? 'ไม่เคยมีการทดสอบ' : 'No Test Taken' },
    { value: 'A1', label: 'A1' },
    { value: 'A2', label: 'A2' },
    { value: 'B1', label: 'B1' },
    { value: 'B2', label: 'B2' },
    { value: 'C1', label: 'C1' },
    { value: 'C2', label: 'C2' },
  ];

  // Language and learning options
  const languageOptions = [
    { value: '', label: language === 'th' ? 'เลือกภาษาที่ต้องการเรียน' : 'Select Language to Learn' },
    { value: 'english', label: language === 'th' ? 'ภาษาอังกฤษ' : 'English' },
    { value: 'chinese', label: language === 'th' ? 'ภาษาจีน' : 'Chinese' },
  ];

  // Branch options with translations
  const getBranchDisplayName = (branchCode: string): string => {
    const branchNames = {
      'MALL': language === 'th' ? 'สาขาเดอะมอลโคราช' : 'The Mall Korat',
      'TECH': language === 'th' ? 'เทคโนโลยีราชมงคลอีสาน' : 'RMUTI',
      'ONLINE': language === 'th' ? 'ออนไลน์' : 'Online'
    };
    return branchNames[branchCode as keyof typeof branchNames] || branchCode;
  };

  const branchOptions = [
    { value: '', label: language === 'th' ? 'เลือกสาขา' : 'Select Branch' },
    { value: '1', label: getBranchDisplayName('MALL') },
    { value: '2', label: getBranchDisplayName('TECH') },
    { value: '3', label: getBranchDisplayName('ONLINE') },
  ];

  const englishLevelOptions = [
    { value: '', label: language === 'th' ? 'เลือกระดับ' : 'Select Level' },
    { value: 'beginner', label: language === 'th' ? 'เริ่มต้น (A1)' : 'Beginner (A1)' },
    { value: 'elementary', label: language === 'th' ? 'พื้นฐาน (A2)' : 'Elementary (A2)' },
    { value: 'intermediate', label: language === 'th' ? 'กลาง (B1)' : 'Intermediate (B1)' },
    { value: 'upper-intermediate', label: language === 'th' ? 'กลาง-สูง (B2)' : 'Upper-Intermediate (B2)' },
    { value: 'advanced', label: language === 'th' ? 'สูง (C1-C2)' : 'Advanced (C1-C2)' },
  ];

  const chineseLevelOptions = [
    { value: '', label: language === 'th' ? 'เลือกระดับ' : 'Select Level' },
    { value: 'beginner', label: language === 'th' ? 'เริ่มต้น' : 'Beginner' },
    { value: 'elementary', label: language === 'th' ? 'พื้นฐาน' : 'Elementary' },
    { value: 'intermediate', label: language === 'th' ? 'กลาง' : 'Intermediate' },
    { value: 'advanced', label: language === 'th' ? 'สูง' : 'Advanced' },
  ];

  const learningStyleOptions = [
    { value: '', label: language === 'th' ? 'เลือกรูปแบบการเรียน' : 'Select Learning Style' },
    { value: 'private', label: language === 'th' ? 'เรียนเดี่ยว (1 คน)' : 'Private (1-on-1)' },
    { value: 'pair', label: language === 'th' ? 'เรียนคู่ (2 คน)' : 'Pair (2 people)' },
    { value: 'group', label: language === 'th' ? 'เรียนกลุ่ม (3+ คน)' : 'Group (3+ people)' },
  ];

  // Filter courses based on selected branch, language, and level
  const getFilteredCourses = () => {
    let filteredCourses = availableCourses;

    // Filter by branch first if selected
    if (formData.preferredBranch) {
      filteredCourses = filteredCourses.filter(course => 
        course.branch_id?.toString() === formData.preferredBranch
      );
    }

    // Filter by language if selected
    if (formData.preferredLanguage) {
      filteredCourses = filteredCourses.filter(course => {
        if (formData.preferredLanguage === 'english') {
          return course.course_type?.toLowerCase() === 'english' || !course.course_type?.toLowerCase().includes('chinese');
        } else if (formData.preferredLanguage === 'chinese') {
          return course.course_type?.toLowerCase() === 'chinese' || course.course_type?.toLowerCase().includes('chinese');
        }
        return false;
      });
    } else {
      // If no language selected, don't show any courses1
      return [];
    }


    // Filter by language level if selected  
    if (formData.languageLevel) {
      filteredCourses = filteredCourses.filter(course => {
        if (!course.level) return false;
        
        const courseLevel = course.level.toLowerCase();
        const userLevel = formData.languageLevel?.toLowerCase();
        
        // Direct match first
        if (courseLevel === userLevel) return true;
        
        // Intelligent level matching
        const levelMatching: Record<string, string[]> = {
          'beginner': ['a1', 'beginner', 'foundation', 'basic', 'elementary'],
          'elementary': ['a2', 'elementary', 'foundation', 'basic'],
          'intermediate': ['b1', 'intermediate', 'pre-intermediate'],
          'upper-intermediate': ['b2', 'upper-intermediate', 'upper-int'],
          'advanced': ['advanced', 'c1', 'c2'],
          'a1': ['beginner', 'foundation', 'basic'],
          'a2': ['elementary', 'foundation'],
          'b1': ['intermediate', 'pre-intermediate'],
          'b2': ['upper-intermediate', 'upper-int'],
          'c1': ['advanced'],
          'c2': ['advanced']
        };

        // Special levels that are available for all user levels
        const specialLevels = ['private', 'business', 'travel', 'corporate', 'preparation', 'intensive', 'general training'];
        
        // Check if course level matches user level or is a special level
        if (specialLevels.includes(courseLevel)) {
          return true;
        }
        
        const matchingLevels = levelMatching[userLevel || ''] || [];
        return matchingLevels.some((level: string) => courseLevel.includes(level));
      });
    }

    return filteredCourses;
  };

  // Options for dropdowns
  const genderOptions = [
    { value: '', label: language === 'th' ? 'เลือกเพศ' : 'Select Gender' },
    { value: 'male', label: language === 'th' ? 'ชาย' : 'Male' },
    { value: 'female', label: language === 'th' ? 'หญิง' : 'Female' },
    { value: 'other', label: language === 'th' ? 'อื่นๆ' : 'Other' },
  ];




  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCourseSelection = (courseId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: checked 
        ? [...prev.selectedCourses, courseId]
        : prev.selectedCourses.filter(id => id !== courseId)
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
    if (!formData.preferredBranch) {
      newErrors.preferredBranch = language === 'th' ? 'กรุณาเลือกสาขา' : 'Please select branch';
    }
    if (!formData.preferredLanguage) {
      newErrors.preferredLanguage = language === 'th' ? 'กรุณาเลือกภาษาที่ต้องการเรียน' : 'Please select preferred language';
    }
    if (!formData.languageLevel) {
      newErrors.languageLevel = language === 'th' ? 'กรุณาเลือกระดับภาษา' : 'Please select language level';
    }
    if (!formData.learningStyle) {
      newErrors.learningStyle = language === 'th' ? 'กรุณาเลือกรูปแบบการเรียน' : 'Please select learning style';
    }
    if (!formData.currentEducation) {
      newErrors.currentEducation = language === 'th' ? 'กรุณาเลือกระดับการศึกษา' : 'Current education level is required';
    }
    if (!formData.recentCEFR) {
      newErrors.recentCEFR = language === 'th' ? 'กรุณาเลือกระดับ CEFR ล่าสุด' : 'Recent CEFR level is required';
    }
    if (!formData.lineId.trim()) {
      newErrors.lineId = language === 'th' ? 'กรุณากรอก LINE ID' : 'LINE ID is required';
    }
    if (!formData.nickName.trim()) {
      newErrors.nickName = language === 'th' ? 'กรุณากรอกชื่อเล่น' : 'Nickname is required';
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
           label={language === 'th' ? 'ชื่อเล่น' : 'Nickname'}
          >
            <Input
              value={formData.nickName}
              onChange={(e) => handleInputChange('nickName', e.target.value)}
              placeholder={language === 'th' ? 'ชื่อเล่น' : 'Nickname'}
            />
          </FormField>

          <FormField
            label={language === 'th' ? 'LINE ID' : 'LINE ID'}
          >
            <Input
              value={formData.lineId}
              onChange={(e) => handleInputChange('lineId', e.target.value)}
              placeholder={language === 'th' ? 'กรุณากรอก LINE ID' : 'Please enter LINE ID'}
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
            label={t.currentEducation}
            required
            error={errors.currentEducation}
          >
            <Select
              options={currentEducationLevelOptions}
              value={formData.currentEducation}
              onChange={(e) => handleInputChange('currentEducation', e.target.value)}
              error={!!errors.currentEducation}
            />
          </FormField>

          <FormField 
            label={language === 'th' ? 'สาขา' : 'Branch'} 
            required 
            error={errors.preferredBranch}
          >
            <Select
              options={branchOptions}
              value={formData.preferredBranch}
              onChange={(e) => handleInputChange('preferredBranch', e.target.value)}
              error={!!errors.preferredBranch}
            />
          </FormField>

          <FormField 
            label={language === 'th' ? 'ภาษาที่ต้องการเรียน' : 'Preferred Language'} 
            required 
            error={errors.preferredLanguage}
          >
            <Select
              options={languageOptions}
              value={formData.preferredLanguage}
              onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
              error={!!errors.preferredLanguage}
            />
          </FormField>

          <FormField 
            label={language === 'th' ? 'ระดับภาษา' : 'Language Level'} 
            required 
            error={errors.languageLevel}
          >
            <Select
              options={formData.preferredLanguage === 'chinese' ? chineseLevelOptions : englishLevelOptions}
              value={formData.languageLevel}
              onChange={(e) => handleInputChange('languageLevel', e.target.value)}
              error={!!errors.languageLevel}
              disabled={!formData.preferredLanguage}
            />
          </FormField>

          <FormField 
            label={language === 'th' ? 'รูปแบบการเรียน' : 'Learning Style'} 
            required 
            error={errors.learningStyle}
          >
            <Select
              options={learningStyleOptions}
              value={formData.learningStyle}
              onChange={(e) => handleInputChange('learningStyle', e.target.value)}
              error={!!errors.learningStyle}
            />
          </FormField>

          <FormField 
            label={t.recentCEFR} 
            required 
            error={errors.recentCEFR}
          >
            <Select
              options={recentCEFROptions}
              value={formData.recentCEFR}
              onChange={(e) => handleInputChange('recentCEFR', e.target.value)}
              error={!!errors.recentCEFR}
            />
          </FormField>
        </div>

        <div className="space-y-4">
          <FormField 
            label={language === 'th' ? 'คอร์สที่สนใจ (เลือกได้หลายคอร์ส)' : 'Interested Courses (Multiple Selection)'}
          >
            <div className="grid grid-cols-1 gap-3">
                {[
                  ...getFilteredCourses(),
                  {
                    id: 99999,
                    name: language === 'th' ? 'Contact Admin - เพื่อหาคอร์สที่เหมาะสม' : 'Contact Admin - For suitable course',
                    code: 'CONTACT',
                    course_type: '',
                    branch_id: 3,
                    description: language === 'th' ? 'หากไม่พบคอร์สที่เหมาะสม กรุณาติดต่อแอดมินเพื่อแนะนำคอร์สที่ตรงกับคุณ' : 'If no suitable course is found, please contact admin for recommendations.',
                    price: '',
                    hours_total: 0,
                    max_students: 0,
                    level: '',
                    branch_name: language === 'th' ? 'ออนไลน์' : 'Online',
                    branch_code: 'ONLINE'
                  }
                ].map((course) => (
                  <Checkbox
                    key={course.id}
                    label={`${course.name} (${course.code}) - ${getBranchDisplayName(course.branch_code)}`}
                    description={
                      [
                        course.description,
                        course.price && course.price !== 'undefined' ? `ราคา: ${course.price} บาท` : null,
                        course.hours_total ? `${course.hours_total} ชั่วโมง` : null,
                        course.max_students ? `นักเรียนสูงสุด: ${course.max_students} คน` : null,
                        course.level ? `ระดับ: ${course.level}` : null
                      ].filter(Boolean).join(' - ')
                    }
                    checked={formData.selectedCourses.includes(course.id)}
                    onChange={(e) => handleCourseSelection(course.id, e.target.checked)}
                  />
                ))}
                {getFilteredCourses().length === 0 && (formData.preferredBranch || formData.preferredLanguage) && (
                  <div className="text-gray-500 text-sm py-4">
                    {language === 'th' 
                      ? 'ไม่มีคอร์สที่ตรงกับเงื่อนไขที่เลือก กรุณาเปลี่ยนการเลือกสาขา ภาษา หรือรูปแบบการเรียน'
                      : 'No courses match the selected criteria. Please change branch, language, or learning style selection.'
                    }
                  </div>
                )}
            </div>
          </FormField>

          {/* Course selection notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-medium">
              <span className="text-red-600">⚠️ {language === 'th' ? 'หมายเหตุ' : 'Note'}:</span>{' '}
              {language === 'th' 
                ? 'การเลือกนี้เป็นแค่การเลือกคอร์สที่สนใจเท่านั้น ทั้งนี้คอร์สที่เหมาะสมจะขึ้นอยู่กับผลสอบ และดุลพินิจของครูเท่านั้น'
                : 'This selection is only for courses of interest. The appropriate course will depend on test results and teacher discretion only.'
              }
            </p>
          </div>

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
