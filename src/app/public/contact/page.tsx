'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PublicLayout from '@/components/common/PublicLayout';
import Button from '@/components/common/Button';
import { Input, Textarea, Select } from '@/components/forms';

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert(language === 'th' ? 'ส่งข้อความเรียบร้อยแล้ว!' : 'Message sent successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1000);
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
            {t.contactPageTitle}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            {t.contactPageSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              href="/public/student/new" 
              variant="secondary"
              className="px-8 py-4 text-lg font-semibold bg-yellow-400 text-gray-900 hover:bg-yellow-300"
            >
              🚀 {t.registerNow}
            </Button>
            <a 
              href="tel:0637623059"
              className="inline-flex items-center px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-[#334293] transition-colors duration-300 rounded-full font-semibold"
            >
              📞 {t.callNow}
            </a>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.contactMethods}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.contactMethodsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Phone */}
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-blue-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.phone}</h3>
              <p className="text-gray-600 mb-4">{t.phoneDesc}</p>
              <a 
                href="tel:0637623059" 
                className="text-[#334293] font-semibold hover:underline"
              >
                063-762-3059
              </a>
            </div>

            {/* Line */}
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-green-100">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">LINE</h3>
              <p className="text-gray-600 mb-4">{t.lineDesc}</p>
              <a 
                href="https://line.me/ti/p/~englishkorat" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#334293] font-semibold hover:underline"
              >
                @englishkorat
              </a>
            </div>

            {/* Email */}
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-purple-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✉️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.email}</h3>
              <p className="text-gray-600 mb-4">{t.emailDesc}</p>
              <a 
                href="mailto:thanida09@gmail.com" 
                className="text-[#334293] font-semibold hover:underline break-words text-sm"
              >
                thanida09@gmail.com
              </a>
            </div>

            {/* Facebook */}
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-blue-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📘</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Facebook</h3>
              <p className="text-gray-600 mb-4">{t.facebookDesc}</p>
              <a 
                href="https://www.facebook.com/learningenglishkorat" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#334293] font-semibold hover:underline"
              >
                @learningenglishkorat
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Location */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t.sendMessage}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t.sendMessageDesc}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.fullName} *
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t.pleaseEnterName}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phoneNumber}
                    </label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={language === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์' : 'Please enter phone number'}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.emailAddress} *
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={language === 'th' ? 'กรุณากรอกอีเมล' : 'Please enter email address'}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.subject} *
                  </label>
                  <Select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    options={[
                      { value: '', label: t.pleaseSelectSubject },
                      { value: 'course_inquiry', label: t.courseInquiry },
                      { value: 'schedule', label: t.scheduleInquiry },
                      { value: 'pricing', label: t.pricingInquiry },
                      { value: 'general', label: t.generalInquiry }
                    ]}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.messagePlaceholder} *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t.messagePlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#334293] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#2a3875] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? (language === 'th' ? 'กำลังส่ง...' : 'Sending...') 
                    : t.sendMessage
                  }
                </button>
              </form>
            </div>

            {/* Location & Hours */}
            <div>
              <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">📍</span>
                  {t.location}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">{t.koratBranch}</h4>
                    <p className="text-gray-600">
                      {t.koratLocation}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {language === 'th' 
                        ? 'ใกล้ห้างเซ็นทรัล, ตลาดโคราช และมหาวิทยาลัยราช' 
                        : 'Near Central Plaza, Korat Market, and Rajabhat University'
                      }
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <span className="mr-2">⏰</span>
                      {t.openingHours}
                    </h4>
                    <div className="space-y-1 text-gray-600">
                      <p>{t.weekdayHours}</p>
                      <p>{t.weekendHours}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      {t.quickContact}
                    </h4>
                    <div className="space-y-2">
                      <a 
                        href="tel:0637623059" 
                        className="flex items-center text-[#334293] hover:text-[#2a3875] transition-colors"
                      >
                        <span className="mr-3">📞</span>
                        063-762-3059
                      </a>
                      <a 
                        href="https://line.me/ti/p/~englishkorat" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                      >
                        <span className="mr-3">💬</span>
                        @englishkorat
                      </a>
                      <a 
                        href="mailto:thanida09@gmail.com" 
                        className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <span className="mr-3">✉️</span>
                        thanida09@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-[#334293] to-[#2a3875] text-white">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <span className="mr-3">📍</span>
                    {t.findUs}
                  </h3>
                  <p className="opacity-90">
                    {t.findUsDesc}
                  </p>
                </div>
                <div className="h-96 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3850.5234567890123!2d102.0610465!3d14.9810914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDU4JzUxLjkiTiAxMDLCsDAzJzM5LjgiRQ!5e0!3m2!1sen!2sth!4v1640123456789!5m2!1sen!2sth"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="English Korat Location"
                    className="absolute inset-0"
                  ></iframe>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="text-center sm:text-left">
                      <p className="text-gray-900 font-semibold">
                        {t.koratBranch}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {t.koratLocation}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {language === 'th' 
                          ? 'ใกล้ห้างเซ็นทรัล, ตลาดโคราช และมหาวิทยาลัยราช' 
                          : 'Near Central Plaza, Korat Market, and Rajabhat University'
                        }
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        href="https://maps.app.goo.gl/pTTzuZ6bDCguAMMz9"
                        variant="primary"
                        className="inline-flex items-center text-sm px-4 py-2"
                      >
                        <span className="mr-2">🗺️</span>
                        {t.openMap}
                      </Button>
                      <Button 
                        href="https://maps.google.com/?q=14.9810914,102.0610465"
                        variant="outline"
                        className="inline-flex items-center text-sm px-4 py-2"
                      >
                        <span className="mr-2">🧭</span>
                        {language === 'th' ? 'พิกัด GPS' : 'GPS Coordinates'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.frequentlyAsked}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.faqDesc}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {language === 'th' 
                  ? 'เรียนกับ English Korat ต่างจากที่อื่นอย่างไร?'
                  : 'How is studying at English Korat different from other places?'
                }
              </h3>
              <p className="text-gray-600">
                {language === 'th'
                  ? 'เราเน้นการสนทนาจริง 70% และไวยากรณ์ 30% ทำให้คุณพูดได้เร็วกว่า มีการติดตามผลอย่างใกล้ชิด และมีชุมชนนักเรียนที่ช่วยเหลือซึ่งกันและกัน'
                  : 'We focus 70% on real conversation and 30% on grammar, making you speak faster. We provide close progress tracking and have a supportive student community.'
                }
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {language === 'th' 
                  ? 'ค่าเรียนเท่าไร? มีส่วนลดไหม?'
                  : 'How much is the tuition? Are there discounts?'
                }
              </h3>
              <p className="text-gray-600">
                {language === 'th'
                  ? 'ค่าเรียนเริ่มต้นที่ 3,500 บาท/คอร์ส สำหรับคอร์ส Travel English และสูงสุด 8,500 บาท สำหรับ IELTS Preparation มีส่วนลดสำหรับการจ่ายล่วงหน้า และลงทะเบียนเป็นกลุ่ม'
                  : 'Tuition starts from 3,500 baht/course for Travel English and up to 8,500 baht for IELTS Preparation. Discounts available for advance payment and group registration.'
                }
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {language === 'th' 
                  ? 'มีคลาสเรียนออนไลน์ไหม?'
                  : 'Do you have online classes?'
                }
              </h3>
              <p className="text-gray-600">
                {language === 'th'
                  ? 'มีครับ/ค่ะ เรามีทั้งคลาสเรียนที่สาขาและออนไลน์ผ่าน Zoom คุณสามารถเลือกได้ตามความสะดวก หรือจะเรียนแบบผสมก็ได้'
                  : 'Yes, we have both in-person classes at our branch and online classes via Zoom. You can choose according to your convenience or study in a hybrid format.'
                }
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {language === 'th' 
                  ? 'จะรู้ได้อย่างไรว่าพัฒนาแค่ไหนแล้ว?'
                  : 'How can I track my progress?'
                }
              </h3>
              <p className="text-gray-600">
                {language === 'th'
                  ? 'เรามีระบบติดตามผลเป็นรายสัปดาห์ มีการทดสอบย่อยทุกสัปดาห์ และมีการประเมินผลรวมทุกเดือน คุณจะได้รับรายงานความก้าวหน้าแบบละเอียด'
                  : 'We have a weekly progress tracking system with weekly quizzes and monthly comprehensive assessments. You will receive detailed progress reports.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-[#334293] to-[#2d3884]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t.readyToTalk}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.readyToTalkDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              href="/public/student/new" 
              variant="secondary"
              className="px-8 py-4 text-lg font-semibold bg-yellow-400 text-gray-900 hover:bg-yellow-300"
            >
              🚀 {t.registerNow}
            </Button>
            <a 
              href="tel:0637623059"
              className="inline-flex items-center px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-[#334293] transition-colors duration-300 rounded-full font-semibold"
            >
              📞 {t.callNow}
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
