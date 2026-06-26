import type { TemperatureUnit } from "../types/weather";

export function formatTemp(celsius: number, unit: TemperatureUnit, withUnit = true): string {
  const value = unit === "C" ? celsius : celsius * (9 / 5) + 32;
  return `${Math.round(value)}${withUnit ? "°" : ""}`;
}

export function formatLocalTime(iso: string): string {
  const date = new Date(iso.replace(" ", "T"));
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatHourLabel(iso: string): string {
  const date = new Date(iso.replace(" ", "T"));
  return date.toLocaleTimeString(undefined, { hour: "numeric" });
}

export function formatDayLabel(dateStr: string, index: number): string {
  if (index === 0) return "Today";
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function formatFullDate(iso: string): string {
  const date = new Date(iso.replace(" ", "T"));
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function uvLabel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
