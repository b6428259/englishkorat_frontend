"use client";

import React from 'react';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { expanded, isMobile } = useSidebar();
  const { language } = useLanguage();
  
  return (
    <footer 
      className={`
        bg-white border-t border-gray-200 mt-auto transition-all duration-300 ease-in-out
        ${!isMobile ? (expanded ? 'ml-[280px]' : 'ml-[80px]') : 'ml-0'}
      `}
    >
      <div className="px-6 py-4">
        <p className="text-center text-sm text-gray-600">
          © 2025 English Korat. {language === 'th' ? 'สงวนลิขสิทธิ์' : 'All rights reserved'}.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 
