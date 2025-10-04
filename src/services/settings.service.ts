import type {
  UpdateUserSettingsInput,
  UserSettings,
  UserSettingsResponse,
} from "../types/settings.types";
import { api } from "./api/base";
import { API_ENDPOINTS } from "./api/endpoints";

class SettingsService {
  /**
   * Get current user's settings
   */
  async getUserSettings(): Promise<UserSettings> {
    const response = await api.get<UserSettingsResponse>(
      API_ENDPOINTS.SETTINGS.ME
    );
    return response.data.settings;
  }

  /**
   * Update current user's settings
   */
  async updateUserSettings(
    input: UpdateUserSettingsInput
  ): Promise<UserSettings> {
    const response = await api.put<UserSettingsResponse>(
      API_ENDPOINTS.SETTINGS.ME,
      input
    );
    return response.data.settings;
  }

  /**
   * Get settings for a specific user (admin only)
   */
  async getUserSettingsById(userId: number): Promise<UserSettings> {
    const response = await api.get<UserSettingsResponse>(
      `/users/${userId}/settings`
    );
    return response.data.settings;
  }

  /**
   * Update settings for a specific user (admin only)
   */
  async updateUserSettingsById(
    userId: number,
    input: UpdateUserSettingsInput
  ): Promise<UserSettings> {
    const response = await api.put<UserSettingsResponse>(
      `/users/${userId}/settings`,
      input
    );
    return response.data.settings;
  }

  /**
   * Upload or replace the user's custom notification sound
   * @param soundFile - Audio file to upload (mp3, wav, ogg formats)
   * @returns Updated user settings with new custom sound
   */
  async uploadCustomSound(soundFile: File): Promise<UserSettings> {
    // Validate file type
    const allowedTypes = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg"];
    if (!allowedTypes.includes(soundFile.type)) {
      throw new Error(
        "Invalid file type. Only MP3, WAV, and OGG files are allowed."
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (soundFile.size > maxSize) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("sound", soundFile);

    // Make the API call with multipart/form-data
    const response = await api.post<UserSettingsResponse>(
      API_ENDPOINTS.SETTINGS.CUSTOM_SOUND,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.settings;
  }

  /**
   * Delete the user's custom notification sound
   * @returns Updated user settings without custom sound
   */
  async deleteCustomSound(): Promise<UserSettings> {
    const response = await api.delete<UserSettingsResponse>(
      API_ENDPOINTS.SETTINGS.CUSTOM_SOUND
    );
    return response.data.settings;
  }
}

export const settingsService = new SettingsService();
export default settingsService;
