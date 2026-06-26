import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSettings } from "../../context/useSettings";
import { CONDITION_FAMILY } from "../../constants/weather";
import { SCENE_THEMES } from "../../animations/sceneThemes";
import { WEATHER_ICONS } from "../../utils/weatherIcons";
import { formatTemp } from "../../utils/format";
import type { DayForecast } from "../../types/weather";

// Month names for the calendar header
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface CalendarDay {
  date: Date;
  forecast: DayForecast | null;
  isToday: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
}

function buildCalendarGrid(year: number, month: number, forecasts: DayForecast[]): CalendarDay[] {
  const today     = new Date();
  const firstDay  = new Date(year, month, 1);
  const lastDay   = new Date(year, month + 1, 0);
  const startPad  = firstDay.getDay(); // 0=Sun
  const totalCells = Math.ceil((startPad + lastDay.getDate()) / 7) * 7;

  const forecastMap = new Map<string, DayForecast>();
  forecasts.forEach((f) => forecastMap.set(f.date, f));

  const days: CalendarDay[] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(year, month, 1 - startPad + i);
    const iso  = date.toISOString().slice(0, 10);
    days.push({
      date,
      forecast: forecastMap.get(iso) ?? null,
      isToday:
        date.getFullYear() === today.getFullYear() &&
        date.getMonth()    === today.getMonth() &&
        date.getDate()     === today.getDate(),
      isPast: date < today && !date.toDateString().includes(today.toDateString()),
      isCurrentMonth: date.getMonth() === month,
    });
  }
  return days;
}

interface DayCellProps {
  day: CalendarDay;
  onSelect: (d: CalendarDay) => void;
  selected: boolean;
}

function DayCell({ day, onSelect, selected }: DayCellProps) {
  const { unit } = useSettings();
  const f = day.forecast;
  const family = f ? CONDITION_FAMILY[f.condition] : null;
  const theme  = family ? SCENE_THEMES[family] : null;
  const Icon   = f ? WEATHER_ICONS[f.condition] : null;

  return (
    <button
      onClick={() => f && onSelect(day)}
      disabled={!f}
      className="relative flex flex-col items-center gap-0.5 rounded-xl p-1.5 transition-all disabled:cursor-default"
      style={{
        opacity: !day.isCurrentMonth ? 0.28 : day.isPast && !f ? 0.45 : 1,
        background: selected
          ? "rgba(43,127,255,0.14)"
          : day.isToday
          ? "rgba(43,127,255,0.08)"
          : "transparent",
        border: selected
          ? "1.5px solid rgba(43,127,255,0.50)"
          : day.isToday
          ? "1.5px solid rgba(43,127,255,0.28)"
          : "1.5px solid transparent",
      }}
    >
      {/* Date number */}
      <span
        className={`text-[11px] font-bold leading-none ${
          selected || day.isToday ? "" : day.isCurrentMonth ? "t-primary" : "t-subtle"
        }`}
        style={{
          color: selected || day.isToday
            ? "var(--accent-blue)"
            : undefined,
        }}
      >
        {day.date.getDate()}
      </span>

      {/* Weather icon */}
      {Icon && theme ? (
        <Icon size={16} style={{ color: theme.accent }} />
      ) : (
        <span className="h-4 w-4" />
      )}

      {/* Hi temp */}
      {f && (
        <span
          className="text-[9px] font-semibold leading-none t-secondary"
        >
          {formatTemp(f.maxTempC, unit, false)}°
        </span>
      )}

      {/* Rain chance dot */}
      {f && f.precipChance >= 30 && (
        <span
          className="h-1 w-1 rounded-full"
          style={{ background: "var(--accent-blue)" }}
        />
      )}
    </button>
  );
}

interface WeatherCalendarProps {
  forecasts: DayForecast[];
  locationName: string;
}

export function WeatherCalendar({ forecasts, locationName }: WeatherCalendarProps) {
  const { unit } = useSettings();
  const today    = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState<CalendarDay | null>(null);

  const grid = buildCalendarGrid(viewYear, viewMonth, forecasts);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelected(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelected(null);
  }

  const sel = selected?.forecast;
  const selFamily = sel ? CONDITION_FAMILY[sel.condition] : null;
  const selTheme  = selFamily ? SCENE_THEMES[selFamily] : null;
  const SelIcon   = sel ? WEATHER_ICONS[sel.condition] : null;

  return (
    <section>
      <h2 className="section-heading">Weather Calendar — {locationName}</h2>

      <div className="card overflow-hidden p-0">
        {/* ── Month navigation ── */}
        <div
          className="flex items-center justify-between border-b px-5 py-4 calendar-nav-border"
        >
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors calendar-btn"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <p
              className="text-base font-bold t-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {MONTH_NAMES[viewMonth]} {viewYear}
            </p>
            <p className="text-xs t-muted">
              {forecasts.length} days of forecast data available
            </p>
          </div>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors calendar-btn"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="p-4">
          {/* ── Day-of-week headers ── */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-bold uppercase tracking-wider calendar-day-header"
              >
                {d}
              </div>
            ))}
          </div>

          {/* ── Calendar grid ── */}
          <div className="grid grid-cols-7 gap-1">
            {grid.map((day, i) => (
              <DayCell
                key={i}
                day={day}
                selected={selected?.date.toDateString() === day.date.toDateString()}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>

        {/* ── Selected day detail panel ── */}
        <AnimatePresence>
          {sel && selTheme && SelIcon && (
            <motion.div
              key={selected?.date.toDateString()}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className="divider"
              />
              <div
                className="flex items-start gap-4 px-5 py-4 calendar-detail-bg"
              >
                {/* Icon badge */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: `${selTheme.accent}18` }}
                >
                  <SelIcon size={24} style={{ color: selTheme.accent }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <p className="text-sm font-bold t-primary" style={{ fontFamily: "var(--font-display)" }}>
                      {selected?.date.toLocaleDateString(undefined, {
                        weekday: "long", month: "long", day: "numeric",
                      })}
                    </p>
                    <span className="text-xs t-muted">{sel.conditionText}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: "var(--color-sun)" }}
                      />
                      <span className="t-muted">High:</span>
                      <span className="font-bold t-primary">{formatTemp(sel.maxTempC, unit)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: "var(--accent-sky)" }}
                      />
                      <span className="t-muted">Low:</span>
                      <span className="font-bold t-primary">{formatTemp(sel.minTempC, unit)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: "var(--accent-blue)" }}
                      />
                      <span className="t-muted">Rain:</span>
                      <span className="font-bold t-primary">{sel.precipChance}%</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="t-muted">Sunrise:</span>
                      <span className="font-bold t-primary">{sel.sunrise}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="t-muted">Sunset:</span>
                      <span className="font-bold t-primary">{sel.sunset}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
