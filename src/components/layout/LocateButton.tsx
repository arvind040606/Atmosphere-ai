import { AnimatePresence, motion } from "framer-motion";
import { Loader2, LocateFixed, LocateOff } from "lucide-react";
import type { GeolocationState } from "../../hooks/useGeolocation";

export function LocateButton({ geo, compact = false }: { geo: GeolocationState; compact?: boolean }) {
  const { status, requestLocation } = geo;

  const isSpinning  = status === "loading" || status === "checking";
  const isDenied    = status === "denied";
  const isGranted   = status === "granted";
  const isUnsupport = status === "unsupported";
  const isIdle      = status === "idle";
  const isError     = status === "error";

  const label = isSpinning ? "Locating…"
    : isDenied   ? "Location blocked"
    : isGranted  ? "Location active"
    : isUnsupport? "Not supported"
    : isError    ? "Location error"
    : "Use my location";

  const buttonClass = isGranted || isSpinning || isError
    ? "locate-btn-active"
    : isDenied
    ? "locate-btn-denied"
    : "locate-btn-idle";

  return (
    <button
      onClick={requestLocation}
      disabled={isGranted}
      aria-label={label}
      title={isDenied
        ? "Location blocked — click the lock icon in your browser's address bar to re-enable"
        : isUnsupport ? "Geolocation not supported in this browser" : label}
      className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border-[1.5px] transition-all hover:opacity-85 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${buttonClass} ${
        isGranted ? "locate-pulse" : ""
      } ${compact ? "locate-btn-compact" : ""}`}
    >
      {/* Animated icon */}
      <motion.span
        animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
        transition={isSpinning ? { duration: 1.2, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
      >
        {isSpinning    ? <Loader2   size={16} /> :
         isUnsupport   ? <LocateOff size={16} /> :
                         <LocateFixed size={16} />}
      </motion.span>

      {/* Label */}
      {!compact && (
        <span className="hidden sm:block whitespace-nowrap text-xs">
          {label}
        </span>
      )}

      {/* Active dot indicator */}
      {isGranted && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: "currentColor" }}
        />
      )}
    </button>
  );
}
