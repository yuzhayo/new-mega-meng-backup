// File: src/Launcher/LauncherBtn.tsx
// Tombol placeholder kecil, bisa ditempatkan di 4 sudut atau CENTER.

import * as React from "react";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

export type LauncherBtnProps = {
  label?: string;
  onClick?: () => void;
  corner?: Corner;      // posisi di sudut layar atau "center"
  zIndex?: number;      // default 60
  className?: string;   // opsional override kelas
  style?: React.CSSProperties; // opsional override style
};

function cornerStyle(corner: Corner): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute", margin: 12 };
  switch (corner) {
    case "top-left": return { ...base, left: 0, top: 0 };
    case "top-right": return { ...base, right: 0, top: 0 };
    case "bottom-left": return { ...base, left: 0, bottom: 0 };
    case "bottom-right": return { ...base, right: 0, bottom: 0 };
    case "center":
    default:
      // center of screen
      return { ...base, left: "50%", top: "50%", margin: 0, transform: "translate(-50%, -50%)" };
  }
}

export default function LauncherBtn({
  label = "BTN",
  onClick,
  corner = "top-right",
  zIndex = 60,
  className,
  style,
}: LauncherBtnProps) {
  return (
    <div style={{ ...cornerStyle(corner), zIndex }}>
      <button
        type="button"
        onClick={onClick}
        aria-label="launcher-placeholder-button"
        className={className}
        style={{
          minWidth: 36,
          height: 36,
          padding: "0 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          fontSize: 12,
          letterSpacing: 0.5,
          cursor: "pointer",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          userSelect: "none",
          outline: "none",
          ...style,
        }}
      >
        {label}
      </button>
    </div>
  );
}
