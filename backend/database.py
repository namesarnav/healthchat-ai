from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global client
    if client is None:
        client = AsyncIOMotorClient(settings.mongo_uri)
    return client


def get_db():
    return get_client()["healthchat"]


def get_sessions_collection():
    return get_db()["sessions"]


async def create_indexes():
    col = get_sessions_collection()
    await col.create_index("session_id", unique=True)
    await col.create_index("user_id")
