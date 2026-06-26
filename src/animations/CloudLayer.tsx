import { motion } from "framer-motion";

export function CloudLayer() {
  const clouds = [
    { top: "12%", scale: 1.1, opacity: 0.5, duration: 50 },
    { top: "30%", scale: 0.8, opacity: 0.65, duration: 38 },
    { top: "48%", scale: 1.3, opacity: 0.4, duration: 60 },
    { top: "62%", scale: 0.9, opacity: 0.55, duration: 44 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className="absolute h-20 w-56 rounded-full bg-white/50 blur-xl dark:bg-white/15"
          style={{ top: c.top, scale: c.scale, opacity: c.opacity }}
          initial={{ x: "-30%" }}
          animate={{ x: "130%" }}
          transition={{ duration: c.duration, repeat: Infinity, ease: "linear", delay: i * 4 }}
        />
      ))}
    </div>
  );
}
