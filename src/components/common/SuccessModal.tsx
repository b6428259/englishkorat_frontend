"use client"

import { useEffect } from 'react';
import Modal from './Modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  loadingMessage?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message,
  loadingMessage = 'กำลังเปลี่ยนหน้า...',
  autoClose = true,
  autoCloseDelay = 2000
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="sm">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <svg 
            className="h-8 w-8 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Loading indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{loadingMessage}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
