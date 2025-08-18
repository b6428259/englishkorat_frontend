"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface SidebarLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ 
  children, 
  title = 'English Korat', 
  description = 'English Korat - Learn English Online' 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false); // Default to collapsed

  // Single source of truth: จัดการ responsive ที่นี่ที่เดียว
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // Keep sidebar collapsed by default on both mobile and desktop
      if (mobile && sidebarExpanded) {
        setSidebarExpanded(false); // Auto-close on mobile resize
      }
    };

    handleResize(); // set initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarExpanded]);

  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar (controlled) */}
        <Sidebar 
          expanded={sidebarExpanded} 
          isMobile={isMobile}
          onToggle={handleSidebarToggle} 
        />
        
        {/* Main content area */}
        <div 
          className={`
            transition-all duration-300 ease-in-out min-h-screen flex flex-col
            ${!isMobile ? (sidebarExpanded ? 'ml-[280px]' : 'ml-[80px]') : 'ml-0'}
          `}
          style={{ 
            marginLeft: isMobile ? '0px' : (sidebarExpanded ? '280px' : '80px'),
            width: isMobile ? '100%' : `calc(100% - ${sidebarExpanded ? '280px' : '80px'})`
          }}
        >
          <Header />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default SidebarLayout;