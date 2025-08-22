'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import PublicLayout from '@/components/common/Layout';
import Button from '@/components/common/Button';

export default function PrivacyPage() {
  const { t, language } = useLanguage();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#334293] via-[#2a3875] to-[#1f2654] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {t.privacyPolicyTitle}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            {t.privacyPolicyDescription}
          </p>
          <p className="text-lg opacity-75">
            {language === 'th' 
              ? 'ปรับปรุงครั้งล่าสุด: 22 สิงหาคม 2025'
              : 'Last updated: August 22, 2025'
            }
          </p>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            {language === 'th' ? (
              <>
                <div className="bg-blue-50 p-6 rounded-2xl mb-8">
                  <h2 className="text-2xl font-bold text-[#334293] mb-4">บทสรุปสำคัญ</h2>
                  <p className="text-gray-700">
                    English Korat ให้ความสำคัญกับความเป็นส่วนตัวของคุณ เราเก็บรักษาข้อมูลส่วนบุคคลของคุณอย่างปลอดภัย 
                    และใช้เพื่อวัตถุประสงค์ในการให้บริการการศึกษาเท่านั้น
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. ข้อมูลที่เราเก็บรวบรวม</h2>
                <p className="text-gray-600 mb-6">
                  เราเก็บรวบรวมข้อมูลส่วนบุคคลของคุณเมื่อคุณ:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>สมัครเรียนหรือลงทะเบียนคอร์ส</li>
                  <li>ติดต่อเราผ่านเว็บไซต์ อีเมล หรือโทรศัพท์</li>
                  <li>เข้าร่วมกิจกรรมหรือสัมมนาของเรา</li>
                  <li>ใช้บริการออนไลน์ของเรา</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-800 mb-3">ประเภทข้อมูลที่เก็บ:</h3>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-1">
                  <li>ชื่อ นามสกุล อายุ เพศ</li>
                  <li>ที่อยู่ เบอร์โทรศัพท์ อีเมล</li>
                  <li>ข้อมูลการศึกษาและระดับความรู้ภาษาอังกฤษ</li>
                  <li>ข้อมูลการชำระเงินและการเข้าเรียน</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. การใช้ข้อมูล</h2>
                <p className="text-gray-600 mb-4">
                  เราใช้ข้อมูลส่วนบุคคลของคุณเพื่อ:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>จัดการการเรียนการสอนและให้บริการการศึกษา</li>
                  <li>ติดต่อสื่อสารเกี่ยวกับคอร์สเรียนและกิจกรรม</li>
                  <li>ปรับปรุงคุณภาพการบริการและพัฒนาหลักสูตร</li>
                  <li>ส่งข้อมูลข่าวสารและโปรโมชั่น (ถ้าคุณยินยอม)</li>
                  <li>ปฏิบัติตามกฎหมายและข้อบังคับที่เกี่ยวข้อง</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. การแบ่งปันข้อมูล</h2>
                <p className="text-gray-600 mb-4">
                  เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สาม ยกเว้น:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>เมื่อได้รับความยินยอมจากคุณ</li>
                  <li>เพื่อปฏิบัติตามกฎหมายหรือคำสั่งศาล</li>
                  <li>เพื่อป้องกันการทุจริตหรือปกป้องความปลอดภัย</li>
                  <li>กับผู้ให้บริการที่เชื่อถือได้ที่ช่วยในการดำเนินงาน</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. ความปลอดภัยของข้อมูล</h2>
                <p className="text-gray-600 mb-8">
                  เรามีมาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณจากการสูญหาย การใช้งานที่ไม่ได้รับอนุญาต 
                  หรือการเปิดเผยโดยไม่ได้รับอนุญาต รวมถึงการใช้เทคโนโลยีเข้ารหัสและการจำกัดการเข้าถึงข้อมูล
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. สิทธิของคุณ</h2>
                <p className="text-gray-600 mb-4">
                  คุณมีสิทธิในการ:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>เข้าถึงและขอสำเนาข้อมูลส่วนบุคคลของคุณ</li>
                  <li>ขอให้แก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่ครบถ้วน</li>
                  <li>ขอให้ลบข้อมูลส่วนบุคคลของคุณ</li>
                  <li>คัดค้านการประมวลผลข้อมูลในบางกรณี</li>
                  <li>ถอนความยินยอมที่ให้ไว้</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. คุกกี้และเทคโนโลยีติดตาม</h2>
                <p className="text-gray-600 mb-8">
                  เว็บไซต์ของเราอาจใช้คุกกี้และเทคโนโลยีคล้ายคลึงเพื่อปรับปรุงประสบการณ์การใช้งานของคุณ 
                  คุณสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ได้ แต่อาจส่งผลต่อการใช้งานเว็บไซต์บางส่วน
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. การเปลี่ยนแปลงนโยบาย</h2>
                <p className="text-gray-600 mb-8">
                  เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว การเปลี่ยนแปลงจะมีผลบังคับใช้เมื่อเผยแพร่บนเว็บไซต์ 
                  เราแนะนำให้คุณตรวจสอบนโยบายนี้เป็นประจำ
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. ติดต่อเรา</h2>
                <p className="text-gray-600 mb-4">
                  หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อเราที่:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-8">
                  <p className="text-gray-700"><strong>English Korat</strong></p>
                  <p className="text-gray-700">อีเมล: thanida09@gmail.com</p>
                  <p className="text-gray-700">โทรศัพท์: 063-762-3059</p>
                  <p className="text-gray-700">ที่อยู่: นครราชสีมา (โคราช)</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 p-6 rounded-2xl mb-8">
                  <h2 className="text-2xl font-bold text-[#334293] mb-4">Important Summary</h2>
                  <p className="text-gray-700">
                    English Korat values your privacy. We securely protect your personal information 
                    and use it only for the purpose of providing educational services.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 mb-6">
                  We collect your personal information when you:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>Register for courses or enrollment</li>
                  <li>Contact us through website, email, or phone</li>
                  <li>Participate in our activities or seminars</li>
                  <li>Use our online services</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-800 mb-3">Types of information collected:</h3>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-1">
                  <li>Name, surname, age, gender</li>
                  <li>Address, phone number, email</li>
                  <li>Educational background and English proficiency level</li>
                  <li>Payment and attendance information</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Information</h2>
                <p className="text-gray-600 mb-4">
                  We use your personal information to:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>Manage teaching and learning and provide educational services</li>
                  <li>Communicate about courses and activities</li>
                  <li>Improve service quality and develop curriculum</li>
                  <li>Send news and promotional information (if you consent)</li>
                  <li>Comply with applicable laws and regulations</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
                <p className="text-gray-600 mb-4">
                  We will not disclose your personal information to third parties, except:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>When we have your consent</li>
                  <li>To comply with law or court orders</li>
                  <li>To prevent fraud or protect security</li>
                  <li>With trusted service providers who assist in operations</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                <p className="text-gray-600 mb-8">
                  We have appropriate security measures to protect your personal information from loss, unauthorized use, 
                  or unauthorized disclosure, including the use of encryption technology and limiting data access.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
                <p className="text-gray-600 mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>Access and request copies of your personal information</li>
                  <li>Request correction of incorrect or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to data processing in certain cases</li>
                  <li>Withdraw consent previously given</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
                <p className="text-gray-600 mb-8">
                  Our website may use cookies and similar technologies to improve your user experience. 
                  You can set your browser to reject cookies, but this may affect some website functionality.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Policy Changes</h2>
                <p className="text-gray-600 mb-8">
                  We may update this privacy policy from time to time. Changes will take effect when published on the website. 
                  We recommend checking this policy regularly.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have questions about this privacy policy, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-8">
                  <p className="text-gray-700"><strong>English Korat</strong></p>
                  <p className="text-gray-700">Email: thanida09@gmail.com</p>
                  <p className="text-gray-700">Phone: 063-762-3059</p>
                  <p className="text-gray-700">Address: Nakhon Ratchasima (Korat)</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {language === 'th' ? 'มีคำถามเพิ่มเติม?' : 'Have More Questions?'}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {language === 'th' 
              ? 'หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อเรา'
              : 'If you have any questions about our privacy policy, please contact us'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              href="/contact" 
              variant="primary"
              className="px-8 py-4 text-lg font-semibold"
            >
              📞 {t.contactUs}
            </Button>
            <Button 
              href="/"
              variant="outline" 
              className="px-8 py-4 text-lg"
            >
              🏠 {language === 'th' ? 'กลับหน้าแรก' : 'Back to Home'}
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
