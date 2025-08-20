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

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordData, string>>>({});

  const handleInputChange = (field: keyof PasswordData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PasswordData, string>> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = language === 'th' ? 'กรุณากรอกรหัสผ่านปัจจุบัน' : 'Current password is required';
    }
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = language === 'th' ? 'กรุณากรอกรหัสผ่านใหม่' : 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = language === 'th' ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = language === 'th' ? 'กรุณายืนยันรหัสผ่านใหม่' : 'Please confirm new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = language === 'th' ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match';
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
      // TODO: API call to change password
      console.log('Changing password...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert(language === 'th' ? 'เปลี่ยนรหัสผ่านสำเร็จ!' : 'Password changed successfully!');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      alert(language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.settings, href: '/settings' },
        { label: t.changePassword }
      ]}
    >
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.changePassword}</h1>
          <p className="text-gray-600">
            {language === 'th' ? 'เปลี่ยนรหัสผ่านของคุณ' : 'Change your password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title={language === 'th' ? 'รหัสผ่าน' : 'Password'}>
            <div className="space-y-4">
              <FormField 
                label={t.currentPassword} 
                required 
                error={errors.currentPassword}
              >
                <Input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  placeholder={t.pleaseEnterCurrentPassword}
                  error={!!errors.currentPassword}
                />
              </FormField>

              <FormField 
                label={t.newPassword} 
                required 
                error={errors.newPassword}
              >
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder={t.pleaseEnterNewPassword}
                  error={!!errors.newPassword}
                />
              </FormField>

              <FormField 
                label={t.confirmNewPassword} 
                required 
                error={errors.confirmPassword}
              >
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder={t.pleaseConfirmNewPassword}
                  error={!!errors.confirmPassword}
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
