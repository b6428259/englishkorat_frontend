export interface UserSettings {
  id: number;
  user_id: number;
  language: "th" | "en" | "auto";
  enable_notification_sound: boolean;
  notification_sound: string;
  enable_email_notifications: boolean;
  enable_phone_notifications: boolean;
  enable_in_app_notifications: boolean;
  additional_preferences?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserSettingsInput {
  language?: "th" | "en" | "auto";
  enable_notification_sound?: boolean;
  notification_sound?: string;
  enable_email_notifications?: boolean;
  enable_phone_notifications?: boolean;
  enable_in_app_notifications?: boolean;
  additional_preferences?: Record<string, unknown> | null;
}

export interface UserSettingsResponse {
  message: string;
  settings: UserSettings;
}

export const NOTIFICATION_SOUNDS = {
  default: { label: "🔔 Default", file: "/sounds/default.mp3" },
  chime: { label: "🎵 Chime", file: "/sounds/chime.mp3" },
  bell: { label: "🔔 Bell", file: "/sounds/bell.mp3" },
  ding: { label: "✨ Ding", file: "/sounds/ding.mp3" },
  pop: { label: "💫 Pop", file: "/sounds/pop.mp3" },
} as const;

export type NotificationSoundType = keyof typeof NOTIFICATION_SOUNDS;

// Comprehensive health monitoring types
export interface DatabaseDetails {
  idle: number;
  in_use: number;
  max_open_connections: number;
  open_connections: number;
  wait_count: number;
  wait_duration_ms: number;
}

export interface RedisDetails {
  address: string;
  mode: string;
}

export interface Dependency {
  name: string;
  status: "up" | "down";
  latency_ms: number;
  details: DatabaseDetails | RedisDetails;
}

export interface MemoryMetrics {
  alloc_bytes: number;
  total_alloc_bytes: number;
  sys_bytes: number;
  heap_alloc_bytes: number;
  heap_objects: number;
  last_gc_unix: number;
  pause_total_ns: number;
}

export interface DatabaseMetrics {
  open_connections: number;
  in_use: number;
  idle: number;
  wait_count: number;
  wait_duration_ms: number;
  max_open_connections: number;
}

export interface SystemMetrics {
  goroutines: number;
  memory: MemoryMetrics;
  database: DatabaseMetrics;
}

export interface SystemFlags {
  skip_migrate: boolean;
  prune_columns: boolean;
  use_redis_notifications: boolean;
}

export interface SystemInfo {
  go_version: string;
  go_os: string;
  go_arch: string;
}

export interface HealthResponse {
  status: "ok" | "error";
  service: string;
  version: string;
  environment: string;
  time: string;
  uptime_seconds: number;
  uptime_human: string;
  dependencies: Dependency[];
  metrics: SystemMetrics;
  flags: SystemFlags;
  system: SystemInfo;
}
