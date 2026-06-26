// Domain types for the weather platform.
// Shaped to match WeatherAPI.com's response contract so the service layer
// can map 1:1 without lossy guessing, while the rest of the app only
// ever sees these normalized types.

export type WeatherCondition =
  | "clear-day"
  | "clear-night"
  | "partly-cloudy-day"
  | "partly-cloudy-night"
  | "cloudy"
  | "rain"
  | "drizzle"
  | "thunderstorm"
  | "snow"
  | "sleet"
  | "fog";

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface LocationInfo {
  id: string; // `${lat},${lon}` — stable key for caching/history
  name: string;
  region: string;
  country: string;
  coordinates: Coordinates;
  timezone: string;
  localTime: string; // ISO string in the location's local time
}

export interface CurrentWeather {
  tempC: number;
  tempF: number;
  feelsLikeC: number;
  feelsLikeF: number;
  condition: WeatherCondition;
  conditionText: string;
  isDay: boolean;
  humidity: number; // %
  windKph: number;
  windDir: string; // e.g. "NW"
  pressureMb: number;
  visibilityKm: number;
  uvIndex: number;
  dewPointC: number;
  precipMm: number;
  cloudCover: number; // %
  lastUpdated: string; // ISO
}

export interface HourForecast {
  time: string; // ISO
  tempC: number;
  condition: WeatherCondition;
  conditionText: string;
  precipChance: number; // %
  precipMm: number;
  windKph: number;
  isDay: boolean;
}

export interface DayForecast {
  date: string; // YYYY-MM-DD
  maxTempC: number;
  minTempC: number;
  condition: WeatherCondition;
  conditionText: string;
  precipChance: number;
  sunrise: string;
  sunset: string;
  hours: HourForecast[];
}

export interface WeatherSnapshot {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourForecast[];
  daily: DayForecast[];
}

export interface CitySearchResult {
  id: string;
  name: string;
  region: string;
  country: string;
  coordinates: Coordinates;
  displayName?: string; // Full formatted address from Nominatim
  type?: string; // POI type (e.g., "city", "amenity", "landmark")
  class?: string; // OSM class (e.g., "place", "amenity")
}

export type AlertSeverity = "extreme" | "severe" | "moderate" | "minor" | "unknown";

export interface WeatherAlert {
  id: string;           // synthetic: `${sender}-${start}`
  event: string;        // e.g. "Tornado Warning"
  sender: string;
  severity: AlertSeverity;
  headline: string;
  description: string;
  instruction: string;
  start: number;        // unix timestamp
  end: number;
  tags: string[];
}

export interface AlertsResult {
  coords: Coordinates;
  locationName: string;
  alerts: WeatherAlert[];
  fetchedAt: number;    // Date.now()
}

export type ThemeMode = "light" | "dark" | "system";

export type TemperatureUnit = "C" | "F";

export interface AppSettings {
  themeMode: ThemeMode;
  unit: TemperatureUnit;
}
