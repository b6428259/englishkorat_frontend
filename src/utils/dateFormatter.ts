/**
 * Date Formatting Utilities for Thai and English
 */

// Thai month names
const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

// English month names
const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Format date string to readable format
 * @param dateString - Date in format "YYYY-MM-DD" or ISO datetime string
 * @param language - "th" or "en"
 * @returns Formatted date string
 *
 * @example
 * formatDateReadable("2025-10-13", "th") // "13 ตุลาคม 2568"
 * formatDateReadable("2025-10-13T00:00:00+07:00", "th") // "13 ตุลาคม 2568"
 * formatDateReadable("2025-10-13", "en") // "October 13, 2025"
 */
export function formatDateReadable(
  dateString: string,
  language: "th" | "en"
): string {
  if (!dateString) return "";

  try {
    // Handle ISO datetime strings by extracting date part
    const datePart = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;

    const [year, month, day] = datePart.split("-").map(Number);
    const monthIndex = month - 1;

    if (language === "th") {
      const thaiYear = year + 543; // Convert to Buddhist Era
      const thaiMonth = THAI_MONTHS[monthIndex];
      return `${day} ${thaiMonth} ${thaiYear}`;
    } else {
      const englishMonth = ENGLISH_MONTHS[monthIndex];
      return `${englishMonth} ${day}, ${year}`;
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Format short date (without year)
 * @param dateString - Date in format "YYYY-MM-DD" or ISO datetime string
 * @param language - "th" or "en"
 * @returns Formatted short date string
 *
 * @example
 * formatDateShort("2025-10-13", "th") // "13 ต.ค."
 * formatDateShort("2025-10-13T00:00:00+07:00", "th") // "13 ต.ค."
 * formatDateShort("2025-10-13", "en") // "Oct 13"
 */
export function formatDateShort(
  dateString: string,
  language: "th" | "en"
): string {
  if (!dateString) return "";

  try {
    // Handle ISO datetime strings by extracting date part
    const datePart = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;

    const [, month, day] = datePart.split("-").map(Number);
    const monthIndex = month - 1;

    if (language === "th") {
      const thaiMonthShort = THAI_MONTHS[monthIndex].substring(0, 3) + ".";
      return `${day} ${thaiMonthShort}`;
    } else {
      const englishMonthShort = ENGLISH_MONTHS[monthIndex].substring(0, 3);
      return `${englishMonthShort} ${day}`;
    }
  } catch (error) {
    console.error("Error formatting short date:", error);
    return dateString;
  }
}

/**
 * Format time string to 24-hour format
 * @param timeString - ISO datetime string or time string
 * @returns Formatted time string "HH:MM"
 *
 * @example
 * formatTime("2025-10-24T15:00:00+07:00") // "15:00"
 * formatTime("15:00:00") // "15:00"
 */
export function formatTime(timeString: string): string {
  if (!timeString) return "";

  try {
    // If it's an ISO string, extract the time part
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    // If it's just a time string like "15:00:00"
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
}

/**
 * Format full datetime to readable format with time
 * @param dateTimeString - ISO datetime string
 * @param language - "th" or "en"
 * @returns Formatted datetime string
 *
 * @example
 * formatDateTime("2025-10-24T15:30:00+07:00", "th") // "24 ตุลาคม 2568 เวลา 15:30 น."
 * formatDateTime("2025-10-24T15:30:00+07:00", "en") // "October 24, 2025 at 3:30 PM"
 */
export function formatDateTime(
  dateTimeString: string,
  language: "th" | "en"
): string {
  if (!dateTimeString) return "";

  try {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    if (language === "th") {
      const thaiYear = year + 543;
      const thaiMonth = THAI_MONTHS[month];
      return `${day} ${thaiMonth} ${thaiYear} เวลา ${hours}:${minutes} น.`;
    } else {
      const englishMonth = ENGLISH_MONTHS[month];
      const period = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;
      return `${englishMonth} ${day}, ${year} at ${hours12}:${minutes} ${period}`;
    }
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return dateTimeString;
  }
}

/**
 * Format relative time (how long ago)
 * @param dateTimeString - ISO datetime string
 * @param language - "th" or "en"
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime("2025-10-24T03:13:53+07:00", "th") // "11 ชั่วโมงที่แล้ว"
 * formatRelativeTime("2025-10-24T03:13:53+07:00", "en") // "11 hours ago"
 */
export function formatRelativeTime(
  dateTimeString: string,
  language: "th" | "en"
): string {
  if (!dateTimeString) return "";

  try {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (language === "th") {
      if (diffMins < 1) return "เมื่อสักครู่";
      if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
      if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
      return `${diffDays} วันที่แล้ว`;
    } else {
      if (diffMins < 1) return "just now";
      if (diffMins < 60)
        return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return dateTimeString;
  }
}
