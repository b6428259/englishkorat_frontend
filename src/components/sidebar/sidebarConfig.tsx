/**
 * Sidebar navigation configuration
 * Centralized configuration for all sidebar menu items
 */

import { Translations } from "@/locales/translations";
import { FaPaperPlane, FaUserSlash } from "react-icons/fa";
import { GrSchedules } from "react-icons/gr";
import { HiOutlineDocumentReport } from "react-icons/hi";
import {
  HiOutlineBeaker,
  HiOutlineBell,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineDocumentText,
  HiOutlineIdentification,
  HiOutlineKey,
  HiOutlineSquares2X2,
  HiOutlineUser,
} from "react-icons/hi2";
import { PiCashRegister } from "react-icons/pi";
import { SidebarItem } from "./types";

// Icon props for easy future customization
const iconProps = {
  size: 20,
  className: "", // สีจะกำหนดใน Sidebar.tsx ตาม active
};

export const LogoutIcon = (props: React.SVGProps<SVGElement>) => (
  <HiOutlineDocumentText {...iconProps} {...props} />
);

export const getSidebarItems = (t: Translations): SidebarItem[] => [
  {
    id: "dashboard",
    label: t.dashboard,
    href: "/dashboard",
    icon: <HiOutlineSquares2X2 {...iconProps} />,
  },
  {
    id: "notifications",
    label: "การแจ้งเตือน",
    icon: <HiOutlineBell {...iconProps} />,
    children: [
      {
        id: "notifications-view",
        label: "ดูการแจ้งเตือน",
        href: "/notifications",
        icon: <HiOutlineBell {...iconProps} />,
      },
      {
        id: "notifications-send",
        label: "ส่งการแจ้งเตือน",
        href: "/send-notification",
        icon: <FaPaperPlane {...iconProps} />,
      },
      {
        id: "notifications-demo",
        label: "ทดสอบระบบ",
        href: "/demo-notifications",
        icon: <HiOutlineCog {...iconProps} />,
      },
      {
        id: "notifications-test",
        label: "ทดสอบ WebSocket",
        href: "/test-notifications",
        icon: <HiOutlineBeaker {...iconProps} />,
      },
    ],
  },
  {
    id: "teacher-portal",
    label: t.teacherPortal,
    icon: <HiOutlineUser {...iconProps} />,
    children: [
      {
        id: "schedule",
        label: t.schedule,
        href: "/teachers/schedule",
        icon: <GrSchedules {...iconProps} />,
      },
      {
        id: "teachingReport",
        label: t.teachingReport,
        href: "/teachers/teachingReport",
        icon: <HiOutlineDocumentReport {...iconProps} />,
      },
    ],
  },
  {
    id: "student-portal",
    label: t.studentPortal,
    icon: <HiOutlineUser {...iconProps} />,
    children: [
      {
        id: "schedule",
        label: t.studentSchedule,
        href: "/student/schedule",
        icon: <GrSchedules {...iconProps} />,
      },
    ],
  },
  {
    id: "borrowing-system",
    label: "ระบบยืม-คืน",
    icon: <HiOutlineDocumentText {...iconProps} />,
    children: [
      {
        id: "borrowing-my-borrows",
        label: "การยืมของฉัน",
        href: "/borrowing/my-borrows",
        icon: <HiOutlineDocumentText {...iconProps} />,
      },
      {
        id: "borrowing-management",
        label: "จัดการระบบยืม-คืน",
        href: "/borrowing/management",
        icon: <HiOutlineCog {...iconProps} />,
      },
    ],
  },
  {
    id: "dashboard-analytic",
    label: t.analytics,
    href: "/dashboard/analytic",
    icon: <HiOutlineChartBar {...iconProps} />,
  },
  {
    id: "dashboard-report",
    label: t.reports,
    href: "/dashboard/report",
    icon: <HiOutlineDocumentText {...iconProps} />,
  },
  {
    id: "student-management",
    label: t.studentManagement,
    href: "/students",
    icon: <HiOutlineIdentification {...iconProps} />,
    children: [
      {
        id: "student-assign",
        label: t.studentRegistration,
        href: "/students/assign",
        icon: <HiOutlineIdentification {...iconProps} />,
      },
      {
        id: "student-new",
        label: t.studentNew,
        href: "/students/new",
        icon: <HiOutlineUser {...iconProps} />,
      },
      {
        id: "student-list",
        label: t.studentList,
        href: "/students/list",
        icon: <HiOutlineDocumentText {...iconProps} />,
      },
      {
        id: "student-groups",
        label: t.studyGroups,
        href: "/students/groups",
        icon: <HiOutlineUser {...iconProps} />,
      },
      {
        id: "student-bills",
        label: t.studentBill,
        href: "/students/bills",
        icon: <PiCashRegister {...iconProps} />,
      },
      {
        id: "student-absence",
        label: t.studentAbsence,
        href: "/students/absence",
        icon: <FaUserSlash {...iconProps} />,
      },
    ],
  },
  {
    id: "teacher-management",
    label: t.teacherManagement,
    icon: <HiOutlineUser {...iconProps} />,
    children: [
      {
        id: "teacher-list",
        label: t.teacherList,
        href: "/teachers/list",
        icon: <HiOutlineDocumentText {...iconProps} />,
      },
      {
        id: "teacher-new",
        label: t.teacherNew,
        href: "/teachers/new",
        icon: <HiOutlineUser {...iconProps} />,
      },
      {
        id: "teacher-teachersSalary",
        label: t.teachersSalary,
        href: "/teachers/teachersSalary",
        icon: <PiCashRegister {...iconProps} />,
      },
    ],
  },
  {
    id: "settings",
    label: t.settings,
    icon: <HiOutlineCog {...iconProps} />,
    children: [
      {
        id: "settings-profile",
        label: t.settingsProfile,
        href: "/settings/profile",
        icon: <HiOutlineUser {...iconProps} />,
      },
      {
        id: "settings-system",
        label: t.settingsSystem,
        href: "/settings/system",
        icon: <HiOutlineCog {...iconProps} />,
      },
      {
        id: "settings-password",
        label: t.settingsPassword,
        href: "/settings/password",
        icon: <HiOutlineKey {...iconProps} />,
      },
    ],
  },
  {
    id: "LineOA",
    label: t.lineOA,
    href: "/line",
    icon: <HiOutlineDocumentText {...iconProps} />,
  },
];

/**
 * Generate sidebar items configuration based on translations
 * @param t - Translation object
 * @returns Array of sidebar items
 */
