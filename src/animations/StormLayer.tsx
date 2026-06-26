import { motion } from "framer-motion";
import { RainLayer } from "./RainLayer";

export function StormLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1c1538]/40 to-[#06040f]/50" />
      {/* Dark cloud masses */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-24 w-72 rounded-full bg-[#15102b]/60 blur-2xl"
          style={{ top: `${5 + i * 12}%`, left: `${-10 + i * 15}%` }}
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 18 + i * 6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Lightning flash overlay */}
      <motion.div
        className="absolute inset-0 bg-white"
        style={{ mixBlendMode: "overlay" }}
        animate={{ opacity: [0, 0, 0.85, 0, 0.4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeOut", times: [0, 0.85, 0.87, 0.89, 0.91, 1] }}
      />
      {/* Lightning bolt */}
      <motion.svg
        viewBox="0 0 60 100"
        className="absolute top-6 left-1/2 h-40 w-24 -translate-x-1/2"
        animate={{ opacity: [0, 0, 1, 0, 0, 0] }}
        transition={{ duration: 7, repeat: Infinity, times: [0, 0.85, 0.87, 0.89, 0.91, 1] }}
      >
        <polygon points="30,0 10,55 28,55 18,100 50,40 30,40" fill="#FFE9A8" opacity="0.9" />
      </motion.svg>
      <RainLayer intensity={35} />
    </div>
  );
}
