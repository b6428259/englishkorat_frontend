"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

interface AuthFormProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

interface FormErrors {
  username?: string;
  password?: string;
}

export default function AuthForm({ onSuccess, onError }: AuthFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isLoading, error } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = t.pleaseEnterUsername;
    } else if (formData.username.length < 3) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = t.pleaseEnterPassword;
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await login({
        username: formData.username,
        password: formData.password,
      });
      
      if (response.success) {
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      onError?.(errorMessage);
      setIsSubmitting(false);
    }
    // Don't set isSubmitting to false on success - let it stay true until redirect
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const isLoadingState = isLoading || isSubmitting;

  return (
    <div className="w-full">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="w-40 h-20 mx-auto mb-4 flex items-center justify-center">
          <Image
            src="/icons/FullLogo.jpg"
            alt="English Korat Logo"
            width={128}
            height={128}
            className="rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          เข้าสู่ระบบ
        </h2>
        <p className="text-gray-600">
          กรอกข้อมูลเพื่อเข้าสู่ระบบ
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อผู้ใช้
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors duration-200 text-gray-900 ${
                errors.username 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-[#334293] focus:border-[#334293]'
              }`}
              placeholder="กรุณากรอกชื่อผู้ใช้"
              disabled={isLoadingState}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors duration-200 text-gray-900 ${
                errors.password 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-[#334293] focus:border-[#334293]'
              }`}
              placeholder="กรุณากรอกรหัสผ่าน"
              disabled={isLoadingState}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoadingState}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white transition-all duration-200 ${
              isLoadingState
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#334293] to-[#4f46e5] hover:from-[#2a3875] hover:to-[#4338ca] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#334293] shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isLoadingState && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoadingState ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </form>
    </div>
  );
}
