"use client";

import React from 'react';
import Modal from './Modal';
import ModernButton from './ModernButton';
import { FormSection, FieldGroup, StatusMessage } from './forms';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'success' | 'danger';
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'secondary' | 'ghost' | 'outline';
  };
  error?: string | null;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  footerClassName?: string;
}

export default function ActionModal({
  isOpen,
  onClose,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  error,
  children,
  size = 'lg',
  footerClassName = ''
}: ActionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size={size}
      showCloseButton={true}
    >
      {/* Content */}
      <div className="p-6 space-y-6">
        {children}
        
        {/* Error Display */}
        {error && (
          <StatusMessage
            type="error"
            message={error}
          />
        )}
      </div>

      {/* Footer */}
      {(primaryAction || secondaryAction) && (
        <div className={`bg-gray-50 border-t border-gray-100 px-6 py-4 ${footerClassName}`}>
          <div className="flex items-center justify-end gap-3">
            {secondaryAction && (
              <ModernButton
                variant={secondaryAction.variant || 'ghost'}
                onClick={secondaryAction.onClick}
                size="md"
              >
                {secondaryAction.label}
              </ModernButton>
            )}
            
            {primaryAction && (
              <ModernButton
                variant={primaryAction.variant || 'primary'}
                onClick={primaryAction.onClick}
                loading={primaryAction.loading}
                disabled={primaryAction.disabled}
                icon={primaryAction.icon}
                size="md"
                gradient={primaryAction.variant === 'primary'}
              >
                {primaryAction.label}
              </ModernButton>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

// Export additional components for reuse
export { FormSection, FieldGroup, StatusMessage };
