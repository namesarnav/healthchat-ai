import json
import re
from pathlib import Path
from google import genai
from google.genai import types as genai_types
from config import settings
from models.session import Message

_client: genai.Client | None = None
_system_prompt: str | None = None

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "health_system.txt"


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def get_system_prompt() -> str:
    global _system_prompt
    if _system_prompt is None:
        _system_prompt = PROMPT_PATH.read_text()
    return _system_prompt


def build_contents(messages: list[Message], new_message: str) -> list[genai_types.Content]:
    contents: list[genai_types.Content] = []

    for msg in messages:
        role = "user" if msg.role == "user" else "model"
        contents.append(genai_types.Content(role=role, parts=[genai_types.Part(text=msg.content)]))

    contents.append(genai_types.Content(role="user", parts=[genai_types.Part(text=new_message)]))
    return contents


def parse_gemini_response(raw: str) -> dict:
    raw = raw.strip()
    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    data = json.loads(raw)
    return {
        "content": str(data.get("content", "")),
        "is_critical": bool(data.get("is_critical", False)),
        "specialist_type": data.get("specialist_type") or None,
        "disclaimer": str(
            data.get(
                "disclaimer",
                "This information is for educational purposes only and is not a substitute for professional medical advice.",
            )
        ),
    }


async def get_health_response(messages: list[Message], new_message: str) -> dict:
    client = get_client()
    contents = build_contents(messages, new_message)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=genai_types.GenerateContentConfig(
            system_instruction=get_system_prompt(),
            response_mime_type="application/json",
            temperature=0.3,
        ),
        contents=contents,
    )

    raw_text = response.text or ""
    return parse_gemini_response(raw_text)
