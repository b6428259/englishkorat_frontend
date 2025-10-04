"use client";

import SidebarLayout from "@/components/common/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { userService } from "@/services/user.service";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface TestCase {
  id: string;
  shortcut: string;
  name: string;
  description: string;
  icon: string;
  type: "info" | "warning" | "success" | "error";
}

// Import User type from auth.types
import type { User } from "@/types/auth.types";

const TEST_CASES: TestCase[] = [
  {
    id: "basic",
    shortcut: "1",
    name: "Basic Info",
    description: "ข้อความแจ้งเตือนพื้นฐาน",
    icon: "ℹ️",
    type: "info",
  },
  {
    id: "schedule",
    shortcut: "2",
    name: "Schedule Reminder",
    description: "แจ้งเตือนคาบเรียนใกล้ถึง (15 นาที)",
    icon: "📅",
    type: "info",
  },
  {
    id: "warning",
    shortcut: "3",
    name: "Schedule Conflict",
    description: "เตือนตารางเรียนซ้อนกัน",
    icon: "⚠️",
    type: "warning",
  },
  {
    id: "success",
    shortcut: "4",
    name: "Success Message",
    description: "ตารางได้รับการอนุมัติ",
    icon: "✅",
    type: "success",
  },
  {
    id: "error",
    shortcut: "5",
    name: "Error Notification",
    description: "การอัปโหลดล้มเหลว",
    icon: "❌",
    type: "error",
  },
  {
    id: "normal_only",
    shortcut: "6",
    name: "Normal Only",
    description: "แจ้งเตือนปกติ (ไม่มี popup)",
    icon: "📢",
    type: "info",
  },
  {
    id: "daily_reminder",
    shortcut: "7",
    name: "Daily Reminder",
    description: "สรุปตารางประจำวัน",
    icon: "🌅",
    type: "info",
  },
  {
    id: "payment_due",
    shortcut: "8",
    name: "Payment Due",
    description: "เตือนชำระเงิน",
    icon: "💰",
    type: "warning",
  },
  {
    id: "makeup_session",
    shortcut: "9",
    name: "Makeup Session",
    description: "คาบเรียนชดเชย",
    icon: "📝",
    type: "info",
  },
  {
    id: "absence_approved",
    shortcut: "10",
    name: "Absence Approved",
    description: "คำขอลาได้รับอนุมัติ",
    icon: "✔️",
    type: "success",
  },
  {
    id: "custom_sound",
    shortcut: "11",
    name: "Custom Sound",
    description: "ทดสอบเสียงที่อัปโหลด",
    icon: "🎵",
    type: "info",
  },
  {
    id: "long_message",
    shortcut: "12",
    name: "Long Message",
    description: "ข้อความยาว",
    icon: "📄",
    type: "info",
  },
  {
    id: "invitation",
    shortcut: "13",
    name: "Schedule Invitation",
    description: "คำเชิญเข้าร่วมตาราง",
    icon: "✉️",
    type: "info",
  },
];

const TestNotificationsPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedCase, setSelectedCase] = useState<string>("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user has permission
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "owner") {
      toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      router.push("/dashboard");
    }
  }, [user, router]);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Failed to load users:", error);
        toast.error("ไม่สามารถโหลดรายชื่อผู้ใช้ได้");
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user?.role === "admin" || user?.role === "owner") {
      loadUsers();
    }
  }, [user]);

  const handleSendTest = async () => {
    if (!selectedUserId) {
      toast.error("กรุณาเลือกผู้ใช้");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(
        `/notifications/test/popup?user_id=${selectedUserId}&case=${selectedCase}`
      );

      toast.success(
        `ส่งการแจ้งเตือนทดสอบไปยัง ${response.data.username} เรียบร้อย`
      );
    } catch (error: unknown) {
      console.error("Failed to send test notification:", error);
      const message =
        error instanceof Error
          ? error.message
          : "ไม่สามารถส่งการแจ้งเตือนทดสอบได้";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToSelf = async () => {
    setIsLoading(true);
    try {
      await api.get(`/notifications/test/popup?case=${selectedCase}`);

      toast.success("ส่งการแจ้งเตือนทดสอบให้ตัวเองเรียบร้อย");
    } catch (error: unknown) {
      console.error("Failed to send test notification:", error);
      const message =
        error instanceof Error
          ? error.message
          : "ไม่สามารถส่งการแจ้งเตือนทดสอบได้";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "all" || u.role === filterRole;

    // Get display name (for students use student.first_name + last_name, otherwise use username)
    const displayName = u.student
      ? `${u.student.first_name} ${u.student.last_name}`
      : u.username;

    const matchesSearch =
      searchQuery === "" ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesSearch;
  });

  const selectedTestCase = TEST_CASES.find((tc) => tc.id === selectedCase);

  if (user?.role !== "admin" && user?.role !== "owner") {
    return null;
  }

  return (
    <SidebarLayout
      breadcrumbItems={[{ label: "Admin" }, { label: "Test Notifications" }]}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                🔔
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {language === "th"
                    ? "ทดสอบการแจ้งเตือน WebSocket"
                    : "Test WebSocket Notifications"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {language === "th"
                    ? "ส่งการแจ้งเตือนทดสอบไปยังผู้ใช้"
                    : "Send test notifications to users"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Test Cases */}
            <div className="lg:col-span-2 space-y-6">
              {/* Test Case Selection */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📋</span>
                  {language === "th" ? "เลือกเคสทดสอบ" : "Select Test Case"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TEST_CASES.map((testCase) => {
                    const isSelected = selectedCase === testCase.id;
                    return (
                      <motion.button
                        key={testCase.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCase(testCase.id)}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-left ${
                          isSelected
                            ? "border-[#334293] bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">
                            {testCase.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`font-semibold ${
                                  isSelected
                                    ? "text-[#334293]"
                                    : "text-gray-900"
                                }`}
                              >
                                {testCase.name}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                #{testCase.shortcut}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {testCase.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <div className="w-5 h-5 bg-[#334293] rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Type Badge */}
                        <div className="mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              testCase.type === "info"
                                ? "bg-blue-100 text-blue-700"
                                : testCase.type === "warning"
                                ? "bg-yellow-100 text-yellow-700"
                                : testCase.type === "success"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {testCase.type}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Case Details */}
              {selectedTestCase && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{selectedTestCase.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {selectedTestCase.name}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {selectedTestCase.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="bg-white px-3 py-1 rounded-full border">
                          Shortcut: #{selectedTestCase.shortcut}
                        </span>
                        <span className="bg-white px-3 py-1 rounded-full border">
                          Type: {selectedTestCase.type}
                        </span>
                        <span className="bg-white px-3 py-1 rounded-full border">
                          ID: {selectedTestCase.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - User Selection & Actions */}
            <div className="space-y-6">
              {/* Quick Test */}
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>⚡</span>
                  {language === "th" ? "ทดสอบด่วน" : "Quick Test"}
                </h3>
                <p className="text-sm text-purple-100 mb-4">
                  {language === "th"
                    ? "ส่งการแจ้งเตือนทดสอบให้ตัวเอง"
                    : "Send test notification to yourself"}
                </p>
                <Button
                  onClick={handleSendToSelf}
                  disabled={isLoading}
                  className="w-full bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      {language === "th" ? "กำลังส่ง..." : "Sending..."}
                    </div>
                  ) : (
                    <>🚀 {language === "th" ? "ส่งให้ตัวเอง" : "Test Now"}</>
                  )}
                </Button>
              </div>

              {/* User Selection */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👥</span>
                  {language === "th" ? "เลือกผู้ใช้" : "Select User"}
                </h3>

                {/* Filters */}
                <div className="space-y-3 mb-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      {language === "th" ? "ค้นหา" : "Search"}
                    </Label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        language === "th" ? "ชื่อผู้ใช้..." : "Username..."
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#334293] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      {language === "th" ? "กรองตามบทบาท" : "Filter by Role"}
                    </Label>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#334293] focus:border-transparent"
                    >
                      <option value="all">
                        {language === "th" ? "ทั้งหมด" : "All"}
                      </option>
                      <option value="teacher">
                        {language === "th" ? "ครู" : "Teacher"}
                      </option>
                      <option value="student">
                        {language === "th" ? "นักเรียน" : "Student"}
                      </option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </div>

                {/* User List */}
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {loadingUsers ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#334293] mx-auto mb-2"></div>
                      <p className="text-sm">
                        {language === "th" ? "กำลังโหลด..." : "Loading..."}
                      </p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">
                        {language === "th" ? "ไม่พบผู้ใช้" : "No users found"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredUsers.map((u) => {
                        // Display name logic
                        const displayName = u.student
                          ? `${u.student.first_name} ${u.student.last_name}`
                          : u.username;

                        const nickname = u.student?.nickname;

                        return (
                          <label
                            key={u.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedUserId === u.id ? "bg-blue-50" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="user"
                              value={u.id}
                              checked={selectedUserId === u.id}
                              onChange={() => setSelectedUserId(u.id)}
                              className="text-[#334293] focus:ring-[#334293]"
                              aria-label={`Select user ${displayName}`}
                            />

                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0 overflow-hidden">
                              {u.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={`${
                                    process.env.NEXT_PUBLIC_API_URL ||
                                    "http://localhost:3000"
                                  }/${u.avatar}`}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement!.textContent =
                                      displayName.charAt(0).toUpperCase();
                                  }}
                                />
                              ) : (
                                displayName.charAt(0).toUpperCase()
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {displayName}
                                {nickname && (
                                  <span className="text-gray-500 font-normal ml-1">
                                    ({nickname})
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                                <span className="truncate">{u.username}</span>
                                <span>•</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full ${
                                    u.role === "admin" || u.role === "owner"
                                      ? "bg-purple-100 text-purple-700"
                                      : u.role === "teacher"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {u.role}
                                </span>
                                {u.email && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{u.email}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendTest}
                disabled={!selectedUserId || isLoading}
                className="w-full bg-[#334293] hover:bg-[#2a3677] text-white font-semibold py-3 text-base"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {language === "th" ? "กำลังส่ง..." : "Sending..."}
                  </div>
                ) : (
                  <>
                    📤{" "}
                    {language === "th"
                      ? "ส่งการแจ้งเตือนทดสอบ"
                      : "Send Test Notification"}
                  </>
                )}
              </Button>

              {/* Info Box */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <span className="text-yellow-600 text-lg flex-shrink-0">
                    💡
                  </span>
                  <div className="text-xs text-yellow-800">
                    <p className="font-semibold mb-1">
                      {language === "th" ? "หมายเหตุ:" : "Note:"}
                    </p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        {language === "th"
                          ? "ผู้รับต้องเชื่อมต่อ WebSocket"
                          : "Recipient must be connected to WebSocket"}
                      </li>
                      <li>
                        {language === "th"
                          ? "เคส 6 จะไม่แสดง popup"
                          : "Case 6 won't show popup"}
                      </li>
                      <li>
                        {language === "th"
                          ? "เคส 11 ต้องมีเสียง custom"
                          : "Case 11 requires custom sound"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TestNotificationsPage;
