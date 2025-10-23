"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { CalendarSession, Room, TeacherOption } from "@/services/api/schedules";
import { colors } from "@/styles/colors";
import { AddSessionRequest, Schedule, Session } from "@/types/group.types";
import { Calendar, Clock, FileText, MapPin, Users, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddSessionRequest) => Promise<void>;
  schedule: Schedule;
  teachers?: TeacherOption[];
  rooms?: Room[];
  prefillDate?: string; // วันที่ที่ต้องการ prefill
  prefillTeacherId?: number; // ครูที่ต้องการ prefill
  prefillRoomId?: number; // ห้องที่ต้องการ prefill
  insertAfterSession?: CalendarSession | Session; // Session ที่ต้องการแทรกหลังจาก
  insertBeforeSession?: CalendarSession | Session; // Session ที่ต้องการแทรกก่อนหน้า
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  schedule,
  teachers = [],
  rooms = [],
  prefillDate,
  prefillTeacherId,
  prefillRoomId,
  insertAfterSession,
  insertBeforeSession,
}) => {
  const { language } = useLanguage();

  // Form state
  const [formData, setFormData] = useState<AddSessionRequest>({
    date: "",
    start_time: "",
    end_time: "",
    hours: undefined,
    assigned_teacher_id: undefined,
    room_id: undefined,
    notes: "",
  });

  const [useHours, setUseHours] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      // Reset form
      const defaultDate = prefillDate || new Date().toISOString().split("T")[0];

      let defaultStartTime = schedule.session_start_time || "09:00";
      let defaultEndTime = "";
      const defaultHours = schedule.hours_per_session;

      // ถ้าต้องการแทรกหลังจาก session
      if (insertAfterSession) {
        // ใช้วันที่และเวลาหลังจาก session นั้น
        const sessionDate = new Date(insertAfterSession.session_date);
        const sessionEndTime = new Date(insertAfterSession.end_time);

        formData.date = sessionDate.toISOString().split("T")[0];

        // เวลาเริ่มต้นหลังจาก session เดิม 30 นาที
        sessionEndTime.setMinutes(sessionEndTime.getMinutes() + 30);
        defaultStartTime = sessionEndTime.toTimeString().slice(0, 5);
      }

      // ถ้าต้องการแทรกก่อนหน้า session
      if (insertBeforeSession) {
        const sessionDate = new Date(insertBeforeSession.session_date);
        const sessionStartTime = new Date(insertBeforeSession.start_time);

        formData.date = sessionDate.toISOString().split("T")[0];

        // เวลาสิ้นสุดก่อน session เดิม 30 นาที
        const hours = schedule.hours_per_session || 2;
        sessionStartTime.setHours(sessionStartTime.getHours() - hours);
        sessionStartTime.setMinutes(sessionStartTime.getMinutes() - 30);
        defaultStartTime = sessionStartTime.toTimeString().slice(0, 5);
      }

      // คำนวณ end_time จาก hours_per_session
      if (defaultHours && defaultStartTime) {
        const [hours, minutes] = defaultStartTime.split(":").map(Number);
        const endHour = hours + Math.floor(defaultHours);
        const endMinute = minutes + (defaultHours % 1) * 60;
        defaultEndTime = `${String(endHour).padStart(2, "0")}:${String(
          endMinute
        ).padStart(2, "0")}`;
      }

      setFormData({
        date: defaultDate,
        start_time: defaultStartTime,
        end_time: defaultEndTime,
        hours: defaultHours,
        assigned_teacher_id: prefillTeacherId || schedule.default_teacher_id,
        room_id: prefillRoomId || schedule.default_room_id,
        notes: "",
      });

      setUseHours(false);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, schedule, prefillDate, insertAfterSession, insertBeforeSession]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "hours" ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate
      if (!formData.date || !formData.start_time) {
        throw new Error(
          language === "th"
            ? "กรุณากรอกวันที่และเวลาเริ่ม"
            : "Date and start time are required"
        );
      }

      // ถ้าใช้ hours ให้ลบ end_time
      const submitData: AddSessionRequest = {
        ...formData,
      };

      if (useHours) {
        delete submitData.end_time;
      } else {
        delete submitData.hours;
      }

      await onSubmit(submitData);
      onClose();
    } catch (err) {
      setError((err as Error).message || "Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const texts = {
    th: {
      title: insertAfterSession
        ? `เพิ่ม Session หลัง #${
            "session_number" in insertAfterSession
              ? insertAfterSession.session_number
              : insertAfterSession.id
          }`
        : insertBeforeSession
        ? `เพิ่ม Session ก่อน #${
            "session_number" in insertBeforeSession
              ? insertBeforeSession.session_number
              : insertBeforeSession.id
          }`
        : "เพิ่ม Session ใหม่",
      date: "วันที่",
      startTime: "เวลาเริ่ม",
      endTime: "เวลาจบ",
      duration: "ระยะเวลา (ชั่วโมง)",
      useDuration: "ใช้ระยะเวลาแทนเวลาจบ",
      teacher: "ครูผู้สอน",
      room: "ห้องเรียน",
      notes: "หมายเหตุ",
      cancel: "ยกเลิก",
      create: "สร้าง Session",
      hours: "ชั่วโมง",
      selectTeacher: "เลือกครู",
      selectRoom: "เลือกห้อง",
      optional: "(ไม่บังคับ)",
    },
    en: {
      title: insertAfterSession
        ? `Add Session After #${
            "session_number" in insertAfterSession
              ? insertAfterSession.session_number
              : insertAfterSession.id
          }`
        : insertBeforeSession
        ? `Add Session Before #${
            "session_number" in insertBeforeSession
              ? insertBeforeSession.session_number
              : insertBeforeSession.id
          }`
        : "Add New Session",
      date: "Date",
      startTime: "Start Time",
      endTime: "End Time",
      duration: "Duration (Hours)",
      useDuration: "Use duration instead of end time",
      teacher: "Teacher",
      room: "Room",
      notes: "Notes",
      cancel: "Cancel",
      create: "Create Session",
      hours: "hours",
      selectTeacher: "Select Teacher",
      selectRoom: "Select Room",
      optional: "(Optional)",
    },
  };

  const t = texts[language];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${colors.blueLogo}15 0%, ${colors.yellowLogo}25 100%)`,
          }}
        >
          <h2
            className="text-lg sm:text-2xl font-bold"
            style={{ color: colors.blueLogo }}
          >
            {t.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-white/60 rounded-full transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-3 sm:space-y-4"
        >
          {/* Show context if inserting */}
          {(insertAfterSession || insertBeforeSession) && (
            <div
              className="p-3 sm:p-4 rounded-lg border-2"
              style={{
                borderColor: colors.blueLogo,
                backgroundColor: `${colors.blueLogo}10`,
              }}
            >
              <p
                className="text-xs sm:text-sm font-medium"
                style={{ color: colors.blueLogo }}
              >
                {insertAfterSession && (
                  <>
                    {language === "th" ? "แทรกหลังจาก: " : "Insert after: "}
                    <span className="font-bold">
                      Session #
                      {"session_number" in insertAfterSession
                        ? insertAfterSession.session_number
                        : insertAfterSession.id}
                    </span>
                    {" - "}
                    {new Date(
                      insertAfterSession.session_date
                    ).toLocaleDateString(
                      language === "th" ? "th-TH" : "en-US"
                    )}{" "}
                    {new Date(insertAfterSession.start_time).toLocaleTimeString(
                      language === "th" ? "th-TH" : "en-US",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </>
                )}
                {insertBeforeSession && (
                  <>
                    {language === "th" ? "แทรกก่อนหน้า: " : "Insert before: "}
                    <span className="font-bold">
                      Session #
                      {"session_number" in insertBeforeSession
                        ? insertBeforeSession.session_number
                        : insertBeforeSession.id}
                    </span>
                    {" - "}
                    {new Date(
                      insertBeforeSession.session_date
                    ).toLocaleDateString(
                      language === "th" ? "th-TH" : "en-US"
                    )}{" "}
                    {new Date(
                      insertBeforeSession.start_time
                    ).toLocaleTimeString(
                      language === "th" ? "th-TH" : "en-US",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </>
                )}
              </p>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              <Calendar className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              {t.date}
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              <Clock className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              {t.startTime}
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Use Hours Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useHours"
              checked={useHours}
              onChange={(e) => setUseHours(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
              style={{ accentColor: colors.blueLogo }}
            />
            <label
              htmlFor="useHours"
              className="text-xs sm:text-sm text-gray-700"
            >
              {t.useDuration}
            </label>
          </div>

          {/* End Time or Hours */}
          {useHours ? (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                <Clock className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                {t.duration}
              </label>
              <input
                type="number"
                name="hours"
                value={formData.hours || ""}
                onChange={handleChange}
                step="0.5"
                min="0.5"
                placeholder="2"
                className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                <Clock className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                {t.endTime} {t.optional}
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Teacher */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              <Users className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              {t.teacher} {t.optional}
            </label>
            <select
              name="assigned_teacher_id"
              value={formData.assigned_teacher_id || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.selectTeacher}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.teacher_name}{" "}
                  {teacher.username ? `(@${teacher.username})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              <MapPin className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              {t.room} {t.optional}
            </label>
            <select
              name="room_id"
              value={formData.room_id || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.selectRoom}</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              <FileText className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              {t.notes} {t.optional}
            </label>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 border-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
              style={{
                borderColor: colors.blueLogo,
                color: colors.blueLogo,
              }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-medium text-white transition-colors disabled:opacity-50"
              style={{
                backgroundColor: colors.blueLogo,
              }}
            >
              {isSubmitting
                ? language === "th"
                  ? "กำลังสร้าง..."
                  : "Creating..."
                : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
