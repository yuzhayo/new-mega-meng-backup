// File: LauncherScreenConfigDefaults.ts
// IMPORT SECTION
import type { 
  DefaultsConfig, 
  Logic2Config,
  Logic2AConfig,
  Logic3Config,  
  Logic3AConfig,
  ClockConfig,
  EffectConfig,
  Effect3DConfig
} from "./LauncherScreenConfigSchema";

// DEFAULT VALUES
export const DEFAULT_LOGIC2: Logic2Config = {
  enabled: true,
  scalePct: 100,
  minScalePct: 10,
  maxScalePct: 400,
  center: { xPct: 50, yPct: 50 },
  marginPct: 5,
  rounding: "round"
};

export const DEFAULT_LOGIC2A: Logic2AConfig = {
  enabled: false,
  rotationMode: "anchored",
  base: { xPct: 0, yPct: 50 },
  tip: { xPct: 0, yPct: -50 },
  pivot: "base"
};

export const DEFAULT_LOGIC3: Logic3Config = {
  enabled: false,
  fullSpinPerMinute: 1,
  direction: "cw",
  maxFps: 45,
  easing: "linear",
  pivotSource: "logic2A-base"
};

export const DEFAULT_LOGIC3A: Logic3AConfig = {
  enabled: false,
  fullOrbitPerMinute: 0.5,
  direction: "cw",
  radiusPct: 20,
  orbitPoint: "dotmark",
  startPhase: "auto",
  maxFps: 45
};

export const DEFAULT_CLOCK: ClockConfig = {
  enabled: false,
  mode: null,
  role: "minute",
  secondMode: "smooth",
  offsetDeg: 0,
  sync: "device"
};

export const DEFAULT_EFFECT: EffectConfig = {
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
  zIndexHint: 0
};

export const DEFAULT_EFFECT3D: Effect3DConfig = {
  enabled: false,
  mode: "basic",
  depthZ: 0,
  parallaxStrength: 0.5,
  material: {
    type: "basic",
    metalness: 0,
    roughness: 1
  },
  camera: {
    fovDeg: 75,
    near: 0.1,
    far: 1000
  },
  maxFps: 30,
  quality: "auto"
};

// COMPLETE DEFAULTS CONFIG
export const DEFAULTS_CONFIG: DefaultsConfig = {
  layer: {
    enabled: true,
    zHint: 10
  },
  logic2: DEFAULT_LOGIC2,
  logic2A: DEFAULT_LOGIC2A,
  logic3: DEFAULT_LOGIC3,
  logic3A: DEFAULT_LOGIC3A,
  clock: DEFAULT_CLOCK,
  effect: DEFAULT_EFFECT,
  effect3d: DEFAULT_EFFECT3D
};