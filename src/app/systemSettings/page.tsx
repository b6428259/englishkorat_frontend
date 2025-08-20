"use client";

import React from "react";
import SidebarLayout from '@/components/common/SidebarLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const SystemSettingsPage = () => {
  const { t } = useLanguage();

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.systemSettings }
      ]}
    >
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-4">{t.systemSettings}</h1>
        <p className="text-gray-700">This is the System Settings page. Add your system configuration options here.</p>
      </div>
    </SidebarLayout>
  );
};

export default SystemSettingsPage;
