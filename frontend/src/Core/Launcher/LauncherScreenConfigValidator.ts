// File: LauncherScreenConfigValidator.ts
// IMPORT SECTION
import { createLogger } from "./LauncherScreenLogicUtilsLogging";
import { 
  validateNumber, 
  validateEnum, 
  validateBoolean, 
  validatePoint2D,
  VALIDATION_RANGES 
} from "./LauncherScreenLogicUtilsValidation";
import type { 
  LauncherScreenConfig, 
  BgLayer, 
  LayerConfig,
  Logic2Config
} from "./LauncherScreenConfigSchema";
import { DEFAULTS_CONFIG } from "./LauncherScreenConfigDefaults";

// CONSTANTS SECTION
const logger = createLogger('ConfigValidator');

// VALIDATION FUNCTIONS
/**
 * Validate and fix BgLayer configuration
 */
export function validateBgLayer(layer: any, index: number): BgLayer {
  try {
    const id = typeof layer.id === 'string' ? layer.id : `BG${index + 1}`;
    const src = typeof layer.src === 'string' ? layer.src : `/Asset/BG/BG${index + 1}.png`;
    
    const xPctResult = validateNumber(layer.xPct, 0, 100, 50, 'xPct');
    const yPctResult = validateNumber(layer.yPct, 0, 100, 50, 'yPct');
    const scalePctResult = validateNumber(layer.scalePct, 1, 400, 100, 'scalePct');
    const opacityPctResult = validateNumber(layer.opacityPct, 0, 100, 100, 'opacityPct');
    const zResult = validateNumber(layer.z, 0, 10, index, 'z');
    const fitResult = validateEnum(layer.fit, ['contain', 'cover', 'fill', 'none'] as const, 'contain', 'fit');

    // Log validation warnings
    const allErrors = [
      ...xPctResult.errors,
      ...yPctResult.errors, 
      ...scalePctResult.errors,
      ...opacityPctResult.errors,
      ...zResult.errors,
      ...fitResult.errors
    ];

    if (allErrors.length > 0) {
      logger.warnOnce(`BgLayer ${id} validation issues`, allErrors);
    }

    return {
      id,
      src,
      xPct: xPctResult.value,
      yPct: yPctResult.value,
      scalePct: scalePctResult.value,
      opacityPct: opacityPctResult.value,
      z: zResult.value,
      fit: fitResult.value
    };

  } catch (error) {
    logger.errorOnce(`Failed to validate BgLayer at index ${index}`, error);
    return {
      id: `BG${index + 1}`,
      src: `/Asset/BG/BG${index + 1}.png`,
      xPct: 50,
      yPct: 50,
      scalePct: 100,
      opacityPct: 100,
      z: index,
      fit: 'contain'
    };
  }
}

/**
 * Validate Logic2 configuration
 */
export function validateLogic2Config(config: any): Logic2Config {
  try {
    const enabledResult = validateBoolean(config?.enabled, DEFAULTS_CONFIG.logic2.enabled, 'logic2.enabled');
    const scalePctResult = validateNumber(config?.scalePct, VALIDATION_RANGES.scalePct.min, VALIDATION_RANGES.scalePct.max, DEFAULTS_CONFIG.logic2.scalePct, 'logic2.scalePct');
    const minScalePctResult = validateNumber(config?.minScalePct, VALIDATION_RANGES.scalePct.min, VALIDATION_RANGES.scalePct.max, DEFAULTS_CONFIG.logic2.minScalePct, 'logic2.minScalePct');
    const maxScalePctResult = validateNumber(config?.maxScalePct, VALIDATION_RANGES.scalePct.min, VALIDATION_RANGES.scalePct.max, DEFAULTS_CONFIG.logic2.maxScalePct, 'logic2.maxScalePct');
    const centerResult = validatePoint2D(config?.center, { x: DEFAULTS_CONFIG.logic2.center.xPct, y: DEFAULTS_CONFIG.logic2.center.yPct }, 'logic2.center');
    const marginPctResult = validateNumber(config?.marginPct, 0, 50, DEFAULTS_CONFIG.logic2.marginPct, 'logic2.marginPct');
    const roundingResult = validateEnum(config?.rounding, ['round', 'floor', 'ceil'] as const, DEFAULTS_CONFIG.logic2.rounding, 'logic2.rounding');

    return {
      enabled: enabledResult.value,
      scalePct: scalePctResult.value,
      minScalePct: minScalePctResult.value,
      maxScalePct: maxScalePctResult.value,
      center: { xPct: centerResult.value.x, yPct: centerResult.value.y },
      marginPct: marginPctResult.value,
      rounding: roundingResult.value
    };

  } catch (error) {
    logger.errorOnce('Failed to validate Logic2 config', error);
    return DEFAULTS_CONFIG.logic2;
  }
}

/**
 * Validate LayerConfig
 */
export function validateLayerConfig(layer: any, index: number): LayerConfig {
  try {
    const id = typeof layer.id === 'string' ? layer.id : `layer${index + 1}`;
    const path = typeof layer.path === 'string' ? layer.path : `/Asset/PNG/layer${index + 1}.png`;
    const enabledResult = validateBoolean(layer.enabled, DEFAULTS_CONFIG.layer.enabled, 'enabled');
    const zHintResult = validateNumber(layer.zHint, VALIDATION_RANGES.zHint.min, VALIDATION_RANGES.zHint.max, DEFAULTS_CONFIG.layer.zHint, 'zHint');

    const validatedLayer: LayerConfig = {
      id,
      path,
      enabled: enabledResult.value,
      zHint: zHintResult.value
    };

    // Validate optional logic configs
    if (layer.logic2) {
      validatedLayer.logic2 = validateLogic2Config(layer.logic2);
    }

    // Add more logic validations as phases are implemented
    // if (layer.logic2A) validatedLayer.logic2A = validateLogic2AConfig(layer.logic2A);
    // if (layer.logic3) validatedLayer.logic3 = validateLogic3Config(layer.logic3);
    // etc.

    return validatedLayer;

  } catch (error) {
    logger.errorOnce(`Failed to validate LayerConfig at index ${index}`, error);
    return {
      id: `layer${index + 1}`,
      path: `/Asset/PNG/layer${index + 1}.png`,
      enabled: DEFAULTS_CONFIG.layer.enabled,
      zHint: DEFAULTS_CONFIG.layer.zHint
    };
  }
}

/**
 * Handle duplicate IDs by adding suffixes
 */
export function ensureUniqueIds<T extends { id: string }>(items: T[]): T[] {
  const seen = new Map<string, number>();
  
  return items.map(item => {
    const baseId = item.id;
    const count = seen.get(baseId) || 0;
    seen.set(baseId, count + 1);
    
    if (count === 0) {
      return item;
    }
    
    // Add suffix for duplicates: .a, .b, .c, etc.
    const suffix = String.fromCharCode(97 + count - 1); // 97 = 'a'
    const newId = `${baseId}.${suffix}`;
    
    logger.warnOnce(`Duplicate ID detected: ${baseId} → ${newId}`);
    
    return { ...item, id: newId };
  });
}

/**
 * Main validation function for complete config
 */
export function validateConfig(rawConfig: any): LauncherScreenConfig {
  try {
    // Validate meta information
    const schemaVersion = typeof rawConfig.schemaVersion === 'string' ? rawConfig.schemaVersion : '1.0.0';
    const meta = {
      app: typeof rawConfig.meta?.app === 'string' ? rawConfig.meta.app : 'LauncherScreen Logic System',
      build: typeof rawConfig.meta?.build === 'string' ? rawConfig.meta.build : new Date().toISOString(),
      author: rawConfig.meta?.author
    };

    // Validate backgrounds
    const rawBackgrounds = Array.isArray(rawConfig.backgrounds) ? rawConfig.backgrounds : [];
    let backgrounds = rawBackgrounds.map((bg: any, index: number) => validateBgLayer(bg, index));
    backgrounds = ensureUniqueIds(backgrounds);

    // Validate layers
    const rawLayers = Array.isArray(rawConfig.layers) ? rawConfig.layers : [];
    let layers = rawLayers.map((layer: any, index: number) => validateLayerConfig(layer, index));
    layers = ensureUniqueIds(layers);

    // Use defaults config
    const defaults = DEFAULTS_CONFIG;

    const validatedConfig: LauncherScreenConfig = {
      schemaVersion,
      meta,
      backgrounds,
      layers,
      defaults
    };

    logger.info('Config validation completed successfully', {
      backgroundsCount: backgrounds.length,
      layersCount: layers.length,
      schemaVersion
    });

    return validatedConfig;

  } catch (error) {
    logger.error('Critical config validation failure', error);
    
    // Return minimal safe config
    return {
      schemaVersion: '1.0.0',
      meta: {
        app: 'LauncherScreen Logic System',
        build: new Date().toISOString()
      },
      backgrounds: [],
      layers: [],
      defaults: DEFAULTS_CONFIG
    };
  }
}