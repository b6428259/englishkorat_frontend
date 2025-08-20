"use client"

import React from 'react';
import { Select, TeacherTypeSelector, TimeSlotSelector } from '../forms';

interface TimeSlot {
  id: string;
  day: string;
  timeFrom: string;
  timeTo: string;
}

// Example component to showcase the new form components
export const FormComponentsShowcase: React.FC = () => {
  const [selectValue, setSelectValue] = React.useState('');
  const [teacherType, setTeacherType] = React.useState('');
  const [preferredSlots, setPreferredSlots] = React.useState<TimeSlot[]>([]);
  const [unavailableSlots, setUnavailableSlots] = React.useState<TimeSlot[]>([]);

  const selectOptions = [
    { value: '', label: 'เลือกตัวเลือก', disabled: true },
    { value: 'option1', label: 'ตัวเลือกที่ 1' },
    { value: 'option2', label: 'ตัวเลือกที่ 2' },
    { value: 'option3', label: 'ตัวเลือกที่ 3' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Form Components Showcase</h1>

      {/* Enhanced Select */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Enhanced Select Component</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Select</label>
            <Select
              options={selectOptions}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              placeholder="เลือกตัวเลือกของคุณ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Select</label>
            <Select
              variant="secondary"
              options={selectOptions}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              size="lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Error State</label>
            <Select
              options={selectOptions}
              value=""
              onChange={(e) => setSelectValue(e.target.value)}
              error={true}
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* Teacher Type Selector */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Teacher Type Selector</h2>
        <TeacherTypeSelector
          value={teacherType}
          onChange={setTeacherType}
          language="th"
        />
      </section>

      {/* Time Slot Selectors */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Time Slot Selectors (Enhanced with Bulk Selection)</h2>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">🚀 ฟีเจอร์ใหม่!</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>โหมดเลือกหลายวัน</strong>: เลือกหลายวันพร้อมกันด้วยเวลาเดียวกัน</li>
            <li>• <strong>Quick Select</strong>: เลือกทั้งหมด, วันจันทร์-ศุกร์, วันเสาร์-อาทิตย์</li>
            <li>• <strong>Visual Day Picker</strong>: เลือกวันแบบ visual กับปุ่มสวยๆ</li>
            <li>• <strong>Smart Validation</strong>: ป้องกันเวลาที่ไม่ถูกต้อง</li>
          </ul>
        </div>
        
        <TimeSlotSelector
          value={preferredSlots}
          onChange={setPreferredSlots}
          title="วันเวลาที่ต้องการเรียน"
          description="⭐ ลองใช้โหมด 'เลือกหลายวันพร้อมกัน' เพื่อเลือกหลายวันด้วยเวลาเดียวกัน!"
          language="th"
          maxSlots={7}
        />

        <TimeSlotSelector
          value={unavailableSlots}
          onChange={setUnavailableSlots}
          title="วันเวลาที่ไม่ว่าง"
          description="สามารถใช้ปุ่ม 'วันจันทร์-ศุกร์' หรือ 'วันเสาร์-อาทิตย์' เพื่อเลือกเร็วขึ้น"
          language="th"
          maxSlots={5}
        />
      </section>

      {/* Values Display */}
      <section className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Current Values:</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Select Value:</strong> {selectValue || 'Not selected'}</div>
          <div><strong>Teacher Type:</strong> {teacherType || 'Not selected'}</div>
          <div><strong>Preferred Slots:</strong> {preferredSlots.length} slots</div>
          <div><strong>Unavailable Slots:</strong> {unavailableSlots.length} slots</div>
        </div>
      </section>
    </div>
  );
};
