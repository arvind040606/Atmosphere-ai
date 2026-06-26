import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  BellOff,
  ChevronDown,
  Clock,
  Info,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useWeatherAlerts } from "../../hooks/useAlerts";
import type { AlertSeverity, WeatherAlert, Coordinates } from "../../types/weather";

// ── Severity config ───────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; bg: string; border: string; icon: typeof AlertTriangle; color: string }
> = {
  extreme: {
    label: "Extreme",
    bg: "rgba(220,38,38,0.07)",
    border: "rgba(220,38,38,0.32)",
    icon: Zap,
    color: "#dc2626",
  },
  severe: {
    label: "Severe",
    bg: "rgba(234,88,12,0.07)",
    border: "rgba(234,88,12,0.30)",
    icon: ShieldAlert,
    color: "#ea580c",
  },
  moderate: {
    label: "Moderate",
    bg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.28)",
    icon: AlertTriangle,
    color: "#d97706",
  },
  minor: {
    label: "Minor",
    bg: "rgba(43,127,255,0.06)",
    border: "rgba(43,127,255,0.24)",
    icon: Info,
    color: "#2563eb",
  },
  unknown: {
    label: "Advisory",
    bg: "rgba(100,116,139,0.07)",
    border: "rgba(100,116,139,0.22)",
    icon: Bell,
    color: "#64748b",
  },
};

function formatAlertTime(unix: number): string {
  return new Date(unix * 1000).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

const SEVERITY_ORDER: AlertSeverity[] = ["extreme", "severe", "moderate", "minor", "unknown"];
function sortAlerts(a: WeatherAlert[]): WeatherAlert[] {
  return [...a].sort(
    (x, y) => SEVERITY_ORDER.indexOf(x.severity) - SEVERITY_ORDER.indexOf(y.severity)
  );
}

// ── Single alert card ─────────────────────────────────────────────────────────
function AlertCard({ alert, index }: { alert: WeatherAlert; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg  = SEVERITY_CONFIG[alert.severity];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3.5 px-5 py-4 text-left"
      >
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${cfg.color}18` }}
        >
          <Icon size={15} style={{ color: cfg.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="badge"
              style={{
                background: `${cfg.color}14`,
                color: cfg.color,
                border: `1px solid ${cfg.color}28`,
              }}
            >
              {cfg.label}
            </span>
            <span className="text-sm font-bold truncate t-primary">{alert.event}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs t-muted">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {formatAlertTime(alert.start)}
            </span>
            <span>→ {formatAlertTime(alert.end)}</span>
          </div>
          {!expanded && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed t-secondary">
              {alert.description}
            </p>
          )}
        </div>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="shrink-0 mt-1 t-subtle"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="divider" />
            <div className="space-y-3 px-5 py-4">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest t-muted">
                  Details
                </p>
                <p className="text-sm leading-relaxed t-secondary">{alert.description}</p>
              </div>
              {alert.instruction && (
                <div
                  className="rounded-xl border px-4 py-3"
                  style={{ background: `${cfg.color}0c`, borderColor: `${cfg.color}22` }}
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: cfg.color }}>
                    What to do
                  </p>
                  <p className="text-xs leading-relaxed t-secondary">{alert.instruction}</p>
                </div>
              )}
              {alert.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {alert.tags.map((tag) => (
                    <span key={tag} className="badge"
                      style={{
                        background: "var(--bg-inset-light)",
                        color: "var(--text-muted-light)",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] t-subtle">Issued by {alert.sender}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface WeatherAlertsProps {
  coords: Coordinates | null;
  locationName: string;
}

export function WeatherAlerts({ coords, locationName }: WeatherAlertsProps) {
  const { data, isLoading, isError, error } = useWeatherAlerts(coords, locationName);

  if (!coords && !isLoading) return (
    <section>
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider t-muted">
        Weather Alerts
      </h2>
      <div className="card flex items-center gap-4 px-6 py-5">
        <Bell size={18} className="t-subtle" />
        <p className="text-sm t-muted">Search for a city to check for active weather alerts.</p>
      </div>
    </section>
  );

  const sorted   = data ? sortAlerts(data.alerts) : [];
  const critical = sorted.filter(a => a.severity === "extreme" || a.severity === "severe");
  const highest  = sorted[0]?.severity ?? null;

  return (
    <section>
      {/* Heading */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider t-muted">
            Weather Alerts
          </h2>
          {highest && !isLoading && (
            <div className="relative flex h-2.5 w-2.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: SEVERITY_CONFIG[highest].color }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{ background: SEVERITY_CONFIG[highest].color }}
              />
            </div>
          )}
        </div>
        {data && (
          <span className="text-xs t-subtle">
            {data.alerts.length === 0
              ? "No active alerts"
              : `${data.alerts.length} active alert${data.alerts.length !== 1 ? "s" : ""}`}
          </span>
        )}
      </div>

      {/* Critical banner */}
      <AnimatePresence>
        {critical.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="mb-3 flex items-center gap-3 rounded-2xl border px-5 py-3.5"
            style={{ background: "rgba(220,38,38,0.07)", borderColor: "rgba(220,38,38,0.28)" }}
          >
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <ShieldAlert size={17} style={{ color: "#dc2626" }} />
            </motion.div>
            <p className="text-sm font-semibold" style={{ color: "#dc2626" }}>
              {critical.length === 1
                ? `${critical[0].event} — take immediate action`
                : `${critical.length} critical alerts active — review all warnings`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {isLoading && (
        <div className="card flex items-center justify-center gap-3 py-10">
          <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent-blue)" }} />
          <span className="text-sm font-medium t-muted">Checking for active alerts…</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <div className="card flex items-center gap-4 px-6 py-5">
          <BellOff size={18} className="t-subtle" />
          <p className="text-sm t-muted">
            {error instanceof Error ? error.message : "Could not load alerts."}
          </p>
        </div>
      )}

      {/* All clear */}
      {!isLoading && !isError && data && data.alerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="card flex items-center gap-4 px-6 py-5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "rgba(22,163,74,0.10)" }}>
            <ShieldCheck size={17} style={{ color: "#16a34a" }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#16a34a" }}>
              All clear for {data.locationName}
            </p>
            <p className="mt-0.5 text-xs t-muted">No active weather alerts at this time.</p>
          </div>
        </motion.div>
      )}

      {/* Alert cards */}
      {!isLoading && !isError && sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map((alert, i) => (
            <AlertCard key={alert.id} alert={alert} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
