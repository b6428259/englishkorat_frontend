"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  SunIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface EventTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSelectEventType: (
    eventType: "meeting" | "appointment" | "event" | "personal" | "holiday"
  ) => void;
}

export default function EventTypeSelectionModal({
  isOpen,
  onClose,
  onBack,
  onSelectEventType,
}: EventTypeSelectionModalProps) {
  const { language } = useLanguage();

  const eventTypes = [
    {
      type: "meeting" as const,
      icon: UserGroupIcon,
      color: "blue",
      label: language === "th" ? "ประชุม" : "Meeting",
      description:
        language === "th"
          ? "การประชุมทีม การพบปะ หรือการประชุมออนไลน์"
          : "Team meetings, gatherings, or online conferences",
    },
    {
      type: "appointment" as const,
      icon: ClockIcon,
      color: "purple",
      label: language === "th" ? "นัดหมาย" : "Appointment",
      description:
        language === "th"
          ? "การนัดหมายส่วนตัว การปรึกษา หรือการพบกัน"
          : "Personal appointments, consultations, or meetups",
    },
    {
      type: "event" as const,
      icon: CalendarIcon,
      color: "emerald",
      label: language === "th" ? "อีเวนต์" : "Event",
      description:
        language === "th"
          ? "กิจกรรมพิเศษ งานเลี้ยง หรืองานสังสรรค์"
          : "Special activities, parties, or social gatherings",
    },
    {
      type: "personal" as const,
      icon: HeartIcon,
      color: "pink",
      label: language === "th" ? "ส่วนตัว" : "Personal",
      description:
        language === "th"
          ? "กิจกรรมส่วนตัว เวลาส่วนตัว หรือ Private Class"
          : "Personal activities, private time, or private classes",
    },
    {
      type: "holiday" as const,
      icon: SunIcon,
      color: "amber",
      label: language === "th" ? "วันหยุด" : "Holiday",
      description:
        language === "th"
          ? "วันหยุดประจำปี วันหยุดพิเศษ หรือวันปิดทำการ"
          : "Annual holidays, special leave, or closing days",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<
      string,
      { border: string; bg: string; iconBg: string; badge: string }
    > = {
      blue: {
        border: "hover:border-blue-500",
        bg: "from-blue-50 to-indigo-50",
        iconBg: "from-blue-500 to-indigo-500",
        badge: "bg-blue-100 text-blue-700",
      },
      purple: {
        border: "hover:border-purple-500",
        bg: "from-purple-50 to-pink-50",
        iconBg: "from-purple-500 to-pink-500",
        badge: "bg-purple-100 text-purple-700",
      },
      emerald: {
        border: "hover:border-emerald-500",
        bg: "from-emerald-50 to-teal-50",
        iconBg: "from-emerald-500 to-teal-500",
        badge: "bg-emerald-100 text-emerald-700",
      },
      pink: {
        border: "hover:border-pink-500",
        bg: "from-pink-50 to-rose-50",
        iconBg: "from-pink-500 to-rose-500",
        badge: "bg-pink-100 text-pink-700",
      },
      amber: {
        border: "hover:border-amber-500",
        bg: "from-amber-50 to-yellow-50",
        iconBg: "from-amber-500 to-yellow-500",
        badge: "bg-amber-100 text-amber-700",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-8 duration-300">
        <DialogHeader className="border-b border-gray-200 pb-6 bg-gradient-to-r from-emerald-50 to-teal-50 -m-6 mb-6 px-6 pt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                <CalendarIcon className="h-8 w-8 text-white" />
              </div>
              {language === "th" ? "เลือกประเภทอีเวนต์" : "Select Event Type"}
            </DialogTitle>
          </div>
          <p className="text-gray-600 mt-2">
            {language === "th"
              ? "เลือกประเภทอีเวนต์ที่ต้องการสร้าง"
              : "Choose the type of event you want to create"}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {eventTypes.map(
            ({ type, icon: Icon, color, label, description }, index) => {
              const colors = getColorClasses(color);
              return (
                <button
                  key={type}
                  onClick={() => onSelectEventType(type)}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className={`group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all duration-200 ${colors.border} hover:shadow-xl hover:scale-105 animate-in fade-in-0 slide-in-from-bottom-4`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${colors.iconBg} rounded-xl transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{label}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {description}
                    </p>
                    <span
                      className={`px-3 py-1 ${colors.badge} rounded-full text-xs font-medium`}
                    >
                      {label}
                    </span>
                  </div>
                </button>
              );
            }
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 px-6 pb-6 -mx-6 -mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {language === "th" ? "ย้อนกลับ" : "Back"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
