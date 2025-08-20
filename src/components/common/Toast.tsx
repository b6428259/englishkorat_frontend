"use client"

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle, HiXMark } from 'react-icons/hi2';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastData = {
      ...toast,
      id,
      duration: toast.duration || 5000
    };

    setToasts(prev => {
      const updated = [newToast, ...prev].slice(0, maxToasts);
      return updated;
    });

    // Auto-hide toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onHide: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onHide }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onHide={() => onHide(toast.id)}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastData;
  onHide: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleHide = () => {
    setIsRemoving(true);
    setTimeout(onHide, 300); // Wait for animation
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <HiXCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <HiExclamationCircle className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <HiInformationCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-amber-500 bg-amber-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className={`
        bg-white border-l-4 rounded-lg shadow-lg p-4 min-w-0
        ${getBorderColor()}
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 text-sm">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="mt-1 text-sm text-gray-600 break-words">
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={toast.action.onClick}
                    className={`
                      text-sm font-medium hover:underline focus:outline-none
                      ${toast.type === 'success' ? 'text-green-600' :
                        toast.type === 'error' ? 'text-red-600' :
                        toast.type === 'warning' ? 'text-amber-600' :
                        'text-blue-600'
                      }
                    `}
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleHide}
            className="flex-shrink-0 ml-3 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200"
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Convenience hooks
export const useSuccessToast = () => {
  const { showToast } = useToast();
  return (title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  };
};

export const useErrorToast = () => {
  const { showToast } = useToast();
  return (title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  };
};

export const useWarningToast = () => {
  const { showToast } = useToast();
  return (title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  };
};

export const useInfoToast = () => {
  const { showToast } = useToast();
  return (title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  };
};
