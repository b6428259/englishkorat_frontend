"use client"

import React from 'react';
import { Button } from './Button';

interface FormActionsProps {
  children?: React.ReactNode;
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelText?: string;
  submitText?: string;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'right-align';
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  onCancel,
  cancelText = 'ยกเลิก',
  submitText = 'บันทึก',
  loading = false,
  className = '',
  variant = 'right-align'
}) => {
  const containerClasses = {
    default: "flex gap-4",
    'right-align': "flex justify-end gap-4 pt-6"
  };

  if (children) {
    return (
      <div className={`${containerClasses[variant]} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {onCancel && (
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        variant="primary"
        loading={loading}
      >
        {submitText}
      </Button>
    </div>
  );
};
