from fastapi import APIRouter, HTTPException
from models.api import Hospital
from services.places import get_nearby_hospitals

router = APIRouter(prefix="/api/places", tags=["places"])


@router.get("/nearby", response_model=list[Hospital])
async def nearby_hospitals(
    lat: float,
    lng: float,
    specialist_type: str,
    radius: int = 5000,
):
    try:
        hospitals = await get_nearby_hospitals(lat, lng, specialist_type, radius)
        return hospitals
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch nearby hospitals: {str(e)}")
