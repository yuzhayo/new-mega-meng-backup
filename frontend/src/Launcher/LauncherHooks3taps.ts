// File: src/Launcher/LauncherHooks3taps.ts
// Hook triple-tap toggle mandiri. Tidak bergantung Core.
// Pakai dengan GestureLayer: teruskan onPointerDown dari hook ini.

import * as React from "react";

export type TripleTapOptions = {
  windowMs?: number;   // jendela waktu untuk 3 tap berturut (default 600ms)
  radiusPx?: number;   // jarak maksimum antar tap agar dianggap satu rangkaian (default 24px)
  onChange?: (show: boolean) => void; // callback saat toggle
};

export function useTripleTapToggle(opts?: TripleTapOptions) {
  const windowMs = Math.max(100, Math.min(2000, opts?.windowMs ?? 600));
  const radiusPx = Math.max(1, Math.min(64, opts?.radiusPx ?? 24));

  const [show, setShow] = React.useState(false);
  const tapsRef = React.useRef<number[]>([]); // timestamp ms
  const lastPosRef = React.useRef<{ x: number; y: number } | null>(null);

  // helper jarak kuadrat (hindari sqrt)
  const dist2 = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  };

  const flushOld = (now: number) => {
    const arr = tapsRef.current;
    while (arr.length && now - arr[0] > windowMs) arr.shift();
  };

  const toggle = React.useCallback(() => {
    setShow((s) => {
      const next = !s;
      opts?.onChange?.(next);
      return next;
    });
  }, [opts]);

  const onPointerDown = React.useCallback((e: React.PointerEvent) => {
    const now = performance.now();
    flushOld(now);

    const p = { x: e.clientX, y: e.clientY };
    const lp = lastPosRef.current;
    if (!lp || dist2(p, lp) <= radiusPx * radiusPx) {
      // dalam radius: lanjut rangkaian
      tapsRef.current.push(now);
    } else {
      // terlalu jauh: mulai rangkaian baru
      tapsRef.current.length = 0;
      tapsRef.current.push(now);
    }
    lastPosRef.current = p;

    // triple?
    if (tapsRef.current.length >= 3) {
      toggle();
      tapsRef.current.length = 0;
      lastPosRef.current = null;
    }
  }, [radiusPx, toggle]);

  return { show, setShow, onPointerDown };
}
