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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      if (mobile) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        {/* Sidebar */}
        <Sidebar onToggle={handleSidebarToggle} />
        
        {/* Main content area */}
        <div 
          className={`
            transition-all duration-300 ease-in-out min-h-screen flex flex-col
            ${!isMobile ? (sidebarExpanded ? 'ml-[280px]' : 'ml-[80px]') : 'ml-0'}
          `}
        >
          {/* Header - adjusted for sidebar */}
          <Header />
          
          {/* Main content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default SidebarLayout;