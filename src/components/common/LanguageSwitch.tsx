"use client";

import React from 'react';
import 'country-flag-icons/react/3x2';
import { US, TH } from 'country-flag-icons/react/3x2';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../locales/translations';
import { cursorTo } from 'readline';

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
    <div className={`flex items-center justify-center px-3 py-2 ${className} cursor-pointer`}>
      <button
        onClick={handleLanguageToggle}
        className="flex items-center gap-2 px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#334293] focus:border-transparent"
        aria-label={`Switch to ${language === 'th' ? 'English' : 'Thai'} language`}
        style={{ minWidth: 100 }}
      >
        <div className="flex items-center gap-2 cursor-pointer">
          <span className={`transition-all duration-300 ${language === 'th' ? 'opacity-100 scale-110' : 'opacity-60 scale-90'}`}
                style={{ width: 24, height: 16 }}>
            <TH title="Thai" style={{ width: 24, height: 16, borderRadius: 3, boxShadow: language === 'th' ? '0 2px 8px #33429333' : 'none' }} />
          </span>
          <span className={`transition-all duration-300 ${language === 'en' ? 'opacity-100 scale-110' : 'opacity-60 scale-90'}`}
                style={{ width: 24, height: 16 }}>
            <US title="English" style={{ width: 24, height: 16, borderRadius: 3, boxShadow: language === 'en' ? '0 2px 8px #33429333' : 'none' }} />
          </span>
        </div>
        {showLabels && (
          <span className="ml-3 text-xs font-semibold text-gray-700 transition-colors duration-300">
            {language === 'th' ? 'ไทย' : 'EN'}
          </span>
        )}
      </button>
    </div>
  );
};

export default LanguageSwitch;