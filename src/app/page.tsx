import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-[#334293] shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center">
              <Image
                src="/icons/logo.png"
                alt="English Korat Logo"
                width={40}
                height={40}
                className="object-contain h-25 w-28"
                priority
              />
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-20">
              <Link href="/" className="text-[#EFE957] hover:text-[#EFD157] transition-colors hover:scale-105">
                หน้าแรก
              </Link>
              <Link href="/courses" className="text-[#EFE957] hover:text-[#EFD157] transition-colors hover:scale-105">
                คอร์สเรียน
              </Link>
              <Link href="/about" className="text-[#EFE957] hover:text-[#EFD157] transition-colors hover:scale-105">
                เกี่ยวกับเรา
              </Link>
              <Link href="/contact" className="text-[#EFE957] hover:text-[#EFD157] transition-colors hover:scale-105">
                ติดต่อ
              </Link>
            </nav>

            {/* Mascot + Login Button */}
            <div className="flex items-center space-x-8">
              <Image 
                src="/mascot.png" 
                alt="Mascot"
                width={120}
                height={100}
                className="hidden sm:block"
              />
              <Link 
                href="/auth"
                className="bg-[#EFE957] hover:bg-[#EFD157] text-[#334293] px-6 py-2 rounded-3xl transition-colors shadow-md hover:shadow-lg hover:scale-105"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </header>


      {/* Hero Section */}
      <section className="relative py-10 px-4 overflow-hidden flex justify-center">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 pr-12">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  English Korat
                  <span className="block text-[#334293]">เราทำให้คุณพูดได้</span>
                </h1>
                <p className="text-xl text-gray-600 mt-6">
                  ที่เรียนที่ดีที่สุด สำหรับคนที่ <span className="text-[#334293] font-semibold">#อ่อนภาษาอังกฤษ</span>
                  <br />
                  เปลี่ยนชีวิตหลังเรียน ใน <span className="text-red-500 font-bold">3 เดือน ‼️</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#334293] hover:bg-[#EFE957] text-white hover:text-[#334293] px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  เริ่มเรียนวันนี้
                </button>
                <button className="border-2 border-[#334293] text-[#334293] hover:bg-[#EFE957] hover:text-[#334293] px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105">
                  ดูคอร์สเรียน
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <img 
                      src="/icons/follower.png" 
                      alt="Follower" 
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">24,705+</p>
                    <p className="text-sm text-gray-600">ผู้ติดตาม</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <img 
                      src="/icons/graduate.png"
                      alt="Follower" 
                      className="w-8 h-8"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">1000+</p>
                    <p className="text-sm text-gray-600">นักเรียนสำเร็จ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <Image
              src="/promotion-banner.jpg"
              alt="promotion-banner"
              width={600}
              height={450}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ทำไมต้องเลือก English Korat?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              เรามีวิธีการสอนที่เป็นเอกลักษณ์ที่จะทำให้คุณพูดภาษาอังกฤษได้อย่างมั่นใจ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">เปลี่ยนชีวิตใน 3 เดือน</h3>
              <p className="text-gray-600">
                วิธีการสอนที่พิสูจน์แล้วว่าสามารถทำให้คุณพูดภาษาอังกฤษได้ในเวลาอันสั้น
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">เหมาะสำหรับคนอ่อนภาษา</h3>
              <p className="text-gray-600">
                เราเข้าใจปัญหาของคนไทยที่เรียนภาษาอังกฤษ และมีวิธีแก้ไขที่ตรงจุด
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">ผลลัพธ์ที่รับประกันได้</h3>
              <p className="text-gray-600">
                มีนักเรียนกว่า 24,000+ คนที่ประสบความสำเร็จกับเรา
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            พร้อมเปลี่ยนชีวิตด้วยภาษาอังกฤษแล้วหรือยัง?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            เข้าร่วมกับนักเรียนกว่า 24,000+ คนที่ประสบความสำเร็จกับเรา
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg">
              ลงทะเบียนเรียน
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
              ดูรายละเอียดเพิ่มเติม
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold mb-4">English Korat</h3>
              <p className="text-gray-400 mb-4">
                เราทำให้คุณพูดได้ - สถาบันสอนภาษาอังกฤษที่ดีที่สุดในโคราช
              </p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/learningenglishkorat" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">เมนู</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link></li>
                <li><Link href="/courses" className="hover:text-white transition-colors">คอร์สเรียน</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">เกี่ยวกับเรา</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">ติดต่อ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">ติดต่อเรา</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📍 นครราชสีมา (โคราช)</li>
                <li>📞 โทร: 063-762-3059</li>
                <li>✉️ thanida09@gmail.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 English Korat. สงวนลิขสิทธิ์.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}