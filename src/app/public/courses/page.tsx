'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import PublicLayout from '@/components/common/Layout';
import Button from '@/components/common/Button';

export default function CoursesPage() {
  const { t, language } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Course data - in a real app this would come from an API
  const courses = [
    {
      id: 1,
      name: language === 'th' ? 'Basic English สำหรับผู้เริ่มต้น' : 'Basic English for Beginners',
      level: 'beginner',
      type: 'general',
      duration: language === 'th' ? '3 เดือน' : '3 months',
      price: '4,500',
      students: 2450,
      rating: 4.9,
      image: '/images/basic-english-course.jpg',
      description: language === 'th' 
        ? 'เหมาะสำหรับผู้ที่ไม่เคยเรียนภาษาอังกฤษมาก่อน เริ่มจากพื้นฐานสุด ๆ จนสามารถสนทนาเบื้องต้นได้' 
        : 'Perfect for those who have never learned English before. Starting from the very basics until basic conversation is possible',
      features: language === 'th' 
        ? ['พื้นฐานไวยากรณ์', 'คำศัพท์ประจำวัน', 'การออกเสียง', 'การสนทนาง่าย ๆ']
        : ['Basic Grammar', 'Daily Vocabulary', 'Pronunciation', 'Simple Conversation']
    },
    {
      id: 2,
      name: language === 'th' ? 'Conversation English พูดได้ใน 3 เดือน' : 'Conversation English - Speak in 3 Months',
      level: 'intermediate',
      type: 'conversation',
      duration: language === 'th' ? '3 เดือน' : '3 months',
      price: '5,500',
      students: 1820,
      rating: 4.8,
      image: '/images/conversation-course.jpg',
      description: language === 'th' 
        ? 'เน้นการสนทนาในสถานการณ์จริง พัฒนาความมั่นใจในการพูด เหมาะสำหรับผู้ที่มีพื้นฐานแล้ว' 
        : 'Focus on real-life conversation situations, develop confidence in speaking. Suitable for those with basic knowledge',
      features: language === 'th' 
        ? ['สนทนาในสถานการณ์จริง', 'เทคนิคการพูด', 'สำนวนและวลี', 'ฝึกพูดทุกคลาส']
        : ['Real-life Conversations', 'Speaking Techniques', 'Idioms and Phrases', 'Speaking Practice Every Class']
    },
    {
      id: 3,
      name: language === 'th' ? 'Business English สำหรับการทำงาน' : 'Business English for Work',
      level: 'intermediate',
      type: 'business',
      duration: language === 'th' ? '4 เดือน' : '4 months',
      price: '6,500',
      students: 980,
      rating: 4.9,
      image: '/images/business-course.jpg',
      description: language === 'th' 
        ? 'ภาษาอังกฤษเพื่อการทำงาน เรียนรู้การเขียนอีเมล การประชุม การนำเสนอ เหมาะสำหรับพนักงาน' 
        : 'English for work purposes. Learn email writing, meetings, presentations. Perfect for employees',
      features: language === 'th' 
        ? ['การเขียนอีเมลธุรกิจ', 'การประชุม', 'การนำเสนอ', 'คำศัพท์ธุรกิจ']
        : ['Business Email Writing', 'Meetings', 'Presentations', 'Business Vocabulary']
    },
    {
      id: 4,
      name: language === 'th' ? 'IELTS Preparation เตรียมสอบไอเอลส์' : 'IELTS Preparation Course',
      level: 'advanced',
      type: 'test_prep',
      duration: language === 'th' ? '6 เดือน' : '6 months',
      price: '8,500',
      students: 650,
      rating: 4.7,
      image: '/images/ielts-course.jpg',
      description: language === 'th' 
        ? 'เตรียมตัวสอบ IELTS อย่างเป็นระบบ เน้นทักษะทั้ง 4 ด้าน พร้อมสอบจริง' 
        : 'Systematic IELTS preparation, focusing on all 4 skills, ready for the real exam',
      features: language === 'th' 
        ? ['ฝึกทักษะ 4 ด้าน', 'สอบจำลอง', 'เทคนิคทำข้อสอบ', 'การบ้านและฝึกหัด']
        : ['4 Skills Practice', 'Mock Tests', 'Exam Techniques', 'Homework and Exercises']
    },
    {
      id: 5,
      name: language === 'th' ? 'English for Kids เด็กสนุกเรียน' : 'English for Kids - Fun Learning',
      level: 'kids',
      type: 'kids',
      duration: language === 'th' ? '6 เดือน' : '6 months',
      price: '3,500',
      students: 1200,
      rating: 4.8,
      image: '/images/kids-course.jpg',
      description: language === 'th' 
        ? 'คอร์สภาษาอังกฤษสำหรับเด็ก อายุ 6-12 ปี เรียนผ่านเกมและกิจกรรมสนุก ๆ' 
        : 'English course for children aged 6-12 years, learning through games and fun activities',
      features: language === 'th' 
        ? ['เรียนผ่านเกม', 'กิจกรรมสนุก', 'เพลงและการ์ตูน', 'พัฒนาการฟังพูด']
        : ['Learning Through Games', 'Fun Activities', 'Songs and Cartoons', 'Listening and Speaking Development']
    },
    {
      id: 6,
      name: language === 'th' ? 'Travel English เที่ยวต่างประเทศ' : 'Travel English for International Trips',
      level: 'beginner',
      type: 'travel',
      duration: language === 'th' ? '2 เดือน' : '2 months',
      price: '3,500',
      students: 800,
      rating: 4.6,
      image: '/images/travel-course.jpg',
      description: language === 'th' 
        ? 'ภาษาอังกฤษสำหรับการเดินทาง เรียนรู้วลีและสถานการณ์ที่จำเป็นในการท่องเที่ยว' 
        : 'English for travel, learn essential phrases and situations for tourism',
      features: language === 'th' 
        ? ['สนทนาในสนามบิน', 'จองโรงแรม', 'สั่งอาหาร', 'ถามทิศทาง']
        : ['Airport Conversations', 'Hotel Booking', 'Ordering Food', 'Asking for Directions']
    }
  ];

  const filteredCourses = courses.filter(course => {
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel;
    const typeMatch = selectedType === 'all' || course.type === selectedType;
    return levelMatch && typeMatch;
  });

  const levelOptions = [
    { value: 'all', label: language === 'th' ? 'ทุกระดับ' : 'All Levels' },
    { value: 'beginner', label: language === 'th' ? 'ผู้เริ่มต้น' : 'Beginner' },
    { value: 'intermediate', label: language === 'th' ? 'ระดับกลาง' : 'Intermediate' },
    { value: 'advanced', label: language === 'th' ? 'ขั้นสูง' : 'Advanced' },
    { value: 'kids', label: language === 'th' ? 'เด็ก' : 'Kids' }
  ];

  const typeOptions = [
    { value: 'all', label: language === 'th' ? 'ทุกประเภท' : 'All Types' },
    { value: 'general', label: language === 'th' ? 'ทั่วไป' : 'General' },
    { value: 'conversation', label: language === 'th' ? 'การสนทนา' : 'Conversation' },
    { value: 'business', label: language === 'th' ? 'ธุรกิจ' : 'Business' },
    { value: 'test_prep', label: language === 'th' ? 'เตรียมสอบ' : 'Test Prep' },
    { value: 'kids', label: language === 'th' ? 'เด็ก' : 'Kids' },
    { value: 'travel', label: language === 'th' ? 'ท่องเที่ยว' : 'Travel' }
  ];

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'kids': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'conversation': return 'bg-orange-100 text-orange-800';
      case 'business': return 'bg-indigo-100 text-indigo-800';
      case 'test_prep': return 'bg-pink-100 text-pink-800';
      case 'kids': return 'bg-purple-100 text-purple-800';
      case 'travel': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#334293] via-[#2a3875] to-[#1f2654] text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-pulse delay-500"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {t.coursesPageTitle}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            {t.coursesPageSubtitle}
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
              href="/contact"
              variant="outline" 
              className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-[#334293]"
            >
              💬 {t.askForAdvice}
            </Button>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">{t.filterByLevel}:</span>
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#334293] focus:border-transparent"
              >
                {levelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700">{t.filterByType}:</span>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#334293] focus:border-transparent"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.ourCourses}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {filteredCourses.length} {language === 'th' ? 'คอร์สที่พบ' : 'courses found'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl opacity-20">📚</div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelBadgeColor(course.level)}`}>
                      {levelOptions.find(l => l.value === course.level)?.label}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(course.type)}`}>
                      {typeOptions.find(t => t.value === course.type)?.label}
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {course.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                    {course.description}
                  </p>

                  {/* Course Features */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                      {language === 'th' ? 'สิ่งที่จะได้เรียน:' : 'What you\'ll learn:'}
                    </h4>
                    <ul className="space-y-1">
                      {course.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        {course.students.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {course.rating}
                      </span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {course.duration}
                    </span>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-[#334293]">
                        ฿{course.price}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        /{language === 'th' ? 'คอร์ส' : 'course'}
                      </span>
                    </div>
                    <Button 
                      href="/public/student/new"
                      variant="primary"
                      className="px-6 py-2 text-sm"
                    >
                      {language === 'th' ? 'สมัครเลย' : 'Enroll Now'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Courses */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.whyOurCourses}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.whyOurCoursesDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'th' ? 'ครูมืออาชีพ' : 'Professional Teachers'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'th' ? 'ครูผู้สอนมีประสบการณ์สูง' : 'Highly experienced instructors'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'th' ? 'เน้นการสนทนา' : 'Focus on Conversation'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'th' ? 'ฝึกพูดจริงทุกคลาส' : 'Real speaking practice every class'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'th' ? 'ติดตามผล' : 'Progress Tracking'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'th' ? 'วัดความก้าวหน้าอย่างชัดเจน' : 'Clear progress measurement'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'th' ? 'ผลลัพธ์ชัดเจน' : 'Clear Results'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'th' ? 'พูดได้จริงใน 3 เดือน' : 'Real speaking ability in 3 months'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-[#334293] to-[#2d3884]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t.readyToStartLearning}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.readyToStartLearningDesc}
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
              href="/contact"
              variant="outline" 
              className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-[#334293]"
            >
              📞 {t.contactForInfo}
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
