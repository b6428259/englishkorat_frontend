"use client"

import Modal from './Modal';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  showRetryButton?: boolean;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorModal({ 
  isOpen, 
  onClose, 
  title, 
  message,
  showRetryButton = false,
  onRetry,
  retryText = 'ลองใหม่'
}: ErrorModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={true} size="sm">
      <div className="text-center">
        {/* Error Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <svg 
            className="h-8 w-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
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

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          {showRetryButton && onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {retryText}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            ปิด
          </button>
        </div>
      </div>
    </Modal>
  );
}
