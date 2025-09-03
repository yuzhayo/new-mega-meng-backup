// File: LauncherScreenConfig.ts
// IMPORT SECTION
import { createLogger } from "./LauncherScreenLogicUtilsLogging";
import { validateConfig } from "./LauncherScreenConfigValidator";
import type { LauncherScreenConfig, BgLayer } from "./LauncherScreenConfigSchema";

// CONSTANTS SECTION
const logger = createLogger('Config');

// DEVELOPMENT CONFIG DATA
/**
 * Development configuration for LauncherScreen
 * This will be auto-converted to JSON in development mode
 */
export const config: LauncherScreenConfig = {
  schemaVersion: "1.0.0",
  meta: {
    app: "LauncherScreen Logic System v1.0",
    build: "2025-01-15T10:30:00Z",
    author: "LauncherScreen Phase 1 Implementation"
  },
  backgrounds: [
    {
      id: "BG2",
      src: "/Asset/BG/BG2.png",
      xPct: 40,
      yPct: 50,
      scalePct: 70,
      opacityPct: 100,
      z: 0,
      fit: "contain"
    },
    {
      id: "BG3", 
      src: "/Asset/BG/BG3.png",
      xPct: 65,
      yPct: 50,
      scalePct: 55,
      opacityPct: 90,
      z: 1,
      fit: "contain"
    }
  ],
  layers: [
    // Will be populated in later phases
    // Example for Phase 2+:
    // {
    //   id: "example-layer",
    //   path: "/Asset/PNG/example.png",
    //   enabled: true,
    //   zHint: 20,
    //   logic2: {
    //     enabled: true,
    //     scalePct: 100,
    //     minScalePct: 50,
    //     maxScalePct: 200,
    //     center: { xPct: 50, yPct: 50 },
    //     marginPct: 5,
    //     rounding: "round"
    //   }
    // }
  ],
  defaults: {
    layer: {
      enabled: true,
      zHint: 10
    },
    logic2: {
      enabled: true,
      scalePct: 100,
      minScalePct: 10,
      maxScalePct: 400,
      center: { xPct: 50, yPct: 50 },
      marginPct: 5,
      rounding: "round"
    },
    logic2A: {
      enabled: false,
      rotationMode: "anchored",
      base: { xPct: 0, yPct: 50 },
      tip: { xPct: 0, yPct: -50 },
      pivot: "base"
    },
    logic3: {
      enabled: false,
      fullSpinPerMinute: 1,
      direction: "cw",
      maxFps: 45,
      easing: "linear",
      pivotSource: "logic2A-base"
    },
    logic3A: {
      enabled: false,
      fullOrbitPerMinute: 0.5,
      direction: "cw",
      radiusPct: 20,
      orbitPoint: "dotmark",
      startPhase: "auto",
      maxFps: 45
    },
    clock: {
      enabled: false,
      mode: null,
      role: "minute",
      secondMode: "smooth",
      offsetDeg: 0,
      sync: "device"
    },
    effect: {
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
    },
    effect3d: {
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
    }
  }
};

// VALIDATED CONFIG EXPORT
/**
 * Validated configuration - always use this in components
 */
export const validatedConfig = validateConfig(config);

// HELPER FUNCTIONS
/**
 * Get background layers from config
 */
export function getBackgrounds(): BgLayer[] {
  return validatedConfig.backgrounds;
}

/**
 * Get config for development/debugging
 */
export function getConfig(): LauncherScreenConfig {
  return validatedConfig;
}

// AUTO-GENERATION (Development only)
if (import.meta.env?.DEV) {
  try {
    // Note: In a real Vite setup, we would use a plugin to generate JSON
    // For now, we'll simulate this by logging the config
    logger.info('Development mode: Config available for JSON generation', {
      backgroundsCount: config.backgrounds.length,
      layersCount: config.layers.length,
      schemaVersion: config.schemaVersion
    });
    
    // In a real implementation, this would write to /public/LauncherScreenConfig.json
    // using a Vite plugin or build script
    console.log('[Config] Auto-generation ready - JSON would be written to /public/LauncherScreenConfig.json');
    
  } catch (error) {
    logger.error('Failed to auto-generate config JSON', error);
  }
}

// Export for hot-reload integration (Phase 1 requirement)
export { config as rawConfig };