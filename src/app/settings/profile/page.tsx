"use client";

import { useState } from 'react';
import SidebarLayout from '../../../components/common/SidebarLayout';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  FormField,
  Input,
  FormActions,
  FormSection
} from '../../../components/forms';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = language === 'th' ? 'กรุณากรอกชื่อ' : 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = language === 'th' ? 'กรุณากรอกนามสกุล' : 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = language === 'th' ? 'กรุณากรอกอีเมล' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = language === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์' : 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: API call to update profile
      console.log('Updating profile:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert(language === 'th' ? 'อัปเดตข้อมูลสำเร็จ!' : 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form or navigate back
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
    setErrors({});
  };

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: language === 'th' ? 'การตั้งค่า' : 'Settings', href: '/settings' },
        { label: t.profile }
      ]}
    >
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.profile}</h1>
          <p className="text-gray-600">
            {language === 'th' ? 'จัดการข้อมูลส่วนตัวของคุณ' : 'Manage your personal information'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title={t.personalInfo}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                label={t.name} 
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
                label={language === 'th' ? 'นามสกุล' : 'Last Name'} 
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
            </div>
          </FormSection>

          <FormActions
            onCancel={handleCancel}
            cancelText={t.cancel}
            submitText={t.saveData}
            loading={loading}
          />
        </form>
      </div>
    </SidebarLayout>
  );
}
