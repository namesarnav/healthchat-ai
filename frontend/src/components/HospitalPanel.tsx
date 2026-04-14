import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, MapPin, X } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/lib/api";
import { HospitalCard } from "./HospitalCard";
import { HospitalMap } from "./HospitalMap";
import type { Hospital } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  specialistType: string;
  onDismiss: () => void;
}

const SPECIALIST_LABELS: Record<string, string> = {
  cardiologist: "Cardiologists & Heart Centers",
  neurologist: "Neurologists & Brain Specialists",
  psychiatrist: "Mental Health & Psychiatric Care",
  pulmonologist: "Pulmonologists & Respiratory Care",
  gastroenterologist: "Gastroenterologists",
  emergency: "Emergency Hospitals",
  ophthalmologist: "Eye Specialists",
  allergist: "Allergy Clinics",
  general: "Hospitals & Clinics",
};

export function HospitalPanel({ specialistType, onDismiss }: Props) {
  const geo = useGeolocation();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    geo.request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (geo.status !== "success" || fetchState !== "idle") return;
    setFetchState("loading");
    api
      .getNearbyHospitals(geo.coords.lat, geo.coords.lng, specialistType)
      .then((data) => {
        setHospitals(data);
        setFetchState("done");
      })
      .catch((e) => {
        setFetchError(e.message || "Failed to fetch hospitals.");
        setFetchState("error");
      });
  }, [geo.status, specialistType, fetchState]);

  const label = SPECIALIST_LABELS[specialistType.toLowerCase()] ?? "Nearby Specialists";
  const userCoords = geo.status === "success" ? geo.coords : undefined;

  return (
    <div className="border-t border-amber-200 bg-amber-50/60 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle size={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Critical Condition Detected</p>
            <p className="text-xs text-amber-700">{label}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="w-7 h-7 rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-100 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 max-h-[480px] overflow-y-auto space-y-3">
        {/* Geolocation loading */}
        {(geo.status === "idle" || geo.status === "loading") && (
          <div className="flex items-center gap-2 text-sm text-amber-700 py-2">
            <Loader2 size={14} className="animate-spin" />
            <span>Requesting your location…</span>
          </div>
        )}

        {/* Geolocation error */}
        {geo.status === "error" && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="font-medium">Location access denied</p>
            <p className="text-xs mt-0.5">{geo.message}</p>
            <p className="text-xs mt-1 text-muted-foreground">
              Enable location permissions to find nearby hospitals automatically.
            </p>
          </div>
        )}

        {/* Hospitals loading */}
        {fetchState === "loading" && (
          <div className="flex items-center gap-2 text-sm text-amber-700 py-2">
            <Loader2 size={14} className="animate-spin" />
            <span>Finding nearby specialists…</span>
          </div>
        )}

        {/* Hospitals fetch error */}
        {fetchState === "error" && (
          <p className="text-sm text-red-600">{fetchError}</p>
        )}

        {/* Map + list */}
        {fetchState === "done" && hospitals.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">No hospitals found nearby.</p>
        )}

        {fetchState === "done" && hospitals.length > 0 && userCoords && (
          <>
            {/* Embedded map */}
            <HospitalMap userCoords={userCoords} hospitals={hospitals} />

            {/* List */}
            <div className="space-y-2">
              <div className={cn("flex items-center gap-1 text-xs text-amber-700")}>
                <MapPin size={11} />
                <span>{hospitals.length} results near your location — click a pin for directions</span>
              </div>
              {hospitals.map((h) => (
                <HospitalCard
                  key={h.place_id}
                  hospital={h}
                  userLat={userCoords.lat}
                  userLng={userCoords.lng}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
