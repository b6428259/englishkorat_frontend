/**
 * Sidebar navigation configuration
 * Centralized configuration for all sidebar menu items
 */


import { SidebarItem } from './types';
import { Translations } from '@/locales/translations';
import { HiOutlineSquares2X2, HiOutlineChartBar, HiOutlineDocumentText, HiOutlineCog, HiOutlineIdentification, HiOutlineUser, HiOutlineKey } from 'react-icons/hi2';
import { GrSchedules } from "react-icons/gr";

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
    id: 'teacher-portal',
    label: t.teacherPortal,
    icon: <HiOutlineUser {...iconProps} />,
    children: [
      { id: 'schedule', label: t.schedule, href: '/schedule', icon: <GrSchedules {...iconProps} /> },
    ],
  },
  {
    id: 'dashboard-analytic',
    label: t.analytics,
    href: '/dashboard/analytic',
    icon: <HiOutlineChartBar {...iconProps} />,
  },
  {
    id: 'dashboard-report',
    label: t.reports,
    href: '/dashboard/report',
    icon: <HiOutlineDocumentText {...iconProps} />,
  },
  {
    id: 'student-management',
    label: t.studentManagement,
    icon: <HiOutlineIdentification {...iconProps} />,
    children: [
      { id: 'student-assign', label: t.studentRegistration, href: '/students/assign', icon: <HiOutlineIdentification {...iconProps} /> },
      { id: 'student-new', label: t.studentNew, href: '/students/new', icon: <HiOutlineUser {...iconProps} /> },
      { id: 'student-list', label: t.studentList, href: '/students/list', icon: <HiOutlineDocumentText {...iconProps} /> },
    ],
  },
  {
    id: 'teacher-management',
    label: t.teacherManagement,
    icon: <HiOutlineUser {...iconProps} />,
    children: [
      { id: 'teacher-list', label: t.teacherList, href: '/teachers/list', icon: <HiOutlineDocumentText {...iconProps} /> },
      { id: 'teacher-new', label: t.teacherNew, href: '/teachers/new', icon: <HiOutlineUser {...iconProps} /> },
    ],
  },
  {
    id: 'settings',
    label: t.settings,
    icon: <HiOutlineCog {...iconProps} />,
    children: [
      { id: 'settings-profile', label: t.settingsProfile, href: '/settings/profile', icon: <HiOutlineUser {...iconProps} /> },
      { id: 'settings-system', label: t.settingsSystem, href: '/settings/system', icon: <HiOutlineCog {...iconProps} /> },
      { id: 'settings-password', label: t.settingsPassword, href: '/settings/password', icon: <HiOutlineKey {...iconProps} /> },
    ],
  },
];

/**
 * Generate sidebar items configuration based on translations
 * @param t - Translation object
 * @returns Array of sidebar items
 */
