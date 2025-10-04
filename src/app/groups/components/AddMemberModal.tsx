import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useLanguage } from "@/contexts/LanguageContext";
import { groupService } from "@/services/api/groups";
import { Student, studentsApi } from "@/services/api/students";
import { AddGroupMemberRequest, Group } from "@/types/group.types";
import { useCallback, useEffect, useRef, useState } from "react";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onMemberAdded: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  group,
  onMemberAdded,
}) => {
  const { language } = useLanguage();

  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "deposit_paid" | "fully_paid"
  >("pending");
  const [submitting, setSubmitting] = useState(false);

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load students on modal open
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all students using new API
      const response = await studentsApi.getAllStudents();

      // Filter out students who are already in this group
      const currentMemberIds = group.members?.map((m) => m.student_id) || [];
      const availableStudents = response.filter(
        (student) => !currentMemberIds.includes(student.id)
      );

      setStudents(availableStudents);
    } catch (err) {
      setError(
        language === "th"
          ? "ไม่สามารถโหลดรายชื่อนักเรียนได้"
          : "Failed to load students"
      );
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  }, [group.members, language]);

  // Initial load
  useEffect(() => {
    if (isOpen) {
      loadStudents();
      setSearchTerm("");
      setSelectedStudentId(0);
    }
  }, [isOpen, loadStudents]);

  // Handle search with debounce
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      if (searchTerm) {
        try {
          setLoading(true);
          setError(null);

          // Call students API with search parameter
          const response = await studentsApi.getAllStudents({
            search: searchTerm,
          });

          // Filter out students who are already in this group
          const currentMemberIds =
            group.members?.map((m) => m.student_id) || [];
          const availableStudents = response.filter(
            (student) => !currentMemberIds.includes(student.id)
          );

          setStudents(availableStudents);
        } catch (err) {
          setError(
            language === "th"
              ? "ไม่สามารถโหลดรายชื่อนักเรียนได้"
              : "Failed to load students"
          );
          console.error("Error loading students:", err);
        } finally {
          setLoading(false);
        }
      } else {
        loadStudents();
      }
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, group.members, language, loadStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudentId === 0) {
      setError(
        language === "th" ? "กรุณาเลือกนักเรียน" : "Please select a student"
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const memberData: AddGroupMemberRequest = {
        student_id: selectedStudentId,
        payment_status: paymentStatus,
      };

      await groupService.addMember(group.id.toString(), memberData);
      onMemberAdded();

      // Reset form
      setSelectedStudentId(0);
      setPaymentStatus("pending");
      setSearchTerm("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add member";
      setError(
        language === "th" ? "เกิดข้อผิดพลาดในการเพิ่มสมาชิก" : errorMessage
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStudentDisplayName = (student: Student) => {
    // Use Thai name (first_name + last_name)
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    // Fallback to user.username if available
    if (student.user?.username) {
      return student.user.username;
    }
    return `Student #${student.id}`;
  };

  const getStudentNickname = (student: Student) => {
    // Prefer Thai nickname
    if (student.nickname_th) return student.nickname_th;
    if (student.nickname_en) return student.nickname_en;
    return null;
  };

  const getStudentSubtext = (student: Student) => {
    const parts = [];
    const nickname = getStudentNickname(student);
    if (nickname) parts.push(`(${nickname})`);

    // Add username if available
    if (student.user?.username) {
      parts.push(student.user.username);
    }

    // Add email
    if (student.user?.email) {
      parts.push(student.user.email);
    } else if (student.email) {
      parts.push(student.email);
    }

    // Add CEFR level
    if (student.cefr_level) {
      parts.push(`CEFR: ${student.cefr_level}`);
    }

    return parts.join(" • ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">
            {language === "th" ? "เพิ่มสมาชิกใหม่" : "Add New Member"}
          </h2>
          <p className="opacity-90 mt-1">{group.group_name}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Search Students */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "th" ? "ค้นหานักเรียน" : "Search Students"}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={
                language === "th"
                  ? "ค้นหาชื่อ, อีเมล, หรือชื่อเล่น..."
                  : "Search by name, email, or nickname..."
              }
            />
          </div>

          {/* Student Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "th" ? "เลือกนักเรียน" : "Select Student"} *
            </label>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <LoadingSpinner />
                  <p className="text-sm text-gray-500 animate-pulse">
                    {language === "th" ? "กำลังโหลด..." : "Loading..."}
                  </p>
                </div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="mb-3 text-4xl">👥</div>
                <p className="font-medium">
                  {searchTerm
                    ? language === "th"
                      ? "ไม่พบนักเรียนที่ค้นหา"
                      : "No students found"
                    : language === "th"
                    ? "ไม่มีนักเรียนที่สามารถเพิ่มได้"
                    : "No students available to add"}
                </p>
                {searchTerm && (
                  <p className="text-sm mt-2">
                    {language === "th"
                      ? "ลองค้นหาด้วยคำอื่น"
                      : "Try searching with different keywords"}
                  </p>
                )}
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md divide-y">
                {students.map((student) => {
                  const displayName = getStudentDisplayName(student);
                  const subtext = getStudentSubtext(student);
                  const isSelected = selectedStudentId === student.id;

                  return (
                    <label
                      key={student.id}
                      className={`flex items-center p-3 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-50 border-l-4 border-indigo-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="student"
                        value={student.id}
                        checked={isSelected}
                        onChange={() => setSelectedStudentId(student.id)}
                        className="mr-3 text-indigo-600 focus:ring-indigo-500"
                      />

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold mr-3 flex-shrink-0">
                        {student.user?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${
                              process.env.NEXT_PUBLIC_API_URL ||
                              "http://localhost:3000"
                            }/${student.user.avatar}`}
                            alt={displayName}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const initial = displayName
                                .charAt(0)
                                .toUpperCase();
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.textContent =
                                  initial;
                              }
                            }}
                          />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {displayName}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {subtext}
                        </div>

                        {/* Additional info badges */}
                        <div className="flex items-center gap-2 mt-1">
                          {student.age_group && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {student.age_group}
                            </span>
                          )}
                          {student.cefr_level && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              {student.cefr_level}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "th" ? "สถานะการชำระเงิน" : "Payment Status"}
            </label>
            <SearchableSelect
              value={paymentStatus}
              onValueChange={(value) =>
                setPaymentStatus(
                  value as "pending" | "deposit_paid" | "fully_paid"
                )
              }
              options={[
                {
                  value: "pending",
                  label: language === "th" ? "รอชำระ" : "Pending",
                },
                {
                  value: "deposit_paid",
                  label: language === "th" ? "ชำระมัดจำ" : "Deposit Paid",
                },
                {
                  value: "fully_paid",
                  label: language === "th" ? "ชำระครบ" : "Fully Paid",
                },
              ]}
              className="w-full"
            />
          </div>

          {/* Group Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">
              {language === "th" ? "ข้อมูลกลุ่ม" : "Group Information"}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">
                  {language === "th" ? "สมาชิกปัจจุบัน:" : "Current members:"}
                </span>
                <span className="font-medium ml-1">
                  {group.members?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-600">
                  {language === "th" ? "จำนวนสูงสุด:" : "Maximum:"}
                </span>
                <span className="font-medium ml-1">{group.max_students}</span>
              </div>
              <div>
                <span className="text-gray-600">
                  {language === "th" ? "ที่ว่าง:" : "Available:"}
                </span>
                <span
                  className={`font-medium ml-1 ${
                    group.max_students - (group.members?.length || 0) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {group.max_students - (group.members?.length || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">
                  {language === "th" ? "สถานะ:" : "Status:"}
                </span>
                <span className="font-medium ml-1">{group.status}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="monthView"
              className="px-6 py-2"
              disabled={submitting}
            >
              {language === "th" ? "ยกเลิก" : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="monthViewClicked"
              className="px-6 py-2"
              disabled={
                submitting ||
                selectedStudentId === 0 ||
                group.max_students - (group.members?.length || 0) <= 0
              }
            >
              {submitting ? (
                <LoadingSpinner />
              ) : language === "th" ? (
                "เพิ่มสมาชิก"
              ) : (
                "Add Member"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
