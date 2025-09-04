// File: src/Launcher/LauncherConfigDefaults.ts
// Default aman untuk semua blok (sampai Clock). Tanpa improvisasi.
// Validator akan clamp & sanitize; di sini hanya nilai awal konsisten.

import { DEFAULT_MAX_FPS } from "./LauncherHubTypes";
import type {
  DefaultsConfig,
  L2Config,
  L2AConfig,
  SpinConfig,
  OrbitConfig,
  ClockConfig,
  EffectConfig,
} from "./LauncherConfigSchema";

/* ============= L2 (position & scale) ============= */
export const DefaultL2: L2Config = {
  enabled: true,
  clampMode: "none",
  centerMode: "pct100",
  center: { xPct: 50, yPct: 50 },
  scalePct: 100,
  minScalePct: 10,
  maxScalePct: 400,
  marginPct: 5,
  rounding: "round",
};

/* ============= L2A (anchored angle) ============= */
export const DefaultL2A: L2AConfig = {
  enabled: false,
  rotationMode: "anchored",
  base: { xPct: 0, yPct: 50 },   // bawah-tengah
  tip:  { xPct: 0, yPct: -50 },  // atas-tengah
  pivot: "center",
  align: "vertical",
};

/* ============= Spin (Logic-3) ============= */
export const DefaultSpin: SpinConfig = {
  enabled: false,
  rpm: 0,
  direction: "cw",
  maxFps: DEFAULT_MAX_FPS,
  easing: "linear",
  pivotSource: "logic2-center",
};

/* ============= Orbit (Logic-3A) ============= */
export const DefaultOrbit: OrbitConfig = {
  enabled: false,
  rpm: 0,
  direction: "cw",
  radiusPct: 20,                 // fallback radius bila line invalid
  orbitPoint: "dotmark",
  line: "none",
  startPhase: "auto",
  maxFps: DEFAULT_MAX_FPS,
  showLine: false,
};

/* ============= Clock / Timezone ============= */
export const DefaultClock: ClockConfig = {
  enabled: false,
  sync: "device",
  role: "minute",
  secondMode: "smooth",
  hourStyle: 12,
  offsetDeg: 0,
  // utcOffsetMinutes: (hanya saat sync:"utc")
};

/* ============= Effect (reserved, OFF) ============= */
export const DefaultEffect: EffectConfig = {
  enabled: false,
  visibility: "visible",
  opacityPct: 100,
  blend: "normal",
  blurPx: 0,
  brightnessPct: 100,
  contrastPct: 100,
  saturatePct: 100,
  grayscalePct: 0,
  hueRotateDeg: 0,
};

/* ============= Defaults bundle (opsional) ============= */
export const DEFAULTS: DefaultsConfig = {
  // layer: { enabled: true, zHint: 0 },   // biarkan layer set eksplisit di AppConfig
  l2: DefaultL2,
  l2a: DefaultL2A,
  spin: DefaultSpin,
  orbit: DefaultOrbit,
  clock: DefaultClock,
  effect: DefaultEffect,
};
