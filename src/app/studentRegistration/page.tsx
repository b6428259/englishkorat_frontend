import SidebarLayout from '../../components/common/SidebarLayout';

export default function StudentRegistrationPage() {
  return (
    <SidebarLayout title="ลงทะเบียนนักเรียน - English Korat" description="ลงทะเบียนนักเรียนใหม่">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">ลงทะเบียนนักเรียน</h1>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">ข้อมูลส่วนตัว</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder="กรุณากรอกชื่อ"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder="กรุณากรอกนามสกุล"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เพศ</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]">
                  <option value="">เลือกเพศ</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">ข้อมูลติดต่อ</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder="กรุณากรอกอีเมล"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  placeholder="กรุณากรอกเบอร์โทรศัพท์"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                  rows={3}
                  placeholder="กรุณากรอกที่อยู่"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ระดับภาษาอังกฤษ</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]">
                  <option value="">เลือกระดับ</option>
                  <option value="beginner">เริ่มต้น (Beginner)</option>
                  <option value="elementary">พื้นฐาน (Elementary)</option>
                  <option value="intermediate">ปานกลาง (Intermediate)</option>
                  <option value="upper-intermediate">ปานกลาง-สูง (Upper-Intermediate)</option>
                  <option value="advanced">สูง (Advanced)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Course Preferences */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">ความต้องการเรียน</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">ประเภทคอร์สที่สนใจ (เลือกได้หลายอัน)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>การสนทนาทั่วไป (General Conversation)</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>ภาษาอังกฤษเพื่อธุรกิจ (Business English)</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>การเตรียมสอบ TOEIC/IELTS</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>ไวยากรณ์และการเขียน</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เหตุผลในการเรียนภาษาอังกฤษ</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#334293]"
                rows={4}
                placeholder="กรุณาอธิบายเหตุผลและเป้าหมายในการเรียน"
              />
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button 
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-[#334293] text-white rounded-md hover:bg-[#2a3875] transition-colors"
            >
              ลงทะเบียน
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
