"use client";

import SidebarLayout from "@/components/common/SidebarLayout";
import { useParams } from "next/navigation";

// ---- Mock Data ----
const teachers = [
  { id: 1, name: "Alec", type: "weekly", rate: 500, socialSecurity: true },
  { id: 2, name: "Angie", type: "weekly", rate: 500, socialSecurity: false },
];

const teachingHistory = [
  { teacherId: 1, date: "2025-09-01", class: "IELTS", hours: 2 }, // Monday
  { teacherId: 1, date: "2025-09-02", class: "TOEIC", hours: 3 },
  { teacherId: 1, date: "2025-09-08", class: "Conversation", hours: 2 }, // next week
  { teacherId: 2, date: "2025-09-03", class: "Business English", hours: 2 },
];

// ---- Helper: หาว่าสัปดาห์ไหน ----
function getWeekKey(dateStr: string) {
  const d = new Date(dateStr);
  // year-weekNumber
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDays = Math.floor(
    (d.getTime() - firstDayOfYear.getTime()) / 86400000
  );
  const week = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export default function SalaryDetailPage() {
  const params = useParams();
  const teacherId = Number(params?.id) || 1;

  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher) return <div>ไม่พบข้อมูลครู</div>;

  // filter class ของครู
  const history = teachingHistory.filter((h) => h.teacherId === teacherId);

  // group by week
  const grouped: Record<string, typeof history> = {};
  history.forEach((h) => {
    const key = getWeekKey(h.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(h);
  });

  return (
    <SidebarLayout breadcrumbItems={[{ label: "รายละเอียดค่าจ้างครู" }]}>
      <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">
          ค่าจ้างรายสัปดาห์: {teacher.name}
        </h1>

        {Object.entries(grouped).map(([week, records]) => {
          const totalHours = records.reduce((s, r) => s + r.hours, 0);
          const totalPay = totalHours * (teacher.rate ?? 0);

          return (
            <div key={week} className="border rounded-lg p-4 bg-gray-50">
              <h2 className="font-semibold mb-2">{week}</h2>
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">วันที่</th>
                    <th className="p-2 text-left">คลาส</th>
                    <th className="p-2 text-center">ชั่วโมง</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{r.date}</td>
                      <td className="p-2">{r.class}</td>
                      <td className="p-2 text-center">{r.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-2 font-medium">
                รวม: {totalHours} ชั่วโมง × {teacher.rate}฿ ={" "}
                <span className="font-bold">{totalPay.toLocaleString()} ฿</span>
              </div>
            </div>
          );
        })}
      </div>
    </SidebarLayout>
  );
}
