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
 * @param dateString - Date in format "YYYY-MM-DD"
 * @param language - "th" or "en"
 * @returns Formatted date string
 *
 * @example
 * formatDateReadable("2025-10-13", "th") // "13 ตุลาคม 2568"
 * formatDateReadable("2025-10-13", "en") // "October 13, 2025"
 */
export function formatDateReadable(
  dateString: string,
  language: "th" | "en"
): string {
  if (!dateString) return "";

  try {
    const [year, month, day] = dateString.split("-").map(Number);
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
 * @param dateString - Date in format "YYYY-MM-DD"
 * @param language - "th" or "en"
 * @returns Formatted short date string
 *
 * @example
 * formatDateShort("2025-10-13", "th") // "13 ต.ค."
 * formatDateShort("2025-10-13", "en") // "Oct 13"
 */
export function formatDateShort(
  dateString: string,
  language: "th" | "en"
): string {
  if (!dateString) return "";

  try {
    const [, month, day] = dateString.split("-").map(Number);
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
