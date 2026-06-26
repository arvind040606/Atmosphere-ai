import { motion } from "framer-motion";
import { CloudSun, Map } from "lucide-react";
import { CitySearch } from "../search/CitySearch";
import { ThemeToggle } from "./ThemeToggle";
import { UnitToggle } from "./UnitToggle";
import { LocateButton } from "./LocateButton";
import type { GeolocationState } from "../../hooks/useGeolocation";
import type { CitySearchResult } from "../../types/weather";

interface HeaderProps {
  onSelectCity: (city: CitySearchResult) => void;
  geo: GeolocationState;
  onOpenMap: () => void;
}

export function Header({ onSelectCity, geo, onOpenMap }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4 pb-0 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass mx-auto flex max-w-6xl items-center gap-3 rounded-2xl px-4 py-2.5 sm:px-5"
      >
        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-2.5 mr-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)" }}
          >
            <CloudSun size={16} color="#fff" />
          </div>
          <span className="hidden sm:block font-[family-name:var(--font-display)] text-[1.05rem] font-bold tracking-tight t-primary">
            Atmosphere<span style={{ color: "var(--accent-blue)" }}> AI</span>
          </span>
        </a>

        {/* Search */}
        <div className="flex-1">
          <CitySearch onSelect={onSelectCity} />
        </div>

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-1.5">
          <LocateButton geo={geo} compact />

          {/* Map page button */}
          <button
            onClick={onOpenMap}
            aria-label="Open weather map"
            title="Full-screen weather map"
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/8 t-secondary"
          >
            <Map size={16} />
          </button>

          <UnitToggle />
          <ThemeToggle />
        </div>
      </motion.div>
    </header>
  );
}
