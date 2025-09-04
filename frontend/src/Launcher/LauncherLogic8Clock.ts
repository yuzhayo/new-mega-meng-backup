// File: src/Launcher/LauncherLogic8Clock.ts
// Rumah 8: Clock / Timezone. Pure, tanpa React/state.
// Input: nowMs (virtual), cfg.clock { sync, utcOffsetMinutes, role, secondMode, hourStyle, offsetDeg }.
// Output: bus.clock.deg (derajat, CW).
//
// Konvensi sudut:
// - 0° = kanan, 90° = atas (kita pakai rotasi CW, jadi kompatibel dengan CSS rotate(+deg) + Y-down).
//   Untuk jarum jam tradisional: second/minute naik ke atas = 90°. Rumus di bawah sudah menyesuaikan.
//
// Catatan: Tidak menyentuh orbit/spin; ini hanya kontribusi sudut jam.

import type { Bus, FrameCtx, LayerConfig } from "./LauncherHubTypes";
import { norm360, clamp, isFiniteNumber } from "./LauncherUtilMath";

/* ==============================
   Time parts helper
   ============================== */
type TimeParts = { h: number; m: number; s: number; ms: number };

function partsDevice(nowMs: number): TimeParts {
  const d = new Date(nowMs);
  return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds(), ms: d.getMilliseconds() };
}

function partsUTCWithOffset(nowMs: number, offsetMin: number): TimeParts {
  // Geser epoch dengan offset menit, lalu baca sebagai UTC biar konsisten
  const d = new Date(nowMs + offsetMin * 60000);
  return { h: d.getUTCHours(), m: d.getUTCMinutes(), s: d.getUTCSeconds(), ms: d.getUTCMilliseconds() };
}

function getParts(nowMs: number, cfg: NonNullable<LayerConfig["clock"]>): TimeParts {
  if (cfg.sync === "utc") {
    const off = isFiniteNumber(cfg.utcOffsetMinutes) ? (cfg.utcOffsetMinutes as number) : 0;
    return partsUTCWithOffset(nowMs, off);
  }
  return partsDevice(nowMs);
}

/* ==============================
   Sudut clock (CW, 0°=kanan, 90°=atas)
   ============================== */
function angleSecond(parts: TimeParts, mode: "smooth" | "tick"): number {
  const base = mode === "tick" ? parts.s : parts.s + parts.ms / 1000;
  // 0s → 0° (kanan), 15s → 90° (atas), 30s → 180° (kiri) → sesuai jam CW
  return norm360(base * 6);
}

function angleMinute(parts: TimeParts): number {
  const base = parts.m + parts.s / 60;
  return norm360(base * 6);
}

function angleHour(parts: TimeParts, style: 12 | 24): number {
  const H = style === 24 ? (parts.h % 24) : (parts.h % 12);
  const perHour = style === 24 ? 15 : 30;
  const base = H + parts.m / 60;
  return norm360(base * perHour);
}

export function computeClockAngleDeg(nowMs: number, cfg: NonNullable<LayerConfig["clock"]>): number {
  const parts = getParts(nowMs, cfg);
  let deg = 0;
  const role = cfg.role === "hour" || cfg.role === "second" ? cfg.role : "minute";
  if (role === "second") deg = angleSecond(parts, cfg.secondMode === "tick" ? "tick" : "smooth");
  else if (role === "hour") deg = angleHour(parts, cfg.hourStyle === 24 ? 24 : 12);
  else deg = angleMinute(parts);

  const offset = clamp(isFiniteNumber(cfg.offsetDeg) ? (cfg.offsetDeg as number) : 0, -180, 180);
  return norm360(deg + offset);
}

/* ==============================
   Eksekutor Rumah-8
   ============================== */
export function logic8Clock(prev: Bus | undefined, ctx: FrameCtx): Bus {
  const cfg = prev?.layer?.cfg?.clock;
  const deg = (cfg && cfg.enabled) ? computeClockAngleDeg(ctx.nowMs, cfg) : 0;

  const bus: Bus = {
    ...(prev ?? {}),
    clock: { deg },
  };
  return bus;
}
