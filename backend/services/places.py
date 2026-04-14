import math
import httpx
from config import settings
from models.api import Hospital

PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

SPECIALIST_KEYWORDS: dict[str, str] = {
    "cardiologist":       "cardiology heart specialist hospital",
    "neurologist":        "neurology neurologist hospital",
    "psychiatrist":       "psychiatric mental health hospital clinic",
    "pulmonologist":      "pulmonology respiratory lung specialist",
    "gastroenterologist": "gastroenterology digestive specialist",
    "emergency":          "emergency hospital",
    "ophthalmologist":    "eye hospital ophthalmologist",
    "allergist":          "allergy clinic immunologist",
    "general":            "hospital clinic",
}


def _haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> int:
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return int(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


async def get_nearby_hospitals(
    lat: float,
    lng: float,
    specialist_type: str,
    radius: int = 5000,
) -> list[Hospital]:
    if not settings.google_places_api_key:
        raise ValueError(
            "GOOGLE_PLACES_API_KEY is not configured. Add it to your .env file."
        )

    keyword = SPECIALIST_KEYWORDS.get(specialist_type.lower(), "hospital clinic")

    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "keyword": keyword,
        "type": "hospital",
        "key": settings.google_places_api_key,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(PLACES_NEARBY_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    status = data.get("status")
    if status not in ("OK", "ZERO_RESULTS"):
        raise RuntimeError(f"Google Places API error: {status} — {data.get('error_message', '')}")

    hospitals: list[Hospital] = []
    for place in data.get("results", []):
        loc = place.get("geometry", {}).get("location", {})
        place_lat = loc.get("lat", lat)
        place_lng = loc.get("lng", lng)
        opening = place.get("opening_hours", {})

        hospitals.append(
            Hospital(
                place_id=place.get("place_id", ""),
                name=place.get("name", "Unknown"),
                address=place.get("vicinity", ""),
                lat=place_lat,
                lng=place_lng,
                rating=place.get("rating"),
                user_ratings_total=place.get("user_ratings_total"),
                open_now=opening.get("open_now"),
                distance_m=_haversine_m(lat, lng, place_lat, place_lng),
                types=place.get("types", []),
            )
        )

    hospitals.sort(key=lambda h: h.distance_m or 0)
    return hospitals
