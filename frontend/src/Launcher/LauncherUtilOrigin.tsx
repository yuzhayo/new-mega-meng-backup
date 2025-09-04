// File: src/Launcher/LauncherUtilOrigin.tsx
// Hook ukuran viewport container + origin (pusat layar) untuk pipeline.
// Dipakai oleh screen parent untuk memberi Origin ke Hub.

import React from "react";
import type { Origin } from "./LauncherHubTypes";

/* ==============================
   Hook: useSize(ref) → { width, height }
   ============================== */
export function useSize<T extends HTMLElement>(ref: React.RefObject<T | null>): { width: number; height: number } {
  const [size, setSize] = React.useState<{ width: number; height: number }>({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      // clientWidth/Height cukup, tidak perlu layout mahal
      const w = el.clientWidth || 0;
      const h = el.clientHeight || 0;
      setSize((prev) => (prev.width !== w || prev.height !== h ? { width: w, height: h } : prev));
    };

    // Initial measure
    measure();

    // ResizeObserver jika tersedia
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    }

    // Fallback global events
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      if (ro) {
        try {
          ro.disconnect();
        } catch {}
        ro = null;
      }
    };
  }, [ref]);

  return size;
}

/* ==============================
   Hook: useOriginState(size) → Origin
   ============================== */
export function useOriginState(size: { width: number; height: number }): Origin {
  const { width, height } = size;
  return React.useMemo<Origin>(() => {
    const w = Number.isFinite(width) ? width : 0;
    const h = Number.isFinite(height) ? height : 0;
    return {
      width: w,
      height: h,
      centerX: w * 0.5,
      centerY: h * 0.5,
    };
  }, [width, height]);
}
