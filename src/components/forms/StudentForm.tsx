"use client"

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSuccessToast, useErrorToast } from '../common/Toast';
import { FormErrorSummary } from '../common/FormErrorSummary';
import {
  FormField,
  Input,
  DateInput,
  Textarea,
  Select,
  Checkbox,
  FormActions,
  FormSection,
  TeacherTypeSelector,
  TimeSlotSelector
} from '../forms';

export interface StudentFormData {
  firstName: string;
  lastName: string;
  citizenId: string;
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
  teacherType: string;
  preferredTimeSlots: TimeSlot[];
  unavailableTimeSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  day: string;
  timeFrom: string;
  timeTo: string;
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
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    citizenId: initialData.citizenId || '',
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
    recentCEFR: initialData.recentCEFR || '',
    teacherType: initialData.teacherType || '',
    preferredTimeSlots: initialData.preferredTimeSlots || [],
    unavailableTimeSlots: initialData.unavailableTimeSlots || []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});

  // Clear errors when dependent fields are reset
  useEffect(() => {
    setErrors(prev => {
      const newErrors = { ...prev };
      
      // Clear language level error when language changes
      if (!formData.preferredLanguage) {
        delete newErrors.languageLevel;
        delete newErrors.recentCEFR;
      }
      
      // Clear language level error when it's reset
      if (!formData.languageLevel) {
        delete newErrors.languageLevel;
      }
      
      // Clear recent test error when it's reset
      if (!formData.recentCEFR) {
        delete newErrors.recentCEFR;
      }
      
      return newErrors;
    });
  }, [formData.preferredLanguage, formData.languageLevel, formData.recentCEFR]);

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

  const recentHSKOptions = [
    { value: '', label: language === 'th' ? 'ระดับ HSK ล่าสุด' : 'Recent HSK Level' },
    { value: 'notest', label: language === 'th' ? 'ไม่เคยมีการทดสอบ' : 'No Test Taken' },
    { value: 'HSK1', label: 'HSK 1' },
    { value: 'HSK2', label: 'HSK 2' },
    { value: 'HSK3', label: 'HSK 3' },
    { value: 'HSK4', label: 'HSK 4' },
    { value: 'HSK5', label: 'HSK 5' },
    { value: 'HSK6', label: 'HSK 6' },
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Special handling for citizenId - format and clean
      if (field === 'citizenId') {
        // Remove all non-digit characters and limit to 13 digits
        const cleanValue = value.replace(/\D/g, '').substring(0, 13);
        newData.citizenId = cleanValue;
      }
      
      // Reset dependent fields when main options change
      if (field === 'preferredLanguage') {
        // Reset language level and recent test when language changes
        newData.languageLevel = '';
        newData.recentCEFR = '';
        newData.selectedCourses = []; // Reset selected courses
      }
      
      if (field === 'preferredBranch') {
        // Reset selected courses when branch changes
        newData.selectedCourses = [];
      }
      
      if (field === 'languageLevel') {
        // Reset selected courses when language level changes
        newData.selectedCourses = [];
      }
      
      return newData;
    });
    
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

  const handleTeacherTypeChange = (teacherType: string) => {
    setFormData(prev => ({ ...prev, teacherType }));
    if (errors.teacherType) {
      setErrors(prev => ({ ...prev, teacherType: undefined }));
    }
  };

  const handlePreferredTimeSlotsChange = (slots: TimeSlot[]) => {
    setFormData(prev => ({ ...prev, preferredTimeSlots: slots }));
  };

  const handleUnavailableTimeSlotsChange = (slots: TimeSlot[]) => {
    setFormData(prev => ({ ...prev, unavailableTimeSlots: slots }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StudentFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = language === 'th' ? 'กรุณากรอกชื่อ' : 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = language === 'th' ? 'กรุณากรอกนามสกุล' : 'Last name is required';
    }
    // citizenId validation
    if (!formData.citizenId.trim()) {
      newErrors.citizenId = language === 'th' ? 'กรุณากรอกเลขบัตรประชาชน' : 'Citizen ID is required';
    } else {
      // Remove all non-digit characters
      const cleanCitizenId = formData.citizenId.replace(/\D/g, '');
      
      if (cleanCitizenId.length !== 13) {
        newErrors.citizenId = language === 'th' ? 'เลขบัตรประชาชนต้องมี 13 หลัก' : 'Citizen ID must be 13 digits';
      } else {
        // Thai citizen ID checksum validation
        const digits = cleanCitizenId.split('').map(Number);
        let sum = 0;
        
        for (let i = 0; i < 12; i++) {
          sum += digits[i] * (13 - i);
        }
        
        const checkDigit = (11 - (sum % 11)) % 10;
        
        if (checkDigit !== digits[12]) {
          newErrors.citizenId = language === 'th' ? 'รูปแบบเลขบัตรประชาชนไม่ถูกต้อง' : 'Invalid Thai Citizen ID format';
        }
      }
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = language === 'th' ? 'กรุณาเลือกวันเกิด' : 'Date of birth is required';
    }
    if (!formData.gender) {
      newErrors.gender = language === 'th' ? 'กรุณาเลือกเพศ' : 'Gender is required';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
      newErrors.recentCEFR = formData.preferredLanguage === 'chinese' 
        ? (language === 'th' ? 'กรุณาเลือกระดับ HSK ล่าสุด' : 'Recent HSK level is required')
        : (language === 'th' ? 'กรุณาเลือกระดับ CEFR ล่าสุด' : 'Recent CEFR level is required');
    }
    if (!formData.lineId.trim()) {
      newErrors.lineId = language === 'th' ? 'กรุณากรอก LINE ID' : 'LINE ID is required';
    }
    if (!formData.nickName.trim()) {
      newErrors.nickName = language === 'th' ? 'กรุณากรอกชื่อเล่น' : 'Nickname is required';
    }
    if (!formData.teacherType) {
      newErrors.teacherType = language === 'th' ? 'กรุณาเลือกประเภทครู' : 'Please select teacher type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      errorToast(
        language === 'th' ? 'กรุณาตรวจสอบข้อมูล' : 'Please check the form',
        language === 'th' ? 'พบข้อผิดพลาดในแบบฟอร์ม กรุณาแก้ไขและลองใหม่อีกครั้ง' : 'Form contains errors. Please fix them and try again.'
      );
      return;
    }

    try {
      await onSubmit(formData);
      successToast(
        mode === 'create' 
          ? (language === 'th' ? 'ส่งข้อมูลสำเร็จ' : 'Successfully Submitted')
          : (language === 'th' ? 'บันทึกข้อมูลสำเร็จ' : 'Successfully Saved'),
        language === 'th' ? 'ข้อมูลนักเรียนได้รับการบันทึกเรียบร้อยแล้ว' : 'Student information has been saved successfully.'
      );
    } catch (err) {
      console.error('Form submission error:', err);
      errorToast(
        language === 'th' ? 'เกิดข้อผิดพลาด' : 'An Error Occurred',
        language === 'th' ? 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' : 'Unable to save data. Please try again.'
      );
    }
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
              name="firstName"
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
              name="lastName"
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
              name="firstNameEn"
              value={formData.firstNameEn}
              onChange={(e) => handleInputChange('firstNameEn', e.target.value)}
              placeholder={language === 'th' ? 'ชื่อภาษาอังกฤษ (ไม่บังคับ)' : 'English first name (optional)'}
            />
          </FormField>

          <FormField 
            label={language === 'th' ? 'นามสกุล (อังกฤษ)' : 'Last Name (English)'}
          >
            <Input
              name="lastNameEn"
              value={formData.lastNameEn}
              onChange={(e) => handleInputChange('lastNameEn', e.target.value)}
              placeholder={language === 'th' ? 'นามสกุลภาษาอังกฤษ (ไม่บังคับ)' : 'English last name (optional)'}
            />
          </FormField>

           <FormField
            label={language === 'th' ? 'เลขบัตรประชาชน' : 'Citizen ID'}
            required
            error={errors.citizenId}
          >
            <Input
              name="citizenId"
              value={formData.citizenId}
              onChange={(e) => handleInputChange('citizenId', e.target.value)}
              placeholder={language === 'th' ? 'กรุณากรอกเลขบัตรประชาชน 13 หลัก' : 'Please enter 13-digit Citizen ID'}
              error={!!errors.citizenId}
              maxLength={13}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </FormField>

          <FormField
           label={language === 'th' ? 'ชื่อเล่น' : 'Nickname'}
           required
           error={errors.nickName}
          >
            <Input
              name="nickName"
              value={formData.nickName}
              onChange={(e) => handleInputChange('nickName', e.target.value)}
              placeholder={language === 'th' ? 'ชื่อเล่น' : 'Nickname'}
              error={!!errors.nickName}
            />
          </FormField>



          <FormField
            label={language === 'th' ? 'วันเกิด' : 'Date of Birth'}
            required
            error={errors.dateOfBirth}
          >
            <DateInput
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              error={!!errors.dateOfBirth}
              language={language}
            />
          </FormField>

          <FormField 
            label={language === 'th' ? 'เพศ' : 'Gender'} 
            required 
            error={errors.gender}
          >
            <Select
              name="gender"
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
            error={errors.email}
          >
            <Input
              name="email"
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
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t.pleaseEnterPhone}
              error={!!errors.phone}
            />
          </FormField>

          <FormField
            label={language === 'th' ? 'LINE ID' : 'LINE ID'}
            required
            error={errors.lineId}
          >
            <Input
              name="lineId"
              value={formData.lineId}
              onChange={(e) => handleInputChange('lineId', e.target.value)}
              placeholder={language === 'th' ? 'กรุณากรอก LINE ID' : 'Please enter LINE ID'}
              error={!!errors.lineId}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label={t.address}>
              <Textarea
                name="address"
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
              name="currentEducation"
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
              name="preferredBranch"
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
              name="preferredLanguage"
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
              name="languageLevel"
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
              name="learningStyle"
              options={learningStyleOptions}
              value={formData.learningStyle}
              onChange={(e) => handleInputChange('learningStyle', e.target.value)}
              error={!!errors.learningStyle}
            />
          </FormField>

          <FormField 
            label={formData.preferredLanguage === 'chinese' ? (language === 'th' ? 'ระดับ HSK ล่าสุด' : 'Recent HSK Level') : t.recentCEFR} 
            required 
            error={errors.recentCEFR}
          >
            <Select
              name="recentCEFR"
              options={formData.preferredLanguage === 'chinese' ? recentHSKOptions : recentCEFROptions}
              value={formData.recentCEFR}
              onChange={(e) => handleInputChange('recentCEFR', e.target.value)}
              error={!!errors.recentCEFR}
            />
          </FormField>

          {/* Teacher Type Selector */}
          <div className="md:col-span-2">
            <FormField 
              label={language === 'th' ? 'ประเภทครูที่ต้องการ' : 'Preferred Teacher Type'}
              required
              error={errors.teacherType}
            >
              <div data-field="teacherType">
                <TeacherTypeSelector
                  value={formData.teacherType}
                  onChange={handleTeacherTypeChange}
                  error={!!errors.teacherType}
                  language={language}
                />
              </div>
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
          <FormField 
            label={language === 'th' ? 'คอร์สที่สนใจ (เลือกได้หลายคอร์ส)' : 'Interested Courses (Multiple Selection)'}
          >

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
          
            <div className="grid grid-cols-1 gap-3">
              {/* Contact Admin course - always first and visually prominent */}
              <div className="border-2 border-blue-400 bg-blue-50 shadow-md rounded-lg p-3 mb-2">
                <Checkbox
                  key={99999}
                  label={language === 'th' ? 'ติดต่อแอดมิน - เพื่อหาคอร์สที่เหมาะสม' : 'Contact Admin - For suitable course'}
                  description={language === 'th' ? 'หากไม่พบคอร์สที่เหมาะสม กรุณาติดต่อแอดมินเพื่อแนะนำคอร์สที่ตรงกับคุณ' : 'If no suitable course is found, please contact admin for recommendations.'}
                  checked={formData.selectedCourses.includes(99999)}
                  onChange={(e) => handleCourseSelection(99999, e.target.checked)}
                />
              </div>
              {/* Other courses */}
              {getFilteredCourses().map((course) => (
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

         

          <FormField 
            label={language === 'th' ? 'เหตุผลและเป้าหมายในการเรียน' : 'Learning Reasons and Goals'}
          >
            <Textarea
              name="learningGoals"
              value={formData.learningGoals}
              onChange={(e) => handleInputChange('learningGoals', e.target.value)}
              placeholder={language === 'th' ? 'กรุณาอธิบายเหตุผลและเป้าหมายในการเรียน' : 'Please describe your reasons and learning goals'}
              rows={4}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Schedule Preferences */}
      <FormSection title={language === 'th' ? 'ความต้องการด้านตารางเรียน' : 'Schedule Preferences'}>
        <div className="space-y-6">
          {/* Preferred Time Slots */}
          <TimeSlotSelector
            value={formData.preferredTimeSlots}
            onChange={handlePreferredTimeSlotsChange}
            title={language === 'th' ? 'วันเวลาที่ต้องการเรียน' : 'Preferred Learning Time'}
            description={language === 'th' ? 'เลือกวันและเวลาที่คุณต้องการเรียน' : 'Select your preferred days and times for learning'}
            language={language}
            maxSlots={7}
          />

          {/* Unavailable Time Slots */}
          <TimeSlotSelector
            value={formData.unavailableTimeSlots}
            onChange={handleUnavailableTimeSlotsChange}
            title={language === 'th' ? 'วันเวลาที่ไม่ว่าง' : 'Unavailable Time'}
            description={language === 'th' ? 'เลือกวันและเวลาที่คุณไม่สะดวกเรียน' : 'Select days and times when you are not available'}
            language={language}
            maxSlots={7}
          />
        </div>
      </FormSection>

      {/* Emergency Contact */}
      <FormSection title={language === 'th' ? 'ข้อมูลติดต่อฉุกเฉิน' : 'Emergency Contact'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label={language === 'th' ? 'ชื่อผู้ปกครอง/ติดต่อฉุกเฉิน' : 'Parent/Emergency Contact Name'}>
            <Input
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder={language === 'th' ? 'ชื่อผู้ติดต่อฉุกเฉิน' : 'Emergency contact name'}
            />
          </FormField>

          <FormField label={language === 'th' ? 'เบอร์โทรติดต่อฉุกเฉิน' : 'Emergency Contact Phone'}>
            <Input
              name="emergencyPhone"
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
        submitText={mode === 'create' ? (language === 'th' ? 'ยืนยัน' : 'Submit') : t.saveData}
        loading={loading}
      />

      {/* Form Error Summary */}
      {Object.keys(errors).length > 0 && (
        <FormErrorSummary
          errors={errors}
          language={language}
          className="mt-6"
        />
      )}
    </form>
  );
};

export default StudentForm;
