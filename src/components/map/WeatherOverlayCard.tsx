import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Droplets, Eye, Gauge, Thermometer, Wind, Sun, Navigation2 } from "lucide-react";
import { useState } from "react";
import { useSettings } from "../../context/useSettings";
import { CONDITION_FAMILY } from "../../constants/weather";
import { SCENE_THEMES } from "../../animations/sceneThemes";
import { WEATHER_ICONS } from "../../utils/weatherIcons";
import { formatTemp, formatLocalTime } from "../../utils/format";
import type { WeatherSnapshot } from "../../types/weather";

interface WeatherOverlayCardProps {
  snapshot: WeatherSnapshot;
}

export function WeatherOverlayCard({ snapshot }: WeatherOverlayCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { unit } = useSettings();
  const { location, current } = snapshot;
  const family = CONDITION_FAMILY[current.condition];
  const theme  = SCENE_THEMES[family];
  const Icon   = WEATHER_ICONS[current.condition];

  const stats = [
    { icon: Thermometer, label: "Feels like", value: formatTemp(current.feelsLikeC, unit),    color: theme.accent },
    { icon: Droplets,    label: "Humidity",   value: `${current.humidity}%`,                  color: "#2b7fff"    },
    { icon: Wind,        label: "Wind",        value: `${Math.round(current.windKph)} km/h`,   color: "#0d9488"    },
    { icon: Eye,         label: "Visibility",  value: `${current.visibilityKm} km`,            color: "#7c3aed"    },
    { icon: Gauge,       label: "Pressure",    value: `${Math.round(current.pressureMb)} mb`,  color: "#64748b"    },
    { icon: Sun,         label: "UV Index",    value: `${current.uvIndex.toFixed(1)}`,         color: "#f59e0b"    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-4 left-3 z-[500] w-[220px] overflow-hidden rounded-2xl"
      style={{
        background: "rgba(22,27,39,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
      }}
    >
      {/* Header — always visible */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white leading-tight">
              {location.name}
            </p>
            <p className="text-[10px] text-white/45 mt-0.5 truncate">
              {[location.region, location.country].filter(Boolean).join(", ")}
            </p>
            <p className="text-[9px] text-white/35 mt-1 font-mono">
              <Navigation2 size={8} className="inline mr-1" />
              {location.coordinates.lat.toFixed(4)}°, {location.coordinates.lon.toFixed(4)}°
            </p>
            <p className="text-[9px] text-white/35 mt-0.5">
              {formatLocalTime(location.localTime)}
            </p>
          </div>
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: `${theme.accent}25` }}
          >
            <Icon size={17} style={{ color: theme.accent }} strokeWidth={1.75} />
          </motion.div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span
            className="font-bold text-white leading-none"
            style={{
              fontSize: "2.6rem",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
            }}
          >
            {formatTemp(current.tempC, unit)}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white/75">{current.conditionText}</span>
            <span className="text-[10px] text-white/40">
              H:{formatTemp(current.tempC + 2, unit, false)}° L:{formatTemp(current.tempC - 4, unit, false)}°
            </span>
          </div>
        </div>
      </div>

      {/* Stats — collapsible */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="stats"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2.5">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon size={12} style={{ color: s.color }} />
                    <span className="text-[11px] text-white/50">{s.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-white/85">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand weather card" : "Collapse weather card"}
        className="flex w-full items-center justify-center py-2 transition-opacity hover:opacity-70"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}
      >
        {collapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
    </motion.div>
  );
}
