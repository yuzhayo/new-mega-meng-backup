// File: src/Launcher/LauncherUtilTime.tsx
// Time driver: now/dt virtual, pause/step/speed, freeze saat tab hidden.
// Expose: TimeDriverProvider, useTime(), useTimeControls().

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type TimeCtx = {
  now: number;      // ms (virtual)
  dt: number;       // ms (virtual, frame delta)
};
type CtrlCtx = {
  paused: boolean;
  setPaused: (v: boolean) => void;
  togglePaused: () => void;
  step: (ms?: number) => void;            // langkah maju saat paused (default ~16.67ms)
  speedMultiplier: number;                // 0.25x..4x
  setSpeedMultiplier: (v: number) => void;
};

const TimeContext = createContext<TimeCtx | null>(null);
const CtrlContext = createContext<CtrlCtx | null>(null);

const DEFAULT_SPEED = 1;
const MIN_SPEED = 0.25;
const MAX_SPEED = 4;
const TIME_STEP_MS = 1000 / 60;           // ~16.67
const MAX_REAL_DELTA = 100;               // ms, clamp agar tidak lompat saat tab balik fokus

export function TimeDriverProvider({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplierRaw] = useState<number>(DEFAULT_SPEED);

  const [now, setNow] = useState<number>(() => Date.now());
  const [dt, setDt] = useState<number>(0);

  const rafId = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  const nowRef = useRef<number>(now);

  // clamp speed
  const setSpeedMultiplier = useCallback((v: number) => {
    const clamped = Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number.isFinite(v) ? v : DEFAULT_SPEED));
    setSpeedMultiplierRaw(clamped);
  }, []);

  const togglePaused = useCallback(() => setPaused(p => !p), []);

  // step forward while paused (or even when running, acts as nudge)
  const step = useCallback((ms?: number) => {
    const d = Math.max(0, ms ?? TIME_STEP_MS);
    nowRef.current += d;
    setNow(nowRef.current);
    setDt(d);
  }, []);

  // RAF loop
  useEffect(() => {
    let mounted = true;

    const loop = (ts: number) => {
      if (!mounted) return;

      const hidden = typeof document !== "undefined" && document.hidden;
      // init last timestamp
      if (lastTs.current == null) {
        lastTs.current = ts;
      }

      const realDelta = Math.min(MAX_REAL_DELTA, Math.max(0, ts - lastTs.current));
      lastTs.current = ts;

      if (!paused && !hidden) {
        const scaled = realDelta * speedMultiplier;
        nowRef.current += scaled;
        setNow(nowRef.current);
        setDt(scaled);
      } else {
        // freeze: dt=0, sinkronkan now state ke ref biar subscriber tahu idle
        setNow(nowRef.current);
        setDt(0);
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      lastTs.current = null;
    };
  }, [paused, speedMultiplier]);

  // reset lastTs ketika visibility berubah agar tidak loncat
  useEffect(() => {
    const onVis = () => {
      lastTs.current = null;
      // saat kembali fokus, update now state segera agar sudut clock/spin sinkron <= 1 frame
      setNow(nowRef.current);
      setDt(0);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const timeValue = useMemo<TimeCtx>(() => ({ now, dt }), [now, dt]);
  const ctrlValue = useMemo<CtrlCtx>(() => ({
    paused,
    setPaused,
    togglePaused,
    step,
    speedMultiplier,
    setSpeedMultiplier,
  }), [paused, step, speedMultiplier, setSpeedMultiplier]);

  return (
    <CtrlContext.Provider value={ctrlValue}>
      <TimeContext.Provider value={timeValue}>{children}</TimeContext.Provider>
    </CtrlContext.Provider>
  );
}

export function useTime(): TimeCtx {
  const ctx = useContext(TimeContext);
  if (!ctx) throw new Error("useTime must be used within TimeDriverProvider");
  return ctx;
}

export function useTimeControls(): CtrlCtx {
  const ctx = useContext(CtrlContext);
  if (!ctx) throw new Error("useTimeControls must be used within TimeDriverProvider");
  return ctx;
}
