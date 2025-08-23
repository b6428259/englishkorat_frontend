'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import PublicLayout from '@/components/common/PublicLayout';
import Button from '@/components/common/Button';

export default function TermsPage() {
  const { t, language } = useLanguage();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#334293] via-[#2a3875] to-[#1f2654] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {t.termsOfServiceTitle}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            {t.termsOfServiceDescription}
          </p>
          <p className="text-lg opacity-75">
            {language === 'th' 
              ? 'ปรับปรุงครั้งล่าสุด: 22 สิงหาคม 2025'
              : 'Last updated: August 22, 2025'
            }
          </p>
        </div>
      </section>

      {/* Terms of Service Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            {language === 'th' ? (
              <>
                <div className="bg-amber-50 p-6 rounded-2xl mb-8">
                  <h2 className="text-2xl font-bold text-amber-800 mb-4">ข้อมูลสำคัญ</h2>
                  <p className="text-amber-700">
                    การใช้บริการของ English Korat หมายถึงคุณยอมรับข้อกำหนดและเงื่อนไขเหล่านี้ 
                    กรุณาอ่านอย่างละเอียดก่อนใช้บริการ
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. การยอมรับข้อกำหนด</h2>
                <p className="text-gray-600 mb-8">
                  การเข้าใช้หรือใช้บริการของ English Korat ถือว่าคุณได้อ่าน เข้าใจ และตกลงที่จะผูกพันตามข้อกำหนดและเงื่อนไขนี้ 
                  หากคุณไม่ยอมรับข้อกำหนดเหล่านี้ กรุณาอย่าใช้บริการของเรา
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. บริการของเรา</h2>
                <p className="text-gray-600 mb-4">
                  English Korat ให้บริการการสอนภาษาอังกฤษ รวมถึง:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>คอร์สเรียนภาษาอังกฤษประเภทต่าง ๆ</li>
                  <li>บริการสอนแบบกลุ่มและรายบุคคล</li>
                  <li>การเรียนออนไลน์และที่สาขา</li>
                  <li>วัสดุการเรียนและแบบทดสอบ</li>
                  <li>กิจกรรมพิเศษและสัมมนา</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. การลงทะเบียนและการชำระเงิน</h2>
                <h3 className="text-xl font-bold text-gray-800 mb-3">การลงทะเบียน:</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-1">
                  <li>ต้องให้ข้อมูลที่ถูกต้องและครบถ้วน</li>
                  <li>ยืนยันตัวตนด้วยเอกสารที่เกี่ยวข้อง</li>
                  <li>ยอมรับการทดสอบวัดระดับ (ถ้าจำเป็น)</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-800 mb-3">การชำระเงิน:</h3>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-1">
                  <li>ชำระค่าเรียนล่วงหน้าตามที่กำหนด</li>
                  <li>ค่าเรียนที่ชำระแล้วไม่สามารถคืนได้ ยกเว้นกรณีพิเศษ</li>
                  <li>การผ่อนชำระต้องได้รับอนุมัติล่วงหน้า</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. กฎระเบียบการเข้าเรียน</h2>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>นักเรียนต้องเข้าเรียนตรงเวลาและเข้าร่วมอย่างสม่ำเสมอ</li>
                  <li>การขาดเรียนติดต่อกันมากกว่า 3 ครั้ง อาจถูกระงับการเรียน</li>
                  <li>ต้องปฏิบัติตามกฎระเบียบของสถาบัน</li>
                  <li>เคารพครูผู้สอนและเพื่อนนักเรียน</li>
                  <li>ดูแลรักษาอุปกรณ์และสถานที่</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. การยกเลิกและการคืนเงิน</h2>
                <h3 className="text-xl font-bold text-gray-800 mb-3">การยกเลิกโดยนักเรียน:</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-1">
                  <li>แจ้งยกเลิกล่วงหน้าอย่างน้อย 7 วัน</li>
                  <li>กรณีเรียนไปแล้วไม่เกิน 25% สามารถขอคืนเงิน 50%</li>
                  <li>กรณีเรียนไปแล้วเกิน 25% ไม่สามารถขอคืนเงินได้</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-800 mb-3">การยกเลิกโดยสถาบัน:</h3>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-1">
                  <li>กรณีมีผู้สมัครไม่เพียงพอ</li>
                  <li>กรณีฉุกเฉินหรือสถานการณ์ไม่ปกติ</li>
                  <li>จะคืนเงินเต็มจำนวนหรือโอนไปคอร์สอื่น</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. ทรัพย์สินทางปัญญา</h2>
                <p className="text-gray-600 mb-4">
                  เนื้อหาทั้งหมดในการเรียนการสอน รวมถึง:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>หลักสูตร เอกสาร และวัสดุการเรียน</li>
                  <li>วิธีการสอนและเทคนิคเฉพาะ</li>
                  <li>แบบทดสอบและการประเมินผล</li>
                  <li>สื่อดิจิทัลและออนไลน์</li>
                </ul>
                <p className="text-gray-600 mb-8">
                  เป็นทรัพย์สินของ English Korat นักเรียนไม่สามารถทำสำเนา แจกจ่าย หรือใช้เพื่อการพาณิชย์โดยไม่ได้รับอนุญาต
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. ความรับผิดชอบและข้อจำกัด</h2>
                <p className="text-gray-600 mb-4">
                  English Korat จะพยายามอย่างดีที่สุดในการให้บริการ แต่:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>ไม่รับประกันผลลัพธ์การเรียนรู้ที่เฉพาะเจาะจง</li>
                  <li>ไม่รับผิดชอบต่อความเสียหายทางอ้อม</li>
                  <li>ไม่รับผิดชอบต่อการหยุดชะงักของบริการที่เกิดจากเหตุสุดวิสัย</li>
                  <li>ความรับผิดชอบจำกัดอยู่ที่มูลค่าค่าเรียนที่ชำระ</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. การแก้ไขข้อกำหนด</h2>
                <p className="text-gray-600 mb-8">
                  English Korat ขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดและเงื่อนไขนี้เป็นครั้งคราว 
                  โดยจะแจ้งให้ทราบล่วงหน้าอย่างน้อย 30 วัน การใช้บริการต่อไปถือว่ายอมรับการเปลี่ยนแปลง
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. ข้อพิพาทและกฎหมายที่ใช้</h2>
                <p className="text-gray-600 mb-8">
                  ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย หากเกิดข้อพิพาท จะพยายามแก้ไขโดยการเจรจา 
                  หากไม่สามารถแก้ไขได้ จะใช้ศาลไทยเป็นผู้วินิจฉัย
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. ข้อมูลติดต่อ</h2>
                <p className="text-gray-600 mb-4">
                  หากมีคำถามเกี่ยวกับข้อกำหนดการใช้งาน กรุณาติดต่อ:
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
                <div className="bg-amber-50 p-6 rounded-2xl mb-8">
                  <h2 className="text-2xl font-bold text-amber-800 mb-4">Important Information</h2>
                  <p className="text-amber-700">
                    Using English Korat services means you accept these terms and conditions. 
                    Please read carefully before using our services.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 mb-8">
                  By accessing or using English Korat services, you acknowledge that you have read, understood, 
                  and agree to be bound by these terms and conditions. If you do not accept these terms, 
                  please do not use our services.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Our Services</h2>
                <p className="text-gray-600 mb-4">
                  English Korat provides English language education services including:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>Various types of English courses</li>
                  <li>Group and individual tutoring services</li>
                  <li>Online and in-person learning</li>
                  <li>Learning materials and tests</li>
                  <li>Special activities and seminars</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registration and Payment</h2>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Registration:</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-1">
                  <li>Must provide accurate and complete information</li>
                  <li>Verify identity with relevant documents</li>
                  <li>Accept level assessment test (if necessary)</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-800 mb-3">Payment:</h3>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-1">
                  <li>Pay tuition fees in advance as specified</li>
                  <li>Paid tuition fees are non-refundable except in special cases</li>
                  <li>Installment payments must be pre-approved</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Class Attendance Rules</h2>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>Students must attend classes on time and participate regularly</li>
                  <li>More than 3 consecutive absences may result in suspension</li>
                  <li>Must comply with institute regulations</li>
                  <li>Respect teachers and fellow students</li>
                  <li>Take care of equipment and facilities</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellation and Refunds</h2>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Cancellation by Student:</h3>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-1">
                  <li>Give at least 7 days advance notice</li>
                  <li>If less than 25% completed, 50% refund possible</li>
                  <li>If more than 25% completed, no refund available</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-800 mb-3">Cancellation by Institute:</h3>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-1">
                  <li>Insufficient enrollment</li>
                  <li>Emergency or unusual circumstances</li>
                  <li>Full refund or transfer to another course</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
                <p className="text-gray-600 mb-4">
                  All teaching content including:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>Curriculum, documents, and learning materials</li>
                  <li>Specialized teaching methods and techniques</li>
                  <li>Tests and assessments</li>
                  <li>Digital and online media</li>
                </ul>
                <p className="text-gray-600 mb-8">
                  Are the property of English Korat. Students cannot copy, distribute, 
                  or use for commercial purposes without permission.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Liability and Limitations</h2>
                <p className="text-gray-600 mb-4">
                  English Korat will do its best to provide services, but:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                  <li>Does not guarantee specific learning outcomes</li>
                  <li>Not responsible for indirect damages</li>
                  <li>Not responsible for service interruptions due to force majeure</li>
                  <li>Liability limited to the amount of tuition paid</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Terms Modification</h2>
                <p className="text-gray-600 mb-8">
                  English Korat reserves the right to modify these terms and conditions from time to time, 
                  with at least 30 days advance notice. Continued use of services constitutes acceptance of changes.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disputes and Governing Law</h2>
                <p className="text-gray-600 mb-8">
                  These terms are governed by Thai law. In case of disputes, we will attempt to resolve through negotiation. 
                  If resolution is not possible, Thai courts will have jurisdiction.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have questions about these terms of service, please contact:
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
            {language === 'th' ? 'พร้อมเริ่มเรียนแล้ว?' : 'Ready to Start Learning?'}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {language === 'th' 
              ? 'เมื่อคุณเข้าใจข้อกำหนดแล้ว มาเริ่มต้นเปลี่ยนแปลงชีวิตกับเราไปด้วยกัน'
              : 'Now that you understand the terms, let\'s start transforming your life together'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              href="/public/student/new" 
              variant="primary"
              className="px-8 py-4 text-lg font-semibold"
            >
              🚀 {language === 'th' ? 'สมัครเรียน' : 'Register Now'}
            </Button>
            <Button 
              href="/contact"
              variant="outline" 
              className="px-8 py-4 text-lg"
            >
              📞 {t.contactUs}
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
