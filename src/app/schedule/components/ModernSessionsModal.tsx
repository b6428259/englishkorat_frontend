"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  GraduationCapIcon,
  InfoIcon,
  PlusIcon,
  SparklesIcon,
  TagIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// Enhanced interfaces
interface ScheduleTimeSlot {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface CreateSessionsForm {
  schedule_id: string;
  course_id: string;
  teacher_id: string;
  student_ids: string[];
  start_date: string;
  end_date: string;
  session_count: number;
  time_slots: ScheduleTimeSlot[];
  notes: string;
  level: "beginner" | "intermediate" | "advanced";
}

interface Course {
  id: string;
  name: string;
  level: string;
  duration_hours: number;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface ModernSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (form: CreateSessionsForm) => Promise<void>;
  selectedScheduleId?: string;
  scheduleName?: string;
  courses: Course[];
  teachers: Teacher[];
  students: Student[];
  schedules?: Array<{ id: string; name: string; type?: string }>;
  availableSlots?: ScheduleTimeSlot[];
  isLoading?: boolean;
  error?: string;
  scheduleForm?: CreateSessionsForm;
  updateForm?: (updates: Partial<CreateSessionsForm>) => void;
}

export function ModernSessionsModal({
  isOpen,
  onClose,
  onConfirm,
  selectedScheduleId,
  scheduleName,
  courses,
  teachers,
  students,
  schedules = [],
  isLoading = false,
  error,
  scheduleForm: externalForm,
  updateForm: externalUpdate,
}: ModernSessionsModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("basic");

  // Internal form state
  const [internalForm, setInternalForm] = useState<CreateSessionsForm>({
    schedule_id: selectedScheduleId || "",
    course_id: "",
    teacher_id: "",
    student_ids: [],
    start_date: "",
    end_date: "",
    session_count: 1,
    time_slots: [],
    notes: "",
    level: "beginner",
  });

  // If an external form is provided along with an externalUpdate handler,
  // the parent is controlling the form and we should use externalForm.
  // If externalForm is provided but no externalUpdate exists, treat the
  // externalForm as a seed only and use internalForm (so inputs remain
  // fully interactive and controlled by this component).
  const sessionForm =
    externalForm && externalUpdate ? externalForm : internalForm;

  const updateForm = useCallback(
    (updates: Partial<CreateSessionsForm>) => {
      if (externalUpdate) {
        externalUpdate(updates);
      } else {
        setInternalForm((prev) => ({ ...prev, ...updates }));
      }
    },
    [externalUpdate]
  );

  useEffect(() => {
    // Seed internal form from externalForm only when the modal opens and
    // there is no externalUpdate handler. This prevents repeated overwrites
    // of user interactions if externalForm reference changes while modal is open.
    if (isOpen && externalForm && !externalUpdate) {
      setInternalForm((prev) => ({ ...prev, ...externalForm }));
    }
  }, [externalForm, externalUpdate, isOpen]);

  // Ensure date-only strings are converted to full RFC3339 timestamps
  const ensureDateTime = useCallback((d?: string | null) => {
    if (!d) return d;
    if (d.includes("T")) return d;
    try {
      return new Date(d + "T00:00:00Z").toISOString();
    } catch {
      return d;
    }
  }, []);

  // Enhanced validation
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!sessionForm.course_id)
      errors.push(
        language === "th" ? "กรุณาเลือกคอร์ส" : "Please select a course"
      );
    if (!sessionForm.teacher_id)
      errors.push(
        language === "th" ? "กรุณาเลือกครู" : "Please select a teacher"
      );
    if (!sessionForm.start_date)
      errors.push(
        language === "th" ? "กรุณาเลือกวันที่เริ่ม" : "Please select start date"
      );
    if (!sessionForm.end_date)
      errors.push(
        language === "th" ? "กรุณาเลือกวันที่สิ้นสุด" : "Please select end date"
      );
    if (sessionForm.session_count < 1)
      errors.push(
        language === "th"
          ? "จำนวนเซสชันต้องมากกว่า 0"
          : "Session count must be greater than 0"
      );
    if (sessionForm.time_slots.length === 0)
      errors.push(
        language === "th" ? "กรุณาเพิ่มช่วงเวลา" : "Please add time slots"
      );

    if (
      sessionForm.start_date &&
      sessionForm.end_date &&
      sessionForm.start_date > sessionForm.end_date
    ) {
      errors.push(
        language === "th"
          ? "วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด"
          : "Start date must be before end date"
      );
    }

    if (sessionForm.student_ids.length === 0) {
      warnings.push(
        language === "th" ? "ยังไม่มีนักเรียน" : "No students selected"
      );
    }

    return {
      errors,
      warnings,
      isValid: errors.length === 0,
      hasWarnings: warnings.length > 0,
    };
  }, [sessionForm, language]);

  const weekDays = [
    { value: "monday", label: language === "th" ? "จันทร์" : "Monday" },
    { value: "tuesday", label: language === "th" ? "อังคาร" : "Tuesday" },
    { value: "wednesday", label: language === "th" ? "พุธ" : "Wednesday" },
    { value: "thursday", label: language === "th" ? "พฤหัสบดี" : "Thursday" },
    { value: "friday", label: language === "th" ? "ศุกร์" : "Friday" },
    { value: "saturday", label: language === "th" ? "เสาร์" : "Saturday" },
    { value: "sunday", label: language === "th" ? "อาทิตย์" : "Sunday" },
  ];

  const addTimeSlot = () => {
    const newSlot: ScheduleTimeSlot = {
      day_of_week: "monday",
      start_time: "09:00",
      end_time: "12:00",
    };
    updateForm({
      time_slots: [...sessionForm.time_slots, newSlot],
    });
  };

  const removeTimeSlot = (index: number) => {
    const newTimeSlots = sessionForm.time_slots.filter((_, i) => i !== index);
    updateForm({ time_slots: newTimeSlots });
  };

  const updateTimeSlot = (
    index: number,
    updates: Partial<ScheduleTimeSlot>
  ) => {
    const newTimeSlots = sessionForm.time_slots.map((slot, i) =>
      i === index ? { ...slot, ...updates } : slot
    );
    updateForm({ time_slots: newTimeSlots });
  };

  const handleConfirm = useCallback(async () => {
    if (!validation.isValid) return;

    // Normalize date fields before sending
    const payload = {
      ...(sessionForm as CreateSessionsForm),
    } as CreateSessionsForm & Record<string, unknown>;
    if (payload.start_date != null && typeof payload.start_date === "string") {
      payload.start_date = ensureDateTime(
        payload.start_date as string
      ) as unknown as string;
    }
    if (payload.end_date != null && typeof payload.end_date === "string") {
      payload.end_date = ensureDateTime(
        payload.end_date as string
      ) as unknown as string;
    }

    try {
      await onConfirm(payload as CreateSessionsForm);
    } catch (err) {
      console.error("Error creating sessions:", err);
    }
  }, [validation.isValid, onConfirm, sessionForm, ensureDateTime]);

  const levelOptions = [
    {
      value: "beginner",
      label: language === "th" ? "เริ่มต้น" : "Beginner",
      description: language === "th" ? "สำหรับผู้เริ่มต้น" : "For beginners",
      color: "bg-green-100 text-green-800 border-green-300",
    },
    {
      value: "intermediate",
      label: language === "th" ? "ปานกลาง" : "Intermediate",
      description:
        language === "th" ? "สำหรับผู้มีพื้นฐาน" : "For intermediate learners",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    {
      value: "advanced",
      label: language === "th" ? "ขั้นสูง" : "Advanced",
      description:
        language === "th" ? "สำหรับผู้มีประสบการณ์" : "For advanced learners",
      color: "bg-purple-100 text-purple-800 border-purple-300",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col max-w-4xl max-h-[90vh] bg-white text-gray-700">
        <DialogHeader className="border-b border-gray-200 pb-4 relative">
          {/* ปุ่มปิด (X) */}
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
          </button>

          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3 pr-10">
            <SparklesIcon className="h-6 w-6 text-indigo-600" />
            {language === "th" ? "สร้างเซสชันใหม่" : "Create New Sessions"}
          </DialogTitle>
          {scheduleName && (
            <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {language === "th"
                    ? "สร้างเซสชันสำหรับ:"
                    : "Creating sessions for:"}{" "}
                  <strong>{scheduleName}</strong>
                </span>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4" />
                {language === "th" ? "พื้นฐาน" : "Basic"}
              </TabsTrigger>
              <TabsTrigger
                value="schedule-select"
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                {language === "th" ? "ตารางเรียน" : "Schedule"}
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                {language === "th" ? "นักเรียน" : "Students"}
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                {language === "th" ? "ตารางเวลา" : "Schedule"}
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                {language === "th" ? "พรีวิว" : "Preview"}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="schedule-select"
              className="flex-1 overflow-y-auto space-y-6"
            >
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-indigo-600" />
                  {language === "th" ? "เลือกตารางเรียน" : "Choose Schedule"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {language === "th" ? "ตารางเรียน *" : "Schedule *"}
                    </label>
                    <select
                      value={sessionForm.schedule_id}
                      onChange={(e) =>
                        updateForm({ schedule_id: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">
                        {language === "th"
                          ? "เลือกตารางเรียน"
                          : "Select Schedule"}
                      </option>
                      {schedules.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                          {s.type ? ` (${s.type})` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === "th"
                        ? "ประเภทตารางจะกำหนดรูปแบบและผู้เข้าร่วมของเซสชัน"
                        : "Schedule type determines session behavior and participants."}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Validation Status */}
            {(validation.errors.length > 0 ||
              validation.warnings.length > 0) && (
              <div className="mb-4 space-y-2">
                {validation.errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <XIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">
                          {language === "th" ? "กรุณาแก้ไข:" : "Please fix:"}
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1 mt-1">
                          {validation.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <InfoIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          {language === "th" ? "คำเตือน:" : "Warnings:"}
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1 mt-1">
                          {validation.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <TabsContent
              value="basic"
              className="flex-1 overflow-y-auto space-y-6"
            >
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCapIcon className="h-5 w-5 text-indigo-600" />
                  {language === "th" ? "คอร์สและครู" : "Course and Teacher"}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        {language === "th" ? "คอร์ส *" : "Course *"}
                      </label>
                      <select
                        value={sessionForm.course_id}
                        onChange={(e) =>
                          updateForm({ course_id: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">
                          {language === "th" ? "เลือกคอร์ส" : "Select Course"}
                        </option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name} - {course.level} (
                            {course.duration_hours}h)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        {language === "th" ? "ครู *" : "Teacher *"}
                      </label>
                      <select
                        value={sessionForm.teacher_id}
                        onChange={(e) =>
                          updateForm({ teacher_id: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">
                          {language === "th" ? "เลือกครู" : "Select Teacher"}
                        </option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name} ({teacher.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-3">
                      {language === "th"
                        ? "ระดับการเรียน *"
                        : "Learning Level *"}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {levelOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            updateForm({
                              level: option.value as
                                | "beginner"
                                | "intermediate"
                                | "advanced",
                            })
                          }
                          className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                            sessionForm.level === option.value
                              ? option.color
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <TagIcon className="h-5 w-5" />
                            <div>
                              <h4 className="font-medium">{option.label}</h4>
                              <p className="text-sm text-gray-600">
                                {option.description}
                              </p>
                            </div>
                            {sessionForm.level === option.value && (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 absolute top-2 right-2" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        {language === "th" ? "วันที่เริ่ม *" : "Start Date *"}
                      </label>
                      <input
                        type="date"
                        value={sessionForm.start_date}
                        onChange={(e) =>
                          updateForm({ start_date: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        {language === "th" ? "วันที่สิ้นสุด *" : "End Date *"}
                      </label>
                      <input
                        type="date"
                        value={sessionForm.end_date}
                        onChange={(e) =>
                          updateForm({ end_date: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min={
                          sessionForm.start_date ||
                          new Date().toISOString().split("T")[0]
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        {language === "th"
                          ? "จำนวนเซสชัน *"
                          : "Session Count *"}
                      </label>
                      <input
                        type="number"
                        value={sessionForm.session_count}
                        onChange={(e) =>
                          updateForm({
                            session_count: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="students" className="flex-1 overflow-y-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-indigo-600" />
                  {language === "th" ? "เลือกนักเรียน" : "Select Students"}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          sessionForm.student_ids.includes(student.id)
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          const isSelected = sessionForm.student_ids.includes(
                            student.id
                          );
                          const newStudentIds = isSelected
                            ? sessionForm.student_ids.filter(
                                (id) => id !== student.id
                              )
                            : [...sessionForm.student_ids, student.id];
                          updateForm({ student_ids: newStudentIds });
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {student.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {student.email}
                            </p>
                          </div>
                          {sessionForm.student_ids.includes(student.id) && (
                            <CheckCircleIcon className="h-5 w-5 text-indigo-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {sessionForm.student_ids.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        {language === "th" ? "เลือกแล้ว" : "Selected"}:{" "}
                        {sessionForm.student_ids.length}{" "}
                        {language === "th" ? "คน" : "students"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="flex-1 overflow-y-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-indigo-600" />
                    {language === "th" ? "ตารางเวลา" : "Time Schedule"}
                  </h3>
                  <Button
                    onClick={addTimeSlot}
                    variant="monthViewClicked"
                    className="px-4 py-2 text-sm flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    {language === "th" ? "เพิ่มช่วงเวลา" : "Add Time Slot"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {sessionForm.time_slots.map((slot, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {language === "th" ? "ช่วงเวลาที่" : "Time Slot"}{" "}
                          {index + 1}
                        </h4>
                        <button
                          onClick={() => removeTimeSlot(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                        >
                          <XIcon className="h-4 w-4" />
                          {language === "th" ? "ลบ" : "Remove"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            {language === "th" ? "วันในสัปดาห์" : "Day of Week"}
                          </label>
                          <select
                            value={slot.day_of_week}
                            onChange={(e) =>
                              updateTimeSlot(index, {
                                day_of_week: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            {weekDays.map((day) => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            {language === "th" ? "เวลาเริ่ม" : "Start Time"}
                          </label>
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) =>
                              updateTimeSlot(index, {
                                start_time: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            {language === "th" ? "เวลาสิ้นสุด" : "End Time"}
                          </label>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) =>
                              updateTimeSlot(index, {
                                end_time: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {sessionForm.time_slots.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>
                        {language === "th"
                          ? "ยังไม่มีช่วงเวลา คลิกเพิ่มช่วงเวลาเพื่อเริ่มต้น"
                          : 'No time slots added. Click "Add Time Slot" to start.'}
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {language === "th" ? "หมายเหตุ" : "Notes"}
                  </label>
                  <textarea
                    value={sessionForm.notes}
                    onChange={(e) => updateForm({ notes: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24 resize-none"
                    placeholder={
                      language === "th"
                        ? "เพิ่มหมายเหตุเพิ่มเติม..."
                        : "Add any additional notes..."
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-y-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5 text-indigo-600" />
                  {language === "th" ? "สรุปเซสชัน" : "Session Summary"}
                </h3>

                <div className="space-y-6">
                  {/* Basic Info Summary */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {language === "th"
                        ? "ข้อมูลเซสชัน"
                        : "Session Information"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm text-gray-600">
                          {courses.find((c) => c.id === sessionForm.course_id)
                            ?.name ||
                            (language === "th"
                              ? "ไม่ระบุคอร์ส"
                              : "No course selected")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm text-gray-600">
                          {teachers.find((t) => t.id === sessionForm.teacher_id)
                            ?.name ||
                            (language === "th"
                              ? "ไม่ระบุครู"
                              : "No teacher selected")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <TagIcon className="h-4 w-4 text-indigo-600" />
                        <Badge variant="outline">
                          {
                            levelOptions.find(
                              (l) => l.value === sessionForm.level
                            )?.label
                          }
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm text-gray-600">
                          {sessionForm.session_count}{" "}
                          {language === "th" ? "เซสชัน" : "sessions"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Students */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">
                      {language === "th"
                        ? "นักเรียนที่เลือก"
                        : "Selected Students"}{" "}
                      ({sessionForm.student_ids.length})
                    </h5>
                    {sessionForm.student_ids.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sessionForm.student_ids.map((studentId) => {
                          const student = students.find(
                            (s) => s.id === studentId
                          );
                          return student ? (
                            <div
                              key={studentId}
                              className="bg-gray-50 p-2 rounded text-sm"
                            >
                              {student.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {language === "th"
                          ? "ยังไม่มีนักเรียน"
                          : "No students selected"}
                      </p>
                    )}
                  </div>

                  {/* Time Slots */}
                  {sessionForm.time_slots.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">
                        {language === "th" ? "ตารางเวลา" : "Time Schedule"}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sessionForm.time_slots.map((slot, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {
                                  weekDays.find(
                                    (d) => d.value === slot.day_of_week
                                  )?.label
                                }
                              </span>
                              <span className="text-sm text-gray-600">
                                {slot.start_time} - {slot.end_time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validation Status */}
                  {validation.isValid && !validation.hasWarnings && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        <div>
                          <h4 className="text-sm font-semibold text-green-900">
                            {language === "th"
                              ? "พร้อมสร้างเซสชัน!"
                              : "Ready to Create Sessions!"}
                          </h4>
                          <p className="text-sm text-green-700">
                            {language === "th"
                              ? `จะสร้าง ${sessionForm.session_count} เซสชันสำหรับ ${sessionForm.time_slots.length} ช่วงเวลา`
                              : `Will create ${sessionForm.session_count} sessions across ${sessionForm.time_slots.length} time slots`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between w-full">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex items-center gap-3 ml-auto">
              <Button onClick={onClose} variant="monthView">
                {language === "th" ? "ยกเลิก" : "Cancel"}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!validation.isValid || isLoading}
                variant="monthViewClicked"
                className="px-6 py-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : language === "th" ? (
                  "สร้างเซสชัน"
                ) : (
                  "Create Sessions"
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModernSessionsModal;
