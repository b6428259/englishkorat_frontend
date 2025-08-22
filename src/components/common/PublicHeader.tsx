"use client";

import React, { useState } from 'react';
import Button from "@/components/common/Button";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitch from "@/components/common/LanguageSwitch";
import { useLanguage } from "@/contexts/LanguageContext";

interface PublicHeaderProps {
  className?: string;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ className = "" }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`bg-[#334293] shadow-lg sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
          
              <div className="mr-3 hidden sm:block space-y-1">
              <h1 className="text-white font-bold text-lg lg:text-xl">English Korat</h1>
              <p className="text-blue-200 text-xs">{t.heroSubtitle}</p>
              </div>
                  <Image
              src="/icons/LogoCutted.jpg"
              alt="English Korat Logo"
              width={48}
              height={48}
              className="object-contain h-12 w-12 sm:h-14 sm:w-14 rounded-ms"
              priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
            <Link href="/" className="text-white hover:text-blue-200 transition-colors font-medium text-sm lg:text-base">
              {t.home}
            </Link>
            <Link href="/public/courses" className="text-white hover:text-blue-200 transition-colors font-medium text-sm lg:text-base">
              {t.courses}
            </Link>
            <Link href="/public/about" className="text-white hover:text-blue-200 transition-colors font-medium text-sm lg:text-base">
              {t.about}
            </Link>
            <Link href="/public/contact" className="text-white hover:text-blue-200 transition-colors font-medium text-sm lg:text-base">
              {t.contact}
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button href="/public/student/new" variant="secondary" className="text-sm px-4 py-2">
              {t.register}
            </Button>
            <Button href="/auth" variant="outline" className="text-sm px-4 py-2 border-white text-white hover:bg-white hover:text-[#334293]">
              {t.login}
            </Button>
            <Image
              src="/mascot.png"
              alt="Mascot"
              width={60}
              height={45}
              className="hidden lg:block"
            />
            <LanguageSwitch showLabels={false} />
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageSwitch showLabels={false} className="scale-75" />
            <Button href="/public/student/new" variant="secondary" className="text-xs px-3 py-1.5">
              {t.register}
            </Button>
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-blue-200 transition-colors p-2"
              aria-label="เปิดเมนู"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#2a3875] border-t border-blue-400">
            <div className="px-4 py-4 space-y-3">
              <Link 
                href="/" 
                className="block text-white hover:text-blue-200 transition-colors font-medium py-2 border-b border-blue-400 last:border-b-0"
                onClick={closeMobileMenu}
              >
                {t.home}
              </Link>
              <Link 
                href="/courses" 
                className="block text-white hover:text-blue-200 transition-colors font-medium py-2 border-b border-blue-400 last:border-b-0"
                onClick={closeMobileMenu}
              >
                {t.courses}
              </Link>
              <Link 
                href="/about" 
                className="block text-white hover:text-blue-200 transition-colors font-medium py-2 border-b border-blue-400 last:border-b-0"
                onClick={closeMobileMenu}
              >
                {t.about}
              </Link>
              <Link 
                href="/contact" 
                className="block text-white hover:text-blue-200 transition-colors font-medium py-2 border-b border-blue-400 last:border-b-0"
                onClick={closeMobileMenu}
              >
                {t.contact}
              </Link>
              <div className="pt-4 space-y-2">
                <Button 
                  href="/public/student/new" 
                  variant="secondary" 
                  className="w-full text-sm"
                  onClick={closeMobileMenu}
                >
                  {t.register}
                </Button>
                <Button 
                  href="/auth" 
                  variant="outline" 
                  className="w-full text-sm border-white text-white hover:bg-white hover:text-[#334293]"
                  onClick={closeMobileMenu}
                >
                  {t.login}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;
