import React, { JSX, useEffect } from "react";

type Session = {
  start_time: string;
  // add other session fields if needed
};

type Name = {
  nickname_en?: string;
  first_en?: string;
  // add other name fields if needed
};

type Teacher = {
  id: string | number;
  name: Name;
  sessions?: Session[];
  // add other teacher fields if needed
};

type Props = {
  date: string | Date;
  teachers: Teacher[];
  onClose: () => void;
};

export default function CompactDayViewModal({
  date,
  teachers,
  onClose,
}: Props): JSX.Element {
  useEffect(() => {
    // ปิด scroll ของ body ตอน modal เปิด
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Close on Escape for better accessibility
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Time slots (08:00 - 19:00 step 30 นาที)
  const timeSlots = Array.from({ length: (19 - 8 + 1) * 2 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  // Ensure date is rendered as a string for React
  const formattedDate = typeof date === "string" ? date : date.toLocaleDateString();

  const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* พื้นหลังมืด */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={handleOverlayKeyDown}
      ></div>

        <div className="p-4 border-b flex justify-between items-center bg-gray-100">
          <h2 className="font-bold text-lg text-gray-800">
            ตารางเรียน (Overview) วันที่ {formattedDate}
          </h2>
          <button
            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-semibold"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {/* ตาราง */}
        <div className="flex-1">
          <table className="w-full h-full border border-gray-400 border-collapse table-fixed text-[12px]">
            <thead className="bg-white">
              <tr>
                <th className="border border-gray-400 p-2 w-[60px] text-center font-bold bg-gray-100">
                  เวลา
                </th>
                {teachers.map((t) => (
                  <th
                    key={t.id}
                    className="border border-gray-400 text-center font-semibold whitespace-nowrap bg-gray-100"
                  >
                    {t.name.nickname_en || t.name.first_en}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} style={{ height: `${100 / timeSlots.length}%` }}>
                  <td className="border border-gray-400 text-center font-medium bg-gray-50">
                    {time}
                  </td>
                  {teachers.map((t) => {
                    const hasSession = t.sessions?.some(
                      (s) => s.start_time === time
                    );
                    return (
                      <td
                        key={t.id}
                        className={`border border-gray-400 text-center ${
                          hasSession ? "bg-indigo-100" : "bg-white"
                        }`}
                      >
                        {hasSession ? "●" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
