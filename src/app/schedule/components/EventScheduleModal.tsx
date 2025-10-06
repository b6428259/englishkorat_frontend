"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Combobox } from "@/components/ui/combobox";
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
  CreateScheduleInput as CreateScheduleRequest,
  Room,
  TeacherOption,
} from "@/services/api/schedules";
import { userService } from "@/services/user.service";
import type { User } from "@/types/auth.types";
import {
  ArrowLeft as ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HiDocumentText } from "react-icons/hi2";

interface ScheduleTimeSlot {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface EventScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onConfirm: (form: Partial<CreateScheduleRequest>) => Promise<void>;
  eventType: "meeting" | "appointment" | "event" | "personal" | "holiday";
  rooms: Room[];
  teachers: TeacherOption[];
  isLoading?: boolean;
  error?: string | null;
}

export default function EventScheduleModal({
  isOpen,
  onClose,
  onBack,
  onConfirm,
  eventType,
  rooms,
  teachers,
  isLoading = false,
  error,
}: EventScheduleModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"basic" | "schedule" | "preview">(
    "basic"
  );

  const [scheduleForm, setScheduleForm] = useState<
    Partial<CreateScheduleRequest>
  >({
    schedule_name: "",
    schedule_type: eventType,
    teacher_id: 0,
    room_id: 0,
    start_date: new Date().toISOString().split("T")[0],
    session_start_time: "09:00",
    time_slots: [],
    auto_reschedule: true,
    notes: "",
    participant_user_ids: [],
    recurring_pattern: undefined,
    session_per_week: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Participants management
  const [participantQuery, setParticipantQuery] = useState("");
  const [participantRole, setParticipantRole] = useState<User["role"] | "all">(
    "all"
  );
  const [participantResults, setParticipantResults] = useState<User[]>([]);
  const [participantLoading, setParticipantLoading] = useState(false);
  const [participantMap, setParticipantMap] = useState<Record<number, User>>(
    {}
  );

  const eventTypeLabels = useMemo(
    () => ({
      meeting: language === "th" ? "การประชุม" : "Meeting",
      appointment: language === "th" ? "นัดหมาย" : "Appointment",
      event: language === "th" ? "อีเวนต์" : "Event",
      personal: language === "th" ? "ส่วนตัว" : "Personal",
      holiday: language === "th" ? "วันหยุด" : "Holiday",
    }),
    [language]
  );

  const weekDays = useMemo(
    () => [
      { value: "sunday", label: language === "th" ? "อาทิตย์" : "Sunday" },
      { value: "monday", label: language === "th" ? "จันทร์" : "Monday" },
      { value: "tuesday", label: language === "th" ? "อังคาร" : "Tuesday" },
      { value: "wednesday", label: language === "th" ? "พุธ" : "Wednesday" },
      { value: "thursday", label: language === "th" ? "พฤหัสบดี" : "Thursday" },
      { value: "friday", label: language === "th" ? "ศุกร์" : "Friday" },
      { value: "saturday", label: language === "th" ? "เสาร์" : "Saturday" },
    ],
    [language]
  );

  const formatTeacherLabel = useCallback(
    (teacher: TeacherOption) => {
      if (!teacher) return "";
      if (language === "th") {
        const first = teacher.first_th || teacher.first_en || "";
        const last = teacher.last_th || teacher.last_en || "";
        const nick =
          teacher.nickname_th ||
          teacher.nickname_en ||
          teacher.teacher_nickname ||
          "";
        const name =
          `${first}${last ? " " + last : ""}`.trim() ||
          teacher.teacher_name ||
          teacher.username ||
          "";
        return nick ? `${name} (${nick})` : name;
      }
      const first = teacher.first_en || teacher.first_th || "";
      const last = teacher.last_en || teacher.last_th || "";
      const nick =
        teacher.nickname_en ||
        teacher.nickname_th ||
        teacher.teacher_nickname ||
        "";
      const name =
        `${first}${last ? " " + last : ""}`.trim() ||
        teacher.teacher_name ||
        teacher.username ||
        "";
      return nick ? `${name} (${nick})` : name;
    },
    [language]
  );

  const teacherOptions = useMemo(
    () =>
      (teachers ?? [])
        .filter(
          (teacher): teacher is TeacherOption & { id: number } =>
            !!teacher && typeof teacher.id === "number"
        )
        .map((teacher) => ({
          value: teacher.id.toString(),
          label: formatTeacherLabel(teacher),
        })),
    [teachers, formatTeacherLabel]
  );

  const roomOptions = useMemo(
    () =>
      (rooms ?? [])
        .filter(
          (room): room is Room & { id: number } =>
            !!room && typeof room.id === "number"
        )
        .map((room) => ({
          value: room.id.toString(),
          label: room.room_name,
          description: `${language === "th" ? "ความจุ" : "Capacity"}: ${
            room.capacity
          }`,
        })),
    [rooms, language]
  );

  const participantRoleOptions = useMemo(
    () => [
      { value: "all", label: language === "th" ? "ทุกบทบาท" : "All roles" },
      { value: "student", label: language === "th" ? "นักเรียน" : "Student" },
      { value: "teacher", label: language === "th" ? "ครู" : "Teacher" },
      { value: "admin", label: "Admin" },
      { value: "owner", label: "Owner" },
    ],
    [language]
  );

  const updateForm = useCallback((updates: Partial<CreateScheduleRequest>) => {
    setScheduleForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const addTimeSlot = useCallback(() => {
    const newSlot: ScheduleTimeSlot = {
      day_of_week: "monday",
      start_time: "09:00",
      end_time: "12:00",
    };
    updateForm({ time_slots: [...(scheduleForm.time_slots || []), newSlot] });
  }, [scheduleForm.time_slots, updateForm]);

  const removeTimeSlot = useCallback(
    (index: number) => {
      const newTimeSlots = (scheduleForm.time_slots || []).filter(
        (_, i) => i !== index
      );
      updateForm({ time_slots: newTimeSlots });
    },
    [scheduleForm.time_slots, updateForm]
  );

  const updateTimeSlot = useCallback(
    (index: number, updates: Partial<ScheduleTimeSlot>) => {
      const newTimeSlots = (scheduleForm.time_slots || []).map((slot, i) =>
        i === index ? { ...slot, ...updates } : slot
      );
      updateForm({ time_slots: newTimeSlots });
    },
    [scheduleForm.time_slots, updateForm]
  );

  const participantIds = useMemo(
    () => (scheduleForm.participant_user_ids || []) as number[],
    [scheduleForm.participant_user_ids]
  );

  const addParticipant = useCallback(
    (user: User) => {
      if (participantIds.includes(user.id)) return;
      updateForm({ participant_user_ids: [...participantIds, user.id] });
      setParticipantMap((prev) => ({ ...prev, [user.id]: user }));
    },
    [participantIds, updateForm]
  );

  const removeParticipant = useCallback(
    (userId: number) => {
      updateForm({
        participant_user_ids: participantIds.filter((id) => id !== userId),
      });
      setParticipantMap((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    },
    [participantIds, updateForm]
  );

  // Search participants
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const timer = window.setTimeout(async () => {
      try {
        setParticipantLoading(true);
        const roleParam =
          participantRole === "all" ? undefined : participantRole;
        const res = await userService.getUsers(1, 10, {
          role: roleParam as User["role"] | undefined,
          search: participantQuery || undefined,
        });
        if (!mounted) return;

        const maybeRes = res as unknown;
        const shaped = maybeRes as
          | { data?: { users?: User[] }; users?: User[] }
          | undefined;
        const usersFromData = shaped?.data?.users;
        const usersRoot = shaped?.users;
        const users = Array.isArray(usersFromData)
          ? usersFromData
          : Array.isArray(usersRoot)
          ? usersRoot
          : ([] as User[]);

        type StudentShape = {
          first_name?: string;
          last_name?: string;
          nickname?: string;
        };
        const normalized = users.map((u) => {
          const uu = u as User & { student?: StudentShape };
          const displayName =
            uu.student?.first_name ||
            uu.student?.nickname ||
            uu.username ||
            uu.email ||
            `User #${uu.id}`;
          return { ...uu, displayName } as User & { displayName?: string };
        });
        setParticipantResults(normalized as unknown as User[]);
      } catch {
        setParticipantResults([]);
      } finally {
        if (mounted) setParticipantLoading(false);
      }
    }, 300);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [participantQuery, participantRole, isOpen]);

  const handleConfirm = useCallback(async () => {
    const payload: Partial<CreateScheduleRequest> = {
      ...scheduleForm,
      schedule_type: eventType,
    };

    if (payload.start_date && !payload.start_date.includes("T")) {
      payload.start_date = new Date(
        payload.start_date + "T00:00:00Z"
      ).toISOString();
    }

    // Clean up
    if (!payload.recurring_pattern || payload.recurring_pattern === "none") {
      payload.recurring_pattern = undefined;
      payload.session_per_week = undefined;
    }

    if (!payload.teacher_id || payload.teacher_id === 0) {
      payload.teacher_id = undefined as unknown as number;
    }
    if (!payload.room_id || payload.room_id === 0) {
      payload.room_id = undefined as unknown as number;
    }
    if (
      Array.isArray(payload.participant_user_ids) &&
      payload.participant_user_ids.length === 0
    ) {
      payload.participant_user_ids = undefined as unknown as number[];
    }
    if (Array.isArray(payload.time_slots) && payload.time_slots.length === 0) {
      payload.time_slots = undefined as unknown as ScheduleTimeSlot[];
    }

    setIsSubmitting(true);
    try {
      await onConfirm(payload);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error creating event schedule:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [scheduleForm, eventType, onConfirm]);

  useEffect(() => {
    if (!showSuccessModal) return;
    const t = window.setTimeout(() => {
      setShowSuccessModal(false);
      onClose();
    }, 1500);
    return () => window.clearTimeout(t);
  }, [showSuccessModal, onClose]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("basic");
      updateForm({ schedule_type: eventType });
    }
  }, [isOpen, eventType, updateForm]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        {isOpen && (
          <DialogContent className="flex flex-col max-w-4xl max-h-[90vh] bg-white animate-in fade-in-0 zoom-in-95 slide-in-from-top-8 duration-300">
            <DialogHeader className="border-b border-gray-200 pb-6 bg-gradient-to-r from-emerald-50 to-teal-50 -m-6 mb-6 px-6 pt-6">
              <div className="flex items-center gap-3">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                  </button>
                )}
                <div className="flex-1">
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                      <CalendarIcon className="h-8 w-8 text-white" />
                    </div>
                    {language === "th" ? "สร้าง" : "Create"}{" "}
                    {eventTypeLabels[eventType]}
                  </DialogTitle>
                  <p className="text-gray-600 mt-2">
                    {language === "th"
                      ? "กำหนดรายละเอียดและผู้เข้าร่วม"
                      : "Set up details and participants"}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                className="h-full flex flex-col"
              >
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <BookOpenIcon className="h-4 w-4" />
                    {language === "th" ? "ข้อมูลพื้นฐาน" : "Basic Info"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="schedule"
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <ClockIcon className="h-4 w-4" />
                    {language === "th" ? "ตารางเวลา" : "Schedule"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    {language === "th" ? "พรีวิว" : "Preview"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="basic"
                  className="flex-1 overflow-y-auto space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300"
                >
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <HiDocumentText className="h-5 w-5 text-emerald-600" />
                      {language === "th"
                        ? "ข้อมูลพื้นฐาน"
                        : "Basic Information"}
                    </h3>

                    <div className="space-y-4">
                      {/* Event Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === "th" ? "ชื่อ" : "Name"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={scheduleForm.schedule_name || ""}
                          onChange={(e) =>
                            updateForm({ schedule_name: e.target.value })
                          }
                          className="w-full h-12 px-4 text-base border border-gray-300 hover:border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-colors bg-white"
                          placeholder={
                            language === "th"
                              ? eventType === "meeting"
                                ? "เช่น: Team Planning Meeting"
                                : eventType === "holiday"
                                ? "เช่น: New Year Holiday"
                                : "เช่น: Important Event"
                              : eventType === "meeting"
                              ? "e.g., Team Planning Meeting"
                              : eventType === "holiday"
                              ? "e.g., New Year Holiday"
                              : "e.g., Important Event"
                          }
                        />
                      </div>

                      {/* Teacher & Room */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "th"
                              ? "ผู้จัด/ผู้รับผิดชอบ"
                              : "Organizer"}
                          </label>
                          <Combobox
                            value={
                              scheduleForm.teacher_id &&
                              scheduleForm.teacher_id > 0
                                ? scheduleForm.teacher_id.toString()
                                : undefined
                            }
                            onValueChange={(value) =>
                              updateForm({ teacher_id: Number(value) || 0 })
                            }
                            placeholder={
                              language === "th"
                                ? "เลือกผู้จัด"
                                : "Select Organizer"
                            }
                            emptyText={
                              language === "th" ? "ไม่พบ" : "Not found"
                            }
                            searchPlaceholder={
                              language === "th" ? "ค้นหา..." : "Search..."
                            }
                            options={teacherOptions}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "th" ? "สถานที่" : "Location"}
                          </label>
                          <Combobox
                            value={
                              scheduleForm.room_id && scheduleForm.room_id > 0
                                ? scheduleForm.room_id.toString()
                                : undefined
                            }
                            onValueChange={(value) =>
                              updateForm({ room_id: Number(value) || 0 })
                            }
                            placeholder={
                              language === "th"
                                ? "เลือกสถานที่"
                                : "Select Location"
                            }
                            emptyText={
                              language === "th" ? "ไม่พบ" : "Not found"
                            }
                            searchPlaceholder={
                              language === "th" ? "ค้นหา..." : "Search..."
                            }
                            options={roomOptions}
                          />
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "th" ? "วันที่" : "Date"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={scheduleForm.start_date || ""}
                            onChange={(e) =>
                              updateForm({ start_date: e.target.value })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "th" ? "เวลาเริ่ม" : "Start Time"}
                          </label>
                          <input
                            type="time"
                            value={scheduleForm.session_start_time || "09:00"}
                            onChange={(e) =>
                              updateForm({ session_start_time: e.target.value })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Recurring Pattern (optional for events) */}
                      {eventType !== "holiday" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === "th"
                                ? "รูปแบบการเกิดซ้ำ"
                                : "Recurring Pattern"}
                            </label>
                            <select
                              value={scheduleForm.recurring_pattern || "none"}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateForm({
                                  recurring_pattern:
                                    val === "none"
                                      ? undefined
                                      : (val as
                                          | "weekly"
                                          | "bi-weekly"
                                          | "monthly"),
                                });
                              }}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                              <option value="none">
                                {language === "th"
                                  ? "ไม่มี (ครั้งเดียว)"
                                  : "None (One-time)"}
                              </option>
                              <option value="weekly">
                                {language === "th" ? "รายสัปดาห์" : "Weekly"}
                              </option>
                              <option value="bi-weekly">
                                {language === "th"
                                  ? "ทุก 2 สัปดาห์"
                                  : "Bi-weekly"}
                              </option>
                              <option value="monthly">
                                {language === "th" ? "รายเดือน" : "Monthly"}
                              </option>
                            </select>
                          </div>

                          {scheduleForm.recurring_pattern &&
                            scheduleForm.recurring_pattern !== "none" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {language === "th"
                                    ? "จำนวนครั้งต่อสัปดาห์"
                                    : "Times Per Week"}
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={7}
                                  value={scheduleForm.session_per_week || 1}
                                  onChange={(e) =>
                                    updateForm({
                                      session_per_week:
                                        parseInt(e.target.value) || 1,
                                    })
                                  }
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                              </div>
                            )}
                        </div>
                      )}

                      {/* Participants Section */}
                      <Separator className="my-4" />
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <UsersIcon className="h-5 w-5 text-emerald-600" />
                          {language === "th" ? "ผู้เข้าร่วม" : "Participants"}
                        </h4>

                        {/* Search Participants */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={participantQuery}
                              onChange={(e) =>
                                setParticipantQuery(e.target.value)
                              }
                              placeholder={
                                language === "th"
                                  ? "ค้นหาผู้ใช้..."
                                  : "Search users..."
                              }
                              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                            <select
                              value={participantRole}
                              onChange={(e) =>
                                setParticipantRole(
                                  e.target.value as typeof participantRole
                                )
                              }
                              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                              {participantRoleOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Search Results */}
                          <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                            {participantLoading ? (
                              <div className="p-3 text-sm text-gray-500">
                                {language === "th"
                                  ? "กำลังค้นหา..."
                                  : "Searching..."}
                              </div>
                            ) : participantResults.length === 0 ? (
                              <div className="p-3 text-sm text-gray-500">
                                {language === "th"
                                  ? "ไม่พบผู้ใช้"
                                  : "No users found"}
                              </div>
                            ) : (
                              <div className="divide-y">
                                {participantResults.map(
                                  (u: User & { displayName?: string }) => {
                                    const already = participantIds.includes(
                                      u.id
                                    );
                                    const display =
                                      u.displayName ||
                                      u.username ||
                                      u.email ||
                                      `User #${u.id}`;
                                    return (
                                      <div
                                        key={u.id}
                                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                                      >
                                        <div>
                                          <div className="text-sm font-medium">
                                            {display}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {u.email} · {u.role}
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                                          onClick={() => addParticipant(u)}
                                          disabled={already}
                                        >
                                          {already
                                            ? language === "th"
                                              ? "เพิ่มแล้ว"
                                              : "Added"
                                            : language === "th"
                                            ? "เพิ่ม"
                                            : "Add"}
                                        </button>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>

                          {/* Selected Participants */}
                          {participantIds.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                {language === "th"
                                  ? "ผู้เข้าร่วมที่เลือก:"
                                  : "Selected Participants:"}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {participantIds.map((userId) => {
                                  const user = participantMap[userId];
                                  const display =
                                    user?.username ||
                                    user?.email ||
                                    `User #${userId}`;
                                  return (
                                    <span
                                      key={userId}
                                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                                    >
                                      {display}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeParticipant(userId)
                                        }
                                        className="ml-1 hover:text-emerald-900"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="schedule"
                  className="flex-1 overflow-y-auto animate-in fade-in-0 slide-in-from-right-4 duration-300"
                >
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-emerald-600" />
                        {language === "th" ? "ตารางเวลา" : "Schedule"}
                      </h3>
                      <Button
                        onClick={addTimeSlot}
                        variant="monthViewClicked"
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        {language === "th" ? "เพิ่มช่วงเวลา" : "Add Time Slot"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(scheduleForm.time_slots || []).map((slot, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {language === "th" ? "ช่วงเวลา" : "Time Slot"}{" "}
                              {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              {language === "th" ? "ลบ" : "Remove"}
                            </button>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              {language === "th" ? "วัน" : "Day"}
                            </label>
                            <select
                              value={slot.day_of_week}
                              onChange={(e) =>
                                updateTimeSlot(index, {
                                  day_of_week: e.target.value,
                                })
                              }
                              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                              {weekDays.map((day) => (
                                <option key={day.value} value={day.value}>
                                  {day.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                {language === "th" ? "เริ่ม" : "Start"}
                              </label>
                              <input
                                type="time"
                                value={slot.start_time}
                                onChange={(e) =>
                                  updateTimeSlot(index, {
                                    start_time: e.target.value,
                                  })
                                }
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                {language === "th" ? "สิ้นสุด" : "End"}
                              </label>
                              <input
                                type="time"
                                value={slot.end_time}
                                onChange={(e) =>
                                  updateTimeSlot(index, {
                                    end_time: e.target.value,
                                  })
                                }
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {(scheduleForm.time_slots || []).length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          {language === "th"
                            ? "ยังไม่มีช่วงเวลา - คลิกเพิ่มช่วงเวลาเพื่อเริ่มต้น"
                            : "No time slots - Click 'Add Time Slot' to start"}
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === "th" ? "หมายเหตุ" : "Notes"}
                        </label>
                        <textarea
                          value={scheduleForm.notes || ""}
                          onChange={(e) =>
                            updateForm({ notes: e.target.value })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-24 resize-none"
                          placeholder={
                            language === "th"
                              ? "เพิ่มหมายเหตุ (ถ้ามี)"
                              : "Add notes (optional)"
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="auto_reschedule"
                          checked={scheduleForm.auto_reschedule || false}
                          onChange={(e) =>
                            updateForm({ auto_reschedule: e.target.checked })
                          }
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="auto_reschedule"
                          className="text-sm text-gray-700"
                        >
                          {language === "th"
                            ? "ข้ามวันหยุดอัตโนมัติ"
                            : "Automatically skip holidays"}
                        </label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="preview"
                  className="flex-1 overflow-y-auto animate-in fade-in-0 slide-in-from-right-4 duration-300"
                >
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <HiDocumentText className="h-5 w-5 text-emerald-600" />
                      {language === "th" ? "สรุป" : "Summary"}
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {scheduleForm.schedule_name || "—"}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">
                              {language === "th" ? "ประเภท:" : "Type:"}
                            </span>
                            <span className="ml-2 font-medium">
                              {eventTypeLabels[eventType]}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {language === "th" ? "วันที่:" : "Date:"}
                            </span>
                            <span className="ml-2 font-medium">
                              {scheduleForm.start_date || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {language === "th" ? "เวลา:" : "Time:"}
                            </span>
                            <span className="ml-2 font-medium">
                              {scheduleForm.session_start_time || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {language === "th" ? "รูปแบบ:" : "Pattern:"}
                            </span>
                            <span className="ml-2 font-medium">
                              {scheduleForm.recurring_pattern ||
                                (language === "th" ? "ครั้งเดียว" : "One-time")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {participantIds.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            {language === "th" ? "ผู้เข้าร่วม" : "Participants"}{" "}
                            ({participantIds.length})
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {participantIds.map((userId) => {
                              const user = participantMap[userId];
                              const display =
                                user?.username ||
                                user?.email ||
                                `User #${userId}`;
                              return (
                                <span
                                  key={userId}
                                  className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                                >
                                  {display}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {(scheduleForm.time_slots || []).length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            {language === "th" ? "ช่วงเวลา" : "Time Slots"}
                          </h5>
                          <div className="space-y-2">
                            {scheduleForm.time_slots!.map((slot, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                              >
                                <span className="font-medium capitalize">
                                  {slot.day_of_week}
                                </span>
                                <span className="text-gray-600">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {scheduleForm.notes && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            {language === "th" ? "หมายเหตุ" : "Notes"}
                          </h5>
                          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                            {scheduleForm.notes}
                          </p>
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
                  {activeTab !== "basic" && (
                    <Button
                      onClick={() =>
                        setActiveTab((prev) =>
                          prev === "preview" ? "schedule" : "basic"
                        )
                      }
                      variant="monthView"
                    >
                      {language === "th" ? "ย้อนกลับ" : "Back"}
                    </Button>
                  )}
                  <Button onClick={onClose} variant="monthView">
                    {language === "th" ? "ยกเลิก" : "Cancel"}
                  </Button>
                  {activeTab !== "preview" ? (
                    <Button
                      onClick={() =>
                        setActiveTab((prev) =>
                          prev === "basic" ? "schedule" : "preview"
                        )
                      }
                      variant="monthViewClicked"
                      className="px-6 py-2 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      {language === "th" ? "ต่อไป" : "Next"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConfirm}
                      disabled={isLoading || isSubmitting}
                      variant="monthViewClicked"
                      className="px-6 py-2 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting || isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : language === "th" ? (
                        "สร้าง"
                      ) : (
                        "Create"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Success Modal */}
      {showSuccessModal && (
        <Dialog
          open={showSuccessModal}
          onOpenChange={(open) =>
            !open && (setShowSuccessModal(false), onClose())
          }
        >
          <DialogContent className="max-w-md animate-in fade-in-0 zoom-in-90 duration-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="animate-in zoom-in-0 spin-in-180 duration-500">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
                {language === "th" ? "สร้างเรียบร้อย" : "Created Successfully"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-100">
              <p className="text-sm text-gray-700">
                {language === "th"
                  ? `${eventTypeLabels[eventType]}ถูกสร้างเรียบร้อยแล้ว`
                  : `The ${eventTypeLabels[
                      eventType
                    ].toLowerCase()} was created successfully.`}
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => (setShowSuccessModal(false), onClose())}
                variant="monthViewClicked"
              >
                {language === "th" ? "ตกลง" : "OK"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
