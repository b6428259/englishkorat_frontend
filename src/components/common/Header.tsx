"use client";

import React, { useState, useRef, useEffect } from 'react';
import LanguageSwitch from './LanguageSwitch';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { HiOutlineBell, HiXMark } from 'react-icons/hi2';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
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
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
};

export default Header; 
