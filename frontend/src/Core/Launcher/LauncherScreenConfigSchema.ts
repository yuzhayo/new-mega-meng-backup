// File: LauncherScreenConfigSchema.ts
// IMPORT SECTION
// Types-only file, no external imports needed

// TOP-LEVEL CONFIG STRUCTURE
export interface LauncherScreenConfig {
  schemaVersion: string;                    // "1.0.0" | "1.1.0" etc
  meta: MetaConfig;
  backgrounds: BgLayer[];                   // Phase 1-3: Bootstrap display
  layers: LayerConfig[];                    // Phase 2+: Main logic pipeline
  defaults: DefaultsConfig;                 // Phase 2+: Fallback values
}

export interface MetaConfig {
  app: string;                             // "LauncherScreen v1.0"
  build: string;                           // "2025-01-15T10:30:00Z"
  author?: string;                         // Optional metadata
}

// BACKGROUNDS[] SPECIFICATION (Phase 1-3: Bootstrap, Composer)
export interface BgLayer {
  id: string;                              // "BG1", "BG2", "BG3" etc
  src: string;                             // "/Asset/BG/BG2.png"
  xPct: number;                            // 0-100, default 50
  yPct: number;                            // 0-100, default 50
  scalePct: number;                        // 1-400, default 100 (vmin units)
  opacityPct: number;                      // 0-100, default 100
  z: number;                               // 0-10, default 0
  fit: "contain" | "cover" | "fill" | "none"; // default "contain"
}

// LAYERS[] SPECIFICATION (Phase 2+: Main Logic Pipeline)
export interface LayerConfig {
  // CORE FIELDS (Phase 2+)
  id: string;                              // Unique identifier, "layer1", "hand-minute"
  path: string;                            // "/Asset/PNG/clock-hand.png"
  enabled: boolean;                        // true/false, default true
  zHint: number;                           // 0-100, default 10 (Composer ordering)

  // LOGIC CONFIGS (Each phase adds more)
  logic2?: Logic2Config;                   // Phase 4: Basic Placement
  logic2A?: Logic2AConfig;                 // Phase 5: Anchored Rotation
  logic3?: Logic3Config;                   // Phase 6: Spin
  logic3A?: Logic3AConfig;                 // Phase 7: Orbit
  clock?: ClockConfig;                     // Phase 8: Clock Driver
  effect?: EffectConfig;                   // Phase 9: Effects Basic
  effect3d?: Effect3DConfig;               // Phase 10: Effects 3D
}

// LOGIC 2: BASIC PLACEMENT (Phase 4)
export interface Logic2Config {
  enabled: boolean;                        // default true
  scalePct: number;                        // 1-400, default 100 (vmin units)
  minScalePct: number;                     // 1-400, default 10
  maxScalePct: number;                     // 1-400, default 400
  center: { xPct: number; yPct: number };  // 0-100 each, default {50, 50}
  marginPct: number;                       // 0-50, default 5 (boundary margin)
  rounding: "round" | "floor" | "ceil";    // default "round"
}

// LOGIC 2A: ANCHORED ROTATION (Phase 5)
export interface Logic2AConfig {
  enabled: boolean;                        // default false
  rotationMode: "anchored" | "free";       // default "anchored"
  base: { xPct: number; yPct: number };    // -200 to +200, default {0, 50}
  tip: { xPct: number; yPct: number };     // -200 to +200, default {0, -50}
  pivot: "base" | "center";                // default "base"
}

// LOGIC 3: SPIN (Phase 6)
export interface Logic3Config {
  enabled: boolean;                        // default false
  fullSpinPerMinute: number;               // 0-120, default 1 (1 RPM)
  direction: "cw" | "ccw";                 // default "cw"
  maxFps: number;                          // 15-60, default 45
  easing: "linear" | "thick" | "smooth";   // default "linear"
  pivotSource: "logic2A-base" | "logic2-center"; // default "logic2A-base"
}

// LOGIC 3A: ORBIT (Phase 7)
export interface Logic3AConfig {
  enabled: boolean;                        // default false
  fullOrbitPerMinute: number;              // 0-60, default 0.5 (30 sec per orbit)
  direction: "cw" | "ccw";                 // default "cw"
  radiusPct: number;                       // 0-100, default 20 (vmin units)
  orbitPoint: "dotmark" | { xPct: number; yPct: number } | null; // default "dotmark"
  startPhase: "auto" | number;             // "auto" or 0-360 degrees, default "auto"
  maxFps: number;                          // 15-60, default 45
}

// CLOCK: REAL-TIME DRIVER (Phase 8)
export interface ClockConfig {
  enabled: boolean;                        // default false
  mode: "modeA" | "modeB" | null;         // modeA=12h×2, modeB=24h, default null
  role: "second" | "minute" | "hour";      // default "minute"
  secondMode: "tick" | "smooth";           // default "smooth"
  offsetDeg: number;                       // -180 to +180, default 0
  sync: "device" | "device+server";        // default "device"
}

// EFFECT: BASIC FILTERS (Phase 9)
export interface EffectConfig {
  enabled: boolean;                        // default false
  visibility: "visible" | "hidden";        // default "visible"
  opacityPct: number;                      // 0-100, default 100
  blend: "normal" | "multiply" | "screen" | "overlay"; // default "normal"
  blurPx: number;                          // 0-20, default 0
  brightnessPct: number;                   // 0-200, default 100
  contrastPct: number;                     // 0-200, default 100
  saturatePct: number;                     // 0-200, default 100
  grayscalePct: number;                    // 0-100, default 0
  hueRotateDeg: number;                    // 0-360, default 0
  zIndexHint: number;                      // 0-100, default 0 (visual layering hint)
}

// EFFECT 3D: THREE.JS PIPELINE (Phase 10)
export interface Effect3DConfig {
  enabled: boolean;                        // default false
  mode: "basic" | "lit" | "shader" | "particle"; // default "basic"
  depthZ: number;                          // -10 to +10, default 0
  parallaxStrength: number;                // 0-2, default 0.5
  material: MaterialConfig;
  camera: CameraConfig;
  maxFps: number;                          // 15-60, default 30
  quality: "auto" | "low" | "med" | "high"; // default "auto"
}

export interface MaterialConfig {
  type: "basic" | "lambert" | "phong" | "standard"; // default "basic"
  metalness?: number;                      // 0-1, default 0
  roughness?: number;                      // 0-1, default 1
}

export interface CameraConfig {
  fovDeg: number;                          // 30-120, default 75
  near: number;                            // 0.1-10, default 0.1
  far: number;                             // 10-2000, default 1000
}

// DEFAULTS: FALLBACK VALUES (Phase 2+)
export interface DefaultsConfig {
  layer: {
    enabled: boolean;                      // true
    zHint: number;                         // 10
  };
  logic2: Logic2Config;                    // All default values above
  logic2A: Logic2AConfig;                  // All default values above  
  logic3: Logic3Config;                    // All default values above
  logic3A: Logic3AConfig;                  // All default values above
  clock: ClockConfig;                      // All default values above
  effect: EffectConfig;                    // All default values above
  effect3d: Effect3DConfig;                // All default values above
}