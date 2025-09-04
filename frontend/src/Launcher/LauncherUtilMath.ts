// File: src/Launcher/LauncherUtilMath.ts
// Util numerik kecil: clamp, derajat/radian, normalisasi sudut, jarak, polar/kartesius, dsb.
// Tidak bergantung ke React.

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Normalisasi ke [0, 360) */
export function norm360(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** Normalisasi ke (-180, 180] */
export function norm180(deg: number): number {
  let d = ((deg + 180) % 360) - 180;
  if (d <= -180) d += 360; // jaga batas
  return d;
}

/** Selisih sudut terkecil dalam derajat, hasil di (-180, 180] */
export function angleDiffDeg(a: number, b: number): number {
  return norm180(a - b);
}

/** Jarak Euclidean */
export function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/** Polar → Kartesius (deg) */
export function polarToCartesian(rPx: number, thetaDeg: number): { x: number; y: number } {
  const t = toRad(thetaDeg);
  return { x: rPx * Math.cos(t), y: rPx * Math.sin(t) };
}

/** Kartesius → Polar (deg), r>=0, theta di [0,360) */
export function cartesianToPolar(x: number, y: number): { r: number; thetaDeg: number } {
  const r = Math.hypot(x, y);
  const thetaDeg = norm360(toDeg(Math.atan2(y, x)));
  return { r, thetaDeg };
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Pembulatan sesuai mode "round" | "floor" | "ceil" */
export function roundBy(mode: "round" | "floor" | "ceil", v: number): number {
  switch (mode) {
    case "floor": return Math.floor(v);
    case "ceil": return Math.ceil(v);
    default: return Math.round(v);
  }
}

/** Hampir sama dengan toleransi eps */
export function almostEqual(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) <= eps;
}
