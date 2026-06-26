import { useMap } from "react-leaflet";
import { motion } from "framer-motion";
import { Locate, Minus, Plus, RotateCcw } from "lucide-react";
import type { Coordinates } from "../../types/weather";
import type { GeolocationState } from "../../hooks/useGeolocation";

const BTN_BASE = `
  flex h-9 w-9 items-center justify-center rounded-xl
  transition-all hover:scale-105 active:scale-95
`;

function ControlBtn({
  onClick, label, children, accent = false,
}: {
  onClick: () => void; label: string;
  children: React.ReactNode; accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={BTN_BASE}
      style={{
        background: accent
          ? "rgba(43,127,255,0.90)"
          : "rgba(22,27,39,0.88)",
        color:   accent ? "#fff" : "rgba(255,255,255,0.80)",
        border:  `1px solid ${accent ? "rgba(43,127,255,0.60)" : "rgba(255,255,255,0.10)"}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.40)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {children}
    </button>
  );
}

export function MapControls({ homeCoords, geo }: { homeCoords: Coordinates | null; geo: GeolocationState }) {
  const map = useMap();

  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.35 }}
      className="absolute right-3 top-1/2 z-[500] flex -translate-y-1/2 flex-col gap-1.5"
    >
      <ControlBtn onClick={() => map.zoomIn()}  label="Zoom in">
        <Plus size={16} />
      </ControlBtn>
      <ControlBtn onClick={() => map.zoomOut()} label="Zoom out">
        <Minus size={16} />
      </ControlBtn>

      <div className="my-1 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />

      <ControlBtn
        onClick={() => {
          if (homeCoords) map.flyTo([homeCoords.lat, homeCoords.lon], Math.max(map.getZoom(), 11), { duration: 1.0 });
          else map.flyTo([20, 0], 2, { duration: 1.2 });
        }}
        label="Re-centre"
      >
        <RotateCcw size={15} />
      </ControlBtn>

      <ControlBtn
        onClick={() => {
          if (geo.status === "granted" && geo.coords) {
            map.flyTo([geo.coords.lat, geo.coords.lon], 13, { duration: 1.2 });
          } else {
            geo.requestLocation();
          }
        }}
        label={geo.status === "granted" ? "Go to my location" : "Use my location"}
        accent={geo.status === "granted"}
      >
        <Locate size={15} />
      </ControlBtn>
    </motion.div>
  );
}
