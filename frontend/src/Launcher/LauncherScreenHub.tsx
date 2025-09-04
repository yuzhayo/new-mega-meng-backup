// File: src/Launcher/LauncherScreenHub.tsx
// Orchestrator (Hub): jalankan pipeline Rumah 1→8 per layer, kelola token spin/orbit/FPS,
// susun transform final, dan render background + layer. Core lama tidak dipakai.

import React from "react";
import type {
  LauncherConfigRoot,
  LayerConfig,
  BgLayer,
  Origin,
  Size,
  Bus,
  FrameCtx,
  SpinToken,
  OrbitToken,
  FpsGate,
} from "./LauncherHubTypes";

import { createUnits } from "./LauncherUtilUnits";
import { useTime } from "./LauncherUtilTime";

// Rumah logic
import { logic1LayerProducer } from "./LauncherLogic1LayerProducer";
import { logic2LayerMapping } from "./LauncherLogic2LayerMapping";
import { logic3ImageMapping } from "./LauncherLogic3ImageMapping";
import { logic4ImagePosition } from "./LauncherLogic4ImagePosition";
import { logic5ImageAngle } from "./LauncherLogic5ImageAngle";
import { logic6Spin, shouldRebaseSpin, makeSpinToken } from "./LauncherLogic6Spin";
import {
  logic7Orbit,
  shouldRebaseOrbit,
  makeOrbitToken,
  deriveOrbitInitParams,
} from "./LauncherLogic7Orbit";
import { logic8Clock } from "./LauncherLogic8Clock";

import { DEFAULT_MAX_FPS } from "./LauncherHubTypes";

/* =======================================================================
   Helpers
   ======================================================================= */
function byZ(a: { zHint?: number }, b: { zHint?: number }) {
  return (a.zHint || 0) - (b.zHint || 0);
}

function bgByZ(a: BgLayer, b: BgLayer) {
  return (a.z || 0) - (b.z || 0);
}

function layerMaxFps(l: LayerConfig): number {
  const a = l.spin?.enabled ? (l.spin.maxFps || DEFAULT_MAX_FPS) : DEFAULT_MAX_FPS;
  const b = l.orbit?.enabled ? (l.orbit.maxFps || DEFAULT_MAX_FPS) : DEFAULT_MAX_FPS;
  return Math.max(15, Math.min(DEFAULT_MAX_FPS, Math.min(a, b)));
}

// geometry key untuk rebase orbit saat center/base/tip berubah
function geomKey(bus: Bus): string {
  const c = bus.pos?.centerPx;
  const b = bus.angle?.basePx;
  const t = bus.angle?.tipPx;
  return [
    c ? `${c.x.toFixed(2)}:${c.y.toFixed(2)}` : "_",
    b ? `${b.x.toFixed(2)}:${b.y.toFixed(2)}` : "_",
    t ? `${t.x.toFixed(2)}:${t.y.toFixed(2)}` : "_",
  ].join("|");
}

/* =======================================================================
   Komponen: Hub
   ======================================================================= */
type Props = {
  config: LauncherConfigRoot; // sudah divalidasi di luar
  origin: Origin; // dari useOriginState()
};

export default function LauncherScreenHub({ config, origin }: Props) {
  const { now } = useTime();
  const units = React.useMemo(() => createUnits(), []);

  // Natural size per layer (di-update saat img onLoad)
  const [naturalMap, setNaturalMap] = React.useState<Record<string, Size>>({});

  // Token kontinuitas & gate per layer
  const spinTokens = React.useRef<Record<string, SpinToken | null>>({});
  const prevSpinCfg = React.useRef<Record<string, LayerConfig["spin"] | undefined>>({});

  const orbitTokens = React.useRef<Record<string, OrbitToken | null>>({});
  const prevOrbitCfg = React.useRef<Record<string, LayerConfig["orbit"] | undefined>>({});
  const prevGeomKey = React.useRef<Record<string, string>>({});

  const fpsGates = React.useRef<Record<string, FpsGate>>({});

  // Sorted arrays
  const bgs = React.useMemo(() => [...(config.backgrounds || [])].sort(bgByZ), [config.backgrounds]);
  const layers = React.useMemo(() => [...(config.layers || [])].sort(byZ), [config.layers]);

  // FrameCtx factory per layer
  const makeCtx = React.useCallback(
    (layerId: string): FrameCtx => {
      const natural = naturalMap[layerId] || null;
      return { nowMs: now, origin, units, natural };
    },
    [now, origin, units, naturalMap]
  );

  /* -----------------------------------------------------------------------
     Render Backgrounds (sederhana: posisi pct100, scale vmin)
     ----------------------------------------------------------------------- */
  const bgEls = bgs.map((bg) => {
    const pos = units.screenPct100ToPx(bg.xPct, bg.yPct, origin);
    const h = units.vminPctToPx(bg.scalePct, origin);

    const style: React.CSSProperties = {
      position: "absolute",
      left: pos.x,
      top: pos.y,
      transform: "translate3d(-50%,-50%,0)",
      height: `${h}px`,
      width: "auto",
      opacity: (bg.opacityPct ?? 100) / 100,
      zIndex: bg.z ?? 0,
      objectFit:
        bg.fit === "cover" ? "cover" : bg.fit === "fill" ? "fill" : bg.fit === "none" ? "none" : "contain",
      pointerEvents: "none",
      userSelect: "none",
    };
    return <img key={`bg:${bg.id}`} src={bg.src} style={style} alt={bg.id} />;
  });

  /* -----------------------------------------------------------------------
     Render Layers
     ----------------------------------------------------------------------- */
  const layerEls = layers.map((layer, index) => {
    if (!layer.enabled || !layer.path) return null;

    const ctx = makeCtx(layer.id);

    // Gate FPS per-layer
    const gate = fpsGates.current[layer.id] || (fpsGates.current[layer.id] = { lastDrawMs: 0 });
    const maxFps = layerMaxFps(layer);
    const minDelta = 1000 / maxFps;
    const canAdvance = now - gate.lastDrawMs >= minDelta;

    // PIPELINE: Rumah 1→8
    let bus: Bus | undefined = undefined;

    // 1) Produce
    bus = logic1LayerProducer(bus, layer, index);

    // 2) LayerMapping
    bus = logic2LayerMapping(bus, ctx);

    // 3) ImageMapping
    bus = logic3ImageMapping(bus, ctx);

    // 4) Position (Logic-2)
    bus = logic4ImagePosition(bus, ctx);

    // 5) Angle (Logic-2A)
    bus = logic5ImageAngle(bus);

    // 6) Spin (Logic-3) — rebase token jika perlu
    {
      const pCfg = prevSpinCfg.current[layer.id];
      const nCfg = layer.spin;
      if (shouldRebaseSpin(pCfg, nCfg)) {
        // capture fase berjalan (jika ada)
        const prev = spinTokens.current[layer.id];
        const currDeg = prev ? logic6Spin(bus, ctx, prev).spin!.deg : 0;
        spinTokens.current[layer.id] = makeSpinToken(now, currDeg);
        prevSpinCfg.current[layer.id] = nCfg;
      }
      bus = logic6Spin(bus, ctx, spinTokens.current[layer.id]);
    }

    // 7) Orbit (Logic-3A) — rebase token jika config/geometry berubah
    {
      const pCfg = prevOrbitCfg.current[layer.id];
      const nCfg = layer.orbit;
      const gKey = geomKey(bus!);

      const needRebase =
        shouldRebaseOrbit(pCfg, nCfg) || prevGeomKey.current[layer.id] !== gKey;

      if (nCfg?.enabled) {
        if (needRebase || !orbitTokens.current[layer.id]) {
          const { rPx, theta0Deg, validBlue } = deriveOrbitInitParams(ctx, bus!, nCfg);
          orbitTokens.current[layer.id] = makeOrbitToken(now, rPx, theta0Deg, validBlue);
          prevOrbitCfg.current[layer.id] = nCfg;
          prevGeomKey.current[layer.id] = gKey;
        }
      } else {
        orbitTokens.current[layer.id] = null;
        prevOrbitCfg.current[layer.id] = nCfg;
        prevGeomKey.current[layer.id] = gKey;
      }

      bus = logic7Orbit(bus, ctx, orbitTokens.current[layer.id]);
    }

    // 8) Clock
    bus = logic8Clock(bus, ctx);

    // Compose transform
    const center = bus.pos?.centerPx || { x: 0, y: 0 };
    const scalePx = bus.pos?.scalePx || 0;
    const rotDeg = (bus.angle?.rotation2ADeg || 0) + (bus.spin?.deg || 0) + (bus.clock?.deg || 0);
    const dx = bus.orbit?.dx || 0;
    const dy = bus.orbit?.dy || 0;

    // Update gate timestamp bila advance
    if (canAdvance) {
      gate.lastDrawMs = now;
    }

    // transform-origin (percent) dari rumah 5
    const originPct = bus.angle?.originPct || { x: 50, y: 50 };

    const style: React.CSSProperties = {
      position: "absolute",
      left: center.x,
      top: center.y,
      zIndex: layer.zHint || 0,
      pointerEvents: "none",
      userSelect: "none",
      height: `${scalePx}px`,
      width: "auto",
      transformOrigin: `${originPct.x}% ${originPct.y}%`,
      transform: `translate3d(-50%,-50%,0) translate3d(${dx}px, ${dy}px, 0) rotate(${rotDeg}deg)`,
      willChange: "transform",
      backfaceVisibility: "hidden",
      imageRendering: "auto",
    };

    return (
      <img
        key={`layer:${layer.id}`}
        src={layer.path}
        alt={layer.id}
        style={style}
        onLoad={(e) => {
          const iw = e.currentTarget.naturalWidth || 0;
          const ih = e.currentTarget.naturalHeight || 0;
          if (iw > 0 && ih > 0) {
            setNaturalMap((m) => {
              const prev = m[layer.id];
              if (prev && prev.w === iw && prev.h === ih) return m;
              return { ...m, [layer.id]: { w: iw, h: ih } };
            });
          }
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Backgrounds */}
      {bgEls}

      {/* Layers */}
      {layerEls}
    </div>
  );
}
