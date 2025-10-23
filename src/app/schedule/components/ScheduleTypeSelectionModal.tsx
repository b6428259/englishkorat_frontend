"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CalendarIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ScheduleTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClass: () => void;
  onSelectEvents: () => void;
  onSelectMakeup?: () => void;
}

export default function ScheduleTypeSelectionModal({
  isOpen,
  onClose,
  onSelectClass,
  onSelectEvents,
  onSelectMakeup,
}: Readonly<ScheduleTypeSelectionModalProps>) {
  const { language } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full bg-white animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 z-50 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 active:scale-95"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 hover:text-gray-700" />
        </button>

        <DialogHeader className="border-b border-gray-200 pb-4 sm:pb-6 bg-gradient-to-r from-indigo-50 to-purple-50 -m-4 sm:-m-6 mb-4 sm:mb-6 px-4 sm:px-6 pt-4 sm:pt-6">
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3 pr-8">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg sm:rounded-xl">
              <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            {language === "th" ? "สร้างตารางใหม่" : "Create New Schedule"}
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {language === "th"
              ? "เลือกประเภทตารางที่ต้องการสร้าง"
              : "Select the type of schedule you want to create"}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Class Option */}
          <button
            onClick={onSelectClass}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white p-5 sm:p-8 transition-all duration-200 hover:border-indigo-500 hover:shadow-2xl hover:scale-105 active:scale-100 animate-in fade-in-0 slide-in-from-left-8 animation-duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl transition-transform duration-300 group-hover:scale-110">
                <UsersIcon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {language === "th" ? "คลาสเรียน" : "Class"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {language === "th"
                  ? "สร้างตารางสำหรับคลาสเรียนประจำ พร้อมกลุ่มนักเรียนและคอร์ส"
                  : "Create a recurring class schedule with student groups and courses"}
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                <span className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] sm:text-xs font-medium animate-in fade-in-0 zoom-in-90 duration-300 delay-[200ms]">
                  {language === "th" ? "กลุ่ม" : "Groups"}
                </span>
                <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] sm:text-xs font-medium animate-in fade-in-0 zoom-in-90 duration-300 delay-[300ms]">
                  {language === "th" ? "คอร์ส" : "Courses"}
                </span>
                <span className="px-2 sm:px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-[10px] sm:text-xs font-medium animate-in fade-in-0 zoom-in-90 duration-300 delay-[400ms]">
                  {language === "th" ? "นักเรียน" : "Students"}
                </span>
              </div>
            </div>
          </button>

          {/* Events Option */}
          <button
            onClick={onSelectEvents}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white p-5 sm:p-8 transition-all duration-200 hover:border-emerald-500 hover:shadow-2xl hover:scale-105 active:scale-100 animate-in fade-in-0 slide-in-from-right-8 animation-duration-500 animation-delay-150"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl transition-transform duration-300 group-hover:scale-110">
                <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {language === "th" ? "อีเวนต์" : "Events"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {language === "th"
                  ? "สร้างตารางสำหรับการประชุม อีเวนต์ นัดหมาย หรือกิจกรรมอื่นๆ"
                  : "Create schedules for meetings, events, appointments, or other activities"}
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                <span className="px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] sm:text-xs font-medium animate-in fade-in-0 zoom-in-90 duration-300 delay-[350ms]">
                  {language === "th" ? "ประชุม" : "Meetings"}
                </span>
                <span className="px-2 sm:px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] sm:text-xs font-medium animate-in fade-in-0 zoom-in-90 duration-300 delay-[450ms]">
                  {language === "th" ? "นัดหมาย" : "Appointments"}
                </span>
                <span className="px-2 sm:px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-[10px] sm:text-xs font-medium animate-in fade-in-0 zoom-in-90 duration-300 delay-[550ms]">
                  {language === "th" ? "อีเวนต์" : "Events"}
                </span>
              </div>
            </div>
          </button>

          {/* Makeup Session Option */}
          {onSelectMakeup && (
            <button
              onClick={onSelectMakeup}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white p-5 sm:p-8 transition-all duration-200 hover:border-orange-500 hover:shadow-2xl hover:scale-105 active:scale-100 animate-in fade-in-0 slide-in-from-bottom-8 animation-duration-500 animation-delay-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl sm:rounded-2xl transition-transform duration-300 group-hover:scale-110">
                  <svg
                    className="h-10 w-10 sm:h-12 sm:w-12 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {language === "th" ? "คาบชดเชย" : "Makeup Session"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {language === "th"
                    ? "สร้างคาบเรียนชดเชยสำหรับคาบที่ยกเลิกหรือเลื่อน"
                    : "Create makeup session for cancelled or rescheduled classes"}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                  <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] sm:text-xs font-medium animate-in fade-in-0 zoom-in-90 duration-300 delay-[500ms]">
                    {language === "th" ? "ชดเชย" : "Makeup"}
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] sm:text-xs font-medium animate-in fade-in-0 zoom-in-90 duration-300 delay-[600ms]">
                    {language === "th" ? "โควต้า" : "Quota"}
                  </span>
                </div>
              </div>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
