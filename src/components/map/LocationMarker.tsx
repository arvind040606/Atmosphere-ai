import { useEffect, useRef } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import type { MapMarkerData } from "./mapTypes";
import { makeWeatherMarker } from "./markerIcons";
import { useSettings } from "../../context/useSettings";
import { formatTemp } from "../../utils/format";
import { WEATHER_ICONS } from "../../utils/weatherIcons";
import { CONDITION_FAMILY } from "../../constants/weather";
import { SCENE_THEMES } from "../../animations/sceneThemes";
import { Droplets, Thermometer, Wind, Eye } from "lucide-react";

interface LocationMarkerProps {
  data: MapMarkerData;
  isHome?: boolean;
  autoOpen?: boolean;
  onFly?: boolean;
}

export function LocationMarker({
  data, isHome = false, autoOpen = true, onFly = true,
}: LocationMarkerProps) {
  const { unit }      = useSettings();
  const map           = useMap();
  const markerRef     = useRef<L.Marker | null>(null);
  const { snapshot }  = data;
  const { location, current } = snapshot;
  const family  = CONDITION_FAMILY[current.condition];
  const theme   = SCENE_THEMES[family];
  const Icon    = WEATHER_ICONS[current.condition];
  const icon    = makeWeatherMarker(current.condition, isHome);

  // Fly to location when it changes
  useEffect(() => {
    if (!onFly) return;
    map.flyTo(
      [data.coords.lat, data.coords.lon],
      Math.max(map.getZoom(), 10),
      { duration: 1.2, easeLinearity: 0.4 }
    );
  }, [map, data.coords.lat, data.coords.lon, onFly]);

  // Open popup automatically
  useEffect(() => {
    if (!autoOpen) return;
    const timer = setTimeout(() => {
      markerRef.current?.openPopup();
    }, 500);
    return () => clearTimeout(timer);
  }, [autoOpen, data.coords.lat, data.coords.lon]);

  const stats = [
    { icon: Thermometer, label: "Feels",  value: formatTemp(current.feelsLikeC, unit), color: theme.accent },
    { icon: Droplets,    label: "Humid",  value: `${current.humidity}%`,              color: "#2b7fff"    },
    { icon: Wind,        label: "Wind",   value: `${Math.round(current.windKph)} km/h`, color: "#0d9488"  },
    { icon: Eye,         label: "Visib",  value: `${current.visibilityKm} km`,         color: "#7c3aed"  },
  ];

  return (
    <Marker
      ref={markerRef}
      position={[data.coords.lat, data.coords.lon]}
      icon={icon}
    >
      {/*
        autoPan: true  — Leaflet moves the map so the popup is always fully visible.
        keepInView: true — prevents popup from going off-screen edge.
        These two together fix the "popup appears on left" issue.
      */}
      <Popup
        minWidth={240}
        maxWidth={260}
        closeButton
        autoPan
        keepInView
        className="weather-popup"
      >
        <div style={{ fontFamily: "var(--font-body)", overflow: "hidden" }}>
          {/* Gradient header */}
          <div
            className="px-5 pt-4 pb-3"
            style={{ background: theme.heroBg }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold leading-tight text-white">
                  {location.name}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-white/55">
                  {[location.region, location.country].filter(Boolean).join(", ")}
                </p>
              </div>
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <Icon size={20} color="#fff" strokeWidth={1.75} />
              </div>
            </div>

            {/* Big temperature */}
            <div className="mt-3 flex items-baseline gap-2">
              <span
                className="text-white font-bold leading-none"
                style={{
                  fontSize: "3rem",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.03em",
                }}
              >
                {formatTemp(current.tempC, unit)}
              </span>
              <div>
                <p className="text-sm font-medium text-white/80">{current.conditionText}</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div
            className="grid grid-cols-2 gap-px"
            style={{ background: "var(--border-light)" }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-0.5 px-4 py-3"
                style={{ background: "var(--bg-card-light)" }}
              >
                <div className="flex items-center gap-1.5">
                  <s.icon size={11} style={{ color: s.color }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted-light)" }}>
                    {s.label}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary-light)" }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Coords footer */}
          <div
            className="px-4 py-2 text-[10px] font-mono"
            style={{ color: "var(--text-subtle-light)", background: "var(--bg-inset-light)" }}
          >
            {data.coords.lat.toFixed(4)}°, {data.coords.lon.toFixed(4)}°
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
