from pydantic import BaseModel
from datetime import datetime
from models.session import Message


class CreateSessionRequest(BaseModel):
    user_id: str | None = None


class CreateSessionResponse(BaseModel):
    session_id: str
    created_at: datetime


class SendMessageRequest(BaseModel):
    content: str


class AssistantMessageResponse(BaseModel):
    message_id: str
    content: str
    is_critical: bool
    specialist_type: str | None
    disclaimer: str
    created_at: datetime


class SessionHistoryResponse(BaseModel):
    session_id: str
    created_at: datetime
    updated_at: datetime
    messages: list[Message]
    message_count: int


class SessionSummary(BaseModel):
    session_id: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    last_message_preview: str


class NearbyPlacesRequest(BaseModel):
    lat: float
    lng: float
    specialist_type: str
    radius: int = 5000


class Hospital(BaseModel):
    place_id: str
    name: str
    address: str
    lat: float
    lng: float
    rating: float | None = None
    user_ratings_total: int | None = None
    open_now: bool | None = None
    distance_m: int | None = None
    types: list[str] = []
