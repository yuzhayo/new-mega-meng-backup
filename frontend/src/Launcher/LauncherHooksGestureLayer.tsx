// File: src/Launcher/LauncherHooksGestureLayer.tsx
// Overlay fullscreen transparan untuk menangkap gesture pointer.
// Tidak mengandung logic triple-tap; cukup meneruskan event ke parent.
// Pakai barengan dengan useTripleTapToggle() dari LauncherHooks3taps.ts.

import * as React from "react";

export type GestureLayerProps = {
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number; // default 40
};

export function GestureLayer({
  onPointerDown,
  className,
  style,
  zIndex = 40,
}: GestureLayerProps) {
  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Biar nggak select text atau trigger gesture default
      e.preventDefault();
      e.stopPropagation();
      onPointerDown?.(e);
    },
    [onPointerDown]
  );

  return (
    <div
      className={className}
      onPointerDown={handlePointerDown}
      style={{
        position: "absolute",
        inset: 0,
        zIndex,
        pointerEvents: "auto",
        background: "transparent",
        touchAction: "manipulation",
        userSelect: "none",
        ...style,
      }}
      aria-label="gesture-layer"
    />
  );
}
