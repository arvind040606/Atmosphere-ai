import { motion } from "framer-motion";
import { MapPin, RefreshCw } from "lucide-react";
import { SkyStage } from "../../animations/SkyStage";
import { CONDITION_FAMILY } from "../../constants/weather";
import { SCENE_THEMES } from "../../animations/sceneThemes";
import { useSettings } from "../../context/useSettings";
import { formatFullDate, formatLocalTime, formatTemp } from "../../utils/format";
import { WEATHER_ICONS } from "../../utils/weatherIcons";
import type { WeatherSnapshot } from "../../types/weather";

export function CurrentWeatherHero({
  snapshot,
  onRefresh,
}: {
  snapshot: WeatherSnapshot;
  onRefresh?: () => void;
}) {
  const { unit } = useSettings();
  const { location, current, daily } = snapshot;
  const family = CONDITION_FAMILY[current.condition];
  const theme  = SCENE_THEMES[family];
  const Icon   = WEATHER_ICONS[current.condition];
  const today  = daily[0];

  const quickStats = [
    { label: "Feels like", value: formatTemp(current.feelsLikeC, unit) },
    { label: "Humidity",   value: `${current.humidity}%` },
    { label: "Wind",       value: `${Math.round(current.windKph)} km/h` },
    { label: "UV",         value: String(current.uvIndex) },
  ];

  return (
    <SkyStage family={family} className="rounded-2xl" style={{ minHeight: 400 }}>
      <div className="flex h-full flex-col justify-between px-6 py-6 sm:px-8 sm:py-8">

        {/* ── Top bar ── */}
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-center gap-2">
              <MapPin size={14} color="rgba(255,255,255,0.8)" />
              <span className="text-sm font-semibold text-white/90">
                {location.name}
                {location.country ? `, ${location.country}` : ""}
              </span>
            </div>
            <p className="mt-0.5 pl-5 text-xs text-white/55">
              {formatFullDate(location.localTime)} · {formatLocalTime(location.localTime)}
            </p>
          </motion.div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                aria-label="Refresh"
                className="flex h-8 w-8 items-center justify-center rounded-xl transition-opacity hover:opacity-70"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <RefreshCw size={14} color="#fff" />
              </button>
            )}
            {/* Animated condition icon */}
            <motion.div
              key={family}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "backOut" }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              <Icon size={24} color="#fff" strokeWidth={1.75} />
            </motion.div>
          </div>
        </div>

        {/* ── Temperature ── */}
        <div className="mt-4">
          <motion.div
            key={`${current.tempC}-${unit}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-end gap-4 leading-none"
          >
            <span
              className="font-[family-name:var(--font-display)] font-bold text-white"
              style={{ fontSize: "clamp(4.5rem, 13vw, 7.5rem)", lineHeight: 1, letterSpacing: "-0.03em" }}
            >
              {formatTemp(current.tempC, unit)}
            </span>
            <div className="mb-2 flex flex-col gap-1">
              <span className="text-lg font-semibold text-white">{current.conditionText}</span>
              <span className="text-sm text-white/65">
                H: {today ? formatTemp(today.maxTempC, unit) : "—"} &nbsp;
                L: {today ? formatTemp(today.minTempC, unit) : "—"}
              </span>
            </div>
          </motion.div>

          {/* ── Quick stats strip ── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.38 }}
            className="mt-5 flex flex-wrap gap-2"
          >
            {quickStats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl px-3.5 py-2"
                style={{ background: theme.chipBg, backdropFilter: "blur(10px)" }}
              >
                <p className="text-[10px] font-medium text-white/60 uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-bold text-white">{s.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </SkyStage>
  );
}
