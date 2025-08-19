"use client";

import React from "react";
import SidebarLayout from '../../../components/common/SidebarLayout';
import { useLanguage } from '../../../contexts/LanguageContext';

const SystemSettingsPage = () => {
  const { t } = useLanguage();
  return (
    <SidebarLayout>
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.systemSettings || "System Settings"}</h1>
        <div className="space-y-8">
          {/* Example: Theme Switch */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Theme</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-[#334293]" />
                <span className="text-gray-700">Dark Mode</span>
              </label>
            </div>
          </section>

          {/* Example: Language Switch */}
        <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-4">Language</h2>
  <div className="flex gap-4">
    <button className="px-4 py-2 rounded bg-[#334293] text-white hover:bg-[#2a3875] flex items-center gap-2">
      {/* ธงอังกฤษ */}
      <span className="text-xl">🇬🇧</span>
      English
    </button>
    <button className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-2">
      {/* ธงไทย */}
      <span className="text-xl">🇹🇭</span>
      ไทย
    </button>
  </div>
</section>

          {/* Example: System Info */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Info</h2>
            <div className="bg-gray-50 rounded p-4 text-gray-700">
              <div>Version: 1.0.0</div>
              <div>Status: <span className="text-green-600">Online</span></div>
            </div>
          </section>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SystemSettingsPage;
