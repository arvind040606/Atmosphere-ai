import { motion } from "framer-motion";
import { useMemo } from "react";

/** Generates a solar corona spike path around an invisible centre point */
function coronaPath(cx: number, cy: number, count: number, innerR: number, outerR: number): string {
  const pts: string[] = [];
  for (let i = 0; i < count * 2; i++) {
    const angle = (i / (count * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return `M${pts.join("L")}Z`;
}

export function SunLayer() {
  // Staggered heat-shimmer columns rising from the bottom edge
  const heatRisers = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        x: 4 + ((i * 117) % 93),   // spread across viewport width %
        delay: (i * 0.21) % 3.2,
        dur: 2.4 + (i % 5) * 0.45,
        w: 1.5 + (i % 4) * 1.2,
        h: 60 + (i % 7) * 55,
        opacity: 0.18 + (i % 3) * 0.09,
      })),
    []
  );

  // Floating ember/heat-dot particles
  const embers = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        x: 3 + ((i * 89) % 94),
        delay: (i * 0.31) % 4,
        dur: 3.8 + (i % 6) * 0.7,
        size: 2 + (i % 3),
        opacity: 0.25 + (i % 4) * 0.12,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">

      {/* ── Wide ambient heat glow — top-right corner, no disc ── */}
      <motion.div
        className="absolute"
        style={{
          top: "-18%", right: "-12%",
          width: "68%", height: "68%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 60% 40%, rgba(255,200,80,0.32) 0%, rgba(255,130,30,0.14) 45%, transparent 72%)",
          filter: "blur(8px)",
        }}
        animate={{ scale: [1, 1.07, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Corona spike ring (SVG, no filled disc) ── */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute"
        style={{ top: "-6%", right: "4%", width: "22%", maxWidth: 220, minWidth: 120, opacity: 0.75 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        {/* outer sharp spikes */}
        <motion.path
          d={coronaPath(100, 100, 16, 62, 96)}
          fill="rgba(255,195,60,0.55)"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* inner shorter spikes — offset for layered look */}
        <motion.path
          d={coronaPath(100, 100, 12, 55, 76)}
          fill="rgba(255,150,30,0.45)"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        {/* central "hole" — just a transparent circle punching through */}
        <circle cx="100" cy="100" r="52" fill="rgba(255,220,100,0.10)" />
      </motion.svg>

      {/* ── Secondary counter-rotating inner corona ── */}
      <motion.svg
        viewBox="0 0 160 160"
        className="absolute"
        style={{ top: "-2%", right: "7%", width: "16%", maxWidth: 170, minWidth: 90, opacity: 0.5 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        <path
          d={coronaPath(80, 80, 10, 44, 68)}
          fill="rgba(255,220,80,0.50)"
        />
      </motion.svg>

      {/* ── Tall heat-shimmer risers from bottom ── */}
      {heatRisers.map((r, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0"
          style={{
            left: `${r.x}%`,
            width: r.w,
            height: r.h,
            borderRadius: "999px",
            background: "linear-gradient(180deg, transparent 0%, rgba(255,200,80,0.55) 40%, rgba(255,130,30,0.70) 75%, transparent 100%)",
            opacity: r.opacity,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: [0, -(r.h * 0.65), 0],
            scaleX: [1, 0.6, 1.2, 0.8, 1],
            opacity: [0, r.opacity, r.opacity * 0.5, 0],
          }}
          transition={{
            duration: r.dur,
            repeat: Infinity,
            delay: r.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ── Floating ember particles ── */}
      {embers.map((e, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            bottom: "5%",
            left: `${e.x}%`,
            width: e.size,
            height: e.size,
            borderRadius: "50%",
            background: "radial-gradient(circle, #ffe066 0%, #ff8c00 80%, transparent 100%)",
            boxShadow: "0 0 6px 2px rgba(255,160,30,0.5)",
            opacity: 0,
          }}
          animate={{
            y: [0, -(120 + (i % 5) * 60)],
            x: [(i % 3 - 1) * 12],
            opacity: [0, e.opacity, e.opacity * 0.6, 0],
            scale: [0.6, 1.2, 0.4],
          }}
          transition={{
            duration: e.dur,
            repeat: Infinity,
            delay: e.delay,
            ease: [0.2, 0.6, 0.4, 1],
          }}
        />
      ))}

      {/* ── Heat-haze distortion band across the lower third ── */}
      <motion.div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "40%",
          background: "linear-gradient(0deg, rgba(255,180,50,0.07) 0%, rgba(255,220,100,0.04) 60%, transparent 100%)",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
