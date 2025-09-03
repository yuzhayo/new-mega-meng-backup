// File: LauncherScreenLogicUtilsValidation.ts
// IMPORT SECTION
import { clamp } from "./LauncherScreenLogicUtilsMath";
import type { Point2D } from "./LauncherScreenLogicUtilsMath";

// TYPES SECTION
export interface ValidationResult<T> {
  isValid: boolean;
  value: T;
  errors: string[];
}

// VALIDATION FUNCTIONS
/**
 * Validate and clamp numeric value to range
 */
export const validateNumber = (
  value: any,
  min: number,
  max: number,
  defaultValue: number,
  fieldName = 'value'
): ValidationResult<number> => {
  const errors: string[] = [];

  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
    return { isValid: false, value: defaultValue, errors };
  }

  const clamped = clamp(value, min, max);
  if (clamped !== value) {
    errors.push(`${fieldName} clamped from ${value} to ${clamped} (range: ${min}-${max})`);
  }

  return {
    isValid: errors.length === 0,
    value: clamped,
    errors
  };
};

/**
 * Validate string against allowed values
 */
export const validateEnum = <T extends string>(
  value: any,
  allowedValues: readonly T[],
  defaultValue: T,
  fieldName = 'value'
): ValidationResult<T> => {
  const errors: string[] = [];

  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    errors.push(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    return { isValid: false, value: defaultValue, errors };
  }

  return { isValid: true, value: value as T, errors };
};

/**
 * Validate boolean value
 */
export const validateBoolean = (
  value: any,
  defaultValue: boolean,
  fieldName = 'value'
): ValidationResult<boolean> => {
  const errors: string[] = [];

  if (typeof value !== 'boolean') {
    errors.push(`${fieldName} must be a boolean`);
    return { isValid: false, value: defaultValue, errors };
  }

  return { isValid: true, value, errors };
};

/**
 * Validate Point2D coordinates
 */
export const validatePoint2D = (
  value: any,
  defaultValue: Point2D,
  fieldName = 'point'
): ValidationResult<Point2D> => {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    errors.push(`${fieldName} must be an object with x and y properties`);
    return { isValid: false, value: defaultValue, errors };
  }

  const xResult = validateNumber(value.x, -200, 200, defaultValue.x, `${fieldName}.x`);
  const yResult = validateNumber(value.y, -200, 200, defaultValue.y, `${fieldName}.y`);

  errors.push(...xResult.errors, ...yResult.errors);

  return {
    isValid: xResult.isValid && yResult.isValid,
    value: { x: xResult.value, y: yResult.value },
    errors
  };
};

/**
 * Standard validation ranges used across the system
 */
export const VALIDATION_RANGES = {
  percentage: { min: 0, max: 100 },
  extendedPercentage: { min: -200, max: 200 },
  scalePct: { min: 1, max: 400 },
  degrees: { min: 0, max: 360 },
  offsetDegrees: { min: -180, max: 180 },
  fps: { min: 15, max: 60 },
  rpm: { min: 0, max: 120 },
  orbitRpm: { min: 0, max: 60 },
  blur: { min: 0, max: 20 },
  brightness: { min: 0, max: 200 },
  zHint: { min: 0, max: 100 },
  bgZ: { min: 0, max: 10 }
} as const;