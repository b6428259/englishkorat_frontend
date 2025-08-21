"use client";
import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UpdateProfileRequest } from '../../types/auth.types';
import { Button } from '../forms/Button';
import { Input } from '../forms/Input';
import { FormField } from '../forms/FormField';
import { RoleGuard } from './RoleGuard';
import Avatar from './Avatar';
import { useToast } from './Toast';
import { getAvatarUrl } from '../../utils/config';

interface ProfileFormData {
  username: string;
  email: string;
  phone: string;
  line_id: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ProfileSettings: React.FC = () => {
  const { user, updateProfile, changePassword, isLoading } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    line_id: user?.line_id || '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);

  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Update profile form when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        line_id: user.line_id || '',
      });
    }
  }, [user]);

  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: UpdateProfileRequest = {
        username: profileForm.username,
        email: profileForm.email,
        phone: profileForm.phone,
        line_id: profileForm.line_id,
      };

      if (selectedAvatar) {
        updateData.avatar = selectedAvatar;
      }

      await updateProfile(updateData);
      showToast({
        type: 'success',
        title: 'สำเร็จ',
        message: 'อัปเดตโปรไฟล์สำเร็จ'
      });
      setSelectedAvatar(null);
      setAvatarPreview(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์';
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: errorMessage
      });
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'รหัสผ่านใหม่ไม่ตรงกัน'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'
      });
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      showToast({
        type: 'success',
        title: 'สำเร็จ',
        message: 'เปลี่ยนรหัสผ่านสำเร็จ'
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: errorMessage
      });
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">ไม่พบข้อมูลผู้ใช้</div>
      </div>
    );
  }

  const currentAvatar = avatarPreview || getAvatarUrl(user.avatar);

  return (
    <RoleGuard requireAuth={true}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">ตั้งค่าโปรไฟล์</h1>
            <p className="text-gray-600 mt-1">จัดการข้อมูลส่วนตัวและการรักษาความปลอดภัย</p>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button
                className={`py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                ข้อมูลส่วนตัว
              </button>
              <button
                className={`py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('password')}
              >
                เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar
                      src={currentAvatar}
                      alt={user.username}
                      size="2xl"
                      fallbackInitials={getUserInitials(user.username)}
                      className="shadow-lg"
                    />
                    {/* Upload indicator overlay */}
                    {selectedAvatar && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {selectedAvatar ? 'เปลี่ยนรูปใหม่' : 'เปลี่ยนรูปโปรไฟล์'}
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG ขนาดไม่เกิน 2MB
                    </p>
                    {selectedAvatar && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ เลือกรูปใหม่แล้ว: {selectedAvatar.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* User Info (Read-only) */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลระบบ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID ผู้ใช้</label>
                      <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-600 flex items-center">
                        <span className="text-blue-600 mr-1">#</span>
                        {user.id}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท</label>
                      <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-600 flex items-center">
                        <span className="mr-2">
                          {user.role === 'owner' && '👑'}
                          {user.role === 'admin' && '⚙️'}
                          {user.role === 'teacher' && '👨‍🏫'}
                          {user.role === 'student' && '👨‍🎓'}
                        </span>
                        {user.role === 'owner' && 'เจ้าของ'}
                        {user.role === 'admin' && 'ผู้ดูแลระบบ'}
                        {user.role === 'teacher' && 'อาจารย์'}
                        {user.role === 'student' && 'นักเรียน'}
                      </div>
                    </div>
                    {user.branch_name && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">สาขา</label>
                          <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-600 flex items-center">
                            <span className="mr-2">🏢</span>
                            {user.branch_name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">รหัสสาขา</label>
                          <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-600 flex items-center font-mono">
                            {user.branch_code}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">สมาชิกเมื่อ</label>
                      <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-600 flex items-center">
                        <span className="mr-2">📅</span>
                        {new Date(user.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable Fields */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลส่วนตัว</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="ชื่อผู้ใช้" required>
                      <Input
                        value={profileForm.username}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleProfileChange('username', e.target.value)}
                        placeholder="ชื่อผู้ใช้"
                        required
                      />
                    </FormField>

                    <FormField label="อีเมล" required>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleProfileChange('email', e.target.value)}
                        placeholder="อีเมล"
                        required
                      />
                    </FormField>

                    <FormField label="เบอร์โทรศัพท์">
                      <Input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleProfileChange('phone', e.target.value)}
                        placeholder="เบอร์โทรศัพท์"
                      />
                    </FormField>

                    <FormField label="LINE ID">
                      <Input
                        value={profileForm.line_id}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleProfileChange('line_id', e.target.value)}
                        placeholder="LINE ID"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setProfileForm({
                        username: user?.username || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        line_id: user?.line_id || '',
                      });
                      setSelectedAvatar(null);
                      setAvatarPreview(null);
                    }}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    loading={isLoading}
                  >
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <div className="max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-6">เปลี่ยนรหัสผ่าน</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <FormField label="รหัสผ่านปัจจุบัน" required>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="รหัสผ่านปัจจุบัน"
                        required
                      />
                    </FormField>

                    <FormField label="รหัสผ่านใหม่" required>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                        required
                      />
                    </FormField>

                    <FormField label="ยืนยันรหัสผ่านใหม่" required>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handlePasswordChange('confirmPassword', e.target.value)}
                        placeholder="ยืนยันรหัสผ่านใหม่"
                        required
                      />
                    </FormField>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">ข้อควรระวัง</h4>
                        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                          <li>• รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร</li>
                          <li>• ควรใช้รหัสผ่านที่ปลอดภัย</li>
                          <li>• เปลี่ยนรหัสผ่านเป็นประจำ</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      })}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      loading={isLoading}
                    >
                      เปลี่ยนรหัสผ่าน
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

      </div>
    </RoleGuard>
  );
};
