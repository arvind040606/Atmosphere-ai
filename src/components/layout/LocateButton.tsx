import { motion } from "framer-motion";
import { Loader2, LocateFixed, LocateOff } from "lucide-react";
import type { GeolocationState } from "../../hooks/useGeolocation";

interface LocateButtonProps {
  geo: GeolocationState;
  compact?: boolean;
}

export function LocateButton({
  geo,
  compact = false,
}: LocateButtonProps) {
  const { status, requestLocation } = geo;

  const isSpinning = status === "loading" || status === "checking";
  const isDenied = status === "denied";
  const isGranted = status === "granted";
  const isUnsupported = status === "unsupported";
  const isError = status === "error";

  const label = isSpinning
    ? "Locating…"
    : isDenied
    ? "Location blocked"
    : isGranted
    ? "Location active"
    : isUnsupported
    ? "Not supported"
    : isError
    ? "Location error"
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
      title={
        isDenied
          ? "Location blocked — click the browser location icon to enable it."
          : isUnsupported
          ? "Geolocation is not supported by this browser."
          : label
      }
      className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border-[1.5px] transition-all hover:opacity-85 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${buttonClass} ${
        isGranted ? "locate-pulse" : ""
      } ${compact ? "locate-btn-compact" : ""}`}
    >
      <motion.span
        animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isSpinning
            ? {
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }
            : {
                duration: 0.2,
              }
        }
        style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {isSpinning ? (
          <Loader2 size={16} />
        ) : isUnsupported ? (
          <LocateOff size={16} />
        ) : (
          <LocateFixed size={16} />
        )}
      </motion.span>

      {!compact && (
        <span className="hidden sm:block whitespace-nowrap text-xs">
          {label}
        </span>
      )}

      {isGranted && (
        <motion.span
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
          }}
          className="h-2 w-2 rounded-full shrink-0"
          style={{
            background: "currentColor",
          }}
        />
      )}
    </button>
  );
}