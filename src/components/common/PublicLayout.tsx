"use client";

import React from 'react';
import PublicHeader from '@/components/common/PublicHeader';

interface PublicLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 ${className}`}>
      <PublicHeader />
      <main className="pt-0">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
