"use client";

import Head from "next/head";
import React, { useEffect } from "react";
import { useSidebar } from "../../contexts/SidebarContext";
import Breadcrumb from "./Breadcrumb";
import Footer from "./Footer";
import Header from "./Header";
import MobileBottomNavbar from "./MobileBottomNavbar";
import Sidebar from "./Sidebar";

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
  title = "English Korat",
  description = "English Korat - Learn English Online",
  breadcrumbItems,
  showBreadcrumb = true,
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobile]);

  const handleSidebarToggle = (newExpanded: boolean) => {
    setExpanded(newExpanded);
  };

  // Calculate header and main margin/width based on sidebar state
  const getHeaderClasses = () => {
    if (isMobile) return "ml-0 w-full max-w-full";
    if (expanded)
      return "ml-[min(280px,20vw)] max-w-[calc(100vw-min(280px,20vw))] w-[calc(100%-min(280px,20vw))]";
    return "ml-[80px] max-w-[calc(100vw-80px)] w-[calc(100%-80px)]";
  };

  const getMainClasses = () => {
    if (isMobile) return "ml-0 pb-20";
    if (expanded) return "ml-[min(280px,20vw)]";
    return "ml-[80px]";
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar
            expanded={expanded}
            isMobile={false}
            onToggle={handleSidebarToggle}
          />
        )}

        {/* Mobile Bottom Navbar */}
        {isMobile && (
          <MobileBottomNavbar
            expanded={expanded}
            onToggle={handleSidebarToggle}
          />
        )}

        {/* Main content area */}
        <div
          className={`
            transition-all duration-300 ease-in-out min-h-screen flex flex-col
          `}
        >
          <Header
            className={`transition-all duration-300 ease-in-out fixed top-0 left-0 z-40 h-16 ${getHeaderClasses()}`}
          />
          <main
            className={`
              flex-1 p-4 sm:p-6 transition-all duration-300 ease-in-out pt-20 ${getMainClasses()}
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
