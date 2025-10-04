"use client";

import { settingsService } from "@/services/settings.service";
import { UserSettings } from "@/types/settings.types";
import React, { useRef, useState } from "react";

interface CustomSoundUploadProps {
  currentSettings: UserSettings;
  onSettingsUpdate: (settings: UserSettings) => void;
}

export default function CustomSoundUpload({
  currentSettings,
  onSettingsUpdate,
}: CustomSoundUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      // Create preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      setPreviewAudio(previewUrl);

      // Upload the file
      const updatedSettings = await settingsService.uploadCustomSound(file);
      onSettingsUpdate(updatedSettings);

      // Clean up preview URL after successful upload
      URL.revokeObjectURL(previewUrl);
      setPreviewAudio(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading custom sound:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload custom sound. Please try again."
      );

      // Clean up preview URL on error
      if (previewAudio) {
        URL.revokeObjectURL(previewAudio);
        setPreviewAudio(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustomSound = async () => {
    if (!currentSettings.custom_sound) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const updatedSettings = await settingsService.deleteCustomSound();
      onSettingsUpdate(updatedSettings);
    } catch (error) {
      console.error("Error deleting custom sound:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to delete custom sound. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const playPreview = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(console.error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🎶 Custom Notification Sound
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload your own notification sound. Supported formats: MP3, WAV, OGG
          (Max: 5MB)
        </p>
      </div>

      {/* Current Custom Sound Display */}
      {currentSettings.custom_sound && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400">🎵</span>
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Custom Sound Active
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your personal notification sound is set
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => playPreview(currentSettings.custom_sound!)}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                disabled={isUploading}
              >
                🔊 Preview
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomSound}
                className="px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                disabled={isUploading}
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center transition-colors ${
          isUploading
            ? "opacity-50 pointer-events-none"
            : "hover:border-blue-400 dark:hover:border-blue-500"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="mb-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            {isUploading ? (
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            ) : (
              <span className="text-2xl">🎵</span>
            )}
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isUploading ? "Uploading..." : "Upload Custom Sound"}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose an audio file to use as your notification sound
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {isUploading ? "Uploading..." : "Choose File"}
        </button>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>Supported formats: MP3, WAV, OGG</p>
          <p>Maximum file size: 5MB</p>
        </div>
      </div>

      {/* Preview Audio */}
      {previewAudio && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600 dark:text-yellow-400">🎧</span>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Preview your sound before upload
              </span>
            </div>
            <button
              type="button"
              onClick={() => playPreview(previewAudio)}
              className="px-3 py-1 text-sm bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
            >
              🔊 Play
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-2">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Upload Error
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {uploadError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element for preview */}
      <audio ref={audioRef} className="hidden">
        <track kind="captions" />
      </audio>
    </div>
  );
}
