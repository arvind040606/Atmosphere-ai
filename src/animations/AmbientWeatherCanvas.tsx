import { useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ConditionFamily } from "../constants/weather";

interface AmbientCanvasProps {
  family: ConditionFamily;
}

/* ─── Sun ambient ──────────────────────────────────────────────────────────── */
function SunAmbient() {
  return (
    <>
      {/* Warm corona top-right */}
      <motion.div
        className="pointer-events-none fixed right-[-12vw] top-[-12vw] h-[55vw] w-[55vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,182,72,0.22) 0%, rgba(255,140,50,0.10) 40%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary warm glow bottom-left */}
      <motion.div
        className="pointer-events-none fixed bottom-[-8vw] left-[-8vw] h-[35vw] w-[35vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,214,120,0.12) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Floating light motes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none fixed rounded-full bg-amber-200/40"
          style={{
            width: 3 + (i % 4),
            height: 3 + (i % 4),
            left: `${8 + ((i * 17) % 84)}%`,
            top: `${5 + ((i * 23) % 88)}%`,
          }}
          animate={{ y: [0, -22, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{
            duration: 5 + (i % 4),
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

/* ─── Cloud ambient ────────────────────────────────────────────────────────── */
function CloudAmbient() {
  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        top: `${8 + i * 14}%`,
        w: 180 + (i % 3) * 80,
        h: 50 + (i % 3) * 20,
        opacity: 0.12 + (i % 3) * 0.05,
        dur: 55 + i * 14,
        delay: i * 6,
      })),
    []
  );
  return (
    <>
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="pointer-events-none fixed rounded-full bg-slate-400/30 blur-3xl dark:bg-slate-600/20"
          style={{ top: c.top, width: c.w, height: c.h, opacity: c.opacity }}
          initial={{ x: "-20vw" }}
          animate={{ x: "110vw" }}
          transition={{ duration: c.dur, repeat: Infinity, ease: "linear", delay: c.delay }}
        />
      ))}
    </>
  );
}

/* ─── Rain ambient ─────────────────────────────────────────────────────────── */
function RainAmbient() {
  const drops = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, i) => ({
        left: `${(i * 37) % 100}%`,
        h: 12 + (i % 5) * 7,
        dur: 0.55 + (i % 6) * 0.11,
        delay: (i % 22) * 0.09,
        opacity: 0.25 + (i % 3) * 0.12,
      })),
    []
  );
  return (
    <>
      {/* Blue-grey ambient wash */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(28,111,216,0.04) 0%, rgba(61,169,252,0.07) 100%)",
        }}
      />
      {drops.map((d, i) => (
        <motion.span
          key={i}
          className="pointer-events-none fixed w-px rounded-full"
          style={{
            left: d.left,
            height: d.h,
            opacity: d.opacity,
            background:
              "linear-gradient(180deg, transparent, rgba(180,220,255,0.85), transparent)",
          }}
          initial={{ y: "-5vh" }}
          animate={{ y: "105vh" }}
          transition={{
            duration: d.dur,
            repeat: Infinity,
            delay: d.delay,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}

/* ─── Storm ambient ────────────────────────────────────────────────────────── */
function StormAmbient() {
  const drops = useMemo(
    () =>
      Array.from({ length: 55 }).map((_, i) => ({
        left: `${(i * 41) % 100}%`,
        h: 14 + (i % 4) * 6,
        dur: 0.45 + (i % 5) * 0.1,
        delay: (i % 18) * 0.07,
      })),
    []
  );

  return (
    <>
      {/* Dark purple ambient overlay */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(60,40,140,0.08) 0%, rgba(20,10,60,0.12) 100%)",
        }}
      />

      {/* Rain drops */}
      {drops.map((d, i) => (
        <motion.span
          key={i}
          className="pointer-events-none fixed w-px rounded-full"
          style={{
            left: d.left,
            height: d.h,
            background:
              "linear-gradient(180deg, transparent, rgba(180,170,255,0.6), transparent)",
          }}
          initial={{ y: "-5vh" }}
          animate={{ y: "105vh" }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: "linear" }}
        />
      ))}

      {/* Lightning flashes — full viewport */}
      <motion.div
        className="pointer-events-none fixed inset-0 bg-white"
        animate={{ opacity: [0, 0, 0, 0.18, 0, 0.08, 0, 0, 0, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeOut" }}
        style={{ mixBlendMode: "overlay" }}
      />
      <motion.div
        className="pointer-events-none fixed inset-0 bg-indigo-200"
        animate={{ opacity: [0, 0, 0, 0, 0.07, 0, 0, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeOut", delay: 3 }}
        style={{ mixBlendMode: "screen" }}
      />

      {/* Lightning bolt SVG */}
      <motion.svg
        viewBox="0 0 60 120"
        className="pointer-events-none fixed"
        style={{ top: "0", left: "62%", width: 80, height: 160, zIndex: 2 }}
        animate={{ opacity: [0, 0, 0, 1, 0.4, 0, 0, 0] }}
        transition={{ duration: 9, repeat: Infinity, times: [0, 0.42, 0.44, 0.45, 0.47, 0.50, 0.9, 1] }}
      >
        <polygon
          points="30,0 10,60 28,60 15,120 52,45 32,45"
          fill="rgba(230,220,255,0.9)"
          filter="drop-shadow(0 0 8px rgba(200,180,255,0.9))"
        />
      </motion.svg>

      {/* Secondary bolt */}
      <motion.svg
        viewBox="0 0 40 90"
        className="pointer-events-none fixed"
        style={{ top: "5%", left: "28%", width: 50, height: 110 }}
        animate={{ opacity: [0, 0, 0, 0, 0, 0.85, 0, 0] }}
        transition={{ duration: 7, repeat: Infinity, times: [0, 0.3, 0.31, 0.33, 0.61, 0.62, 0.64, 1], delay: 3 }}
      >
        <polygon
          points="20,0 5,45 18,45 8,90 38,35 22,35"
          fill="rgba(230,220,255,0.85)"
          filter="drop-shadow(0 0 6px rgba(200,180,255,0.8))"
        />
      </motion.svg>
    </>
  );
}

/* ─── Snow ambient ─────────────────────────────────────────────────────────── */
function SnowAmbient() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        left: `${(i * 31) % 100}%`,
        size: 2 + (i % 5),
        dur: 9 + (i % 7) * 2.5,
        delay: (i % 20) * 0.5,
        drift: ((i % 2 === 0 ? 1 : -1) * (15 + (i % 6) * 12)),
        opacity: 0.4 + (i % 4) * 0.15,
      })),
    []
  );
  return (
    <>
      {/* Cool blue ambient */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(190,225,255,0.06) 0%, rgba(140,190,230,0.04) 100%)",
        }}
      />
      {flakes.map((f, i) => (
        <motion.span
          key={i}
          className="pointer-events-none fixed rounded-full bg-white"
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            filter: "drop-shadow(0 0 3px rgba(255,255,255,0.6))",
          }}
          initial={{ y: "-5vh", x: 0 }}
          animate={{ y: "105vh", x: [0, f.drift, 0, -f.drift / 2, 0] }}
          transition={{ duration: f.dur, repeat: Infinity, delay: f.delay, ease: "linear" }}
        />
      ))}
    </>
  );
}

/* ─── Fog ambient ──────────────────────────────────────────────────────────── */
function FogAmbient() {
  const bands = useMemo(
    () =>
      [
        { top: "8%",  h: 90,  op: 0.09, dur: 70 },
        { top: "26%", h: 120, op: 0.12, dur: 90 },
        { top: "48%", h: 100, op: 0.10, dur: 80 },
        { top: "70%", h: 80,  op: 0.08, dur: 65 },
        { top: "88%", h: 70,  op: 0.07, dur: 75 },
      ],
    []
  );
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(180,195,210,0.07) 0%, rgba(150,170,190,0.04) 100%)",
        }}
      />
      {bands.map((b, i) => (
        <motion.div
          key={i}
          className="pointer-events-none fixed rounded-full bg-slate-300/50 blur-3xl dark:bg-slate-500/25"
          style={{ top: b.top, height: b.h, width: "170%", opacity: b.op, left: "-35%" }}
          animate={{ x: ["-10%", "10%", "-10%"] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: i * 4 }}
        />
      ))}
    </>
  );
}

/* ─── Orchestrator ─────────────────────────────────────────────────────────── */
const AMBIENT_MAP: Record<ConditionFamily, React.ComponentType> = {
  sun:   SunAmbient,
  cloud: CloudAmbient,
  rain:  RainAmbient,
  storm: StormAmbient,
  snow:  SnowAmbient,
  fog:   FogAmbient,
};

/**
 * Fixed, full-viewport ambient layer that sits behind all page content.
 * Each weather family gets its own particle / glow system so the entire
 * app — not just the hero card — feels immersed in the current weather.
 * Uses `pointer-events-none` throughout so it never intercepts clicks.
 */
export function AmbientWeatherCanvas({ family }: AmbientCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const Ambient = AMBIENT_MAP[family];

  return (
    <div
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={family}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Ambient />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
