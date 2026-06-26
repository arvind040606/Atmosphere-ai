import { useContext } from "react";
import { WeatherFamilyContext } from "./WeatherFamilyContext";

export function useWeatherFamily() {
  return useContext(WeatherFamilyContext);
}
