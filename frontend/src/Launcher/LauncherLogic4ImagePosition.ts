// File: src/Launcher/LauncherLogic4ImagePosition.ts
// Rumah 4: Position & Scale (Logic-2). Pure, tanpa React/state.
// Input: cfg.l2, FrameCtx.origin/units, Bus.map (viewport).
// Output: Bus.pos { centerPx, scalePx }.
// Catatan: anim disarankan clampMode:"none" agar anti-jitter.

import type { Bus, FrameCtx, LayerConfig, Point } from "./LauncherHubTypes";
import { roundBy, clamp, isFiniteNumber } from "./LauncherUtilMath";

function pickCenterPx(l2: LayerConfig["l2"] | undefined, ctx: FrameCtx): Point {
  const { origin, units } = ctx;

  // default center = dotmark (tengah layar)
  let cx = origin.centerX;
  let cy = origin.centerY;

  if (l2 && l2.enabled) {
    const { centerMode = "pct100", center = { xPct: 50, yPct: 50 } } = l2;
    if (centerMode === "extendedPct") {
      const p = units.screenExtendedPctToPx(center.xPct, center.yPct, origin);
      cx = p.x; cy = p.y;
    } else {
      const p = units.screenPct100ToPx(center.xPct, center.yPct, origin);
      cx = p.x; cy = p.y;
    }
  }
  return { x: cx, y: cy };
}

function clampCenterIfNeeded(pt: Point, l2: LayerConfig["l2"] | undefined, ctx: FrameCtx): Point {
  const { origin } = ctx;
  if (!l2 || !l2.enabled || l2.clampMode !== "bounds") return pt;

  // clamp ke area layar dengan marginPct (persen dari lebar/tinggi layar)
  const m = Math.max(0, Math.min(50, (l2.marginPct ?? 0)));
  const minX = (m / 100) * origin.width;
  const maxX = origin.width - minX;
  const minY = (m / 100) * origin.height;
  const maxY = origin.height - minY;

  return {
    x: clamp(pt.x, minX, maxX),
    y: clamp(pt.y, minY, maxY),
  };
}

function pickScalePx(l2: LayerConfig["l2"] | undefined, ctx: FrameCtx): number {
  const { origin, units } = ctx;
  // default scale = 100% vmin
  let scalePct = 100;
  let minPct = 10;
  let maxPct = 400;

  if (l2 && l2.enabled) {
    const s = isFiniteNumber(l2.scalePct) ? (l2.scalePct as number) : 100;
    const sMin = isFiniteNumber(l2.minScalePct) ? (l2.minScalePct as number) : 10;
    const sMax = isFiniteNumber(l2.maxScalePct) ? (l2.maxScalePct as number) : 400;
    // clamp min/max dulu
    const lo = Math.min(sMin, sMax);
    const hi = Math.max(sMin, sMax);
    scalePct = Math.min(hi, Math.max(lo, s));
  }

  return units.vminPctToPx(scalePct, origin);
}

/** Jalankan Rumah-4 untuk 1 layer. */
export function logic4ImagePosition(prev: Bus | undefined, ctx: FrameCtx): Bus {
  const layerCfg = prev?.layer?.cfg;
  const l2 = layerCfg?.l2;

  // 1) Ambil center dalam px sesuai mode
  let center = pickCenterPx(l2, ctx);

  // 2) Clamp center jika diminta
  center = clampCenterIfNeeded(center, l2, ctx);

  // 3) Hitung scale (vmin-based)
  let scalePx = pickScalePx(l2, ctx);

  // 4) Pembulatan opsional
  const rounding = l2?.rounding ?? "round";
  const centerRounded = {
    x: roundBy(rounding, center.x),
    y: roundBy(rounding, center.y),
  };
  scalePx = roundBy(rounding, scalePx);

  const bus: Bus = {
    ...(prev ?? {}),
    pos: {
      centerPx: centerRounded,
      scalePx,
    },
  };

  return bus;
}
