import type { Coordinates, WeatherSnapshot } from "../../types/weather";

export interface MapMarkerData {
  coords: Coordinates;
  snapshot: WeatherSnapshot;
}

export type MapLayerId =
  | "none"
  | "temp"
  | "precipitation"
  | "wind"
  | "clouds"
  | "pressure";

export interface MapLayerDef {
  id: MapLayerId;
  label: string;
  owmParam: string;
  color: string;
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
}
