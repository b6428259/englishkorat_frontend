"use client";

import Button from "@/components/common/Button";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface TeacherInfo {
  name?: string | null;
}

interface ScheduleInfo {
  schedule_name?: string | null;
  group_id?: number | null;
}

interface StudentSession {
  id: number;
  session_date?: string | null;
  start_time?: string | null;
  schedule?: ScheduleInfo | null;
  assigned_teacher?: TeacherInfo | null;
}

type AbsenceStatus = "approved" | "pending" | "rejected";

interface AbsenceHistoryRecord {
  id: number;
  session?: {
    session_date?: string | null;
    schedule?: ScheduleInfo | null;
  } | null;
  reason?: string | null;
  status?: AbsenceStatus | string | null;
}

export default function StudentsAbsencePage() {
  const { t } = useLanguage();

  const [selectedClass, setSelectedClass] = useState<StudentSession | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [classes, setClasses] = useState<StudentSession[]>([]);
  const [absenceHistory, setAbsenceHistory] = useState<AbsenceHistoryRecord[]>(
    []
  );

  // โหลด Schedule ของนักเรียน
  async function fetchSchedules() {
    try {
      const res = await fetch("/api/schedules/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const data = (await res.json()) as unknown;
      if (Array.isArray(data)) {
        setClasses(
          data
            .filter(
              (item): item is StudentSession =>
                item !== null && typeof item === "object" && "id" in item
            )
            .map((item) => ({
              id: Number(item.id),
              session_date: (item as StudentSession).session_date ?? null,
              start_time: (item as StudentSession).start_time ?? null,
              schedule: (item as StudentSession).schedule ?? null,
              assigned_teacher:
                (item as StudentSession).assigned_teacher ?? null,
            }))
        );
      } else {
        setClasses([]);
      }
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
      const data = (await res.json()) as unknown;
      if (Array.isArray(data)) {
        setAbsenceHistory(
          data
            .filter(
              (item): item is AbsenceHistoryRecord =>
                item !== null && typeof item === "object" && "id" in item
            )
            .map((item) => ({
              id: Number(item.id),
              session: (item as AbsenceHistoryRecord).session ?? null,
              reason: (item as AbsenceHistoryRecord).reason ?? null,
              status: (item as AbsenceHistoryRecord).status ?? null,
            }))
        );
      } else {
        setAbsenceHistory([]);
      }
    } catch (err) {
      console.error("Error fetching absences:", err);
    }
  }

  useEffect(() => {
    fetchSchedules();
    fetchAbsenceHistory();
  }, []);

  // ส่งคำขอลา
  const handleSubmit = async () => {
    if (!selectedClass) return;

    const groupId = selectedClass.schedule?.group_id;
    if (!groupId) {
      alert("❌ ไม่พบข้อมูลกลุ่มสำหรับคาบเรียนนี้");
      return;
    }

    const payload = {
      group_id: groupId,
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
  };

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
          {classes.map((c) => {
            const sessionDate = c.session_date
              ? new Date(c.session_date)
              : null;
            return (
              <div
                key={c.id}
                className="border rounded-lg p-4 shadow hover:shadow-lg transition bg-gray-50 flex flex-col justify-between"
              >
                <div className="space-y-1 mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    {c.schedule?.schedule_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    <strong>{t.teacher}:</strong> {c.assigned_teacher?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>{t.date}:</strong>{" "}
                    {sessionDate
                      ? sessionDate.toLocaleDateString("th-TH")
                      : "-"}
                  </p>
                  {/* <p className="text-sm text-gray-600">
                  <strong>{t.groupMembers}:</strong> {c.members} {t.members}
                </p> */}
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setSelectedClass(c);
                  }}
                >
                  {t.studentAbsence}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Popup ฟอร์ม */}
        {selectedClass && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg">
            <div className="bg-white rounded-lg shadow-2xl p-6 border">
              <h2 className="text-xl font-bold mb-4">{t.absenceRequestForm}</h2>

              <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                <p className="font-medium text-gray-900">
                  {selectedClass.schedule?.schedule_name}
                </p>
                <p>
                  <strong>{t.date}:</strong>{" "}
                  {selectedClass.session_date
                    ? new Date(selectedClass.session_date).toLocaleString(
                        "th-TH",
                        {
                          dateStyle: "full",
                          timeStyle: selectedClass.start_time
                            ? "short"
                            : undefined,
                        }
                      )
                    : "-"}
                </p>
                {selectedClass.assigned_teacher?.name && (
                  <p>
                    <strong>{t.teacher}:</strong>{" "}
                    {selectedClass.assigned_teacher.name}
                  </p>
                )}
              </div>

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
                <Button
                  size="sm"
                  variant="cancel"
                  onClick={() => setSelectedClass(null)}
                >
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
                absenceHistory.map((a) => {
                  const sessionDate = a.session?.session_date
                    ? new Date(a.session.session_date).toLocaleDateString(
                        "th-TH"
                      )
                    : "-";
                  const scheduleName =
                    a.session?.schedule?.schedule_name ?? "-";
                  const absenceReason = a.reason ?? "-";
                  const status = a.status ?? "pending";

                  return (
                    <tr key={a.id}>
                      <td className="border p-2">{sessionDate}</td>
                      <td className="border p-2">{scheduleName}</td>
                      <td className="border p-2">{absenceReason}</td>
                      <td className="border p-2">
                        {status === "approved" && (
                          <span className="text-green-600">อนุมัติ</span>
                        )}
                        {status === "pending" && (
                          <span className="text-yellow-600">รออนุมัติ</span>
                        )}
                        {status === "rejected" && (
                          <span className="text-red-600">ไม่อนุมัติ</span>
                        )}
                      </td>
                    </tr>
                  );
                })
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
