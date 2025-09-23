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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { groupService } from "@/services/api/groups";
import {
  Course,
  CreateScheduleInput as CreateScheduleRequest,
  Room,
  TeacherOption,
} from "@/services/api/schedules";
import { userService } from "@/services/user.service";
import type { User } from "@/types/auth.types";
import { CreateGroupRequest, GroupOption, Student } from "@/types/group.types";
import {
  deriveScheduleFields,
  validateScheduleForm,
  type ValidationIssue,
} from "@/utils/scheduleValidation";
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiDocumentText } from "react-icons/hi2";

interface ScheduleTimeSlot {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface ModernScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (form: Partial<CreateScheduleRequest>) => Promise<void>;
  scheduleForm?: Partial<CreateScheduleRequest>;
  updateForm?: (form: Partial<CreateScheduleRequest>) => void;
  /** Which tab should the flow start on when opening. Defaults to "basic". */
  initialTab?: "basic" | "schedule" | "preview";
  courses: Course[];
  rooms: Room[];
  teachers: TeacherOption[];
  groups?: GroupOption[];
  isLoading?: boolean;
  error?: string | null;
}

export default function ModernScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  scheduleForm: externalForm,
  updateForm: externalUpdate,
  initialTab = "basic",
  courses,
  rooms,
  teachers,
  groups = [],
  isLoading = false,
  error,
}: ModernScheduleModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Internal form state
  const [internalForm, setInternalForm] = useState<
    Partial<CreateScheduleRequest>
  >({
    schedule_name: "",
    schedule_type: "class",
    course_id: 0,
    group_id: 0,
    teacher_id: 0,
    default_teacher_id: 0,
    room_id: 0,
    total_hours: undefined,
    hours_per_session: undefined,
    max_students: 6,
    start_date: new Date().toISOString().split("T")[0],
    session_start_time: "09:00", // Default start time for one-off events
    time_slots: [],
    auto_reschedule: true,
    notes: "",
    participant_user_ids: [],
  });

  const scheduleForm = externalForm || internalForm;

  const updateForm = useCallback(
    (updates: Partial<CreateScheduleRequest>) => {
      console.log("updateForm called with:", updates);
      if (externalUpdate) {
        console.log("Using externalUpdate");
        externalUpdate(updates);
      } else {
        console.log("Using internal setInternalForm");
        setInternalForm((prev) => {
          console.log("Previous internal form:", prev);
          const updated = { ...prev, ...updates };
          console.log("Updated internal form:", updated);
          return updated;
        });
      }
    },
    [externalUpdate]
  );

  // Track if modal has been opened to avoid resetting tab on every render
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  useEffect(() => {
    // When external form is provided and not controlled, sync once
    if (externalForm && !externalUpdate) {
      setInternalForm(externalForm);
    }
  }, [externalForm, externalUpdate]);

  useEffect(() => {
    // Reset tab only when modal opens for the first time
    if (isOpen && !hasBeenOpened) {
      setActiveTab(initialTab);
      setHasBeenOpened(true);
    } else if (!isOpen && hasBeenOpened) {
      // Reset the flag when modal closes so it can reset again on next open
      setHasBeenOpened(false);
    }
  }, [isOpen, hasBeenOpened, initialTab]);

  // Validation (debounced to avoid running expensive checks on every keystroke)
  // Start empty to avoid doing expensive validation on initial mount when modal is closed.
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [derivedFields, setDerivedFields] = useState(() =>
    deriveScheduleFields(scheduleForm)
  );
  const validateTimer = useRef<number | undefined>(undefined);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Helpers to avoid unnecessary state updates which can cause jank
  const issuesEqual = useCallback(
    (a: ValidationIssue[], b: ValidationIssue[]) => {
      if (a === b) return true;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i].field !== b[i].field || a[i].message !== b[i].message)
          return false;
      }
      return true;
    },
    []
  );

  const derivedEqual = useCallback(
    (a: typeof derivedFields, b: typeof derivedFields) => {
      if (a === b) return true;
      return (
        a.estimated_end_date === b.estimated_end_date &&
        a.total_sessions === b.total_sessions
      );
    },
    []
  );

  useEffect(() => {
    // Only validate while the modal is open. This prevents background work when the
    // modal is mounted but hidden and reduces jank when opening.
    if (!isOpen) return;

    // debounce (slightly longer to reduce revalidation frequency while typing)
    if (validateTimer.current) window.clearTimeout(validateTimer.current);
    validateTimer.current = window.setTimeout(() => {
      // Use functional updates and shallow equality checks to avoid re-render churn
      setIssues((prev) => {
        const next = validateScheduleForm(scheduleForm);
        return issuesEqual(prev, next) ? prev : next;
      });
      setDerivedFields((prev) => {
        const next = deriveScheduleFields(scheduleForm);
        return derivedEqual(prev, next) ? prev : next;
      });
    }, 400) as unknown as number;

    return () => {
      if (validateTimer.current) {
        window.clearTimeout(validateTimer.current);
        validateTimer.current = undefined;
      }
    };
  }, [scheduleForm, isOpen, issuesEqual, derivedEqual]);

  // Run a fast validation when the modal opens so the UI shows immediate feedback
  // without waiting for the debounce timer.
  useEffect(() => {
    if (!isOpen) return;
    // Run an immediate, but minimal, validation on open. Use equality checks to
    // avoid unnecessary state updates which may cause UI jank when the modal
    // mounts.
    setIssues((prev) => {
      const next = validateScheduleForm(scheduleForm);
      return issuesEqual(prev, next) ? prev : next;
    });
    setDerivedFields((prev) => {
      const next = deriveScheduleFields(scheduleForm);
      return derivedEqual(prev, next) ? prev : next;
    });
  }, [isOpen, scheduleForm, issuesEqual, derivedEqual]);

  const getFieldError = useCallback(
    (field: string) => issues.find((i) => i.field === field)?.message,
    [issues]
  );
  const hasErrors = issues.length > 0;
  const { estimated_end_date, total_sessions } = derivedFields;

  // Memoize labels so arrays/objects are not re-created each render
  const scheduleTypes = useMemo(
    () => [
      {
        value: "class",
        label: language === "th" ? "คลาสเรียน" : "Class",
        icon: UsersIcon,
      },
      {
        value: "meeting",
        label: language === "th" ? "ประชุม" : "Meeting",
        icon: CalendarIcon,
      },
      {
        value: "event",
        label: language === "th" ? "อีเวนต์" : "Event",
        icon: CalendarIcon,
      },
      {
        value: "appointment",
        label: language === "th" ? "นัดหมาย" : "Appointment",
        icon: CalendarIcon,
      },
      {
        value: "personal",
        label: language === "th" ? "ส่วนตัว" : "Personal",
        icon: BookOpenIcon,
      },
      {
        value: "holiday",
        label: language === "th" ? "วันหยุด" : "Holiday",
        icon: CalendarIcon,
      },
    ],
    [language]
  );

  // Group creation state for class schedules
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupForm, setGroupForm] = useState<CreateGroupRequest>({
    group_name: "",
    course_id: 0,
    level: "beginner",
    max_students: 6,
    payment_status: "pending",
    description: "",
  });
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [groupLoading, setGroupLoading] = useState(false);

  // Participants picker state (for non-class schedules)
  const [participantQuery, setParticipantQuery] = useState("");
  const [participantRole, setParticipantRole] = useState<User["role"] | "all">(
    "all"
  );
  const [participantResults, setParticipantResults] = useState<User[]>([]);
  const [participantLoading, setParticipantLoading] = useState(false);
  const [participantMap, setParticipantMap] = useState<Record<number, User>>(
    {}
  );

  // Debounced search
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
        // API sometimes returns { data: { users: [] } } or { users: [] }
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
        // Normalize display fields (some users have student.first_name)
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
  // Memoize participant ids array to avoid recreating on each render
  const participantIds = useMemo(
    () => (scheduleForm.participant_user_ids || []) as number[],
    [scheduleForm.participant_user_ids]
  );
  const addParticipant = useCallback(
    (user: User) => {
      const existing = participantIds;
      if (existing.includes(user.id)) return;
      updateForm({ participant_user_ids: [...existing, user.id] });
      setParticipantMap((prev) => ({ ...prev, [user.id]: user }));
    },
    [participantIds, updateForm]
  );

  const removeParticipant = useCallback(
    (userId: number) => {
      const existing = participantIds;
      updateForm({
        participant_user_ids: existing.filter((id) => id !== userId),
      });
      setParticipantMap((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    },
    [participantIds, updateForm]
  );

  // Render participant list (memoized via useCallback) to reduce JSX churn
  const renderParticipantList = useCallback(() => {
    if (participantLoading) {
      return (
        <div className="p-3 text-sm text-gray-500">
          {language === "th" ? "กำลังค้นหา..." : "Searching..."}
        </div>
      );
    }
    if (participantResults.length === 0) {
      return (
        <div className="p-3 text-sm text-gray-500">
          {language === "th" ? "ไม่พบผู้ใช้" : "No users found"}
        </div>
      );
    }
    return (
      <ul>
        {participantResults.map((u: User & { displayName?: string }) => {
          const already = participantIds.includes(u.id);
          const display =
            u.displayName || u.username || u.email || `User #${u.id}`;
          return (
            <li
              key={u.id}
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <div>
                <div className="text-sm font-medium">{display}</div>
                <div className="text-xs text-gray-500">
                  {u.email} · {u.role}
                </div>
              </div>
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
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
            </li>
          );
        })}
      </ul>
    );
  }, [
    participantLoading,
    participantResults,
    participantIds,
    language,
    addParticipant,
  ]);

  // Helper: determine if current schedule type requires course/group fields
  const isClassSchedule = scheduleForm.schedule_type === "class";

  // Group creation functions
  const handleCreateGroup = useCallback(async () => {
    try {
      setGroupLoading(true);
      const newGroup = await groupService.createGroup(groupForm);
      if (newGroup) {
        // Update the form to select the new group
        updateForm({ group_id: newGroup.id });

        // Add students to the group if any selected
        if (selectedStudents.length > 0) {
          await Promise.all(
            selectedStudents.map((studentId) =>
              groupService.addMember(newGroup.id.toString(), {
                student_id: studentId,
                payment_status: groupForm.payment_status,
              })
            )
          );
        }

        setShowCreateGroup(false);
        // Reset form
        setGroupForm({
          group_name: "",
          course_id: 0,
          level: "beginner",
          max_students: 6,
          payment_status: "pending",
          description: "",
        });
        setSelectedStudents([]);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setGroupLoading(false);
    }
  }, [groupForm, selectedStudents, updateForm]);

  // Load available students when creating a group
  useEffect(() => {
    if (showCreateGroup) {
      groupService.getAvailableStudents().then(setAvailableStudents);
    }
  }, [showCreateGroup]);

  // Helper: format teacher label as "First Last (Nickname)" according to language with fallbacks
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
      // default to English
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

  const addTimeSlot = useCallback(() => {
    const newSlot: ScheduleTimeSlot = {
      day_of_week: "monday",
      start_time: "09:00",
      end_time: "12:00",
    };
    updateForm({
      time_slots: [...(scheduleForm.time_slots || []), newSlot],
    });
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

  // Ensure date-only strings are converted to full RFC3339 timestamps
  const ensureDateTime = useCallback((d?: string | null) => {
    if (!d) return d;
    // If already contains time part, assume it's OK
    if (d.includes("T")) return d;
    // Build an ISO timestamp at midnight UTC for the given date
    // e.g. "2025-09-20" -> "2025-09-20T00:00:00.000Z"
    try {
      const iso = new Date(d + "T00:00:00Z").toISOString();
      return iso;
    } catch {
      return d;
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    // Create a payload copy and normalize date fields the backend expects
    type MutablePayload = Partial<CreateScheduleRequest> & {
      auto_reschedule_holidays?: boolean;
      auto_reschedule?: boolean;
      session_per_week?: number;
      session_start_time?: string;
      custom_recurring_days?: number[];
      total_hours?: number;
      hours_per_session?: number;
      recurring_pattern?: NonNullable<
        CreateScheduleRequest["recurring_pattern"]
      >;
      end_date?: string;
      start_date?: string;
    };

    const payload: MutablePayload = {
      ...(scheduleForm as Partial<CreateScheduleRequest>),
    } as MutablePayload;

    console.log("Modal handleConfirm - scheduleForm:", scheduleForm);
    console.log("Modal handleConfirm - payload before API call:", payload);

    // Normalize common date fields if present
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

    // Ensure auto skip holidays defaults to true in API payload mapping
    // Default auto skip holidays to true when not provided; if UI 'auto_reschedule' exists, use it; otherwise true
    payload.auto_reschedule_holidays =
      payload.auto_reschedule_holidays ?? payload.auto_reschedule ?? true;

    // Ensure session_start_time is present for one-off events
    if (!payload.recurring_pattern && !payload.session_start_time) {
      payload.session_start_time = "09:00"; // Default fallback
    }

    // Omit recurring-related fields when recurring_pattern is unset/none
    if (!payload.recurring_pattern) {
      payload.recurring_pattern = undefined;
      payload.session_per_week = undefined;
      // Keep session_start_time for one-off events - don't clear it
      payload.custom_recurring_days = undefined;

      // For one-off events, set default hours if not provided
      if (!payload.total_hours && !payload.hours_per_session) {
        payload.total_hours = 1; // Default 1 hour for one-off events
        payload.hours_per_session = 1;
      }
    } else {
      // For recurring events, ensure session_start_time is included
      if (payload.session_start_time) {
        payload.session_start_time = payload.session_start_time;
      }
    }

    // Omit unselected optional fields
    if (!payload.course_id || payload.course_id === 0) {
      payload.course_id = undefined as unknown as number;
    }
    if (!payload.group_id || payload.group_id === 0) {
      // Only allow group for class; otherwise omit
      if (payload.schedule_type !== "class") {
        payload.group_id = undefined as unknown as number;
      }
    }
    // If not a class schedule, ensure course/group are not sent at all
    if (payload.schedule_type && payload.schedule_type !== "class") {
      payload.course_id = undefined as unknown as number;
      payload.group_id = undefined as unknown as number;
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
    if (typeof payload.notes === "string" && payload.notes.trim() === "") {
      payload.notes = undefined;
    }

    // Ensure class-only fields are omitted for non-class schedule types
    if (payload.schedule_type && payload.schedule_type !== "class") {
      payload.max_students = undefined as unknown as number;
      // Note: total_hours and hours_per_session are now allowed for all recurring schedule types
    }

    setIsSubmittingLocal(true);
    try {
      await onConfirm(payload as Partial<CreateScheduleRequest>);
      // Show success dialog to acknowledge creation finished
      setShowSuccessModal(true);
    } catch (err) {
      // Let parent handle errors (error prop) but ensure local submitting state is cleared
      console.error("Error creating schedule:", err);
    } finally {
      setIsSubmittingLocal(false);
    }
  }, [scheduleForm, ensureDateTime, onConfirm]);

  // Auto-close success dialog shortly after showing
  useEffect(() => {
    if (!showSuccessModal) return;
    const t = window.setTimeout(() => {
      setShowSuccessModal(false);
      onClose();
    }, 1500);
    return () => window.clearTimeout(t);
  }, [showSuccessModal, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <DialogContent className="flex flex-col max-w-4xl max-h-[90vh] bg-white">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarIcon className="h-6 w-6 text-indigo-600" />
              {language === "th" ? "สร้างตารางใหม่" : "Create New Schedule"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as "basic" | "schedule" | "preview")
              }
              className="h-full flex flex-col text-gray-700"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <BookOpenIcon className="h-4 w-4" />
                  {language === "th" ? "ข้อมูลพื้นฐาน" : "Basic Info"}
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  className="flex items-center gap-2"
                >
                  <ClockIcon className="h-4 w-4" />
                  {language === "th" ? "ตารางเวลา" : "Time Schedule"}
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="flex items-center gap-2"
                >
                  <HiDocumentText className="h-4 w-4" />
                  {language === "th" ? "พรีวิว" : "Preview"}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="basic"
                className="flex-1 overflow-y-auto space-y-6"
              >
                {/* Schedule Name */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  {/* One-off event helper */}
                  {scheduleForm.schedule_type === "event" && (
                    <div className="mb-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm flex items-start gap-2">
                      <span className="mt-0.5">🗓️</span>
                      <div>
                        <div className="font-medium">
                          {language === "th"
                            ? "อีเวนต์ครั้งเดียว (One-off)"
                            : "One-off Event"}
                        </div>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          <li>
                            {language === "th"
                              ? "ตั้ง Recurring เป็น 'ไม่มี'"
                              : "Set Recurring to 'None'"}
                          </li>
                          <li>
                            {language === "th"
                              ? "เลือกเวลาเริ่ม และกำหนดวันเริ่ม = วันสิ้นสุด"
                              : "Pick start time, and set start date = end date"}
                          </li>
                          <li>
                            {language === "th"
                              ? "ระบุผู้เข้าร่วม (ถ้ามี) และบันทึก"
                              : "Add participants (optional) and save"}
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <HiDocumentText className="h-5 w-5 text-indigo-600" />
                    {language === "th" ? "ข้อมูลพื้นฐาน" : "Basic Information"}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th" ? "ชื่อตารางเรียน" : "Schedule Name"}
                      </label>
                      <input
                        type="text"
                        value={scheduleForm.schedule_name || ""}
                        onChange={(e) =>
                          updateForm({ schedule_name: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={
                          language === "th"
                            ? "ใส่ชื่อตารางเรียน"
                            : "Enter schedule name"
                        }
                      />
                      {getFieldError("schedule_name") && (
                        <p className="text-red-500 text-sm mt-1">
                          {getFieldError("schedule_name")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th"
                          ? "ประเภทตารางเรียน"
                          : "Schedule Type"}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {scheduleTypes.map((type) => {
                          const IconComponent = type.icon;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => {
                                const newType =
                                  type.value as import("@/services/api/schedules").CreateScheduleInput["schedule_type"];
                                const isClass = newType === "class";
                                // When switching away from class, only clear class-only fields (max_students)
                                if (!isClass) {
                                  updateForm({
                                    schedule_type: newType,
                                    max_students:
                                      undefined as unknown as number,
                                  });
                                } else {
                                  updateForm({
                                    schedule_type: newType,
                                  });
                                }
                              }}
                              className={`p-4 rounded-lg border text-center transition-all ${
                                scheduleForm.schedule_type === type.value
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <IconComponent className="h-6 w-6 mx-auto mb-2" />
                              <p className="font-medium">{type.label}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Conditional fields based on schedule type */}
                    {isClassSchedule ? (
                      /* Class schedule fields - Group required, course optional (derived from group) */
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2">
                            {language === "th"
                              ? "ตั้งค่าคลาสเรียน"
                              : "Class Schedule Settings"}
                          </h4>
                          <p className="text-sm text-blue-700">
                            {language === "th"
                              ? "คลาสเรียนต้องมีกลุ่มนักเรียน คุณสามารถเลือกกลุ่มที่มีอยู่แล้วหรือสร้างใหม่"
                              : "Class schedules require a student group. You can select an existing group or create a new one."}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "th"
                              ? "กลุ่มนักเรียน"
                              : "Student Group"}
                          </label>
                          <div className="flex gap-2">
                            <SearchableSelect
                              value={
                                typeof scheduleForm.group_id === "number"
                                  ? scheduleForm.group_id
                                  : ""
                              }
                              onValueChange={(value) =>
                                updateForm({
                                  group_id: (value as number) || 0,
                                })
                              }
                              placeholder={
                                language === "th"
                                  ? "เลือกกลุ่ม"
                                  : "Select Group"
                              }
                              emptyText={
                                language === "th"
                                  ? "ไม่พบกลุ่ม"
                                  : "No groups found"
                              }
                              searchPlaceholder={
                                language === "th"
                                  ? "ค้นหากลุ่ม..."
                                  : "Search groups..."
                              }
                              options={groups.map((group) => ({
                                value: group.id,
                                label: group.group_name,
                                description: `${group.course_name} (${group.current_students}/${group.max_students})`,
                              }))}
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCreateGroup(true)}
                              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 flex items-center gap-2"
                            >
                              <PlusIcon className="h-4 w-4" />
                              {language === "th" ? "สร้างใหม่" : "Create New"}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === "th"
                                ? "ครูประจำ (ไม่บังคับ)"
                                : "Default Teacher (optional)"}
                            </label>
                            <SearchableSelect
                              value={
                                typeof scheduleForm.teacher_id === "number"
                                  ? scheduleForm.teacher_id
                                  : ""
                              }
                              onValueChange={(value) => {
                                console.log(
                                  "Teacher selection changed to:",
                                  value
                                );
                                const teacherId = (value as number) || 0;
                                console.log("Parsed teacher_id:", teacherId);
                                updateForm({
                                  teacher_id: teacherId,
                                  default_teacher_id: teacherId,
                                });
                              }}
                              placeholder={
                                language === "th"
                                  ? "เลือกครู"
                                  : "Select Teacher"
                              }
                              emptyText={
                                language === "th"
                                  ? "ไม่พบครู"
                                  : "No teachers found"
                              }
                              searchPlaceholder={
                                language === "th"
                                  ? "ค้นหาครู..."
                                  : "Search teachers..."
                              }
                              options={teachers.map((teacher) => ({
                                value: teacher.id,
                                label: formatTeacherLabel(teacher),
                              }))}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === "th"
                                ? "ห้องเรียนประจำ (ไม่บังคับ)"
                                : "Default Room (optional)"}
                            </label>
                            <SearchableSelect
                              value={
                                typeof scheduleForm.room_id === "number"
                                  ? scheduleForm.room_id
                                  : ""
                              }
                              onValueChange={(value) =>
                                updateForm({
                                  room_id: (value as number) || 0,
                                })
                              }
                              placeholder={
                                language === "th"
                                  ? "เลือกห้องเรียน"
                                  : "Select Room"
                              }
                              emptyText={
                                language === "th"
                                  ? "ไม่พบห้องเรียน"
                                  : "No rooms found"
                              }
                              searchPlaceholder={
                                language === "th"
                                  ? "ค้นหาห้องเรียน..."
                                  : "Search rooms..."
                              }
                              options={rooms.map((room) => ({
                                value: room.id,
                                label: room.room_name,
                                description: `ความจุ: ${room.capacity}`,
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Event/Appointment/Meeting/Personal schedule fields - Participants */
                      <div className="space-y-4">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-medium text-purple-900 mb-2">
                            {language === "th"
                              ? "ตั้งค่าการประชุม/อีเวนต์"
                              : "Meeting/Event Settings"}
                          </h4>
                          <p className="text-sm text-purple-700">
                            {language === "th"
                              ? "เลือกผู้เข้าร่วมการประชุมหรืออีเวนต์ ไม่จำเป็นต้องระบุกลุ่มหรือคอร์ส"
                              : "Select participants for this meeting or event. No course or group required."}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "th"
                              ? "ผู้เข้าร่วม (ไม่บังคับ)"
                              : "Participants (optional)"}
                          </label>

                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              value={participantQuery}
                              onChange={(e) =>
                                setParticipantQuery(e.target.value)
                              }
                              placeholder={
                                language === "th"
                                  ? "ค้นหาผู้ใช้ด้วยชื่อ/อีเมล/โทรศัพท์"
                                  : "Search users by name/email/phone"
                              }
                              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <SearchableSelect
                              value={participantRole}
                              onValueChange={(value) =>
                                setParticipantRole(
                                  value as User["role"] | "all"
                                )
                              }
                              placeholder={
                                language === "th" ? "ทุกบทบาท" : "All roles"
                              }
                              options={[
                                {
                                  value: "all",
                                  label:
                                    language === "th"
                                      ? "ทุกบทบาท"
                                      : "All roles",
                                },
                                {
                                  value: "student",
                                  label:
                                    language === "th" ? "นักเรียน" : "Student",
                                },
                                {
                                  value: "teacher",
                                  label: language === "th" ? "ครู" : "Teacher",
                                },
                                {
                                  value: "admin",
                                  label: "Admin",
                                },
                                {
                                  value: "owner",
                                  label: "Owner",
                                },
                              ]}
                              className="w-40"
                            />
                          </div>

                          <div className="max-h-40 overflow-auto border border-gray-200 rounded-lg">
                            {renderParticipantList()}
                          </div>

                          {participantIds.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {participantIds.map((id) => {
                                const info = participantMap[id];
                                return (
                                  <span
                                    key={id}
                                    className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs border border-indigo-200"
                                  >
                                    <span>
                                      {info?.username || `User #${id}`}
                                    </span>
                                    <button
                                      type="button"
                                      className="text-indigo-700 hover:text-indigo-900"
                                      onClick={() => removeParticipant(id)}
                                    >
                                      ×
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === "th"
                                ? "ครูผู้ดำเนินการ (ไม่บังคับ)"
                                : "Facilitator (optional)"}
                            </label>
                            <SearchableSelect
                              value={
                                typeof scheduleForm.teacher_id === "number"
                                  ? scheduleForm.teacher_id
                                  : ""
                              }
                              onValueChange={(value) =>
                                updateForm({
                                  teacher_id: (value as number) || 0,
                                  default_teacher_id: (value as number) || 0,
                                })
                              }
                              placeholder={
                                language === "th"
                                  ? "เลือกครูผู้ดำเนินการ"
                                  : "Select Facilitator"
                              }
                              emptyText={
                                language === "th"
                                  ? "ไม่พบครู"
                                  : "No teachers found"
                              }
                              searchPlaceholder={
                                language === "th"
                                  ? "ค้นหาครู..."
                                  : "Search teachers..."
                              }
                              options={teachers.map((teacher) => ({
                                value: teacher.id,
                                label: formatTeacherLabel(teacher),
                              }))}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === "th"
                                ? "ห้องประชุม (ไม่บังคับ)"
                                : "Meeting Room (optional)"}
                            </label>
                            <SearchableSelect
                              value={
                                typeof scheduleForm.room_id === "number"
                                  ? scheduleForm.room_id
                                  : ""
                              }
                              onValueChange={(value) =>
                                updateForm({
                                  room_id: (value as number) || 0,
                                })
                              }
                              placeholder={
                                language === "th"
                                  ? "เลือกห้องประชุม"
                                  : "Select Meeting Room"
                              }
                              emptyText={
                                language === "th"
                                  ? "ไม่พบห้องประชุม"
                                  : "No meeting rooms found"
                              }
                              searchPlaceholder={
                                language === "th"
                                  ? "ค้นหาห้องประชุม..."
                                  : "Search meeting rooms..."
                              }
                              options={rooms.map((room) => ({
                                value: room.id,
                                label: room.room_name,
                                description: `ความจุ: ${room.capacity}`,
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hours configuration - show for all recurring schedule types */}
                    {scheduleForm.recurring_pattern &&
                      scheduleForm.recurring_pattern !== "none" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === "th"
                                ? "จำนวนชั่วโมงรวม"
                                : "Total Hours"}
                            </label>
                            <input
                              type="number"
                              value={scheduleForm.total_hours ?? ""}
                              onChange={(e) =>
                                updateForm({
                                  total_hours: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              min="1"
                              placeholder={
                                language === "th"
                                  ? "จำนวนชั่วโมงทั้งหมด"
                                  : "Total duration hours"
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === "th"
                                ? "ชั่วโมงต่อครั้ง"
                                : "Hours per Session"}
                            </label>
                            <input
                              type="number"
                              value={scheduleForm.hours_per_session ?? ""}
                              onChange={(e) =>
                                updateForm({
                                  hours_per_session:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              min="1"
                              step="0.5"
                              placeholder={
                                language === "th"
                                  ? "ชั่วโมงต่อเซสชัน"
                                  : "Duration per session"
                              }
                            />
                          </div>
                        </div>
                      )}

                    {/* Max students - class schedules only */}
                    {isClassSchedule && (
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "th"
                              ? "จำนวนนักเรียนสูงสุด"
                              : "Max Students"}
                          </label>
                          <input
                            type="number"
                            value={scheduleForm.max_students || ""}
                            onChange={(e) =>
                              updateForm({
                                max_students: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            min="1"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th" ? "วันที่เริ่มต้น" : "Start Date"}
                      </label>
                      <input
                        type="date"
                        value={scheduleForm.start_date || ""}
                        onChange={(e) =>
                          updateForm({ start_date: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* End Date for single-day event (optional but helpful). When event type, show and allow setting equal to start date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th" ? "วันที่สิ้นสุด" : "End Date"}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={scheduleForm.estimated_end_date || ""}
                          onChange={(e) =>
                            updateForm({ estimated_end_date: e.target.value })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        {scheduleForm.start_date && (
                          <button
                            type="button"
                            onClick={() =>
                              updateForm({
                                estimated_end_date: scheduleForm.start_date!,
                              })
                            }
                            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                          >
                            {language === "th"
                              ? "เท่ากับเริ่ม"
                              : "Same as Start"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recurring Pattern and Sessions per Week */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th"
                          ? "รูปแบบการเกิดซ้ำ"
                          : "Recurring Pattern"}
                      </label>
                      <select
                        value={scheduleForm.recurring_pattern ?? "none"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "none") {
                            // Clear recurring-related fields when selecting none
                            updateForm({
                              // remove recurring pattern by setting undefined (omitted in payload)
                              recurring_pattern:
                                undefined as unknown as NonNullable<
                                  CreateScheduleRequest["recurring_pattern"]
                                >,
                              session_per_week: undefined,
                              // Keep session_start_time for one-off events (don't clear it)
                              custom_recurring_days: [],
                              // Clear hours when switching to one-off (for all schedule types)
                              total_hours: undefined as unknown as number,
                              hours_per_session: undefined as unknown as number,
                            });
                          } else {
                            updateForm({
                              recurring_pattern: val as NonNullable<
                                CreateScheduleRequest["recurring_pattern"]
                              >,
                            });
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="none">
                          {language === "th" ? "ไม่มี" : "None"}
                        </option>
                        <option value="daily">
                          {language === "th" ? "รายวัน" : "Daily"}
                        </option>
                        <option value="weekly">
                          {language === "th" ? "รายสัปดาห์" : "Weekly"}
                        </option>
                        <option value="bi-weekly">
                          {language === "th" ? "รายสองสัปดาห์" : "Bi-weekly"}
                        </option>
                        <option value="monthly">
                          {language === "th" ? "รายเดือน" : "Monthly"}
                        </option>
                        <option value="yearly">
                          {language === "th" ? "รายปี" : "Yearly"}
                        </option>
                        <option value="custom">
                          {language === "th" ? "กำหนดเอง" : "Custom"}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th"
                          ? "จำนวนครั้ง/สัปดาห์"
                          : "Sessions per Week"}
                      </label>
                      <input
                        type="number"
                        value={scheduleForm.session_per_week ?? 1}
                        onChange={(e) =>
                          updateForm({
                            session_per_week: Math.max(
                              1,
                              parseInt(e.target.value) || 1
                            ),
                          })
                        }
                        className={
                          "w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent " +
                          (!scheduleForm.recurring_pattern
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-300")
                        }
                        min={1}
                        max={14}
                        disabled={!scheduleForm.recurring_pattern}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th"
                          ? "เวลาเริ่มเซสชัน"
                          : "Session Start Time"}
                      </label>
                      <input
                        type="time"
                        value={scheduleForm.session_start_time || "09:00"}
                        onChange={(e) =>
                          updateForm({ session_start_time: e.target.value })
                        }
                        className={
                          "w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300"
                        }
                        // Time is relevant for both one-off events and recurring; keep enabled always
                        disabled={false}
                      />
                    </div>
                  </div>

                  {/* Custom recurring days when custom pattern */}
                  {scheduleForm.recurring_pattern === "custom" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th"
                          ? "เลือกวันในสัปดาห์ (ไม่บังคับ)"
                          : "Select Days of Week (optional)"}
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                        {weekDays.map((day, idx) => {
                          // Map Sunday..Saturday -> 0..6 per API requirement
                          const dayNum = idx as 0 | 1 | 2 | 3 | 4 | 5 | 6;
                          const values =
                            scheduleForm.custom_recurring_days || [];
                          const checked = values.includes(dayNum);
                          return (
                            <label
                              key={day.value}
                              className={`flex items-center gap-2 p-2 rounded border ${
                                checked
                                  ? "border-indigo-400 bg-indigo-50"
                                  : "border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const set = new Set(values);
                                  if (e.target.checked) set.add(dayNum);
                                  else set.delete(dayNum);
                                  updateForm({
                                    custom_recurring_days: Array.from(set).sort(
                                      (a, b) => a - b
                                    ) as number[],
                                  });
                                }}
                              />
                              <span className="text-sm">{day.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Private class hint */}
                  {scheduleForm.schedule_type === "personal" && (
                    <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                      {language === "th"
                        ? "สำหรับ private class แนะนำให้สร้างกลุ่มส่วนตัว (นักเรียน 1 คน) แล้วเลือกประเภทเป็น class พร้อมระบุ group"
                        : "For a private class, create a dedicated group (single student) and use schedule type 'class' with that group."}
                    </div>
                  )}
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
                        className="bg-white p-3 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 mr-2">
                              {language === "th" ? "วัน" : "Day"}
                            </label>
                            <select
                              value={slot.day_of_week}
                              onChange={(e) =>
                                updateTimeSlot(index, {
                                  day_of_week: e.target.value,
                                })
                              }
                              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              {weekDays.map((d) => (
                                <option key={d.value} value={d.value}>
                                  {d.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(index)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              {language === "th" ? "ลบ" : "Remove"}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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

                    {(scheduleForm.time_slots || []).length === 0 && (
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

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th"
                          ? "หมายเหตุ (ไม่บังคับ)"
                          : "Notes (optional)"}
                      </label>
                      <textarea
                        value={scheduleForm.notes || ""}
                        onChange={(e) => updateForm({ notes: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24 resize-none"
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
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="auto_reschedule"
                        className="text-sm text-gray-700"
                      >
                        {language === "th"
                          ? "จัดตารางใหม่อัตโนมัติเมื่อมีวันหยุด"
                          : "Auto reschedule for holidays"}
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 overflow-y-auto">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <HiDocumentText className="h-5 w-5 text-indigo-600" />
                    {language === "th" ? "สรุปตารางเรียน" : "Schedule Summary"}
                  </h3>

                  <div className="space-y-6">
                    {/* Basic Info Summary */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        {scheduleForm.schedule_name ||
                          (language === "th"
                            ? "ไม่ระบุชื่อ"
                            : "Untitled Schedule")}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <BookOpenIcon className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm text-gray-600">
                            {courses.find(
                              (c) => c.id === scheduleForm.course_id
                            )?.course_name ||
                              (language === "th"
                                ? "ไม่ระบุคอร์ส"
                                : "No course selected")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm text-gray-600">
                            {teachers.find(
                              (t) => t.id === scheduleForm.teacher_id
                            )?.teacher_name ||
                              (language === "th"
                                ? "ไม่ระบุครู"
                                : "No teacher selected")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm text-gray-600">
                            {rooms.find((r) => r.id === scheduleForm.room_id)
                              ?.room_name ||
                              (language === "th"
                                ? "ไม่ระบุห้อง"
                                : "No room selected")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">
                          {language === "th"
                            ? "รายละเอียดการเรียน"
                            : "Class Details"}
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {language === "th" ? "ประเภท:" : "Type:"}
                            </span>
                            <Badge variant="outline">
                              {scheduleForm.schedule_type}
                            </Badge>
                          </div>

                          {/* Only show hours for recurring events or if hours are explicitly set */}
                          {(scheduleForm.recurring_pattern !== "none" ||
                            (scheduleForm.total_hours &&
                              scheduleForm.total_hours > 0)) && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {language === "th"
                                    ? "จำนวนชั่วโมงรวม:"
                                    : "Total Hours:"}
                                </span>
                                <span>
                                  {scheduleForm.total_hours || 1}{" "}
                                  {language === "th" ? "ชั่วโมง" : "hours"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {language === "th"
                                    ? "ชั่วโมงต่อครั้ง:"
                                    : "Hours per Session:"}
                                </span>
                                <span>
                                  {scheduleForm.hours_per_session || 1}{" "}
                                  {language === "th" ? "ชั่วโมง" : "hours"}
                                </span>
                              </div>
                            </>
                          )}

                          {/* Only show max students for class schedules */}
                          {scheduleForm.schedule_type === "class" && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                {language === "th"
                                  ? "นักเรียนสูงสุด:"
                                  : "Max Students:"}
                              </span>
                              <span>
                                {scheduleForm.max_students || 6}{" "}
                                {language === "th" ? "คน" : "students"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">
                          {language === "th" ? "ประมาณการ" : "Estimates"}
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {language === "th"
                                ? "จำนวนครั้งทั้งหมด:"
                                : "Total Sessions:"}
                            </span>
                            <span>
                              {total_sessions}{" "}
                              {language === "th" ? "ครั้ง" : "sessions"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {language === "th"
                                ? "วันที่เริ่ม:"
                                : "Start Date:"}
                            </span>
                            <span>{scheduleForm.start_date}</span>
                          </div>
                          {/* Only show estimated end date if it exists and is different from start date */}
                          {estimated_end_date &&
                            estimated_end_date !== scheduleForm.start_date && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {language === "th"
                                    ? "วันที่สิ้นสุด (ประมาณ):"
                                    : "Estimated End (approx):"}
                                </span>
                                <span>{estimated_end_date}</span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Time Slots */}
                    {(scheduleForm.time_slots || []).length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">
                          {language === "th" ? "ตารางเวลา" : "Time Schedule"}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(scheduleForm.time_slots || []).map(
                            (slot, index) => (
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
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Validation Errors */}
                    {hasErrors && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h5 className="font-medium text-red-800 mb-2">
                          {language === "th"
                            ? "ข้อมูลที่ต้องแก้ไข:"
                            : "Issues to Fix:"}
                        </h5>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {issues.map((issue, index) => (
                            <li key={index}>{issue.message}</li>
                          ))}
                        </ul>
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
                {/* Back button (hidden on first tab) */}
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
                {/* Cancel button (always visible) */}
                <Button onClick={onClose} variant="monthView">
                  {language === "th" ? "ยกเลิก" : "Cancel"}
                </Button>
                {/* Next / Create button */}
                {activeTab !== "preview" ? (
                  <Button
                    onClick={() =>
                      setActiveTab((prev) =>
                        prev === "basic" ? "schedule" : "preview"
                      )
                    }
                    variant="monthViewClicked"
                    className="px-6 py-2"
                  >
                    {language === "th" ? "ต่อไป" : "Next"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleConfirm}
                    disabled={hasErrors || isLoading || isSubmittingLocal}
                    variant="monthViewClicked"
                    className="px-6 py-2"
                  >
                    {isSubmittingLocal || isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : language === "th" ? (
                      "เริ่มสร้าง"
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

      {/* Success Dialog shown after creation completes */}
      {showSuccessModal && (
        <Dialog
          open={showSuccessModal}
          onOpenChange={(open) => {
            if (!open) {
              setShowSuccessModal(false);
              // Close main modal as well after success acknowledged
              onClose();
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {language === "th" ? "สร้างตารางเรียบร้อย" : "Schedule Created"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-sm text-gray-700">
                {language === "th"
                  ? "ตารางเรียนถูกสร้างเรียบร้อยแล้ว"
                  : "The schedule was created successfully."}
              </p>
            </div>
            <DialogFooter>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onClose();
                  }}
                  variant="monthViewClicked"
                >
                  {language === "th" ? "ตกลง" : "OK"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Group Creation Modal */}
      {showCreateGroup && (
        <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {language === "th" ? "สร้างกลุ่มใหม่" : "Create New Group"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "th" ? "ชื่อกลุ่ม" : "Group Name"}
                  </label>
                  <input
                    type="text"
                    value={groupForm.group_name}
                    onChange={(e) =>
                      setGroupForm((prev) => ({
                        ...prev,
                        group_name: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={
                      language === "th"
                        ? "เช่น Advanced English B2"
                        : "e.g. Advanced English B2"
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "th" ? "คอร์ส" : "Course"}
                  </label>
                  <SearchableSelect
                    value={groupForm.course_id.toString()}
                    onValueChange={(value) =>
                      setGroupForm((prev) => ({
                        ...prev,
                        course_id: parseInt(String(value)) || 0,
                      }))
                    }
                    placeholder={
                      language === "th" ? "เลือกคอร์ส" : "Select Course"
                    }
                    emptyText={
                      language === "th" ? "ไม่พบคอร์ส" : "No courses found"
                    }
                    searchPlaceholder={
                      language === "th" ? "ค้นหาคอร์ส..." : "Search courses..."
                    }
                    options={courses.map((course) => ({
                      value: course.id.toString(),
                      label: course.course_name,
                      description: course.level,
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "th" ? "ระดับ" : "Level"}
                  </label>
                  <select
                    value={groupForm.level}
                    onChange={(e) =>
                      setGroupForm((prev) => ({
                        ...prev,
                        level: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="beginner">
                      {language === "th" ? "เริ่มต้น" : "Beginner"}
                    </option>
                    <option value="intermediate">
                      {language === "th" ? "กลาง" : "Intermediate"}
                    </option>
                    <option value="advanced">
                      {language === "th" ? "สูง" : "Advanced"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "th" ? "นักเรียนสูงสุด" : "Max Students"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={groupForm.max_students}
                    onChange={(e) =>
                      setGroupForm((prev) => ({
                        ...prev,
                        max_students: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "th" ? "สถานะการชำระเงิน" : "Payment Status"}
                  </label>
                  <select
                    value={groupForm.payment_status}
                    onChange={(e) =>
                      setGroupForm((prev) => ({
                        ...prev,
                        payment_status: e.target.value as
                          | "pending"
                          | "deposit_paid"
                          | "fully_paid",
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="pending">
                      {language === "th" ? "รอชำระ" : "Pending"}
                    </option>
                    <option value="deposit_paid">
                      {language === "th" ? "ชำระมัดจำ" : "Deposit Paid"}
                    </option>
                    <option value="fully_paid">
                      {language === "th" ? "ชำระครบ" : "Fully Paid"}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th"
                    ? "คำอธิบาย (ไม่บังคับ)"
                    : "Description (optional)"}
                </label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) =>
                    setGroupForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-20 resize-none"
                  placeholder={
                    language === "th"
                      ? "รายละเอียดเพิ่มเติมเกี่ยวกับกลุ่ม"
                      : "Additional details about the group"
                  }
                />
              </div>

              {/* Student selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th"
                    ? "เลือกนักเรียน (ไม่บังคับ)"
                    : "Select Students (optional)"}
                </label>
                <div className="max-h-40 overflow-auto border border-gray-200 rounded-lg">
                  {availableStudents.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">
                      {language === "th"
                        ? "ไม่มีนักเรียนให้เลือก"
                        : "No students available"}
                    </div>
                  ) : (
                    <div className="p-2">
                      {availableStudents.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents((prev) => [
                                  ...prev,
                                  student.id,
                                ]);
                              } else {
                                setSelectedStudents((prev) =>
                                  prev.filter((id) => id !== student.id)
                                );
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="text-sm">
                            {`${
                              student.first_name_en || student.first_name_th
                            } ${
                              student.last_name_en || student.last_name_th
                            }`.trim()}
                            {student.email && (
                              <span className="text-gray-500 ml-2">
                                ({student.email})
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {selectedStudents.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {language === "th"
                      ? `เลือกแล้ว ${selectedStudents.length} คน`
                      : `${selectedStudents.length} students selected`}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                onClick={() => setShowCreateGroup(false)}
                variant="monthView"
                disabled={groupLoading}
              >
                {language === "th" ? "ยกเลิก" : "Cancel"}
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={
                  !groupForm.group_name || !groupForm.course_id || groupLoading
                }
                variant="monthViewClicked"
              >
                {groupLoading ? (
                  <LoadingSpinner size="sm" />
                ) : language === "th" ? (
                  "สร้างกลุ่ม"
                ) : (
                  "Create Group"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
