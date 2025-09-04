// File: src/Launcher/LauncherLogic1LayerProducer.ts
// Rumah 1: Layer Producer
// Normalisasi 1 layer dari config → isi bus.layer. Pure, tanpa state & React.

import type { Bus, LayerConfig } from "./LauncherHubTypes";

/** Jalankan Rumah-1 untuk 1 layer. */
export function logic1LayerProducer(prev: Bus | undefined, layerCfg: LayerConfig, index: number): Bus {
  const enabled = !!layerCfg.enabled && !!layerCfg.path;

  const bus: Bus = {
    ...(prev ?? {}),
    layer: {
      id: String(layerCfg.id || `layer-${index}`),
      path: String(layerCfg.path || ""),
      enabled,
      zHint: Number.isFinite(layerCfg.zHint) ? (layerCfg.zHint as number) : 0,
      cfg: layerCfg, // diasumsikan sudah lewat Validator
    },
  };

  return bus;
}

/** Bantuan: apakah layer siap dirender (sekadar flag awal). */
export function isLayerEnabled(bus: Bus | undefined): boolean {
  return !!bus?.layer?.enabled && !!bus?.layer?.path;
}
