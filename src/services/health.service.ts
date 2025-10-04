import type { HealthResponse } from "../types/settings.types";
import { api } from "./api/base";

class HealthService {
  /**
   * Get comprehensive system health information
   */
  async getHealthInfo(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>("/health");
    return response.data;
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Format uptime to human readable format
   */
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
  }

  /**
   * Get status color based on health status
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "ok":
      case "up":
        return "text-green-600";
      case "down":
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  }

  /**
   * Get status background color
   */
  getStatusBgColor(status: string): string {
    switch (status.toLowerCase()) {
      case "ok":
      case "up":
        return "bg-green-100";
      case "down":
      case "error":
        return "bg-red-100";
      case "warning":
        return "bg-yellow-100";
      default:
        return "bg-gray-100";
    }
  }
}

export const healthService = new HealthService();
export default healthService;
