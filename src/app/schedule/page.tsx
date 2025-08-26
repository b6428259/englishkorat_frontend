"use client";

import { useState } from "react";
import SidebarLayout from "../../components/common/SidebarLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import Button from "@/components/common/Button";
import { colors } from "@/styles/colors";
import { ButtonGroup } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/react";

interface Schedule {
  scheduleID: number;
  scheduleName?: string;
  scheduleType?: string;
  courseID: string;
  courseName: string;
  teacherID: string;
  teacherName: string;
  students: {
    id: string;
    name: string;
  }[];
  maxStudents: number;
  currentStudents: number;
  availableSpots: number;
  roomID: string;
  branch: number;
  startTime: string; // '2025-08-19T10:00'
  endTime: string; // '2025-08-19T12:00'
  hoursPerSession: number;
  totalHours: number;
  completedHours: number;
  autoReschedule: boolean;
  notes: string;
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

const branches = [
  { id: 1, name: "สาขา 1 (เดอะมอลล์)" },
  { id: 2, name: "Online" },
  { id: 3, name: "สาขา 3 (ราชภัฏ-เทคโน)" },
];

const timeSlots = Array.from({ length: (22 - 8) * 2 + 1 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? 0 : 30;
  const label = `${hour % 12 === 0 ? 12 : hour % 12}:${
    minute === 0 ? "00" : "30"
  }${hour < 12 ? "am" : "pm"}`;
  return { hour, minute, label };
});

const testLesson: Schedule[] = [
  {
    scheduleID: 1,
    scheduleName: "Conversation Adults Morning",
    scheduleType: "Group",
    courseID: "c1",
    courseName: "Conversation A2",
    teacherID: "t1",
    teacherName: "ครูมี",
    students: [
      { id: "s1", name: "สมชาย" },
      { id: "s2", name: "สมหญิง" },
      { id: "s3", name: "John" },
    ],
    maxStudents: 10,
    currentStudents: 3,
    availableSpots: 7,
    roomID: "R101",
    branch: 1,
    startTime: "2025-08-19T10:00",
    endTime: "2025-08-19T12:00",
    hoursPerSession: 2,
    totalHours: 40,
    completedHours: 20,
    autoReschedule: false,
    notes: "เรียนกลุ่มเล็กในห้อง",
  },
  {
    scheduleID: 2,
    scheduleName: "Pre-IELTS Online Class",
    scheduleType: "Online",
    courseID: "c2",
    courseName: "Pre-IELTS",
    teacherID: "t3",
    teacherName: "ครูคิด",
    students: [
      { id: "s4", name: "Alice" },
      { id: "s5", name: "Bob" },
    ],
    maxStudents: 15,
    currentStudents: 2,
    availableSpots: 13,
    roomID: "Zoom-01",
    branch: 2,
    startTime: "2025-08-19T17:00",
    endTime: "2025-08-19T18:30",
    hoursPerSession: 1.5,
    totalHours: 30,
    completedHours: 12,
    autoReschedule: true,
    notes: "สอนออนไลน์ผ่าน Zoom",
  },
  {
    scheduleID: 3,
    scheduleName: "Private IELTS Tutoring",
    scheduleType: "Private",
    courseID: "c3",
    courseName: "IELTS Intensive",
    teacherID: "t5",
    teacherName: "อรยี",
    students: [{ id: "s6", name: "นักเรียนเดี่ยว" }],
    maxStudents: 1,
    currentStudents: 1,
    availableSpots: 0,
    roomID: "R202",
    branch: 3,
    startTime: "2025-08-19T13:00",
    endTime: "2025-08-19T15:00",
    hoursPerSession: 2,
    totalHours: 20,
    completedHours: 5,
    autoReschedule: false,
    notes: "ติวเดี่ยว IELTS แบบเข้มข้น",
  },
  {
    scheduleID: 4,
    scheduleName: "TOEIC Group Evening",
    scheduleType: "Group",
    courseID: "c4",
    courseName: "TOEIC Preparation",
    teacherID: "t9",
    teacherName: "ครูปก",
    students: [
      { id: "s7", name: "Nina" },
      { id: "s8", name: "Ken" },
      { id: "s9", name: "Lisa" },
      { id: "s10", name: "Somchai" },
    ],
    maxStudents: 12,
    currentStudents: 4,
    availableSpots: 8,
    roomID: "R105",
    branch: 3,
    startTime: "2025-08-19T19:00",
    endTime: "2025-08-19T21:00",
    hoursPerSession: 2,
    totalHours: 50,
    completedHours: 10,
    autoReschedule: true,
    notes: "คอร์สกลุ่ม TOEIC รอบค่ำ",
  },
];

const branchColor: Record<string, string> = {
  Branch1: "bg-[#334293] text-white", //Blue
  Branch3: "bg-[#EFE957] text-black", //Yellow
  Online: "bg-[#5EABD6] text-white", //Blue sky
  Holiday: "bg-[#D7D7D7] text-[#ADADAD]", //Gray
  Unavailable: "bg-[#DC3C22] text-white", //Red
  BookForTest: "bg-[#FF714B] text-white", //Orange
  Chinese: "bg-[#FFB4B4] text-white", //Pink
};

export default function SchedulePage() {
  const { t } = useLanguage();

  // TODO: Implement schedule functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 19)); // Aug 19, 2025
  const [viewMode, setViewMode] = useState("DAY"); // View {Month, Week, Day}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState<Schedule | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isModalOpen, setIsModalOpen] = useState(false);

  //select Teachers checkbox
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(
    teachers.map((t) => t.id)
  );

  const toggleTeacher = (id: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  // calculate on startTime and endTime for rowspan
  function getRowSpan(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return diffMinutes / 30 +1 ; // 1 ช่อง = 30 นาที
  }

  const handleCourseClick = (course: Schedule) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  return (
    <SidebarLayout breadcrumbItems={[{ label: t.schedule }]}>
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

          <div className="flex mt-6">
            {/* Teacher Filters */}
            <div className="w-80 bg-white border border-gray-200 border-collapse rounded-lg p-4 space-y-3">
              <h2 className="font-bold mb-3 text-[#334293] border-b border-[#334293] pb-2">
                {t.SelectTeachers}
              </h2>
              {teachers.map((teacher) => (
                <label key={teacher.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.includes(teacher.id)}
                    onChange={() => toggleTeacher(teacher.id)}
                    className="h-4 w-4 rounded focus:ring-0"
                    style={{ accentColor: colors.yellowLogo }}
                  />
                  <span className="text-md" style={{ color: colors.blueLogo }}>
                    {teacher.name}
                  </span>
                </label>
              ))}
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto ">
              <Table
                aria-label="Schedule Table"
                className="min-w-full rounded-lg text-sm divide-x divide-gray-300 border-collapse"
              >
                <TableHeader
                  columns={[
                    { id: "time", name: "เวลา" },
                    ...teachers.map((t) => ({ id: t.id, name: t.name })),
                  ]}
                >
                  {(column) => (
                    <TableColumn
                      key={column.id}
                      className={`text-center font-bold text-white border border-gray-200 ${
                        column.id === "time"
                          ? "w-50 bg-[#334293]"
                          : "w-[150px] bg-[#334293]"
                      }`}
                    >
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>

                <TableBody items={timeSlots}>
                  {(timeSlot) => {
                    const cells = [
                      <TableCell
                        key="time"
                        className="font-medium text-gray-600 bg-gray-50 text-xs border border-gray-200 border-collapse"
                      >
                        {timeSlot.label}
                      </TableCell>,
                      ...teachers.map((teacher) => {
                        const course = testLesson.find((lesson) => {
                          const start = new Date(lesson.startTime);
                          return (
                            lesson.teacherID === teacher.id &&
                            start.getHours() === timeSlot.hour &&
                            start.getMinutes() === timeSlot.minute
                          );
                        });

                        if (course) {
                          const rowSpan = getRowSpan(
                            course.startTime,
                            course.endTime
                          );
                          return (
                            <TableCell key={teacher.id} rowSpan={rowSpan}>
                              <div
                                className="w-40 p-2 rounded-lg border shadow cursor-pointer hover:shadow-md transition-shadow break-words whitespace-normal"
                                onClick={() => handleCourseClick(course)}
                              >
                                  {/* ชื่อคลาส */}
                                  <p className="font-bold text-sm text-black">
                                    {course.scheduleName}
                                  </p>

                                  {/* จำนวนนักเรียน */}
                                  <p className="font-bold text-xs text-[#f43f5e] flex-shrink-0">
                                    {course.currentStudents}/
                                    {course.maxStudents}
                                  </p>

                                  {/* ชื่อคอร์ส */}
                                  <p className="text-xs text-black">
                                    คอร์ส: {course.courseName}
                                  </p>

                                  {/* ห้องเรียน */}
                                  <p className="text-xs text-black">
                                    ห้อง: {course.roomID}
                                  </p>

                                  {/* เวลา */}
                                  <p className="text-xs text-black">
                                    เวลา:{" "}
                                    {new Date(
                                      course.startTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}{" "}
                                    -{" "}
                                    {new Date(
                                      course.endTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>

                                  {/* ชั่วโมงที่เรียนไปแล้ว */}
                                  <p className="text-xs font-medium  text-black">
                                    เรียนไปแล้ว: {" "}
                                    {course.completedHours}/{course.totalHours}{" "}
                                    ชม.
                                  </p>

                                {/* สาขา + สี */}
                                <span
                                  className={`inline-block px-2 rounded-full text-xs font-medium mt-1
                                  ${
                                    course.branch === 1
                                      ? branchColor.Branch1
                                      : course.branch === 2
                                      ? branchColor.Online
                                      : branchColor.Branch3
                                  }`}
                                >
                                  {
                                    branches.find((b) => b.id === course.branch)
                                      ?.name
                                  }
                                </span>

                                {/* notes */}
                                {course.notes && (
                                  <p className="text-[11px] italic text-gray-500 mt-1">
                                    หมายเหตุ: {course.notes}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                          );
                        }

                        return <TableCell key={teacher.id} className="border border-gray-200 border-collapse">-</TableCell>;
                      }),
                    ];
                    return <TableRow key={timeSlot.label}  className="h-3">{cells}</TableRow>;
                  }}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal สำหรับรายละเอียด */}
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="bg-white border border-gray-300 rounded-lg shadow-lg max-w-md">
          {selectedCourse && (
            <>
              <ModalHeader className="justify-between border-b border-gray-300">
                <h3 className="text-black font-semibold">
                  {selectedCourse.scheduleName}
                </h3>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1
              ${
                selectedCourse.branch === 1
                  ? branchColor.Branch1
                  : selectedCourse.branch === 2
                  ? branchColor.Online
                  : branchColor.Branch3
              }`}
                >
                  {branches.find((b) => b.id === selectedCourse.branch)?.name}
                </span>
              </ModalHeader>

              <ModalBody>
                <div className="space-y-2 text-sm text-black">
                  {/* เวลาเรียน */}
                  <p>
                    {new Date(selectedCourse.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(selectedCourse.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <p>
                    <b>คอร์ส:</b> {selectedCourse.courseName}
                  </p>
                  <p>
                    <b>ครูผู้สอน:</b> {selectedCourse.teacherName}
                  </p>
                  <p>
                    <b>ห้อง:</b> {selectedCourse.roomID}
                  </p>

                  {/* รายชื่อนักเรียน */}
                  <div>
                    <p>
                      <b>นักเรียน:</b>
                    </p>
                    <ul className="list-disc list-inside">
                      {selectedCourse.students.map((s) => (
                        <li key={s.id}>
                          {s.id} - {s.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* จำนวนนักเรียน */}
                  <p className="font-bold text-xs text-[#f43f5e]">
                    {selectedCourse.currentStudents}/
                    {selectedCourse.maxStudents} คน
                  </p>

                  {/* ชั่วโมงเรียน */}
                  <p>
                    <b>ชั่วโมงเรียน:</b> {selectedCourse.completedHours}/
                    {selectedCourse.totalHours} ชม.
                  </p>

                  {/* หมายเหตุ */}
                  {selectedCourse.notes && (
                    <p>
                      <b>หมายเหตุ:</b> {selectedCourse.notes}
                    </p>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="monthViewClicked"
                >
                  ปิด
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </SidebarLayout>
  );
}
