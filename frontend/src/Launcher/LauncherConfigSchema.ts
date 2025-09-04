// File: src/Launcher/LauncherConfigSchema.ts
// ---------------------------------------------------------------------
// Skema config publik untuk Launcher (sampai Clock).
// Sumber kebenaran tipe diambil dari LauncherHubTypes agar tidak duplikasi.
// ---------------------------------------------------------------------

export { ORBIT_EPS, DEFAULT_MAX_FPS, MIN_FPS } from "./LauncherHubTypes";

// Re-export semua tipe skema agar modul lain impor dari satu tempat ini.
export type {
  // Root & defaults
  LauncherConfigRoot,
  DefaultsConfig,

  // Background
  BgLayer, BgFit,

  // Layer & blok logic
  LayerConfig,
  L2Config,
  L2AConfig,
  SpinConfig,
  OrbitConfig,
  ClockConfig,
  EffectConfig,
} from "./LauncherHubTypes";

// Versi skema config saat ini (pakai di Defaults/Validator/AppConfig).
export const SCHEMA_VERSION = "2.0.0";
