"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiOutlineSquares2X2, HiOutlineUser, HiOutlineCog, HiOutlineEllipsisHorizontal } from 'react-icons/hi2';

interface BottomNavbarProps {
  onMoreClick: () => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ onMoreClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  // Get key navigation items for bottom navbar
  const bottomNavItems = [
    {
      id: 'dashboard',
      label: t.dashboard,
      href: '/dashboard',
      icon: <HiOutlineSquares2X2 size={24} />,
    },
    {
      id: 'students',
      label: t.studentManagement,
      href: '/students/list',
      icon: <HiOutlineUser size={24} />,
    },
    {
      id: 'settings',
      label: t.settings,
      href: '/settings/profile',
      icon: <HiOutlineCog size={24} />,
    },
    {
      id: 'more',
      label: 'เพิ่มเติม',
      icon: <HiOutlineEllipsisHorizontal size={24} />,
      onClick: onMoreClick,
    },
  ];

  const handleNavClick = (item: typeof bottomNavItems[0]) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50 md:hidden"
      style={{ 
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)'
      }}
    >
      <div className="flex items-center justify-around px-4 py-2 safe-area-pb">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg min-w-[70px] transition-all duration-200
                ${active 
                  ? 'text-[#334293] bg-[#e7e9f8]' 
                  : 'text-gray-600 hover:text-[#334293] hover:bg-gray-50'
                }
              `}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  p-1 rounded-lg mb-1 transition-colors duration-200
                  ${active ? 'text-[#334293]' : 'text-gray-600'}
                `}
              >
                {item.icon}
              </motion.div>
              <span className={`
                text-xs font-medium truncate max-w-[60px] transition-colors duration-200
                ${active ? 'text-[#334293]' : 'text-gray-600'}
              `}>
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#334293] rounded-full"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BottomNavbar;