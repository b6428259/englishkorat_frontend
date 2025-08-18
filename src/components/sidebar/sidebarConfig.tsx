/**
 * Sidebar navigation configuration
 * Centralized configuration for all sidebar menu items
 */


import { SidebarItem } from './types';
import { Translations } from '@/locales/translations';
import { HiOutlineSquares2X2, HiOutlineChartBar, HiOutlineDocumentText, HiOutlineCog, HiOutlineIdentification, HiOutlineUser, HiOutlineKey } from 'react-icons/hi2';

// Icon props for easy future customization
const iconProps = {
  size: 20,
  className: '', // สีจะกำหนดใน Sidebar.tsx ตาม active
};

export const LogoutIcon = (props: any) => (
  <HiOutlineDocumentText {...iconProps} {...props} />
);

export const getSidebarItems = (t: Translations): SidebarItem[] => [
  {
    id: 'dashboard',
    label: t.dashboard,
    href: '/dashboard',
    icon: <HiOutlineSquares2X2 {...iconProps} />,
  },
  {
    id: 'dashboard-analytic',
    label: 'Analytics',
    href: '/dashboard/analytic',
    icon: <HiOutlineChartBar {...iconProps} />,
  },
  {
    id: 'dashboard-report',
    label: 'Reports',
    href: '/dashboard/report',
    icon: <HiOutlineDocumentText {...iconProps} />,
  },
  {
    id: 'student-management',
    label: 'จัดการนักเรียน',
    icon: <HiOutlineIdentification {...iconProps} />,
    children: [
      { id: 'student-registration', label: t.studentRegistration, href: '/studentRegistration', icon: <HiOutlineIdentification {...iconProps} /> },
      { id: 'student-new', label: 'นักเรียนใหม่', href: '/students/new', icon: <HiOutlineUser {...iconProps} /> },
      { id: 'student-list', label: 'รายชื่อนักเรียน', href: '/students/list', icon: <HiOutlineDocumentText {...iconProps} /> },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <HiOutlineCog {...iconProps} />,
    children: [
      { id: 'settings-profile', label: 'Personal Info', href: '/settings/profile', icon: <HiOutlineUser {...iconProps} /> },
      { id: 'settings-system', label: 'System Settings', href: '/settings/system', icon: <HiOutlineCog {...iconProps} /> },
      { id: 'settings-password', label: 'Change Password', href: '/settings/password', icon: <HiOutlineKey {...iconProps} /> },
    ],
  },
];

/**
 * Generate sidebar items configuration based on translations
 * @param t - Translation object
 * @returns Array of sidebar items
 */
