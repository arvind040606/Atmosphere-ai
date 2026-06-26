import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchWeatherSnapshot, searchCities } from "../services/weatherService";
import { QUERY_KEYS } from "../constants/weather";

export function useWeatherSnapshot(query: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.currentWeather(query ?? "none"),
    queryFn: () => fetchWeatherSnapshot(query as string),
    enabled: Boolean(query),
    staleTime: 5 * 60 * 1000, // 5 min — weather doesn't need to refetch every render
    retry: 1,
  });
}

/** Debounces a fast-changing value (used to throttle search-as-you-type). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}

export function useCitySearch(rawQuery: string) {
  const query = useDebouncedValue(rawQuery.trim(), 300);
  return useQuery({
    queryKey: QUERY_KEYS.citySearch(query),
    queryFn: () => searchCities(query),
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
}
