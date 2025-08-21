"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
// Memoized animated label component with stable key
const SidebarLabel = React.memo<{ 
  visible: boolean; 
  animating: boolean; 
  children: React.ReactNode; 
  className?: string;
  itemId: string;
}>(({ visible, animating, children, className = "", itemId }) => (
  <span
    key={`label-${itemId}`} // stable key to prevent re-animation
    className={`font-medium truncate ${className}`}
    style={{
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      minWidth: '1px',
      display: 'inline-block',
      transition: animating ? 'opacity 200ms ease, visibility 200ms ease' : 'none'
    }}
  >
    {children}
  </span>
), (prevProps, nextProps) => {
  // Custom comparison to prevent re-render when only route changes
  return (
    prevProps.visible === nextProps.visible &&
    prevProps.animating === nextProps.animating &&
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className &&
    prevProps.itemId === nextProps.itemId
  );
});

SidebarLabel.displayName = 'SidebarLabel';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSidebarItems } from '../sidebar/sidebarConfig';
import type { SidebarItem } from '../sidebar/types';

interface SidebarProps {
  className?: string;
  expanded: boolean;           // รับจาก parent
  isMobile: boolean;           // รับจาก parent
  onToggle: (expanded: boolean) => void;
}

const ANIM_DURATION = 0.3; // วินาที ต้องเท่ากับ transition.duration ของ motion.aside

const SidebarComponent: React.FC<SidebarProps> = ({ className = '', expanded, isMobile, onToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useLanguage();

  // 1) แสดง label เฉพาะหลังขยายเสร็จจริง ๆ (ใช้ ref เพื่อกัน re-render/re-mount)
  const labelsVisibleRef = useRef(false);
  const animatingLabelsRef = useRef(false);
  const [, forceUpdate] = useState({}); // for manual re-render
  const lastExpandedRef = useRef(expanded); // Track previous expanded state

  // 2) จัดการสถานะเมนูย่อย - use stable state that doesn't change with route
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [pendingOpenMenu, setPendingOpenMenu] = useState<string | null>(null);

  const isActiveRoute = useCallback((href?: string) => !!href && pathname === href, [pathname]);

  // Stable sidebar items - memoized to prevent recreation
  const sidebarItems = useMemo(() => getSidebarItems(t), [t]);

  // Initialize openMenus once and preserve active menu state
  useEffect(() => {
    const activeMenus: Record<string, boolean> = {};
    sidebarItems.forEach(item => {
      if (item.children?.some(c => isActiveRoute(c.href))) {
        activeMenus[item.id] = true;
      }
    });
    
    // Only update if there are actual changes to prevent unnecessary re-renders
    setOpenMenus(prev => {
      const hasChanges = Object.keys(activeMenus).some(key => activeMenus[key] !== prev[key]);
      return hasChanges ? { ...prev, ...activeMenus } : prev;
    });
  }, [pathname, sidebarItems, isActiveRoute]);

  // คุมการแสดง labels ตามสถานะ expanded + แอนิเมชัน (trigger only on expand/collapse)
  useEffect(() => {
    // Only animate if expanded state actually changed
    if (lastExpandedRef.current === expanded) {
      return;
    }
    
    lastExpandedRef.current = expanded;
    
    if (!expanded) {
      labelsVisibleRef.current = false;
      animatingLabelsRef.current = false;
      forceUpdate({});
    } else {
      animatingLabelsRef.current = true;
      forceUpdate({});
      const timer = setTimeout(() => {
        labelsVisibleRef.current = true;
        forceUpdate({});
      }, ANIM_DURATION * 1000);
      const endTimer = setTimeout(() => {
        animatingLabelsRef.current = false;
        forceUpdate({});
      }, ANIM_DURATION * 1000 + 220);
      return () => { clearTimeout(timer); clearTimeout(endTimer); };
    }
  }, [expanded]);

  // Initialize labels visibility based on current expanded state (no animation on mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      labelsVisibleRef.current = expanded;
      lastExpandedRef.current = expanded;
      animatingLabelsRef.current = false;
      forceUpdate({});
    }
  }, []); // Run only on mount

  // Prevent flash by setting initial state immediately
  if (typeof window !== 'undefined' && labelsVisibleRef.current === undefined) {
    labelsVisibleRef.current = expanded;
    animatingLabelsRef.current = false;
  }

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
      
      // เปิดได้ทีละเมนูเท่านั้น (ปิดเมนูอื่นก่อนเปิดเมนูใหม่)
      setOpenMenus(() => {
        const newMenus: Record<string, boolean> = {};
        sidebarItems.forEach(menuItem => {
          newMenus[menuItem.id] = false;
        });
        newMenus[item.id] = true;
        return newMenus;
      });
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
          fixed left-0 top-0 h-full bg-white border-r border-gray-100 shadow-xl z-50
          flex flex-col rounded-xl transition-all duration-300
          ${isMobile ? 'shadow-2xl' : ''}
          ${className}
        `}
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 overflow-hidden rounded-t-xl bg-gradient-to-r from-white to-gray-50">
          {/* โลโก้ mock เป็นรูปโปรไฟล์วงกลม (fixed size, no shrink) */}
          <div className="flex-shrink-0" style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', background: '#e5e7eb', overflow: 'hidden' }}>
            <Image
              src="https://ui-avatars.com/api/?name=EK&background=334293&color=fff&size=64"
              alt="Profile"
              width={40}
              height={40}
              style={{ objectFit: 'cover', minWidth: 40, minHeight: 40 }}
            />
          </div>
          {/* ข้อความชื่อ - แสดงหลังขยายเสร็จเท่านั้น */}
          <SidebarLabel
            visible={labelsVisibleRef.current}
            animating={animatingLabelsRef.current}
            className="font-semibold text-gray-900 whitespace-nowrap"
            itemId="header-title"
          >
            {t.englishKorat}
          </SidebarLabel>
        </div>

        {/* Expand/Collapse Button - vertical center, edge */}
        <button
          onClick={handleToggleSidebar}
          className="absolute left-full top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
          style={{ zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${expanded ? 'rotate-0' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isOpen = !!openMenus[item.id];
              const isActive = isActiveRoute(item.href) || item.children?.some(c => isActiveRoute(c.href));

              const ParentButton = (
                <button
                  type="button"
                  onClick={() => handleParentClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer shadow-sm
                    ${isActive ? 'bg-[#334293] text-white' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                  style={{ boxShadow: isActive ? '0 2px 8px rgba(51,66,147,0.08)' : undefined }}
                >
                  <span className="flex-shrink-0">
                    {React.isValidElement(item.icon)
                      ? React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGElement>>, {
                          className: `${(item.icon as React.ReactElement<React.SVGProps<SVGElement>>).props.className ?? ''} ${isActive ? 'text-white' : 'text-gray-700'}`.trim()
                        })
                      : item.icon}
                  </span>

                  {/* ชื่อเมนู: แสดงหลังขยายเสร็จเท่านั้น */}
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <SidebarLabel
                      visible={labelsVisibleRef.current}
                      animating={animatingLabelsRef.current}
                      className="text-left"
                      itemId={item.id}
                    >
                      {item.label}
                    </SidebarLabel>

                    {/* caret แสดงเฉพาะเมื่อมี children และขยายแล้ว */}
                    {labelsVisibleRef.current && item.children && (
                      <svg
                        className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full cursor-pointer shadow-sm
                    ${isActive ? 'bg-[#334293] text-white' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                  style={{ boxShadow: isActive ? '0 2px 8px rgba(51,66,147,0.08)' : undefined }}
                  onClick={() => { if (isMobile) onToggle(false); }}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <SidebarLabel
                    visible={labelsVisibleRef.current}
                    animating={animatingLabelsRef.current}
                    itemId={item.id}
                  >
                    {item.label}
                  </SidebarLabel>
                </Link>
              ) : null;

              return (
                <li key={item.id}>
                  {/* ถ้ามี children ใช้ปุ่มควบคุมเอง, ถ้าไม่มี children ใช้ Link ปกติ */}
                  {item.children && item.children.length > 0 ? ParentButton : ParentLink}

                  {/* Submenu */}
                  <AnimatePresence initial={false}>
                    {expanded && labelsVisibleRef.current && item.children && isOpen && (
                      <motion.ul
                        key={`${item.id}-submenu`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="mt-1 ml-10 pr-2 flex flex-col overflow-hidden rounded-lg bg-gray-50 shadow-sm"
                      >
                        {item.children.map((child) => {
                          const childActive = isActiveRoute(child.href);
                          return (
                            <li key={child.id}>
                              <button
                                onClick={() => handleChildClick(child.href)}
                                className={`
                                  w-full flex items-center gap-2 text-left px-2 py-2 rounded-md text-sm cursor-pointer transition-all duration-200
                                  ${childActive ? 'bg-[#e7e9f8] text-[#334293] font-medium shadow' : 'text-gray-600 hover:bg-gray-100'}
                                `}
                                style={{ boxShadow: childActive ? '0 2px 8px rgba(51,66,147,0.08)' : undefined }}
                              >
                                {child.icon && (
                                  <span className="flex-shrink-0">
                                    {React.isValidElement(child.icon)
                                      ? React.cloneElement(child.icon as React.ReactElement<React.SVGProps<SVGElement>>, {
                                          className: `${(child.icon as React.ReactElement<React.SVGProps<SVGElement>>).props.className ?? ''} ${childActive ? 'text-[#334293]' : 'text-gray-700'}`.trim()
                                        })
                                      : child.icon}
                                  </span>
                                )}
                                <SidebarLabel
                                  visible={labelsVisibleRef.current}
                                  animating={animatingLabelsRef.current}
                                  itemId={child.id}
                                >
                                  {child.label}
                                </SidebarLabel>
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
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-700 bg-red-50 border border-red-300 hover:bg-red-200 hover:border-red-400 transition-colors cursor-pointer shadow-sm"
          >
            <span className="flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            <SidebarLabel
              visible={labelsVisibleRef.current}
              animating={animatingLabelsRef.current}
              className="transition-all duration-200"
              itemId="logout"
            >
              {t.logout}
            </SidebarLabel>
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

export default React.memo(SidebarComponent);
