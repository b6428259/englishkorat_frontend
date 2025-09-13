"use client"

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  StudentRegistrationRequest,
  BasicInformation,
  ContactInformation,
  FullInformation,
  TimeSlot
} from '@/services/api/students';
import { Course } from '@/services/api/courses';
import {
  FormField,
  Input,
  DateInput,
  Textarea,
  Select,
  Checkbox,
  FormActions,
  FormSection,
  TeacherTypeSelector
} from '@/components/forms';
import { TimeSlotManager } from '@/components/common';

interface StudentRegistrationFormProps {
  registrationType: 'quick' | 'full';
  onSubmit: (data: StudentRegistrationRequest) => Promise<void>;
  loading: boolean;
  availableCourses: Course[];
}

interface FormData {
  // Basic Information
  firstName: string;
  lastName: string;
  nicknameEn: string;
  nicknameTh: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  
  // Contact Information
  phone: string;
  email: string;
  lineId: string;
  address: string;
  
  // Full Information (only for full registration)
  citizenId: string;
  firstNameEn: string;
  lastNameEn: string;
  currentEducation: string;
  preferredBranch: string;
  preferredLanguage: 'english' | 'chinese' | '';
  languageLevel: string;
  learningStyle: 'private' | 'pair' | 'group' | '';
  recentCEFR: string;
  selectedCourses: number[];
  learningGoals: string;
  teacherType: string;
  preferredTimeSlots: TimeSlot[];
  unavailableTimeSlots: TimeSlot[];
  emergencyContact: string;
  emergencyPhone: string;
}

const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({
  registrationType,
  onSubmit,
  loading,
  availableCourses = []
}) => {
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState<FormData>({
    // Basic Information
    firstName: '',
    lastName: '',
    nicknameEn: '',
    nicknameTh: '',
    dateOfBirth: '',
    gender: '',
    
    // Contact Information
    phone: '',
    email: '',
    lineId: '',
    address: '',
    
    // Full Information
    citizenId: '',
    firstNameEn: '',
    lastNameEn: '',
    currentEducation: '',
    preferredBranch: '',
    preferredLanguage: '',
    languageLevel: '',
    learningStyle: '',
    recentCEFR: '',
    selectedCourses: [],
    learningGoals: '',
    teacherType: '',
    preferredTimeSlots: [],
    unavailableTimeSlots: [],
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [age, setAge] = useState<number | null>(null);

  // Calculate age automatically when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [formData.dateOfBirth]);

  // Options for dropdowns
  const genderOptions = [
    { value: '', label: language === 'th' ? 'เลือกเพศ' : 'Select Gender' },
    { value: 'male', label: language === 'th' ? 'ชาย' : 'Male' },
    { value: 'female', label: language === 'th' ? 'หญิง' : 'Female' },
    { value: 'other', label: language === 'th' ? 'อื่นๆ' : 'Other' },
  ];

  const currentEducationOptions = [
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

  const branchOptions = [
    { value: '', label: language === 'th' ? 'เลือกสาขา' : 'Select Branch' },
    { value: '1', label: language === 'th' ? 'สาขาเดอะมอลโคราช' : 'The Mall Korat' },
    { value: '2', label: language === 'th' ? 'เทคโนโลยีราชมงคลอีสาน' : 'RMUTI' },
    { value: '3', label: language === 'th' ? 'ออนไลน์' : 'Online' },
  ];

  const languageOptions = [
    { value: '', label: language === 'th' ? 'เลือกภาษาที่ต้องการเรียน' : 'Select Language to Learn' },
    { value: 'english', label: language === 'th' ? 'ภาษาอังกฤษ' : 'English' },
    { value: 'chinese', label: language === 'th' ? 'ภาษาจีน' : 'Chinese' },
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Special handling for citizenId - format and clean
      if (field === 'citizenId') {
        const cleanValue = value.replace(/\D/g, '').substring(0, 13);
        newData.citizenId = cleanValue;
      }
      
      // Reset dependent fields when main options change
      if (field === 'preferredLanguage') {
        newData.languageLevel = '';
        newData.recentCEFR = '';
        newData.selectedCourses = [];
      }
      
      if (field === 'preferredBranch') {
        newData.selectedCourses = [];
      }
      
      if (field === 'languageLevel') {
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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Basic Information (required for both quick and full)
    if (!formData.firstName.trim()) {
      newErrors.firstName = language === 'th' ? 'กรุณากรอกชื่อ' : 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = language === 'th' ? 'กรุณากรอกนามสกุล' : 'Last name is required';
    }
    if (!formData.nicknameTh.trim()) {
      newErrors.nicknameTh = language === 'th' ? 'กรุณากรอกชื่อเล่นภาษาไทย' : 'Thai nickname is required';
    }
    if (!formData.nicknameEn.trim()) {
      newErrors.nicknameEn = language === 'th' ? 'กรุณากรอกชื่อเล่นภาษาอังกฤษ' : 'English nickname is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = language === 'th' ? 'กรุณาเลือกวันเกิด' : 'Date of birth is required';
    }
    if (!formData.gender) {
      newErrors.gender = language === 'th' ? 'กรุณาเลือกเพศ' : 'Gender is required';
    }

    // Contact Information (required for both quick and full)
    if (!formData.phone.trim()) {
      newErrors.phone = language === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์' : 'Phone number is required';
    }
    if (!formData.lineId.trim()) {
      newErrors.lineId = language === 'th' ? 'กรุณากรอก LINE ID' : 'LINE ID is required';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format';
    }

    // Branch selection (required for both quick and full)
    if (!formData.preferredBranch) {
      newErrors.preferredBranch = language === 'th' ? 'กรุณาเลือกสาขา' : 'Please select branch';
    }

    // Full Information (only required for full registration)
    if (registrationType === 'full') {
      if (!formData.citizenId.trim()) {
        newErrors.citizenId = language === 'th' ? 'กรุณากรอกเลขบัตรประชาชน' : 'Citizen ID is required';
      } else {
        const cleanCitizenId = formData.citizenId.replace(/\D/g, '');
        if (cleanCitizenId.length !== 13) {
          newErrors.citizenId = language === 'th' ? 'เลขบัตรประชาชนต้องมี 13 หลัก' : 'Citizen ID must be 13 digits';
        }
      }
      
      if (!formData.currentEducation) {
        newErrors.currentEducation = language === 'th' ? 'กรุณาเลือกระดับการศึกษา' : 'Current education level is required';
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
      if (!formData.recentCEFR) {
        newErrors.recentCEFR = formData.preferredLanguage === 'chinese' 
          ? (language === 'th' ? 'กรุณาเลือกระดับ HSK ล่าสุด' : 'Recent HSK level is required')
          : (language === 'th' ? 'กรุณาเลือกระดับ CEFR ล่าสุด' : 'Recent CEFR level is required');
      }
      if (!formData.teacherType) {
        newErrors.teacherType = language === 'th' ? 'กรุณาเลือกประเภทครู' : 'Please select teacher type';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const basicInformation: BasicInformation = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      nickname_th: formData.nicknameTh,
      nickname_en: formData.nicknameEn,
      date_of_birth: formData.dateOfBirth,
      gender: formData.gender as 'male' | 'female' | 'other'
    };

    const contactInformation: ContactInformation = {
      phone: formData.phone,
      email: formData.email || undefined,
      line_id: formData.lineId,
      address: formData.address || undefined,
      preferred_branch: parseInt(formData.preferredBranch)
    };

    let fullInformation: FullInformation | undefined;

    if (registrationType === 'full') {
      fullInformation = {
        citizen_id: formData.citizenId,
        first_name_en: formData.firstNameEn || undefined,
        last_name_en: formData.lastNameEn || undefined,
        current_education: formData.currentEducation,
        preferred_branch: parseInt(formData.preferredBranch),
        preferred_language: formData.preferredLanguage as 'english' | 'chinese',
        language_level: formData.languageLevel,
        learning_style: formData.learningStyle as 'private' | 'pair' | 'group',
        recent_cefr: formData.recentCEFR,
        selected_courses: formData.selectedCourses.length > 0 ? formData.selectedCourses : undefined,
        learning_goals: formData.learningGoals || undefined,
        teacher_type: formData.teacherType,
        preferred_time_slots: formData.preferredTimeSlots.length > 0 ? formData.preferredTimeSlots : undefined,
        unavailable_time_slots: formData.unavailableTimeSlots.length > 0 ? formData.unavailableTimeSlots : undefined,
        emergency_contact: formData.emergencyContact || undefined,
        emergency_phone: formData.emergencyPhone || undefined
      };
    }

    const registrationData: StudentRegistrationRequest = {
      registration_type: registrationType,
      basic_information: basicInformation,
      contact_information: contactInformation,
      full_information: fullInformation
    };

    try {
      await onSubmit(registrationData);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const getFilteredCourses = () => {
    if (registrationType !== 'full') return [];
    
    let filteredCourses = availableCourses;

    if (formData.preferredBranch) {
      filteredCourses = filteredCourses.filter(course => 
        course.branch_id?.toString() === formData.preferredBranch
      );
    }

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
      return [];
    }

    return filteredCourses;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {registrationType === 'quick' 
            ? (language === 'th' ? 'ลงทะเบียนแบบรวดเร็ว' : 'Quick Registration')
            : (language === 'th' ? 'ลงทะเบียนแบบครบถ้วน' : 'Full Registration')
          }
        </h2>
        <p className="mt-2 text-gray-600">
          {registrationType === 'quick' 
            ? (language === 'th' ? 'กรอกข้อมูลพื้นฐาน ติดต่อ และสาขาที่ต้องการ' : 'Fill basic information, contact details, and preferred branch')
            : (language === 'th' ? 'กรอกข้อมูลครบถ้วนรวมถึงความต้องการในการเรียน' : 'Complete information including learning preferences')
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <FormSection title={language === 'th' ? 'ข้อมูลพื้นฐาน' : 'Basic Information'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label={language === 'th' ? 'ชื่อ' : 'First Name'} 
              required 
              error={errors.firstName}
            >
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder={language === 'th' ? 'กรุณากรอกชื่อ' : 'Please enter first name'}
                error={!!errors.firstName}
              />
            </FormField>

            <FormField 
              label={language === 'th' ? 'นามสกุล' : 'Last Name'} 
              required 
              error={errors.lastName}
            >
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder={language === 'th' ? 'กรุณากรอกนามสกุล' : 'Please enter last name'}
                error={!!errors.lastName}
              />
            </FormField>

            <FormField 
              label={language === 'th' ? 'ชื่อเล่น (ไทย)' : 'Nickname (Thai)'} 
              required 
              error={errors.nicknameTh}
            >
              <Input
                name="nicknameTh"
                value={formData.nicknameTh}
                onChange={(e) => handleInputChange('nicknameTh', e.target.value)}
                placeholder={language === 'th' ? 'ชื่อเล่นภาษาไทย' : 'Thai nickname'}
                error={!!errors.nicknameTh}
              />
            </FormField>

            <FormField 
              label={language === 'th' ? 'ชื่อเล่น (อังกฤษ)' : 'Nickname (English)'} 
              required 
              error={errors.nicknameEn}
            >
              <Input
                name="nicknameEn"
                value={formData.nicknameEn}
                onChange={(e) => handleInputChange('nicknameEn', e.target.value)}
                placeholder={language === 'th' ? 'ชื่อเล่นภาษาอังกฤษ' : 'English nickname'}
                error={!!errors.nicknameEn}
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

            {/* Age Display - Auto-calculated */}
            {age !== null && (
              <FormField label={language === 'th' ? 'อายุ' : 'Age'}>
                <div className="flex items-center h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-gray-700 font-medium">
                    {age} {language === 'th' ? 'ปี' : 'years old'}
                  </span>
                </div>
              </FormField>
            )}
          </div>
        </FormSection>

        {/* Contact Information */}
        <FormSection title={language === 'th' ? 'ข้อมูลติดต่อ' : 'Contact Information'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label={language === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'} 
              required 
              error={errors.phone}
            >
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={language === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์' : 'Please enter phone number'}
                error={!!errors.phone}
              />
            </FormField>

            <FormField 
              label={language === 'th' ? 'อีเมล' : 'Email'} 
              error={errors.email}
            >
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={language === 'th' ? 'อีเมล (ไม่บังคับ)' : 'Email (optional)'}
                error={!!errors.email}
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

            <div className="md:col-span-2">
              <FormField label={language === 'th' ? 'ที่อยู่' : 'Address'}>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={language === 'th' ? 'ที่อยู่ (ไม่บังคับ)' : 'Address (optional)'}
                  rows={3}
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        {/* Full Information - Only shown for full registration */}
        {registrationType === 'full' && (
          <>
            {/* Identity Information */}
            <FormSection title={language === 'th' ? 'ข้อมูลระบุตัวตน' : 'Identity Information'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  label={language === 'th' ? 'ระดับการศึกษาปัจจุบัน' : 'Current Education Level'}
                  required
                  error={errors.currentEducation}
                >
                  <Select
                    name="currentEducation"
                    options={currentEducationOptions}
                    value={formData.currentEducation}
                    onChange={(e) => handleInputChange('currentEducation', e.target.value)}
                    error={!!errors.currentEducation}
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
              </div>
            </FormSection>

            {/* Learning Preferences */}
            <FormSection title={language === 'th' ? 'ความต้องการในการเรียน' : 'Learning Preferences'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  label={formData.preferredLanguage === 'chinese' ? (language === 'th' ? 'ระดับ HSK ล่าสุด' : 'Recent HSK Level') : (language === 'th' ? 'ระดับ CEFR ล่าสุด' : 'Recent CEFR Level')}
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

                <div className="md:col-span-2">
                  <FormField 
                    label={language === 'th' ? 'ประเภทครูที่ต้องการ' : 'Preferred Teacher Type'}
                    required
                    error={errors.teacherType}
                  >
                    <div data-field="teacherType">
                      <TeacherTypeSelector
                        value={formData.teacherType}
                        onChange={(value) => handleInputChange('teacherType', value)}
                        error={!!errors.teacherType}
                        language={language}
                      />
                    </div>
                  </FormField>
                </div>
              </div>

              {/* Course Selection */}
              <div className="space-y-4">
                <FormField 
                  label={language === 'th' ? 'คอร์สที่สนใจ (เลือกได้หลายคอร์ส)' : 'Interested Courses (Multiple Selection)'}
                >
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700 text-sm font-medium">
                      <span className="text-red-600">⚠️ {language === 'th' ? 'หมายเหตุ' : 'Note'}:</span>{' '}
                      {language === 'th' 
                        ? 'การเลือกนี้เป็นแค่การเลือกคอร์สที่สนใจเท่านั้น ทั้งนี้คอร์สที่เหมาะสมจะขึ้นอยู่กับผลสอบ และดุลพินิจของครูเท่านั้น'
                        : 'This selection is only for courses of interest. The appropriate course will depend on test results and teacher discretion only.'
                      }
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {/* Contact Admin course */}
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
                        label={`${course.name} (${course.code}) - ${course.branch_name || course.branch_code}`}
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
                <TimeSlotManager
                  value={formData.preferredTimeSlots}
                  onChange={(slots) => setFormData(prev => ({ ...prev, preferredTimeSlots: slots }))}
                  title={language === 'th' ? 'วันเวลาที่ต้องการเรียน' : 'Preferred Learning Time'}
                  description={language === 'th' ? 'เลือกวันและเวลาที่คุณต้องการเรียน' : 'Select your preferred days and times for learning'}
                  language={language}
                  maxSlots={7}
                />

                <TimeSlotManager
                  value={formData.unavailableTimeSlots}
                  onChange={(slots) => setFormData(prev => ({ ...prev, unavailableTimeSlots: slots }))}
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
          </>
        )}

        {/* Form Actions */}
        <FormActions
          cancelText={language === 'th' ? 'ยกเลิก' : 'Cancel'}
          submitText={language === 'th' ? 'ยืนยันการลงทะเบียน' : 'Submit Registration'}
          loading={loading}
        />

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium mb-2">
              {language === 'th' ? 'กรุณาแก้ไขข้อผิดพลาดต่อไปนี้:' : 'Please fix the following errors:'}
            </h3>
            <ul className="text-red-700 text-sm space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default StudentRegistrationForm;
