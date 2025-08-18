"use client";

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../locales/translations';

interface LanguageSwitchProps {
  className?: string;
  showLabels?: boolean;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ 
  className = '',
  showLabels = true 
}) => {
  const { language, setLanguage, isLoading } = useLanguage();

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded h-8 w-16 ${className}`} />
    );
  }

  const handleLanguageToggle = () => {
    const newLanguage: Language = language === 'th' ? 'en' : 'th';
    setLanguage(newLanguage);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={handleLanguageToggle}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#334293] focus:border-transparent"
        aria-label={`Switch to ${language === 'th' ? 'English' : 'Thai'} language`}
      >
        {/* Flag Icons */}
        <div className="flex items-center space-x-1">
          <span 
            className={`text-lg transition-opacity ${
              language === 'th' ? 'opacity-100' : 'opacity-50'
            }`}
            title="Thai"
          >
            🇹🇭
          </span>
          <div className="w-px h-4 bg-gray-300" />
          <span 
            className={`text-lg transition-opacity ${
              language === 'en' ? 'opacity-100' : 'opacity-50'
            }`}
            title="English"
          >
            🇺🇸
          </span>
        </div>
        
        {/* Language Labels */}
        {showLabels && (
          <span className="text-sm font-medium text-gray-700">
            {language === 'th' ? 'ไทย' : 'EN'}
          </span>
        )}
      </button>
    </div>
  );
};

export default LanguageSwitch;