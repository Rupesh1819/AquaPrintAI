from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    environment: str = "development"
    debug: bool = True
    database_url: str
    supabase_url: str
    supabase_service_key: str
    jwt_secret: str
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    google_gemini_api_key: str
    google_vision_api_key: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
