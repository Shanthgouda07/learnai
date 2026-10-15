"""
Database session factory and engine setup.
Uses SQLite for the demo; swap DATABASE_URL in .env for Postgres in prod.
"""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},  # needed for SQLite
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable WAL mode, busy timeout, and cache for high-concurrency zero-lag SQLite."""
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA busy_timeout=10000")
        cursor.execute("PRAGMA cache_size=-64000")  # 64MB in-memory page cache
        cursor.execute("PRAGMA foreign_keys=ON")
    finally:
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency that yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

