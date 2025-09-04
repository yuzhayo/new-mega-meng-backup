// File: src/Launcher/LauncherLogic6Spin.ts
// Rumah 6: Spin (Logic-3). Pure, tanpa React/state di dalam rumah.
// Input: nowMs, cfg.spin, SpinToken (dipegang Hub).
// Output: bus.spin.deg (derajat, searah jarum jam).
//
// Catatan:
// - Direction "cw" = sudut positif (sesuai CSS rotate(+deg) yang tampak searah jarum jam).
// - Token kontinuitas (t0Ms, phase0Deg) DIKELOLA OLEH HUB, bukan di sini.

import type { Bus, FrameCtx, LayerConfig, SpinToken } from "./LauncherHubTypes";
import { norm360 } from "./LauncherUtilMath";

function rpmToDegPerMs(rpm: number, dir: "cw" | "ccw"): number {
  const sign = dir === "ccw" ? -1 : 1;
  // 360 deg per putaran, rpm per menit → per ms: (rpm * 360) / 60000
  return sign * (rpm * 360) / 60000;
}

/** Hitung sudut spin saat ini. Jika cfg/tok tidak valid atau disabled → 0. */
export function spinAngleDeg(nowMs: number, cfg: LayerConfig["spin"] | undefined, token: SpinToken | null | undefined): number {
  if (!cfg || !cfg.enabled) return 0;
  const rpm = Math.max(0, cfg.rpm || 0);
  if (rpm <= 0) return 0;
  if (!token || !token.inited) return 0;

  const dpsMs = rpmToDegPerMs(rpm, cfg.direction || "cw");
  const dt = Math.max(0, nowMs - token.t0Ms);
  const deg = token.phase0Deg + dpsMs * dt;
  return norm360(deg);
}

/** Rumah-6 executor: tulis bus.spin.deg berdasarkan now + cfg + token. */
export function logic6Spin(prev: Bus | undefined, ctx: FrameCtx, token: SpinToken | null | undefined): Bus {
  const cfg = prev?.layer?.cfg?.spin;
  const deg = spinAngleDeg(ctx.nowMs, cfg, token);

  const bus: Bus = {
    ...(prev ?? {}),
    spin: { deg },
  };
  return bus;
}

/* ==============================
   Helper opsional untuk Hub
   ============================== */

/** Apakah perlu rebase token karena parameter kunci berubah. */
export function shouldRebaseSpin(prevCfg?: LayerConfig["spin"], nextCfg?: LayerConfig["spin"]): boolean {
  const p = prevCfg, n = nextCfg;
  if (!!(p?.enabled) !== !!(n?.enabled)) return true;
  if ((p?.rpm || 0) !== (n?.rpm || 0)) return true;
  if ((p?.direction || "cw") !== (n?.direction || "cw")) return true;
  return false;
}

/** Buat token baru dengan fase awal tertentu pada waktu now. */
export function makeSpinToken(nowMs: number, phase0Deg: number): SpinToken {
  return { t0Ms: nowMs, phase0Deg: norm360(phase0Deg), inited: true };
}
