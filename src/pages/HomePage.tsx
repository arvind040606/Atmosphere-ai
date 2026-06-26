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

        <motion.footer
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mt-20 overflow-hidden rounded-3xl border border-white/10"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,15,25,.92), rgba(5,10,20,.98))",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)",
          }}
        >
          {/* Blue Glow */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(circle at top, rgba(43,127,255,.6), transparent 65%)",
            }}
          />

          <div className="relative px-8 py-14 text-center">

            <div className="text-6xl mb-5">
              🌦️
            </div>

            <h2
              className="text-4xl font-bold"
              style={{
                color: "#fff",
                fontFamily: "var(--font-display)",
              }}
            >
              Atmosphere AI
            </h2>

            <p
              className="mt-4 text-base"
              style={{ color: "rgba(255,255,255,.65)" }}
            >
              Professional Weather Intelligence Platform
            </p>

            <div
              className="mx-auto my-8 h-px w-32"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#2b7fff,transparent)",
              }}
            />

            <p
              className="uppercase tracking-[0.35em] text-xs"
              style={{ color: "rgba(255,255,255,.45)" }}
            >
              Designed & Developed By
            </p>

            <h1
              className="mt-3 text-5xl font-black"
              style={{
                background:
                  "linear-gradient(90deg,#60a5fa,#38bdf8,#22d3ee,#3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Arvind Madaan
            </h1>

            <div className="mt-10 flex justify-center gap-5">

              <a
                href="https://github.com/arvind040606"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 px-6 py-3 transition-all hover:scale-105 hover:bg-blue-500/20"
                style={{
                  color: "#fff",
                  background: "rgba(255,255,255,.04)",
                }}
              >
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/arvindmadaan2704/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 px-6 py-3 transition-all hover:scale-105 hover:bg-sky-500/20"
                style={{
                  color: "#fff",
                  background: "rgba(255,255,255,.04)",
                }}
              >
                LinkedIn
              </a>

            </div>

            <p
              className="mt-10 text-sm"
              style={{ color: "rgba(255,255,255,.45)" }}
            >
              © 2026 Atmosphere AI • All Rights Reserved
            </p>

          </div>
        </motion.footer>

      </AppLayout>
    </>
  );
}
