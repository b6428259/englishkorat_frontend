"use client";

import React from 'react';
import LanguageSwitch from './LanguageSwitch';
import { useLanguage } from '../../contexts/LanguageContext';

const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t.englishKorat}</h1>
        <LanguageSwitch />
      </div>
    </header>
  );
};

export default Header; 
