"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';
import { useSidebar } from '../../contexts/SidebarContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SidebarLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
  showBreadcrumb?: boolean;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ 
  children, 
  title = 'English Korat', 
  description = 'English Korat - Learn English Online',
  breadcrumbItems,
  showBreadcrumb = true
}) => {
  const { expanded, setExpanded, isMobile, setIsMobile } = useSidebar();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      // Don't automatically change expanded state on resize
      // Let user's preference persist
    };

    handleResize(); // set initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  const handleSidebarToggle = (newExpanded: boolean) => {
    setExpanded(newExpanded);
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
          expanded={expanded} 
          isMobile={isMobile}
          onToggle={handleSidebarToggle} 
        />
        
        {/* Main content area */}
        <div 
          className={`
            transition-all duration-300 ease-in-out min-h-screen flex flex-col
          `}
        >
          <Header 
            className={`transition-all duration-300 ease-in-out fixed top-0 left-0 z-40 h-16 
              ${!isMobile ? (expanded ? 'ml-[280px] max-w-[calc(100vw-280px)] w-[calc(100%-280px)]' : 'ml-[80px] max-w-[calc(100vw-80px)] w-[calc(100%-80px)]') : 'ml-0 w-full max-w-full'}
            `}
          />
          <main 
            className={`
              flex-1 p-6 transition-all duration-300 ease-in-out
              ${!isMobile ? (expanded ? 'ml-[280px]' : 'ml-[80px]') : 'ml-0'}
            `}
          >
            <div className="max-w-7xl mx-auto">
              {showBreadcrumb && <Breadcrumb items={breadcrumbItems} />}
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
