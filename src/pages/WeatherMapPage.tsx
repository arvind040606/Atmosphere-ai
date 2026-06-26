import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Map } from "lucide-react";
import { WeatherMap } from "../components/map/WeatherMap";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { useGeolocation } from "../hooks/useGeolocation";
import { useWeatherSnapshot } from "../hooks/useWeather";
import { useSettings } from "../context/useSettings";
import { fetchWeatherSnapshot } from "../services/weatherService";
import type { CitySearchResult, Coordinates, WeatherSnapshot } from "../types/weather";
import type { MapMarkerData } from "../components/map/mapTypes";

/**
 * WeatherMapPage
 *
 * Full-screen map experience. Manages:
 * - Primary marker (searched city or geolocation)
 * - Extra markers (map click points, fetched on demand)
 * - Routing back to the home dashboard
 */
export function WeatherMapPage({ onBack }: { onBack: () => void }) {
  const { unit } = useSettings();
  const geo = useGeolocation();

  const [primaryQuery, setPrimaryQuery] = useState<string | null>(null);

  const activeQuery =
    primaryQuery ??
    (geo.status === "granted" && geo.coords
      ? `${geo.coords.lat},${geo.coords.lon}`
      : null);

  const { data: primarySnapshot, isLoading: isLoadingPrimary } = useWeatherSnapshot(activeQuery);

  const primaryMarker: MapMarkerData | null = primarySnapshot
    ? { coords: primarySnapshot.location.coordinates, snapshot: primarySnapshot }
    : null;

  // homeCoords: explicit search overrides geo
  const [searchedHomeCoords, setSearchedHomeCoords] = useState<Coordinates | null>(null);
  const homeCoords: Coordinates | null =
    searchedHomeCoords ??
    (geo.status === "granted" && geo.coords
      ? { lat: geo.coords.lat, lon: geo.coords.lon }
      : primarySnapshot?.location.coordinates ?? null);

  // ── Extra markers (map clicks) ─────────────────────────────────────────────
  const [extraMarkers, setExtraMarkers] = useState<MapMarkerData[]>([]);
  const [isLoadingClick, setIsLoadingClick] = useState(false);

  const handleMapClick = useCallback(async (coords: Coordinates) => {
    setIsLoadingClick(true);
    try {
      const snapshot: WeatherSnapshot = await fetchWeatherSnapshot(`${coords.lat},${coords.lon}`);
      setExtraMarkers((prev) => {
        // Keep max 5 pins; replace if same location
        const deduped = prev.filter(
          (m) =>
            Math.abs(m.coords.lat - coords.lat) > 0.01 ||
            Math.abs(m.coords.lon - coords.lon) > 0.01
        );
        return [...deduped, { coords, snapshot }].slice(-5);
      });
    } catch {
      /* silently ignore failed map clicks */
    } finally {
      setIsLoadingClick(false);
    }
  }, []);

  function handleClearExtras() {
    setExtraMarkers([]);
  }

  function handleSearchSelect(city: CitySearchResult) {
    setPrimaryQuery(city.id);
    setSearchedHomeCoords(city.coordinates);
    setExtraMarkers((prev) =>
      prev.filter(
        (m) =>
          Math.abs(m.coords.lat - city.coordinates.lat) > 0.5 ||
          Math.abs(m.coords.lon - city.coordinates.lon) > 0.5
      )
    );
  }

  const isLoading = isLoadingPrimary || isLoadingClick;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed inset-0 flex flex-col"
      style={{ background: "#0d1117", zIndex: 50 }}
    >
      {/* ── Top navigation bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="relative z-[600] flex shrink-0 items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(13,17,23,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          aria-label="Back to dashboard"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-opacity hover:opacity-70"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)" }}
        >
          <ArrowLeft size={17} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2b7fff 100%)" }}
          >
            <Map size={15} color="#fff" />
          </div>
          <div>
            <h1
              className="text-sm font-bold text-white leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Weather Map
            </h1>
            {primarySnapshot && (
              <p className="text-[10px] text-white/40 leading-none mt-0.5">
                {primarySnapshot.location.name}, {primarySnapshot.location.country}
              </p>
            )}
          </div>
        </div>

        {/* Unit display */}
        <div className="ml-auto flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background: "rgba(43,127,255,0.15)",
              color: "#2b7fff",
              border: "1px solid rgba(43,127,255,0.25)",
            }}
          >
            °{unit}
          </span>
        </div>
      </motion.div>

      {/* ── Map fills remaining height ── */}
      <div className="relative flex-1 overflow-hidden">
        <ErrorBoundary>
          <WeatherMap
            primaryMarker={primaryMarker}
            extraMarkers={extraMarkers}
            isLoadingPrimary={isLoading}
            onSearchSelect={handleSearchSelect}
            onMapClick={handleMapClick}
            onClearExtras={handleClearExtras}
            geo={geo}
            homeCoords={homeCoords}
          />
        </ErrorBoundary>
      </div>
    </motion.div>
  );
}
