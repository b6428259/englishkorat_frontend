"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SidebarLayout from "@/components/common/SidebarLayout";
import LoadingState from "@/components/dashboard/LoadingState";
import PageHeader from "@/components/dashboard/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Info,
  Save,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MakeupQuotaSettingsPage() {
  const { language } = useLanguage();
  const { hasRole } = useAuth();
  const router = useRouter();

  const [currentQuota, setCurrentQuota] = useState<number>(2);
  const [newQuota, setNewQuota] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const translations = {
    th: {
      title: "ตั้งค่า Makeup Quota",
      subtitle: "กำหนดจำนวนสิทธิ์ Makeup ที่ Schedule จะได้รับโดยอัตโนมัติ",
      unauthorized: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      loading: "กำลังโหลดข้อมูล...",
      currentQuota: "Quota ปัจจุบัน",
      newQuota: "Quota ใหม่",
      classes: "คาบเรียน",
      perSchedule: "ต่อ 1 Schedule",
      save: "บันทึกการเปลี่ยนแปลง",
      saving: "กำลังบันทึก...",
      cancel: "ยกเลิก",
      saveSuccess: "บันทึกการตั้งค่าสำเร็จ!",
      saveFailed: "ไม่สามารถบันทึกการตั้งค่าได้",
      loadFailed: "ไม่สามารถโหลดข้อมูลได้",
      noChanges: "ไม่มีการเปลี่ยนแปลง",
      confirmChange: "ยืนยันการเปลี่ยนแปลง?",
      confirmMessage:
        "การเปลี่ยนแปลงนี้จะมีผลกับ Schedule ใหม่ทั้งหมดที่สร้างหลังจากนี้",
      whatIsQuota: "Makeup Quota คืออะไร?",
      quotaExplanation:
        "Makeup Quota คือจำนวนสิทธิ์ที่ Schedule หนึ่งๆ สามารถสร้าง Makeup Class ได้ เมื่อมีคาบเรียนถูกยกเลิก",
      howItWorks: "ทำงานอย่างไร?",
      workExplanation: `• เมื่อสร้าง Schedule ใหม่ จะได้รับ Quota ตามที่ตั้งค่าไว้\n• เมื่อสร้าง Makeup Class สำเร็จ Quota จะลดลง 1\n• เมื่อ Quota = 0 ไม่สามารถสร้าง Makeup ได้อีก\n• Admin สามารถเพิ่ม/ลดสิทธิ์ของแต่ละ Schedule ได้ภายหลัง`,
      recommendedValue: "ค่าที่แนะนำ",
      recommended:
        "แนะนำให้ตั้งค่าระหว่าง 2-5 คาบต่อ Schedule เพื่อความยืดหยุ่นที่เหมาะสม",
      impactNote: "⚠️ การเปลี่ยนแปลงจะมีผลกับ Schedule ใหม่เท่านั้น",
      impactDetail:
        "Schedule ที่สร้างไว้แล้วจะยังคงใช้ Quota เดิม หากต้องการปรับ Quota ของ Schedule เก่า ให้ไปแก้ไขที่หน้า Session Detail",
      statistics: "สถิติการใช้งาน",
      totalSchedules: "Schedule ทั้งหมด",
      avgQuotaUsed: "ค่าเฉลี่ยการใช้ Quota",
      schedulesWithNoQuota: "Schedule ที่ Quota หมด",
    },
    en: {
      title: "Makeup Quota Settings",
      subtitle:
        "Set the default number of makeup classes each schedule will receive",
      unauthorized: "You don't have permission to access this page",
      loading: "Loading data...",
      currentQuota: "Current Quota",
      newQuota: "New Quota",
      classes: "classes",
      perSchedule: "per Schedule",
      save: "Save Changes",
      saving: "Saving...",
      cancel: "Cancel",
      saveSuccess: "Settings saved successfully!",
      saveFailed: "Failed to save settings",
      loadFailed: "Failed to load data",
      noChanges: "No changes made",
      confirmChange: "Confirm changes?",
      confirmMessage:
        "This change will affect all new schedules created after this point",
      whatIsQuota: "What is Makeup Quota?",
      quotaExplanation:
        "Makeup Quota is the number of times a schedule can create makeup classes when sessions are cancelled",
      howItWorks: "How does it work?",
      workExplanation: `• New schedules receive quota based on this setting\n• Creating a makeup class reduces quota by 1\n• When quota = 0, no more makeup classes can be created\n• Admins can adjust individual schedule quotas later`,
      recommendedValue: "Recommended Value",
      recommended:
        "We recommend setting between 2-5 classes per schedule for optimal flexibility",
      impactNote: "⚠️ This change only affects new schedules",
      impactDetail:
        "Existing schedules will keep their current quota. To adjust quota for existing schedules, edit them in Session Detail page",
      statistics: "Usage Statistics",
      totalSchedules: "Total Schedules",
      avgQuotaUsed: "Avg. Quota Used",
      schedulesWithNoQuota: "Schedules with No Quota",
    },
  };

  const t = translations[language];

  // Check authorization
  useEffect(() => {
    if (!hasRole(["admin", "owner"])) {
      toast.error(t.unauthorized, { position: "top-center" });
      router.push("/dashboard");
    }
  }, [hasRole, router, t.unauthorized]);

  // Fetch current settings
  const fetchCurrentSettings = async () => {
    try {
      setIsLoading(true);
      // NOTE: API integration pending - using mock data
      // When ready: const response = await getDefaultMakeupQuota();
      // When ready: setCurrentQuota(response.default_quota);
      // When ready: setNewQuota(response.default_quota);

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentQuota(2);
      setNewQuota(2);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error(t.loadFailed, { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasRole(["admin", "owner"])) {
      fetchCurrentSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(newQuota !== currentQuota);
  }, [newQuota, currentQuota]);

  const handleSave = async () => {
    if (!hasChanges) {
      toast(t.noChanges, { icon: "ℹ️" });
      return;
    }

    if (
      !confirm(
        `${t.confirmChange}\n\n${t.confirmMessage}\n\n${t.currentQuota}: ${currentQuota} → ${t.newQuota}: ${newQuota}`
      )
    ) {
      return;
    }

    try {
      setIsSaving(true);

      // NOTE: API integration pending
      // When ready: await updateDefaultMakeupQuota(newQuota);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCurrentQuota(newQuota);
      setHasChanges(false);
      toast.success(t.saveSuccess, {
        position: "top-center",
        duration: 4000,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(t.saveFailed, { position: "top-center" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewQuota(currentQuota);
    setHasChanges(false);
  };

  if (!hasRole(["admin", "owner"])) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <PageHeader
          icon={Settings}
          title={t.title}
          subtitle={t.subtitle}
          badge={
            currentQuota
              ? {
                  label: t.currentQuota,
                  value: `${currentQuota} ${t.classes}`,
                }
              : undefined
          }
        />

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {isLoading ? (
            <LoadingState message={t.loading} />
          ) : (
            <div className="space-y-6">
              {/* Main Settings Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        {t.newQuota}
                      </h2>
                      <p className="text-xs md:text-sm text-gray-600">
                        {t.perSchedule}
                      </p>
                    </div>
                  </div>

                  {/* Quota Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setNewQuota(value)}
                        className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-200 ${
                          newQuota === value
                            ? "border-indigo-500 bg-indigo-50 shadow-md"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-center">
                          <div
                            className={`text-2xl md:text-3xl font-bold mb-1 ${
                              newQuota === value
                                ? "text-indigo-600"
                                : "text-gray-700"
                            }`}
                          >
                            {value}
                          </div>
                          <div
                            className={`text-xs ${
                              newQuota === value
                                ? "text-indigo-600"
                                : "text-gray-500"
                            }`}
                          >
                            {t.classes}
                          </div>
                        </div>
                        {newQuota === value && (
                          <div className="mt-2 flex justify-center">
                            <CheckCircle className="h-5 w-5 text-indigo-600" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === "th"
                        ? "หรือระบุจำนวนเอง (1-20)"
                        : "Or specify custom value (1-20)"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newQuota}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value);
                        if (value >= 1 && value <= 20) {
                          setNewQuota(value);
                        }
                      }}
                      className="w-full md:w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  {/* Change Indicator */}
                  {hasChanges && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-900">
                            {language === "th"
                              ? "มีการเปลี่ยนแปลง"
                              : "Changes detected"}
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            {currentQuota} {t.classes} → {newQuota} {t.classes}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                      variant="monthViewClicked"
                      className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      {isSaving ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">{t.saving}</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t.save}
                        </>
                      )}
                    </Button>

                    {hasChanges && (
                      <Button
                        onClick={handleCancel}
                        disabled={isSaving}
                        variant="cancel"
                        className="flex-1 sm:flex-none px-6 py-3 text-sm"
                      >
                        {t.cancel}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* What is Quota */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                      {t.whatIsQuota}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {t.quotaExplanation}
                  </p>
                </motion.div>

                {/* How it works */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                      {t.howItWorks}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {t.workExplanation}
                  </p>
                </motion.div>
              </div>

              {/* Recommendation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-md p-6 border border-purple-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-purple-900 mb-2">
                      {t.recommendedValue}
                    </h3>
                    <p className="text-sm text-purple-800 mb-3">
                      {t.recommended}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Impact Note */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-orange-50 rounded-xl shadow-sm p-6 border border-orange-200"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-900 mb-1">
                      {t.impactNote}
                    </p>
                    <p className="text-xs text-orange-700">{t.impactDetail}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
