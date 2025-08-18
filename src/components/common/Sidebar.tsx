"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarChildItem {
  id: string;
  label: string;
  href: string;
}

interface SidebarItem {
  id: string;
  label: string;
  href?: string;                 // เมนูหลักบางอันอาจไม่มี href (ใช้แค่กางเมนูย่อย)
  icon: React.ReactNode;
  children?: SidebarChildItem[]; // เมนูย่อย
}

interface SidebarProps {
  className?: string;
  expanded: boolean;           // รับจาก parent
  isMobile: boolean;           // รับจาก parent
  onToggle: (expanded: boolean) => void;
}

const ANIM_DURATION = 0.3; // วินาที ต้องเท่ากับ transition.duration ของ motion.aside

const Sidebar: React.FC<SidebarProps> = ({ className = '', expanded, isMobile, onToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useLanguage();

  // 1) แสดง label เฉพาะหลังขยายเสร็จจริง ๆ
  const [labelsVisible, setLabelsVisible] = useState(expanded);

  // 2) จัดการสถานะเมนูย่อย
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [pendingOpenMenu, setPendingOpenMenu] = useState<string | null>(null); // ใช้ตอนคลิกเมนูหลักตอน sidebar ยังปิดอยู่

  const isActiveRoute = (href?: string) => !!href && pathname === href;

  const sidebarItems: SidebarItem[] = useMemo(() => ([
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      // มีเมนูย่อย (ไม่ต้องมี href ที่ parent ก็ได้)
      children: [
        { id: 'dashboard-analytic', label: 'Analytic', href: '/dashboard/analytic' },
        { id: 'dashboard-report',   label: 'Report',   href: '/dashboard/report'   },
      ],
    },
    {
      id: 'student-registration',
      label: t.studentRegistration,
      href: '/studentRegistration',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'profile',
      label: t.profile,
      href: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]), [t]);

  // เปิดเมนูย่อยอัตโนมัติถ้าหน้านั้นอยู่ใน children
  useEffect(() => {
    const nextOpen: Record<string, boolean> = {};
    sidebarItems.forEach(item => {
      if (item.children?.some(c => isActiveRoute(c.href))) {
        nextOpen[item.id] = true;
      }
    });
    setOpenMenus(prev => ({ ...prev, ...nextOpen }));
  }, [pathname, sidebarItems]);

  // คุมการแสดง labels ตามสถานะ expanded + แอนิเมชัน
  useEffect(() => {
    if (!expanded) {
      // กำลังจะยุบ -> ซ่อน label ทันที
      setLabelsVisible(false);
    } else {
      // กำลังจะขยาย -> รอจนแอนิเมชันของ aside จบ แล้วค่อยโชว์
      const timer = setTimeout(() => setLabelsVisible(true), ANIM_DURATION * 1000);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  // ถ้าเคยกดเมนูหลักตอน sidebar ยังปิดอยู่: พอขยายเสร็จ ค่อยกางเมนูย่อย
  useEffect(() => {
    if (expanded && pendingOpenMenu) {
      const timer = setTimeout(() => {
        setOpenMenus(prev => ({ ...prev, [pendingOpenMenu]: true }));
        setPendingOpenMenu(null);
      }, ANIM_DURATION * 1000);
      return () => clearTimeout(timer);
    }
  }, [expanded, pendingOpenMenu]);

  const handleToggleSidebar = () => onToggle(!expanded);

  const handleParentClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      if (!expanded) {
        // ยังปิดอยู่: ขยายก่อน แล้วกางเมนูนี้หลังขยายเสร็จ
        setPendingOpenMenu(item.id);
        onToggle(true);
        return;
      }
      setOpenMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
      return;
    }

    // ไม่มี children: ถ้ามี href ให้ไปหน้าด้วย (ปกติทำผ่าน <Link/>)
  };

  const handleChildClick = (href: string) => {
    if (isMobile) onToggle(false);
    router.push(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ 
          width: expanded ? 280 : 80,
          x: isMobile && !expanded ? -280 : 0
        }}
        transition={{ duration: ANIM_DURATION, ease: "easeInOut" }}
        className={`
          fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50
          flex flex-col
          ${isMobile ? 'shadow-2xl' : ''}
          ${className}
        `}
      >
        {/* Header + toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* โลโก้เล็กแสดงได้ตลอด */}
            <div className="w-8 h-8 bg-[#334293] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EK</span>
            </div>
            {/* ข้อความชื่อ - แสดงหลังขยายเสร็จเท่านั้น */}
            <AnimatePresence mode="wait">
              {labelsVisible && (
                <motion.span
                  key="brand"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="font-semibold text-gray-900 whitespace-nowrap"
                >
                  {t.englishKorat}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg 
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${expanded ? 'rotate-0' : 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isOpen = !!openMenus[item.id];
              const isActive = isActiveRoute(item.href) || item.children?.some(c => isActiveRoute(c.href));

              const ParentButton = (
                <button
                  type="button"
                  onClick={() => handleParentClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActive ? 'bg-[#334293] text-white' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>

                  {/* ชื่อเมนู: แสดงหลังขยายเสร็จเท่านั้น */}
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <AnimatePresence mode="wait">
                      {labelsVisible && (
                        <motion.span
                          key={`${item.id}-label`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium text-left truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* caret แสดงเฉพาะเมื่อมี children และขยายแล้ว */}
                    {labelsVisible && item.children && (
                      <svg
                        className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );

              // ถ้าไม่มี children และมี href: ใช้ <Link> แต่ยังคุม labelVisible อยู่
              const ParentLink = item.href ? (
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full
                    ${isActive ? 'bg-[#334293] text-white' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                  onClick={() => { if (isMobile) onToggle(false); }}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <AnimatePresence mode="wait">
                    {labelsVisible && (
                      <motion.span
                        key={`${item.id}-label-link`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              ) : null;

              return (
                <li key={item.id}>
                  {/* ถ้ามี children ใช้ปุ่มควบคุมเอง, ถ้าไม่มี children ใช้ Link ปกติ */}
                  {item.children && item.children.length > 0 ? ParentButton : ParentLink}

                  {/* Submenu */}
                  <AnimatePresence initial={false}>
                    {expanded && labelsVisible && item.children && isOpen && (
                      <motion.ul
                        key={`${item.id}-submenu`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="mt-1 ml-10 pr-2 flex flex-col overflow-hidden"
                      >
                        {item.children.map((child) => {
                          const childActive = isActiveRoute(child.href);
                          return (
                            <li key={child.id}>
                              <button
                                onClick={() => handleChildClick(child.href)}
                                className={`
                                  w-full text-left px-2 py-2 rounded-md text-sm
                                  ${childActive ? 'bg-[#e7e9f8] text-[#334293] font-medium' : 'text-gray-600 hover:bg-gray-100'}
                                `}
                              >
                                {child.label}
                              </button>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            <AnimatePresence mode="wait">
              {labelsVisible && (
                <motion.span
                  key="logout-label"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium"
                >
                  {t.logout}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      {isMobile && expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => onToggle(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
