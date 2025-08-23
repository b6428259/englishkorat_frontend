"use client";

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const PublicFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/icons/LogoCutted.jpg"
                alt="English Korat Logo"
                width={48}
                height={48}
                className="w-12 h-12 mr-3"
              />
              <h3 className="text-2xl font-bold">English Korat</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              {t.footerDescription}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/learningenglishkorat" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://www.tiktok.com/@englishkorat" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center hover:bg-black transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="TikTok"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/englishkorat" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.875 2.026-1.365 3.323-1.365s2.448.49 3.323 1.365c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323c-.875.805-2.026 1.295-3.323 1.295zm7.83-1.418a4.52 4.52 0 01-3.194 1.322 4.52 4.52 0 01-3.194-1.322 4.52 4.52 0 01-1.322-3.194c0-1.249.49-2.377 1.322-3.194a4.52 4.52 0 013.194-1.322c1.249 0 2.377.49 3.194 1.322a4.52 4.52 0 011.322 3.194c0 1.249-.49 2.377-1.322 3.194z"/>
                </svg>
              </a>
              <a 
                href="https://line.me/ti/p/~englishkorat" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Line"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.629 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-yellow-300">{t.mainMenu}</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors flex items-center"><span className="mr-2">🏠</span>{t.home}</Link></li>
              <li><Link href="/public/courses" className="text-gray-300 hover:text-white transition-colors flex items-center"><span className="mr-2">📚</span>{t.courses}</Link></li>
              <li><Link href="/public/about" className="text-gray-300 hover:text-white transition-colors flex items-center"><span className="mr-2">👥</span>{t.about}</Link></li>
              <li><Link href="/public/contact" className="text-gray-300 hover:text-white transition-colors flex items-center"><span className="mr-2">📞</span>{t.contact}</Link></li>
              <li><Link href="/public/student/new" className="text-yellow-300 hover:text-yellow-200 transition-colors font-semibold flex items-center"><span className="mr-2">✨</span>{t.register}</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-yellow-300">{t.contactUs}</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="mr-3 mt-0.5">📍</span>
                <div>
                  <div className="font-medium text-white">{t.koratBranch}</div>
                  <div className="text-sm">{t.koratLocation}</div>
                </div>
              </li>
              <li className="flex items-center">
                <span className="mr-3">📞</span>
                <a href="tel:0637623059" className="hover:text-white transition-colors">
                  063-762-3059
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-3">✉️</span>
                <a href="mailto:thanida09@gmail.com" className="hover:text-white transition-colors break-all">
                  thanida09@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-3">⏰</span>
                <div>
                  <div className="text-sm">{t.weekdayHours}</div>
                  <div className="text-sm">{t.weekendHours}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; 2024 English Korat. {t.allRightsReserved} | {t.developedBy}
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/public/privacy" className="text-gray-400 hover:text-white transition-colors">{t.privacyPolicy}</Link>
              <Link href="/public/terms" className="text-gray-400 hover:text-white transition-colors">{t.termsOfService}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;