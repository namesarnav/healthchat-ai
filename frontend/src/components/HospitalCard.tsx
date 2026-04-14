import { MapPin, Star, ExternalLink, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Hospital } from "@/types";

interface Props {
  hospital: Hospital;
  userLat?: number;
  userLng?: number;
}

function formatDistance(m: number): string {
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function getDirectionsUrl(hospital: Hospital, userLat?: number, userLng?: number): string {
  const dest = encodeURIComponent(`${hospital.lat},${hospital.lng}`);
  if (userLat != null && userLng != null) {
    return `https://www.google.com/maps/dir/${userLat},${userLng}/${dest}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${dest}&query_place_id=${hospital.place_id}`;
}

export function HospitalCard({ hospital, userLat, userLng }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all hover:shadow-md animate-slide-in">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{hospital.name}</h3>
          {hospital.address && (
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
              <MapPin size={11} className="flex-shrink-0" />
              <span className="text-xs truncate">{hospital.address}</span>
            </div>
          )}
        </div>
        <a
          href={getDirectionsUrl(hospital, userLat, userLng)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1 text-xs text-primary hover:underline font-medium"
        >
          Directions
          <ExternalLink size={11} />
        </a>
      </div>

      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {hospital.rating != null && (
          <div className="flex items-center gap-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium">{hospital.rating.toFixed(1)}</span>
            {hospital.user_ratings_total != null && (
              <span className="text-xs text-muted-foreground">
                ({hospital.user_ratings_total.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {hospital.open_now != null && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              hospital.open_now ? "text-emerald-600" : "text-red-500"
            )}
          >
            <Clock size={11} />
            <span>{hospital.open_now ? "Open now" : "Closed"}</span>
          </div>
        )}

        {hospital.distance_m != null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Navigation size={11} />
            <span>{formatDistance(hospital.distance_m)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
