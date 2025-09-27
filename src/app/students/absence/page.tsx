"use client";

import React, { useEffect, useState } from "react";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/common/Button";

// Mock data: คลาสที่นักเรียนลงทะเบียน
// const classes = [
//   {
//     id: 1,
//     subject: "English Conversation",
//     teacher: "Alec",
//     members: 5,
//     datetime: "2025-09-27T18:00",
//     room: "Online (Zoom)",
//     branch: "สาขา 1",
//   },
//   {
//     id: 2,
//     subject: "IELTS Preparation",
//     teacher: "Angie",
//     members: 3,
//     datetime: "2025-09-29T10:00",
//     room: "ห้อง 202",
//     branch: "สาขา 2",
//   },
//   {
//     id: 3,
//     subject: "IELTS Preparation",
//     teacher: "Angie",
//     members: 3,
//     datetime: "2025-09-29T14:00",
//     room: "ห้อง 202",
//     branch: "สาขา 2",
//   },
// ];

export default function StudentsAbsencePage() {
  const { t } = useLanguage();

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [absenceHistory, setAbsenceHistory] = useState<any[]>([]);

  // โหลด Schedule ของนักเรียน
  async function fetchSchedules() {
    try {
      const res = await fetch("/api/schedules/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  }

  // โหลดประวัติการลา
  async function fetchAbsenceHistory() {
    try {
      const res = await fetch("/api/absences", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch absences");
      const data = await res.json();
      setAbsenceHistory(data);
    } catch (err) {
      console.error("Error fetching absences:", err);
    }
  }

  useEffect(() => {
    fetchSchedules();
    fetchAbsenceHistory();
  }, []);

  // ✅ ดึงวันทั้งหมดที่มีคลาส
  const availableDates = Array.from(
    new Set(
      classes
        .filter((c) => c.session_date)
        .map((c) => new Date(c.session_date).toISOString().split("T")[0])
    )
  );

  // ✅ ฟิลเตอร์คลาสตามวันที่เลือก
  const availableTimes = classes.filter(
    (c) =>
      c.session_date &&
      new Date(c.session_date).toISOString().split("T")[0] === selectedDate
  );

  // ส่งคำขอลา
  const handleSubmit = async () => {
    if (!selectedClass) return;

    const payload = {
      group_id: selectedClass.schedule.group_id,
      session_id: selectedClass.id,
      reason: reason === "other" ? otherReason : reason,
    };

    try {
      const res = await fetch("/api/absences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`❌ ลาไม่สำเร็จ: ${errData.error}`);
        return;
      }

      alert("✅ ส่งคำขอลาเรียบร้อย");
      setSelectedClass(null);
      setReason("");
      setOtherReason("");
      fetchAbsenceHistory(); // รีโหลดประวัติลา
    } catch (err) {
      console.error("Error submitting absence:", err);
    }
  }


  //   alert(
  //     `ส่งคำขอลาเรียน\nวิชา: ${chosenClass?.subject}\nวันเวลา: ${selectedDate} ${selectedTime}\nเหตุผล: ${
  //       reason === "other" ? otherReason : reason
  //     }`
  //   );
  //   setSelectedClass(null);
  // };

  return (
    <SidebarLayout breadcrumbItems={[{ label: t.studentAbsence }]}>
      <div className="space-y-4 p-6 bg-white rounded-lg shadow-md w-full">
        <h1 className="text-2xl font-bold text-black mb-4">
          {t.studentAbsence || "Absence Request"}
        </h1>

        {/* การ์ดคลาส */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div
              key={c.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition bg-gray-50 flex flex-col justify-between"
            >
              <div className="space-y-1 mb-4">
                <h2 className="text-lg font-bold text-gray-800">{c.schedule?.schedule_name}</h2>
                <p className="text-sm text-gray-600">
                  <strong>{t.teacher}:</strong> {c.assigned_teacher?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>{t.date}:</strong>{" "}
                  {new Date(c.session_date).toLocaleDateString("th-TH")}
                </p>
                {/* <p className="text-sm text-gray-600">
                  <strong>{t.groupMembers}:</strong> {c.members} {t.members}
                </p> */}
              </div>
              <Button size="sm" variant="primary" onClick={() => {
                  setSelectedClass(c);
                  setSelectedDate(new Date(c.session_date).toISOString().split("T")[0]);
                  setSelectedTime(new Date(c.start_time).toISOString().split("T")[1]);
                }}>
                {t.studentAbsence}
              </Button>
            </div>
          ))}
        </div>

        {/* Popup ฟอร์ม */}
        {selectedClass && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg">
            <div className="bg-white rounded-lg shadow-2xl p-6 border">
              <h2 className="text-xl font-bold mb-4">{t.absenceRequestForm}</h2>

              {/* เลือกวัน */}
              {/* <label className="block mb-2 font-medium">{t.dateOfAbsence}</label>
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime("");
                }}
                className="w-full border rounded p-2 mb-3"
              >
                <option value="">-- {t.selectDate} --</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString("th-TH", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </option>
                ))}
              </select> */}

              {/* เลือกเวลา */}
              {/* {selectedDate && (
                <>
                  <label className="block mb-2 font-medium">{t.timeOfClass}</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full border rounded p-2 mb-3"
                  >
                    <option value="">-- {t.selectTime} --</option>
                    {availableTimes.map((c) => (
                      <option key={c.id} value={c.datetime.split("T")[1]}>
                        {new Date(c.datetime).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </option>
                    ))}
                  </select>
                </>
              )} */}

              {/* เหตุผล */}
              <label className="block mb-2 font-medium">{t.reason}</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border rounded p-2 mb-3"
              >
                <option value="reason">-- {t.reason} --</option>
                <option value="sick">{t.sick}</option>
                <option value="personal">{t.personal}</option>
                <option value="travel">{t.travel}</option>
                <option value="family">{t.emergency}</option>
                <option value="other">{t.other}</option>
              </select>

              {reason === "other" && (
                <textarea
                  placeholder="กรุณากรอกเหตุผล"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="w-full border rounded p-2 mb-3"
                />
              )}

              {/* ปุ่ม */}
              <div className="flex justify-end gap-3">
                <Button size="sm" variant="cancel" onClick={() => setSelectedClass(null)}>
                  ยกเลิก
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSubmit}
                  // disabled={!selectedDate || !selectedTime || !reason}
                  disabled={!reason || (reason === "other" && !otherReason)}
                >
                  ยืนยันการลา
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ตารางประวัติการลา */}
<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">
    {t.absenceHistory || "ประวัติการลา"}
  </h2>
  <table className="w-full border">
    <thead>
      <tr className="bg-gray-100">
        <th className="border p-2">{t.date}</th>
        <th className="border p-2">{t.class}</th>
        <th className="border p-2">{t.reason}</th>
        <th className="border p-2">{t.status}</th>
      </tr>
    </thead>
    <tbody>
      {absenceHistory.length > 0 ? (
        absenceHistory.map((a) => (
          <tr key={a.id}>
            <td className="border p-2">
              {new Date(a.session.session_date).toLocaleDateString("th-TH")}
            </td>
            <td className="border p-2">{a.session.schedule.schedule_name}</td>
            <td className="border p-2">{a.reason}</td>
            <td className="border p-2">
              {a.status === "approved" && <span className="text-green-600">อนุมัติ</span>}
              {a.status === "pending" && <span className="text-yellow-600">รออนุมัติ</span>}
              {a.status === "rejected" && <span className="text-red-600">ไม่อนุมัติ</span>}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td className="text-center p-4" colSpan={4}>
            {t.noAbsenceRecord || "ยังไม่มีการลา"}
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      </div>
    </SidebarLayout>
  );
}
