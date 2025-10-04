/**
 * Example usage of the CustomSoundUpload component in a settings page
 */

"use client";

import CustomSoundUpload from "@/components/settings/CustomSoundUpload";
import { settingsService } from "@/services/settings.service";
import { UserSettings } from "@/types/settings.types";
import { useEffect, useState } from "react";

export default function SettingsExample() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const userSettings = await settingsService.getUserSettings();
        setSettings(userSettings);
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle settings updates from the CustomSoundUpload component
  const handleSettingsUpdate = (updatedSettings: UserSettings) => {
    setSettings(updatedSettings);
    // Optionally show a success message
    console.log("Settings updated successfully:", updatedSettings);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Settings
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account preferences and notification settings.
        </p>
      </div>

      {/* Other settings sections would go here */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          General Settings
        </h2>

        {/* Language Setting */}
        <div className="mb-6">
          <label
            htmlFor="language-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Language
          </label>
          <select
            id="language-select"
            value={settings.language}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onChange={(e) => {
              // Handle language change
              console.log("Language changed to:", e.target.value);
            }}
          >
            <option value="auto">Auto-detect</option>
            <option value="en">English</option>
            <option value="th">ไทย</option>
          </select>
        </div>

        {/* Notification Sound Setting */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enable_notification_sound}
              className="mr-2"
              onChange={(e) => {
                // Handle notification sound enable/disable
                console.log("Notification sound enabled:", e.target.checked);
              }}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable notification sounds
            </span>
          </label>
        </div>
      </div>

      {/* Custom Sound Upload Section */}
      <CustomSoundUpload
        currentSettings={settings}
        onSettingsUpdate={handleSettingsUpdate}
      />

      {/* Additional settings sections would go here */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h2>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enable_email_notifications}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email notifications
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enable_phone_notifications}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone notifications
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.enable_in_app_notifications}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              In-app notifications
            </span>
          </label>
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Debug: Current Settings
          </h3>
          <pre className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
