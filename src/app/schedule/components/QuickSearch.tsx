"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { CalendarSession } from "@/services/api/schedules";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface QuickSearchProps {
  sessions: CalendarSession[];
  onSelectSession: (session: CalendarSession) => void;
  onClose: () => void;
}

export const QuickSearch = ({
  sessions,
  onSelectSession,
  onClose,
}: QuickSearchProps) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CalendarSession[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = sessions.filter((session) => {
      const searchText = query.toLowerCase();
      return (
        session.schedule_name?.toLowerCase().includes(searchText) ||
        session.course_name?.toLowerCase().includes(searchText) ||
        session.teacher_name?.toLowerCase().includes(searchText) ||
        session.room_name?.toLowerCase().includes(searchText) ||
        session.students?.some((student) =>
          student.name?.toLowerCase().includes(searchText)
        )
      );
    });

    setResults(filtered.slice(0, 10)); // Limit to 10 results
    setSelectedIndex(0);
  }, [query, sessions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      onSelectSession(results[selectedIndex]);
      onClose();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[600px] flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === "th"
                  ? "ค้นหา session, teacher, student, course..."
                  : "Search sessions, teachers, students, courses..."
              }
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {results.length === 0 && query.trim() && (
            <div className="text-center py-8 text-gray-500">
              {language === "th" ? "ไม่พบผลลัพธ์" : "No results found"}
            </div>
          )}

          {results.length === 0 && !query.trim() && (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {language === "th" ? "พิมพ์เพื่อค้นหา..." : "Type to search..."}
              </p>
            </div>
          )}

          <div className="space-y-1">
            {results.map((session, index) => (
              <button
                key={session.id}
                onClick={() => {
                  onSelectSession(session);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  index === selectedIndex
                    ? "bg-indigo-50 border-indigo-300"
                    : "hover:bg-gray-50"
                } border border-transparent`}
              >
                <div className="font-semibold text-gray-900 text-sm mb-1">
                  {session.schedule_name}
                </div>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <div>📚 {session.course_name}</div>
                  {session.teacher_name && <div>👨‍🏫 {session.teacher_name}</div>}
                  {session.room_name && <div>📍 {session.room_name}</div>}
                  <div>
                    🕐 {session.start_time} - {session.end_time}
                  </div>
                  {session.students && session.students.length > 0 && (
                    <div>
                      👥 {session.students.length}{" "}
                      {language === "th" ? "คน" : "students"}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex gap-3">
              <span>
                <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded">
                  ↑↓
                </kbd>{" "}
                {language === "th" ? "เลือก" : "Navigate"}
              </span>
              <span>
                <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded">
                  Enter
                </kbd>{" "}
                {language === "th" ? "เปิด" : "Open"}
              </span>
              <span>
                <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded">
                  Esc
                </kbd>{" "}
                {language === "th" ? "ปิด" : "Close"}
              </span>
            </div>
            <span>
              {results.length} {language === "th" ? "ผลลัพธ์" : "results"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
