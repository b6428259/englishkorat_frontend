"use client";

import Button from "@/components/common/Button";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectItem, Switch } from "@heroui/react";
import { useState } from "react";

export default function LinePage() {
  const { t } = useLanguage();
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedTime, setSelectedTime] = useState("11:00");

  const times = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const handleSave = () => {
    alert(`แจ้งเตือน: ${isEnabled ? "เปิด" : "ปิด"} / เวลา: ${selectedTime}`);
  };

  return (
    <SidebarLayout breadcrumbItems={[{ label: t.lineOA }]}>
      <div className="space-y-6 p-6 bg-white rounded-lg shadow-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Line OA</h1>

        {/* แถวเวลา + ปุ่มเปิดปิด */}
        <div className="flex justify-between items-center border rounded-lg p-4 bg-gray-50">
          {/* ฝั่งซ้าย: เลือกเวลา */}
          <div className="flex items-center gap-4">
            <p className="text-base font-medium text-gray-700 whitespace-nowrap">
              เวลาที่ต้องการให้แจ้งเตือนลูกค้า:
            </p>
            <Select
              aria-label="เลือกเวลาแจ้งเตือน"
              selectedKeys={[selectedTime]}
              onSelectionChange={(keys) =>
                setSelectedTime(Array.from(keys)[0] as string)
              }
              isDisabled={!isEnabled}
              className="w-[140px]"
              size="sm"
            >
              {times.map((time) => (
                <SelectItem key={time}>
                  {time} น.
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* ฝั่งขวา: ปุ่มสวิตช์ */}
          <div className="flex items-center gap-2">
            <p className="text-base font-medium text-gray-700">
              เปิดการแจ้งเตือนคลาสอัตโนมัติ
            </p>
            <Switch
              size="sm"
              isSelected={isEnabled}
              onValueChange={setIsEnabled}
              color="success"
            >
              {isEnabled ? "เปิด" : "ปิด"}
            </Switch>
          </div>
        </div>

        {/* คำอธิบายเพิ่มเติม */}
        <p className="text-sm text-gray-500">
          ระบบจะส่งข้อความแจ้งเตือนก่อนคลาสตามเวลาที่คุณกำหนด
        </p>

        {/* ปุ่มบันทึก */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/80 transition"
          >
            บันทึกการตั้งค่า
          </Button>
        </div>
      </div>
    </SidebarLayout>
  );
}
