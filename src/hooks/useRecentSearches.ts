import { useCallback, useEffect, useState } from "react";
import { MAX_RECENT_SEARCHES, STORAGE_KEYS } from "../constants/weather";
import type { CitySearchResult } from "../types/weather";

function readStorage(): CitySearchResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.recentSearches);
    return raw ? (JSON.parse(raw) as CitySearchResult[]) : [];
  } catch {
    return [];
  }
}

export function useRecentSearches() {
  const [recents, setRecents] = useState<CitySearchResult[]>(() => readStorage());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(recents));
  }, [recents]);

  const addRecent = useCallback((city: CitySearchResult) => {
    setRecents((prev) => {
      const deduped = prev.filter((c) => c.id !== city.id);
      return [city, ...deduped].slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  const clearRecents = useCallback(() => setRecents([]), []);

  return { recents, addRecent, clearRecents };
}
