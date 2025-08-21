"use client";

import React from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';

export default function DemoPage() {
  return (
    <SidebarLayout 
      title="Demo - Mobile Responsive Sidebar" 
      description="Demonstration of mobile responsive sidebar"
    >
      <div className="min-h-screen">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Mobile Responsive Sidebar Demo
          </h1>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                📱 Mobile View (&lt; 1024px)
              </h2>
              <p className="text-blue-800">
                On mobile devices, you&apos;ll see a bottom navigation bar with main menu items. 
                Click the &quot;เมนู&quot; (More) button to see the full expandable menu that slides up from the bottom with smooth animations.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                🖥️ Desktop View (≥ 1024px)
              </h2>
              <p className="text-green-800">
                On desktop, you&apos;ll see the traditional sidebar on the left with expand/collapse functionality.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                ✨ Features
              </h2>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                <li>Responsive design that adapts to screen size</li>
                <li>Smooth animations using Framer Motion</li>
                <li>Bottom navbar for mobile with expandable full menu</li>
                <li>Nested menu support with animations</li>
                <li>Active route highlighting</li>
                <li>Clean and modern UI design</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-900 mb-2">
                📏 How to Test
              </h2>
              <ol className="list-decimal list-inside text-purple-800 space-y-1">
                <li>Resize your browser window to mobile size (&lt; 1024px width)</li>
                <li>Look at the bottom of the screen for the mobile navbar</li>
                <li>Click the &quot;เมนู&quot; button to see the full expandable menu</li>
                <li>Try clicking on menu items with sub-menus</li>
                <li>Resize back to desktop to see the traditional sidebar</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}