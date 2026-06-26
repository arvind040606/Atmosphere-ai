import type { WeatherCondition } from "../types/weather";

export const STORAGE_KEYS = {
  recentSearches: "atmosphere:recent-searches",
  settings: "atmosphere:settings",
  lastLocation: "atmosphere:last-location",
} as const;

export const QUERY_KEYS = {
  currentWeather: (id: string) => ["weather", "current", id] as const,
  citySearch: (query: string) => ["weather", "search", query] as const,
};

export const MAX_RECENT_SEARCHES = 6;

/**
 * Maps WeatherAPI.com's numeric condition codes + day/night flag to our
 * internal WeatherCondition union. WeatherAPI has ~50 codes; we collapse
 * them into the visual families our animation system actually renders.
 * https://www.weatherapi.com/docs/weather_conditions.json
 */
export function mapConditionCode(code: number, isDay: boolean): WeatherCondition {
  const day = isDay;
  if (code === 1000) return day ? "clear-day" : "clear-night";
  if ([1003].includes(code)) return day ? "partly-cloudy-day" : "partly-cloudy-night";
  if ([1006, 1009, 1030, 1135, 1147].includes(code)) return "cloudy";
  if ([1063, 1180, 1183, 1240].includes(code)) return "drizzle";
  if ([1186, 1189, 1192, 1195, 1243, 1246].includes(code)) return "rain";
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code))
    return "snow";
  if ([1069, 1072, 1198, 1201, 1204, 1207, 1249, 1252, 1261, 1264].includes(code))
    return "sleet";
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return "thunderstorm";
  if ([1135, 1147].includes(code)) return "fog";
  return "cloudy";
}

export const CONDITION_LABELS: Record<WeatherCondition, string> = {
  "clear-day": "Clear",
  "clear-night": "Clear",
  "partly-cloudy-day": "Partly Cloudy",
  "partly-cloudy-night": "Partly Cloudy",
  cloudy: "Cloudy",
  rain: "Rain",
  drizzle: "Drizzle",
  thunderstorm: "Thunderstorm",
  snow: "Snow",
  sleet: "Sleet",
  fog: "Fog",
};

/**
 * Theme family used for gradients + the animated hero stage. Several
 * granular conditions share a visual treatment (e.g. drizzle reads as rain).
 */
export type ConditionFamily = "sun" | "cloud" | "rain" | "storm" | "snow" | "fog";

export const CONDITION_FAMILY: Record<WeatherCondition, ConditionFamily> = {
  "clear-day": "sun",
  "clear-night": "sun",
  "partly-cloudy-day": "cloud",
  "partly-cloudy-night": "cloud",
  cloudy: "cloud",
  rain: "rain",
  drizzle: "rain",
  thunderstorm: "storm",
  snow: "snow",
  sleet: "snow",
  fog: "fog",
};
