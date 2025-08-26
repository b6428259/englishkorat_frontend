"use client"

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { Input } from '../forms/Input';
import { FormField } from '../forms/FormField';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  loading?: boolean;
  
  // Advanced confirmation
  advancedConfirm?: boolean;
  confirmationText?: string;
  confirmationPlaceholder?: string;
  confirmationLabel?: string;
}

const translations = {
  th: {
    confirm: 'ยืนยัน',
    cancel: 'ยกเลิก',
    delete: 'ลบ',
    warning: 'คำเตือน',
    danger: 'อันตราย',
    typeToConfirm: 'กรุณาพิมพ์ "{text}" เพื่อยืนยัน',
    confirmAction: 'ยืนยันการดำเนินการ',
    areYouSure: 'คุณแน่ใจหรือไม่?',
    cannotUndo: 'การกระทำนี้ไม่สามารถย้อนกลับได้',
    loading: 'กำลังดำเนินการ...'
  },
  en: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete',
    warning: 'Warning',
    danger: 'Danger',
    typeToConfirm: 'Type "{text}" to confirm',
    confirmAction: 'Confirm Action',
    areYouSure: 'Are you sure?',
    cannotUndo: 'This action cannot be undone',
    loading: 'Processing...'
  }
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'info',
  loading = false,
  advancedConfirm = false,
  confirmationText = '',
  confirmationPlaceholder,
  confirmationLabel
}) => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.th;
  const [inputValue, setInputValue] = useState('');
  const [canConfirm, setCanConfirm] = useState(!advancedConfirm);

  // Reset input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setCanConfirm(!advancedConfirm);
    }
  }, [isOpen, advancedConfirm]);

  // Check if input matches confirmation text
  useEffect(() => {
    if (advancedConfirm && confirmationText) {
      setCanConfirm(inputValue === confirmationText);
    }
  }, [inputValue, confirmationText, advancedConfirm]);

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const typeStyles = {
    info: {
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100',
      button: 'primary' as const
    },
    warning: {
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      button: 'primary' as const
    },
    danger: {
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      button: 'primary' as const
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Close button */}
        {!loading && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="p-6">
          {/* Icon */}
          <div className="text-center mb-4">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${currentStyle.iconBg}`}>
              {type === 'danger' && (
                <svg className={`h-6 w-6 ${currentStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              {type === 'warning' && (
                <svg className={`h-6 w-6 ${currentStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              {type === 'info' && (
                <svg className={`h-6 w-6 ${currentStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Title and Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title || t.areYouSure}
            </h3>
            <p className="text-gray-600">
              {message || t.cannotUndo}
            </p>
          </div>

          {/* Advanced confirmation input */}
          {advancedConfirm && confirmationText && (
            <div className="mb-6 text-left">
              <FormField 
                label={confirmationLabel || t.typeToConfirm.replace('{text}', confirmationText)}
              >
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={confirmationPlaceholder || confirmationText}
                  disabled={loading}
                  className={inputValue === confirmationText ? 'border-green-300 bg-green-50' : ''}
                />
              </FormField>
              <p className="text-sm text-gray-500 mt-2">
                {t.typeToConfirm.replace('{text}', `"${confirmationText}"`)}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              {cancelText || t.cancel}
            </Button>
            
            <Button
              type="button"
              variant={currentStyle.button}
              onClick={handleConfirm}
              disabled={loading || !canConfirm}
              className={type === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : ''}
            >
              {loading ? t.loading : (confirmText || t.confirm)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
