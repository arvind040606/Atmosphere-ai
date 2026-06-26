import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Clock, Loader2, MapPin, Search, X } from "lucide-react";
import { useCitySearch } from "../../hooks/useWeather";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import type { CitySearchResult } from "../../types/weather";

export function CitySearch({ onSelect }: { onSelect: (city: CitySearchResult) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const rootRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);
  const { data: results, isFetching, isError, error } = useCitySearch(query);
  const { recents, addRecent, clearRecents } = useRecentSearches();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIdx(-1);
  }, [results, query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) {
        if (e.key === "Enter" || e.key === " ") {
          setOpen(true);
        }
        return;
      }

      const showRecents = query.trim().length < 2;
      const list = showRecents ? recents : (results ?? []);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIdx((prev) =>
            prev < list.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIdx((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIdx >= 0 && list[highlightedIdx]) {
            pick(list[highlightedIdx]);
          }
          break;
        case "Escape":
          setOpen(false);
          setHighlightedIdx(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, query, results, recents, highlightedIdx]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-search-item]");
      items[highlightedIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIdx]);

  function pick(city: CitySearchResult) {
    addRecent(city);
    onSelect(city);
    setQuery("");
    setOpen(false);
    setHighlightedIdx(-1);
    inputRef.current?.blur();
  }

  const showRecents = query.trim().length < 2;
  const list = showRecents ? recents : (results ?? []);
  const showLoadingSkeletons = isFetching && query.trim().length >= 2;

  return (
    <div ref={rootRef} className="relative w-full">
      {/* ── Input wrapper — solid bg, always readable ── */}
      <div className="search-wrap">
        <Search size={15} className="icon-subtle-light shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          type="text"
          inputMode="search"
          placeholder="Search cities, landmarks, coordinates…"
          aria-label="Search worldwide"
          className="input"
        />
        {isFetching && (
          <Loader2 size={14} className="animate-spin shrink-0"
            style={{ color: "var(--accent-blue)" }} />
        )}
        {query && !isFetching && (
          <button
            onClick={() => {
              setQuery("");
              setHighlightedIdx(-1);
            }}
            aria-label="Clear search"
            className="icon-muted-light shrink-0 transition-opacity hover:opacity-70"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="search-dropdown absolute left-0 right-0 z-50 mt-2 overflow-hidden p-1.5 max-h-96"
          >
            {/* Header */}
            {showRecents && recents.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 border-b border-current opacity-10 mb-1">
                <span
  className="mb-0 text-xs font-bold uppercase tracking-[0.2em]"
  style={{
    color: "#94A3B8", // slate-400
  }}
>
  RECENT
</span>
                <button
  onClick={clearRecents}
  className="mb-0 text-xs font-bold uppercase tracking-[0.2em]"
  style={{
    color: "#60A5FA", // Blue
  }}
>
  CLEAR
</button>
              </div>
            )}

            {/* Error */}
            {isError && !showRecents && (
              <div className="mx-1.5 mb-1 flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-xs font-medium"
                style={{ background: "rgba(234,88,12,0.08)", color: "#ea580c" }}>
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <span>{error instanceof Error ? error.message : "Search unavailable"}</span>
              </div>
            )}

            {/* Loading skeletons */}
            {showLoadingSkeletons && (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={`skeleton-${i}`} className="mx-1.5 mb-1 flex gap-3 rounded-xl px-3.5 py-2.5">
                    <div className="w-4 h-4 rounded bg-current opacity-10 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="h-3 rounded bg-current opacity-10 w-32 mb-1.5" />
                      <div className="h-2.5 rounded bg-current opacity-5 w-20" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Empty */}
            {!isError && !showLoadingSkeletons && list.length === 0 && (
              <p className="px-3 py-4 text-center text-sm t-muted">
                {showRecents ? "No recent searches yet" : "No results found"}
              </p>
            )}

            {/* Results */}
            <div ref={listRef} className="space-y-0.5">
              {list.map((city, idx) => (
                <button
                  key={city.id}
                  data-search-item
                  onClick={() => pick(city)}
                  onMouseEnter={() => setHighlightedIdx(idx)}
                  className={`search-row flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors ${
                    highlightedIdx === idx
                      ? "bg-current bg-opacity-10"
                      : "hover:bg-current hover:bg-opacity-5"
                  }`}
                >
                  {showRecents ? (
                    <Clock size={14} className="icon-subtle-light shrink-0" />
                  ) : (
                    <MapPin size={14} style={{ color: "var(--accent-blue)" }} className="shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold t-primary">
                      {city.name}
                    </span>
                    <span className="block truncate text-xs t-muted">
                      {city.displayName || [city.region, city.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                  {/* Coordinates hint */}
                  <span className="text-xs t-subtle shrink-0 tabular-nums">
                    {city.coordinates.lat.toFixed(2)}°, {city.coordinates.lon.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
