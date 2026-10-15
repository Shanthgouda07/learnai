"""
Application settings loaded from environment / .env file.
"""
import os
import shutil
from pathlib import Path
from datetime import datetime, timezone
from pydantic_settings import BaseSettings, SettingsConfigDict


def utc_now() -> datetime:
    """Return timezone-naive UTC datetime compatible with SQLite without Python 3.12+ deprecation warnings."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def get_default_database_url() -> str:
    """Locate learnai.db robustly regardless of current working directory or serverless environment."""
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url

    # Find the bundled SQLite database
    base_dir = Path(__file__).resolve().parent.parent
    db_file = base_dir / "learnai.db"

    if not db_file.exists():
        cwd_db = Path.cwd() / "learnai.db"
        cwd_backend_db = Path.cwd() / "backend" / "learnai.db"
        if cwd_backend_db.exists():
            db_file = cwd_backend_db
        elif cwd_db.exists():
            db_file = cwd_db

    # In Vercel serverless / AWS Lambda, the root is read-only.
    # Copy SQLite database to /tmp so it supports write operations.
    if os.getenv("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        tmp_dir = Path("/tmp")
        tmp_db = tmp_dir / "learnai.db"
        if not tmp_db.exists() and db_file.exists():
            try:
                shutil.copyfile(str(db_file), str(tmp_db))
            except Exception:
                pass
        if tmp_db.exists():
            return f"sqlite:///{tmp_db.as_posix()}"

    return f"sqlite:///{db_file.as_posix()}"


class Settings(BaseSettings):
    llm_api_key: str = ""          # empty → mock AI mode
    llm_model: str = "gemini-2.0-flash"
    secret_key: str = "learnai-dev-secret"
    database_url: str = get_default_database_url()
    consent_version: str = "1.0"
    demo_mode: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
