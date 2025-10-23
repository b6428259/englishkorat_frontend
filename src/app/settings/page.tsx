"use client";

import Link from "next/link";
import SidebarLayout from "../../components/common/SidebarLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../hooks/useAuth";

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const settingsOptions = [
    {
      title: t.profile,
      description:
        language === "th"
          ? "จัดการข้อมูลส่วนตัวของคุณ"
          : "Manage your personal information",
      href: "/settings/profile",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      roles: ["student", "teacher", "admin", "owner"],
    },
    {
      title: t.changePassword,
      description:
        language === "th" ? "เปลี่ยนรหัสผ่านของคุณ" : "Change your password",
      href: "/settings/password",
      icon: (
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
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
      roles: ["student", "teacher", "admin", "owner"],
    },
    {
      title: language === "th" ? "ตั้งค่าสาขา" : "Branch Settings",
      description:
        language === "th"
          ? "จัดการโลโก้และแบนเนอร์ของสาขา"
          : "Manage branch logo and banner",
      href: "/settings/branch",
      icon: (
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      roles: ["admin", "owner"],
    },
    {
      title: t.systemSettings || "System Settings",
      description:
        language === "th" ? "การตั้งค่าระบบทั่วไป" : "General system settings",
      href: "/settings/system",
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      roles: ["student", "teacher", "admin", "owner"],
    },
  ];

  // Filter options based on user role
  const filteredOptions = settingsOptions.filter(
    (option) => !user || option.roles.includes(user.role)
  );

  return (
    <SidebarLayout breadcrumbItems={[{ label: t.settings }]}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t.settings}
            </h1>
            <p className="text-gray-600">
              {language === "th"
                ? "จัดการการตั้งค่าและข้อมูลส่วนตัวของคุณ"
                : "Manage your account settings and personal information"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOptions.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#334293] hover:shadow-md transition-all group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#334293] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform text-white">
                    {option.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
