"use client";

import React from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useLanguage } from '../../contexts/LanguageContext';

export default function DemoPage() {
  const { language } = useLanguage();

  return (
    <SidebarLayout
      title="Demo Page - English Korat"
      breadcrumbItems={[
        { label: 'Demo', href: '/demo' }
      ]}
    >
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'th' ? 'หน้าตัวอย่าง' : 'Demo Page'}
          </h1>
          <p className="text-gray-600">
            {language === 'th' 
              ? 'นี่คือหน้าตัวอย่างสำหรับทดสอบ Mobile-Responsive Sidebar และ Bottom Navigation' 
              : 'This is a demo page for testing Mobile-Responsive Sidebar and Bottom Navigation'
            }
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              {language === 'th' ? '🖥️ บนเดสก์ท็อป:' : '🖥️ On Desktop:'}
            </h3>
            <p className="text-blue-700">
              {language === 'th' 
                ? 'คุณจะเห็น Sidebar ทางซ้ายที่สามารถขยายและย่อได้' 
                : 'You will see an expandable/collapsible sidebar on the left'
              }
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">
              {language === 'th' ? '📱 บนมือถือ:' : '📱 On Mobile:'}
            </h3>
            <ul className="text-green-700 space-y-1">
              <li>
                {language === 'th' 
                  ? '• Sidebar ทางซ้ายจะถูกซ่อน' 
                  : '• Left sidebar is hidden'
                }
              </li>
              <li>
                {language === 'th' 
                  ? '• Bottom Navigation จะปรากฏที่ด้านล่างหน้าจอ' 
                  : '• Bottom Navigation appears at the bottom of the screen'
                }
              </li>
              <li>
                {language === 'th' 
                  ? '• กดปุ่ม "เพิ่มเติม" เพื่อเปิด Slide-up Menu' 
                  : '• Tap "More" button to open Slide-up Menu'
                }
              </li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">
              {language === 'th' ? '✨ คุณสมบัติพิเศษ:' : '✨ Special Features:'}
            </h3>
            <ul className="text-yellow-700 space-y-1">
              <li>
                {language === 'th' 
                  ? '• Smooth animations ด้วย Framer Motion' 
                  : '• Smooth animations with Framer Motion'
                }
              </li>
              <li>
                {language === 'th' 
                  ? '• Touch-friendly interface สำหรับมือถือ' 
                  : '• Touch-friendly interface for mobile devices'
                }
              </li>
              <li>
                {language === 'th' 
                  ? '• Safe area padding สำหรับ iPhone' 
                  : '• Safe area padding for iPhone'
                }
              </li>
              <li>
                {language === 'th' 
                  ? '• Responsive breakpoint ที่ 1024px (lg)' 
                  : '• Responsive breakpoint at 1024px (lg)'
                }
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {language === 'th' ? `ตัวอย่างเนื้อหา ${i}` : `Sample Content ${i}`}
                </h4>
                <p className="text-gray-600 text-sm">
                  {language === 'th' 
                    ? 'นี่คือเนื้อหาตัวอย่างเพื่อแสดงการทำงานของ layout ที่ responsive' 
                    : 'This is sample content to demonstrate the responsive layout functionality'
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}