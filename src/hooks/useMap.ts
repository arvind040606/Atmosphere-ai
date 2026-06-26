import { useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { reverseGeocode } from "../services/nominatimService";
import type { CitySearchResult, Coordinates } from "../types/weather";

/**
 * Hook for reverse geocoding map click coordinates
 * Transforms lat/lon into human-readable location names
 */
export function useReverseGeocode(coords: Coordinates | null) {
  return useQuery({
    queryKey: ["reverseGeocode", coords?.lat, coords?.lon],
    queryFn: () => {
      if (!coords) return null;
      return reverseGeocode(coords.lat, coords.lon);
    },
    enabled: Boolean(coords),
    staleTime: 60 * 1000, // Cache for 1 minute
    retry: 1,
  });
}

/**
 * Hook to manage fullscreen state for map
 * Handles browser fullscreen API with fallback to CSS
 */
export function useMapFullscreen(containerRef: React.RefObject<HTMLElement>) {
  const isFullscreenRef = useRef(false);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          isFullscreenRef.current = true;
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          isFullscreenRef.current = false;
        }
      }
    } catch (err) {
      console.error("Fullscreen toggle error:", err);
      // Fallback: use CSS class instead
      if (containerRef.current) {
        containerRef.current.classList.toggle("map-fullscreen");
      }
    }
  }, [containerRef]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      isFullscreenRef.current = !!document.fullscreenElement;
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return {
    toggleFullscreen,
    isFullscreen: isFullscreenRef.current,
  };
}

/**
 * Hook to manage map center flyTo animation
 * Smoothly pans and zooms to a location
 */
export function useMapFlyTo(mapInstance: L.Map | null) {
  return useCallback(
    (coords: Coordinates, zoomLevel: number = 10, duration: number = 2.5) => {
      if (!mapInstance) return;

      mapInstance.flyTo([coords.lat, coords.lon], zoomLevel, {
        duration,
        easeLinearity: 0.25,
        noMoveStart: true,
      });
    },
    [mapInstance]
  );
}
