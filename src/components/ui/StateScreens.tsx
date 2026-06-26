import { motion } from "framer-motion";
import { CloudOff, LocateFixed, SearchX, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import type { GeolocationState } from "../../hooks/useGeolocation";
import { LocateButton } from "../layout/LocateButton";

function StateScreen({ icon, title, description, action }: {
  icon: ReactNode; title: string; description: string; action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="card mx-auto flex max-w-md flex-col items-center gap-5 p-10 text-center"
    >
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="t-subtle"
      >
        {icon}
      </motion.div>
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold t-primary">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed t-secondary">{description}</p>
      </div>
      {action}
    </motion.div>
  );
}

export function CityNotFoundState({ query }: { query: string }) {
  return (
    <StateScreen
      icon={<SearchX size={44} strokeWidth={1.25} />}
      title="Location not found"
      description={`We couldn't find "${query}". Try checking the spelling or searching a nearby major city.`}
    />
  );
}

export function NetworkErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StateScreen
      icon={<WifiOff size={44} strokeWidth={1.25} />}
      title="No connection"
      description="We couldn't reach the weather service. Check your internet connection and try again."
      action={
        <button
          onClick={onRetry}
          className="rounded-full px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--accent-blue)" }}
        >
          Retry
        </button>
      }
    />
  );
}

export function NoSelectionEmptyState({ geo }: { geo: GeolocationState }) {
  const denied     = geo.status === "denied";
  const unsupported = geo.status === "unsupported";

  return (
    <StateScreen
      icon={<CloudOff size={44} strokeWidth={1.25} />}
      title="Where in the world?"
      description={
        denied || unsupported
          ? "Location access isn't available. Use the search bar above to find any city."
          : "Allow location access for instant local weather, or search for any city worldwide."
      }
      action={
        !denied && !unsupported ? (
          <div className="flex flex-col items-center gap-2">
            <LocateButton geo={geo} />
            <p className="text-xs t-subtle">Your coordinates are never stored.</p>
          </div>
        ) : denied ? (
          <div
            className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold"
            style={{
              background: "rgba(245,158,11,0.07)",
              borderColor: "rgba(245,158,11,0.25)",
              color: "var(--color-sun-deep)",
            }}
          >
            <LocateFixed size={13} />
            Enable location in your browser's site settings
          </div>
        ) : null
      }
    />
  );
}
