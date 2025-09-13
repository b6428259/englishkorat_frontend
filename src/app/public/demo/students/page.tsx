"use client"

import React, { useState } from 'react';

// Mock student data for demonstration
const mockStudents = [
  {
    id: 1,
    first_name: "สมชาย",
    last_name: "ใจดี",
    nickname_th: "ชาย",
    phone: "0812345678",
    email: "somchai@email.com",
    registration_status: "pending_review",
    registration_type: "quick",
    citizen_id: "",
    age: 25
  },
  {
    id: 2,
    first_name: "สุภาพร",
    last_name: "สวยงาม",
    nickname_th: "ปอ",
    phone: "0823456789",
    email: "supaporn@email.com",
    registration_status: "schedule_exam",
    registration_type: "full",
    citizen_id: "1234567890123",
    age: 22
  },
  {
    id: 3,
    first_name: "กิตติชัย",
    last_name: "มาดี",
    nickname_th: "กิ๊ต",
    phone: "0834567890",
    email: "kittchai@email.com",
    registration_status: "waiting_for_group",
    registration_type: "full",
    citizen_id: "2345678901234",
    age: 20,
    grammar_score: 85,
    speaking_score: 78,
    listening_score: 82,
    reading_score: 88,
    writing_score: 80
  }
];

type RegistrationStatus = 'pending_review' | 'schedule_exam' | 'waiting_for_group' | 'active';

export default function StudentsDemo() {
  const [activeTab, setActiveTab] = useState<RegistrationStatus>('pending_review');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [language] = useState('th'); // Fixed to Thai for demo

  const statusTabs = [
    {
      key: 'pending_review' as RegistrationStatus,
      label: 'รอตรวจสอบ',
      description: 'นักเรียนที่ลงทะเบียนใหม่ รอการตรวจสอบและกรอกข้อมูลเพิ่มเติม',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      key: 'schedule_exam' as RegistrationStatus,
      label: 'จัดสอบ',
      description: 'นักเรียนที่พร้อมทำการสอบ placement test',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      key: 'waiting_for_group' as RegistrationStatus,
      label: 'รอจัดกลุ่ม',
      description: 'นักเรียนที่ทำการสอบแล้ว รอการจัดเข้ากลุ่มเรียน',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      key: 'active' as RegistrationStatus,
      label: 'ใช้งานอยู่',
      description: 'นักเรียนที่จัดเข้ากลุ่มแล้วและเรียนอยู่',
      color: 'bg-green-100 text-green-800 border-green-200'
    }
  ];

  const getActionText = (status: RegistrationStatus) => {
    switch (status) {
      case 'pending_review':
        return 'ตรวจสอบและกรอกข้อมูล';
      case 'schedule_exam':
        return 'บันทึกคะแนนสอบ';
      case 'waiting_for_group':
        return 'จัดเข้ากลุ่ม';
      case 'active':
        return 'ดูรายละเอียด';
      default:
        return 'จัดการ';
    }
  };

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    if (activeTab === 'pending_review') {
      setShowEditForm(true);
    } else if (activeTab === 'schedule_exam') {
      setShowExamForm(true);
    }
  };

  const filteredStudents = mockStudents.filter(student => student.registration_status === activeTab);

  const renderEditForm = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">
          ตรวจสอบและกรอกข้อมูลนักเรียน
        </h2>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                ข้อมูลที่จำเป็น
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  เลขบัตรประชาชนเป็นข้อมูลที่จำเป็นต้องกรอก เมื่อบันทึกสำเร็จ สถานะจะเปลี่ยนเป็น "จัดสอบ"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            ชื่อ
          </label>
          <input 
            type="text" 
            value={selectedStudent?.first_name || ''} 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
            readOnly
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            นามสกุล
          </label>
          <input 
            type="text" 
            value={selectedStudent?.last_name || ''} 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
            readOnly
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-black mb-2">
            เลขบัตรประชาชน *
          </label>
          <input 
            type="text" 
            placeholder="กรุณากรอกเลขบัตรประชาชน 13 หลัก"
            className="w-full border border-red-300 rounded-lg px-3 py-2 text-black bg-red-50"
          />
          <p className="text-red-600 text-sm mt-1">
            กรุณากรอกเลขบัตรประชาชน
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 mt-6">
        <button 
          onClick={() => setShowEditForm(false)}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          ยกเลิก
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          บันทึก
        </button>
      </div>
    </div>
  );

  const renderExamForm = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">
          บันทึกคะแนนสอบ
        </h2>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-black mb-2">
            ข้อมูลนักเรียน
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-black">
                ชื่อ: 
              </span>
              <span className="ml-2 text-black">
                {selectedStudent?.first_name} {selectedStudent?.last_name}
              </span>
            </div>
            <div>
              <span className="font-medium text-black">
                ชื่อเล่น: 
              </span>
              <span className="ml-2 text-black">
                {selectedStudent?.nickname_th}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { key: 'grammar', label: 'คะแนนไวยากรณ์' },
          { key: 'speaking', label: 'คะแนนการพูด' },
          { key: 'listening', label: 'คะแนนการฟัง' },
          { key: 'reading', label: 'คะแนนการอ่าน' },
          { key: 'writing', label: 'คะแนนการเขียน' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-black mb-2">
              {label}
            </label>
            <input 
              type="number" 
              min="0" 
              max="100"
              placeholder="0-100"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
            />
          </div>
        ))}
        
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            คะแนนเฉลี่ย
          </label>
          <div className="p-3 border rounded-lg bg-gray-50 text-center text-green-600">
            <span className="text-2xl font-bold">75</span>
            <span className="text-sm ml-1">/ 100</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              หมายเหตุ
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                เมื่อบันทึกคะแนนสำเร็จ สถานะของนักเรียนจะเปลี่ยนเป็น "รอจัดกลุ่ม" โดยอัตโนมัติ
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 mt-6">
        <button 
          onClick={() => setShowExamForm(false)}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          ยกเลิก
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          บันทึกคะแนน
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black mb-2">
            จัดการนักเรียน - Demo
          </h1>
          <p className="text-gray-600">
            แสดงตัวอย่างระบบจัดการนักเรียนตามสถานะการลงทะเบียน
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">
              ข้อมูลการใช้งาน
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                ระบบนี้แสดงการจัดการนักเรียนใน 4 สถานะ: รอตรวจสอบ → จัดสอบ → รอจัดกลุ่ม → ใช้งานอยู่
              </p>
              <p className="mt-1">
                <strong>รอตรวจสอบ:</strong> ต้องกรอกเลขบัตรประชาชน | <strong>จัดสอบ:</strong> บันทึกคะแนนสอบ 5 ด้าน | <strong>รอจัดกลุ่ม:</strong> จัดเข้ากลุ่มเรียน
              </p>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex space-x-8 px-6 py-4" aria-label="Tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${tab.color}`}>
                  {filteredStudents.length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Students Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-black">
                {statusTabs.find(t => t.key === activeTab)?.label}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusTabs.find(t => t.key === activeTab)?.description}
              </p>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="mt-2 text-sm font-medium text-black">
                  ไม่มีนักเรียน
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  ไม่มีนักเรียนในสถานะ "{statusTabs.find(t => t.key === activeTab)?.label}"
                </p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        นักเรียน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ติดต่อ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ประเภทการลงทะเบียน
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">การดำเนินการ</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {student.first_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-black">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.nickname_th} • อายุ {student.age}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          <div>{student.phone}</div>
                          <div className="text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            student.registration_type === 'quick' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {student.registration_type === 'quick' ? 'รวดเร็ว' : 'ครบถ้วน'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleStudentClick(student)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {getActionText(activeTab)}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            การดำเนินการด่วน
          </h3>
          <div className="flex flex-wrap gap-2">
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
              เพิ่มนักเรียนใหม่
            </button>
            <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
              ดูรายการทั้งหมด
            </button>
          </div>
        </div>

        {/* Forms */}
        {showEditForm && renderEditForm()}
        {showExamForm && renderExamForm()}
      </div>
    </div>
  );
}