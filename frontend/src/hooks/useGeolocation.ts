import { useState, useCallback } from "react";
import type { Coords } from "@/types";

type GeolocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; coords: Coords }
  | { status: "error"; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: "idle" });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Geolocation is not supported by your browser." });
      return;
    }
    setState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "success",
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        });
      },
      (err) => {
        setState({
          status: "error",
          message: err.message || "Location access denied. Enable location to find nearby hospitals.",
        });
      },
      { timeout: 10000 }
    );
  }, []);

  return { ...state, request };
}
