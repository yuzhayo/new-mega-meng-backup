// File: LauncherScreenLogicUtilsMath.ts
// IMPORT SECTION
// (No external imports needed)

// TYPES SECTION
export interface Point2D {
  x: number;
  y: number;
}

// CONSTANTS SECTION
export const MATH_CONSTANTS = {
  PI: Math.PI,
  TWO_PI: 2 * Math.PI,
  HALF_PI: Math.PI / 2,
  DEG_TO_RAD: Math.PI / 180,
  RAD_TO_DEG: 180 / Math.PI,
} as const;

// BASIC MATH FUNCTIONS
/**
 * Clamp value between min and max (inclusive)
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Normalize angle to 0-360 degrees
 */
export const normalizeAngle = (degrees: number): number => {
  return ((degrees % 360) + 360) % 360;
};

/**
 * Convert degrees to radians
 */
export const degToRad = (degrees: number): number => {
  return degrees * MATH_CONSTANTS.DEG_TO_RAD;
};

/**
 * Convert radians to degrees
 */
export const radToDeg = (radians: number): number => {
  return radians * MATH_CONSTANTS.RAD_TO_DEG;
};

/**
 * Linear interpolation between two values
 */
export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * clamp(t, 0, 1);
};

/**
 * Calculate distance between two points
 */
export const distance = (a: Point2D, b: Point2D): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
};

/**
 * Calculate angle from point A to point B in degrees
 */
export const calculateAngle = (from: Point2D, to: Point2D): number => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const radians = Math.atan2(dy, dx);
  return normalizeAngle(radToDeg(radians));
};

/**
 * Check if two points are equal within tolerance
 */
export const pointsEqual = (a: Point2D, b: Point2D, tolerance = 0.001): boolean => {
  return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
};

/**
 * Normalize vector to unit length
 */
export const normalize = (point: Point2D): Point2D => {
  const length = Math.hypot(point.x, point.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: point.x / length, y: point.y / length };
};