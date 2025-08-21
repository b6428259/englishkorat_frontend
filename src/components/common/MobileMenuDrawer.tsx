"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSidebarItems } from '../sidebar/sidebarConfig';
import { HiOutlineXMark } from 'react-icons/hi2';
import Image from 'next/image';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  
  const sidebarItems = getSidebarItems(t);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleItemClick = (href?: string) => {
    if (href) {
      router.push(href);
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-hidden md:hidden"
            style={{
              boxShadow: '0 -10px 40px rgba(0,0,0,0.15)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src="https://ui-avatars.com/api/?name=EK&background=334293&color=fff&size=64"
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{t.englishKorat}</h3>
                  {user && (
                    <p className="text-sm text-gray-600">{user.username}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <HiOutlineXMark size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 pb-safe">
              <div className="space-y-2">
                {sidebarItems.map((item) => (
                  <div key={item.id}>
                    {/* Parent Item */}
                    <button
                      onClick={() => handleItemClick(item.href)}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200
                        ${item.href 
                          ? 'hover:bg-[#e7e9f8] hover:text-[#334293] active:scale-95' 
                          : 'cursor-default'
                        }
                      `}
                    >
                      <span className="text-gray-600 text-xl">
                        {item.icon}
                      </span>
                      <span className="font-medium text-gray-900 text-left flex-1">
                        {item.label}
                      </span>
                    </button>

                    {/* Child Items */}
                    {item.children && item.children.length > 0 && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => handleItemClick(child.href)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-all duration-200 active:scale-95"
                          >
                            {child.icon && (
                              <span className="text-gray-500 text-lg">
                                {child.icon}
                              </span>
                            )}
                            <span className="text-gray-700 font-medium">
                              {child.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Logout Button */}
                <div className="pt-4 border-t border-gray-100 mt-6">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 active:scale-95"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">
                      {t.logout}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuDrawer;