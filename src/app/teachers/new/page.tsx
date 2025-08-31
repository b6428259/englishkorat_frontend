"use client"

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import SidebarLayout from '../../../components/common/SidebarLayout';
import Avatar from '../../../components/common/Avatar';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { FormField } from '../../../components/forms/FormField';
import { Input } from '../../../components/forms/Input';
import { Select } from '../../../components/forms/Select';
import { Textarea } from '../../../components/forms/Textarea';
import { FormSection } from '../../../components/forms/FormSection';
import { FormActions } from '../../../components/forms/FormActions';
import { useLanguage } from '../../../contexts/LanguageContext';
import { teachersApi } from '../../../services/api/teachers';

interface TeacherFormData {
  username: string;
  password: string;
  email: string;
  phone: string;
  line_id: string;
  first_name: string;
  last_name: string;
  nickname: string;
  nationality: string;
  teacher_type: string;
  hourly_rate: string;
  specializations: string[];
  certifications: string[];
  active: boolean;
  branch_id: string;
  avatar?: File | null;
}

export default function CreateTeacherPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TeacherFormData>({
    username: '',
    password: '',
    email: '',
    phone: '',
    line_id: '',
    first_name: '',
    last_name: '',
    nickname: '',
    nationality: '',
    teacher_type: 'Both',
    hourly_rate: '',
    specializations: [],
    certifications: [],
    active: true,
    branch_id: '1',
    avatar: null
  });

  const teacherTypeOptions = [
    { value: 'Both', label: 'Both (ทั้งเด็กและผู้ใหญ่)' },
    { value: 'Kid', label: 'Kid (เด็ก)' },
    { value: 'Adults', label: 'Adults (ผู้ใหญ่)' },
    { value: 'Admin Team', label: 'Admin Team (ทีมแอดมิน)' }
  ];

  const branchOptions = [
    { value: '1', label: 'Branch 1 The Mall Branch' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSpecializationsChange = (value: string) => {
    const specializations = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, specializations }));
  };

  const handleCertificationsChange = (value: string) => {
    const certifications = value.split(',').map(c => c.trim()).filter(c => c);
    setFormData(prev => ({ ...prev, certifications }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'avatar' && value) {
          submitData.append(key, value as File);
        } else if (key === 'specializations' || key === 'certifications') {
          (value as string[]).forEach(item => {
            submitData.append(key + '[]', item);
          });
        } else if (key !== 'avatar') {
          submitData.append(key, value.toString());
        }
      });

      const response = await teachersApi.createTeacher(submitData);
      
      if (response.success) {
        setShowSuccessModal(true);
      } else {
        setError('ไม่สามารถสร้างครูใหม่ได้');
      }
    } catch (err) {
      console.error('Error creating teacher:', err);
      setError('เกิดข้อผิดพลาดในการสร้างครู');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/teachers/list');
  };

  const handleCancel = () => {
    router.push('/teachers/list');
  };

  return (
    <>
      <SidebarLayout
        breadcrumbItems={[
          { label: t.teacherManagement },
          { label: t.teacherList, href: '/teachers/list' },
          { label: 'เพิ่มครูใหม่' }
        ]}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">เพิ่มครูใหม่</h1>
            <p className="text-gray-600">กรอกข้อมูลครูใหม่ให้ครบถ้วน</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar
                  src={avatarPreview || undefined}
                  alt="Avatar Preview"
                  size="2xl"
                  className="ring-4 ring-white shadow-lg"
                  fallbackInitials="?"
                />
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#334293] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#2a3875] transition-colors duration-200 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-600">คลิกเพื่ออัพโหลดรูปโปรไฟล์</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
              {/* Account Information */}
              <FormSection title="ข้อมูลบัญชี">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField label="ชื่อผู้ใช้" required>
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="username"
                      required
                    />
                  </FormField>
                  
                  <FormField label="รหัสผ่าน" required>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="password"
                      required
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* Personal Information */}
              <FormSection title="ข้อมูลส่วนตัว">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField label="ชื่อ" required>
                    <Input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="ชื่อจริง"
                      required
                    />
                  </FormField>

                  <FormField label="นามสกุล">
                    <Input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="นามสกุล"
                    />
                  </FormField>

                  <FormField label="ชื่อเล่น" required>
                    <Input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      placeholder="ชื่อเล่น"
                      required
                    />
                  </FormField>

                  <FormField label="สัญชาติ">
                    <Input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      placeholder="สัญชาติ"
                    />
                  </FormField>

                  <FormField label="อีเมล">
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                    />
                  </FormField>

                  <FormField label="เบอร์โทร">
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0812345678"
                    />
                  </FormField>

                  <FormField label="Line ID">
                    <Input
                      type="text"
                      name="line_id"
                      value={formData.line_id}
                      onChange={handleInputChange}
                      placeholder="Line ID"
                    />
                  </FormField>

                  <FormField label="อัตราค่าจ้าง/ชั่วโมง">
                    <Input
                      type="number"
                      name="hourly_rate"
                      value={formData.hourly_rate}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* Teaching Information */}
              <FormSection title="ข้อมูลการสอน">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField label="ประเภทครู" required>
                    <Select
                      name="teacher_type"
                      value={formData.teacher_type}
                      onChange={handleInputChange}
                      options={teacherTypeOptions}
                      required
                    />
                  </FormField>

                  <FormField label="สาขา" required>
                    <Select
                      name="branch_id"
                      value={formData.branch_id}
                      onChange={handleInputChange}
                      options={branchOptions}
                      required
                    />
                  </FormField>
                </div>

                <FormField label="ความเชี่ยวชาญ">
                  <Textarea
                    name="specializations_input"
                    value={formData.specializations.join(', ')}
                    onChange={(e) => handleSpecializationsChange(e.target.value)}
                    rows={3}
                    placeholder="Kid Conversation, Adult Conversation, IELTS (คั่นด้วยเครื่องหมายจุลภาค)"
                  />
                </FormField>

                <FormField label="คุณสมบัติและประกาศนียบัตร">
                  <Textarea
                    name="certifications_input"
                    value={formData.certifications.join(', ')}
                    onChange={(e) => handleCertificationsChange(e.target.value)}
                    rows={3}
                    placeholder="BA in English, MA in TEFL (คั่นด้วยเครื่องหมายจุลภาค)"
                  />
                </FormField>
              </FormSection>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">สถานะการใช้งาน</h4>
                  <p className="text-sm text-gray-600">เปิดใช้งานบัญชีครูนี้</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#334293]"></div>
                </label>
              </div>

              {/* Form Actions */}
              <FormActions>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'กำลังสร้าง...' : 'สร้างครูใหม่'}
                </Button>
              </FormActions>
            </div>
          </form>
        </div>
      </SidebarLayout>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="สำเร็จ!"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">สร้างครูใหม่สำเร็จ!</h3>
          <p className="text-gray-600 mb-6">ข้อมูลครูได้ถูกบันทึกเรียบร้อยแล้ว</p>
          <Button
            onClick={handleSuccessModalClose}
            variant="primary"
          >
            ไปยังรายชื่อครู
          </Button>
        </div>
      </Modal>
    </>
  );
}