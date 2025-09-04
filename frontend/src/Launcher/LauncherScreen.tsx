// File: src/Launcher/LauncherScreen.tsx
// Screen entry: mount Origin + Time + Hub + gesture. Dotmark bisa OFF/DEV/ALWAYS.

import React from "react";
import LauncherScreenHub from "./LauncherScreenHub";
import { useSize, useOriginState } from "./LauncherUtilOrigin";
import { TimeDriverProvider } from "./LauncherUtilTime";
import { AppConfig } from "./LauncherConfig";
import { validateConfig } from "./LauncherConfigValidator";

import { useTripleTapToggle, GestureLayer } from "./LauncherHooks";
import LauncherBtn from "./LauncherBtn";

// --- DOTMARK TOGGLE ---
type DotmarkMode = "always" | "dev" | "off";
// "always" = selalu tampil
// "dev"    = tampil hanya saat triple-tap aktif
// "off"    = mati total
const DOTMARK_MODE: DotmarkMode = "off"; // <-- hidden sesuai permintaan

export default function LauncherScreen() {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const size = useSize(rootRef);
  const origin = useOriginState(size);

  const [cfg, setCfg] = React.useState(() => validateConfig(AppConfig));

  // Triple-tap: toggle tombol kecil (sekadar dev affordance)
  const { show, onPointerDown } = useTripleTapToggle();

  // Hot-reload config saat file LauncherConfig berubah (Vite)
  React.useEffect(() => {
    if (import.meta && (import.meta as any).hot) {
      (import.meta as any).hot.accept("./LauncherConfig", (mod: any) => {
        try {
          const next = validateConfig(mod.AppConfig);
          setCfg(next);
          console.info("[Launcher] Config hot-reloaded");
        } catch (e) {
          console.warn("[Launcher] Config validation failed:", e);
        }
      });
    }
  }, []);

  const showDot =
    DOTMARK_MODE === "always" || (DOTMARK_MODE === "dev" && show);

  return (
    <div ref={rootRef} className="relative w-full h-screen bg-black text-white overflow-hidden">
      <TimeDriverProvider>
        <LauncherScreenHub config={cfg} origin={origin} />
      </TimeDriverProvider>

      {/* Dotmark pusat layar */}
      {showDot && (
        <div
          aria-label="dotmark"
          style={{
            position: "absolute",
            left: origin.centerX,
            top: origin.centerY,
            width: 1,
            height: 1,
            background: "#28eb49",
            borderRadius: "9999px",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 999,
            opacity: 0.8,
          }}
        />
      )}

      {/* Gesture overlay: triple-tap anywhere to toggle BTN */}
      <GestureLayer onPointerDown={onPointerDown} zIndex={40} />

      {/* Placeholder button (muncul setelah triple-tap) */}
      {show && <LauncherBtn label="LAUNCHER" corner="center" zIndex={60} />}
    </div>
  );
}
