// File: src/Launcher/LauncherLogic5ImageAngle.ts
// Rumah 5: Image Angle (Logic-2A). Pure, tanpa React/state.
// Input: cfg.l2a, Bus.pos { centerPx, scalePx }, Bus.image.natural.
// Output: Bus.angle { rotation2ADeg, originPct, basePx, tipPx }.
// Catatan:
// - align:"vertical" = paksa vektor base→tip menghadap ke ATAS (90°).
// - align:"axis" belum punya sumbu eksternal di fase ini → fallback ke "vertical".
// - pivot:"center" → transform-origin 50% 50% ; "base" → transform-origin di posisi base.
//
// Asumsi skala:
// - scalePx = tinggi gambar tertampil (px).
// - halfH_display = scalePx / 2; halfW_display = halfH_display * (natural.w / natural.h).

import type { Bus, FrameCtx, LayerConfig, Point, PointPct, Size } from "./LauncherHubTypes";
import { norm360, toDeg } from "./LauncherUtilMath";
import { UnitsImpl } from "./LauncherUtilUnits";

function halfDisplayDims(natural: Size, scalePx: number) {
  const halfH = Math.max(0, scalePx) * 0.5;
  const halfW = natural.h > 0 ? halfH * (natural.w / natural.h) : halfH;
  return { halfW, halfH };
}

// map local pct (-200..200) ke offset px relatif pusat gambar, skala display
function localPctToDisplayOffset(xPct: number, yPct: number, natural: Size, scalePx: number): Point {
  // gunakan util lokal untuk natural px, lalu skala ke display
  const localPx = UnitsImpl.imgLocalPctToPx(xPct, yPct, natural); // relatif pusat natural
  const s = natural.h > 0 ? scalePx / natural.h : 1;              // skala tinggi
  return { x: localPx.x * s, y: localPx.y * s };
}

// hitung sudut vektor base→tip (0°=kanan, 90°=atas) dalam ruang display px
function angleOfBaseToTip(baseOff: Point, tipOff: Point): number {
  const vx = tipOff.x - baseOff.x;
  const vy = tipOff.y - baseOff.y;
  if (vx === 0 && vy === 0) return 0;
  // y ke bawah positif → pakai atan2(-(vy), vx) agar 90° = atas
  return norm360(toDeg(Math.atan2(-vy, vx)));
}

// rotasi CLOCKWISE di ruang display (cocok dengan CSS rotate(+deg))
function rotateAroundCW(p: Point, origin: Point, deg: number): Point {
  const rad = (deg * Math.PI) / 180;
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // rotasi searah jarum jam:
  const rx = dx * cos + dy * sin;
  const ry = -dx * sin + dy * cos;
  return { x: origin.x + rx, y: origin.y + ry };
}

// transform-origin (percent) dari pivot
function computeOriginPct(pivot: "center" | "base", baseLocalPct: PointPct): PointPct {
  if (pivot === "base") {
    // map local [-200..200] → CSS percent: 50 + (v/2)
    return { x: 50 + baseLocalPct.x * 0.5, y: 50 + baseLocalPct.y * 0.5 };
  }
  return { x: 50, y: 50 };
}

/** Jalankan Rumah-5 untuk 1 layer. */
export function logic5ImageAngle(prev: Bus | undefined): Bus {
  const layerCfg: LayerConfig | undefined = prev?.layer?.cfg;
  const l2a = layerCfg?.l2a;
  const centerPx = prev?.pos?.centerPx;
  const scalePx = prev?.pos?.scalePx ?? 0;
  const natural = prev?.image?.natural;

  // fallback aman bila input kurang
  if (!l2a || !l2a.enabled || !centerPx || !natural) {
    const bus: Bus = {
      ...(prev ?? {}),
      angle: {
        rotation2ADeg: 0,
        originPct: { x: 50, y: 50 },
        basePx: centerPx ?? { x: 0, y: 0 },
        tipPx: centerPx ?? { x: 0, y: 0 },
      },
    };
    return bus;
  }

  // 1) Hitung offset base/tip di ruang display (px) relatif pusat gambar
  const baseOff0 = localPctToDisplayOffset(l2a.base.xPct, l2a.base.yPct, natural, scalePx);
  const tipOff0  = localPctToDisplayOffset(l2a.tip.xPct,  l2a.tip.yPct,  natural, scalePx);

  // 2) Sudut vektor base→tip sebelum rotasi
  const currentDeg = angleOfBaseToTip(baseOff0, tipOff0);

  // 3) Target orientasi
  const align = l2a.align === "axis" ? "vertical" : "vertical"; // fallback ke vertical di fase ini
  const targetDeg = 90; // atas
  const rotation2ADeg = norm360(targetDeg - currentDeg);

  // 4) Transform-origin percent dari pivot
  const originPct = computeOriginPct(l2a.pivot || "center", l2a.base);

  // 5) Rotasi offset mengelilingi pivot (center atau base)
  const originOff =
    l2a.pivot === "base" ? baseOff0 : { x: 0, y: 0 };

  const baseOffR = rotateAroundCW(baseOff0, originOff, rotation2ADeg);
  const tipOffR  = rotateAroundCW(tipOff0,  originOff, rotation2ADeg);

  // 6) Konversi ke koordinat layar absolut (px), tambahkan center
  const basePx: Point = { x: centerPx.x + baseOffR.x, y: centerPx.y + baseOffR.y };
  const tipPx:  Point = { x: centerPx.x + tipOffR.x,  y: centerPx.y + tipOffR.y };

  const bus: Bus = {
    ...(prev ?? {}),
    angle: {
      rotation2ADeg,
      originPct,
      basePx,
      tipPx,
    },
  };

  return bus;
}
