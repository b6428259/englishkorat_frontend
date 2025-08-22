

"use client";

import Button from "@/components/common/Button";
import Image from "next/image";
import Link from "next/link";
import PublicLayout from "@/components/common/PublicLayout";
import StructuredData, { 
  organizationData, 
  websiteData, 
  serviceData, 
  faqData 
} from "@/components/common/StructuredData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Metadata } from "next";

// SEO Metadata will be handled by layout or moved to separate component
// since this is now a client component due to useLanguage hook

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredData data={organizationData} />
      <StructuredData data={websiteData} />
      <StructuredData data={serviceData} />
      <StructuredData data={faqData} />
      
      <PublicLayout>


      {/* Hero Section */}
      <section className="relative py-8 md:py-16 lg:py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
            <div className="space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="block text-[#334293] mb-2">{t.heroTitle}</span>
                  <span className="block text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-gray-800">{t.heroSubtitle}</span>
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-gray-600 mt-4 md:mt-6 leading-relaxed">
                  {t.heroDescription}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Button 
                  variant="primary" 
                  href="/public/student/new"
                  className="text-sm md:text-base px-6 md:px-8 py-3 md:py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {t.startLearning}
                </Button>
                <Button 
                  variant="outline" 
                  href="/public/courses"
                  className="text-sm md:text-base px-6 md:px-8 py-3 md:py-4 border-2 border-[#334293] text-[#334293] hover:bg-[#334293] hover:text-white transition-all duration-300"
                >
                  {t.viewCourses}
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-8 lg:space-x-12 pt-4 md:pt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Image
                      src="/icons/follower.png"
                      alt={t.followers}
                      width={24}
                      height={24}
                      className="w-5 h-5 md:w-6 md:h-6"
                    />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">24,705+</p>
                    <p className="text-xs md:text-sm text-gray-600">{t.followers}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Image
                      src="/icons/graduate.png"
                      alt={t.successfulStudents}
                      width={28}
                      height={28}
                      className="w-6 h-6 md:w-7 md:h-7"
                    />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">1,000+</p>
                    <p className="text-xs md:text-sm text-gray-600">{t.successfulStudents}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
                <Image
                  src="/promotion-banner.jpg"
                  alt="English Korat - สถาบันสอนภาษาอังกฤษโคราช"
                  width={600}
                  height={450}
                  className="relative rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 bg-purple-100 rounded-full opacity-30 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              {t.whyChooseUs}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t.whyChooseDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="group text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.changeLifeIn3Months}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t.changeLifeDesc}
              </p>
            </div>

            <div className="group text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.perfectForBeginners}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t.perfectForBeginnersDesc}
              </p>
            </div>

            <div className="group text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl md:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{t.guaranteedResults}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t.guaranteedResultsDesc}
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t.flexibleSchedule}</h4>
              <p className="text-sm text-gray-600">{t.language === 'th' ? 'เลือกเวลาเรียนได้' : 'Choose your learning time'}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t.smallClasses}</h4>
              <p className="text-sm text-gray-600">{t.language === 'th' ? 'ดูแลทุกคนอย่างใกล้ชิด' : 'Close attention to everyone'}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t.practicalFocus}</h4>
              <p className="text-sm text-gray-600">{t.language === 'th' ? 'ฝึกพูดในสถานการณ์จริง' : 'Practice speaking in real situations'}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{t.progressTracking}</h4>
              <p className="text-sm text-gray-600">{t.language === 'th' ? 'ประเมินความก้าวหน้า' : 'Assess progress'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-r from-[#334293] via-[#2a3875] to-[#334293] text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            {t.readyToTransform}<br className="sm:hidden" />
            <span className="text-yellow-300">{t.withEnglish}</span>{t.question}
          </h2>
          <p className="text-lg md:text-xl mb-8 md:mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
            {t.joinSuccessfulStudents} <span className="font-bold text-yellow-300">{t.followersCount}</span>{t.studentsSuccess}
            <br className="hidden sm:block" />
            <span className="text-base md:text-lg opacity-80">{t.onlineOrBranch}</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-8">
            <Button 
              href="/public/student/new" 
              variant="secondary"
              className="px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-semibold bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              🚀 {t.registerFree}
            </Button>
            <Button 
              variant="outline" 
              href="/public/contact"
              className="px-8 md:px-10 py-4 md:py-5 text-base md:text-lg border-2 border-white text-white hover:bg-white hover:text-[#334293] transition-all duration-300"
            >
              📞 {t.consultFree}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-12 md:mt-16">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-300 mb-1">3</div>
              <div className="text-sm md:text-base opacity-80">{t.monthsResults}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-300 mb-1">24K+</div>
              <div className="text-sm md:text-base opacity-80">{t.followers}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-300 mb-1">1000+</div>
              <div className="text-sm md:text-base opacity-80">{t.successfulStudents}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-300 mb-1">5⭐</div>
              <div className="text-sm md:text-base opacity-80">{t.reviewScore}</div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-purple-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-green-400 rounded-full opacity-10 animate-pulse delay-1500"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <Image
                  src="/icons/logo.png"
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
    </PublicLayout>
    </>
  );
}