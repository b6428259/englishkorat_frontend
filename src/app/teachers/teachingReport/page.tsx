"use client";

import React, { useState } from "react";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import Button from "@/components/common/Button";

// icon
import { GrEdit } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";

interface TeachingReportData {
  lessonPlan: string;
  date: string;
  hours: string;
  warmUp: string;
  topic: string;
  lastPage: string;
  teacherName: string;
  comment: string;
  targetHours: number;
  specialHours: number;
  index?: number;
}

const columns = [
  { name: "Lesson plan", uid: "lessonPlan" },
  { name: "Date", uid: "date" },
  { name: "Hours", uid: "hours" },
  { name: "Warm-Up", uid: "warmUp" },
  { name: "Topic", uid: "topic" },
  { name: "Last Page", uid: "lastPage" },
  { name: "Teacher's Name", uid: "teacherName" },
  { name: "Comment", uid: "comment" },
  { name: "", uid: "action" },
];

export default function TeachingReport() {
  const { t } = useLanguage();

  // state เก็บข้อมูล rows
  const [rows, setRows] = useState([
    {
      lessonPlan: "Getting to know each other",
      date: "08/03/23",
      hours: "2",
      warmUp: "Pronunciation tips (focus on stressing)",
      topic: "Small talk",
      lastPage: "11",
      teacherName: "Sa",
      comment: "Great class!",
      targetHours: 20, 
      specialHours: 10,
    },
  ]);

  // state modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Partial<TeachingReportData> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

// คำนวณชั่วโมงรวม
const totalHoursUsed = rows.reduce(
  (sum, row) => sum + Number(row.hours || 0),
  0
);

// ดึง target / special จากแถวแรก (หรืออาจมาจาก props)
const targetHours = rows[0]?.targetHours || 0;
const specialHours = rows[0]?.specialHours || 0;

// รวมทั้งหมด
const totalHours = targetHours + specialHours;

  // เปิด modal สำหรับเพิ่มรายงานใหม่
  const handleAddNew = () => {
  setSelectedRow({
    lessonPlan: "",
    date: "",
    hours: "",
    warmUp: "",
    topic: "",
    lastPage: "",
    teacherName: "",
    comment: "",
    targetHours: 0,
    specialHours: 0,
  });
  setEditingIndex(null); // ✅ add mode
  setIsModalOpen(true);
};

  // เปิด modal สำหรับแก้ไข
  const handleEdit = (index: number) => {
  setSelectedRow({ ...rows[index] });
  setEditingIndex(index); // ✅ edit mode
  setIsModalOpen(true);
};

  // ลบรายงาน
  const handleDelete = (index: number) => {
    if (confirm("คุณแน่ใจว่าจะลบรายงานนี้?")) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  // บันทึก (ทั้ง Add + Edit)
const handleSave = () => {
  if (!selectedRow?.lessonPlan || !selectedRow?.date) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  const completeRow: TeachingReportData = {
    lessonPlan: selectedRow.lessonPlan || "",
    date: selectedRow.date || "",
    hours: selectedRow.hours || "",
    warmUp: selectedRow.warmUp || "",
    topic: selectedRow.topic || "",
    lastPage: selectedRow.lastPage || "",
    teacherName: selectedRow.teacherName || "",
    comment: selectedRow.comment || "",
    targetHours: selectedRow.targetHours || 0,
    specialHours: selectedRow.specialHours || 0,
  };

  if (editingIndex !== null) {
    // Edit
    const updated = [...rows];
    updated[editingIndex] = completeRow;
    setRows(updated);
  } else {
    // Add
    setRows([...rows, completeRow]);
  }

  setIsModalOpen(false);
  setSelectedRow(null);
  setEditingIndex(null);
};

  return (
    <SidebarLayout breadcrumbItems={[{ label: t.teachingReport }]}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">
              {t.teachingReport} : ชื่อคอร์ส
            </h1>
            <Button
              variant="monthViewClicked"
              onClick={handleAddNew} // ✅ ปุ่มเพิ่มรายงานกลับมาใช้งานได้
            >
              + เพิ่มรายงาน
            </Button>
          </div>

          {/* ข้อมูลคอร์ส */}
          <div className="grid grid-cols-2 gap-6 mb-6 border border-gray-300 rounded-lg p-4 shadow-md">
            <div className="space-y-2">
              <h2 className="font-bold text-gray-700">Book:</h2>
              <h2 className="font-bold text-gray-700">Goal of this class:</h2>
              <h2 className="font-bold text-gray-700">Students:</h2>
              <h2 className="font-bold text-gray-700">Level:</h2>
              <h2 className="font-bold text-gray-700">Branch:</h2>
            </div>
            <div className="space-y-2 text-right">
              <h2 className="font-bold text-gray-700">
                Total Hours Used:{" "}
                <span className="font-light text-gray-700">{totalHoursUsed} / {targetHours} </span>
              </h2>
              <p className="text-xs text-gray-500 italic">
                  Target Hours: {targetHours} | Special Hours: {specialHours} | Total Hours: {totalHours}
                </p>

              <h2 className="font-bold text-gray-700">Start Date:</h2>
              <h2 className="font-bold text-gray-700">End Date:</h2>
            </div>
          </div>

          {/* ตารางรายงาน */}
          <Table
            aria-label="Teaching Report Table"
            className="min-w-full rounded-lg text-sm divide-x divide-gray-300 border-collapse border border-gray-300 shadow-md"
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  className="bg-[#334293] text-center font-bold text-white border border-gray-200"
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.lessonPlan}</TableCell>
                  <TableCell className="text-center">{row.date}</TableCell>
                  <TableCell className="text-center">{row.hours}</TableCell>
                  <TableCell>{row.warmUp}</TableCell>
                  <TableCell>{row.topic}</TableCell>
                  <TableCell className="text-center">{row.lastPage}</TableCell>
                  <TableCell className="text-center">{row.teacherName}</TableCell>
                  <TableCell>{row.comment || "-"}</TableCell>

                  {/* ปุ่ม Action */}
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleEdit(index)}
                      className="px-2 py-1 bg-[#334293] text-white rounded hover:bg-blue-600 text-xs mr-2"
                    >
                      <GrEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal (ใช้ร่วมกัน Add + Edit) */}
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="bg-white p-6 rounded-lg">
          <ModalHeader>
            <h3 className="text-lg font-bold">
              {selectedRow?.index !== undefined ? "Edit รายงาน" : "เพิ่มรายงานใหม่"}
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Lesson Plan"
                className="w-full border rounded p-2"
                value={selectedRow?.lessonPlan || ""}
                onChange={(e) =>
                  setSelectedRow({ ...selectedRow, lessonPlan: e.target.value })
                }
              />
              <input
                type="date"
                className="w-full border rounded p-2"
                value={selectedRow?.date || ""}
                onChange={(e) =>
                  setSelectedRow({ ...selectedRow, date: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Hours"
                className="w-full border rounded p-2"
                value={selectedRow?.hours || ""}
                onChange={(e) =>
                  setSelectedRow({ ...selectedRow, hours: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Warm-Up"
                className="w-full border rounded p-2"
                value={selectedRow?.warmUp || ""}
                onChange={(e) =>
                  setSelectedRow({ ...selectedRow, warmUp: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Topic"
                className="w-full border rounded p-2"
                value={selectedRow?.topic || ""}
                onChange={(e) =>
                  setSelectedRow({ ...selectedRow, topic: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Last Page"
                className="w-full border rounded p-2"
                value={selectedRow?.lastPage || ""}
                onChange={(e) =>
                  setSelectedRow({ ...selectedRow, lastPage: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Teacher's Name"
                className="w-full border rounded p-2"
                value={selectedRow?.teacherName || ""}
                onChange={(e) =>
                  setSelectedRow({ ...selectedRow, teacherName: e.target.value })
                }
              />
              <textarea
                placeholder="Comment"
                className="w-full border rounded p-2"
                value={selectedRow?.comment || ""}
                onChange={(e) =>
                  setSelectedRow({ ...selectedRow, comment: e.target.value })
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalOpen(false)} variant="weekView">
              ยกเลิก
            </Button>
            <Button onClick={handleSave} variant="monthViewClicked">
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SidebarLayout>
  );
}
