import type {
  UpdateUserSettingsInput,
  UserSettings,
  UserSettingsResponse,
} from "../types/settings.types";
import { api } from "./api/base";

class SettingsService {
  /**
   * Get current user's settings
   */
  async getUserSettings(): Promise<UserSettings> {
    const response = await api.get<UserSettingsResponse>("/settings/me");
    return response.data.settings;
  }

  /**
   * Update current user's settings
   */
  async updateUserSettings(
    input: UpdateUserSettingsInput
  ): Promise<UserSettings> {
    const response = await api.put<UserSettingsResponse>(
      "/settings/me",
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
}

export const settingsService = new SettingsService();
export default settingsService;
