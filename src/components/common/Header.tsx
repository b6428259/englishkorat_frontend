"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { CiLogout } from "react-icons/ci";
import { HiOutlineCog, HiOutlineUser } from "react-icons/hi2";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { getAvatarUrl } from "../../utils/config";
import { NotificationBell } from "../notifications";
import Avatar from "./Avatar";
import LanguageSwitch from "./LanguageSwitch";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const { t } = useLanguage();
  const router = useRouter();

  // Always call useAuth hook unconditionally
  const authContext = useAuth();
  // Use authContext if available, otherwise use mock data for demo
  const { user, logout, isAuthenticated } = authContext ?? {
    user: {
      id: 1,
      username: "Demo User",
      email: "demo@example.com",
      role: "admin" as const,
      avatar: null,
      branch_name: "โคราช",
      branch_code: "KRT001",
    },
    logout: async () => console.log("Mock logout"),
    isAuthenticated: true,
  };

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement | null>(null);
  const isMobile = useIsMobile();
  const profileMenuClasses = isMobile
    ? "fixed inset-x-0 bottom-0 top-auto z-50 w-full max-h-[85vh] overflow-hidden rounded-t-3xl border border-transparent bg-white shadow-2xl flex flex-col"
    : "absolute top-full mt-3 right-2 sm:right-0 z-50 w-[92vw] sm:w-72 max-h-[70vh] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl flex flex-col";
  const profileMenuStyle = isMobile
    ? { paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }
    : undefined;

  // Load notifications when component mounts or when user changes
  useEffect(() => {
    // NotificationBell will handle loading notifications
  }, [isAuthenticated, user]);

  const handleProfileClick = (route?: string) => {
    setProfileOpen(false);
    if (route) {
      router.push(route);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getUserInitials = (username: string) => {
    return username
      .split(" ")
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "owner":
        return "เจ้าของ";
      case "admin":
        return "ผู้ดูแลระบบ";
      case "teacher":
        return "อาจารย์";
      case "student":
        return "นักเรียน";
      default:
        return role;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When opening the menu, autofocus the first actionable item. When closing, restore focus to the button.
  useEffect(() => {
    if (profileOpen) {
      // small timeout to ensure menu is rendered
      const id = setTimeout(() => firstMenuItemRef.current?.focus(), 0);
      return () => clearTimeout(id);
    } else {
      profileButtonRef.current?.focus();
    }
  }, [profileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-white shadow-sm border-b ${className}`}
    >
      <div
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 md:px-6 md:py-3"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.6rem)" }}
      >
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-gray-900 tracking-tight sm:text-xl md:text-2xl">
            {t.englishKorat}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
          {isMobile && (
            <LanguageSwitch className="sm:hidden" compact showLabels={false} />
          )}
          {/* Show user info only if authenticated */}
          {isAuthenticated && user && (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  id="header-profile-button"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-controls="header-profile-menu"
                  ref={profileButtonRef}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#334293] focus:ring-offset-2 transition-colors"
                  onClick={() => setProfileOpen(!profileOpen)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setProfileOpen((v) => !v);
                    } else if (e.key === "Escape") {
                      setProfileOpen(false);
                    }
                  }}
                >
                  <Avatar
                    src={getAvatarUrl(user.avatar || undefined)}
                    alt={user.username}
                    size="sm"
                    fallbackInitials={getUserInitials(user.username)}
                  />
                  <div className="hidden min-w-0 md:block text-left">
                    <p className="truncate text-sm font-medium text-gray-900 leading-tight">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight">
                      {getRoleDisplayName(user.role)}
                    </p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <>
                    {isMobile && (
                      <div
                        className="fixed inset-0 z-40 bg-black/40 sm:hidden"
                        aria-hidden="true"
                        onClick={() => setProfileOpen(false)}
                      />
                    )}
                    <div
                      id="header-profile-menu"
                      role="menu"
                      aria-labelledby="header-profile-button"
                      className={profileMenuClasses}
                      style={profileMenuStyle}
                      tabIndex={-1}
                      onKeyDown={(e) => {
                        // Close on Escape
                        if (e.key === "Escape") {
                          setProfileOpen(false);
                        }
                        // Simple Tab cycling: keep focus inside menu
                        if (e.key === "Tab") {
                          const focusable = Array.from(
                            profileRef.current?.querySelectorAll<HTMLButtonElement>(
                              "[role=menuitem]"
                            ) || []
                          );
                          if (focusable.length === 0) return;
                          const currentIndex = focusable.indexOf(
                            document.activeElement as HTMLButtonElement
                          );
                          if (e.shiftKey) {
                            // Shift + Tab -> previous
                            const prev =
                              (currentIndex - 1 + focusable.length) %
                              focusable.length;
                            focusable[prev].focus();
                            e.preventDefault();
                          } else {
                            // Tab -> next
                            const next = (currentIndex + 1) % focusable.length;
                            focusable[next].focus();
                            e.preventDefault();
                          }
                        }
                      }}
                    >
                      {isMobile && (
                        <div className="flex justify-center py-3">
                          <span
                            className="h-1.5 w-12 rounded-full bg-gray-300"
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      {/* User Info */}
                      <div className="p-5 bg-gradient-to-r from-[#334293] to-[#2a3875] text-white">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={getAvatarUrl(user.avatar || undefined)}
                            alt={user.username}
                            size="lg"
                            fallbackInitials={getUserInitials(user.username)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate text-lg leading-tight">
                              {user.username}
                            </p>
                            <p className="text-blue-100 text-sm leading-tight">
                              {user.email || "ไม่ระบุอีเมล"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                                {getRoleDisplayName(user.role)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {user.branch_name && (
                          <div className="mt-3 flex items-center gap-2 text-blue-100 text-sm">
                            <span>📍</span>
                            <span>{user.branch_name}</span>
                            {user.branch_code && (
                              <span className="text-blue-200/80">
                                ({user.branch_code})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="flex-1 overflow-y-auto">
                        <div className="py-2">
                          <button
                            role="menuitem"
                            ref={firstMenuItemRef}
                            tabIndex={0}
                            className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-[#334293] cursor-pointer"
                            onClick={() =>
                              handleProfileClick("/settings/profile")
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleProfileClick("/settings/profile");
                              }
                            }}
                          >
                            <HiOutlineUser className="h-5 w-5" />
                            <span className="font-medium">แก้ไขโปรไฟล์</span>
                          </button>
                          <button
                            role="menuitem"
                            tabIndex={0}
                            className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-[#334293] cursor-pointer"
                            onClick={() => handleProfileClick("/settings")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleProfileClick("/settings");
                              }
                            }}
                          >
                            <HiOutlineCog className="h-5 w-5" />
                            <span className="font-medium">การตั้งค่า</span>
                          </button>
                          <div className="my-2 mx-3 border-t border-gray-100" />
                          <button
                            role="menuitem"
                            tabIndex={0}
                            className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                            onClick={handleLogout}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleLogout();
                              }
                            }}
                          >
                            <CiLogout className="h-5 w-5" />
                            <span className="font-medium">ออกจากระบบ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {!isMobile && <LanguageSwitch className="hidden sm:flex" />}
        </div>
      </div>
    </header>
  );
};

export default Header;
