"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

// Types
interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  className?: string;
  onToggle?: (expanded: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '', onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useLanguage();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      if (mobile && isExpanded) {
        setIsExpanded(false);
      } else if (!mobile && !isExpanded) {
        setIsExpanded(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onToggle) {
      onToggle(newExpanded);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: t.dashboard,
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
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
  ];

  const isActiveRoute = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ 
          width: isExpanded ? 280 : 80,
          x: isMobile && !isExpanded ? -280 : 0 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`
          fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50
          flex flex-col
          ${isMobile ? 'shadow-2xl' : ''}
          ${className}
        `}
      >
        {/* Header with toggle button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-[#334293] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EK</span>
                </div>
                <span className="font-semibold text-gray-900">{t.englishKorat}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg 
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                isExpanded ? 'rotate-0' : 'rotate-180'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActiveRoute(item.href) 
                      ? 'bg-[#334293] text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => isMobile && setIsExpanded(false)}
                >
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
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
              {isExpanded && (
                <motion.span
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
      {isMobile && isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default Sidebar;