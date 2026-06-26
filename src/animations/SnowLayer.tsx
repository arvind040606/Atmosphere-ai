import { motion } from "framer-motion";
import { useMemo } from "react";

export function SnowLayer() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        left: (i * 29) % 100,
        size: 3 + (i % 4),
        delay: (i % 15) * 0.4,
        duration: 8 + (i % 6) * 2,
        drift: (i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 6),
      })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-[var(--color-snow-deep)]/15" />
      {flakes.map((f, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          style={{ left: `${f.left}%`, width: f.size, height: f.size }}
          initial={{ y: "-10%", x: 0, opacity: 0 }}
          animate={{ y: "110%", x: [0, f.drift, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: f.duration, repeat: Infinity, delay: f.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}
