import { motion } from "framer-motion";
import { useMemo } from "react";

export function RainLayer({ intensity = 50 }: { intensity?: number }) {
  const drops = useMemo(
    () =>
      Array.from({ length: intensity }).map((_, i) => ({
        left: (i * 37) % 100,
        delay: (i % 20) * 0.1,
        duration: 0.6 + (i % 5) * 0.12,
        height: 14 + (i % 4) * 6,
      })),
    [intensity]
  );
  const ripples = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        left: 10 + ((i * 17) % 80),
        delay: i * 0.7,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-rain-deep)]/20" />
      {drops.map((d, i) => (
        <motion.span
          key={i}
          className="absolute w-px rounded-full bg-gradient-to-b from-white/0 via-white/70 to-white/10"
          style={{ left: `${d.left}%`, height: d.height }}
          initial={{ y: "-10%", opacity: 0 }}
          animate={{ y: "110%", opacity: [0, 0.8, 0] }}
          transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: "linear" }}
        />
      ))}
      {/* Ripples at the "ground" line */}
      {ripples.map((r, i) => (
        <motion.span
          key={`ripple-${i}`}
          className="absolute bottom-6 h-2 w-2 rounded-full border border-white/50"
          style={{ left: `${r.left}%` }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: [0, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: r.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
