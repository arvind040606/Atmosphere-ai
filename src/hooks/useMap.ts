import { useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { reverseGeocode } from "../services/nominatimService";
import type { Coordinates } from "../types/weather";
import type { RefObject } from "react";

/**
 * Hook for reverse geocoding map click coordinates
 */
export function useReverseGeocode(coords: Coordinates | null) {
  return useQuery({
    queryKey: ["reverseGeocode", coords?.lat, coords?.lon],
    queryFn: () => {
      if (!coords) return null;
      return reverseGeocode(coords.lat, coords.lon);
    },
    enabled: Boolean(coords),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/**
 * Fullscreen hook
 */
export function useMapFullscreen<T extends HTMLElement>(
  containerRef: RefObject<T | null>
) {
  const isFullscreenRef = useRef(false);

  const toggleFullscreen = useCallback(async () => {
    const element = containerRef.current;

    if (!element) return;

    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
        isFullscreenRef.current = true;
      } else {
        await document.exitFullscreen();
        isFullscreenRef.current = false;
      }
    } catch (err) {
      console.error("Fullscreen toggle error:", err);

      element.classList.toggle("map-fullscreen");
      isFullscreenRef.current = element.classList.contains("map-fullscreen");
    }
  }, [containerRef]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      isFullscreenRef.current = !!document.fullscreenElement;
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  return {
    toggleFullscreen,
    isFullscreen: isFullscreenRef.current,
  };
}

/**
 * Smooth flyTo animation
 */
export function useMapFlyTo(
  mapInstance: L.Map | null
) {
  return useCallback(
    (
      coords: Coordinates,
      zoomLevel = 10,
      duration = 2.5
    ) => {
      if (!mapInstance) return;

      mapInstance.flyTo(
        [coords.lat, coords.lon],
        zoomLevel,
        {
          duration,
          easeLinearity: 0.25,
          noMoveStart: true,
        }
      );
    },
    [mapInstance]
  );
}