import { motion } from "framer-motion";
import { Droplets, Eye, Gauge, Thermometer, Wind, Zap, CloudRain, Navigation } from "lucide-react";
import { useSettings } from "../../context/useSettings";
import { formatTemp, uvLabel } from "../../utils/format";
import type { CurrentWeather } from "../../types/weather";

function uvColor(uv: number): string {
  if (uv <= 2)  return "#22c55e";
  if (uv <= 5)  return "#eab308";
  if (uv <= 7)  return "#f97316";
  if (uv <= 10) return "#ef4444";
  return "#a855f7";
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  unit?: string;
  sub: string;
  accent: string;
  delay: number;
  bar?: { pct: number; color: string };
}

function StatCard({ icon: Icon, label, value, unit, sub, accent, delay, bar }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] }}
      className="card card-hover flex flex-col gap-3 p-5"
      style={{ transition: "box-shadow 0.18s ease, transform 0.18s ease" }}
    >
      {/* Icon + label */}
      <div className="flex items-center justify-between">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: `${accent}18` }}
        >
          <Icon size={15} style={{ color: accent }} />
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest t-muted"
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div>
        <div className="flex items-baseline gap-1">
          <span
            className="font-[family-name:var(--font-display)] text-3xl font-bold t-primary"
            style={{ letterSpacing: "-0.02em" }}
          >
            {value}
          </span>
          {unit && <span className="text-sm font-medium t-muted">{unit}</span>}
        </div>
        <p className="mt-1 text-xs t-subtle">{sub}</p>
      </div>

      {/* Optional progress bar */}
      {bar && (
        <div
          className="progress-bar-light h-1.5 overflow-hidden rounded-full"
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: bar.color }}
            initial={{ width: 0 }}
            animate={{ width: `${bar.pct}%` }}
            transition={{ duration: 0.7, delay: delay + 0.2, ease: "easeOut" }}
          />
        </div>
      )}
    </motion.div>
  );
}

export function StatGrid({ current }: { current: CurrentWeather }) {
  const { unit } = useSettings();
  const uv = current.uvIndex;

  const stats: Omit<StatCardProps, "delay">[] = [
    {
      icon: Thermometer,
      label: "Feels Like",
      value: formatTemp(current.feelsLikeC, unit),
      sub: current.feelsLikeC < current.tempC - 2 ? "Cooler than actual" :
           current.feelsLikeC > current.tempC + 2 ? "Warmer than actual" : "Close to actual",
      accent: "#f59e0b",
      bar: { pct: Math.min(100, Math.max(0, (current.feelsLikeC + 20) / 60 * 100)), color: "linear-gradient(90deg,#2b7fff,#f59e0b)" },
    },
    {
      icon: Droplets,
      label: "Humidity",
      value: `${current.humidity}`,
      unit: "%",
      sub: current.humidity > 70 ? "High — feels muggy" : current.humidity < 30 ? "Low — dry air" : "Comfortable level",
      accent: "#2b7fff",
      bar: { pct: current.humidity, color: "#2b7fff" },
    },
    {
      icon: Wind,
      label: "Wind Speed",
      value: `${Math.round(current.windKph)}`,
      unit: "km/h",
      sub: `Direction: ${current.windDir}`,
      accent: "#0d9488",
    },
    {
      icon: Navigation,
      label: "Wind Dir",
      value: current.windDir,
      sub: `${Math.round(current.windKph)} km/h sustained`,
      accent: "#0d9488",
    },
    {
      icon: Gauge,
      label: "Pressure",
      value: `${Math.round(current.pressureMb)}`,
      unit: "mb",
      sub: current.pressureMb > 1013 ? "High pressure" : current.pressureMb < 1000 ? "Low pressure" : "Normal",
      accent: "#7c3aed",
    },
    {
      icon: Eye,
      label: "Visibility",
      value: `${current.visibilityKm}`,
      unit: "km",
      sub: current.visibilityKm >= 10 ? "Excellent clarity" : current.visibilityKm >= 5 ? "Good" : "Reduced visibility",
      accent: "#2b7fff",
      bar: { pct: Math.min(100, current.visibilityKm / 20 * 100), color: "#2b7fff" },
    },
    {
      icon: Zap,
      label: "UV Index",
      value: `${uv}`,
      sub: uvLabel(uv),
      accent: uvColor(uv),
      bar: { pct: Math.min(100, uv / 11 * 100), color: uvColor(uv) },
    },
    {
      icon: CloudRain,
      label: "Precipitation",
      value: `${current.precipMm.toFixed(1)}`,
      unit: "mm",
      sub: current.precipMm === 0 ? "None today" : current.precipMm < 2 ? "Light" : current.precipMm < 10 ? "Moderate" : "Heavy",
      accent: "#38bdf8",
    },
    {
      icon: Droplets,
      label: "Dew Point",
      value: formatTemp(current.dewPointC, unit),
      sub: current.dewPointC > 20 ? "Very humid feel" : current.dewPointC > 13 ? "Noticeable moisture" : "Dry and comfortable",
      accent: "#0d9488",
    },
    {
      icon: Gauge,
      label: "Cloud Cover",
      value: `${current.cloudCover}`,
      unit: "%",
      sub: current.cloudCover < 25 ? "Mostly clear" : current.cloudCover < 75 ? "Partly cloudy" : "Overcast",
      accent: "#94a3b8",
      bar: { pct: current.cloudCover, color: "#94a3b8" },
    },
  ];

  return (
    <section>
      <h2
        className="mb-4 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider t-muted"
      >
        Current Conditions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.035} />
        ))}
      </div>
    </section>
  );
}
