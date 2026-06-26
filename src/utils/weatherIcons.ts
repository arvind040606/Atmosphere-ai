import {
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Cloud,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type { WeatherCondition } from "../types/weather";

export const WEATHER_ICONS: Record<WeatherCondition, LucideIcon> = {
  "clear-day": Sun,
  "clear-night": Moon,
  "partly-cloudy-day": Cloud,
  "partly-cloudy-night": Cloud,
  cloudy: Cloud,
  rain: CloudRain,
  drizzle: CloudDrizzle,
  thunderstorm: CloudLightning,
  snow: CloudSnow,
  sleet: CloudSnow,
  fog: CloudFog,
};
