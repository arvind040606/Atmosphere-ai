import { useQuery } from "@tanstack/react-query";
import { fetchAlerts } from "../services/alertsService";
import type { Coordinates } from "../types/weather";

export function useWeatherAlerts(coords: Coordinates | null, locationName: string) {
  return useQuery({
    queryKey: ["alerts", coords?.lat, coords?.lon],
    queryFn: () => fetchAlerts(coords!.lat, coords!.lon, locationName),
    enabled: Boolean(coords),
    staleTime: 10 * 60 * 1000, // alerts stale after 10 min
    retry: 1,
  });
}
