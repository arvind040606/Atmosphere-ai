import L from "leaflet";
import type { WeatherCondition } from "../../types/weather";

const CONDITION_EMOJI: Record<WeatherCondition, string> = {
  "clear-day":           "☀️",
  "clear-night":         "🌙",
  "partly-cloudy-day":   "⛅",
  "partly-cloudy-night": "🌤",
  cloudy:                "☁️",
  rain:                  "🌧",
  drizzle:               "🌦",
  thunderstorm:          "⛈",
  snow:                  "❄️",
  sleet:                 "🌨",
  fog:                   "🌫",
};

/** Builds a fully custom HTML marker icon for a given weather condition. */
export function makeWeatherMarker(condition: WeatherCondition, isHome = false): L.DivIcon {
  const emoji = CONDITION_EMOJI[condition];
  const ring  = isHome
    ? "box-shadow:0 0 0 3px #2b7fff,0 4px 20px rgba(43,127,255,0.45);"
    : "box-shadow:0 4px 20px rgba(0,0,0,0.22);";
  const border = isHome ? "border:2.5px solid #2b7fff;" : "border:2px solid rgba(255,255,255,0.9);";

  return L.divIcon({
    html: `
      <div style="
        width:44px;height:44px;border-radius:50%;
        background:rgba(22,27,39,0.92);
        backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
        display:flex;align-items:center;justify-content:center;
        font-size:22px;
        ${border}
        ${ring}
        transition:transform 0.2s ease;
      ">
        ${emoji}
        ${isHome ? `<span style="
          position:absolute;bottom:-2px;right:-2px;
          width:12px;height:12px;border-radius:50%;
          background:#2b7fff;
          border:2px solid #0d1117;
          display:block;
        "></span>` : ""}
      </div>
    `,
    iconSize:    [44, 44],
    iconAnchor:  [22, 22],
    popupAnchor: [0, -26],
    className:   "",
  });
}

/** Fix Vite asset pipeline breaking Leaflet's default icon URLs */
export function fixLeafletDefaultIcons(): void {
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}
