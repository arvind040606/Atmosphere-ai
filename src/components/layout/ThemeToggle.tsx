import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from "../../context/useSettings";

export function ThemeToggle() {
  const { resolvedMode, toggleMode } = useSettings();
  const isDark = resolvedMode === "dark";

  return (
    <button
      onClick={toggleMode}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/8 t-secondary"
    >
      <motion.div
        key={resolvedMode}
        initial={{ rotate: -45, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </motion.div>
    </button>
  );
}
