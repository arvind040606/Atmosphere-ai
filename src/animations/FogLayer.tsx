import { motion } from "framer-motion";

export function FogLayer() {
  const bands = [
    { top: "10%", height: 60, opacity: 0.45, duration: 55 },
    { top: "35%", height: 90, opacity: 0.6, duration: 70 },
    { top: "60%", height: 70, opacity: 0.5, duration: 60 },
    { top: "80%", height: 50, opacity: 0.4, duration: 48 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      {bands.map((b, i) => (
        <motion.div
          key={i}
          className="absolute w-[160%] rounded-full bg-white/60 blur-2xl dark:bg-white/10"
          style={{ top: b.top, height: b.height, opacity: b.opacity }}
          initial={{ x: "-40%" }}
          animate={{ x: "0%" }}
          transition={{ duration: b.duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: i * 3 }}
        />
      ))}
    </div>
  );
}
