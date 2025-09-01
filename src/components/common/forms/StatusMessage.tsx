"use client";

import React from 'react';
import { HiExclamationTriangle, HiInformationCircle, HiCheckCircle } from 'react-icons/hi2';

interface StatusMessageProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  details?: string[];
  className?: string;
}

const statusMap = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: HiExclamationTriangle,
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    textColor: 'text-red-700'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: HiExclamationTriangle,
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    textColor: 'text-yellow-700'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: HiInformationCircle,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700'
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: HiCheckCircle,
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    textColor: 'text-green-700'
  }
};

export default function StatusMessage({ 
  type, 
  title, 
  message, 
  details, 
  className = '' 
}: StatusMessageProps) {
  const status = statusMap[type];
  const Icon = status.icon;

  return (
    <div className={`${status.bg} ${status.border} border rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${status.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="min-w-0 flex-1">
          {title && (
            <h5 className={`font-medium ${status.titleColor} mb-1`}>
              {title}
            </h5>
          )}
          <p className={`text-sm ${status.textColor} leading-relaxed`}>
            {message}
          </p>
          {details && details.length > 0 && (
            <ul className={`mt-2 text-sm ${status.textColor} space-y-1`}>
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-current rounded-full flex-shrink-0 mt-2"></span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
