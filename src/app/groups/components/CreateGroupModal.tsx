import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Course, scheduleService } from "@/services/api/schedules";
import { CreateGroupRequest } from "@/types/group.types";
import { useEffect, useState } from "react";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (groupData: CreateGroupRequest) => void;
  isLoading: boolean;
  error: string | null;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  error,
}) => {
  const { language } = useLanguage();

  // Form state
  const [formData, setFormData] = useState<CreateGroupRequest>({
    group_name: "",
    course_id: 0,
    level: "beginner",
    max_students: 8,
    payment_status: "pending",
    description: "",
  });

  // Options data
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Load courses on modal open
  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await scheduleService.getCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (err) {
      console.error("Error loading courses:", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.group_name.trim()) {
      return;
    }
    if (formData.course_id === 0) {
      return;
    }
    if (formData.max_students < 1) {
      return;
    }

    onConfirm(formData);
  };

  const handleInputChange = (
    field: keyof CreateGroupRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl -m-6 mb-6">
          <DialogTitle className="text-2xl font-bold text-white">
            {language === "th" ? "สร้างกลุ่มเรียนใหม่" : "Create New Group"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Form */}
          <form
            id="create-group-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th" ? "ชื่อกลุ่ม" : "Group Name"} *
                </label>
                <input
                  type="text"
                  value={formData.group_name}
                  onChange={(e) =>
                    handleInputChange("group_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={
                    language === "th"
                      ? "เช่น English A1 Morning"
                      : "e.g. English A1 Morning"
                  }
                  required
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th" ? "คอร์สเรียน" : "Course"} *
                </label>
                {coursesLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <SearchableSelect
                    value={formData.course_id?.toString() || ""}
                    onValueChange={(value) =>
                      handleInputChange("course_id", parseInt(String(value)))
                    }
                    options={[
                      {
                        value: "0",
                        label:
                          language === "th" ? "เลือกคอร์ส" : "Select Course",
                      },
                      ...courses.map((course) => ({
                        value: course.id.toString(),
                        label: `${course.course_name} (${course.level})`,
                      })),
                    ]}
                    className="w-full"
                  />
                )}
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th" ? "ระดับ" : "Level"} *
                </label>
                <SearchableSelect
                  value={formData.level}
                  onValueChange={(value) =>
                    handleInputChange("level", String(value))
                  }
                  options={[
                    {
                      value: "beginner",
                      label: language === "th" ? "เริ่มต้น" : "Beginner",
                    },
                    {
                      value: "elementary",
                      label: language === "th" ? "พื้นฐาน" : "Elementary",
                    },
                    {
                      value: "pre-intermediate",
                      label:
                        language === "th"
                          ? "ก่อนระดับกลาง"
                          : "Pre-Intermediate",
                    },
                    {
                      value: "intermediate",
                      label: language === "th" ? "ระดับกลาง" : "Intermediate",
                    },
                    {
                      value: "upper-intermediate",
                      label:
                        language === "th"
                          ? "ระดับกลางสูง"
                          : "Upper-Intermediate",
                    },
                    {
                      value: "advanced",
                      label: language === "th" ? "ขั้นสูง" : "Advanced",
                    },
                    { value: "A1", label: "A1" },
                    { value: "A2", label: "A2" },
                    { value: "B1", label: "B1" },
                    { value: "B2", label: "B2" },
                    { value: "C1", label: "C1" },
                    { value: "C2", label: "C2" },
                  ]}
                  className="w-full"
                />
              </div>

              {/* Max Students */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th"
                    ? "จำนวนนักเรียนสูงสุด"
                    : "Maximum Students"}{" "}
                  *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.max_students}
                  onChange={(e) =>
                    handleInputChange("max_students", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th" ? "สถานะการชำระเงิน" : "Payment Status"}
                </label>
                <SearchableSelect
                  value={formData.payment_status}
                  onValueChange={(value) =>
                    handleInputChange(
                      "payment_status",
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

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th" ? "คำอธิบาย" : "Description"}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={
                    language === "th"
                      ? "คำอธิบายเพิ่มเติมเกี่ยวกับกลุ่ม..."
                      : "Additional description about the group..."
                  }
                />
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="bg-gray-50 px-6 py-4 border-t rounded-b-xl">
          {/* Actions */}
          <div className="flex justify-end gap-3 w-full">
            <Button
              type="button"
              onClick={onClose}
              variant="monthView"
              className="px-6 py-2"
              disabled={isLoading}
            >
              {language === "th" ? "ยกเลิก" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                const form = document.getElementById(
                  "create-group-form"
                ) as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              variant="monthViewClicked"
              className="px-6 py-2"
              disabled={
                isLoading ||
                formData.course_id === 0 ||
                !formData.group_name.trim()
              }
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : language === "th" ? (
                "สร้างกลุ่ม"
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
