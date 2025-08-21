"use client";

import React, { useState, useRef, useEffect } from 'react';
import LanguageSwitch from './LanguageSwitch';
import Avatar from './Avatar';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { HiOutlineBell, HiXMark, HiOutlineUser, HiOutlineCog } from 'react-icons/hi2';
import { CiLogout } from "react-icons/ci";
import { getAvatarUrl } from '../../utils/config';


interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: t.newStudent || 'มีนักเรียนใหม่',
      description: t.newStudentDesc || 'จอห์น สมิธ สมัครเรียนคอร์สใหม่',
      route: '/students/list',
      time: '5 นาทีที่แล้ว',
      unread: true,
      icon: <span className="inline-block w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">👨‍🎓</span>
    },
    {
      id: 2,
      title: t.systemUpdate || 'อัปเดตระบบ',
      description: t.systemUpdateDesc || 'ระบบได้รับการอัปเดตเวอร์ชัน 2.1.0',
      route: '/settings/system',
      time: '1 ชั่วโมงที่แล้ว',
      unread: true,
      icon: <span className="inline-block w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">🔧</span>
    },
    {
      id: 3,
      title: 'การชำระเงิน',
      description: 'นักเรียน 3 คนชำระค่าเรียนแล้ว',
      route: '/dashboard',
      time: '3 ชั่วโมงที่แล้ว',
      unread: false,
      icon: <span className="inline-block w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm">💰</span>
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotiClick = (route: string) => {
    setNotificationOpen(false);
    router.push(route);
  };

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
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'owner': return 'เจ้าของ';
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'teacher': return 'อาจารย์';
      case 'student': return 'นักเรียน';
      default: return role;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full bg-white shadow-sm border-b z-40 ${className}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t.englishKorat}</h1>
        <div className="flex items-center gap-4">
          {/* Show user info only if authenticated */}
          {isAuthenticated && user && (
            <>
              {/* Notification Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#334293] transition-colors"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                >
                  <HiOutlineBell size={24} className="text-gray-700" />
                  {/* Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t.notifications || 'การแจ้งเตือน'}
                      </h3>
                      <button
                        onClick={() => setNotificationOpen(false)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <HiXMark className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <HiOutlineBell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>ไม่มีการแจ้งเตือน</p>
                        </div>
                      ) : (
                        notifications.map((noti) => (
                          <div
                            key={noti.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                              noti.unread ? 'border-l-[#334293] bg-blue-50/30' : 'border-l-transparent'
                            }`}
                            onClick={() => handleNotiClick(noti.route)}
                          >
                            <div className="flex items-start gap-3">
                              {noti.icon}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm ${noti.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                    {noti.title}
                                  </p>
                                  {noti.unread && (
                                    <span className="w-2 h-2 bg-[#334293] rounded-full flex-shrink-0 mt-1.5"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {noti.description}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {noti.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-100">
                        <button 
                          className="w-full text-center text-sm text-[#334293] hover:text-[#2a3875] font-medium transition-colors"
                          onClick={() => {
                            setNotificationOpen(false);
                            router.push('/notifications');
                          }}
                        >
                          ดูการแจ้งเตือนทั้งหมด
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#334293] transition-colors"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <Avatar
                    src={getAvatarUrl(user.avatar)}
                    alt={user.username}
                    size="sm"
                    fallbackInitials={getUserInitials(user.username)}
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    {/* User Info */}
                    <div className="p-5 bg-gradient-to-r from-[#334293] to-[#2a3875] text-white">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={getAvatarUrl(user.avatar)}
                          alt={user.username}
                          size="lg"
                          fallbackInitials={getUserInitials(user.username)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate text-lg">{user.username}</p>
                          <p className="text-blue-100 text-sm">{user.email || 'ไม่ระบุอีเมล'}</p>
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
                            <span className="text-blue-200/80">({user.branch_code})</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        className="w-full px-5 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-[#334293] flex items-center gap-3 transition-all duration-200"
                        onClick={() => handleProfileClick('/settings/profile')}
                      >
                        <HiOutlineUser className="w-5 h-5" />
                        <span className="font-medium">แก้ไขโปรไฟล์</span>
                      </button>
                      <button
                        className="w-full px-5 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-[#334293] flex items-center gap-3 transition-all duration-200"
                        onClick={() => handleProfileClick('/settings')}
                      >
                        <HiOutlineCog className="w-5 h-5" />
                        <span className="font-medium">การตั้งค่า</span>
                      </button>
                      <div className="border-t border-gray-100 my-2 mx-3"></div>
                      <button
                        className="w-full px-5 py-3 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-all duration-200"
                        onClick={handleLogout}
                      >
                        <CiLogout className="w-5 h-5" />
                        <span className="font-medium">ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
};

export default Header; 
