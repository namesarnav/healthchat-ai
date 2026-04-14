import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Hospital, Coords } from "@/types";

// Fix Leaflet's broken default icon paths when bundled with Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "hue-rotate-[200deg]", // blue tint for user marker
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [22, 36],
  iconAnchor: [11, 36],
  popupAnchor: [1, -30],
  className: "hue-rotate-[320deg] brightness-110", // red tint for hospitals
});

function FitBounds({ coords, hospitals }: { coords: Coords; hospitals: Hospital[] }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [
      [coords.lat, coords.lng],
      ...hospitals.map((h): [number, number] => [h.lat, h.lng]),
    ];
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 15 });
    }
  }, [coords, hospitals, map]);
  return null;
}

interface Props {
  userCoords: Coords;
  hospitals: Hospital[];
}

export function HospitalMap({ userCoords, hospitals }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: 220 }}>
      <MapContainer
        center={[userCoords.lat, userCoords.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location */}
        <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
          <Popup>
            <span className="font-semibold text-xs">Your location</span>
          </Popup>
        </Marker>

        {/* Hospital markers */}
        {hospitals.map((h) => (
          <Marker key={h.place_id} position={[h.lat, h.lng]} icon={hospitalIcon}>
            <Popup>
              <div className="text-xs leading-snug">
                <p className="font-semibold">{h.name}</p>
                {h.address && <p className="text-gray-500 mt-0.5">{h.address}</p>}
                {h.distance_m != null && (
                  <p className="text-gray-400 mt-0.5">
                    {h.distance_m < 1000
                      ? `${h.distance_m} m away`
                      : `${(h.distance_m / 1000).toFixed(1)} km away`}
                  </p>
                )}
                <a
                  href={`https://www.google.com/maps/dir/${userCoords.lat},${userCoords.lng}/${h.lat},${h.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mt-1 block"
                >
                  Get directions →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds coords={userCoords} hospitals={hospitals} />
      </MapContainer>
    </div>
  );
}
