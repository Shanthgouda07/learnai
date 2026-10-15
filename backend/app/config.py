"""
Application settings loaded from environment / .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


from datetime import datetime, timezone


def utc_now() -> datetime:
    """Return timezone-naive UTC datetime compatible with SQLite without Python 3.12+ deprecation warnings."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Settings(BaseSettings):
    llm_api_key: str = ""          # empty → mock AI mode
    llm_model: str = "gemini-2.0-flash"
    secret_key: str = "learnai-dev-secret"
    database_url: str = "sqlite:///./learnai.db"
    consent_version: str = "1.0"
    demo_mode: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")




settings = Settings()

