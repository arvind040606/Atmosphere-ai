import { useCallback, useEffect, useRef, useState } from "react";

export interface GeoCoords {
  lat: number;
  lon: number;
}

export type GeoStatus =
  | "idle"
  | "checking"
  | "loading"
  | "granted"
  | "denied"
  | "unsupported"
  | "error";

export interface GeolocationState {
  coords: GeoCoords | null;
  status: GeoStatus;
  errorMsg: string | null;
  requestLocation: () => void;
}

const GEO_OPTIONS: PositionOptions = {
  timeout: 12_000,
  maximumAge: 5 * 60_000,
  enableHighAccuracy: false,
};

export function useGeolocation(): GeolocationState {
  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;

  // Compute the correct initial status synchronously so we never need
  // setStatus("checking") inside an effect body.
  const [status, setStatus] = useState<GeoStatus>(() => {
    if (!supported) return "unsupported";
    // Always start checking - we'll auto-request location on mount
    return "checking";
  });
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [errorMsg, setError] = useState<string | null>(null);
  const permRef = useRef<PermissionStatus | null>(null);
  const requestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);;

  // Core locate call — fires the browser's native geolocation API.
  const doLocate = useCallback(() => {
    if (!supported) return;
    setStatus("loading");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus("granted");
      },
      (err) => {
        setCoords(null);
        setError(err.message);
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      GEO_OPTIONS
    );
  }, [supported]);

  // On mount: try to get location immediately, with fallback to permissions API
  useEffect(() => {
    if (!supported) return;

    let cancelled = false;

    // If permissions API is available, use it for silent check
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((perm) => {
          if (cancelled) return;
          permRef.current = perm;

          const apply = (state: PermissionState) => {
            if (cancelled) return;
            if (state === "granted") {
              doLocate();
            } else if (state === "denied") {
              setStatus("denied");
            } else {
              // "prompt" — request immediately with a small delay
              requestTimeoutRef.current = setTimeout(() => {
                if (!cancelled) doLocate();
              }, 300);
            }
          };

          apply(perm.state);

          // Watch for permission changes while the tab is open
          const onChange = () => apply(perm.state);
          perm.addEventListener("change", onChange);
          (permRef as React.MutableRefObject<PermissionStatus & { _onChange?: () => void }>).current._onChange = onChange;
        })
        .catch(() => {
          // Permissions API failed, fall back to direct request
          if (!cancelled) {
            requestTimeoutRef.current = setTimeout(() => {
              if (!cancelled) doLocate();
            }, 300);
          }
        });
    } else {
      // Permissions API not available (Safari), request directly after brief delay
      requestTimeoutRef.current = setTimeout(() => {
        if (!cancelled) doLocate();
      }, 300);
    }

    return () => {
      cancelled = true;
      if (requestTimeoutRef.current) clearTimeout(requestTimeoutRef.current);
      const perm = permRef.current as (PermissionStatus & { _onChange?: () => void }) | null;
      if (perm?._onChange) {
        perm.removeEventListener("change", perm._onChange);
      }
    };
  }, [doLocate, supported]);

  // Public trigger — safe to call from any button click
  const requestLocation = useCallback(() => {
    if (status === "granted" || status === "loading" || status === "checking") return;
    doLocate();
  }, [doLocate, status]);

  return { coords, status, errorMsg, requestLocation };
}
