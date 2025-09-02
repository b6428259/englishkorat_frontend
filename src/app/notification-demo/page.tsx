"use client";

import React from 'react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { AuthProvider } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';

export default function NotificationTestPage() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header className="" />
          
          <main className="pt-20 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  🔔 Enhanced Notification System Demo
                </h1>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h2 className="text-lg font-semibold text-blue-800 mb-2">
                      ✅ Features Implemented
                    </h2>
                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                      <li>Role-based notification types (Teachers, Students, Admin, Owner)</li>
                      <li>Real API integration with fallback to mock data</li>
                      <li>Mark as read functionality (individual and bulk)</li>
                      <li>Loading and error states</li>
                      <li>Enhanced notification types from documentation</li>
                      <li>Icon and color coding by notification type</li>
                      <li>Time formatting and routing based on notification content</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <h2 className="text-lg font-semibold text-green-800 mb-2">
                      🚀 Notification Types Supported
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-green-700">
                      <div>
                        <strong>Core Types:</strong>
                        <ul className="list-disc list-inside ml-4 text-sm">
                          <li>class_confirmation</li>
                          <li>leave_approval</li>
                          <li>class_cancellation</li>
                          <li>schedule_change</li>
                          <li>payment_reminder</li>
                          <li>report_deadline</li>
                          <li>room_conflict</li>
                          <li>general</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Enhanced Types:</strong>
                        <ul className="list-disc list-inside ml-4 text-sm">
                          <li>student_registration</li>
                          <li>appointment_reminder</li>
                          <li>class_reminder</li>
                          <li>system_maintenance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                      🎯 How to Test
                    </h2>
                    <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                      <li>Click the notification bell icon (🔔) in the header above</li>
                      <li>See mock notifications with different types and states</li>
                      <li>Click on any notification to navigate to its relevant page</li>
                      <li>Click &quot;อ่านทั้งหมด&quot; to mark all notifications as read</li>
                      <li>The system gracefully falls back to mock data when API is not available</li>
                    </ol>
                  </div>
                  
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                    <h2 className="text-lg font-semibold text-purple-800 mb-2">
                      ⚡ API Integration
                    </h2>
                    <p className="text-purple-700">
                      The notification system is fully integrated with the Enhanced Notification System API endpoints:
                    </p>
                    <ul className="list-disc list-inside text-purple-700 space-y-1 mt-2 text-sm">
                      <li><code>/notifications</code> - Get notifications with filtering</li>
                      <li><code>/notifications/:id/read</code> - Mark single notification as read</li>
                      <li><code>/notifications/mark-all-read</code> - Mark all as read</li>
                      <li><code>/notifications/send</code> - Send notifications (admin/owner)</li>
                      <li>Plus all admin/owner endpoints for logs, cleanup, and archival</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}