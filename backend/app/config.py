from pydantic_settings import BaseSettings, SettingsConfigDict

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    environment: str = "development"
    debug: bool = True
    database_url: str
    supabase_url: str
    supabase_service_key: str
    jwt_secret: str
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    gemini_api_key: str

    model_config = SettingsConfigDict(env_file=str(ENV_FILE), env_file_encoding="utf-8", extra="ignore")

settings = Settings()
