import { weatherClient } from "./apiClient";
import { mapConditionCode } from "../constants/weather";
import { smartSearch } from "./nominatimService";
import type {
  CitySearchResult,
  CurrentWeather,
  DayForecast,
  HourForecast,
  WeatherSnapshot,
} from "../types/weather";

// --- Raw WeatherAPI.com response shapes (only the fields we use) ---

interface RawCondition {
  text: string;
  code: number;
}

interface RawLocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime: string;
}

interface RawCurrent {
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  condition: RawCondition;
  is_day: number;
  humidity: number;
  wind_kph: number;
  wind_dir: string;
  pressure_mb: number;
  vis_km: number;
  uv: number;
  dewpoint_c?: number;
  precip_mm: number;
  cloud: number;
  last_updated: string;
}

interface RawHour {
  time: string;
  temp_c: number;
  condition: RawCondition;
  chance_of_rain: number;
  chance_of_snow: number;
  precip_mm: number;
  wind_kph: number;
  is_day: number;
}

interface RawDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: RawCondition;
    daily_chance_of_rain: number;
    daily_chance_of_snow: number;
  };
  astro: { sunrise: string; sunset: string };
  hour: RawHour[];
}

interface RawForecastResponse {
  location: RawLocation;
  current: RawCurrent;
  forecast: { forecastday: RawDay[] };
}



function mapCurrent(raw: RawCurrent): CurrentWeather {
  const isDay = raw.is_day === 1;
  return {
    tempC: raw.temp_c,
    tempF: raw.temp_f,
    feelsLikeC: raw.feelslike_c,
    feelsLikeF: raw.feelslike_f,
    condition: mapConditionCode(raw.condition.code, isDay),
    conditionText: raw.condition.text,
    isDay,
    humidity: raw.humidity,
    windKph: raw.wind_kph,
    windDir: raw.wind_dir,
    pressureMb: raw.pressure_mb,
    visibilityKm: raw.vis_km,
    uvIndex: raw.uv,
    dewPointC: raw.dewpoint_c ?? raw.temp_c - (100 - raw.humidity) / 5,
    precipMm: raw.precip_mm,
    cloudCover: raw.cloud,
    lastUpdated: raw.last_updated,
  };
}

function mapHour(raw: RawHour): HourForecast {
  const isDay = raw.is_day === 1;
  return {
    time: raw.time,
    tempC: raw.temp_c,
    condition: mapConditionCode(raw.condition.code, isDay),
    conditionText: raw.condition.text,
    precipChance: Math.max(raw.chance_of_rain, raw.chance_of_snow),
    precipMm: raw.precip_mm,
    windKph: raw.wind_kph,
    isDay,
  };
}

function mapDay(raw: RawDay): DayForecast {
  return {
    date: raw.date,
    maxTempC: raw.day.maxtemp_c,
    minTempC: raw.day.mintemp_c,
    condition: mapConditionCode(raw.day.condition.code, true),
    conditionText: raw.day.condition.text,
    precipChance: Math.max(raw.day.daily_chance_of_rain, raw.day.daily_chance_of_snow),
    sunrise: raw.astro.sunrise,
    sunset: raw.astro.sunset,
    hours: raw.hour.map(mapHour),
  };
}

/**
 * Fetches current conditions + forecast for a query, which can be a city
 * name, "lat,lon" pair, or WeatherAPI's "id:<location_id>" form.
 *
 * Defaults to a 10-day outlook. Note: WeatherAPI.com's free tier caps
 * forecasts at 3 days — a paid plan is required to receive the full 10.
 * If your plan supports fewer days, the API simply returns what it can;
 * the UI renders however many days come back.
 */
export async function fetchWeatherSnapshot(query: string, forecastDays = 10): Promise<WeatherSnapshot> {
  const { data } = await weatherClient.get<RawForecastResponse>("/forecast.json", {
    params: { q: query, days: forecastDays, aqi: "no", alerts: "no" },
  });

  const days = data.forecast.forecastday.map(mapDay);
  const allHours = days.flatMap((d) => d.hours);

  return {
    location: {
      id: `${data.location.lat},${data.location.lon}`,
      name: data.location.name,
      region: data.location.region,
      country: data.location.country,
      coordinates: { lat: data.location.lat, lon: data.location.lon },
      timezone: data.location.tz_id,
      localTime: data.location.localtime,
    },
    current: mapCurrent(data.current),
    hourly: allHours,
    daily: days,
  };
}

export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query.trim()) return [];
  try {
    // Use Nominatim for powerful global search with fuzzy matching
    return await smartSearch(query, 10);
  } catch (err) {
    console.error("Search error:", err);
    return [];
  }
}
