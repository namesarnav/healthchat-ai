from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, Field
import uuid


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_uuid() -> str:
    return str(uuid.uuid4())


class Message(BaseModel):
    message_id: str = Field(default_factory=new_uuid)
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime = Field(default_factory=utcnow)
    # assistant-only fields
    is_critical: bool | None = None
    specialist_type: str | None = None
    disclaimer: str | None = None


class Session(BaseModel):
    session_id: str = Field(default_factory=new_uuid)
    user_id: str | None = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    messages: list[Message] = Field(default_factory=list)
    message_count: int = 0
    last_message_preview: str = ""
