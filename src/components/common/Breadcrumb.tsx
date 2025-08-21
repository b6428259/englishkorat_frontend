"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiChevronRight, HiHome } from 'react-icons/hi2';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, showHome = true }) => {
  const pathname = usePathname();
  const { language } = useLanguage();

  // Auto-generate breadcrumbs from pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Path name translations
    const pathTranslations: Record<string, { th: string; en: string }> = {
      dashboard: { th: 'แดชบอร์ด', en: 'Dashboard' },
      students: { th: 'จัดการนักเรียน', en: 'Student Management' },
      new: { th: 'เพิ่มใหม่', en: 'New' },
      list: { th: 'รายชื่อ', en: 'List' },
      assign: { th: 'มอบหมาย', en: 'Assign' },
      settings: { th: 'การตั้งค่า', en: 'Settings' },
      profile: { th: 'โปรไฟล์', en: 'Profile' },
      password: { th: 'รหัสผ่าน', en: 'Password' },
      system: { th: 'ระบบ', en: 'System' },
      systemSettings: { th: 'การตั้งค่าระบบ', en: 'System Settings' },
      studentRegistration: { th: 'ลงทะเบียนนักเรียน', en: 'Student Registration' },
      schedule: { th: 'ตารางเรียน', en: 'Schedule' },
      auth: { th: 'เข้าสู่ระบบ', en: 'Authentication' },
      courses: { th: 'หลักสูตร', en: 'Courses' },
      teachers: { th: 'ครู', en: 'Teachers' },
      analytics: { th: 'วิเคราะห์ข้อมูล', en: 'Analytics' },
      reports: { th: 'รายงาน', en: 'Reports' }
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      const translation = pathTranslations[segment];
      const label = translation 
        ? (language === 'th' ? translation.th : translation.en)
        : segment.charAt(0).toUpperCase() + segment.slice(1);

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't render if on root path and no specific items provided
  if (pathname === '/' || (breadcrumbItems.length === 0 && !items)) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 bg-white p-3 rounded-lg shadow-sm" aria-label="Breadcrumb">
      {showHome && (
        <>
          <Link 
            href="/dashboard" 
            className="flex items-center hover:text-[#334293] transition-colors"
          >
            <HiHome className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
          {breadcrumbItems.length > 0 && (
            <HiChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </>
      )}
      
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-[#334293] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">
              {item.label}
            </span>
          )}
          
          {index < breadcrumbItems.length - 1 && (
            <HiChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
