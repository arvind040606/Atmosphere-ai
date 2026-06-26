import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map } from "lucide-react";
import { Header } from "../components/layout/Header";
import { AppLayout } from "../layouts/AppLayout";
import { CurrentWeatherHero } from "../components/weather/CurrentWeatherHero";
import { StatGrid } from "../components/weather/StatGrid";
import { WeatherCalendar } from "../components/weather/WeatherCalendar";
import { TenDayForecast } from "../components/weather/TenDayForecast";
import { WeatherAlerts } from "../components/weather/WeatherAlerts";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { HeroSkeleton, StatGridSkeleton, ForecastSkeleton } from "../components/ui/Skeleton";
import {
  CityNotFoundState,
  NetworkErrorState,
  NoSelectionEmptyState,
} from "../components/ui/StateScreens";
import { useGeolocation } from "../hooks/useGeolocation";
import { useWeatherSnapshot } from "../hooks/useWeather";
import { STORAGE_KEYS, CONDITION_FAMILY } from "../constants/weather";
import { WeatherApiError } from "../services/apiClient";
import { useWeatherFamily } from "../context/useWeatherFamily";
import type { CitySearchResult, Coordinates } from "../types/weather";

function readLastLocation(): string | null {
  try { return localStorage.getItem(STORAGE_KEYS.lastLocation); }
  catch { return null; }
}

export function HomePage({ onOpenMap }: { onOpenMap: () => void }) {
  const [searchedQuery,    setSearchedQuery]    = useState<string | null>(() => readLastLocation());
  const [explicitFocus,    setExplicitFocus]    = useState<Coordinates | null>(null);
  const [mapAlertCoords,   setMapAlertCoords]   = useState<Coordinates | null>(null);
  const [mapAlertLocation, setMapAlertLocation] = useState<string>("");

  const { setFamily } = useWeatherFamily();
  const geo = useGeolocation();

  const activeQuery =
    searchedQuery ??
    (geo.status === "granted" && geo.coords
      ? `${geo.coords.lat},${geo.coords.lon}`
      : null);

  const { data: snapshot, isLoading, isError, error, refetch } = useWeatherSnapshot(activeQuery);

  useEffect(() => {
    if (snapshot) {
      localStorage.setItem(STORAGE_KEYS.lastLocation, snapshot.location.id);
      setFamily(CONDITION_FAMILY[snapshot.current.condition]);
    }
  }, [snapshot, setFamily]);

  function handleSelectCity(city: CitySearchResult) {
    setSearchedQuery(city.id);
    setExplicitFocus(city.coordinates);
    setMapAlertCoords(null);
    setMapAlertLocation("");
  }

  // Alert target: explicit map click overrides snapshot location
  const alertCoords: Coordinates | null =
    mapAlertCoords ?? (snapshot?.location.coordinates ?? null);
  const alertLocation: string =
    mapAlertLocation || (snapshot ? `${snapshot.location.name}, ${snapshot.location.country}` : "");

  const apiError     = error instanceof WeatherApiError ? error : null;
  const cityNotFound = apiError?.status === 400;

  // explicitFocus only used to satisfy linter — used in future phases
  void explicitFocus;

  return (
    <>
      <Header onSelectCity={handleSelectCity} geo={geo} onOpenMap={onOpenMap} />
      <AppLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Empty / intro */}
          <AnimatePresence mode="wait">
            {!activeQuery && !isLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="pt-12"
              >
                <NoSelectionEmptyState geo={geo} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {isLoading && (
            <>
              <HeroSkeleton />
              <StatGridSkeleton />
              <ForecastSkeleton />
            </>
          )}

          {/* Error */}
          {!isLoading && isError && activeQuery && (
            <div className="pt-12">
              {cityNotFound
                ? <CityNotFoundState query={activeQuery} />
                : <NetworkErrorState onRetry={() => refetch()} />}
            </div>
          )}

          {/* Dashboard */}
          <AnimatePresence mode="wait">
            {!isLoading && !isError && snapshot && (
              <ErrorBoundary>
                <motion.div
                  key={snapshot.location.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-8"
                >
                  <CurrentWeatherHero snapshot={snapshot} onRefresh={() => refetch()} />
                  <StatGrid current={snapshot.current} />

                {/* Alerts */}
                <div id="alerts-section">
                  <WeatherAlerts coords={alertCoords} locationName={alertLocation} />
                </div>

                <TenDayForecast days={snapshot.daily} />
                <WeatherCalendar forecasts={snapshot.daily} locationName={alertLocation} />
                </motion.div>
              </ErrorBoundary>
            )}
          </AnimatePresence>

          {/* Alerts when no snapshot yet */}
          {!snapshot && !isLoading && (
            <div id="alerts-section">
              <WeatherAlerts coords={alertCoords} locationName={alertLocation} />
            </div>
          )}

          {/* ── Big Map button ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={onOpenMap}
              className="group relative w-full overflow-hidden rounded-2xl transition-transform hover:scale-[1.012] active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #0f2744 0%, #1a4a8a 45%, #2b7fff 100%)",
                boxShadow: "0 8px 32px rgba(43,127,255,0.30), 0 2px 8px rgba(0,0,0,0.20)",
                border: "1px solid rgba(43,127,255,0.30)",
              }}
            >
              {/* Subtle shimmer sweep on hover */}
              <div
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />

              <div className="flex items-center justify-between px-7 py-6">
                {/* Left: icon + text */}
                <div className="flex items-center gap-5">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}
                  >
                    <Map size={28} color="#fff" strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
                    >
                      Open Weather Map
                    </p>
                    <p className="mt-0.5 text-sm text-white/55">
                      Interactive world map · live overlays · click anywhere for weather
                    </p>
                  </div>
                </div>

                {/* Right: arrow */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:translate-x-1"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </button>
            
          </motion.div>
          

        </motion.div>
        
      {/* ================= Footer ================= */}

<footer className="mt-16 border-t border-white/10 py-8">
  <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">

    <div>
      <h3 className="text-sm font-semibold text-white">
        Atmosphere AI
      </h3>

      <p className="mt-1 text-xs text-white/50">
        Professional Weather Intelligence Platform
      </p>
    </div>

    <div className="text-center">
      <p className="text-sm text-white/70">
        Designed & Developed by
        <span className="ml-1 font-medium text-blue-400">
          Arvind Madaan
        </span>
      </p>

      <p className="mt-1 text-xs text-white/40">
        © 2026 All Rights Reserved
      </p>
    </div>

    <div className="flex items-center gap-5">
      <a
        href="https://github.com/arvind040606"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-white/60 transition hover:text-blue-400"
      >
        GitHub
      </a>

      <a
        href="https://www.linkedin.com/in/arvindmadaan2704"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-white/60 transition hover:text-blue-400"
      >
        LinkedIn
      </a>
    </div>

  </div>
</footer>

</AppLayout>
</>
);
}
