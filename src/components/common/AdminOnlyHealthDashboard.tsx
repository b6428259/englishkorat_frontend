"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import React from "react";
import HealthDashboard from "./HealthDashboard";

interface AdminOnlyHealthDashboardProps {
  className?: string;
}

const AdminOnlyHealthDashboard: React.FC<AdminOnlyHealthDashboardProps> = ({
  className,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  // Check if user has admin or owner role
  const hasAccess = user && (user.role === "admin" || user.role === "owner");

  if (!hasAccess) {
    return null; // Don't render anything if user doesn't have access
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {language === "th" ? "แดชบอร์ดผู้ดูแลระบบ" : "Admin Dashboard"}
              </h1>
              <p className="text-white/80 text-sm">
                {language === "th"
                  ? "ตรวจสอบสถานะและประสิทธิภาพของระบบ"
                  : "Monitor system health and performance"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <HealthDashboard className="mb-6" />

      {/* Additional admin tools can be added here */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {language === "th" ? "เครื่องมือผู้ดูแลระบบ" : "Admin Tools"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800">
                {language === "th" ? "จัดการผู้ใช้" : "User Management"}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {language === "th"
                ? "จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง"
                : "Manage user accounts and permissions"}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800">
                {language === "th" ? "รายงานระบบ" : "System Reports"}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {language === "th"
                ? "ดูรายงานการใช้งานและสถิติระบบ"
                : "View usage reports and system statistics"}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800">
                {language === "th" ? "การตั้งค่าระบบ" : "System Settings"}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {language === "th"
                ? "กำหนดค่าระบบและการแจ้งเตือน"
                : "Configure system settings and notifications"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOnlyHealthDashboard;
