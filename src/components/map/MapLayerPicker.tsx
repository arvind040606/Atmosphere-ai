import { MAP_LAYERS } from "./mapLayers";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Layers } from "lucide-react";
import type { MapLayerId } from "./mapTypes";



interface MapLayerPickerProps {
  active: MapLayerId;
  onChange: (id: MapLayerId) => void;
}

export function MapLayerPicker({ active, onChange }: MapLayerPickerProps) {
  const [open, setOpen] = useState(false);
  const activeDef = MAP_LAYERS.find((l) => l.id === active)!;
  const hasOWM = Boolean(import.meta.env.VITE_OWM_API_KEY);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
        style={{
          background: "rgba(22,27,39,0.90)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.40)",
          color: activeDef.id === "none" ? "rgba(255,255,255,0.55)" : activeDef.color,
        }}
      >
        <Layers size={15} />
        <span className="hidden sm:inline">{activeDef.label}</span>
        {!hasOWM && <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.30)" }}>· OWM key needed</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-[calc(100%+8px)] z-[600] overflow-hidden rounded-2xl p-1.5 min-w-[168px]"
            style={{
              background: "rgba(22,27,39,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.65)",
            }}
          >
            {MAP_LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => { onChange(layer.id); setOpen(false); }}
                disabled={!hasOWM && layer.id !== "none"}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-left transition-colors disabled:opacity-35"
                style={{
                  color:      layer.id === active ? layer.color : "rgba(255,255,255,0.70)",
                  fontWeight: layer.id === active ? 700 : 500,
                  background: "transparent",
                }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: layer.color }}
                />
                {layer.label}
                {layer.id === active && (
                  <span className="ml-auto text-xs" style={{ color: layer.color }}>✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
