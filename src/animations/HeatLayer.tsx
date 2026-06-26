import { motion } from "framer-motion";

export function HeatLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Warm Glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "40%",
          background:
            "linear-gradient(to top, rgba(255,160,0,0.12), transparent)",
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      />

      {/* Heat Waves */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 180,
            height: 12,
            left: `${15 + (i % 5) * 15}%`,
            top: `${45 + i * 4}%`,
            border: "1px solid rgba(255,255,255,0.08)",
            filter: "blur(2px)",
          }}
          animate={{
            x: [-8, 8, -8],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Rising Thermal Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3,
            height: 3,
            background: "rgba(255,220,120,0.8)",
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 20}%`,
          }}
          animate={{
            y: [-10, -200],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 5 + (i % 5),
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}