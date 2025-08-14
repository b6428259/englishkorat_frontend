import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/common/Layout';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">แดชบอร์ด</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ยินดีต้อนรับ!</h2>
          <p className="text-gray-600">คุณได้เข้าสู่ระบบเรียบร้อยแล้ว</p>
          
          {/* ส่วนที่จะแสดงข้อมูลผู้ใช้และฟีเจอร์ต่างๆ */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">เมนูหลัก</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-800">คอร์สเรียน</h4>
                <p className="text-sm text-gray-600 mt-1">จัดการคอร์สเรียนของคุณ</p>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-800">ตารางเรียน</h4>
                <p className="text-sm text-gray-600 mt-1">ดูตารางเรียนและการนัดหมาย</p>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-800">โปรไฟล์</h4>
                <p className="text-sm text-gray-600 mt-1">จัดการข้อมูลส่วนตัว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Metadata สำหรับ SEO
export const metadata = {
  title: 'แดชบอร์ด - English Korat',
  description: 'แดshboard หลักของระบบ English Korat',
};
