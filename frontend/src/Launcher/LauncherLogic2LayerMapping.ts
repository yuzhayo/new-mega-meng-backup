// File: src/Launcher/LauncherLogic2LayerMapping.ts
// Rumah 2: Layer Mapping (viewport & vmin). Pure, tanpa React/state.

import type { Bus, FrameCtx } from "./LauncherHubTypes";

/** Jalankan Rumah-2: hitung vw, vh, vmin, dan dotmark (pusat layar) dalam px. */
export function logic2LayerMapping(prev: Bus | undefined, ctx: FrameCtx): Bus {
  const { origin } = ctx;
  const vw = Math.max(0, origin.width | 0);
  const vh = Math.max(0, origin.height | 0);
  const vmin = Math.min(vw || 0, vh || 0);

  const bus: Bus = {
    ...(prev ?? {}),
    map: {
      vw,
      vh,
      vmin,
      dotmark: { x: origin.centerX, y: origin.centerY },
    },
  };

  return bus;
}
