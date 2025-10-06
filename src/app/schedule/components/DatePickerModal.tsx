"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  HiCalendarDays,
  HiChevronLeft,
  HiChevronRight,
  HiXMark,
} from "react-icons/hi2";
import { MdToday } from "react-icons/md";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onDateSelect: (date: string) => void;
  language?: "th" | "en";
  minDate?: string;
  maxDate?: string;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  onDateSelect,
  language = "en",
  minDate,
  maxDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Parse selected date
  const selectedDate = useMemo(
    () => (currentDate ? new Date(currentDate) : null),
    [currentDate]
  );

  // Month names
  const monthNames =
    language === "th"
      ? [
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
        ]
      : [
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

  const monthNamesShort =
    language === "th"
      ? [
          "ม.ค.",
          "ก.พ.",
          "มี.ค.",
          "เม.ย.",
          "พ.ค.",
          "มิ.ย.",
          "ก.ค.",
          "ส.ค.",
          "ก.ย.",
          "ต.ค.",
          "พ.ย.",
          "ธ.ค.",
        ]
      : [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

  // Day names
  const dayNames =
    language === "th"
      ? ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]
      : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Format date for display
  const formatDate = (date: Date) => {
    const weekday =
      language === "th"
        ? ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"][
            date.getDay()
          ]
        : [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ][date.getDay()];

    if (language === "th") {
      const thaiYear = date.getFullYear() + 543;
      return `วัน${weekday}ที่ ${date.getDate()} ${
        monthNames[date.getMonth()]
      } ${thaiYear}`;
    }
    return `${weekday}, ${
      monthNames[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Format date to local YYYY-MM-DD string (fixes timezone issue)
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Check if date is selectable
  const isDateSelectable = (date: Date) => {
    const dateStr = formatDateString(date);

    if (minDate && dateStr < minDate) return false;
    if (maxDate && dateStr > maxDate) return false;

    return true;
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;

    const dateStr = formatDateString(date);
    onDateSelect(dateStr);
    handleClose();
  };

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  // Navigate years
  const navigateYear = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  // Set specific month
  const setMonth = (monthIndex: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(monthIndex);
      return newDate;
    });
    setShowMonthPicker(false);
  };

  // Set specific year
  const setYear = (year: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearPicker(false);
  };

  // Get year range for picker
  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    const endYear = currentYear + 10;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (isDateSelectable(today)) {
      const dateStr = formatDateString(today);
      onDateSelect(dateStr);
      handleClose();
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      onClose();
      setShowYearPicker(false);
      setShowMonthPicker(false);
    }, 200);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Initialize animation and current month
  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true);
      if (selectedDate) {
        setCurrentMonth(selectedDate);
      }
    }
  }, [isOpen, selectedDate]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const calendarDays = getCalendarDays();
  const today = new Date();
  const yearRange = getYearRange();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-300 ${
          animateIn ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 lg:p-8">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
                <HiCalendarDays className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
                  {language === "th" ? "เลือกวันที่" : "Select Date"}
                </h2>
                {selectedDate && (
                  <p className="text-xs sm:text-sm lg:text-base text-white/90 font-medium truncate">
                    {formatDate(selectedDate)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 flex-shrink-0 cursor-pointer"
              aria-label="Close"
            >
              <HiXMark className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            <button
              onClick={goToToday}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium cursor-pointer text-sm"
            >
              <MdToday className="w-4 h-4" />
              <span>{language === "th" ? "วันนี้" : "Today"}</span>
            </button>

            {["prev", "next"].map((direction) => (
              <button
                key={direction}
                onClick={() => navigateMonth(direction as "prev" | "next")}
                className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-medium cursor-pointer text-sm"
              >
                {direction === "prev"
                  ? language === "th"
                    ? "← เดือนที่แล้ว"
                    : "← Previous"
                  : language === "th"
                  ? "เดือนหน้า →"
                  : "Next →"}
              </button>
            ))}
          </div>

          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 bg-gray-50 rounded-xl p-3 sm:p-4">
            {!showYearPicker && !showMonthPicker && (
              <>
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 rounded-lg hover:bg-white text-gray-600 hover:text-gray-800 transition-all duration-200 hover:shadow-md cursor-pointer"
                  aria-label="Previous month"
                >
                  <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <div className="flex items-center space-x-2 sm:space-x-4">
                  <button
                    onClick={() => setShowMonthPicker(true)}
                    className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 hover:text-blue-600 hover:bg-white px-2 sm:px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    {monthNames[currentMonth.getMonth()]}
                  </button>
                  <button
                    onClick={() => setShowYearPicker(true)}
                    className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 hover:text-blue-600 hover:bg-white px-2 sm:px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    {language === "th"
                      ? currentMonth.getFullYear() + 543
                      : currentMonth.getFullYear()}
                  </button>
                </div>

                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 rounded-lg hover:bg-white text-gray-600 hover:text-gray-800 transition-all duration-200 hover:shadow-md cursor-pointer"
                  aria-label="Next month"
                >
                  <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Year Picker Header */}
            {showYearPicker && (
              <>
                <button
                  onClick={() => navigateYear("prev")}
                  className="p-2 rounded-lg hover:bg-white text-gray-600 hover:text-gray-800 transition-all duration-200 cursor-pointer"
                  aria-label="Previous year"
                >
                  <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <div className="text-base sm:text-lg font-bold text-gray-900">
                  {language === "th" ? "เลือกปี" : "Select Year"}
                </div>

                <button
                  onClick={() => navigateYear("next")}
                  className="p-2 rounded-lg hover:bg-white text-gray-600 hover:text-gray-800 transition-all duration-200 cursor-pointer"
                  aria-label="Next year"
                >
                  <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Month Picker Header */}
            {showMonthPicker && (
              <div className="w-full text-center">
                <div className="text-base sm:text-lg font-bold text-gray-900">
                  {language === "th" ? "เลือกเดือน" : "Select Month"}
                </div>
              </div>
            )}
          </div>

          {/* Year Picker Grid */}
          {showYearPicker && (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {yearRange.map((year) => (
                <button
                  key={year}
                  onClick={() => setYear(year)}
                  className={`
                    p-3 sm:p-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 cursor-pointer text-sm sm:text-base
                    ${
                      year === currentMonth.getFullYear()
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }
                  `}
                >
                  {language === "th" ? year + 543 : year}
                </button>
              ))}
            </div>
          )}

          {/* Month Picker Grid */}
          {showMonthPicker && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {monthNames.map((month, index) => (
                <button
                  key={index}
                  onClick={() => setMonth(index)}
                  className={`
                    p-3 sm:p-4 lg:p-5 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 cursor-pointer
                    ${
                      index === currentMonth.getMonth()
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }
                  `}
                >
                  <div className="text-sm sm:text-base lg:text-lg">{month}</div>
                  <div className="text-xs sm:text-sm opacity-75 mt-1">
                    {monthNamesShort[index]}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Calendar View */}
          {!showYearPicker && !showMonthPicker && (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-1 sm:p-2 text-center text-xs sm:text-sm font-bold text-gray-500 uppercase"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((date, index) => {
                  const isCurrentMonth =
                    date.getMonth() === currentMonth.getMonth();
                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected =
                    selectedDate &&
                    date.toDateString() === selectedDate.toDateString();
                  const isSelectable = isDateSelectable(date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      disabled={!isSelectable}
                      className={`
                        relative p-2 sm:p-3 text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 transform
                        ${
                          !isCurrentMonth
                            ? "text-gray-300 bg-gray-50/50"
                            : isSelected
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110 z-10"
                            : isToday
                            ? "bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-bold ring-2 ring-blue-500"
                            : isWeekend
                            ? "bg-red-50 text-red-600"
                            : isSelectable
                            ? "text-gray-700 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 cursor-pointer"
                            : "text-gray-300 cursor-not-allowed bg-gray-50"
                        }
                        ${
                          isSelectable && !isSelected
                            ? "hover:scale-110 hover:shadow-md"
                            : ""
                        }
                        ${!isSelectable ? "opacity-40" : ""}
                      `}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span>{date.getDate()}</span>
                        {isToday && !isSelected && (
                          <div className="absolute bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Back button for pickers */}
          {(showYearPicker || showMonthPicker) && (
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowYearPicker(false);
                  setShowMonthPicker(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <HiChevronLeft className="w-4 h-4" />
                <span>{language === "th" ? "กลับ" : "Back"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showYearPicker && !showMonthPicker && (
          <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 pt-2 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-500 min-w-0 max-w-full">
                {language === "th" ? "เลือก:" : "Selected:"}
                <span className="ml-2 font-semibold text-gray-700 break-words">
                  {selectedDate
                    ? formatDate(selectedDate)
                    : language === "th"
                    ? "ไม่ได้เลือก"
                    : "None"}
                </span>
              </div>

              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium cursor-pointer text-sm sm:text-base"
              >
                {language === "th" ? "ปิด" : "Close"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `,
        }}
      />
    </div>
  );
};
