from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from models.api import (
    CreateSessionRequest,
    CreateSessionResponse,
    SendMessageRequest,
    AssistantMessageResponse,
    SessionHistoryResponse,
    SessionSummary,
)
from models.session import Session, Message
from database import get_sessions_collection
from services.gemini import get_health_response

router = APIRouter(prefix="/api/chat", tags=["chat"])


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@router.post("/sessions", response_model=CreateSessionResponse)
async def create_session(body: CreateSessionRequest):
    session = Session(user_id=body.user_id)
    col = get_sessions_collection()
    await col.insert_one(session.model_dump())
    return CreateSessionResponse(session_id=session.session_id, created_at=session.created_at)


@router.get("/sessions", response_model=list[SessionSummary])
async def list_sessions(user_id: str | None = None, limit: int = 20):
    col = get_sessions_collection()
    query = {"user_id": user_id} if user_id else {}
    cursor = col.find(query, {"session_id": 1, "created_at": 1, "updated_at": 1, "message_count": 1, "last_message_preview": 1}).sort("updated_at", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [
        SessionSummary(
            session_id=d["session_id"],
            created_at=d["created_at"],
            updated_at=d["updated_at"],
            message_count=d.get("message_count", 0),
            last_message_preview=d.get("last_message_preview", ""),
        )
        for d in docs
    ]


@router.get("/sessions/{session_id}", response_model=SessionHistoryResponse)
async def get_session(session_id: str):
    col = get_sessions_collection()
    doc = await col.find_one({"session_id": session_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    session = Session(**doc)
    return SessionHistoryResponse(
        session_id=session.session_id,
        created_at=session.created_at,
        updated_at=session.updated_at,
        messages=session.messages,
        message_count=session.message_count,
    )


@router.post("/sessions/{session_id}/messages", response_model=AssistantMessageResponse)
async def send_message(session_id: str, body: SendMessageRequest):
    col = get_sessions_collection()
    doc = await col.find_one({"session_id": session_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")

    session = Session(**doc)

    # Add user message
    user_msg = Message(role="user", content=body.content)
    session.messages.append(user_msg)

    # Call Gemini (pass history minus the new message we just added)
    gemini_result = await get_health_response(session.messages[:-1], body.content)

    # Build assistant message
    assistant_msg = Message(
        role="assistant",
        content=gemini_result["content"],
        is_critical=gemini_result["is_critical"],
        specialist_type=gemini_result["specialist_type"],
        disclaimer=gemini_result["disclaimer"],
    )
    session.messages.append(assistant_msg)

    # Persist
    now = utcnow()
    await col.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "messages": [m.model_dump() for m in session.messages],
                "updated_at": now,
                "message_count": len(session.messages),
                "last_message_preview": body.content[:120],
            }
        },
    )

    return AssistantMessageResponse(
        message_id=assistant_msg.message_id,
        content=assistant_msg.content,
        is_critical=assistant_msg.is_critical or False,
        specialist_type=assistant_msg.specialist_type,
        disclaimer=assistant_msg.disclaimer or "",
        created_at=assistant_msg.created_at,
    )
