import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Clock, Loader2, MapPin, Search, X } from "lucide-react";
import { useCitySearch } from "../../hooks/useWeather";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import type { CitySearchResult } from "../../types/weather";

interface MapSearchBarProps {
  onSelect: (city: CitySearchResult) => void;
  placeholder?: string;
}

export function MapSearchBar({ onSelect, placeholder = "Search any city…" }: MapSearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);
  const rootRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isFetching, isError, error } = useCitySearch(query);
  const { recents, addRecent, clearRecents } = useRecentSearches();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function pick(city: CitySearchResult) {
    addRecent(city);
    onSelect(city);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  const showRecents = query.trim().length < 2;
  const list        = showRecents ? recents : (results ?? []);

  return (
    <div ref={rootRef} className="relative w-full max-w-lg">
      {/* Input */}
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{
          background: "rgba(22,27,39,0.90)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
        }}
      >
        <Search size={16} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          type="text"
          inputMode="search"
          placeholder={placeholder}
          aria-label="Search for a city"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#e8f0fe",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
          className="placeholder:text-white/30"
        />
        {isFetching && (
          <Loader2 size={14} className="animate-spin shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
        )}
        {query && !isFetching && (
          <button
            onClick={() => setQuery("")}
            style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}
            className="transition-opacity hover:opacity-70"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl p-1.5"
            style={{
              background: "rgba(22,27,39,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.65)",
            }}
          >
            {showRecents && (
              <div className="flex items-center justify-between px-3 py-2">
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
                  Recent
                </span>
                {recents.length > 0 && (
                  <button
                    onClick={clearRecents}
                    style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}
                    className="transition-opacity hover:opacity-70"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {isError && !showRecents && (
              <div
                className="mx-1.5 mb-1.5 flex items-start gap-2.5 rounded-xl px-3.5 py-3"
                style={{ background: "rgba(234,88,12,0.12)", color: "#fb923c", fontSize: "0.78rem" }}
              >
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <span>{error instanceof Error ? error.message : "Search unavailable"}</span>
              </div>
            )}

            {!isError && list.length === 0 && (
              <p className="px-3 py-4 text-center" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.35)" }}>
                {showRecents ? "No recent searches" : "No cities found"}
              </p>
            )}

            {list.map((city) => (
              <button
                key={city.id}
                onClick={() => pick(city)}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors"
                style={{ color: "#e8f0fe" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {showRecents
                  ? <Clock size={13} style={{ color: "rgba(255,255,255,0.30)", flexShrink: 0 }} />
                  : <MapPin size={13} style={{ color: "#2b7fff", flexShrink: 0 }} />}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{city.name}</span>
                  <span className="block truncate" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.40)" }}>
                    {[city.region, city.country].filter(Boolean).join(", ")}
                  </span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
