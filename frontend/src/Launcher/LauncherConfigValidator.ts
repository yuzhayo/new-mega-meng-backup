// File: src/Launcher/LauncherConfigValidator.ts
// Validasi & sanitasi config: clamp angka, isi default minimal, dan warning ringan.
// Tidak mengimpor modul React.

import {
  LauncherConfigRoot,
  LayerConfig,
  L2Config,
  L2AConfig,
  SpinConfig,
  OrbitConfig,
  ClockConfig,
  BgLayer,
} from "./LauncherConfigSchema";
import { DEFAULT_MAX_FPS, MIN_FPS, ORBIT_EPS } from "./LauncherHubTypes";
import { DEFAULTS, DefaultL2, DefaultL2A, DefaultSpin, DefaultOrbit, DefaultClock, DefaultEffect } from "./LauncherConfigDefaults";
import { clamp, isFiniteNumber } from "./LauncherUtilMath";

/* =========================
   Helpers clamp & merge
   ========================= */
const clamp01 = (v: number) => clamp(v, 0, 1);
const clampPct100 = (v: number) => clamp(v, 0, 100);
const clampPct200 = (v: number) => clamp(v, -200, 200);
const clampPosPct = (v: number) => clamp(v, 1, 400);
const clampOpacity = (v: number) => clamp(v, 0, 100);
const clampZ = (v: number) => clamp(v, 0, 100);
const clampZBg = (v: number) => clamp(v, 0, 10);
const clampFps = (v: number) => clamp(Math.round(v), MIN_FPS, DEFAULT_MAX_FPS);

function finiteOr<T>(v: unknown, fb: T): number | T {
  return isFiniteNumber(v) ? (v as number) : fb;
}
function pick<T>(v: T | undefined, fb: T): T { return v === undefined ? fb : v; }

/* =========================
   Validate backgrounds
   ========================= */
function validateBackground(b: BgLayer): BgLayer {
  return {
    id: String(b.id || "BG"),
    src: String(b.src || ""),
    xPct: clampPct100(finiteOr(b.xPct, 50)),
    yPct: clampPct100(finiteOr(b.yPct, 50)),
    scalePct: clampPosPct(finiteOr(b.scalePct, 100)),
    opacityPct: clampOpacity(finiteOr(b.opacityPct ?? 100, 100)),
    z: clampZBg(finiteOr(b.z ?? 0, 0)),
    fit: (b.fit ?? "contain"),
  };
}

/* =========================
   Block validators (per logic)
   ========================= */
function validateL2(x?: L2Config): L2Config | undefined {
  if (!x) return undefined;
  const v: L2Config = {
    enabled: !!x.enabled,
    clampMode: x.clampMode === "bounds" ? "bounds" : "none",
    centerMode: x.centerMode === "extendedPct" ? "extendedPct" : "pct100",
    center: {
      xPct: x.centerMode === "extendedPct" ? clampPct200(finiteOr(x.center?.xPct, 0)) : clampPct100(finiteOr(x.center?.xPct, 50)),
      yPct: x.centerMode === "extendedPct" ? clampPct200(finiteOr(x.center?.yPct, 0)) : clampPct100(finiteOr(x.center?.yPct, 50)),
    },
    scalePct: clampPosPct(finiteOr(x.scalePct, DefaultL2.scalePct)),
    minScalePct: clampPosPct(finiteOr(x.minScalePct, DefaultL2.minScalePct)),
    maxScalePct: clampPosPct(finiteOr(x.maxScalePct, DefaultL2.maxScalePct)),
    marginPct: clampPct100(finiteOr(x.marginPct, DefaultL2.marginPct)),
    rounding: x.rounding === "floor" || x.rounding === "ceil" ? x.rounding : "round",
  };
  if (v.minScalePct > v.maxScalePct) {
    const t = v.minScalePct; v.minScalePct = v.maxScalePct; v.maxScalePct = t;
    console.warn("[cfg] l2.minScalePct > maxScalePct; values swapped.");
  }
  return v;
}

function validateL2A(x?: L2AConfig): L2AConfig | undefined {
  if (!x) return undefined;
  return {
    enabled: !!x.enabled,
    rotationMode: "anchored",
    base: { xPct: clampPct200(finiteOr(x.base?.xPct, DefaultL2A.base.xPct)),
            yPct: clampPct200(finiteOr(x.base?.yPct, DefaultL2A.base.yPct)) },
    tip:  { xPct: clampPct200(finiteOr(x.tip?.xPct, DefaultL2A.tip.xPct)),
            yPct: clampPct200(finiteOr(x.tip?.yPct, DefaultL2A.tip.yPct)) },
    pivot: x.pivot === "base" ? "base" : "center",
    align: x.align === "axis" ? "axis" : "vertical",
  };
}

function validateSpin(x?: SpinConfig): SpinConfig | undefined {
  if (!x) return undefined;
  return {
    enabled: !!x.enabled,
    rpm: Math.max(0, finiteOr(x.rpm, DefaultSpin.rpm) as number),
    direction: x.direction === "ccw" ? "ccw" : "cw",
    maxFps: clampFps(finiteOr(x.maxFps, DefaultSpin.maxFps) as number),
    easing: "linear",
    pivotSource: x.pivotSource === "logic2A-base" ? "logic2A-base" : "logic2-center",
  };
}

function validateOrbit(x?: OrbitConfig): OrbitConfig | undefined {
  if (!x) return undefined;

  // orbitPoint
  const op = x.orbitPoint === "dotmark"
    ? "dotmark"
    : (x.orbitPoint && isFiniteNumber((x.orbitPoint as any).xPct) && isFiniteNumber((x.orbitPoint as any).yPct))
      ? { xPct: clampPct100((x.orbitPoint as any).xPct), yPct: clampPct100((x.orbitPoint as any).yPct) }
      : "dotmark";

  // line
  let line: OrbitConfig["line"] = "none";
  const ln = x.line as any;
  if (ln === "center" || ln === "base" || ln === "tip" || ln === "none") {
    line = ln;
  } else if (ln && isFiniteNumber(ln.xPct) && isFiniteNumber(ln.yPct)) {
    line = { xPct: clampPct100(ln.xPct), yPct: clampPct100(ln.yPct) };
  } else {
    line = "none";
  }

  const startPhase = (x.startPhase === "auto" || !isFiniteNumber(x.startPhase)) ? "auto" : ((x.startPhase as number) % 360);

  return {
    enabled: !!x.enabled,
    rpm: Math.max(0, finiteOr(x.rpm, DefaultOrbit.rpm) as number),
    direction: x.direction === "ccw" ? "ccw" : "cw",
    radiusPct: Math.max(0, finiteOr(x.radiusPct, DefaultOrbit.radiusPct) as number),
    orbitPoint: op,
    line,
    startPhase,
    maxFps: clampFps(finiteOr(x.maxFps, DefaultOrbit.maxFps) as number),
    showLine: !!x.showLine,
  };
}

function validateClock(x?: ClockConfig): ClockConfig | undefined {
  if (!x) return undefined;
  const sync = x.sync === "utc" ? "utc" : "device";
  let utc = x.utcOffsetMinutes;
  if (sync === "utc") {
    if (!isFiniteNumber(utc)) {
      console.warn("[cfg] clock.sync='utc' but utcOffsetMinutes missing. Fallback 0.");
      utc = 0;
    }
  } else {
    utc = undefined;
  }
  const role = x.role === "hour" || x.role === "second" ? x.role : "minute";
  const secondMode = role === "second" && x.secondMode === "tick" ? "tick" : "smooth";
  const hourStyle = x.hourStyle === 24 ? 24 : 12;
  const offsetDeg = clamp((finiteOr(x.offsetDeg, 0) as number), -180, 180);

  return {
    enabled: !!x.enabled,
    sync,
    utcOffsetMinutes: utc,
    role,
    secondMode,
    hourStyle,
    offsetDeg,
  };
}

/* =========================
   Validate layer
   ========================= */
function validateLayer(raw: LayerConfig, index: number): LayerConfig {
  const id = String(raw.id || `layer-${index}`);
  const path = String(raw.path || "");
  const enabled = !!raw.enabled && !!path; // path kosong → paksa off
  const zHint = clampZ(finiteOr(raw.zHint, 0) as number);

  const l2 = validateL2(raw.l2 ?? DefaultL2);
  const l2a = validateL2A(raw.l2a);
  const spin = validateSpin(raw.spin);
  const orbit = validateOrbit(raw.orbit);
  const clock = validateClock(raw.clock);
  const effect = raw.effect ? {
    enabled: !!raw.effect.enabled,
    visibility: raw.effect.visibility === "hidden" ? "hidden" : "visible",
    opacityPct: clampOpacity(finiteOr(raw.effect.opacityPct, 100) as number),
    blend: raw.effect.blend ?? "normal",
    blurPx: Math.max(0, finiteOr(raw.effect.blurPx, 0) as number),
    brightnessPct: clampPct100(finiteOr(raw.effect.brightnessPct, 100) as number) + 0, // 0..100 safe default
    contrastPct: clampPct100(finiteOr(raw.effect.contrastPct, 100) as number) + 0,
    saturatePct: clampPct100(finiteOr(raw.effect.saturatePct, 100) as number) + 0,
    grayscalePct: clampPct100(finiteOr(raw.effect.grayscalePct, 0) as number),
    hueRotateDeg: clamp(finiteOr(raw.effect.hueRotateDeg, 0) as number, 0, 360),
  } : undefined;

  // Warning ringan anti-jitter
  if ((spin?.enabled || orbit?.enabled || clock?.enabled) && l2 && l2.clampMode !== "none") {
    console.warn(`[cfg] Layer "${id}": animations enabled but l2.clampMode != "none". This may cause jitter.`);
  }

  return { id, path, enabled, zHint, l2, l2a, spin, orbit, clock, effect };
}

/* =========================
   Entry: validate whole config
   ========================= */
export function validateConfig(root: LauncherConfigRoot): LauncherConfigRoot {
  const backgrounds = Array.isArray(root.backgrounds) ? root.backgrounds.map(validateBackground) : [];
  const layersRaw = Array.isArray(root.layers) ? root.layers : [];

  // de-duplicate layer ids (soft)
  const seen = new Set<string>();
  const layers = layersRaw.map((l, i) => {
    let sane = validateLayer(l, i);
    if (seen.has(sane.id)) {
      const newId = `${sane.id}.${i}`;
      console.warn(`[cfg] Duplicate layer id "${sane.id}" → renamed to "${newId}".`);
      sane = { ...sane, id: newId };
    }
    seen.add(sane.id);
    return sane;
  });

  return {
    schemaVersion: String(root.schemaVersion || "2.0.0"),
    meta: {
      app: String(root.meta?.app || "Launcher"),
      build: String(root.meta?.build || new Date().toISOString()),
      author: root.meta?.author ? String(root.meta.author) : undefined,
    },
    backgrounds,
    layers,
    // defaults dipakai opsional; tidak dipaksa merge ke layer agar eksplisit
    defaults: root.defaults ? { ...DEFAULTS, ...root.defaults } : DEFAULTS,
  };
}
