"""Settings module: providers registry + user configuration persistence."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

# ------------- Static registry of providers -------------
TTS_PROVIDERS: List[Dict[str, Any]] = [
    {"id": "elevenlabs", "name": "ElevenLabs", "fields": ["endpoint", "apikey"]},
    {"id": "piper",      "name": "PIPER",      "fields": ["endpoint", "apikey"]},
    {"id": "edge_tts",   "name": "edge_tts",   "fields": ["endpoint", "apikey"], "default": True},
]

# Voices per TTS provider
VOICES: Dict[str, List[Dict[str, Any]]] = {
    "elevenlabs": [
        {"name": "Daniel",   "accent": "british",    "gender": "male",   "id": "onwK4e9ZLuTAKqWW03F9"},
        {"name": "Adam",     "accent": "british",    "gender": "male",   "id": "pNInz6obpgDQGcFmaJgB"},
        {"name": "Roger",    "accent": "american",   "gender": "male",   "id": "CwhRBWXzGAHq8TQ4Fs17"},
        {"name": "Charlie",  "accent": "australian", "gender": "male",   "id": "IKne3meq5aSn9XLyUdCD"},
        {"name": "George",   "accent": "british",    "gender": "male",   "id": "JBFqnCBsd6RMkjVDRZzb"},
        {"name": "Callum",   "accent": "american",   "gender": "male",   "id": "N2lVS1w4EtoT3dr4eOWO"},
        {"name": "Harry",    "accent": "american",   "gender": "male",   "id": "SOYHLrjzK2X1ezoPC6cr"},
        {"name": "Liam",     "accent": "american",   "gender": "male",   "id": "TX3LPaxmHKxFdv7VOQHJ"},
        {"name": "Will",     "accent": "american",   "gender": "male",   "id": "bIHbv24MWmeRgasZH58o"},
        {"name": "Eric",     "accent": "american",   "gender": "male",   "id": "cjVigY5qzO86Huf0OWal"},
        {"name": "Chris",    "accent": "american",   "gender": "male",   "id": "iP95p4xoKVk53GoZ742B"},
        {"name": "Brian",    "accent": "american",   "gender": "male",   "id": "nPczCjzI2devNBz1zQrb", "favorite": True},
        {"name": "Bill",     "accent": "american",   "gender": "male",   "id": "pqHfZKP75CvOlQylNhV4"},
        {"name": "Roger",    "accent": "laid-back",  "gender": "male",   "id": "CwhRBWXzGAHq8TQ4Fs17"},
        {"name": "River",    "accent": "american",   "gender": "neutral","id": "SAz9YHcvj6GT2YYXdXww"},
        {"name": "Sarah",    "accent": "american",   "gender": "female", "id": "EXAVITQu4vr4xnSDxMaL"},
        {"name": "Laura",    "accent": "american",   "gender": "female", "id": "FGY2WhTYpPnrIDTdsKH5"},
        {"name": "Alice",    "accent": "british",    "gender": "female", "id": "Xb7hH8MSUJpSbSDYk0k2"},
        {"name": "Matilda",  "accent": "american",   "gender": "female", "id": "XrExE9yKIg1WjnnlVkGX"},
        {"name": "Jessica",  "accent": "american",   "gender": "female", "id": "cgSgspJ2msm6clMCkdW9"},
        {"name": "Bella",    "accent": "american",   "gender": "female", "id": "hpp4J3VqNfWAUOO0d1Us"},
        {"name": "Lily",     "accent": "british",    "gender": "female", "id": "pFZP5JQG7iQjIQuC4Bku"},
    ],
    "piper": [
        {"name": "pt_BR-cadu-medium", "id": "pt_BR-cadu-medium", "accent": "pt-BR", "gender": "male"},
    ],
    "edge_tts": [
        {"name": "pt-BR-FranciscaNeural", "id": "pt-BR-FranciscaNeural", "accent": "pt-BR", "gender": "female"},
        {"name": "pt-BR-AntonioNeural",   "id": "pt-BR-AntonioNeural",   "accent": "pt-BR", "gender": "male"},
    ],
}

LLM_PROVIDERS: List[Dict[str, Any]] = [
    {"id": "openai",   "name": "OpenAI",   "fields": ["model", "endpoint", "apikey"], "default": True},
    {"id": "domingo",  "name": "Domingo",  "fields": ["model", "endpoint", "apikey"]},
    {"id": "headroom", "name": "Headroom", "fields": ["model", "endpoint", "apikey"]},
    {"id": "ollama",   "name": "Ollama",   "fields": ["model", "endpoint", "apikey"]},
]


# ------------- Pydantic models -------------
class ProviderConfig(BaseModel):
    endpoint: Optional[str] = ""
    apikey: Optional[str] = ""
    model: Optional[str] = ""


class UserSettings(BaseModel):
    tts_provider: str = "edge_tts"
    voice: str = "pt-BR-FranciscaNeural"
    llm_provider: str = "openai"
    tts_config: Dict[str, ProviderConfig] = Field(default_factory=dict)
    llm_config: Dict[str, ProviderConfig] = Field(default_factory=dict)


DEFAULT_SETTINGS = UserSettings().model_dump()


def build_router(db) -> APIRouter:
    router = APIRouter(prefix="/settings", tags=["settings"])

    @router.get("/providers")
    async def get_providers():
        return {
            "tts_providers": TTS_PROVIDERS,
            "voices": VOICES,
            "llm_providers": LLM_PROVIDERS,
        }

    @router.get("")
    async def get_settings():
        doc = await db.settings.find_one({"_id": "default"}, {"_id": 0})
        if not doc:
            return DEFAULT_SETTINGS
        # Merge with defaults so newer keys are always present
        merged = {**DEFAULT_SETTINGS, **doc}
        return merged

    @router.post("")
    async def save_settings(settings: UserSettings):
        doc = settings.model_dump()
        doc["_id"] = "default"
        try:
            await db.settings.replace_one({"_id": "default"}, doc, upsert=True)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Falha ao salvar configurações: {e}")
        # Return the saved settings without _id for response
        doc.pop("_id", None)
        return {"status": "ok", "settings": doc}

    return router
