"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMakeupNeededSessions } from "@/services/api/schedules";
import { MakeupNeededSession } from "@/types/session-cancellation.types";
import {
  AlertCircle,
  Calendar,
  Clock,
  PlusCircle,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SelectMakeupSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (session: {
    sessionId: number;
    sessionDate: string;
    sessionTime: string;
    scheduleName: string;
    scheduleId: number;
    makeupQuota: number;
    makeupRemaining: number;
    makeupUsed: number;
  }) => void;
}

export default function SelectMakeupSessionModal({
  isOpen,
  onClose,
  onSelectSession,
}: Readonly<SelectMakeupSessionModalProps>) {
  const { language } = useLanguage();
  const [sessions, setSessions] = useState<MakeupNeededSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const translations = {
    th: {
      title: "เลือก Session สำหรับทำ Makeup",
      subtitle: "คลิกเพื่อสร้าง Makeup Session สำหรับคาบเรียนที่ยกเลิก",
      search: "ค้นหา...",
      noData: "ไม่มี Session ที่ต้องทำ Makeup",
      noDataDesc: "ไม่มีคาบเรียนที่ยกเลิกและยังไม่ได้ทำ Makeup",
      loading: "กำลังโหลด...",
      group: "กลุ่ม",
      course: "คอร์ส",
      date: "วันที่",
      time: "เวลา",
      quota: "โควต้า",
      remaining: "เหลือ",
      select: "เลือก",
      cancel: "ยกเลิก",
      quotaFull: "โควต้าหมด",
    },
    en: {
      title: "Select Session for Makeup",
      subtitle: "Click to create makeup session for cancelled classes",
      search: "Search...",
      noData: "No Sessions Needing Makeup",
      noDataDesc: "There are no cancelled sessions requiring makeup",
      loading: "Loading...",
      group: "Group",
      course: "Course",
      date: "Date",
      time: "Time",
      quota: "Quota",
      remaining: "Remaining",
      select: "Select",
      cancel: "Cancel",
      quotaFull: "Quota Full",
    },
  };

  const t = translations[language];

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await getMakeupNeededSessions();
      setSessions(response.sessions_needing_makeup || []);
    } catch (error) {
      console.error("Failed to fetch makeup sessions:", error);
      toast.error(
        language === "th" ? "ไม่สามารถโหลดข้อมูลได้" : "Failed to load data"
      );
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const filteredSessions = sessions.filter((session) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      session.group?.group_name?.toLowerCase().includes(search) ||
      session.course?.course_name?.toLowerCase().includes(search) ||
      session.schedule_name?.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (language === "th") {
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    }
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            {t.title}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
        </DialogHeader>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600">{t.loading}</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.noData}
              </h3>
              <p className="text-gray-600">{t.noDataDesc}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => {
                const hasQuota = (session.make_up_remaining ?? 0) > 0;
                const handleClick = () => {
                  if (hasQuota) {
                    onSelectSession({
                      sessionId: session.session_id,
                      sessionDate: formatDate(session.session_date),
                      sessionTime: `${session.start_time} - ${session.end_time}`,
                      scheduleName: `${session.group.group_name} - ${session.course.course_name}`,
                      scheduleId: session.schedule_id,
                      makeupQuota: session.make_up_quota ?? 2,
                      makeupRemaining: session.make_up_remaining ?? 0,
                      makeupUsed: session.make_up_used ?? 0,
                    });
                    onClose();
                  }
                };

                return (
                  <button
                    key={session.session_id}
                    onClick={handleClick}
                    disabled={!hasQuota}
                    className={`w-full text-left border rounded-lg p-4 transition-all ${
                      hasQuota
                        ? "border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer"
                        : "border-red-200 bg-red-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {session.group.group_name}
                          </h3>
                          <Badge variant="outline">
                            {session.course.course_name}
                          </Badge>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(session.session_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {session.start_time} - {session.end_time}
                            </span>
                          </div>
                        </div>

                        {/* Quota */}
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {t.quota}:
                          </span>
                          <Badge variant={hasQuota ? "default" : "destructive"}>
                            {t.remaining}: {session.make_up_remaining ?? 0}/
                            {session.make_up_quota}
                          </Badge>
                        </div>
                      </div>

                      {/* Action */}
                      <div>
                        {hasQuota ? (
                          <Button
                            variant="monthViewClicked"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <PlusCircle className="h-4 w-4" />
                            {t.select}
                          </Button>
                        ) : (
                          <div className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                            {t.quotaFull}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 flex justify-end">
          <Button variant="cancel" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            {t.cancel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
