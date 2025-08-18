import SidebarLayout from '../../components/common/SidebarLayout';

export default function ProfilePage() {
  return (
    <SidebarLayout title="โปรไฟล์ - English Korat" description="จัดการข้อมูลส่วนตัว">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">โปรไฟล์</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">ข้อมูลส่วนตัว</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder="กรุณากรอกชื่อ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder="กรุณากรอกนามสกุล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder="กรุณากรอกอีเมล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder="กรุณากรอกเบอร์โทรศัพท์"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
            <button className="px-6 py-2 bg-[#334293] text-white rounded-md hover:bg-[#2a3875] transition-colors">
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

// Metadata สำหรับ SEO
export const metadata = {
  title: 'โปรไฟล์ - English Korat',
  description: 'จัดการข้อมูลส่วนตัวของคุณ',
};