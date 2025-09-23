"use client"

import SuccessDialog from '@/components/ui/SuccessDialog';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  loadingMessage?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title = 'สำเร็จ', 
  message = 'ดำเนินการสำเร็จ',
  loadingMessage,
  autoClose = true,
  autoCloseDelay = 2000
}: SuccessModalProps) {
  return (
    <SuccessDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      loadingMessage={loadingMessage}
      autoClose={autoClose}
      autoCloseDelay={autoCloseDelay}
    />
  );
}
