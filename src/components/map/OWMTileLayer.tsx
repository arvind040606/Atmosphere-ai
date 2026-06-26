import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { MapLayerId } from "./mapTypes";

const OWM_LAYER_NAMES: Partial<Record<MapLayerId, string>> = {
  temp:          "temp_new",
  precipitation: "precipitation_new",
  wind:          "wind_new",
  clouds:        "clouds_new",
  pressure:      "pressure_new",
};

interface OWMTileLayerProps {
  layerId: MapLayerId;
}

/**
 * Mounts / unmounts an OWM weather tile overlay whenever layerId changes.
 * Silently skips if no VITE_OWM_API_KEY is set or layerId is "none".
 * Gracefully handles tile load errors without showing user-facing error messages.
 */
export function OWMTileLayer({ layerId }: OWMTileLayerProps) {
  const map   = useMap();
  const ref   = useRef<L.TileLayer | null>(null);
  const owmKey = import.meta.env.VITE_OWM_API_KEY ?? "";
  const [, setErrorCount] = useState(0);
  const MAX_ERROR_THRESHOLD = 5; // Hide layer after repeated failures

  useEffect(() => {
    if (ref.current) { 
      map.removeLayer(ref.current); 
      ref.current = null;
      setErrorCount(0);
    }
    
    if (!owmKey || layerId === "none") return;
    
    const name = OWM_LAYER_NAMES[layerId];
    if (!name) return;

    const tileLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/${name}/{z}/{x}/{y}.png?appid=${owmKey}`,
      { 
        opacity: 0.65, 
        attribution: "© OpenWeatherMap", 
        zIndex: 300,
        // Error handling: silently fail without showing user notification
        errorTileUrl: "",
      }
    );

    // Track tile load errors
    tileLayer.on("tileerror", () => {
      setErrorCount(prev => {
        const newCount = prev + 1;
        // If too many errors, remove the layer silently
        if (newCount > MAX_ERROR_THRESHOLD && ref.current) {
          try {
            map.removeLayer(ref.current);
          } catch (e) {
            // Ignore removal errors
          }
        }
        return newCount;
      });
    });

    // Clear error count when tiles load successfully
    tileLayer.on("tileload", () => {
      setErrorCount(0);
    });

    ref.current = tileLayer;
    ref.current.addTo(map);

    return () => { 
      if (ref.current) { 
        try {
          map.removeLayer(ref.current);
        } catch (e) {
          // Ignore removal errors during cleanup
        }
        ref.current = null; 
      } 
    };
  }, [map, owmKey, layerId]);

  return null;
}
