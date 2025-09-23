"use client";

import { useAuth } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getSidebarItems } from "../sidebar/sidebarConfig";
import type { SidebarItem } from "../sidebar/types";

interface MobileBottomNavbarProps {
  className?: string;
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
}

const MobileBottomNavbar: React.FC<MobileBottomNavbarProps> = ({
  className = "",
  expanded,
  onToggle,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const sidebarItems = getSidebarItems(t);

  // Get main navigation items (limit to 4 for bottom navbar)
  const mainItems = sidebarItems.slice(0, 4);

  const isActiveRoute = (href?: string) => !!href && pathname === href;
  const isActiveParent = (item: SidebarItem) => {
    return (
      isActiveRoute(item.href) ||
      item.children?.some((c) => isActiveRoute(c.href))
    );
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      // If has children, toggle the expanded state to show full menu
      onToggle(true);
      setTimeout(() => {
        setOpenMenus((prev) => ({
          ...Object.fromEntries(Object.keys(prev).map((k) => [k, false])),
          [item.id]: true,
        }));
      }, 150);
    } else if (item.href) {
      // Direct navigation
      router.push(item.href);
    }
  };

  const handleChildClick = (href: string) => {
    onToggle(false);
    router.push(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleMoreClick = () => {
    onToggle(!expanded);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div
        className={`
        fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg
        ${className}
      `}
        role="navigation"
        aria-label="Bottom navigation"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
        <div className="flex items-center justify-around h-14 sm:h-16 px-2">
          {/* Main navigation items */}
          {mainItems.map((item) => {
            const isActive = isActiveParent(item);
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`
                  flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg
                  transition-all duration-200 min-w-0
                  ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }
                `}
              >
                <div className="w-6 h-6 mb-1 flex items-center justify-center">
                  {React.isValidElement(item.icon)
                    ? React.cloneElement(
                        item.icon as React.ReactElement<
                          React.SVGProps<SVGElement>
                        >,
                        {
                          className: `w-5 h-5 ${
                            isActive ? "text-blue-600" : "text-gray-600"
                          }`,
                        }
                      )
                    : item.icon}
                </div>
                <span className="text-xs text-center leading-tight line-clamp-1 max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={handleMoreClick}
            className={`
              flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg
              transition-all duration-200
              ${
                expanded
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }
            `}
          >
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${
                  expanded ? "rotate-45" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <span className="text-xs">เมนู</span>
          </button>
        </div>
      </div>

      {/* Expanded Mobile Menu */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => onToggle(false)}
            />

            {/* Expanded Menu */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "tween", // Changed to tween for smoother performance
                ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smooth animation
                duration: 0.3,
              }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Image
                      src="https://ui-avatars.com/api/?name=EK&background=334293&color=fff&size=32"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t.englishKorat}
                  </h2>
                </div>
                <button
                  onClick={() => onToggle(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Menu Content */}
              <div className="overflow-y-auto flex-1 pb-24 sm:pb-20">
                <div className="p-4 space-y-2">
                  {sidebarItems.map((item) => {
                    const isActive = isActiveParent(item);
                    const isOpen = openMenus[item.id];

                    return (
                      <div key={item.id}>
                        {/* Main Item */}
                        {item.href && !item.children?.length ? (
                          <Link
                            href={item.href}
                            onClick={() => handleChildClick(item.href!)}
                            className={`
                              flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                              ${
                                isActive
                                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                                  : "text-gray-700 hover:bg-gray-50"
                              }
                            `}
                          >
                            <div className="w-6 h-6 flex items-center justify-center">
                              {item.icon}
                            </div>
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              if (item.children?.length) {
                                setOpenMenus((prev) => ({
                                  ...Object.fromEntries(
                                    Object.keys(prev).map((k) => [k, false])
                                  ),
                                  [item.id]: !prev[item.id],
                                }));
                              } else if (item.href) {
                                handleChildClick(item.href);
                              }
                            }}
                            className={`
                              w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                              ${
                                isActive
                                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                                  : "text-gray-700 hover:bg-gray-50"
                              }
                            `}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 flex items-center justify-center">
                                {item.icon}
                              </div>
                              <span className="font-medium">{item.label}</span>
                            </div>
                            {item.children?.length && (
                              <svg
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isOpen ? "rotate-90" : "rotate-0"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            )}
                          </button>
                        )}

                        {/* Submenu */}
                        <AnimatePresence initial={false}>
                          {item.children && isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="ml-6 mt-2 space-y-1 overflow-hidden"
                            >
                              {item.children.map((child) => {
                                const childActive = isActiveRoute(child.href);
                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => handleChildClick(child.href)}
                                    className={`
                                      w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-all duration-200
                                      ${
                                        childActive
                                          ? "bg-blue-100 text-blue-700 font-medium"
                                          : "text-gray-600 hover:bg-gray-50"
                                      }
                                    `}
                                  >
                                    {child.icon && (
                                      <div className="w-4 h-4 flex items-center justify-center">
                                        {child.icon}
                                      </div>
                                    )}
                                    <span>{child.label}</span>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {/* Logout Button */}
                  <div className="pt-4 mt-6 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200"
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">{t.logout}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(MobileBottomNavbar);
