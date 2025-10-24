import { api } from "../api";

// Types based on TEACHER_WORKING_HOURS.md
export interface TeacherWorkingHour {
  id: number;
  teacher_id: number;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // "HH:MM" format (24-hour)
  end_time: string; // "HH:MM" format (24-hour)
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GetTeacherWorkingHoursResponse {
  success: boolean;
  teacher_id: number;
  working_hours: TeacherWorkingHour[];
  grouped: {
    [day: string]: Array<{
      id: number;
      start_time: string;
      end_time: string;
      notes?: string;
    }>;
  };
}

export interface AddWorkingHourRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface BatchWorkingHoursRequest {
  replace_existing: boolean;
  working_hours: AddWorkingHourRequest[];
}

export interface AvailableTeachersParams {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

// API Service
export const teacherWorkingHoursService = {
  // Get teacher working hours
  getWorkingHours: async (
    teacherId: number
  ): Promise<GetTeacherWorkingHoursResponse> => {
    const response = await api.get(`/teachers/${teacherId}/working-hours`);
    return response.data;
  },

  // Add single working hour
  addWorkingHour: async (
    teacherId: number,
    data: AddWorkingHourRequest
  ): Promise<{ success: boolean; working_hour: TeacherWorkingHour }> => {
    const response = await api.post(
      `/teachers/${teacherId}/working-hours`,
      data
    );
    return response.data;
  },

  // Update working hour
  updateWorkingHour: async (
    teacherId: number,
    workingHourId: number,
    data: Partial<AddWorkingHourRequest>
  ): Promise<{ success: boolean; working_hour: TeacherWorkingHour }> => {
    const response = await api.put(
      `/teachers/${teacherId}/working-hours/${workingHourId}`,
      data
    );
    return response.data;
  },

  // Delete (deactivate) working hour
  deleteWorkingHour: async (
    teacherId: number,
    workingHourId: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(
      `/teachers/${teacherId}/working-hours/${workingHourId}`
    );
    return response.data;
  },

  // Batch set working hours
  batchSetWorkingHours: async (
    teacherId: number,
    data: BatchWorkingHoursRequest
  ): Promise<{
    success: boolean;
    message: string;
    working_hours: TeacherWorkingHour[];
  }> => {
    const response = await api.post(
      `/teachers/${teacherId}/working-hours/batch`,
      data
    );
    return response.data;
  },

  // Find available teachers
  findAvailableTeachers: async (params: AvailableTeachersParams) => {
    const response = await api.get("/teachers/available", { params });
    return response.data;
  },
};

// Helper functions
export const workingHoursHelpers = {
  /**
   * ตรวจสอบว่าเวลาที่กำหนดอยู่ในช่วงเวลาทำงานของครูหรือไม่
   */
  isTimeInWorkingHours: (
    dayOfWeek: number,
    time: string,
    workingHours: TeacherWorkingHour[]
  ): boolean => {
    const activeHours = workingHours.filter(
      (wh) => wh.is_active && wh.day_of_week === dayOfWeek
    );

    if (activeHours.length === 0) return false;

    return activeHours.some((wh) => {
      return time >= wh.start_time && time < wh.end_time;
    });
  },

  /**
   * ตรวจสอบว่าช่วงเวลาที่กำหนดอยู่ในช่วงเวลาทำงานของครูทั้งหมดหรือไม่
   */
  isTimeRangeInWorkingHours: (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    workingHours: TeacherWorkingHour[]
  ): boolean => {
    const activeHours = workingHours.filter(
      (wh) => wh.is_active && wh.day_of_week === dayOfWeek
    );

    if (activeHours.length === 0) return false;

    // ตรวจสอบว่าทั้งช่วงเวลาอยู่ใน working hours หรือไม่
    return activeHours.some((wh) => {
      return startTime >= wh.start_time && endTime <= wh.end_time;
    });
  },

  /**
   * แปลง day of week จาก Date object เป็น API format
   */
  getDayOfWeekFromDate: (date: Date | string): number => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  },

  /**
   * แปลง day of week number เป็นชื่อวัน (TH)
   */
  getDayNameTH: (dayOfWeek: number): string => {
    const days = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    return days[dayOfWeek] || "";
  },

  /**
   * แปลง day of week number เป็นชื่อวัน (EN)
   */
  getDayNameEN: (dayOfWeek: number): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayOfWeek] || "";
  },

  /**
   * จัดกลุ่ม working hours ตามวัน
   */
  groupByDay: (
    workingHours: TeacherWorkingHour[]
  ): Map<number, TeacherWorkingHour[]> => {
    const grouped = new Map<number, TeacherWorkingHour[]>();

    workingHours
      .filter((wh) => wh.is_active)
      .forEach((wh) => {
        const existing = grouped.get(wh.day_of_week) || [];
        existing.push(wh);
        grouped.set(wh.day_of_week, existing);
      });

    return grouped;
  },

  /**
   * Format เวลาเป็น string สำหรับแสดงผล
   */
  formatTimeRange: (startTime: string, endTime: string): string => {
    return `${startTime} - ${endTime}`;
  },

  /**
   * ตรวจสอบว่าเวลาที่เลือกตรงกับ session_times หรือไม่
   */
  isSessionTimeValid: (
    sessionTimes: Array<{ weekday: number; start_time: string }>,
    workingHours: TeacherWorkingHour[]
  ): {
    valid: boolean;
    invalidSlots: Array<{
      weekday: number;
      start_time: string;
      reason: string;
    }>;
  } => {
    const invalidSlots: Array<{
      weekday: number;
      start_time: string;
      reason: string;
    }> = [];

    sessionTimes.forEach((st) => {
      const isValid = workingHoursHelpers.isTimeInWorkingHours(
        st.weekday,
        st.start_time,
        workingHours
      );

      if (!isValid) {
        invalidSlots.push({
          weekday: st.weekday,
          start_time: st.start_time,
          reason: "Teacher is not available at this time",
        });
      }
    });

    return {
      valid: invalidSlots.length === 0,
      invalidSlots,
    };
  },
};
