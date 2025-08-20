"use client";

import { useState } from "react";
import SidebarLayout from "../../components/common/SidebarLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "@/components/common/Button";
import { ButtonGroup } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/react";

interface Schedule {
  courseID: number;
  courseName: string;
  teacherID: string;
  teacherName: string;
  studentID: string;
  studentName: string;
  startTime: string; // '2025-08-19T10:00'
  endTime: string; // '2025-08-19T12:00'
  totalHours: number;
  remainingHours: number;
}

const teachers = [
  { id: "t1", name: "ครูมี" },
  { id: "t2", name: "คอช" },
  { id: "t3", name: "ครูคิด" },
  { id: "t4", name: "T.Perla" },
  { id: "t5", name: "อรยี" },
  { id: "t6", name: "T.Anthony" },
  { id: "t7", name: "ครูนิม" },
  { id: "t8", name: "T.Joy" },
  { id: "t9", name: "ครูปก" },
  { id: "t10", name: "คุณซ" },
  { id: "t11", name: "T.Alec" },
  { id: "t12", name: "T.Angie" },
];

const timeSlots = [
  { hour: 9, label: "9am" },
  { hour: 10, label: "10am" },
  { hour: 11, label: "11am" },
  { hour: 12, label: "12pm" },
  { hour: 13, label: "1pm" },
  { hour: 14, label: "2pm" },
  { hour: 15, label: "3pm" },
  { hour: 16, label: "4pm" },
  { hour: 17, label: "5pm" },
  { hour: 18, label: "6pm" },
];

const testLesson: Schedule[] = [
  {
    courseID: 1,
    courseName: "Conversation A2",
    teacherID: "t1",
    teacherName: "ครูมี",
    studentID: "s1",
    studentName: "Group Adults",
    startTime: "2025-08-19T10:00",
    endTime: "2025-08-19T12:00",
    totalHours: 60,
    remainingHours: 45,
  },
  {
    courseID: 2,
    courseName: "Pre-IELTS",
    teacherID: "t3",
    teacherName: "ครูคิด",
    studentID: "s2",
    studentName: "Online Class",
    startTime: "2025-08-19T17:00",
    endTime: "2025-08-19T18:00",
    totalHours: 30,
    remainingHours: 22,
  },
  {
    courseID: 3,
    courseName: "Personal",
    teacherID: "t5",
    teacherName: "อรยี",
    studentID: "s3",
    studentName: "นักเรียนคนที่ 1",
    startTime: "2025-08-19T10:00",
    endTime: "2025-08-19T18:00",
    totalHours: 10,
    remainingHours: 8,
  },
  {
    courseID: 4,
    courseName: "IELTS Online",
    teacherID: "t9",
    teacherName: "ครูปก",
    studentID: "s4",
    studentName: "Online Students",
    startTime: "2025-08-19T17:00",
    endTime: "2025-08-19T18:00",
    totalHours: 60,
    remainingHours: 45,
  },
];

const courseColors: Record<string, string> = {
  "Conversation - Adults": "bg-sky-100 border-sky-300 text-sky-800",
  "Conversation - Kids": "bg-green-100 border-green-300 text-green-800",
  "Private - Conversation": "bg-pink-100 border-pink-300 text-pink-800",
  "Group - Conversation": "bg-purple-100 border-purple-300 text-purple-800",
  "4 skills": "bg-cyan-100 border-cyan-300 text-cyan-800",
  TOEIC: "bg-orange-100 border-orange-300 text-orange-800",
  IELTS: "bg-red-100 border-red-300 text-red-800",
  TOEFL: "bg-blue-100 border-blue-300 text-blue-800",
  Examination: "bg-yellow-100 border-yellow-300 text-yellow-800",
  "Combo Course": "bg-indigo-100 border-indigo-300 text-indigo-800",
  Chinese: "bg-emerald-100 border-emerald-300 text-emerald-800",
  Art: "bg-rose-100 border-rose-300 text-rose-800",
  Trial: "bg-gray-100 border-gray-300 text-gray-800",
};

export default function SchedulePage() {
  const { t } = useLanguage();
  
  // TODO: Implement schedule functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 19)); // Aug 19, 2025
  const [viewMode, setViewMode] = useState("DAY"); // View {Month, Week, Day}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.schedule }
      ]}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-black mb-6">{t.schedule}</h1>

          {/* View Mode Buttons */}
          <ButtonGroup>
            <Button
              variant={viewMode === "MONTH" ? "monthViewClicked" : "monthView"}
              onClick={() => setViewMode("MONTH")}
            >
              MONTH
            </Button>
            <Button
              variant={viewMode === "WEEK" ? "weekViewClicked" : "weekView"}
              onClick={() => setViewMode("WEEK")}
            >
              WEEK
            </Button>
            <Button
              variant={viewMode === "DAY" ? "dayViewClicked" : "dayView"}
              onClick={() => setViewMode("DAY")}
            >
              DAY
            </Button>
          </ButtonGroup>

          <div className="overflow-x-auto">
            <Table aria-label="Schedule Table" className="min-w-full rounded-sm">
              <TableHeader
                columns={[
                  { id: "time", name: "เวลา" },
                  ...teachers.map((t) => ({ id: t.id, name: t.name }))
                ]}
              >
                {(column) => (
                  <TableColumn
                    key={column.id}
                    className={`text-center font-bold text-white border border-gray-300 ${
                      column.id === "time"
                        ? "w-20 bg-[#334293]"
                        : "min-w-[150px] bg-[#334293]"
                    }`}
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>

              <TableBody items={timeSlots}>
  {(timeSlot) => {
    const cells = [
      <TableCell key="time" className="font-medium text-gray-600 bg-gray-50">
        {timeSlot.label}
      </TableCell>,
      ...teachers.map((teacher) => {
        const courses = testLesson.filter((lesson) => {
          const startHour = new Date(lesson.startTime).getHours();
          const endHour = new Date(lesson.endTime).getHours();
          return (
            lesson.teacherID === teacher.id &&
            timeSlot.hour >= startHour &&
            timeSlot.hour < endHour
          );
        });

        const course = courses[0];

        return (
          <TableCell key={teacher.id} className="p-1 border">
            {course ? (
              <div
                className={`p-2 rounded-lg border-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${courseColors["IELTS"]}`}
              >
                <p className="font-bold text-sm truncate">{course.courseName}</p>
                <p className="text-xs">
                  {new Date(course.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(course.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs truncate">นักเรียน: {course.studentName}</p>
                <p className="text-xs font-medium">
                  เหลือ {course.remainingHours}/{course.totalHours} ชม.
                </p>
              </div>
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
          </TableCell>
        );
      })
    ];
    return <TableRow key={timeSlot.hour} className="h-16">{cells}</TableRow>;
  }}
</TableBody>

            </Table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
