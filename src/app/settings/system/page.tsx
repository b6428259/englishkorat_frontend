"use client";

import SidebarLayout from "@/components/common/SidebarLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { healthService } from "@/services/health.service";
import { settingsService } from "@/services/settings.service";
import { userService } from "@/services/user.service";
import type {
  UpdateUserSettingsInput,
  UserSettings,
} from "@/types/settings.types";
import { NOTIFICATION_SOUNDS } from "@/types/settings.types";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const SystemSettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);

  // Batch update states
  const [pendingUpdates, setPendingUpdates] = useState<UpdateUserSettingsInput>(
    {}
  );
  const [hasChanges, setHasChanges] = useState(false);

  // System info states
  const [systemInfo, setSystemInfo] = useState<{
    service: string;
    status: string;
    version: string;
  } | null>(null);
  const [isLoadingSystemInfo, setIsLoadingSystemInfo] = useState(true);

  // Sound testing
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Custom sound upload states
  const [isUploadingSound, setIsUploadingSound] = useState(false);

  // Button text variables to avoid nested ternary
  const saveButtonText = language === "th" ? "บันทึก" : "Save";
  const savingButtonText = language === "th" ? "กำลังบันทึก..." : "Saving...";

  // Load user settings and system info
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings and system info in parallel
        const [userSettings, healthData] = await Promise.all([
          settingsService.getUserSettings(),
          healthService.getHealthInfo().catch(() => ({
            service: "Unknown",
            status: "error",
            version: "Unknown",
          })),
        ]);

        setSettings(userSettings);
        setSystemInfo(healthData);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("ไม่สามารถโหลดการตั้งค่าได้");
      } finally {
        setIsLoading(false);
        setIsLoadingSystemInfo(false);
      }
    };

    loadData();
  }, []);

  const updateSettings = useCallback(
    async (updates: UpdateUserSettingsInput) => {
      if (!settings) return;

      setIsSaving(true);
      try {
        const updatedSettings = await settingsService.updateUserSettings(
          updates
        );
        setSettings(updatedSettings);

        // Update localStorage for notification sound setting
        if ("enable_notification_sound" in updates) {
          localStorage.setItem(
            "notificationSoundEnabled",
            updates.enable_notification_sound ? "true" : "false"
          );
        }

        toast.success("บันทึกการตั้งค่าเรียบร้อย");
      } catch (error: unknown) {
        console.error("Failed to update settings:", error);
        const message =
          error instanceof Error
            ? error.message
            : "ไม่สามารถบันทึกการตั้งค่าได้";
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [settings]
  );

  // Batch update functions
  const addToPendingUpdates = (updates: UpdateUserSettingsInput) => {
    setPendingUpdates((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const applyAllChanges = async () => {
    if (!Object.keys(pendingUpdates).length) return;

    await updateSettings(pendingUpdates);
    setPendingUpdates({});
    setHasChanges(false);
  };

  // Sound testing function
  const playNotificationSound = async (soundKey: string) => {
    if (isPlayingSound) return;

    setIsPlayingSound(true);
    try {
      const soundData =
        NOTIFICATION_SOUNDS[soundKey as keyof typeof NOTIFICATION_SOUNDS];
      if (
        soundData &&
        typeof soundData === "object" &&
        "file" in soundData &&
        soundData.file
      ) {
        const audio = new Audio(soundData.file);
        await audio.play();
      }
    } catch (error) {
      console.error("Failed to play sound:", error);
      toast.error("ไม่สามารถเล่นเสียงได้");
    } finally {
      setTimeout(() => setIsPlayingSound(false), 1000);
    }
  };

  const handleLanguageChange = (newLanguage: "th" | "en" | "auto") => {
    // Update context first for immediate UI change
    if (newLanguage !== "auto") {
      setLanguage(newLanguage);
    }
    // Then update server settings
    updateSettings({ language: newLanguage });
  };

  const handleEmailUpdate = async () => {
    if (!emailInput.trim()) {
      toast.error("กรุณากรอกอีเมล");
      return;
    }

    setIsUpdatingContact(true);
    try {
      await userService.updateProfile({ email: emailInput.trim() });
      toast.success("อัปเดตอีเมลเรียบร้อย");
      setShowEmailDialog(false);
      setEmailInput("");
    } catch (error: unknown) {
      console.error("Failed to update email:", error);
      const message =
        error instanceof Error ? error.message : "ไม่สามารถอัปเดตอีเมลได้";
      toast.error(message);
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const handlePhoneUpdate = async () => {
    if (!phoneInput.trim()) {
      toast.error("กรุณากรอกหมายเลขโทรศัพท์");
      return;
    }

    setIsUpdatingContact(true);
    try {
      await userService.updateProfile({ phone: phoneInput.trim() });
      toast.success("อัปเดตหมายเลขโทรศัพท์เรียบร้อย");
      setShowPhoneDialog(false);
      setPhoneInput("");
    } catch (error: unknown) {
      console.error("Failed to update phone:", error);
      const message =
        error instanceof Error
          ? error.message
          : "ไม่สามารถอัปเดตหมายเลขโทรศัพท์ได้";
      toast.error(message);
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const handleNotificationToggle = (
    type: "email" | "phone",
    enabled: boolean
  ) => {
    if (enabled) {
      // Check if user has the required contact info
      if (type === "email" && !user?.email) {
        setShowEmailDialog(true);
        return;
      }
      if (type === "phone" && !user?.phone) {
        setShowPhoneDialog(true);
        return;
      }
    }

    // Update the setting
    const key =
      type === "email"
        ? "enable_email_notifications"
        : "enable_phone_notifications";
    updateSettings({ [key]: enabled });
  };

  // Handle custom sound upload
  const handleCustomSoundUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["audio/mp3", "audio/mpeg", "audio/wav"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        language === "th"
          ? "รองรับเฉพาะไฟล์ MP3 และ WAV เท่านั้น"
          : "Only MP3 and WAV files are supported"
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(
        language === "th"
          ? "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)"
          : "File size too large (max 5MB)"
      );
      return;
    }

    setIsUploadingSound(true);

    try {
      const updatedSettings = await settingsService.uploadCustomSound(file);
      setSettings(updatedSettings);

      // Auto-select custom sound after upload
      setPendingUpdates((prev) => ({
        ...prev,
        notification_sound: "custom",
      }));
      setHasChanges(true);

      toast.success(
        language === "th"
          ? "อัปโหลดเสียงแจ้งเตือนเรียบร้อยแล้ว"
          : "Custom sound uploaded successfully"
      );
    } catch (error: unknown) {
      console.error("Failed to upload custom sound:", error);
      const message =
        error instanceof Error
          ? error.message
          : language === "th"
          ? "ไม่สามารถอัปโหลดไฟล์เสียงได้"
          : "Failed to upload sound file";
      toast.error(message);
    } finally {
      setIsUploadingSound(false);
      // Reset file input
      event.target.value = "";
    }
  };

  // Handle custom sound deletion
  const handleDeleteCustomSound = async () => {
    if (!settings?.custom_sound_url) return;

    try {
      const updatedSettings = await settingsService.deleteCustomSound();
      setSettings(updatedSettings);

      // Switch to default sound if custom was selected
      if (settings.notification_sound === "custom") {
        setPendingUpdates((prev) => ({
          ...prev,
          notification_sound: "default",
        }));
        setHasChanges(true);
      }

      toast.success(
        language === "th"
          ? "ลบเสียงแจ้งเตือนเรียบร้อยแล้ว"
          : "Custom sound deleted successfully"
      );
    } catch (error: unknown) {
      console.error("Failed to delete custom sound:", error);
      const message =
        error instanceof Error
          ? error.message
          : language === "th"
          ? "ไม่สามารถลบไฟล์เสียงได้"
          : "Failed to delete sound file";
      toast.error(message);
    }
  };

  // Play custom sound
  const playCustomSound = async () => {
    if (!settings?.custom_sound_url) return;

    setIsPlayingSound(true);
    try {
      const audio = new Audio(settings.custom_sound_url);
      await audio.play();
    } catch (error) {
      console.error("Failed to play custom sound:", error);
      toast.error(
        language === "th" ? "ไม่สามารถเล่นเสียงได้" : "Failed to play sound"
      );
    } finally {
      setTimeout(() => setIsPlayingSound(false), 1000);
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#334293]"></div>
        </div>
      </SidebarLayout>
    );
  }

  if (!settings) {
    return (
      <SidebarLayout>
        <div className="text-center p-8">
          <p className="text-red-600">ไม่สามารถโหลดการตั้งค่าได้</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <>
      <SidebarLayout
        breadcrumbItems={[
          { label: t.settings },
          { label: t.systemSettings || "การตั้งค่าระบบ" },
        ]}
      >
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {language === "th" ? "การตั้งค่าระบบ" : "System Settings"}
          </h1>

          <div className="space-y-8">
            {/* Language Settings */}
            <section className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {language === "th" ? "ภาษา" : "Language"}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleLanguageChange("th")}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    settings.language === "th"
                      ? "bg-[#334293] text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  } disabled:opacity-50`}
                >
                  <span className="text-xl">🇹🇭</span> ไทย
                </button>
                <button
                  onClick={() => handleLanguageChange("en")}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    settings.language === "en"
                      ? "bg-[#334293] text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  } disabled:opacity-50`}
                >
                  <span className="text-xl">🇬🇧</span> English
                </button>
                <button
                  onClick={() => handleLanguageChange("auto")}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    settings.language === "auto"
                      ? "bg-[#334293] text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  } disabled:opacity-50`}
                >
                  🌐 {language === "th" ? "อัตโนมัติ" : "Auto"}
                </button>
              </div>
            </section>

            {/* Notification Settings */}
            <section className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {language === "th" ? "การแจ้งเตือน" : "Notifications"}
              </h2>

              <div className="space-y-4">
                {/* In-app notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {language === "th"
                        ? "การแจ้งเตือนในแอป"
                        : "In-app Notifications"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === "th"
                        ? "แสดงการแจ้งเตือนในแอปพลิเคชัน"
                        : "Show notifications within the application"}
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_in_app_notifications}
                    onCheckedChange={(checked: boolean) =>
                      addToPendingUpdates({
                        enable_in_app_notifications: checked,
                      })
                    }
                    disabled={isSaving}
                  />
                </div>

                {/* Notification sound */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {language === "th"
                        ? "เสียงแจ้งเตือน"
                        : "Notification Sound"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === "th"
                        ? "เล่นเสียงเมื่อมีการแจ้งเตือน"
                        : "Play sound when notifications arrive"}
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_notification_sound}
                    onCheckedChange={(checked: boolean) =>
                      addToPendingUpdates({
                        enable_notification_sound: checked,
                      })
                    }
                    disabled={isSaving}
                  />
                </div>

                {/* Enhanced Sound selection */}
                {settings.enable_notification_sound && (
                  <div className="ml-4 pt-3 border-l-2 border-blue-100 pl-4">
                    <Label className="text-sm font-semibold text-gray-800 mb-3 block">
                      {language === "th"
                        ? "🎵 เลือกเสียงแจ้งเตือน"
                        : "🎵 Sound Selection"}
                    </Label>

                    {/* Current Sound Info */}
                    {settings.notification_sound && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-blue-700 font-medium">
                            {language === "th"
                              ? "เสียงปัจจุบัน:"
                              : "Current Sound:"}
                          </span>
                          <span className="text-blue-900">
                            {settings.notification_sound === "custom" &&
                            settings.custom_sound_filename
                              ? `🎶 ${settings.custom_sound_filename}`
                              : NOTIFICATION_SOUNDS[
                                  settings.notification_sound as keyof typeof NOTIFICATION_SOUNDS
                                ]?.label || settings.notification_sound}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(NOTIFICATION_SOUNDS).map(
                        ([key, soundData]) => {
                          const isSelected =
                            settings.notification_sound === key;
                          const soundInfo =
                            typeof soundData === "object"
                              ? soundData
                              : { label: String(soundData), file: "" };
                          const isCustom = key === "custom";
                          const hasCustomSound = Boolean(
                            settings.custom_sound_url
                          );
                          const canSelectCustom = isCustom
                            ? hasCustomSound
                            : true;

                          // Special handling for custom sound
                          if (isCustom && !hasCustomSound) {
                            return (
                              <div key={key} className="space-y-2">
                                {/* Upload button for custom sound */}
                                <div className="relative p-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center">
                                  <input
                                    type="file"
                                    accept="audio/mp3,audio/mpeg,audio/wav"
                                    onChange={handleCustomSoundUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isUploadingSound}
                                  />
                                  <div className="pointer-events-none">
                                    {isUploadingSound ? (
                                      <div className="space-y-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#334293] mx-auto"></div>
                                        <p className="text-xs text-gray-600">
                                          {language === "th"
                                            ? "กำลังอัปโหลด..."
                                            : "Uploading..."}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <div className="text-2xl">📁</div>
                                        <p className="text-sm font-medium text-gray-700">
                                          {language === "th"
                                            ? "อัปโหลดเสียงแจ้งเตือน"
                                            : "Upload Custom Sound"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {language === "th"
                                            ? "รองรับ MP3, WAV (สูงสุด 5MB)"
                                            : "Supports MP3, WAV (max 5MB)"}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={key}
                              type="button"
                              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md w-full text-left ${
                                isSelected
                                  ? "border-[#334293] bg-blue-50 shadow-sm"
                                  : canSelectCustom
                                  ? "border-gray-200 bg-white hover:border-gray-300"
                                  : "border-gray-200 bg-gray-50 cursor-not-allowed"
                              } ${!canSelectCustom ? "opacity-50" : ""}`}
                              onClick={() => {
                                if (canSelectCustom) {
                                  addToPendingUpdates({
                                    notification_sound: key,
                                  });
                                }
                              }}
                              disabled={!canSelectCustom}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 ${
                                      isSelected
                                        ? "border-[#334293] bg-[#334293]"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {isSelected && (
                                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <span
                                      className={`text-sm font-medium ${
                                        isSelected
                                          ? "text-[#334293]"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {isCustom &&
                                      hasCustomSound &&
                                      settings.custom_sound_filename
                                        ? `🎶 ${settings.custom_sound_filename}`
                                        : soundInfo.label}
                                    </span>
                                    {isCustom && hasCustomSound && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {language === "th"
                                          ? "ไฟล์ที่อัปโหลด"
                                          : "Uploaded file"}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {/* Play button */}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-[#334293] hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isCustom && hasCustomSound) {
                                        playCustomSound();
                                      } else {
                                        playNotificationSound(key);
                                      }
                                    }}
                                    disabled={
                                      isPlayingSound || !canSelectCustom
                                    }
                                  >
                                    {isPlayingSound ? "⏸️" : "▶️"}
                                  </Button>

                                  {/* Delete button for custom sound */}
                                  {isCustom && hasCustomSound && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (
                                          confirm(
                                            language === "th"
                                              ? "คุณต้องการลบเสียงแจ้งเตือนนี้หรือไม่?"
                                              : "Are you sure you want to delete this custom sound?"
                                          )
                                        ) {
                                          handleDeleteCustomSound();
                                        }
                                      }}
                                    >
                                      🗑️
                                    </Button>
                                  )}

                                  {/* Re-upload button for custom sound */}
                                  {isCustom && hasCustomSound && (
                                    <div className="relative">
                                      <input
                                        type="file"
                                        accept="audio/mp3,audio/mpeg,audio/wav"
                                        onChange={handleCustomSoundUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploadingSound}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                        disabled={isUploadingSound}
                                      >
                                        📁
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* Email notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {language === "th"
                        ? "การแจ้งเตือนทางอีเมล"
                        : "Email Notifications"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === "th"
                        ? "ส่งการแจ้งเตือนไปยังอีเมล"
                        : "Send notifications to your email"}
                      {user?.email && (
                        <span className="block text-xs text-blue-600 mt-1">
                          {user.email}
                        </span>
                      )}
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_email_notifications}
                    onCheckedChange={(checked: boolean) =>
                      handleNotificationToggle("email", checked)
                    }
                    disabled={isSaving}
                  />
                </div>

                {/* Phone notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {language === "th"
                        ? "การแจ้งเตือนทาง SMS"
                        : "SMS Notifications"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === "th"
                        ? "ส่งการแจ้งเตือนไปยังโทรศัพท์"
                        : "Send notifications to your phone"}
                      {user?.phone && (
                        <span className="block text-xs text-blue-600 mt-1">
                          {user.phone}
                        </span>
                      )}
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_phone_notifications}
                    onCheckedChange={(checked: boolean) =>
                      handleNotificationToggle("phone", checked)
                    }
                    disabled={isSaving}
                  />
                </div>
              </div>
            </section>

            {/* Apply Changes Section */}
            {hasChanges && (
              <section className="sticky bottom-4 z-10">
                <div className="bg-white border-2 border-[#334293] rounded-lg p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === "th"
                            ? "มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก"
                            : "You have unsaved changes"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === "th"
                            ? "กด Apply เพื่อบันทึกการตั้งค่า"
                            : "Click Apply to save your settings"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPendingUpdates({});
                          setHasChanges(false);
                          window.location.reload();
                        }}
                        disabled={isSaving}
                      >
                        {language === "th" ? "ยกเลิก" : "Cancel"}
                      </Button>
                      <Button
                        onClick={applyAllChanges}
                        disabled={isSaving}
                        className="bg-[#334293] hover:bg-[#2a3677] text-white px-6"
                      >
                        {isSaving ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {language === "th"
                              ? "กำลังบันทึก..."
                              : "Applying..."}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>✓</span> Apply
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Enhanced System Info */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {language === "th" ? "ข้อมูลระบบ" : "System Information"}
              </h2>
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 space-y-4 border border-gray-200">
                {isLoadingSystemInfo ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#334293]"></div>
                    <span className="ml-2 text-gray-600">
                      {language === "th"
                        ? "กำลังโหลดข้อมูล..."
                        : "Loading system info..."}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">
                        {language === "th" ? "บริการ" : "Service"}:
                      </span>
                      <span className="font-semibold text-[#334293]">
                        {systemInfo?.service || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">
                        {language === "th" ? "เวอร์ชัน" : "Version"}:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {systemInfo?.version || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-700 font-medium">
                        {language === "th" ? "สถานะ" : "Status"}:
                      </span>
                      <span
                        className={`font-semibold px-3 py-1 rounded-full text-sm ${
                          systemInfo?.status === "ok"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {(() => {
                          if (systemInfo?.status === "ok") {
                            return language === "th" ? "🟢 ปกติ" : "🟢 Online";
                          }
                          return language === "th" ? "🔴 ผิดปกติ" : "🔴 Error";
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">
                        {language === "th" ? "ผู้ใช้" : "User"}:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {user?.username}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </SidebarLayout>

      {/* Email Setup Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === "th" ? "เพิ่มอีเมล" : "Add Email Address"}
            </DialogTitle>
            <DialogDescription>
              {language === "th"
                ? "กรุณากรอกอีเมลเพื่อเปิดใช้งานการแจ้งเตือนทางอีเมล"
                : "Please enter your email address to enable email notifications"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">
                {language === "th" ? "อีเมล" : "Email"}
              </Label>
              <Input
                id="email"
                type="email"
                value={emailInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmailInput(e.target.value)
                }
                placeholder={
                  language === "th" ? "กรอกอีเมล" : "Enter email address"
                }
                disabled={isUpdatingContact}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              disabled={isUpdatingContact}
            >
              {language === "th" ? "ยกเลิก" : "Cancel"}
            </Button>
            <Button
              onClick={handleEmailUpdate}
              disabled={isUpdatingContact || !emailInput.trim()}
            >
              {isUpdatingContact ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {savingButtonText}
                </div>
              ) : (
                saveButtonText
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phone Setup Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === "th" ? "เพิ่มหมายเลขโทรศัพท์" : "Add Phone Number"}
            </DialogTitle>
            <DialogDescription>
              {language === "th"
                ? "กรุณากรอกหมายเลขโทรศัพท์เพื่อเปิดใช้งานการแจ้งเตือนทาง SMS"
                : "Please enter your phone number to enable SMS notifications"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">
                {language === "th" ? "หมายเลขโทรศัพท์" : "Phone Number"}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phoneInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPhoneInput(e.target.value)
                }
                placeholder={
                  language === "th"
                    ? "กรอกหมายเลขโทรศัพท์"
                    : "Enter phone number"
                }
                disabled={isUpdatingContact}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPhoneDialog(false)}
              disabled={isUpdatingContact}
            >
              {language === "th" ? "ยกเลิก" : "Cancel"}
            </Button>
            <Button
              onClick={handlePhoneUpdate}
              disabled={isUpdatingContact || !phoneInput.trim()}
            >
              {isUpdatingContact ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {savingButtonText}
                </div>
              ) : (
                saveButtonText
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SystemSettingsPage;
