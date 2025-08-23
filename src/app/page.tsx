

"use client";

import Button from "@/components/common/Button";
import Image from "next/image";
import PublicLayout from "@/components/common/PublicLayout";
import StructuredData, { 
  organizationData, 
  websiteData, 
  serviceData, 
  faqData 
} from "@/components/common/StructuredData";
import { useLanguage } from "@/contexts/LanguageContext";

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
            <div className="space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1 animate-slide-in-left">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight animate-slide-up">
                  <span className="block text-[#334293] mb-2 animate-bounce-in">{t.heroTitle}</span>
                  <span className="block text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-gray-800">{t.heroSubtitle}</span>
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-gray-600 mt-4 md:mt-6 leading-relaxed animate-slide-up">
                  {t.heroDescription}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start animate-slide-up">
                <Button 
                  variant="primary" 
                  href="/public/student/new"
                  className="text-sm md:text-base px-6 md:px-8 py-3 md:py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover-glow"
                >
                  {t.startLearning}
                </Button>
                <Button 
                  variant="outline" 
                  href="/public/courses"
                  className="text-sm md:text-base px-6 md:px-8 py-3 md:py-4 border-2 border-[#334293] text-[#334293] hover:bg-[#334293] hover:text-white transition-all duration-300 hover-scale"
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
            <div className="order-1 lg:order-2 flex justify-center animate-slide-in-right">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
                <Image
                  src="https://scontent.fbkk9-3.fna.fbcdn.net/v/t39.30808-6/525003966_773847038659861_2013571049567836493_n.png?_nc_cat=105&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=Oo91aPRnyPYQ7kNvwFjMYio&_nc_oc=AdnEY2iAAhZ8KTqkMkqkbxOhd7s_AHliYGf9EllJZQQoeJzu3iQYhvz1Z7NHYJnt3ORe38fnBM37ixNkw2y2atgx&_nc_zt=23&_nc_ht=scontent.fbkk9-3.fna&_nc_gid=E2YsfkxFJfeEWG8HeZHHHA&oh=00_AfVWAzb6WMXY1E_wOY8esVt8lXnubH5aN_VdB5dOTgQnJQ&oe=68AF324F"
                  alt="English Korat - สถาบันสอนภาษาอังกฤษโคราช"
                  width={600}
                  height={450}
                  className="relative rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-full hover-scale transition-transform duration-500"
                  priority
                />
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
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
          <div className="text-center mb-12 md:mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              {t.whyChooseUs}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t.whyChooseDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="group text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl animate-slide-in-left hover-glow">
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

            <div className="group text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl animate-slide-up hover-glow">
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
    </PublicLayout>
    </>
  );
}