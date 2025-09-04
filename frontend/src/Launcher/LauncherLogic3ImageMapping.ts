// File: src/Launcher/LauncherLogic3ImageMapping.ts
// Rumah 3: Image Mapping (natural size & ruang lokal gambar). Pure.

import type { Bus, FrameCtx, Size } from "./LauncherHubTypes";

function fallbackNatural(n: Size | null | undefined): Size {
  if (!n || !Number.isFinite(n.w) || !Number.isFinite(n.h) || n.w <= 0 || n.h <= 0) {
    return { w: 1, h: 1 }; // aman sementara sampai image load
  }
  return { w: n.w, h: n.h };
}

/** Jalankan Rumah-3: set natural size & penanda ruang lokal. */
export function logic3ImageMapping(prev: Bus | undefined, ctx: FrameCtx): Bus {
  const natural = fallbackNatural(ctx.natural);

  const bus: Bus = {
    ...(prev ?? {}),
    image: {
      natural,
      localSpace: "image-centered",
    },
  };

  return bus;
}
