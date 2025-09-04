// File: src/Launcher/LauncherUtilUnits.ts
// Konversi unit layar & gambar (px ↔ %), plus vmin. Tanpa React.
// Konvensi:
// - pct100: 0..100, 50=pusat layar.
// - extendedPct (layar & gambar): -200..200, 0=pusat; ±100 = tepi; >100 boleh keluar.
// - vmin: min(width, height).

import { Origin, Units, Size } from "./LauncherHubTypes";
import { isFiniteNumber } from "./LauncherUtilMath";

/* =========================
   Helper aman pembagi nol
   ========================= */
function nonZero(v: number, fallback = 1): number {
  return isFiniteNumber(v) && Math.abs(v) > 1e-9 ? v : fallback;
}

/* =========================
   Screen pct100 (0..100)
   ========================= */
function screenPct100ToPx(xPct: number, yPct: number, origin: Origin) {
  const x = (xPct / 100) * origin.width;
  const y = (yPct / 100) * origin.height;
  return { x, y };
}

function screenPxToPct100(xPx: number, yPx: number, origin: Origin) {
  const w = nonZero(origin.width);
  const h = nonZero(origin.height);
  const x = (xPx / w) * 100;
  const y = (yPx / h) * 100;
  return { x, y };
}

/* =========================
   Screen extendedPct (-200..200), 0=pusat; ±100 tepi
   ========================= */
function screenExtendedPctToPx(xPct: number, yPct: number, origin: Origin) {
  const halfW = origin.width / 2;
  const halfH = origin.height / 2;
  const x = origin.centerX + (xPct / 100) * halfW;
  const y = origin.centerY + (yPct / 100) * halfH;
  return { x, y };
}

function screenPxToExtendedPct(xPx: number, yPx: number, origin: Origin) {
  const halfW = nonZero(origin.width / 2);
  const halfH = nonZero(origin.height / 2);
  const x = ((xPx - origin.centerX) / halfW) * 100;
  const y = ((yPx - origin.centerY) / halfH) * 100;
  return { x, y };
}

/* =========================
   vmin-based scale
   ========================= */
function vminPctToPx(pct: number, origin: Origin) {
  const vmin = Math.min(origin.width, origin.height);
  return (pct / 100) * vmin;
}

function pxToVminPct(px: number, origin: Origin) {
  const vmin = nonZero(Math.min(origin.width, origin.height));
  return (px / vmin) * 100;
}

/* =========================
   Image-local (centered), 0,0=pusat; ±100 tepi
   ========================= */
function imgLocalPctToPx(xPct: number, yPct: number, natural: Size) {
  const halfW = natural.w / 2;
  const halfH = natural.h / 2;
  const x = (xPct / 100) * halfW; // relatif terhadap pusat gambar
  const y = (yPct / 100) * halfH;
  return { x, y };
}

function imgLocalPxToPct(xPx: number, yPx: number, natural: Size) {
  const halfW = nonZero(natural.w / 2);
  const halfH = nonZero(natural.h / 2);
  const x = (xPx / halfW) * 100;
  const y = (yPx / halfH) * 100;
  return { x, y };
}

/* =========================
   Export Units impl
   ========================= */
export const UnitsImpl: Units = {
  screenPct100ToPx,
  screenPxToPct100,
  screenExtendedPctToPx,
  screenPxToExtendedPct,
  vminPctToPx,
  pxToVminPct,
  imgLocalPctToPx,
  imgLocalPxToPct,
};

// Opsi: factory kalau mau gaya dependency injection
export function createUnits(): Units {
  return UnitsImpl;
}
