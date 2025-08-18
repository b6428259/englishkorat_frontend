import SidebarLayout from '../../components/common/SidebarLayout';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <SidebarLayout title="แดชบอร์ด - English Korat" description="แดshboard หลักของระบบ English Korat">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">แดชบอร์ด</h1>
          
          <div className="bg-gradient-to-r from-[#334293] to-[#4a5cb8] text-white rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-2">ยินดีต้อนรับ!</h2>
            <p className="text-blue-100">คุณได้เข้าสู่ระบบเรียบร้อยแล้ว เริ่มต้นการเรียนรู้ภาษาอังกฤษกับเรา</p>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              href="/courses" 
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#334293] hover:shadow-md transition-all group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#334293] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
                  </svg>
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">คอร์สเรียน</h4>
              <p className="text-sm text-gray-600">จัดการคอร์สเรียนและติดตามความคืบหน้า</p>
            </Link>
            
            <Link 
              href="/schedule" 
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#334293] hover:shadow-md transition-all group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">ตารางเรียน</h4>
              <p className="text-sm text-gray-600">ดูตารางเรียนและการนัดหมายของคุณ</p>
            </Link>
            
            <Link 
              href="/profile" 
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#334293] hover:shadow-md transition-all group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">โปรไฟล์</h4>
              <p className="text-sm text-gray-600">จัดการข้อมูลส่วนตัวและการตั้งค่า</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">กิจกรรมล่าสุด</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">เข้าสู่ระบบสำเร็จ</p>
                <p className="text-xs text-gray-500">เมื่อสักครู่</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

// Metadata สำหรับ SEO
export const metadata = {
  title: 'แดชบอร์ด - English Korat',
  description: 'แดshboard หลักของระบบ English Korat',
};
