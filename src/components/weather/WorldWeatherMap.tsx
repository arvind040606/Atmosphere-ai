import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, useMap, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Layers, MapPin, Loader2, Thermometer, Droplets, Wind, Eye, Bell } from "lucide-react";
import { weatherClient } from "../../services/apiClient";
import { mapConditionCode, CONDITION_FAMILY } from "../../constants/weather";
import { WEATHER_ICONS } from "../../utils/weatherIcons";
import { SCENE_THEMES } from "../../animations/sceneThemes";
import { useSettings } from "../../context/useSettings";
import { formatTemp } from "../../utils/format";
import type { Coordinates } from "../../types/weather";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LayerId = "temp" | "precipitation" | "wind" | "clouds" | "pressure";
type AnyIcon = React.ElementType<{ size: number; style?: React.CSSProperties }>;
interface LayerDef { id: LayerId; label: string; icon: AnyIcon; owmLayer: string; color: string; }

function GaugeIcon({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 2a10 10 0 0 0-7.38 16.75"/>
      <circle cx="12" cy="12" r="2"/><path d="m12 10-3-5"/>
    </svg>
  );
}

const LAYERS: LayerDef[] = [
  { id: "temp",          label: "Temperature",   icon: Thermometer, owmLayer: "temp_new",          color: "#f59e0b" },
  { id: "precipitation", label: "Precipitation", icon: Droplets,    owmLayer: "precipitation_new", color: "#2b7fff" },
  { id: "wind",          label: "Wind Speed",    icon: Wind,        owmLayer: "wind_new",          color: "#0d9488" },
  { id: "clouds",        label: "Cloud Cover",   icon: Eye,         owmLayer: "clouds_new",        color: "#94a3b8" },
  { id: "pressure",      label: "Pressure",      icon: GaugeIcon,   owmLayer: "pressure_new",      color: "#7c3aed" },
];

const CONDITION_EMOJI: Record<string, string> = {
  "clear-day":"☀️","clear-night":"🌙","partly-cloudy-day":"⛅","partly-cloudy-night":"🌤",
  cloudy:"☁️",rain:"🌧",drizzle:"🌦",thunderstorm:"⛈",snow:"❄️",sleet:"🌨",fog:"🌫",
};

export interface MapPinWeather {
  coords: Coordinates;
  name: string;
  region: string;
  country: string;
  tempC: number;
  condition: string;
  humidity: number;
  windKph: number;
  conditionCode: number;
  isDay: boolean;
}

function WeatherTileLayer({ layerId }: { layerId: LayerId }) {
  const map = useMap();
  const ref = useRef<L.TileLayer | null>(null);
  const def = LAYERS.find(l => l.id === layerId)!;
  const key = import.meta.env.VITE_OWM_API_KEY ?? "";
  const url = key ? `https://tile.openweathermap.org/map/${def.owmLayer}/{z}/{x}/{y}.png?appid=${key}` : "";
  useEffect(() => {
    if (ref.current) { map.removeLayer(ref.current); ref.current = null; }
    if (!url) return;
    ref.current = L.tileLayer(url, { opacity: 0.65, attribution: "© OpenWeatherMap" });
    ref.current.addTo(map);
    return () => { if (ref.current) map.removeLayer(ref.current); };
  }, [map, url]);
  return null;
}

function ClickHandler({
  onPin, onLoading,
}: {
  onPin: (pw: MapPinWeather) => void;
  onLoading: (v: boolean) => void;
}) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      onLoading(true);
      try {
        const { data } = await weatherClient.get<{
          location: { name: string; region: string; country: string };
          current: {
            temp_c: number;
            condition: { text: string; code: number };
            humidity: number;
            wind_kph: number;
            is_day: number;
          };
        }>("/current.json", { params: { q: `${lat},${lng}` } });

        onPin({
          coords: { lat, lon: lng },
          name: data.location.name,
          region: data.location.region,
          country: data.location.country,
          tempC: data.current.temp_c,
          condition: data.current.condition.text,
          humidity: data.current.humidity,
          windKph: data.current.wind_kph,
          conditionCode: data.current.condition.code,
          isDay: data.current.is_day === 1,
        });
      } catch { /* ignore map click errors */ } finally {
        onLoading(false);
      }
    },
  });
  return null;
}

function FlyTo({ coords }: { coords: Coordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lon], 9, { duration: 1.4, easeLinearity: 0.4 });
  }, [map, coords]);
  return null;
}

function makePin(emoji: string, hasAlert: boolean): L.DivIcon {
  const ring = hasAlert
    ? `box-shadow:0 0 0 3px #dc2626,0 2px 12px rgba(220,38,38,0.50)`
    : `box-shadow:0 2px 12px rgba(43,127,255,0.35)`;
  const border = hasAlert ? "2.5px solid #dc2626" : "2.5px solid #2b7fff";
  return L.divIcon({
    html: `<div style="width:38px;height:38px;border-radius:50%;background:#fff;border:${border};display:flex;align-items:center;justify-content:center;font-size:19px;${ring}">${emoji}</div>`,
    iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -24], className: "",
  });
}

function PinPopup({
  pw, onViewAlerts,
}: {
  pw: MapPinWeather;
  onViewAlerts: () => void;
}) {
  const { unit } = useSettings();
  const cond   = mapConditionCode(pw.conditionCode, pw.isDay);
  const family = CONDITION_FAMILY[cond];
  const theme  = SCENE_THEMES[family];
  const Icon   = WEATHER_ICONS[cond];

  return (
    <div className="w-56 overflow-hidden">
      {/* Header band */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ background: `${theme.accent}18`, borderBottom: "1px solid var(--border-light)" }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${theme.accent}22` }}
        >
          <Icon size={17} style={{ color: theme.accent }} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold t-primary">{pw.name}</p>
          <p className="truncate text-xs t-muted">
            {[pw.region, pw.country].filter(Boolean).join(", ")}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 py-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
        {[
          { icon: Thermometer, val: formatTemp(pw.tempC, unit), label: "Temp" },
          { icon: Droplets,    val: `${pw.humidity}%`,         label: "Humid" },
          { icon: Wind,        val: `${Math.round(pw.windKph)}`, label: "km/h" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-0.5">
            <s.icon size={11} className="t-subtle" />
            <span className="text-sm font-bold t-primary">{s.val}</span>
            <span className="text-[10px] t-subtle">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Alerts CTA */}
      <button
        onClick={onViewAlerts}
        className="flex w-full items-center justify-center gap-2 py-3 text-xs font-bold transition-colors hover:opacity-80"
        style={{ color: "var(--accent-blue)" }}
      >
        <Bell size={12} />
        Check weather alerts here
      </button>
    </div>
  );
}

function LayerPicker({ active, onChange }: { active: LayerId; onChange: (id: LayerId) => void }) {
  const [show, setShow] = useState(false);
  const def = LAYERS.find(l => l.id === active)!;
  return (
    <div className="absolute right-3 top-3 z-[500]">
      <button
        onClick={() => setShow(o => !o)}
        className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold shadow-lg"
        style={{ color: "var(--text-primary-light)" }}
      >
        <Layers size={13} />
        <span>{def.label}</span>
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="glass mt-2 overflow-hidden rounded-2xl p-1.5 shadow-xl"
            style={{ border: "1px solid var(--border-light)" }}
          >
            {LAYERS.map(layer => (
              <button
                key={layer.id}
                onClick={() => { onChange(layer.id); setShow(false); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs text-left transition-colors hover:bg-[var(--bg-inset-light)]"
                style={{
                  color: layer.id === active ? layer.color : "var(--text-primary-light)",
                  fontWeight: layer.id === active ? 700 : 500,
                }}
              >
                <layer.icon size={13} style={{ color: layer.color }} />
                {layer.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface WorldWeatherMapProps {
  focusCoords?: Coordinates | null;
  onAlertRequest?: (coords: Coordinates, name: string) => void;
}

export function WorldWeatherMap({ focusCoords, onAlertRequest }: WorldWeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState<LayerId>("temp");
  const [pin, setPin]     = useState<MapPinWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const hasOWM = Boolean(import.meta.env.VITE_OWM_API_KEY);

  const cond  = pin ? mapConditionCode(pin.conditionCode, pin.isDay) : "clear-day";
  const emoji = CONDITION_EMOJI[cond] ?? "📍";

  function handleViewAlerts() {
    if (pin && onAlertRequest) {
      onAlertRequest(pin.coords, `${pin.name}, ${pin.country}`);
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider t-muted">
          World Weather Map
        </h2>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="flex items-center gap-1.5 text-xs t-muted">
              <Loader2 size={12} className="animate-spin" /> Fetching…
            </span>
          )}
          {!hasOWM && (
            <span
              className="badge"
              style={{
                background: "rgba(245,158,11,0.10)",
                color: "var(--color-sun-deep)",
                border: "1px solid rgba(245,158,11,0.25)",
              }}
            >
              Add OWM key for overlays
            </span>
          )}
        </div>
      </div>

      <div className="card relative overflow-hidden" style={{ height: 500, padding: 0 }}>
        <MapContainer
          center={[20, 0]} zoom={2} minZoom={2} maxZoom={14}
          style={{ height: "100%", width: "100%" }}
          worldCopyJump
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://www.openstreetmap.org">OSM</a>'
            subdomains="abcd" maxZoom={19}
          />
          <WeatherTileLayer layerId={activeLayer} />
          <ClickHandler onPin={setPin} onLoading={setLoading} />
          <FlyTo coords={focusCoords ?? null} />
          {pin && (
            <Marker
              position={[pin.coords.lat, pin.coords.lon]}
              icon={makePin(emoji, false)}
            >
              <Popup minWidth={224} maxWidth={224} closeButton>
                <PinPopup pw={pin} onViewAlerts={handleViewAlerts} />
              </Popup>
            </Marker>
          )}
        </MapContainer>

        <LayerPicker active={activeLayer} onChange={setActiveLayer} />

        <div
          className="glass absolute bottom-3 left-3 z-[500] flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium"
          style={{ color: "var(--text-muted-light)" }}
        >
          <MapPin size={11} style={{ color: "var(--accent-blue)" }} />
          Tap anywhere · click "Check alerts" in popup
        </div>
      </div>
    </section>
  );
}
