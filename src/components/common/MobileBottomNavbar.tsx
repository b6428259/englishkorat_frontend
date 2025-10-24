"use client";

import { useAuth } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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
  const { logout, user } = useAuth();
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

  useEffect(() => {
    if (!expanded) {
      setOpenMenus({});
    }
  }, [expanded]);

  const openMenu = (id: string) => {
    setOpenMenus((prev) => {
      if (prev[id]) {
        return {};
      }
      return { [id]: true };
    });
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      onToggle(true);
      openMenu(item.id);
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleChildClick = (href: string) => {
    router.push(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleMoreClick = () => {
    onToggle(!expanded);
  };

  // Handle drag to dismiss
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { y: number }; velocity: { y: number } }
  ) => {
    const shouldClose = info.offset.y > 100 || info.velocity.y > 500;

    if (shouldClose) {
      onToggle(false);
    }
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
            {/* Expanded Menu - ทั้ง modal drag ได้ */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={handleDragEnd}
              dragMomentum={false}
              transition={{
                type: "tween",
                ease: [0.4, 0, 0.2, 1],
                duration: 0.3,
              }}
              className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl border-t-2 border-gray-200"
              style={{
                paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
              }}
            >
              {/* Handle */}
              <div className="flex justify-center py-3 border-b border-gray-200 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-gray-400 rounded-full hover:bg-gray-500 transition-colors"></div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <Image
                      src="https://ui-avatars.com/api/?name=EK&background=334293&color=fff&size=64"
                      alt="Logo"
                      width={40}
                      height={40}
                      quality={95}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {t.englishKorat}
                  </h2>
                </div>
                <button
                  onClick={() => onToggle(false)}
                  className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
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

              {/* Menu Content - ปิด drag listener เพื่อให้ scroll ได้ */}
              <div
                className="flex-1 overflow-y-auto pb-24 sm:pb-20 bg-gradient-to-b from-white to-gray-50"
                onPointerDownCapture={(e) => {
                  // ป้องกันไม่ให้ drag event ส่งไปยัง parent
                  e.stopPropagation();
                }}
              >
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
                              flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 shadow-sm
                              ${
                                isActive
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                                  : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                              }
                            `}
                          >
                            <div className="w-6 h-6 flex items-center justify-center">
                              {item.icon}
                            </div>
                            <span className="font-medium text-base">
                              {item.label}
                            </span>
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
                              w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 shadow-sm
                              ${
                                isActive
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                                  : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                              }
                            `}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 flex items-center justify-center">
                                {item.icon}
                              </div>
                              <span className="font-medium text-base">
                                {item.label}
                              </span>
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
                              className="ml-6 mt-2 space-y-1 overflow-hidden bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-gray-100"
                            >
                              {item.children
                                .filter((child) => {
                                  // Filter by roles if specified
                                  if (child.roles && child.roles.length > 0) {
                                    return (
                                      user && child.roles.includes(user.role)
                                    );
                                  }
                                  return true;
                                })
                                .map((child) => {
                                  const childActive = isActiveRoute(child.href);
                                  return (
                                    <button
                                      key={child.id}
                                      onClick={() =>
                                        handleChildClick(child.href)
                                      }
                                      className={`
                                      w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200
                                      ${
                                        childActive
                                          ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-medium shadow"
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
                  <div className="pt-4 mt-6 border-t-2 border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
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
                      <span className="font-semibold">{t.logout}</span>
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
