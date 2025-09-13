"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaUsers, FaUser, FaUserTag, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { notificationApi } from '@/services/api/notifications';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  first_name_th: string;
  last_name_th: string;
  role: string;
  branch_id?: number;
}

interface Branch {
  id: number;
  name_th: string;
  name_en: string;
}

export default function SendNotificationPage() {
  const { user, isAuthenticated } = useAuth();
  const [sendType, setSendType] = useState<'single' | 'multiple' | 'role'>('single');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin' | 'owner'>('student');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [titleTh, setTitleTh] = useState('');
  const [message, setMessage] = useState('');
  const [messageTh, setMessageTh] = useState('');
  const [notificationType, setNotificationType] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  // Check if user is admin or owner
  const isAuthorized = user?.role === 'admin' || user?.role === 'owner';

  useEffect(() => {
    if (!isAuthenticated || !isAuthorized) {
      return;
    }
    loadUsers();
    loadBranches();
  }, [isAuthenticated, isAuthorized]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // Mock users data - replace with actual API call
      const mockUsers: User[] = [
        { id: 1, username: 'john_doe', first_name_th: 'จอห์น', last_name_th: 'โด', role: 'student', branch_id: 1 },
        { id: 2, username: 'jane_smith', first_name_th: 'เจน', last_name_th: 'สมิธ', role: 'teacher', branch_id: 1 },
        { id: 3, username: 'alice_wilson', first_name_th: 'อลิซ', last_name_th: 'วิลสัน', role: 'student', branch_id: 1 },
        { id: 4, username: 'natthapol', first_name_th: 'ณัฐพล', last_name_th: 'สมประสงค์', role: 'student', branch_id: 1 },
        { id: 5, username: 'teacher1', first_name_th: 'อาจารย์', last_name_th: 'หนึ่ง', role: 'teacher', branch_id: 1 },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('ไม่สามารถโหลดรายชื่อผู้ใช้ได้');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadBranches = async () => {
    try {
      // Mock branches data - replace with actual API call
      const mockBranches: Branch[] = [
        { id: 1, name_th: 'สาขา 1 เดอะมอลล์โคราช', name_en: 'Branch 1 The Mall Branch' },
        { id: 2, name_th: 'สาขา 2 เซ็นทรัลโคราช', name_en: 'Branch 2 Central Branch' },
      ];
      setBranches(mockBranches);
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const handleUserSelection = (userId: number) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSendNotification = async () => {
    if (!title || !message) {
      toast.error('กรุณากรอกหัวข้อและข้อความ');
      return;
    }

    setIsLoading(true);
    try {
      let response;

      const notificationData = {
        title,
        title_th: titleTh || title,
        message,
        message_th: messageTh || message,
        type: notificationType,
      };

      switch (sendType) {
        case 'single':
          if (!selectedUserId) {
            toast.error('กรุณาเลือกผู้ใช้');
            return;
          }
          response = await notificationApi.sendToUser({
            ...notificationData,
            user_id: selectedUserId,
          });
          break;

        case 'multiple':
          if (selectedUserIds.length === 0) {
            toast.error('กรุณาเลือกผู้ใช้อย่างน้อย 1 คน');
            return;
          }
          response = await notificationApi.sendToUsers({
            ...notificationData,
            user_ids: selectedUserIds,
          });
          break;

        case 'role':
          if (!selectedRole) {
            toast.error('กรุณาเลือกบทบาท');
            return;
          }
          response = await notificationApi.sendToRole({
            ...notificationData,
            role: selectedRole,
            branch_id: selectedBranchId || undefined,
          });
          break;

        default:
          toast.error('ประเภทการส่งไม่ถูกต้อง');
          return;
      }

      if (response.success) {
        toast.success('ส่งการแจ้งเตือนสำเร็จ!', {
          icon: '🎉',
          duration: 3000,
        });
        
        // Reset form
        setTitle('');
        setTitleTh('');
        setMessage('');
        setMessageTh('');
        setSelectedUserId(null);
        setSelectedUserIds([]);
        setSelectedRole('student');
        setSelectedBranchId(null);
      } else {
        toast.error(response.message || 'เกิดข้อผิดพลาดในการส่งการแจ้งเตือน');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งการแจ้งเตือน');
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      info: <FaInfoCircle className="text-blue-500" />,
      warning: <FaExclamationTriangle className="text-yellow-500" />,
      error: <FaTimes className="text-red-500" />,
      success: <FaCheck className="text-green-500" />,
    };
    return icons[type] || icons.info;
  };

  const getSelectedUserNames = () => {
    return users
      .filter(user => selectedUserIds.includes(user.id))
      .map(user => `${user.first_name_th} ${user.last_name_th}`)
      .join(', ');
  };

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-600">คุณไม่มีสิทธิ์ในการส่งการแจ้งเตือน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <FaPaperPlane className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ส่งการแจ้งเตือน</h1>
              <p className="text-sm text-gray-600 mt-1">
                ส่งการแจ้งเตือนให้กับผู้ใช้ในระบบ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {/* Send Type Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">เลือกประเภทการส่ง</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSendType('single')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sendType === 'single'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaUser className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">ส่งคนเดียว</div>
                  <div className="text-xs text-gray-500 mt-1">เลือกผู้ใช้คนเดียว</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSendType('multiple')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sendType === 'multiple'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaUsers className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">ส่งหลายคน</div>
                  <div className="text-xs text-gray-500 mt-1">เลือกผู้ใช้หลายคน</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSendType('role')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sendType === 'role'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaUserTag className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">ส่งตามบทบาท</div>
                  <div className="text-xs text-gray-500 mt-1">เลือกตามตำแหน่งงาน</div>
                </motion.button>
              </div>
            </div>

            {/* Recipient Selection */}
            <AnimatePresence mode="wait">
              <motion.div
                key={sendType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">เลือกผู้รับ</h3>

                {sendType === 'single' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลือกผู้ใช้
                    </label>
                    <select
                      value={selectedUserId || ''}
                      onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loadingUsers}
                    >
                      <option value="">เลือกผู้ใช้...</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name_th} {user.last_name_th} ({user.username}) - {user.role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {sendType === 'multiple' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลือกผู้ใช้ (เลือกได้หลายคน)
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                      {loadingUsers ? (
                        <div className="text-center text-gray-500">กำลังโหลด...</div>
                      ) : (
                        <div className="space-y-2">
                          {users.map(user => (
                            <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                checked={selectedUserIds.includes(user.id)}
                                onChange={() => handleUserSelection(user.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {user.first_name_th} {user.last_name_th}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.username} - {user.role}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedUserIds.length > 0 && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-700">
                          ผู้ใช้ที่เลือก ({selectedUserIds.length} คน): {getSelectedUserNames()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {sendType === 'role' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        เลือกบทบาท
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as 'student' | 'teacher' | 'admin' | 'owner')}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="student">นักเรียน</option>
                        <option value="teacher">อาจารย์</option>
                        <option value="admin">ผู้ดูแลระบบ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        เลือกสาขา (ไม่บังคับ)
                      </label>
                      <select
                        value={selectedBranchId || ''}
                        onChange={(e) => setSelectedBranchId(Number(e.target.value) || null)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">ทุกสาขา</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name_th}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Message Content */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">เนื้อหาข้อความ</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หัวข้อ (ภาษาอังกฤษ) *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ข้อความ (ภาษาอังกฤษ) *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter message..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หัวข้อ (ภาษาไทย)
                    </label>
                    <input
                      type="text"
                      value={titleTh}
                      onChange={(e) => setTitleTh(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="กรอกหัวข้อ..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ข้อความ (ภาษาไทย)
                    </label>
                    <textarea
                      value={messageTh}
                      onChange={(e) => setMessageTh(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="กรอกข้อความ..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทการแจ้งเตือน
                </label>
                <div className="flex items-center space-x-4">
                  {[
                    { value: 'info', label: 'ข้อมูลทั่วไป', color: 'text-blue-600' },
                    { value: 'warning', label: 'คำเตือน', color: 'text-yellow-600' },
                    { value: 'error', label: 'ข้อผิดพลาด', color: 'text-red-600' },
                    { value: 'success', label: 'สำเร็จ', color: 'text-green-600' },
                  ].map(type => (
                    <label key={type.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="notificationType"
                        value={type.value}
                        checked={notificationType === type.value}
                        onChange={(e) => setNotificationType(e.target.value as 'error' | 'success' | 'warning' | 'info')}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${type.color}`}>
                        {getNotificationIcon(type.value)}
                      </span>
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            {(title || message) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ตัวอย่าง</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notificationType)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {titleTh || title || 'หัวข้อ'}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {messageTh || message || 'ข้อความ'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendNotification}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <FaPaperPlane className="w-4 h-4" />
                <span>{isLoading ? 'กำลังส่ง...' : 'ส่งการแจ้งเตือน'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
