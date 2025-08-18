"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expanded, setExpandedState] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure this only runs on client side
  useEffect(() => {
    setIsClient(true);
    
    // Load sidebar state from localStorage on mount
    const savedState = localStorage.getItem('sidebar-expanded');
    if (savedState !== null) {
      setExpandedState(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage when changed
  const setExpanded = (newExpanded: boolean) => {
    setExpandedState(newExpanded);
    if (isClient) {
      localStorage.setItem('sidebar-expanded', JSON.stringify(newExpanded));
    }
  };

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, isMobile, setIsMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
