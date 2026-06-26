import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, Loader2, MapPin, Satellite, Maximize2, Minimize2 } from "lucide-react";
import { LocationMarker } from "./LocationMarker";
import { MapControls } from "./MapControls";
import { OWMTileLayer } from "./OWMTileLayer";
import { WeatherOverlayCard } from "./WeatherOverlayCard";
import { MapLayerPicker } from "./MapLayerPicker";
import { MapSearchBar } from "./MapSearchBar";
import { fixLeafletDefaultIcons } from "./markerIcons";
import { useMapFullscreen } from "../../hooks/useMap";
import type { MapLayerId, MapMarkerData } from "./mapTypes";
import type { CitySearchResult, Coordinates, WeatherSnapshot } from "../../types/weather";
import type { GeolocationState } from "../../hooks/useGeolocation";

fixLeafletDefaultIcons();

// ── Map base styles ───────────────────────────────────────────────────────────
type BaseStyle = "satellite" | "street";

const BASE_TILES: Record<BaseStyle, { url: string; attr: string; maxZoom: number }> = {
  satellite: {
    // Esri World Imagery — free, no key, true satellite
    url:     "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr:    "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  },
  street: {
    // CartoDB Voyager — clean, modern, English labels
    url:     "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attr:    "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com'>CARTO</a>",
    maxZoom: 19,
  },
};

// English-only labels overlay (sits on top of satellite tiles)
const ENGLISH_LABELS = {
  url:  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
  attr: "&copy; <a href='https://carto.com'>CARTO</a>",
};

// ── Click handler ─────────────────────────────────────────────────────────────
function ClickHandler({ onMapClick }: { onMapClick: (coords: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      // Works for ocean, rivers, Antarctica — any lat/lon on Earth
      onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

// ── Base style toggle button ──────────────────────────────────────────────────
function BaseStyleToggle({
  current, onChange,
}: {
  current: BaseStyle;
  onChange: (s: BaseStyle) => void;
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-2xl p-1"
      style={{
        background: "rgba(13,17,23,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.40)",
      }}
    >
      {(["satellite", "street"] as BaseStyle[]).map((style) => {
        const active = current === style;
        const Icon   = style === "satellite" ? Satellite : Globe2;
        return (
          <button
            key={style}
            onClick={() => onChange(style)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all"
            style={{
              background: active ? "rgba(43,127,255,0.85)" : "transparent",
              color:      active ? "#fff" : "rgba(255,255,255,0.45)",
            }}
          >
            <Icon size={13} />
            <span className="hidden sm:inline capitalize">{style}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Fullscreen button ─────────────────────────────────────────────────────────
function FullscreenButton({
  isFullscreen,
  onClick,
}: {
  isFullscreen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-xl px-2.5 py-2 text-xs font-bold transition-all"
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      style={{
        background: isFullscreen ? "rgba(43,127,255,0.85)" : "rgba(13,17,23,0.88)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.40)",
        backdropFilter: "blur(20px)",
      }}
    >
      {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface WeatherMapProps {
  primaryMarker:     MapMarkerData | null;
  extraMarkers:      MapMarkerData[];
  isLoadingPrimary:  boolean;
  onSearchSelect:    (city: CitySearchResult) => void;
  onMapClick:        (coords: Coordinates) => void;
  onClearExtras:     () => void;
  geo:               GeolocationState;
  homeCoords:        Coordinates | null;
}

export function WeatherMap({
  primaryMarker,
  extraMarkers,
  isLoadingPrimary,
  onSearchSelect,
  onMapClick,
  onClearExtras,
  geo,
  homeCoords,
}: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayerId>(() =>
    import.meta.env.VITE_OWM_API_KEY ? "clouds" : "none"
  );
  const [baseStyle, setBaseStyle] = useState<BaseStyle>("satellite");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleFullscreen } = useMapFullscreen(containerRef);
  
  const tiles = BASE_TILES[baseStyle];

  const handleFullscreenToggle = async () => {
    await toggleFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        handleFullscreenToggle();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const displaySnapshot: WeatherSnapshot | null =
    primaryMarker?.snapshot ??
    extraMarkers[extraMarkers.length - 1]?.snapshot ??
    null;

  return (
    <div 
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${isFullscreen ? "map-fullscreen" : ""}`}
    >
      {/* ── Leaflet map ── */}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={16}
        zoomControl={false}
        style={{ height: "100%", width: "100%", background: "#0d1117" }}
        worldCopyJump
      >
        {/* Base tile layer */}
        <TileLayer
          key={baseStyle}          // force remount on style change
          url={tiles.url}
          attribution={tiles.attr}
          maxZoom={tiles.maxZoom}
          subdomains={baseStyle === "street" ? "abcd" : ""}
        />

        {/* English label overlay on satellite */}
        {baseStyle === "satellite" && (
          <TileLayer
            url={ENGLISH_LABELS.url}
            attribution={ENGLISH_LABELS.attr}
            subdomains="abcd"
            maxZoom={19}
            zIndex={200}
            opacity={0.9}
          />
        )}

        {/* OWM weather overlay */}
        <OWMTileLayer layerId={activeLayer} />

        <ClickHandler onMapClick={onMapClick} />
        <MapControls homeCoords={homeCoords} geo={geo} />

        {primaryMarker && (
          <LocationMarker data={primaryMarker} isHome autoOpen onFly />
        )}

        {extraMarkers.map((m) => (
          <LocationMarker
            key={`${m.coords.lat.toFixed(4)}-${m.coords.lon.toFixed(4)}`}
            data={m}
            isHome={false}
            autoOpen
            onFly={false}
          />
        ))}
      </MapContainer>

      {/* ── Top toolbar ── */}
      <div className="absolute left-3 right-3 top-3 z-[500] flex items-center gap-2">
        <div className="flex-1">
          <MapSearchBar onSelect={onSearchSelect} />
        </div>
        <BaseStyleToggle current={baseStyle} onChange={setBaseStyle} />
        <MapLayerPicker active={activeLayer} onChange={setActiveLayer} />
        <FullscreenButton isFullscreen={isFullscreen} onClick={handleFullscreenToggle} />
      </div>

      {/* ── Loading overlay ── */}
      <AnimatePresence>
        {isLoadingPrimary && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-[400] flex items-center justify-center"
            style={{ background: "rgba(13,17,23,0.50)", backdropFilter: "blur(4px)" }}
          >
            <div
              className="flex items-center gap-3 rounded-2xl px-5 py-3.5"
              style={{
                background: "rgba(22,27,39,0.96)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.60)",
              }}
            >
              <Loader2 size={17} className="animate-spin" style={{ color: "#2b7fff" }} />
              <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.80)" }}>
                Fetching weather…
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating weather card ── */}
      <AnimatePresence>
        {displaySnapshot && !isLoadingPrimary && (
          <WeatherOverlayCard snapshot={displaySnapshot} />
        )}
      </AnimatePresence>

      {/* ── Clear pins button ── */}
      <AnimatePresence>
        {extraMarkers.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            onClick={onClearExtras}
            className="absolute bottom-4 right-3 z-[500] flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition-opacity hover:opacity-80"
            style={{
              background: "rgba(22,27,39,0.92)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <MapPin size={11} style={{ color: "#2b7fff" }} />
            {extraMarkers.length} pin{extraMarkers.length !== 1 ? "s" : ""} · clear
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Hint (no data yet) ── */}
      {!displaySnapshot && !isLoadingPrimary && (
        <div
          className="absolute bottom-4 left-1/2 z-[500] -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium"
          style={{
            background: "rgba(13,17,23,0.82)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.40)",
            backdropFilter: "blur(12px)",
          }}
        >
          Search a city or tap anywhere on the map for live weather
        </div>
      )}
    </div>
  );
}
