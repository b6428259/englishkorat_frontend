"use client";

import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { groupService } from "@/services/api/groups";
import { Student, studentService } from "@/services/student.service";
import { Group } from "@/types/group.types";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type RegistrationStatus =
  | "pending_review"
  | "schedule_exam"
  | "waiting_for_group"
  | "active";

interface AssignGroupModalProps {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignGroupModal: React.FC<AssignGroupModalProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "deposit_paid" | "fully_paid"
  >("pending");

  // Fetch available groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await groupService.getGroups({
          status: "active",
          per_page: 100,
        });
        setGroups(response.groups);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError(
          language === "th"
            ? "ไม่สามารถโหลดรายการกลุ่มได้"
            : "Failed to load groups"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [language]);

  // Filter groups by search term
  const filteredGroups = groups.filter((group) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      group.group_name.toLowerCase().includes(searchLower) ||
      group.course?.name.toLowerCase().includes(searchLower) ||
      group.level.toLowerCase().includes(searchLower)
    );
  });

  // Handle assign student to group
  const handleAssign = async () => {
    if (!selectedGroupId) {
      setError(language === "th" ? "กรุณาเลือกกลุ่ม" : "Please select a group");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const result = await groupService.addMember(selectedGroupId.toString(), {
        student_id: student.id,
        payment_status: paymentStatus,
      });

      if (result) {
        onSuccess();
        onClose();
      } else {
        throw new Error("Failed to add member");
      }
    } catch (err) {
      console.error("Error assigning student:", err);
      setError(
        language === "th"
          ? "ไม่สามารถเพิ่มนักเรียนเข้ากลุ่มได้"
          : "Failed to assign student to group"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {language === "th" ? "จัดกลุ่มนักเรียน" : "Assign to Group"}
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                {student.first_name} {student.last_name} (
                {student.nickname_th || student.nickname_en})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={
                  language === "th"
                    ? "ค้นหากลุ่ม, คอร์ส, ระดับ..."
                    : "Search group, course, level..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Payment Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "th" ? "สถานะการชำระเงิน" : "Payment Status"}
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                {
                  value: "pending" as const,
                  label: language === "th" ? "รอชำระ" : "Pending",
                },
                {
                  value: "deposit_paid" as const,
                  label: language === "th" ? "มัดจำแล้ว" : "Deposit Paid",
                },
                {
                  value: "fully_paid" as const,
                  label: language === "th" ? "ชำระเต็มแล้ว" : "Fully Paid",
                },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setPaymentStatus(status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    paymentStatus === status.value
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Groups List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <p className="mt-4 text-gray-600 text-sm">
                {language === "th" ? "กำลังโหลด..." : "Loading..."}
              </p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? language === "th"
                    ? "ไม่พบกลุ่มที่ค้นหา"
                    : "No groups found"
                  : language === "th"
                  ? "ไม่มีกลุ่มที่พร้อมใช้งาน"
                  : "No available groups"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGroups.map((group) => {
                const currentMembers = group.members?.length || 0;
                const isFull = currentMembers >= group.max_students;
                const isSelected = selectedGroupId === group.id;

                return (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    disabled={isFull}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : isFull
                        ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {group.group_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                          {group.course && (
                            <>
                              <span className="truncate">
                                {group.course.name}
                              </span>
                              <span className="text-gray-400">•</span>
                            </>
                          )}
                          <span className="text-indigo-600 font-medium">
                            {group.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${
                              isFull
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            {currentMembers}/{group.max_students}
                          </span>
                          {isFull && (
                            <span className="text-xs text-red-600 font-medium">
                              {language === "th" ? "เต็มแล้ว" : "Full"}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {language === "th" ? "ยกเลิก" : "Cancel"}
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedGroupId || submitting}
            className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === "th" ? "กำลังบันทึก..." : "Saving..."}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                {language === "th" ? "จัดกลุ่ม" : "Assign"}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student: initialStudent,
  onClose,
}) => {
  const { language } = useLanguage();
  const [student, setStudent] = useState(initialStudent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full student details when modal opens
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await studentService.getStudent(
          initialStudent.id.toString()
        );
        setStudent(response.data.student);
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError(
          language === "th"
            ? "ไม่สามารถโหลดข้อมูลนักเรียนได้"
            : "Failed to load student details"
        );
        setStudent(initialStudent); // Fallback to initial data
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [initialStudent, language]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white rounded-t-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {student.first_name} {student.last_name}
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                {student.nickname_th || student.nickname_en} • {student.age}{" "}
                {language === "th" ? "ปี" : "years old"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">
                {language === "th" ? "กำลังโหลด..." : "Loading..."}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                {language === "th" ? "ปิด" : "Close"}
              </button>
            </div>
          ) : (
            <>
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {language === "th" ? "ข้อมูลพื้นฐาน" : "Basic Information"}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoItem
                    label={language === "th" ? "เพศ" : "Gender"}
                    value={student.gender}
                  />
                  <InfoItem
                    label={language === "th" ? "กลุ่มอายุ" : "Age Group"}
                    value={student.age_group}
                  />
                  <InfoItem
                    label={language === "th" ? "วันเกิด" : "Date of Birth"}
                    value={
                      student.date_of_birth
                        ? new Date(student.date_of_birth).toLocaleDateString()
                        : "N/A"
                    }
                  />
                  <InfoItem
                    label={
                      language === "th"
                        ? "สถานะการลงทะเบียน"
                        : "Registration Status"
                    }
                    value={student.registration_status}
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t pt-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {language === "th" ? "ข้อมูลติดต่อ" : "Contact Information"}
                </h3>
                <div className="space-y-2 text-sm">
                  {student.phone && (
                    <InfoItem
                      label={language === "th" ? "โทรศัพท์" : "Phone"}
                      value={student.phone}
                      icon="📞"
                    />
                  )}
                  {student.email && (
                    <InfoItem label="Email" value={student.email} icon="📧" />
                  )}
                  {student.line_id && (
                    <InfoItem
                      label="LINE ID"
                      value={student.line_id}
                      icon="💬"
                    />
                  )}
                </div>
              </div>

              {/* Learning Info */}
              <div className="border-t pt-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {language === "th"
                    ? "ข้อมูลการเรียน"
                    : "Learning Information"}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {student.language_level && (
                    <InfoItem
                      label={language === "th" ? "ระดับภาษา" : "Language Level"}
                      value={student.language_level}
                    />
                  )}
                  {student.recent_cefr && (
                    <InfoItem label="CEFR" value={student.recent_cefr} />
                  )}
                  {student.learning_style && (
                    <InfoItem
                      label={
                        language === "th" ? "รูปแบบการเรียน" : "Learning Style"
                      }
                      value={student.learning_style}
                    />
                  )}
                  {student.teacher_type && (
                    <InfoItem
                      label={language === "th" ? "ประเภทครู" : "Teacher Type"}
                      value={student.teacher_type}
                    />
                  )}
                </div>
              </div>

              {/* Test Scores */}
              {(student.grammar_score ||
                student.speaking_score ||
                student.listening_score ||
                student.reading_score ||
                student.writing_score) && (
                <div className="border-t pt-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    {language === "th" ? "คะแนนสอบ" : "Test Scores"}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {student.grammar_score && (
                      <ScoreItem
                        label="Grammar"
                        score={student.grammar_score}
                      />
                    )}
                    {student.speaking_score && (
                      <ScoreItem
                        label="Speaking"
                        score={student.speaking_score}
                      />
                    )}
                    {student.listening_score && (
                      <ScoreItem
                        label="Listening"
                        score={student.listening_score}
                      />
                    )}
                    {student.reading_score && (
                      <ScoreItem
                        label="Reading"
                        score={student.reading_score}
                      />
                    )}
                    {student.writing_score && (
                      <ScoreItem
                        label="Writing"
                        score={student.writing_score}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Learning Goals */}
              {student.learning_goals && (
                <div className="border-t pt-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    {language === "th" ? "เป้าหมายการเรียน" : "Learning Goals"}
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {student.learning_goals}
                  </p>
                </div>
              )}

              {/* Registration Info */}
              <div className="border-t pt-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {language === "th" ? "ข้อมูลอื่นๆ" : "Other Information"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                    {student.registration_type === "quick"
                      ? language === "th"
                        ? "ลงทะเบียนรวดเร็ว"
                        : "Quick Reg"
                      : language === "th"
                      ? "ลงทะเบียนครบถ้วน"
                      : "Full Reg"}
                  </span>
                  <span className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-md border border-green-200">
                    {student.payment_status}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && !error && (
          <div className="sticky bottom-0 bg-gray-50 px-5 py-3 border-t rounded-b-lg flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {language === "th" ? "ปิด" : "Close"}
            </button>
            <button
              onClick={() =>
                (window.location.href = `/students/${student.id}/edit`)
              }
              className="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4" />
              {language === "th" ? "แก้ไข" : "Edit"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const InfoItem: React.FC<{
  label: string;
  value: string | undefined;
  icon?: string;
}> = ({ label, value, icon }) => (
  <div className="flex items-start gap-2">
    {icon && <span className="text-base">{icon}</span>}
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 truncate">{value || "N/A"}</p>
    </div>
  </div>
);

const ScoreItem: React.FC<{ label: string; score: number }> = ({
  label,
  score,
}) => (
  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
    <p className="text-xs text-gray-600 mb-1">{label}</p>
    <p className="text-xl font-semibold text-blue-600">{score}</p>
  </div>
);

export default function StudentAssignPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<RegistrationStatus>("pending_review");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToAssign, setStudentToAssign] = useState<Student | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  const statusTabs = [
    {
      key: "pending_review" as RegistrationStatus,
      label: language === "th" ? "รอตรวจสอบ" : "Pending Review",
      description:
        language === "th"
          ? "นักเรียนที่ลงทะเบียนใหม่ รอการตรวจสอบ"
          : "New registrations waiting for review",
      icon: Clock,
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-200",
    },
    {
      key: "schedule_exam" as RegistrationStatus,
      label: language === "th" ? "จัดสอบ" : "Schedule Exam",
      description:
        language === "th"
          ? "พร้อมทำการสอบ placement test"
          : "Ready for placement testing",
      icon: FileText,
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
    },
    {
      key: "waiting_for_group" as RegistrationStatus,
      label: language === "th" ? "รอจัดกลุ่ม" : "Waiting for Group",
      description:
        language === "th"
          ? "สอบแล้ว รอการจัดเข้ากลุ่ม"
          : "Completed testing, waiting for group",
      icon: Users,
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
    },
    {
      key: "active" as RegistrationStatus,
      label: language === "th" ? "ใช้งานอยู่" : "Active",
      description:
        language === "th"
          ? "จัดกลุ่มแล้วและเรียนอยู่"
          : "Assigned and actively learning",
      icon: CheckCircle,
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    },
  ];

  useEffect(() => {
    fetchStudentsByStatus(activeTab, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage]);

  const fetchStudentsByStatus = async (
    status: RegistrationStatus,
    page: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.getStudentsByStatus(status, {
        page,
        limit,
      });
      setStudents(response.students);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(
        language === "th"
          ? "เกิดข้อผิดพลาดในการโหลดข้อมูล"
          : "Error loading students"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: RegistrationStatus) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getActionButton = (student: Student) => {
    switch (activeTab) {
      case "pending_review":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/students/${student.id}/edit?mode=complete`);
            }}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium"
          >
            <Edit className="w-3.5 h-3.5" />
            {language === "th" ? "กรอกข้อมูล" : "Complete"}
          </button>
        );
      case "schedule_exam":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/students/${student.id}/exam`);
            }}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium"
          >
            <Calendar className="w-3.5 h-3.5" />
            {language === "th" ? "บันทึกคะแนน" : "Record"}
          </button>
        );
      case "waiting_for_group":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStudentToAssign(student);
            }}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {language === "th" ? "จัดกลุ่ม" : "Assign"}
          </button>
        );
      default:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStudentClick(student);
            }}
            className="inline-flex items-center gap-1.5 bg-gray-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors text-xs font-medium"
          >
            <Eye className="w-3.5 h-3.5" />
            {language === "th" ? "ดู" : "View"}
          </button>
        );
    }
  };

  const filteredStudents = students.filter((student) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.first_name.toLowerCase().includes(query) ||
      student.last_name.toLowerCase().includes(query) ||
      student.nickname_th?.toLowerCase().includes(query) ||
      student.nickname_en?.toLowerCase().includes(query) ||
      student.phone?.includes(query) ||
      student.email?.toLowerCase().includes(query)
    );
  });

  const currentTab = statusTabs.find((t) => t.key === activeTab);
  const Icon = currentTab?.icon || Users;

  return (
    <SidebarLayout
      breadcrumbItems={[
        {
          label: language === "th" ? "จัดการนักเรียน" : "Student Management",
          href: "/students",
        },
        { label: language === "th" ? "มอบหมาย" : "Assign" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === "th" ? "จัดการนักเรียน" : "Student Management"}
          </h1>
          <p className="text-sm text-gray-600">
            {language === "th"
              ? "จัดการนักเรียนตามสถานะและดำเนินการขั้นตอนต่อไป"
              : "Manage students by status and proceed with next steps"}
          </p>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {statusTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex-1 px-4 py-3.5 flex items-center justify-center gap-2 transition-all duration-200 relative font-medium text-sm ${
                    activeTab === tab.key
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={
                  language === "th"
                    ? "ค้นหาชื่อ, เบอร์โทร, อีเมล..."
                    : "Search name, phone, email..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => fetchStudentsByStatus(activeTab, currentPage)}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              {language === "th" ? "รีเฟรช" : "Refresh"}
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
            <span>
              {language === "th" ? "ทั้งหมด" : "Total"}:{" "}
              <span className="font-semibold text-gray-900">{total}</span>{" "}
              {language === "th" ? "คน" : "students"}
            </span>
            {searchQuery && (
              <span>
                {language === "th" ? "ผลลัพธ์" : "Results"}:{" "}
                <span className="font-semibold text-gray-900">
                  {filteredStudents.length}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">
                {language === "th" ? "กำลังโหลด..." : "Loading..."}
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
            >
              <div className="text-red-600 text-lg font-semibold mb-2">
                {language === "th" ? "เกิดข้อผิดพลาด" : "Error"}
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchStudentsByStatus(activeTab, currentPage)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {language === "th" ? "ลองใหม่" : "Try Again"}
              </button>
            </motion.div>
          ) : filteredStudents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
            >
              <div className="text-gray-400 text-5xl mb-4">
                <Icon className="w-16 h-16 mx-auto" />
              </div>
              <div className="text-gray-900 text-lg font-semibold mb-2">
                {language === "th" ? "ไม่มีนักเรียน" : "No Students"}
              </div>
              <p className="text-gray-500 text-sm">
                {searchQuery
                  ? language === "th"
                    ? "ไม่พบผลลัพธ์ที่ค้นหา"
                    : "No results found"
                  : language === "th"
                  ? `ไม่มีนักเรียนในสถานะ "${currentTab?.label}"`
                  : `No students in "${currentTab?.label}" status`}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Student Rows */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {language === "th" ? "นักเรียน" : "Student"}
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                          {language === "th" ? "ติดต่อ" : "Contact"}
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                          {language === "th" ? "ระดับ" : "Level"}
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                          {language === "th" ? "สถานะ" : "Status"}
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {language === "th" ? "การกระทำ" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <motion.tr
                          key={student.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleStudentClick(student)}
                        >
                          {/* Student Info */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {student.first_name.charAt(0)}
                                {student.last_name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {student.first_name} {student.last_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {student.nickname_th || student.nickname_en} •{" "}
                                  {student.age}{" "}
                                  {language === "th" ? "ปี" : "yrs"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="space-y-0.5">
                              {student.phone && (
                                <p className="text-xs text-gray-600 truncate">
                                  📞 {student.phone}
                                </p>
                              )}
                              {student.email && (
                                <p className="text-xs text-gray-500 truncate">
                                  {student.email}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Level */}
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div>
                              {student.language_level && (
                                <span className="text-xs font-medium text-gray-700">
                                  {student.language_level}
                                </span>
                              )}
                              {student.recent_cefr && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  CEFR: {student.recent_cefr}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 hidden xl:table-cell">
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 font-medium">
                                {student.registration_type === "quick"
                                  ? language === "th"
                                    ? "รวดเร็ว"
                                    : "Quick"
                                  : language === "th"
                                  ? "ครบถ้วน"
                                  : "Full"}
                              </span>
                              <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 font-medium">
                                {student.payment_status}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div onClick={(e) => e.stopPropagation()}>
                              {getActionButton(student)}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="text-sm text-gray-600">
                      {language === "th" ? "หน้า" : "Page"}{" "}
                      <span className="font-semibold text-gray-900">
                        {currentPage}
                      </span>{" "}
                      {language === "th" ? "จาก" : "of"}{" "}
                      <span className="font-semibold text-gray-900">
                        {totalPages}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1
                          )
                          .map((page, idx, arr) => (
                            <React.Fragment key={page}>
                              {idx > 0 && arr[idx - 1] !== page - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded-lg transition-colors ${
                                  currentPage === page
                                    ? "bg-indigo-600 text-white font-medium"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          ))}
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentDetailModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>

      {/* Assign Group Modal */}
      <AnimatePresence>
        {studentToAssign && (
          <AssignGroupModal
            student={studentToAssign}
            onClose={() => setStudentToAssign(null)}
            onSuccess={() => {
              setStudentToAssign(null);
              fetchStudentsByStatus(activeTab, currentPage);
            }}
          />
        )}
      </AnimatePresence>
    </SidebarLayout>
  );
}
