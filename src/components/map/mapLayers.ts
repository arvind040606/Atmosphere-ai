import type { MapLayerDef } from "./mapTypes";

export const MAP_LAYERS: MapLayerDef[] = [
  { id: "none",          label: "None",          owmParam: "",                  color: "#64748b" },
  { id: "temp",          label: "Temperature",   owmParam: "temp_new",          color: "#f59e0b" },
  { id: "precipitation", label: "Precipitation", owmParam: "precipitation_new", color: "#2b7fff" },
  { id: "wind",          label: "Wind",          owmParam: "wind_new",          color: "#0d9488" },
  { id: "clouds",        label: "Clouds",        owmParam: "clouds_new",        color: "#94a3b8" },
  { id: "pressure",      label: "Pressure",      owmParam: "pressure_new",      color: "#7c3aed" },
];
