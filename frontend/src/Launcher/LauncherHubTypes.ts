// File: src/Launcher/LauncherHubTypes.ts
// ---------------------------------------------------------------------
// Tipe inti untuk pipeline Launcher (sampai Clock) + konstanta ringan.
// Tidak bergantung React. Aman dipakai semua modul.
// ---------------------------------------------------------------------

/* ==============================
   Konstanta global ringan
   ============================== */
export const ORBIT_EPS = 0.5;          // px, radius minimum dari blue→green agar dianggap valid
export const DEFAULT_MAX_FPS = 60;     // gate FPS per-layer
export const MIN_FPS = 15;             // batas bawah gate FPS

/* ==============================
   Util tipe umum
   ============================== */
export type Direction = "cw" | "ccw";

export interface Point { x: number; y: number; }                  // px
export interface PointPct { x: number; y: number; }               // 0..100
export interface Size { w: number; h: number; }                   // px

export interface Origin {
  width: number;   // px
  height: number;  // px
  centerX: number; // px
  centerY: number; // px
}

/* ==============================
   Units converter (px ↔ %)
   Implementasi ada di LauncherUtilUnits.ts
   ============================== */
export interface Units {
  // Screen pct100 (0..100; 50,50 = center of screen)
  screenPct100ToPx(xPct: number, yPct: number, origin: Origin): Point;
  screenPxToPct100(xPx: number, yPx: number, origin: Origin): PointPct;

  // Screen extendedPct (-200..200; 0,0 = center of screen)
  screenExtendedPctToPx(xPct: number, yPct: number, origin: Origin): Point;
  screenPxToExtendedPct(xPx: number, yPx: number, origin: Origin): PointPct;

  // vmin-based scale
  vminPctToPx(pct: number, origin: Origin): number;
  pxToVminPct(px: number, origin: Origin): number;

  // Image-local (centered space; 0,0 = image center; +x right, +y down)
  imgLocalPctToPx(xPct: number, yPct: number, natural: Size): Point;     // typically -200..200 range
  imgLocalPxToPct(xPx: number, yPx: number, natural: Size): PointPct;
}

/* ==============================
   Config schema (ringkas, final names)
   Detail validasi di Validator; default di Defaults.
   ============================== */
// Logic-2 (position & scale)
export interface L2Config {
  enabled: boolean;
  clampMode: "none" | "bounds";
  centerMode: "pct100" | "extendedPct";
  center: { xPct: number; yPct: number };
  scalePct: number;                // vmin-based
  minScalePct: number;
  maxScalePct: number;
  marginPct: number;               // only for bounds
  rounding: "round" | "floor" | "ceil";
}

// Logic-2A (anchored angle)
export interface L2AConfig {
  enabled: boolean;
  rotationMode: "anchored";
  base: { xPct: number; yPct: number }; // extendedPct relative to image center
  tip:  { xPct: number; yPct: number }; // extendedPct relative to image center
  pivot: "center" | "base";
  align: "vertical" | "axis";
}

// Logic-3 (spin)
export interface SpinConfig {
  enabled: boolean;
  rpm: number;                     // 0..120
  direction: Direction;
  maxFps: number;                  // 15..60
  easing: "linear";                // placeholder
  pivotSource: "logic2-center" | "logic2A-base";
}

// Logic-3A (orbit)
export interface OrbitConfig {
  enabled: boolean;
  rpm: number;                     // 0..60
  direction: Direction;
  radiusPct: number;               // vmin-based; used when line is none/invalid
  orbitPoint: "dotmark" | { xPct: number; yPct: number }; // screen pct100
  line: "none" | "center" | "base" | "tip" | { xPct: number; yPct: number }; // blue
  startPhase: "auto" | number;     // deg
  maxFps: number;                  // 15..60
  showLine: boolean;               // debug only
}

// Clock / timezone
export interface ClockConfig {
  enabled: boolean;
  sync: "device" | "utc";
  utcOffsetMinutes?: number;       // required when sync="utc"
  role: "hour" | "minute" | "second";
  secondMode?: "smooth" | "tick";  // only for role="second"
  hourStyle?: 12 | 24;             // default 12
  offsetDeg?: number;              // -180..180
}

// Effect reserved (nanti)
export interface EffectConfig {
  enabled: boolean;
  visibility: "visible" | "hidden";
  opacityPct: number;              // 0..100
  blend: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten"
       | "color-dodge" | "color-burn" | "difference" | "exclusion"
       | "hue" | "saturation" | "color" | "luminosity";
  blurPx: number;                   // 0..20
  brightnessPct: number;            // 0..200
  contrastPct: number;              // 0..200
  saturatePct: number;              // 0..200
  grayscalePct: number;             // 0..100
  hueRotateDeg: number;             // 0..360
}

// Layer
export interface LayerConfig {
  id: string;
  path: string;
  enabled: boolean;
  zHint: number;                    // ordering
  l2?: L2Config;
  l2a?: L2AConfig;
  spin?: SpinConfig;
  orbit?: OrbitConfig;
  clock?: ClockConfig;
  effect?: EffectConfig;            // reserved for later
}

// Background
export type BgFit = "contain" | "cover" | "fill" | "none";
export interface BgLayer {
  id: string;
  src: string;
  xPct: number;                    // 0..100 (50 center X)
  yPct: number;                    // 0..100 (50 center Y)
  scalePct: number;                // vmin-based
  opacityPct?: number;             // 0..100
  z?: number;                      // 0..10
  fit?: BgFit;                     // default "contain"
}

// Root config
export interface DefaultsConfig {
  layer?: Partial<Pick<LayerConfig, "enabled" | "zHint">>;
  l2?: Partial<L2Config>;
  l2a?: Partial<L2AConfig>;
  spin?: Partial<SpinConfig>;
  orbit?: Partial<OrbitConfig>;
  clock?: Partial<ClockConfig>;
  effect?: Partial<EffectConfig>;
}

export interface LauncherConfigRoot {
  schemaVersion: string;
  meta: { app: string; build: string; author?: string };
  backgrounds: BgLayer[];
  layers: LayerConfig[];
  defaults?: DefaultsConfig;
}

/* ==============================
   Frame context & Bus (jalur data)
   ============================== */
export interface FrameCtx {
  nowMs: number;
  origin: Origin;
  units: Units;
  natural: Size | null; // natural size for current layer (if known)
}

export interface Bus {
  // 1) Produce
  layer?: {
    id: string;
    path: string;
    enabled: boolean;
    zHint: number;
    cfg: LayerConfig;              // sanitized layer config
  };

  // 2) Layer mapping (screen)
  map?: {
    vw: number;
    vh: number;
    vmin: number;
    dotmark: Point;                // screen center in px
  };

  // 3) Image mapping (local)
  image?: {
    natural: Size;                 // px (fallback 1x1 until known)
    localSpace: "image-centered";
  };

  // 4) Position (Logic-2)
  pos?: {
    centerPx: Point;               // screen px
    scalePx: number;               // vmin-based scale to px
  };

  // 5) Angle (Logic-2A)
  angle?: {
    rotation2ADeg: number;         // deg
    originPct: PointPct;           // 0..100
    basePx: Point;                 // screen px
    tipPx: Point;                  // screen px
  };

  // 6) Spin (Logic-3)
  spin?: {
    deg: number;                   // deg
  };

  // 7) Orbit (Logic-3A)
  orbit?: {
    dx: number;                    // px
    dy: number;                    // px
  };

  // 8) Clock
  clock?: {
    deg: number;                   // deg
  };
}

/* ==============================
   Tokens (kontinuitas) — disimpan di Hub
   ============================== */
export interface SpinToken {
  t0Ms: number;
  phase0Deg: number;
  inited: boolean;
}

export interface OrbitToken {
  rPx: number;
  theta0Deg: number;
  t0Ms: number;
  validBlue: boolean;
}

export interface FpsGate {
  lastDrawMs: number;
}
