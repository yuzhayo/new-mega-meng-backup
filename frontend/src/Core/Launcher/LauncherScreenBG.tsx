/* ============================================================
   IMPORT SECTION
   ============================================================ */
import { useEffect, useMemo, useState } from "react";
import type { OriginState } from "./LauncherScreen";

/* ============================================================
   TYPES SECTION
   ============================================================ */
export type BGLayer = {
  src?: string;
  alt?: string;
  visible?: boolean;         // default true kalau ada src
  fit?: "cover" | "contain" | "fill" | "none";
  scalePct?: number;         // 100 = ukuran asli
  posPct?: { x: number; y: number }; // persen dari origin.scale; +x kanan, +y atas
};

export type LauncherScreenBGProps = {
  origin: OriginState;
  layers?: BGLayer[];        // inline (opsional)
  manifestPath?: string;     // ex: "/launcher-bg.json"
};

/* ============================================================
   STATE SECTION
   ============================================================ */
type Manifest = { layers?: BGLayer[] };
const EMPTY: BGLayer[] = [];

/* ============================================================
   LOGIC SECTION
   ============================================================ */
function resolvePublicPath(p?: string) {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const base = (import.meta as any).env?.BASE_URL ?? "/";
  const clean = p.startsWith("/") ? p.slice(1) : p;
  return `${base}${clean}`;
}

function normalize(layers?: BGLayer[]) {
  if (!layers) return EMPTY;
  return layers.map(L => {
    const visible = L?.visible ?? Boolean(L?.src);
    const fit: NonNullable<BGLayer["fit"]> = L?.fit ?? "none";
    const scalePct = typeof L?.scalePct === "number" ? L!.scalePct! : 100;
    const posPct = L?.posPct ?? { x: 0, y: 0 };
    return { ...L, visible, fit, scalePct, posPct } as Required<BGLayer>;
  });
}

function toObjectFitClass(fit: NonNullable<BGLayer["fit"]>) {
  if (fit === "cover") return "object-cover";
  if (fit === "contain") return "object-contain";
  if (fit === "fill") return "object-fill";
  return ""; // none
}

function offsetFromOrigin(origin: OriginState, posPct: { x: number; y: number }) {
  const unit = origin.scale;
  const dx = (posPct.x / 100) * unit;
  const dy = (posPct.y / 100) * unit;
  return { dx, dy: -dy }; // CSS Y kebawah positif
}

function composeTransform(origin: OriginState, fit: BGLayer["fit"], scalePct: number, posPct: { x: number; y: number }) {
  const { dx, dy } = offsetFromOrigin(origin, posPct);
  const s = (scalePct || 100) / 100;
  const parts: string[] = [];
  if (fit === "none") parts.push("translate(-50%, -50%)"); // center ke dotmark
  if (dx !== 0 || dy !== 0) parts.push(`translate(${dx}px, ${dy}px)`);
  if (s !== 1) parts.push(`scale(${s})`);
  return parts.length ? parts.join(" ") : undefined;
}

/* ============================================================
   UI SECTION
   ============================================================ */
export default function LauncherScreenBG({ origin, layers, manifestPath }: LauncherScreenBGProps) {
  const [manifestLayers, setManifestLayers] = useState<BGLayer[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!manifestPath) {
      setManifestLayers(null);
      return;
    }
    const url = resolvePublicPath(manifestPath);
    fetch(url)
      .then(r => (r.ok ? r.json() : Promise.reject(`${r.status} ${r.statusText}`)))
      .then((json: Manifest) => {
        if (!cancelled) setManifestLayers(Array.isArray(json?.layers) ? json.layers : EMPTY);
      })
      .catch(err => {
        console.warn("[BG] manifest load failed:", url, err);
        if (!cancelled) setManifestLayers(EMPTY);
      });
    return () => { cancelled = true; };
  }, [manifestPath]);

  const effective = useMemo(() => normalize(manifestLayers ?? layers ?? EMPTY), [manifestLayers, layers]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
      {effective.map((L, i) => {
        if (!L.visible || !L.src) return null;
        const src = resolvePublicPath(L.src);
        const fitClass = toObjectFitClass(L.fit!);
        const transform = composeTransform(origin, L.fit!, L.scalePct!, L.posPct!);
        return (
          <div key={i} className="absolute inset-0" style={{ zIndex: i }}>
            <img
              src={src}
              alt={L.alt ?? `bg-layer-${i + 1}`}
              draggable={false}
              aria-hidden="true"
              onLoad={() => console.log(`[BG] Layer ${i + 1} loaded successfully:`, src)}
              onError={(e) => {
                console.error(`[BG] Layer ${i + 1} failed to load:`, src);
                console.error(`[BG] Error details:`, e);
              }}
              style={{ transform, transformOrigin: "center center" }}
              className={
                L.fit === "none"
                  ? `absolute left-1/2 top-1/2 ${fitClass}`
                  : `absolute inset-0 w-full h-full ${fitClass}`
              }
            />
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   STYLES SECTION
   ============================================================ */
// Non-interactive, index kecil = paling bawah