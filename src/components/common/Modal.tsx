"use client"

import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  className?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children, 
  showCloseButton = true,
  size = 'lg',
  className = ''
}: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Handle modal animations and scroll behavior
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Store original overflow value
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Faster animation start
      const timer = setTimeout(() => setIsAnimating(true), 1);
      
      return () => {
        clearTimeout(timer);
        // Restore scroll when modal closes
        document.body.style.overflow = originalStyle;
        document.documentElement.style.overflow = '';
      };
    } else {
      setIsAnimating(false);
      // Allow scroll to restore
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      // Faster animation end
      const timer = setTimeout(() => setShouldRender(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-7xl',
    'full': 'max-w-[95vw]'
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${className}`}>
      {/* Backdrop with faster blur */}
      <div 
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-all duration-150 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 md:p-6">
        <div 
          className={`relative w-full ${sizeClasses[size]} transform transition-all duration-150 ${
            isAnimating 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="relative bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h2 className="text-xl font-bold text-gray-900 leading-tight">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="ml-4 flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                      aria-label="Close modal"
                    >
                      <HiXMark className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
