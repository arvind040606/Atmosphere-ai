import { weatherClient } from "./apiClient";
import type { AlertSeverity, AlertsResult, WeatherAlert } from "../types/weather";

// ── Raw WeatherAPI alert shape ────────────────────────────────────────────────
interface RawAlert {
  headline: string;
  msgtype: string;
  severity: string;
  urgency: string;
  areas: string;
  category: string;
  certainty: string;
  event: string;
  note: string;
  effective: string;
  expires: string;
  desc: string;
  instruction: string;
}

interface AlertsApiResponse {
  location: { name: string; country: string };
  alerts: { alert: RawAlert[] };
}

export class AlertsUnavailableError extends Error {
  reason: "no-alerts" | "api-error";
  constructor(reason: "no-alerts" | "api-error", message: string) {
    super(message);
    this.reason = reason;
    this.name = "AlertsUnavailableError";
  }
}

// ── Severity normalisation ────────────────────────────────────────────────────
const EXTREME_KW  = ["tornado", "hurricane", "typhoon", "cyclone", "tsunami", "earthquake", "extreme"];
const SEVERE_KW   = ["thunderstorm", "blizzard", "ice storm", "flash flood", "wildfire", "severe"];
const MODERATE_KW = ["wind", "flood", "snow", "freezing", "fog", "heat", "cold", "frost", "rain", "moderate"];

function normaliseSeverity(raw: string, event: string): AlertSeverity {
  const combined = (raw + " " + event).toLowerCase();
  if (EXTREME_KW.some((k)  => combined.includes(k))) return "extreme";
  if (SEVERE_KW.some((k)   => combined.includes(k))) return "severe";
  if (MODERATE_KW.some((k) => combined.includes(k))) return "moderate";
  if (combined.includes("minor"))                     return "minor";
  return "unknown";
}

function toUnix(dateStr: string): number {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

/**
 * Fetches weather alerts directly from WeatherAPI.com — the same key already
 * used for current weather, no extra subscription or OWM account needed.
 *
 * Endpoint: /forecast.json?alerts=yes
 * Works on WeatherAPI's free plan.
 */
export async function fetchAlerts(
  lat: number,
  lon: number,
  locationName: string
): Promise<AlertsResult> {
    const { data } = await weatherClient.get<AlertsApiResponse>("/forecast.json", {
      params: {
        q:      `${lat},${lon}`,
        days:   1,
        aqi:    "no",
        alerts: "yes",
      },
    });

    const rawAlerts = data.alerts?.alert ?? [];

    const alerts: WeatherAlert[] = rawAlerts.map((a, i): WeatherAlert => ({
      id:          `${a.event}-${a.effective}-${i}`,
      event:       a.event || a.headline || "Weather Advisory",
      sender:      a.areas || locationName,
      severity:    normaliseSeverity(a.severity, a.event),
      headline:    a.headline || a.event,
      description: a.desc?.replace(/\n+/g, " ").trim() ?? "",
      instruction: a.instruction?.replace(/\n+/g, " ").trim() ?? "",
      start:       toUnix(a.effective),
      end:         toUnix(a.expires),
      tags:        [a.category, a.certainty, a.urgency].filter(Boolean),
    }));

    return {
      coords:     { lat, lon },
      locationName: data.location
        ? `${data.location.name}, ${data.location.country}`
        : locationName,
      alerts,
      fetchedAt: Date.now(),
    };
}
