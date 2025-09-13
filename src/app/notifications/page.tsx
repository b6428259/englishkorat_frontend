"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaFilter, FaCheck, FaEye, FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification } from '@/types/notification';

// Notification type to route mapping
const getNotificationRoute = (notification: Notification): string => {
  const routes: Record<string, string> = {
    'student_registration': '/students/new',
    'class_confirmation': '/schedule',
    'class_cancellation': '/schedule',
    'schedule_change': '/schedule', 
    'payment_reminder': '/students/list',
    'appointment_reminder': '/schedule',
    'class_reminder': '/schedule',
    'leave_approval': '/teachers/list',
    'report_deadline': '/dashboard',
    'room_conflict': '/schedule',
    'system_maintenance': '/dashboard'
  };
  
  return routes[notification.type] || '/notifications';
};

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      info: '📢',
      warning: '⚠️',
      error: '❌',
      success: '✅',
      class_confirmation: '✅',
      class_cancellation: '❌',
      schedule_change: '📅',
      payment_reminder: '💰',
      student_registration: '👨‍🎓',
      appointment_reminder: '🕐',
      class_reminder: '🎓',
      system_maintenance: '🔧',
      leave_approval: '📋',
      report_deadline: '📊',
      room_conflict: '⚠️',
      general: '📢',
    };
    return icons[type] || '📢';
  };

  const getNotificationColors = (type: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
      warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
      error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
      success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
      class_confirmation: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
      class_cancellation: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
      schedule_change: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
      payment_reminder: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
      student_registration: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    };
    return colors[type] || colors.info;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    
    return date.toLocaleDateString('th-TH');
  };

  const getTypeDisplayName = (type: string) => {
    const names: Record<string, string> = {
      info: 'ข้อมูลทั่วไป',
      warning: 'คำเตือน',
      error: 'ข้อผิดพลาด',
      success: 'สำเร็จ',
      class_confirmation: 'ยืนยันการเรียน',
      class_cancellation: 'ยกเลิกการเรียน',
      schedule_change: 'เปลี่ยนแปลงตารางเรียน',
      payment_reminder: 'แจ้งเตือนการชำระเงิน',
      student_registration: 'การสมัครนักเรียน',
      appointment_reminder: 'แจ้งเตือนนัดหมาย',
      class_reminder: 'แจ้งเตือนการเรียน',
      system_maintenance: 'บำรุงรักษาระบบ',
      leave_approval: 'อนุมัติการลา',
      report_deadline: 'กำหนดส่งรายงาน',
      room_conflict: 'ขัดแย้งห้องเรียน',
      general: 'ทั่วไป',
    };
    return names[type] || 'อื่นๆ';
  };

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    
    // Filter by type
    if (selectedType !== 'all' && notification.type !== selectedType) return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = (notification.title_th || notification.title).toLowerCase().includes(searchLower);
      const messageMatch = (notification.message_th || notification.message).toLowerCase().includes(searchLower);
      if (!titleMatch && !messageMatch) return false;
    }
    
    return true;
  });

  // Get unique notification types for filter dropdown
  const notificationTypes = Array.from(new Set(notifications.map(n => n.type)));

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to relevant page
    const route = getNotificationRoute(notification);
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaBell className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">การแจ้งเตือน</h1>
                <p className="text-sm text-gray-600 mt-1">
                  จัดการและดูการแจ้งเตือนทั้งหมด
                  {unreadCount > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">
                      ({unreadCount} ข้อความใหม่)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mt-6">
            <button
              onClick={refreshNotifications}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 cursor-pointer transition-colors"
            >
              <span>{isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <FaCheck className="w-4 h-4" />
                <span>ทำเครื่องหมายว่าอ่านทั้งหมด</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="ค้นหาการแจ้งเตือน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-text"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400 w-4 h-4" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="all">ทั้งหมด</option>
                <option value="unread">ยังไม่อ่าน</option>
                <option value="read">อ่านแล้ว</option>
              </select>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">ทุกประเภท</option>
              {notificationTypes.map(type => (
                <option key={type} value={type}>
                  {getTypeDisplayName(type)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border p-12 text-center"
              >
                <FaBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีการแจ้งเตือน</h3>
                <p className="text-gray-500">
                  {searchTerm || filter !== 'all' || selectedType !== 'all'
                    ? 'ไม่พบการแจ้งเตือนที่ตรงกับเงื่อนไขที่เลือก'
                    : 'คุณไม่มีการแจ้งเตือนในขณะนี้'
                  }
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const colors = getNotificationColors(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.01] ${
                      !notification.read ? 'ring-2 ring-blue-100 border-blue-200' : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center`}>
                          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className={`text-lg font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title_th || notification.title}
                                </h3>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              
                              <p className={`text-sm ${!notification.read ? 'text-gray-600' : 'text-gray-500'} mb-3 leading-relaxed`}>
                                {notification.message_th || notification.message}
                              </p>

                              <div className="flex items-center space-x-4 text-xs text-gray-400">
                                <span>{formatTimeAgo(notification.created_at)}</span>
                                <span className={`px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                                  {getTypeDisplayName(notification.type)}
                                </span>
                                {notification.user && (
                                  <span>
                                    จาก: {notification.user.first_name_th} {notification.user.last_name_th}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 ml-4">
                              {!notification.read ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-2 cursor-pointer transition-colors rounded-lg hover:bg-blue-50"
                                  title="ทำเครื่องหมายว่าอ่านแล้ว"
                                >
                                  <FaEye className="w-4 h-4" />
                                </button>
                              ) : (
                                <div className="text-green-600 p-2" title="อ่านแล้ว">
                                  <FaCheck className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>

          {/* Load More */}
          {hasMore && filteredNotifications.length > 0 && (
            <div className="text-center pt-6">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isLoading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
