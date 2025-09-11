'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import PublicLayout from '@/components/common/PublicLayout';
import Button from '@/components/common/Button';
import Image from 'next/image';
import StructuredData from '@/components/common/StructuredData';

export default function AboutPage() {
  const { t, language } = useLanguage();

  const aboutData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "English Korat",
    "description": language === 'th' 
      ? "สถาบันสอนภาษาอังกฤษชั้นนำในจังหวัดนครราชสีมา ที่มุ่งมั่นพัฒนาทักษะภาษาอังกฤษให้กับนักเรียนทุกระดับ" 
      : "Leading English language institute in Nakhon Ratchasima, dedicated to developing English skills for students of all levels",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Nakhon Ratchasima",
      "addressCountry": "TH"
    },
    "telephone": "063-762-3059",
    "email": "thanida09@gmail.com"
  };

  return (
    <>
      <StructuredData data={aboutData} />
      <PublicLayout>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#334293] via-[#2a3875] to-[#1f2654] text-white py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {language === 'th' ? 'เกี่ยวกับ English Korat' : 'About English Korat'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              {language === 'th' 
                ? 'สถาบันสอนภาษาอังกฤษที่เชื่อในศักยภาพของทุกคน พร้อมนำทุกท่านไปสู่เป้าหมายในการเรียนรู้ภาษาอังกฤษ'
                : 'An English language institute that believes in everyone\'s potential, ready to guide you towards your English learning goals'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                href="/public/student/new" 
                variant="secondary"
                className="px-8 py-4 text-lg font-semibold bg-yellow-400 text-gray-900 hover:bg-yellow-300"
              >
                🚀 {t.registerNow}
              </Button>
              <Button 
                href="/public/contact"
                variant="outline" 
                className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-[#334293]"
              >
                📞 {t.contact}
              </Button>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-5"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full opacity-5"></div>
          </div>
        </section>

        {/* Banner Section */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Image
                src="https://scontent.fbkk9-3.fna.fbcdn.net/v/t39.30808-6/525003966_773847038659861_2013571049567836493_n.png?_nc_cat=105&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=Oo91aPRnyPYQ7kNvwFjMYio&_nc_oc=AdnEY2iAAhZ8KTqkMkqkbxOhd7s_AHliYGf9EllJZQQoeJzu3iQYhvz1Z7NHYJnt3ORe38fnBM37ixNkw2y2atgx&_nc_zt=23&_nc_ht=scontent.fbkk9-3.fna&_nc_gid=E2YsfkxFJfeEWG8HeZHHHA&oh=00_AfVWAzb6WMXY1E_wOY8esVt8lXnubH5aN_VdB5dOTgQnJQ&oe=68AF324F"
                alt="English Korat Banner"
                width={800}
                height={400}
                className="w-full h-auto rounded-2xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  {language === 'th' ? 'เรื่องราวของเรา' : 'Our Story'}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="space-y-6 text-red-600">
                    <p className="text-lg leading-relaxed">
                      {language === 'th' 
                        ? 'English Korat เกิดขึ้นจากความตั้งใจที่จะสร้างสถานที่เรียนรู้ภาษาอังกฤษที่แตกต่าง ด้วยการสอนที่เน้นผู้เรียนเป็นศูนย์กลาง และการใช้เทคนิคการสอนที่หลากหลายเพื่อให้เหมาะสมกับรูปแบบการเรียนรู้ของแต่ละคน'
                        : 'English Korat was born from the intention to create a different English learning place, with student-centered teaching and diverse teaching techniques suitable for each person\'s learning style.'
                      }
                    </p>
                    <p className="text-lg leading-relaxed">
                      {language === 'th'
                        ? 'เราเชื่อว่าทุกคนมีศักยภาพในการเรียนรู้ภาษาอังกฤษ เพียงแค่ต้องมีวิธีการที่เหมาะสม การสนับสนุนที่ดี และสภาพแวดล้อมที่เอื้อต่อการเรียนรู้'
                        : 'We believe that everyone has the potential to learn English, they just need the right methods, good support, and a learning-friendly environment.'
                      }
                    </p>
                  </div>
                </div>
                <div>
                  <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h3 className="text-2xl font-bold text-[#334293] mb-6">
                      {language === 'th' ? 'ปรัชญาการสอน' : 'Teaching Philosophy'}
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <span className="text-2xl mr-3">🎯</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {language === 'th' ? 'เน้นผู้เรียนเป็นหลัก' : 'Student-Centered Approach'}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {language === 'th' 
                              ? 'ปรับวิธีการสอนให้เหมาะกับแต่ละบุคคล'
                              : 'Adapting teaching methods to suit each individual'
                            }
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3">💡</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {language === 'th' ? 'เรียนรู้อย่างสนุกสนาน' : 'Fun Learning Experience'}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {language === 'th' 
                              ? 'สร้างบรรยากาศการเรียนที่เป็นมิตรและสนุกสนาน'
                              : 'Creating a friendly and fun learning atmosphere'
                            }
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3">🌟</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {language === 'th' ? 'พัฒนาอย่างต่อเนื่อง' : 'Continuous Development'}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {language === 'th' 
                              ? 'ติดตามความก้าวหน้าและปรับปรุงอย่างต่อเนื่อง'
                              : 'Tracking progress and continuous improvement'
                            }
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {language === 'th' ? 'ทำไมต้องเลือก English Korat?' : 'Why Choose English Korat?'}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="text-4xl mb-4 text-center">👨‍🏫</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  {language === 'th' ? 'ครูผู้เชี่ยวชาญ' : 'Expert Teachers'}
                </h3>
                <p className="text-gray-600 text-center">
                  {language === 'th' 
                    ? 'ครูที่มีประสบการณ์และเข้าใจในการสอนภาษาอังกฤษ พร้อมให้คำปรึกษาและช่วยเหลืออย่างใกล้ชิด'
                    : 'Experienced teachers who understand English teaching, ready to provide close consultation and assistance'
                  }
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="text-4xl mb-4 text-center">📚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  {language === 'th' ? 'หลักสูตรที่หลากหลาย' : 'Diverse Curricula'}
                </h3>
                <p className="text-gray-600 text-center">
                  {language === 'th' 
                    ? 'หลักสูตรที่ออกแบบมาเพื่อตอบสนองความต้องการที่แตกต่างกัน ตั้งแต่เด็กจนถึงผู้ใหญ่'
                    : 'Curricula designed to meet different needs, from children to adults'
                  }
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="text-4xl mb-4 text-center">🏆</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  {language === 'th' ? 'ผลลัพธ์ที่พิสูจน์ได้' : 'Proven Results'}
                </h3>
                <p className="text-gray-600 text-center">
                  {language === 'th' 
                    ? 'นักเรียนของเราประสบความสำเร็จในการสอบต่าง ๆ และสามารถใช้ภาษาอังกฤษได้อย่างมั่นใจ'
                    : 'Our students succeed in various exams and can use English with confidence'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-gradient-to-r from-[#334293] to-[#2a3875] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {language === 'th' ? 'ความสำเร็จในตัวเลข' : 'Success in Numbers'}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2">500+</div>
                <div className="text-sm md:text-base opacity-90">
                  {language === 'th' ? 'นักเรียนที่สำเร็จ' : 'Successful Students'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2">3+</div>
                <div className="text-sm md:text-base opacity-90">
                  {language === 'th' ? 'ปีของประสบการณ์' : 'Years of Experience'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2">95%</div>
                <div className="text-sm md:text-base opacity-90">
                  {language === 'th' ? 'ความพึงพอใจ' : 'Satisfaction Rate'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2">5⭐</div>
                <div className="text-sm md:text-base opacity-90">
                  {language === 'th' ? 'คะแนนรีวิว' : 'Review Score'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {language === 'th' ? 'พร้อมเริ่มต้นการเรียนรู้แล้วหรือยัง?' : 'Ready to Start Learning?'}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {language === 'th'
                ? 'เริ่มต้นการเดินทางในการเรียนรู้ภาษาอังกฤษไปกับเราวันนี้ และมุ่งไปสู่เป้าหมายที่คุณตั้งไว้'
                : 'Start your English learning journey with us today and move towards your goals'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                href="/public/student/new" 
                variant="primary"
                className="px-8 py-4 text-lg font-semibold"
              >
                🚀 {t.registerNow}
              </Button>
              <Button 
                href="/public/courses"
                variant="outline" 
                className="px-8 py-4 text-lg"
              >
                📚 {language === 'th' ? 'ดูหลักสูตร' : 'View Courses'}
              </Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    </>
  );
}