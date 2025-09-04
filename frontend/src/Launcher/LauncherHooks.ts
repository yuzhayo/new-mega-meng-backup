// File: src/Launcher/LauncherHooks.ts
// Aggregator hooks & gesture components untuk Launcher.
// Import dari sini saja biar konsisten, anak-anaknya bebas kamu tambah nanti.

export { useTripleTapToggle } from "./LauncherHooks3taps";
export type { TripleTapOptions } from "./LauncherHooks3taps";

export { GestureLayer } from "./LauncherHooksGestureLayer";
export type { GestureLayerProps } from "./LauncherHooksGestureLayer";

// Slot masa depan (biar gak utak-atik import di tempat lain):
// export { useLongPress } from "./LauncherHooksLongPress";
// export { usePinch } from "./LauncherHooksPinch";
// export { GestureOverlay } from "./LauncherHooksOverlay";
