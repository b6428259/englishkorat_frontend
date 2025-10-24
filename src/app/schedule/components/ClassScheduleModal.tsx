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
import { Branch, branchService } from "@/services/api/branches";
import { groupService } from "@/services/api/groups";
import {
  CheckRoomConflictRequest,
  CheckRoomConflictResponse,
  Course,
  CreateScheduleInput as CreateScheduleRequest,
  Room,
  SchedulePreviewResponse,
  scheduleService,
  TeacherOption,
} from "@/services/api/schedules";
import {
  TeacherWorkingHour,
  teacherWorkingHoursService,
  workingHoursHelpers,
} from "@/services/api/teacherWorkingHours";
import { CreateGroupRequest, GroupOption, Student } from "@/types/group.types";
import { formatDateReadable } from "@/utils/dateFormatter";
import {
  ArrowLeft as ArrowLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HiDocumentText } from "react-icons/hi2";

// New interface for session_times (Case 2: Multi-slot weekly class)
interface SessionTime {
  weekday: number; // 0 (Sunday) through 6 (Saturday)
  start_time: string; // HH:MM
}

interface ClassScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onConfirm: (form: Partial<CreateScheduleRequest>) => Promise<void>;
  courses: Course[];
  rooms: Room[];
  teachers: TeacherOption[];
  scheduleForm?: Partial<CreateScheduleRequest>;
  isLoading?: boolean;
}

const ClassScheduleModal = React.memo(function ClassScheduleModal({
  isOpen,
  onClose,
  onBack,
  onConfirm,
  courses,
  rooms,
  teachers,
  scheduleForm: initialScheduleForm,
  isLoading = false,
}: ClassScheduleModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    "basic" | "schedule" | "room" | "preview"
  >("basic");

  const [scheduleForm, setScheduleForm] = useState<
    Partial<CreateScheduleRequest>
  >({
    schedule_name: "",
    schedule_type: "class",
    course_id: 0,
    group_id: 0,
    default_teacher_id: 0, // Use default_teacher_id instead of teacher_id
    default_room_id: 0, // Use default_room_id instead of room_id
    total_hours: undefined,
    hours_per_session: undefined,
    max_students: 6,
    start_date: new Date().toISOString().split("T")[0],
    session_start_time: "09:00", // For Case 1: Single-slot weekly
    session_times: [], // For Case 2: Multi-slot weekly
    auto_reschedule: true,
    notes: "",
    recurring_pattern: "weekly",
    session_per_week: 1, // Default to 1 for single-slot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Room conflict check state
  const [checkingRooms, setCheckingRooms] = useState(false);
  const [roomConflicts, setRoomConflicts] =
    useState<CheckRoomConflictResponse | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);

  // Preview state
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] =
    useState<SchedulePreviewResponse | null>(null);

  // Group creation state
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

  // Branch and filtered groups state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [filteredGroups, setFilteredGroups] = useState<GroupOption[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Teacher working hours state
  const [teacherWorkingHours, setTeacherWorkingHours] = useState<
    TeacherWorkingHour[]
  >([]);
  const [loadingWorkingHours, setLoadingWorkingHours] = useState(false);
  const [workingHoursError, setWorkingHoursError] = useState<string | null>(
    null
  );

  // Form validation error state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Weekday mapping for new API (weekday 0-6, 0=Sunday)
  const weekDays = useMemo(
    () => [
      { value: 0, label: language === "th" ? "อาทิตย์" : "Sunday" },
      { value: 1, label: language === "th" ? "จันทร์" : "Monday" },
      { value: 2, label: language === "th" ? "อังคาร" : "Tuesday" },
      { value: 3, label: language === "th" ? "พุธ" : "Wednesday" },
      { value: 4, label: language === "th" ? "พฤหัสบดี" : "Thursday" },
      { value: 5, label: language === "th" ? "ศุกร์" : "Friday" },
      { value: 6, label: language === "th" ? "เสาร์" : "Saturday" },
    ],
    [language]
  );

  // Helper: Get weekday from date string (0-6, Sunday=0)
  const getWeekdayFromDate = useCallback((dateStr: string): number => {
    if (!dateStr) return 1; // Default to Monday
    const date = new Date(dateStr);
    return date.getDay(); // 0=Sunday, 1=Monday, etc.
  }, []);

  // Helper: Get weekday name from weekday number
  const getWeekdayName = useCallback(
    (weekday: number): string => {
      const day = weekDays.find((d) => d.value === weekday);
      return day ? day.label : "";
    },
    [weekDays]
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

  const groupOptions = useMemo(
    () =>
      filteredGroups.map((group) => {
        const courseName = group.course_name || "No Course";
        const count = `(${group.current_students}/${group.max_students})`;
        return {
          value: group.id.toString(),
          label: group.group_name,
          description: `${courseName} ${count}`,
        };
      }),
    [filteredGroups]
  );

  const teacherOptions = useMemo(
    () =>
      (teachers ?? [])
        .filter(
          (teacher): teacher is TeacherOption & { id: number } =>
            !!teacher && typeof teacher.id === "number"
        )
        .map((teacher) => ({
          value: teacher.user_id.toString(), // Use user_id for form submission (backend expects user_id)
          label: formatTeacherLabel(teacher),
        })),
    [teachers, formatTeacherLabel]
  );

  const updateForm = useCallback((updates: Partial<CreateScheduleRequest>) => {
    // 🔍 Debug: ดูว่า updateForm ถูกเรียกด้วยค่าอะไร
    if (updates.default_teacher_id !== undefined) {
      console.log(
        "🔍 updateForm called with default_teacher_id:",
        updates.default_teacher_id
      );
    }

    setScheduleForm((prev) => {
      const newForm = { ...prev, ...updates };

      // Auto-update first session weekday when start_date changes
      if (
        updates.start_date &&
        newForm.session_times &&
        newForm.session_times.length > 0
      ) {
        const date = new Date(updates.start_date);
        const newWeekday = date.getDay();
        newForm.session_times = [
          { ...newForm.session_times[0], weekday: newWeekday },
          ...newForm.session_times.slice(1),
        ];
      }

      // 🔍 Debug: ดูค่า default_teacher_id หลังจาก merge
      if (updates.default_teacher_id !== undefined) {
        console.log(
          "🔍 After merge, newForm.default_teacher_id:",
          newForm.default_teacher_id
        );
      }

      return newForm;
    });
  }, []);

  // Session times management (for multi-slot weekly classes)
  const addSessionTime = useCallback(() => {
    setScheduleForm((prev) => {
      const currentSessions = prev.session_times || [];

      // If no sessions exist, create first one from start_date
      if (currentSessions.length === 0) {
        const date = new Date(prev.start_date || "");
        const firstWeekday = date.getDay();
        const firstSlot: SessionTime = {
          weekday: firstWeekday,
          start_time: prev.session_start_time || "09:00",
        };
        return {
          ...prev,
          session_times: [firstSlot],
          session_per_week: 1,
          recurring_pattern: "custom",
        };
      }

      // Add additional session (user can select any weekday)
      const newSlot: SessionTime = {
        weekday: 1, // Default to Monday
        start_time: "09:00",
      };
      const newSessionTimes = [...currentSessions, newSlot];
      return {
        ...prev,
        session_times: newSessionTimes,
        session_per_week: newSessionTimes.length,
        recurring_pattern: "custom",
      };
    });
  }, []);

  const removeSessionTime = useCallback((index: number) => {
    setScheduleForm((prev) => {
      const newSessionTimes = (prev.session_times || []).filter(
        (_, i) => i !== index
      );
      return {
        ...prev,
        session_times: newSessionTimes,
        session_per_week: newSessionTimes.length || 1,
        recurring_pattern: newSessionTimes.length === 0 ? "weekly" : "custom",
      };
    });
  }, []);

  const updateSessionTime = useCallback(
    (index: number, updates: Partial<SessionTime>) => {
      setScheduleForm((prev) => {
        const newSessionTimes = (prev.session_times || []).map((slot, i) =>
          i === index ? { ...slot, ...updates } : slot
        );
        return { ...prev, session_times: newSessionTimes };
      });
    },
    []
  );

  const handleCreateGroup = useCallback(async () => {
    try {
      setGroupLoading(true);
      const newGroup = await groupService.createGroup(groupForm);
      if (newGroup) {
        updateForm({ group_id: newGroup.id });
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

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      const branchesData = await branchService.getActiveBranches();
      setBranches(branchesData);
    };
    loadBranches();
  }, []);

  // Load teacher working hours when teacher is selected
  useEffect(() => {
    const loadTeacherWorkingHours = async () => {
      // Get teacher user_id from default_teacher_id (which stores user_id for combobox)
      const userIdFromCombobox = scheduleForm.default_teacher_id;

      if (!userIdFromCombobox) {
        // Clear working hours if no teacher selected
        setTeacherWorkingHours([]);
        setWorkingHoursError(null);
        return;
      }

      // Find teacher from teachers list using user_id to get the teacher_id
      // Note: After fixing TeacherOption interface:
      // - teacher.user_id = user_id (what combobox stores in default_teacher_id)
      // - teacher.id = teacher_id (what we need for the API call)
      const teacher = teachers.find((t) => t.user_id === userIdFromCombobox);
      if (!teacher) {
        setTeacherWorkingHours([]);
        setWorkingHoursError("Teacher not found");
        return;
      }

      setLoadingWorkingHours(true);
      setWorkingHoursError(null);

      try {
        // Call API with teacher_id (teacher.id is the teacher_id, not user_id)
        console.log(
          "🔍 Loading working hours for teacher_id:",
          teacher.id,
          "user_id:",
          teacher.user_id
        );
        const response = await teacherWorkingHoursService.getWorkingHours(
          teacher.id // This is teacher_id
        );
        setTeacherWorkingHours(response.working_hours || []);
        console.log(
          "✅ Loaded working hours for teacher_id:",
          teacher.id,
          response.working_hours
        );
      } catch (error) {
        console.error("❌ Failed to load teacher working hours:", error);
        setWorkingHoursError("ไม่สามารถโหลดเวลาทำงานของครูได้");
        setTeacherWorkingHours([]);
      } finally {
        setLoadingWorkingHours(false);
      }
    };

    loadTeacherWorkingHours();
  }, [scheduleForm.default_teacher_id, scheduleForm.teacher_id, teachers]);

  // Prefill form when initialScheduleForm is provided
  useEffect(() => {
    if (
      isOpen &&
      initialScheduleForm &&
      Object.keys(initialScheduleForm).length > 0
    ) {
      console.log("🔧 Prefilling form with:", initialScheduleForm);
      console.log("🔧 Current form state:", scheduleForm);

      // Always update form with initialScheduleForm when modal opens
      setScheduleForm((prev) => {
        const newForm = {
          ...prev,
          ...initialScheduleForm,
        };
        console.log("🔧 New form state:", newForm);
        return newForm;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, JSON.stringify(initialScheduleForm)]); // Use JSON.stringify for deep comparison

  // Load filtered groups when branch is selected
  useEffect(() => {
    const loadFilteredGroups = async () => {
      if (!selectedBranchId) {
        setFilteredGroups([]);
        return;
      }

      setLoadingGroups(true);
      try {
        const response = await groupService.getGroups({
          branch_id: selectedBranchId,
          status: "active",
        });

        // Also fetch full status groups
        const fullResponse = await groupService.getGroups({
          branch_id: selectedBranchId,
          status: "full",
        });

        // Combine both active and full groups
        const allGroups = [...response.groups, ...fullResponse.groups];

        // Map to GroupOption format
        const mappedGroups: GroupOption[] = allGroups
          .filter(
            (group): group is typeof group & { id: number } =>
              !!group && typeof group.id === "number"
          )
          .map((group) => {
            // Generate group name from members if group_name is empty
            let displayName = group.group_name;
            if (!displayName || displayName.trim() === "") {
              const members = group.members || [];
              if (members.length > 0) {
                const studentNames = members
                  .map(
                    (m) =>
                      m.student?.nickname_th ||
                      m.student?.nickname_en ||
                      m.student?.first_name_th ||
                      ""
                  )
                  .filter((name) => name)
                  .join(", ");
                displayName = studentNames || `Group ${group.id}`;
              } else {
                displayName = `Group ${group.id}`;
              }
            }

            return {
              id: group.id,
              group_name: displayName,
              course_id: group.course_id,
              course_name: group.course?.name || "",
              level: group.level,
              current_students: group.members?.length || 0,
              max_students: group.max_students,
              payment_status: group.payment_status,
            };
          });

        setFilteredGroups(mappedGroups);
      } catch (error) {
        console.error("Error loading filtered groups:", error);
        setFilteredGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    loadFilteredGroups();
  }, [selectedBranchId]);

  // Reset group selection when branch changes
  useEffect(() => {
    if (selectedBranchId) {
      updateForm({ group_id: 0, course_id: 0 });
      setSelectedGroup(null);
    }
  }, [selectedBranchId, updateForm]);

  useEffect(() => {
    if (showCreateGroup) {
      groupService.getAvailableStudents().then(setAvailableStudents);
    }
  }, [showCreateGroup]);

  // Load selected group data and set max_students
  useEffect(() => {
    if (scheduleForm.group_id && scheduleForm.group_id > 0) {
      const group = filteredGroups.find((g) => g.id === scheduleForm.group_id);
      if (group) {
        setSelectedGroup(group);
        setScheduleForm((prev) => {
          const next = { ...prev };
          let changed = false;

          const maxStudents = group.max_students || 6;
          if (prev.max_students !== maxStudents) {
            next.max_students = maxStudents;
            changed = true;
          }

          if (
            typeof group.course_id === "number" &&
            group.course_id > 0 &&
            prev.course_id !== group.course_id
          ) {
            next.course_id = group.course_id;
            changed = true;
          }

          return changed ? next : prev;
        });
      }
    } else {
      setSelectedGroup(null);
      setScheduleForm((prev) => {
        if (!prev.course_id) {
          return prev;
        }
        return { ...prev, course_id: 0 };
      });
    }
  }, [scheduleForm.group_id, filteredGroups]);

  // Auto-add one session time slot when modal opens or start_date is set
  // BUT don't override if session_times was already provided from initialScheduleForm
  const hasSessionTimesRef = useRef(false);

  useEffect(() => {
    // Track if session_times exists in either initialScheduleForm or current scheduleForm
    if (
      (initialScheduleForm?.session_times &&
        initialScheduleForm.session_times.length > 0) ||
      (scheduleForm.session_times && scheduleForm.session_times.length > 0)
    ) {
      hasSessionTimesRef.current = true;
      console.log(
        "✅ session_times detected, setting hasSessionTimesRef to true"
      );
    }
  }, [initialScheduleForm?.session_times, scheduleForm.session_times]);

  useEffect(() => {
    // Skip if modal is not open
    if (!isOpen) return;

    // Skip if start_date is not set
    if (!scheduleForm.start_date) return;

    // PRIORITY 1: Check if initialScheduleForm has session_times (from clicked cell)
    if (
      initialScheduleForm?.session_times &&
      initialScheduleForm.session_times.length > 0
    ) {
      console.log(
        "✅ initialScheduleForm has session_times, skipping auto-add:",
        initialScheduleForm.session_times
      );
      return;
    }

    // PRIORITY 2: Check if session_times already exists (from ref or current form)
    if (hasSessionTimesRef.current) {
      console.log("✅ hasSessionTimesRef is true, skipping auto-add");
      return;
    }

    // PRIORITY 3: Check if session_times already has values in current form
    if (scheduleForm.session_times && scheduleForm.session_times.length > 0) {
      console.log(
        "✅ scheduleForm has session_times, skipping auto-add:",
        scheduleForm.session_times
      );
      return;
    }

    // Only auto-add if session_times is empty/null everywhere
    console.log("🔧 Auto-adding default session_times");
    const weekday = getWeekdayFromDate(scheduleForm.start_date);
    setScheduleForm((prev) => ({
      ...prev,
      session_times: [
        {
          weekday,
          start_time: "09:00",
        },
      ],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    scheduleForm.start_date,
    initialScheduleForm?.session_times, // Check this to prevent auto-add when prefilling
    // Don't include scheduleForm.session_times here - it causes infinite loop!
    getWeekdayFromDate,
  ]);

  // Check room conflicts function
  const checkRoomConflicts = useCallback(async () => {
    if (!scheduleForm.start_date || !selectedRoomId) {
      return;
    }

    setCheckingRooms(true);
    try {
      const branchId =
        scheduleForm.branch_id ??
        rooms.find((room) => room.id === selectedRoomId)?.branch_id ??
        undefined;

      if (branchId === undefined) {
        console.warn("Unable to determine branch_id for room conflict check");
        return;
      }

      // Format dates to ISO 8601 with timezone
      const formatDate = (dateStr?: string) => {
        if (!dateStr) return undefined;
        if (dateStr.includes("T")) return dateStr;
        return new Date(dateStr + "T00:00:00Z").toISOString();
      };

      const request: CheckRoomConflictRequest = {
        room_ids: [selectedRoomId],
        branch_id: branchId,
        recurring_pattern: scheduleForm.recurring_pattern || "weekly",
        total_hours: scheduleForm.total_hours || 0,
        hours_per_session: scheduleForm.hours_per_session || 1,
        session_per_week: scheduleForm.session_per_week || 1,
        start_date:
          formatDate(scheduleForm.start_date) || scheduleForm.start_date,
        estimated_end_date: formatDate(scheduleForm.estimated_end_date),
        session_times: scheduleForm.session_times,
        session_start_time: scheduleForm.session_start_time,
      };

      const result = await scheduleService.checkRoomConflict(request);
      setRoomConflicts(result);
    } catch (error) {
      console.error("Error checking room conflicts:", error);
    } finally {
      setCheckingRooms(false);
    }
  }, [scheduleForm, selectedRoomId, rooms]);

  // Validation helper: Check if time is valid (within working hours if available)
  const isTimeValid = useCallback(() => {
    // If no working hours data, allow to proceed (teacher might not have set it yet)
    if (teacherWorkingHours.length === 0) {
      return true;
    }

    // Check all session times
    if (scheduleForm.session_times && scheduleForm.session_times.length > 0) {
      const invalidTimes = scheduleForm.session_times.filter((session) => {
        return !workingHoursHelpers.isTimeInWorkingHours(
          session.weekday,
          session.start_time,
          teacherWorkingHours
        );
      });

      // If there are invalid times, block proceeding
      return invalidTimes.length === 0;
    }

    return true;
  }, [scheduleForm.session_times, teacherWorkingHours]);

  // Validation helper: Check if all required fields are filled for room conflict check
  const isRoomCheckReady = useCallback(() => {
    return !!(
      scheduleForm.start_date &&
      scheduleForm.total_hours &&
      scheduleForm.hours_per_session &&
      scheduleForm.session_times &&
      scheduleForm.session_times.length > 0
    );
  }, [scheduleForm]);

  // Validation helper: Check if all required fields are filled for preview
  const isPreviewReady = useCallback(() => {
    return !!(
      scheduleForm.schedule_name &&
      scheduleForm.group_id &&
      scheduleForm.default_teacher_id &&
      scheduleForm.start_date &&
      scheduleForm.total_hours &&
      scheduleForm.hours_per_session &&
      scheduleForm.session_times &&
      scheduleForm.session_times.length > 0 &&
      selectedRoomId !== null
    );
  }, [scheduleForm, selectedRoomId]);

  // Preview schedule function
  const previewSchedule = useCallback(async () => {
    if (!isPreviewReady()) {
      return;
    }

    setPreviewLoading(true);
    setPreviewData(null);

    try {
      const branchId =
        scheduleForm.branch_id ??
        rooms.find((room) => room.id === selectedRoomId)?.branch_id ??
        undefined;

      const payload: CreateScheduleRequest = {
        ...scheduleForm,
        schedule_name: scheduleForm.schedule_name || "",
        start_date: scheduleForm.start_date || "",
        schedule_type: "class",
        default_room_id: selectedRoomId!,
      };

      if (branchId !== undefined) {
        payload.branch_id = branchId;
      }

      // Format start_date with timezone
      if (payload.start_date && !payload.start_date.includes("T")) {
        payload.start_date = new Date(
          payload.start_date + "T00:00:00Z"
        ).toISOString();
      }

      // Multi-slot configuration
      if (payload.session_times && payload.session_times.length > 0) {
        payload.session_per_week = payload.session_times.length;
        payload.recurring_pattern = "custom";
        delete payload.session_start_time;
        delete payload.time_slots;
      } else {
        delete payload.session_times;
      }

      const preview = await scheduleService.previewSchedule(payload);
      setPreviewData(preview);
    } catch (err) {
      console.error("Failed to preview schedule:", err);
    } finally {
      setPreviewLoading(false);
    }
  }, [scheduleForm, selectedRoomId, isPreviewReady, rooms]);

  // Auto-check conflicts when entering room tab (if validation passes)
  useEffect(() => {
    if (activeTab === "room" && isRoomCheckReady() && selectedRoomId !== null) {
      checkRoomConflicts();
    }
  }, [activeTab, selectedRoomId, checkRoomConflicts, isRoomCheckReady]);

  // Auto-preview when entering preview tab (if validation passes)
  useEffect(() => {
    if (activeTab === "preview" && isPreviewReady()) {
      previewSchedule();
    }
  }, [activeTab, previewSchedule, isPreviewReady]);

  const handleConfirm = useCallback(async () => {
    // ❌ Remove old validation that blocks schedule creation
    // Instead, we now allow creation but show warning

    // Clear any previous validation errors
    setValidationError(null);

    const payload: Partial<CreateScheduleRequest> = {
      ...scheduleForm,
      schedule_type: "class",
    };

    // Use selected room from room tab
    if (selectedRoomId !== null) {
      payload.default_room_id = selectedRoomId;
    }

    // Ensure default_teacher_id is included in payload
    if (
      scheduleForm.default_teacher_id &&
      scheduleForm.default_teacher_id > 0
    ) {
      payload.default_teacher_id = scheduleForm.default_teacher_id;
    }

    // Use estimated_end_date from preview data
    if (previewData?.summary?.estimated_end_date) {
      payload.estimated_end_date = previewData.summary.estimated_end_date;
    }

    // Format start_date with timezone
    if (payload.start_date && !payload.start_date.includes("T")) {
      payload.start_date = new Date(
        payload.start_date + "T00:00:00Z"
      ).toISOString();
    }

    // If using session_times (multi-slot weekly class - Case 2)
    if (payload.session_times && payload.session_times.length > 0) {
      // Validate: session_per_week must equal session_times.length
      payload.session_per_week = payload.session_times.length;
      payload.recurring_pattern = "custom"; // Force custom pattern for multi-slot

      // Remove legacy fields when using session_times
      delete payload.session_start_time;
      delete payload.time_slots;
    }
    // Otherwise, ensure we're using single-slot mode (Case 1)
    else {
      // Remove session_times if empty
      delete payload.session_times;
      // session_start_time should be set from form
    }

    console.log("=== CREATE SCHEDULE PAYLOAD ===");
    console.log("Full payload:", JSON.stringify(payload, null, 2));
    console.log("Selected Room ID:", selectedRoomId);
    console.log("Schedule Form:", scheduleForm);
    console.log(
      "🎯 default_teacher_id from scheduleForm:",
      scheduleForm.default_teacher_id
    );
    console.log(
      "🎯 default_teacher_id in payload:",
      payload.default_teacher_id
    );

    setIsSubmitting(true);
    try {
      console.log("Calling onConfirm with payload...");
      await onConfirm(payload);
      console.log("✅ Schedule created successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("❌ Error creating class schedule:", err);
      // Show error to user
      if (err instanceof Error) {
        alert(`Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [scheduleForm, selectedRoomId, previewData, onConfirm]);

  useEffect(() => {
    if (!showSuccessModal) return;
    const t = window.setTimeout(() => {
      setShowSuccessModal(false);
      onClose();
    }, 1500);
    return () => window.clearTimeout(t);
  }, [showSuccessModal, onClose]);

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      setActiveTab("basic");
      hasInitializedRef.current = true;
    }

    // Reset ref when modal closes
    if (!isOpen) {
      hasInitializedRef.current = false;
      hasSessionTimesRef.current = false; // Reset session times flag too
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        {isOpen && (
          <DialogContent className="flex flex-col w-[95vw] max-w-4xl max-h-[90vh] bg-white animate-in fade-in-0 zoom-in-95 slide-in-from-top-8 duration-300">
            <DialogHeader className="border-b border-gray-200 pb-4 md:pb-6 bg-gradient-to-r from-indigo-50 to-purple-50 -m-4 md:-m-6 mb-4 md:mb-6 px-4 md:px-6 pt-4 md:pt-6">
              <div className="flex items-center gap-2 md:gap-3">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                  </button>
                )}
                <div className="flex-1">
                  <DialogTitle className="text-xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                      <UsersIcon className="h-5 w-5 md:h-8 md:w-8 text-white" />
                    </div>
                    {language === "th"
                      ? "สร้างตารางคลาสเรียน"
                      : "Create Class Schedule"}
                  </DialogTitle>
                  <p className="text-gray-600 mt-2">
                    {language === "th"
                      ? "กำหนดตารางเรียนประจำพร้อมกลุ่มนักเรียนและคอร์ส"
                      : "Set up recurring class schedule with student groups and courses"}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 min-h-0 overflow-y-auto text-gray-700">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                className="h-full flex flex-col"
              >
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-gray-100 p-1 rounded-xl gap-1">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center justify-center gap-1 md:gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-xs md:text-sm"
                  >
                    <BookOpenIcon className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">
                      {language === "th" ? "ข้อมูลพื้นฐาน" : "Basic Info"}
                    </span>
                    <span className="sm:hidden">
                      {language === "th" ? "พื้นฐาน" : "Basic"}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="schedule"
                    className="flex items-center justify-center gap-1 md:gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-xs md:text-sm"
                  >
                    <ClockIcon className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">
                      {language === "th" ? "ตารางเวลา" : "Time Schedule"}
                    </span>
                    <span className="sm:hidden">
                      {language === "th" ? "เวลา" : "Time"}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="room"
                    className="flex items-center justify-center gap-1 md:gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-xs md:text-sm"
                  >
                    <UsersIcon className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">
                      {language === "th" ? "ห้องเรียน" : "Room"}
                    </span>
                    <span className="sm:hidden">
                      {language === "th" ? "ห้อง" : "Room"}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    disabled={!isPreviewReady()}
                    className="flex items-center justify-center gap-1 md:gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
                  >
                    <CheckCircleIcon className="h-3 w-3 md:h-4 md:w-4" />
                    {language === "th" ? "พรีวิว" : "Preview"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="basic"
                  className="flex-1 overflow-y-auto space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300"
                >
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2 animation-duration-400">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <HiDocumentText className="h-5 w-5 text-indigo-600" />
                      {language === "th" ? "ข้อมูลคลาส" : "Class Information"}
                    </h3>

                    <div className="space-y-4">
                      {/* Schedule Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === "th" ? "ชื่อตาราง" : "Schedule Name"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={scheduleForm.schedule_name || ""}
                          onChange={(e) =>
                            updateForm({ schedule_name: e.target.value })
                          }
                          className="w-full h-12 px-4 text-base border border-gray-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl transition-colors bg-white"
                          placeholder={
                            language === "th"
                              ? "เช่น: English Conversation Class"
                              : "e.g., English Conversation Class"
                          }
                        />
                      </div>

                      {/* Branch Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === "th" ? "สาขา" : "Branch"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Combobox
                          value={
                            selectedBranchId
                              ? selectedBranchId.toString()
                              : undefined
                          }
                          onValueChange={(value) =>
                            setSelectedBranchId(Number(value) || null)
                          }
                          placeholder={
                            language === "th" ? "เลือกสาขา" : "Select Branch"
                          }
                          emptyText={
                            language === "th"
                              ? "ไม่พบสาขา"
                              : "No branches found"
                          }
                          searchPlaceholder={
                            language === "th"
                              ? "ค้นหาสาขา..."
                              : "Search branches..."
                          }
                          options={branches.map((branch) => ({
                            value: branch.id.toString(),
                            label:
                              language === "th"
                                ? branch.name_th
                                : branch.name_en,
                          }))}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {language === "th"
                            ? "เลือกสาขาเพื่อดูกลุ่มที่เปิดสอนในสาขานั้น"
                            : "Select a branch to view available groups"}
                        </p>
                      </div>

                      {/* Course Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === "th" ? "คอร์ส" : "Course"}
                        </label>
                        <div className="w-full min-h-[48px] px-4 py-3 border border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center">
                          {selectedGroup ? (
                            <span className="text-base text-gray-800 font-medium">
                              {selectedGroup.course_name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 italic">
                              {language === "th"
                                ? "เลือกกลุ่มเพื่อดึงข้อมูลคอร์สอัตโนมัติ"
                                : "Select a group to auto-fill the course"}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {language === "th"
                            ? "ระบบจะอ้างอิงคอร์สจากกลุ่มที่เลือกโดยอัตโนมัติ"
                            : "The course is automatically linked from the selected group."}
                        </p>
                      </div>

                      {/* Group Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {language === "th" ? "กลุ่ม" : "Group"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowCreateGroup(true)}
                            disabled={!selectedBranchId}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <PlusIcon className="h-4 w-4" />
                            {language === "th"
                              ? "สร้างกลุ่มใหม่"
                              : "Create New Group"}
                          </button>
                        </div>
                        {!selectedBranchId ? (
                          <div className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 flex items-center text-gray-500 text-sm">
                            {language === "th"
                              ? "กรุณาเลือกสาขาก่อน"
                              : "Please select a branch first"}
                          </div>
                        ) : loadingGroups ? (
                          <div className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl bg-white flex items-center justify-center">
                            <LoadingSpinner size="sm" />
                          </div>
                        ) : (
                          <Combobox
                            value={
                              scheduleForm.group_id && scheduleForm.group_id > 0
                                ? scheduleForm.group_id.toString()
                                : undefined
                            }
                            onValueChange={(value) =>
                              updateForm({ group_id: Number(value) || 0 })
                            }
                            placeholder={
                              language === "th" ? "เลือกกลุ่ม" : "Select Group"
                            }
                            emptyText={
                              language === "th"
                                ? "ไม่พบกลุ่ม (status=active,full)"
                                : "No groups found (status=active,full)"
                            }
                            searchPlaceholder={
                              language === "th"
                                ? "ค้นหากลุ่ม..."
                                : "Search groups..."
                            }
                            options={groupOptions}
                          />
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          {language === "th"
                            ? "แสดงเฉพาะกลุ่มที่มีสถานะ active และ full"
                            : "Showing only active and full status groups"}
                        </p>
                      </div>

                      {/* Teacher, Room, Max Students */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "th" ? "ครูผู้สอน" : "Teacher"}
                          </label>
                          <Combobox
                            value={(() => {
                              const teacherId = scheduleForm.default_teacher_id;
                              const valueString =
                                teacherId && teacherId > 0
                                  ? teacherId.toString()
                                  : undefined;
                              console.log(
                                "🔍 Combobox value:",
                                valueString,
                                "| Teacher ID:",
                                teacherId
                              );
                              console.log(
                                "🔍 Teacher options available:",
                                teacherOptions.length,
                                "options"
                              );

                              // Check if teacher ID exists in options
                              const matchingOption = teacherOptions.find(
                                (opt) => opt.value === valueString
                              );
                              console.log(
                                "🔍 Matching option for ID",
                                valueString,
                                ":",
                                matchingOption || "NOT FOUND"
                              );

                              return valueString;
                            })()}
                            onValueChange={(value) =>
                              updateForm({
                                default_teacher_id: Number(value) || 0,
                              })
                            }
                            placeholder={
                              language === "th" ? "เลือกครู" : "Select Teacher"
                            }
                            emptyText={
                              language === "th" ? "ไม่พบครู" : "No teachers"
                            }
                            searchPlaceholder={
                              language === "th" ? "ค้นหาครู..." : "Search..."
                            }
                            options={teacherOptions}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="schedule"
                  className="flex-1 overflow-y-auto animate-in fade-in-0 slide-in-from-right-4 duration-300"
                >
                  <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    {/* Working Hours Warning Banner */}
                    {!isTimeValid() && (
                      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-sm animate-in fade-in-0 slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-3">
                          <svg
                            className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-red-900 mb-1">
                              {language === "th"
                                ? "⚠️ เวลาเรียนไม่ตรงกับเวลาทำงานของครู"
                                : "⚠️ Session time outside teacher's working hours"}
                            </h4>
                            <p className="text-sm text-red-800">
                              {language === "th"
                                ? "คุณเลือกเวลาที่อยู่นอกช่วงเวลาทำงานของครู กรุณาแก้ไขเวลาให้ตรงกับช่วงเวลาทำงานก่อนดำเนินการต่อ"
                                : "The selected time is outside the teacher's working hours. Please adjust the time to match working hours before proceeding."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                        {language === "th" ? "ตารางเวลาเรียน" : "Time Schedule"}
                      </h3>
                    </div>

                    {/* Start Date & First Session Day */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {language === "th"
                          ? "วันที่เริ่มต้น & วันคาบแรก"
                          : "Start Date & First Session Day"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={scheduleForm.start_date || ""}
                        onChange={(e) =>
                          updateForm({ start_date: e.target.value })
                        }
                        className="w-full p-2.5 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {scheduleForm.start_date && (
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <p className="text-xs md:text-sm text-indigo-900 flex items-center gap-2">
                            <ClockIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span className="font-medium">
                              {language === "th"
                                ? "คาบแรกจะเริ่มในวัน"
                                : "First session on"}
                              :{" "}
                            </span>
                            <span className="font-bold">
                              {getWeekdayName(
                                getWeekdayFromDate(scheduleForm.start_date)
                              )}
                            </span>
                          </p>
                          <p className="text-[10px] md:text-xs text-indigo-700 mt-1.5">
                            💡{" "}
                            {language === "th"
                              ? "วันที่เลือกจะเป็นวันของคาบเรียนแรก"
                              : "Selected date sets the first session day"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Hours Configuration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === "th" ? "ชั่วโมงทั้งหมด" : "Total Hours"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={scheduleForm.total_hours || ""}
                          onChange={(e) =>
                            updateForm({
                              total_hours:
                                Number.parseFloat(e.target.value) || undefined,
                            })
                          }
                          className="w-full p-2.5 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="30, 40, 60"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {language === "th"
                            ? "รองรับ 0.5 ชม. เช่น 30, 40.5, 60"
                            : "Supports 0.5 hour increments, e.g., 30, 40.5, 60"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === "th"
                            ? "ชั่วโมงต่อคาบ"
                            : "Hours Per Session"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={scheduleForm.hours_per_session || ""}
                          onChange={(e) =>
                            updateForm({
                              hours_per_session:
                                Number.parseFloat(e.target.value) || undefined,
                            })
                          }
                          className="w-full p-2.5 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="0.5, 1, 1.5, 2, 3"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {language === "th"
                            ? "ตัวอย่าง: 0.5 = 30 นาที, 1 = 1 ชั่วโมง, 1.5 = 1.5 ชม."
                            : "Example: 0.5 = 30 min, 1 = 1 hour, 1.5 = 1.5 hours"}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* First Session (from Start Date) */}
                    {scheduleForm.start_date && (
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                            {language === "th"
                              ? "คาบเรียนหลัก"
                              : "Main Session"}
                          </h4>
                          {(scheduleForm.session_times || []).length === 0 && (
                            <Button
                              onClick={addSessionTime}
                              variant="outline"
                              size="sm"
                              className="text-xs w-full sm:w-auto"
                            >
                              <PlusIcon className="h-3 w-3 mr-1" />
                              {language === "th"
                                ? "เพิ่มเวลาเรียน"
                                : "Add Time"}
                            </Button>
                          )}
                        </div>

                        {(scheduleForm.session_times || []).length > 0 ? (
                          <div
                            className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-5 rounded-xl border-2 shadow-sm space-y-4"
                            style={{
                              borderColor: "#334293",
                              boxShadow:
                                "0 4px 6px -1px rgba(51, 66, 147, 0.1), 0 2px 4px -1px rgba(51, 66, 147, 0.06)",
                            }}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span
                                className="text-sm md:text-base font-semibold flex items-center gap-2"
                                style={{ color: "#334293" }}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {getWeekdayName(
                                  scheduleForm.session_times?.[0]?.weekday ?? 1
                                )}
                              </span>
                              <span
                                className="text-xs px-3 py-1 rounded-full font-medium"
                                style={{
                                  backgroundColor: "#EFE957",
                                  color: "#334293",
                                }}
                              >
                                {language === "th" ? "คาบหลัก" : "Main Session"}
                              </span>
                            </div>

                            {/* Working Hours Info - แสดงเฉพาะข้อมูล ไม่บล็อกการป้อนเวลา */}
                            {loadingWorkingHours && (
                              <div
                                className="flex items-center gap-2 text-sm p-3 rounded-lg"
                                style={{
                                  backgroundColor: "rgba(51, 66, 147, 0.05)",
                                }}
                              >
                                <LoadingSpinner size="sm" />
                                <span style={{ color: "#334293" }}>
                                  {language === "th"
                                    ? "กำลังโหลดเวลาทำงานครู..."
                                    : "Loading teacher hours..."}
                                </span>
                              </div>
                            )}

                            {workingHoursError && (
                              <div className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-800 flex items-start gap-2">
                                <svg
                                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span>
                                  {language === "th"
                                    ? "ไม่พบข้อมูลเวลาทำงานของครู"
                                    : "Teacher working hours not available"}
                                </span>
                              </div>
                            )}

                            {teacherWorkingHours.length > 0 &&
                              !loadingWorkingHours && (
                                <div className="space-y-2">
                                  <div
                                    className="text-sm p-3 rounded-lg flex items-start gap-2"
                                    style={{
                                      backgroundColor:
                                        "rgba(59, 130, 246, 0.1)",
                                      color: "#1e40af",
                                    }}
                                  >
                                    <svg
                                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <div>
                                      <div className="font-medium">
                                        {language === "th"
                                          ? "ℹ️ เวลาทำงานของครู"
                                          : "ℹ️ Teacher's Working Hours"}
                                      </div>
                                      <div className="text-xs mt-1 space-y-1">
                                        {teacherWorkingHours
                                          .filter(
                                            (wh) =>
                                              wh.day_of_week ===
                                              (scheduleForm.session_times?.[0]
                                                ?.weekday ?? 1)
                                          )
                                          .map((wh, idx) => (
                                            <div
                                              key={idx}
                                              className="flex items-center gap-2"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                              <span className="font-mono">
                                                {wh.start_time} - {wh.end_time}
                                              </span>
                                            </div>
                                          ))}
                                        {teacherWorkingHours.filter(
                                          (wh) =>
                                            wh.day_of_week ===
                                            (scheduleForm.session_times?.[0]
                                              ?.weekday ?? 1)
                                        ).length === 0 && (
                                          <div className="text-amber-700">
                                            {language === "th"
                                              ? "⚠️ ครูไม่มีเวลาทำงานในวันนี้"
                                              : "⚠️ Teacher has no working hours on this day"}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                            <div>
                              <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: "#334293" }}
                              >
                                {language === "th"
                                  ? "เวลาเริ่มต้น"
                                  : "Start Time"}{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="time"
                                value={
                                  scheduleForm.session_times?.[0]?.start_time ||
                                  "09:00"
                                }
                                onChange={(e) => {
                                  const newTime = e.target.value;
                                  updateSessionTime(0, {
                                    start_time: newTime,
                                  });
                                }}
                                className="w-full p-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-mono text-base"
                                style={
                                  {
                                    borderColor:
                                      teacherWorkingHours.length > 0 &&
                                      scheduleForm.session_times?.[0]
                                        ?.start_time &&
                                      !workingHoursHelpers.isTimeInWorkingHours(
                                        scheduleForm.session_times?.[0]
                                          ?.weekday ?? 1,
                                        scheduleForm.session_times?.[0]
                                          ?.start_time,
                                        teacherWorkingHours
                                      )
                                        ? "#ef4444"
                                        : "#d1d5db",
                                    backgroundColor:
                                      teacherWorkingHours.length > 0 &&
                                      scheduleForm.session_times?.[0]
                                        ?.start_time &&
                                      !workingHoursHelpers.isTimeInWorkingHours(
                                        scheduleForm.session_times?.[0]
                                          ?.weekday ?? 1,
                                        scheduleForm.session_times?.[0]
                                          ?.start_time,
                                        teacherWorkingHours
                                      )
                                        ? "#fee2e2"
                                        : "white",
                                    "--tw-ring-color": "#334293",
                                  } as React.CSSProperties
                                }
                              />
                              {teacherWorkingHours.length > 0 &&
                                scheduleForm.session_times?.[0]?.start_time &&
                                !workingHoursHelpers.isTimeInWorkingHours(
                                  scheduleForm.session_times?.[0]?.weekday ?? 1,
                                  scheduleForm.session_times?.[0]?.start_time,
                                  teacherWorkingHours
                                ) && (
                                  <div className="mt-2 p-3 bg-red-50 border-2 border-red-300 rounded-lg flex items-start gap-2 text-red-700 text-sm shadow-sm">
                                    <svg
                                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <div>
                                      <div className="font-semibold">
                                        {language === "th"
                                          ? "⚠️ เวลานี้อยู่นอกช่วงเวลาทำงานของครู"
                                          : "⚠️ This time is outside teacher's working hours"}
                                      </div>
                                      <div className="text-xs mt-1">
                                        {language === "th"
                                          ? "คุณสามารถเลือกเวลานี้ได้ แต่จะไม่สามารถดำเนินการต่อได้จนกว่าจะแก้ไข"
                                          : "You can select this time, but cannot proceed until fixed"}
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </div>

                            <div
                              className="text-xs flex items-center gap-2 p-2 rounded-lg"
                              style={{
                                backgroundColor: "rgba(51, 66, 147, 0.05)",
                                color: "#334293",
                              }}
                            >
                              <svg
                                className="w-4 h-4 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>
                                {language === "th"
                                  ? "วันนี้จะเป็นวันของทุกคาบเรียนในตาราง"
                                  : "This day applies to all sessions in the schedule"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 p-3 md:p-4 rounded-lg text-center">
                            <p className="text-xs md:text-sm text-yellow-800 mb-2">
                              {language === "th"
                                ? "⚠️ กรุณาเพิ่มเวลาเรียนสำหรับวัน "
                                : "⚠️ Add session time for "}
                              {getWeekdayName(
                                getWeekdayFromDate(scheduleForm.start_date)
                              )}
                            </p>
                            <Button
                              onClick={addSessionTime}
                              variant="monthViewClicked"
                              size="sm"
                              className="mt-2 w-full sm:w-auto"
                            >
                              <PlusIcon className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              {language === "th"
                                ? "เพิ่มเวลาเรียน"
                                : "Add Time"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Additional Sessions */}
                    {(scheduleForm.session_times || []).length > 0 && (
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <h4 className="text-sm font-semibold text-gray-700">
                            {language === "th"
                              ? "วันเรียนเพิ่มเติม"
                              : "Additional Days"}
                            <span className="text-xs text-gray-500 ml-1">
                              (Optional)
                            </span>
                          </h4>
                          <Button
                            onClick={addSessionTime}
                            variant="outline"
                            size="sm"
                            className="text-xs w-full sm:w-auto"
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            {language === "th" ? "เพิ่มวัน" : "Add Day"}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(scheduleForm.session_times || [])
                            .slice(1)
                            .map((slot, index) => {
                              const actualIndex = index + 1;
                              const hasWorkingHours =
                                teacherWorkingHours.filter(
                                  (wh) => wh.day_of_week === slot.weekday
                                ).length > 0;

                              return (
                                <div
                                  key={actualIndex}
                                  className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border-2 shadow-sm space-y-3 transition-all duration-200 hover:shadow-md"
                                  style={{ borderColor: "#d1d5db" }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span
                                      className="text-sm font-semibold flex items-center gap-2"
                                      style={{ color: "#334293" }}
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      {language === "th" ? "วันที่" : "Day"}{" "}
                                      {actualIndex + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeSessionTime(actualIndex)
                                      }
                                      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      {language === "th" ? "ลบ" : "Remove"}
                                    </button>
                                  </div>

                                  <div>
                                    <label
                                      className="block text-sm font-medium mb-2"
                                      style={{ color: "#334293" }}
                                    >
                                      {language === "th"
                                        ? "เลือกวัน"
                                        : "Select Day"}
                                    </label>
                                    <select
                                      value={slot.weekday}
                                      onChange={(e) =>
                                        updateSessionTime(actualIndex, {
                                          weekday: Number(e.target.value),
                                        })
                                      }
                                      className="w-full p-2.5 text-sm border-2 rounded-xl focus:ring-4 transition-all duration-200"
                                      style={
                                        {
                                          borderColor: "#d1d5db",
                                          "--tw-ring-color": "#334293",
                                        } as React.CSSProperties
                                      }
                                    >
                                      {weekDays.map((day) => (
                                        <option
                                          key={day.value}
                                          value={day.value}
                                        >
                                          {day.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Working hours info for this day */}
                                  {teacherWorkingHours.length > 0 && (
                                    <div
                                      className="text-xs p-2 rounded-lg"
                                      style={{
                                        backgroundColor: hasWorkingHours
                                          ? "rgba(34, 197, 94, 0.1)"
                                          : "rgba(251, 191, 36, 0.1)",
                                        color: hasWorkingHours
                                          ? "#166534"
                                          : "#92400e",
                                      }}
                                    >
                                      {hasWorkingHours ? (
                                        <div className="flex items-start gap-1">
                                          <svg
                                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          <div>
                                            {teacherWorkingHours
                                              .filter(
                                                (wh) =>
                                                  wh.day_of_week ===
                                                  slot.weekday
                                              )
                                              .map((wh, idx) => (
                                                <div
                                                  key={idx}
                                                  className="font-mono font-medium"
                                                >
                                                  {wh.start_time} -{" "}
                                                  {wh.end_time}
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <svg
                                            className="w-4 h-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          <span>
                                            {language === "th"
                                              ? "ครูไม่ทำงานวันนี้"
                                              : "Teacher not working this day"}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div>
                                    <label
                                      className="block text-sm font-medium mb-2"
                                      style={{ color: "#334293" }}
                                    >
                                      {language === "th"
                                        ? "เวลาเริ่มต้น"
                                        : "Start Time"}
                                    </label>
                                    <input
                                      type="time"
                                      value={slot.start_time}
                                      onChange={(e) => {
                                        const newTime = e.target.value;
                                        updateSessionTime(actualIndex, {
                                          start_time: newTime,
                                        });
                                      }}
                                      className="w-full p-2.5 border-2 rounded-xl focus:ring-4 transition-all duration-200 font-mono"
                                      style={
                                        {
                                          borderColor:
                                            teacherWorkingHours.length > 0 &&
                                            slot.start_time &&
                                            !workingHoursHelpers.isTimeInWorkingHours(
                                              slot.weekday,
                                              slot.start_time,
                                              teacherWorkingHours
                                            )
                                              ? "#ef4444"
                                              : "#d1d5db",
                                          backgroundColor:
                                            teacherWorkingHours.length > 0 &&
                                            slot.start_time &&
                                            !workingHoursHelpers.isTimeInWorkingHours(
                                              slot.weekday,
                                              slot.start_time,
                                              teacherWorkingHours
                                            )
                                              ? "#fee2e2"
                                              : "white",
                                          "--tw-ring-color": "#334293",
                                        } as React.CSSProperties
                                      }
                                    />
                                    {teacherWorkingHours.length > 0 &&
                                      slot.start_time &&
                                      !workingHoursHelpers.isTimeInWorkingHours(
                                        slot.weekday,
                                        slot.start_time,
                                        teacherWorkingHours
                                      ) && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                                          <svg
                                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          <span>
                                            {language === "th"
                                              ? "นอกเวลาทำงาน"
                                              : "Outside working hours"}
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              );
                            })}

                          {(scheduleForm.session_times || []).length === 1 && (
                            <div className="col-span-full text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                              <p className="text-sm">
                                {language === "th"
                                  ? "ไม่มีวันเรียนเพิ่มเติม - ถ้าต้องการเรียนหลายวันต่อสัปดาห์ คลิก 'เพิ่มวัน'"
                                  : "No additional days - Click 'Add Day' if you want multiple sessions per week"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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
                            ? "ข้ามวันหยุดอัตโนมัติ"
                            : "Automatically skip holidays"}
                        </label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="room"
                  className="flex-1 overflow-y-auto animate-in fade-in-0 slide-in-from-right-4 duration-300"
                >
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-indigo-600" />
                        {language === "th" ? "เลือกห้องเรียน" : "Select Room"}
                      </h3>
                      {selectedGroup && (
                        <div className="text-sm text-gray-600">
                          {language === "th" ? "นักเรียน" : "Students"}:{" "}
                          <span className="font-semibold">
                            {selectedGroup.max_students || 0}
                          </span>{" "}
                          {language === "th" ? "คน" : "people"}
                        </div>
                      )}
                    </div>

                    {/* Room Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rooms
                        .filter((room) => {
                          if (!selectedBranchId) return true;
                          return room.branch_id === selectedBranchId;
                        })
                        .map((room) => {
                          const isSelected = selectedRoomId === room.id;
                          const roomConflictInfo = roomConflicts?.rooms.find(
                            (r) => r.room_id === room.id
                          );
                          const hasConflict =
                            roomConflictInfo &&
                            roomConflictInfo.conflicts.length > 0;

                          // ✅ Logic แนะนำห้องใหม่
                          const groupSize = selectedGroup?.max_students || 0;
                          const branchId = selectedBranchId;

                          let isRecommended = false;

                          // Safely detect "zoom_pro" support: equipment might be an array, a string, or an object
                          const hasZoom = Array.isArray(room.equipment)
                            ? room.equipment.some((e) =>
                                String(e).toLowerCase().includes("zoom_pro")
                              )
                            : typeof room.equipment === "string"
                            ? room.equipment.toLowerCase().includes("zoom_pro")
                            : false;

                          if (branchId === 3) {
                            // 🔹 สาขาออนไลน์ → แนะนำเฉพาะห้องที่ชื่อหรืออุปกรณ์เกี่ยวกับ Online
                            isRecommended =
                              room.room_name.toLowerCase().includes("online") ||
                              hasZoom;
                          } else {
                            // 🔹 สาขาปกติ → แนะนำตามจำนวนคน แต่ไม่ห้องที่เล็กเกินไป
                            if (groupSize > 0) {
                              if (groupSize <= 2) {
                                isRecommended =
                                  room.capacity >= groupSize &&
                                  room.capacity <= 4;
                              } else if (groupSize <= 6) {
                                isRecommended =
                                  room.capacity >= groupSize &&
                                  room.capacity <= 6;
                              } else if (groupSize <= 10) {
                                isRecommended =
                                  room.capacity >= groupSize &&
                                  room.capacity <= 10;
                              } else {
                                isRecommended = room.capacity >= groupSize; // กลุ่มใหญ่พิเศษ
                              }
                            }
                          }

                          return (
                            <div
                              key={room.id}
                              onClick={() =>
                                setSelectedRoomId(isSelected ? null : room.id)
                              }
                              className={`
          relative p-4 rounded-lg border-2 cursor-pointer transition-all
          ${
            isSelected
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 hover:border-indigo-300"
          }
          ${hasConflict ? "border-red-300 bg-red-50" : ""}
        `}
                            >
                              {/* ✅ ป้ายแนะนำ */}
                              {isRecommended && !hasConflict && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                                  {language === "th" ? "แนะนำ" : "Recommended"}
                                </div>
                              )}

                              <div className="font-semibold text-gray-900">
                                {room.room_name}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {language === "th" ? "ความจุ" : "Capacity"}:{" "}
                                {room.capacity}{" "}
                                {language === "th" ? "คน" : "people"}
                              </div>

                              {hasConflict && (
                                <div className="mt-2 text-xs text-red-600">
                                  ⚠️{" "}
                                  {language === "th"
                                    ? "ตารางชน"
                                    : "Has conflicts"}{" "}
                                  ({roomConflictInfo.conflicts.length})
                                </div>
                              )}

                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircleIcon className="h-5 w-5 text-indigo-500" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>

                    {/* Conflict Details */}
                    {roomConflicts && roomConflicts.has_conflict && (
                      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-3">
                          {language === "th"
                            ? "รายละเอียดตารางที่ชน"
                            : "Conflict Details"}
                        </h4>
                        <div className="space-y-2">
                          {roomConflicts.conflicts.map((conflict, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-3 rounded border border-red-200 text-sm"
                            >
                              <div className="font-medium text-gray-900">
                                {conflict.schedule_name}
                              </div>
                              <div className="text-gray-600 mt-1">
                                {language === "th" ? "วันที่" : "Date"}:{" "}
                                {conflict.session_date} | {conflict.start_time}{" "}
                                - {conflict.end_time}
                              </div>
                              <div className="text-gray-600">
                                {language === "th" ? "ห้อง" : "Room"}:{" "}
                                {
                                  rooms.find((r) => r.id === conflict.room_id)
                                    ?.room_name
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRoomId !== null && (
                      <>
                        {!isRoomCheckReady() && (
                          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              {language === "th"
                                ? "⚠️ กรุณากรอกข้อมูลให้ครบถ้วน: วันเริ่ม, ชั่วโมงทั้งหมด, ชั่วโมงต่อคาบ และตารางเวลา"
                                : "⚠️ Please fill in all required fields: Start Date, Total Hours, Hours Per Session, and Time Schedule"}
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={checkRoomConflicts}
                          variant="monthViewClicked"
                          className="w-full"
                          disabled={!isRoomCheckReady() || checkingRooms}
                        >
                          {checkingRooms
                            ? language === "th"
                              ? "กำลังตรวจสอบ..."
                              : "Checking..."
                            : language === "th"
                            ? "ตรวจสอบห้องว่าง"
                            : "Check Room Availability"}
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="preview"
                  className="flex-1 overflow-y-auto animate-in fade-in-0 slide-in-from-right-4 duration-300"
                >
                  <div className="space-y-4">
                    {/* Loading State */}
                    {previewLoading && (
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-center py-8">
                          <LoadingSpinner />
                          <span className="ml-3 text-gray-600">
                            {language === "th"
                              ? "กำลังตรวจสอบตารางเรียน..."
                              : "Checking schedule..."}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Preview Data */}
                    {!previewLoading && previewData && (
                      <>
                        {/* Can Create Status */}
                        <div
                          className={`p-4 rounded-xl border-2 ${
                            previewData.can_create
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircleIcon
                              className={`h-6 w-6 ${
                                previewData.can_create
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            />
                            <div>
                              <p
                                className={`font-semibold ${
                                  previewData.can_create
                                    ? "text-green-900"
                                    : "text-red-900"
                                }`}
                              >
                                {previewData.can_create
                                  ? language === "th"
                                    ? "✓ พร้อมสร้างตารางเรียน"
                                    : "✓ Ready to Create Schedule"
                                  : language === "th"
                                  ? "✗ ไม่สามารถสร้างตารางได้"
                                  : "✗ Cannot Create Schedule"}
                              </p>
                              <p
                                className={`text-sm ${
                                  previewData.can_create
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {previewData.can_create
                                  ? language === "th"
                                    ? "ไม่พบปัญหา คุณสามารถกดสร้างตารางได้เลย"
                                    : "No blocking issues found. You can proceed to create."
                                  : language === "th"
                                  ? "พบปัญหาที่ต้องแก้ไข กรุณาตรวจสอบด้านล่าง"
                                  : "Issues found that need attention. Please check below."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Issues */}
                        {previewData.issues &&
                          previewData.issues.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {language === "th"
                                  ? "ประเด็นที่ต้องตรวจสอบ"
                                  : "Issues to Review"}
                              </h3>
                              <div className="space-y-3">
                                {previewData.issues.map((issue, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-4 rounded-lg border ${
                                      issue.severity === "error"
                                        ? "bg-red-50 border-red-200"
                                        : "bg-yellow-50 border-yellow-200"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span
                                        className={`text-sm font-semibold uppercase ${
                                          issue.severity === "error"
                                            ? "text-red-700"
                                            : "text-yellow-700"
                                        }`}
                                      >
                                        {issue.severity === "error"
                                          ? language === "th"
                                            ? "❌ ข้อผิดพลาด"
                                            : "❌ ERROR"
                                          : language === "th"
                                          ? "⚠️ คำเตือน"
                                          : "⚠️ WARNING"}
                                      </span>
                                    </div>
                                    <p
                                      className={`mt-2 text-sm ${
                                        issue.severity === "error"
                                          ? "text-red-800"
                                          : "text-yellow-800"
                                      }`}
                                    >
                                      {issue.message}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Summary */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {language === "th"
                              ? "สรุปตารางเรียน"
                              : "Schedule Summary"}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">
                                {language === "th"
                                  ? "จำนวนเซสชั่น:"
                                  : "Total Sessions:"}
                              </span>
                              <span className="ml-2 font-medium">
                                {previewData.summary.total_sessions}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                {language === "th"
                                  ? "ชั่วโมงทั้งหมด:"
                                  : "Total Hours:"}
                              </span>
                              <span className="ml-2 font-medium">
                                {previewData.summary.total_hours}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600">
                                  {language === "th" ? "เริ่ม:" : "Start:"}
                                </span>
                                <span className="font-medium text-indigo-600">
                                  {formatDateReadable(
                                    previewData.summary.start_date,
                                    language
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-gray-600">
                                  {language === "th" ? "สิ้นสุด:" : "End:"}
                                </span>
                                <span className="font-medium text-indigo-600">
                                  {formatDateReadable(
                                    previewData.summary.estimated_end_date,
                                    language
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sessions List */}
                        {previewData.sessions &&
                          previewData.sessions.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {language === "th"
                                  ? "รายการเซสชั่นทั้งหมด"
                                  : "All Sessions"}
                              </h3>
                              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {previewData.sessions.map((session, idx) => (
                                  <div
                                    key={idx}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                                            {session.session_number}
                                          </span>
                                          <span className="text-sm text-gray-600">
                                            {language === "th"
                                              ? "สัปดาห์ที่"
                                              : "Week"}{" "}
                                            {session.week_number}
                                          </span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {formatDateReadable(
                                            session.date,
                                            language
                                          )}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                          <ClockIcon className="inline h-4 w-4 mr-1" />
                                          {session.start_time} -{" "}
                                          {session.end_time}
                                        </div>
                                        {session.notes && (
                                          <div className="text-xs text-amber-600 mt-2 italic">
                                            📝 {session.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Holiday Impacts */}
                        {previewData.holiday_impacts &&
                          previewData.holiday_impacts.length > 0 && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200 shadow-sm">
                              <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {language === "th"
                                  ? "การปรับเปลี่ยนเนื่องจากวันหยุด"
                                  : "Holiday Rescheduling"}
                              </h3>
                              <div className="space-y-3">
                                {previewData.holiday_impacts.map(
                                  (impact, idx) => (
                                    <div
                                      key={idx}
                                      className="p-4 bg-white rounded-lg border border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex-shrink-0">
                                            {impact.session_number}
                                          </span>
                                          <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">
                                              {language === "th"
                                                ? `คาบที่ ${impact.session_number}`
                                                : `Session ${impact.session_number}`}
                                            </p>
                                            <p className="text-sm text-gray-700 mt-1">
                                              {language === "th" ? (
                                                <>
                                                  <span className="text-gray-600">
                                                    วันที่{" "}
                                                  </span>
                                                  <span className="font-medium text-red-600">
                                                    {formatDateReadable(
                                                      impact.date,
                                                      "th"
                                                    )}
                                                  </span>
                                                </>
                                              ) : (
                                                <>
                                                  <span className="text-gray-600">
                                                    Date:{" "}
                                                  </span>
                                                  <span className="font-medium text-red-600">
                                                    {formatDateReadable(
                                                      impact.date,
                                                      "en"
                                                    )}
                                                  </span>
                                                </>
                                              )}
                                            </p>
                                            {impact.holiday_name && (
                                              <p className="text-sm text-amber-700 mt-1 italic">
                                                {language === "th"
                                                  ? `หยุดเนื่องจาก ${impact.holiday_name}`
                                                  : `Closed for ${impact.holiday_name}`}
                                              </p>
                                            )}
                                            {impact.shifted_to && (
                                              <p className="text-sm text-gray-700 mt-2 flex items-center gap-1">
                                                <svg
                                                  className="w-4 h-4 text-green-600"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                  />
                                                </svg>
                                                {language === "th" ? (
                                                  <>
                                                    <span className="text-gray-600">
                                                      ถูกเลื่อนไปเป็น{" "}
                                                    </span>
                                                    <span className="font-semibold text-green-600">
                                                      {formatDateReadable(
                                                        impact.shifted_to,
                                                        "th"
                                                      )}
                                                    </span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <span className="text-gray-600">
                                                      Rescheduled to{" "}
                                                    </span>
                                                    <span className="font-semibold text-green-600">
                                                      {formatDateReadable(
                                                        impact.shifted_to,
                                                        "en"
                                                      )}
                                                    </span>
                                                  </>
                                                )}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Group Payment Status (for class schedules) */}
                        {previewData.group_payment && (
                          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              {language === "th"
                                ? "สถานะการชำระเงินของกลุ่ม"
                                : "Group Payment Status"}
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                  {language === "th"
                                    ? "สถานะกลุ่ม:"
                                    : "Group Status:"}
                                </span>
                                <span className="font-semibold">
                                  {
                                    previewData.group_payment
                                      .group_payment_status
                                  }
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                  {language === "th"
                                    ? "สมาชิกที่มีสิทธิ์:"
                                    : "Eligible Members:"}
                                </span>
                                <span className="font-semibold text-green-600">
                                  {previewData.group_payment.eligible_members}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                  {language === "th"
                                    ? "สมาชิกที่ไม่มีสิทธิ์:"
                                    : "Ineligible Members:"}
                                </span>
                                <span className="font-semibold text-red-600">
                                  {previewData.group_payment.ineligible_members}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* No Data State */}
                    {!previewLoading && !previewData && (
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-center text-gray-500">
                          {language === "th"
                            ? "กรุณากรอกข้อมูลให้ครบถ้วนเพื่อดูพรีวิว"
                            : "Please fill in all required fields to see preview"}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-3">
                {validationError && (
                  <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
                    {validationError}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto w-full sm:w-auto">
                  {activeTab !== "basic" && (
                    <Button
                      onClick={() => {
                        const tabOrder = [
                          "basic",
                          "schedule",
                          "room",
                          "preview",
                        ] as const;
                        const currentIndex = tabOrder.indexOf(activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(
                            tabOrder[currentIndex - 1] as typeof activeTab
                          );
                        }
                      }}
                      variant="monthView"
                      className="flex-1 sm:flex-none"
                    >
                      {language === "th" ? "ย้อนกลับ" : "Back"}
                    </Button>
                  )}
                  <Button
                    onClick={onClose}
                    variant="monthView"
                    className="flex-1 sm:flex-none"
                  >
                    {language === "th" ? "ยกเลิก" : "Cancel"}
                  </Button>
                  {activeTab !== "preview" ? (
                    <Button
                      onClick={() => {
                        const tabOrder = [
                          "basic",
                          "schedule",
                          "room",
                          "preview",
                        ] as const;
                        const currentIndex = tabOrder.indexOf(activeTab);
                        if (currentIndex < tabOrder.length - 1) {
                          setActiveTab(
                            tabOrder[currentIndex + 1] as typeof activeTab
                          );
                        }
                      }}
                      disabled={
                        (activeTab === "schedule" && !isTimeValid()) ||
                        (activeTab === "room" &&
                          (selectedRoomId === null ||
                            (roomConflicts?.has_conflict ?? false)))
                      }
                      variant="monthViewClicked"
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === "th" ? "ต่อไป" : "Next"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConfirm}
                      disabled={
                        isLoading ||
                        isSubmitting ||
                        !previewData ||
                        !previewData.can_create
                      }
                      variant="monthViewClicked"
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {language === "th" ? "สร้างตารางเรียบร้อย" : "Schedule Created"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-100">
              <p className="text-sm text-gray-700">
                {language === "th"
                  ? "ตารางคลาสถูกสร้างเรียบร้อยแล้ว"
                  : "The class schedule was created successfully."}
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

      {/* Group Creation Modal */}
      {showCreateGroup && (
        <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {language === "th" ? "สร้างกลุ่มใหม่" : "Create New Group"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-gray-700">
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  <Combobox
                    value={
                      groupForm.course_id && groupForm.course_id > 0
                        ? groupForm.course_id.toString()
                        : undefined
                    }
                    onValueChange={(selected) => {
                      const parsed = parseInt(String(selected), 10);
                      setGroupForm((prev) => ({
                        ...prev,
                        course_id:
                          Number.isFinite(parsed) && parsed > 0 ? parsed : 0,
                      }));
                    }}
                    placeholder={
                      language === "th" ? "เลือกคอร์ส" : "Select Course"
                    }
                    emptyText={language === "th" ? "ไม่พบคอร์ส" : "No courses"}
                    searchPlaceholder={
                      language === "th" ? "ค้นหาคอร์ส..." : "Search..."
                    }
                    options={courses.map((c) => ({
                      value: c.id.toString(),
                      label: c.course_name,
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                    {language === "th" ? "จำนวนนักเรียนสูงสุด" : "Max Students"}
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">
                      {language === "th" ? "รอชำระ" : "Pending"}
                    </option>
                    <option value="deposit_paid">
                      {language === "th" ? "มัดจำแล้ว" : "Deposit Paid"}
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                  placeholder={
                    language === "th"
                      ? "รายละเอียดเพิ่มเติมเกี่ยวกับกลุ่ม"
                      : "Additional details"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th"
                    ? "เลือกนักเรียน (ไม่บังคับ)"
                    : "Select Students (optional)"}
                </label>
                <div className="max-h-40 overflow-auto border border-gray-200 rounded-lg">
                  {availableStudents.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">
                      {language === "th" ? "ไม่พบนักเรียน" : "No students"}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {availableStudents.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
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
                          <span className="ml-3 text-sm">
                            {student.first_name_en ||
                              student.first_name_th ||
                              ""}{" "}
                            {student.last_name_en || student.last_name_th || ""}
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
    </>
  );
});

export default ClassScheduleModal;
