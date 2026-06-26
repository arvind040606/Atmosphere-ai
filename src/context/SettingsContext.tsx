import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "../constants/weather";
import type { AppSettings, ThemeMode, TemperatureUnit } from "../types/weather";

interface SettingsContextValue extends AppSettings {
  resolvedMode: "light" | "dark";
  setThemeMode: (mode: ThemeMode) => void;
  setUnit: (unit: TemperatureUnit) => void;
  toggleMode: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (raw) return JSON.parse(raw) as AppSettings;
  } catch {
    /* fall through to defaults */
  }
  return { themeMode: "system", unit: "C" };
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => readSettings());
  const [systemDark, setSystemDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  const resolvedMode = useMemo<"light" | "dark">(() => {
    if (settings.themeMode === "system") return systemDark ? "dark" : "light";
    return settings.themeMode;
  }, [settings.themeMode, systemDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedMode === "dark");
  }, [resolvedMode]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      resolvedMode,
      setThemeMode: (themeMode) => setSettings((s) => ({ ...s, themeMode })),
      setUnit: (unit) => setSettings((s) => ({ ...s, unit })),
      toggleMode: () =>
        setSettings((s) => ({
          ...s,
          themeMode: resolvedMode === "dark" ? "light" : "dark",
        })),
    }),
    [settings, resolvedMode]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export { SettingsContext };
export type { SettingsContextValue };
