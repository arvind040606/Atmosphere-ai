import type { ConditionFamily } from "../constants/weather";

export interface SceneTheme {
  label: string;
  heroBg: string;          // solid gradient for hero card
  heroText: string;        // always white or near-white on hero
  accent: string;
  accentDeep: string;
  accentSoft: string;      // 15% opacity tint for icon backgrounds
  chipBg: string;          // quick-stat chip background on hero
}

export const SCENE_THEMES: Record<ConditionFamily, SceneTheme> = {
  sun: {
    label: "Clear",
    heroBg: "linear-gradient(145deg, #1a6dbd 0%, #f5a623 55%, #f9c74f 100%)",
    heroText: "#fff",
    accent: "#f59e0b",
    accentDeep: "#d97706",
    accentSoft: "rgba(245,158,11,0.15)",
    chipBg: "rgba(0,0,0,0.20)",
  },
  cloud: {
    label: "Cloudy",
    heroBg: "linear-gradient(145deg, #2c3e6b 0%, #4a6491 50%, #8599b8 100%)",
    heroText: "#fff",
    accent: "#94a3b8",
    accentDeep: "#64748b",
    accentSoft: "rgba(148,163,184,0.15)",
    chipBg: "rgba(0,0,0,0.22)",
  },
  rain: {
    label: "Rain",
    heroBg: "linear-gradient(145deg, #0f2744 0%, #1a4a8a 50%, #2b7fff 100%)",
    heroText: "#fff",
    accent: "#2b7fff",
    accentDeep: "#1d4ed8",
    accentSoft: "rgba(43,127,255,0.15)",
    chipBg: "rgba(0,0,0,0.25)",
  },
  storm: {
    label: "Storm",
    heroBg: "linear-gradient(145deg, #0d0a1e 0%, #2d1b69 50%, #7c3aed 100%)",
    heroText: "#fff",
    accent: "#7c3aed",
    accentDeep: "#5b21b6",
    accentSoft: "rgba(124,58,237,0.15)",
    chipBg: "rgba(0,0,0,0.30)",
  },
  snow: {
    label: "Snow",
    heroBg: "linear-gradient(145deg, #1e3a5f 0%, #2d6098 50%, #93c5fd 100%)",
    heroText: "#fff",
    accent: "#93c5fd",
    accentDeep: "#3b82f6",
    accentSoft: "rgba(147,197,253,0.15)",
    chipBg: "rgba(0,0,0,0.20)",
  },
  fog: {
    label: "Fog",
    heroBg: "linear-gradient(145deg, #2a3240 0%, #4a5568 50%, #94a3b8 100%)",
    heroText: "#fff",
    accent: "#94a3b8",
    accentDeep: "#64748b",
    accentSoft: "rgba(148,163,184,0.15)",
    chipBg: "rgba(0,0,0,0.22)",
  },
};
