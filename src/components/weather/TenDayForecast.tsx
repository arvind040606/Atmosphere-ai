import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Droplets, Sunrise, Sunset, Wind } from "lucide-react";
import { useSettings } from "../../context/useSettings";
import { CONDITION_FAMILY } from "../../constants/weather";
import { SCENE_THEMES } from "../../animations/sceneThemes";
import { formatDayLabel, formatHourLabel, formatTemp } from "../../utils/format";
import { WEATHER_ICONS } from "../../utils/weatherIcons";
import type { DayForecast } from "../../types/weather";

/* Temperature range bar — shows each day's range relative to the week's min/max */
function TempBar({ min, max, weekMin, weekMax }: { min: number; max: number; weekMin: number; weekMax: number }) {
  const span = weekMax - weekMin || 1;
  const left  = ((min - weekMin) / span) * 100;
  const width = Math.max(8, ((max - min) / span) * 100);
  return (
    <div className="relative flex h-1.5 w-28 items-center">
      <div
        className="absolute inset-0 rounded-full progress-bar-light"
      />
      <motion.div
        className="absolute h-full rounded-full"
        style={{
          left: `${left}%`,
          width: `${width}%`,
          background: "linear-gradient(90deg, #2b7fff 0%, #f59e0b 100%)",
          originX: "0%",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

function DayRow({ day, index, weekMin, weekMax }: { day: DayForecast; index: number; weekMin: number; weekMax: number }) {
  const [open, setOpen] = useState(false);
  const { unit } = useSettings();
  const Icon   = WEATHER_ICONS[day.condition];
  const family = CONDITION_FAMILY[day.condition];
  const theme  = SCENE_THEMES[family];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="card overflow-hidden"
    >
      {/* Row */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[var(--bg-card-2-light)] dark:hover:bg-[var(--bg-card-2-dark)] transition-colors"
      >
        {/* Day label */}
        <span
          className="w-[4.5rem] shrink-0 text-sm font-semibold t-primary"
          style={{ color: index === 0 ? "var(--accent-blue)" : undefined }}
        >
          {formatDayLabel(day.date, index)}
        </span>

        {/* Icon */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: theme.accentSoft }}
        >
          <Icon size={16} style={{ color: theme.accent }} />
        </div>

        {/* Condition — hide on very small screens */}
        <span className="hidden flex-1 truncate text-sm t-secondary sm:block">
          {day.conditionText}
        </span>

        {/* Rain chance */}
        <div className="flex shrink-0 items-center gap-1 text-xs font-semibold"
          style={{ color: day.precipChance >= 40 ? "var(--accent-blue)" : "var(--text-subtle-light)" }}
        >
          <Droplets size={11} />
          {day.precipChance}%
        </div>

        {/* Temp range */}
        <div className="ml-2 flex shrink-0 items-center gap-2.5">
          <span className="w-9 text-right text-sm font-medium t-muted tabular-nums">
            {formatTemp(day.minTempC, unit, false)}°
          </span>
          <TempBar min={day.minTempC} max={day.maxTempC} weekMin={weekMin} weekMax={weekMax} />
          <span className="w-9 text-sm font-bold t-primary tabular-nums">
            {formatTemp(day.maxTempC, unit, false)}°
          </span>
        </div>

        {/* Chevron */}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="t-subtle" />
        </motion.div>
      </button>

      {/* Expanded */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="divider" />
            {/* Astro */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3 text-xs t-muted">
              <span className="flex items-center gap-1.5">
                <Sunrise size={13} style={{ color: "var(--color-sun)" }} />
                {day.sunrise}
              </span>
              <span className="flex items-center gap-1.5">
                <Sunset size={13} style={{ color: "var(--color-sun-deep)" }} />
                {day.sunset}
              </span>
              <span className="flex items-center gap-1.5">
                <Wind size={13} />
                {Math.round(day.hours[12]?.windKph ?? 0)} km/h at noon
              </span>
            </div>
            {/* Hourly strip */}
            <div className="flex gap-2 overflow-x-auto px-5 pb-4 pt-1 scrollbar-hide">
              {day.hours.filter((_, i) => i % 3 === 0).map((hour) => {
                const HourIcon = WEATHER_ICONS[hour.condition];
                const hFamily  = CONDITION_FAMILY[hour.condition];
                const hTheme   = SCENE_THEMES[hFamily];
                return (
                  <div
                    key={hour.time}
                    className="inset flex shrink-0 flex-col items-center gap-1.5 px-3.5 py-3"
                  >
                    <span className="text-[10px] font-semibold t-subtle uppercase tracking-wider">
                      {formatHourLabel(hour.time)}
                    </span>
                    <HourIcon size={16} style={{ color: hTheme.accent }} />
                    <span className="font-[family-name:var(--font-mono)] text-sm font-bold t-primary">
                      {formatTemp(hour.tempC, unit, false)}°
                    </span>
                    {hour.precipChance > 10 && (
                      <span className="text-[10px] font-semibold" style={{ color: "var(--accent-blue)" }}>
                        {hour.precipChance}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TenDayForecast({ days }: { days: DayForecast[] }) {
  const weekMin = Math.min(...days.map((d) => d.minTempC));
  const weekMax = Math.max(...days.map((d) => d.maxTempC));

  return (
    <section>
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider t-muted">
        {days.length}-Day Forecast
      </h2>
      <div className="space-y-2">
        {days.map((day, i) => (
          <DayRow key={day.date} day={day} index={i} weekMin={weekMin} weekMax={weekMax} />
        ))}
      </div>
    </section>
  );
}
