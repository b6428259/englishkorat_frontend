"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  SidebarProps,
  getSidebarItems, 
  LogoutIcon 
} from '../sidebar';
import { SidebarItem as SidebarItemType } from '../sidebar/types';
import SidebarItemComponent from '../sidebar/SidebarItem';
import SidebarToggle from '../sidebar/SidebarToggle';

/**
 * Animation duration for sidebar transitions (in seconds)
 */
const ANIM_DURATION = 0.3;

/**
 * Main Sidebar Component with improved structure and HeroUI integration
 */
const Sidebar: React.FC<SidebarProps> = ({ 
  className = '', 
  expanded, 
  isMobile, 
  onToggle 
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useLanguage();

  // State for managing label visibility after animation
  const [labelsVisible, setLabelsVisible] = useState(expanded);
  
  // State for managing submenu open/close status
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  
  // Pending menu to open after sidebar expansion
  const [pendingOpenMenu, setPendingOpenMenu] = useState<string | null>(null);

  /**
   * Check if a route is currently active
   */
  const isActiveRoute = useCallback(
    (href?: string) => !!href && pathname === href,
    [pathname]
  );

  /**
   * Get sidebar items configuration
   */
  const sidebarItems: SidebarItemType[] = useMemo(() => getSidebarItems(t), [t]);

  /**
   * Auto-open submenu if current page is within children
   */
  useEffect(() => {
    const nextOpen: Record<string, boolean> = {};
    sidebarItems.forEach(item => {
      if (item.children?.some(c => isActiveRoute(c.href))) {
        nextOpen[item.id] = true;
      }
    });
    setOpenMenus(prev => ({ ...prev, ...nextOpen }));
  }, [pathname, sidebarItems, isActiveRoute]);

  /**
   * Manage label visibility based on sidebar expansion with animation delay
   */
  useEffect(() => {
    if (!expanded) {
      // Collapsing: hide labels immediately
      setLabelsVisible(false);
    } else {
      // Expanding: show labels after animation completes
      const timer = setTimeout(() => setLabelsVisible(true), ANIM_DURATION * 1000);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  /**
   * Handle pending submenu opening after sidebar expansion
   */
  useEffect(() => {
    if (expanded && pendingOpenMenu) {
      const timer = setTimeout(() => {
        setOpenMenus(prev => ({ ...prev, [pendingOpenMenu]: true }));
        setPendingOpenMenu(null);
      }, ANIM_DURATION * 1000);
      return () => clearTimeout(timer);
    }
  }, [expanded, pendingOpenMenu]);

  /**
   * Handle sidebar toggle
   */
  const handleToggleSidebar = () => onToggle(!expanded);

  /**
   * Handle parent menu item clicks
   */
  const handleParentClick = (item: SidebarItemType) => {
    if (item.children && item.children.length > 0) {
      if (!expanded) {
        // Sidebar collapsed: expand first, then open submenu
        setPendingOpenMenu(item.id);
        onToggle(true);
        return;
      }
      // Toggle submenu open/close
      setOpenMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
      return;
    }
    // No children: navigation handled by Link component
  };

  /**
   * Handle child menu item clicks
   */
  const handleChildClick = (href: string) => {
    if (isMobile) onToggle(false);
    router.push(href);
  };

  /**
   * Handle logout action
   */
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
          flex flex-col relative
          ${isMobile ? 'shadow-2xl' : ''}
          ${className}
        `}
      >
        {/* Toggle Button - positioned on the right edge */}
        <SidebarToggle 
          expanded={expanded}
          isMobile={isMobile}
          onToggle={handleToggleSidebar}
        />

        {/* Header with Logo and Brand */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo - always visible */}
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">EK</span>
            </div>
            
            {/* Brand name - shown after expansion */}
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

          {/* Mobile-only close button */}
          {isMobile && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => onToggle(false)}
              className="cursor-pointer"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isOpen = !!openMenus[item.id];
              const isActive = !!isActiveRoute(item.href) || !!(item.children?.some(c => isActiveRoute(c.href)));

              return (
                <SidebarItemComponent
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  expanded={expanded}
                  labelsVisible={labelsVisible}
                  isMobile={isMobile}
                  isOpen={isOpen}
                  onParentClick={handleParentClick}
                  onChildClick={handleChildClick}
                  isActiveRoute={isActiveRoute}
                />
              );
            })}
          </ul>
        </nav>

        {/* Divider */}
        <div className="px-4">
          <Divider />
        </div>

        {/* Logout Section */}
        <div className="p-4">
          <Button
            variant="light"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer justify-start"
            onPress={handleLogout}
            startContent={
              <span className="flex-shrink-0">
                <LogoutIcon />
              </span>
            }
          >
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
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
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
