/**
 * Sidebar navigation configuration
 * Centralized configuration for all sidebar menu items
 */

import { SidebarItem } from './types';
import { Translations } from '@/locales/translations';

/**
 * Dashboard icon component
 */
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
  </svg>
);

/**
 * Student registration icon component
 */
const StudentRegistrationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

/**
 * Profile icon component
 */
const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

/**
 * Logout icon component
 */
export const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

/**
 * Generate sidebar items configuration based on translations
 * @param t - Translation object
 * @returns Array of sidebar items
 */
export const getSidebarItems = (t: Translations): SidebarItem[] => [
  {
    id: 'dashboard',
    label: t.dashboard,
    icon: <DashboardIcon />,
    // Dashboard has children (submenu items)
    children: [
      { id: 'dashboard-analytic', label: 'Analytics', href: '/dashboard/analytic' },
      { id: 'dashboard-report', label: 'Reports', href: '/dashboard/report' },
    ],
  },
  {
    id: 'student-registration',
    label: t.studentRegistration,
    href: '/studentRegistration',
    icon: <StudentRegistrationIcon />,
  },
  {
    id: 'profile',
    label: t.profile,
    href: '/profile',
    icon: <ProfileIcon />,
  },
];