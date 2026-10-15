"""
FastAPI application entry-point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import engine
from app.models.models import Base
from app.routers import auth, notes, games, progress, analytics, ai_router, visualizer, helper, desk, privacy
from app.models.models import Note
from app.ai.rag import index_note

from sqlalchemy import text
from sqlalchemy.orm import Session

# Create all tables on startup
Base.metadata.create_all(bind=engine)

# Ensure new columns exist on legacy SQLite tables
with engine.connect() as conn:
    for col, col_def in [
        ("attempts", "INTEGER DEFAULT 1"),
        ("class_id", "INTEGER"),
        ("topic", "VARCHAR(64)"),
        ("duration_sec", "INTEGER DEFAULT 0"),
        ("hints_used", "INTEGER DEFAULT 0"),
        ("status", "VARCHAR(32) DEFAULT 'completed'"),
        ("items_json", "TEXT DEFAULT '{}'"),
    ]:
        try:
            conn.execute(text(f"ALTER TABLE sessions ADD COLUMN {col} {col_def}"))
            conn.commit()
        except Exception:
            pass

    for col, col_def in [
        ("target_student_anon_id", "VARCHAR(256)"),
        ("generated_because", "TEXT"),
    ]:
        try:
            conn.execute(text(f"ALTER TABLE games ADD COLUMN {col} {col_def}"))
            conn.commit()
        except Exception:
            pass

    for col, col_def in [
        ("target_student_anon_id", "VARCHAR(256)"),
        ("generated_because", "TEXT"),
    ]:
        try:
            conn.execute(text(f"ALTER TABLE notes ADD COLUMN {col} {col_def}"))
            conn.commit()
        except Exception:
            pass

    for col, col_def in [
        ("retention_months", "INTEGER DEFAULT 12"),
        ("parental_consent_obtained", "BOOLEAN DEFAULT 0"),
    ]:
        try:
            conn.execute(text(f"ALTER TABLE classes ADD COLUMN {col} {col_def}"))
            conn.commit()
        except Exception:
            pass

    # Ensure high-performance composite and single indexes exist
    indexes = [
        "CREATE INDEX IF NOT EXISTS ix_sessions_student_id ON sessions (student_id)",
        "CREATE INDEX IF NOT EXISTS ix_sessions_class_id ON sessions (class_id)",
        "CREATE INDEX IF NOT EXISTS ix_sessions_game_id ON sessions (game_id)",
        "CREATE INDEX IF NOT EXISTS ix_sessions_timestamp ON sessions (timestamp)",
        "CREATE INDEX IF NOT EXISTS ix_sessions_topic ON sessions (topic)",
        "CREATE INDEX IF NOT EXISTS ix_sessions_student_class ON sessions (student_id, class_id)",
        "CREATE INDEX IF NOT EXISTS ix_class_enrollments_student_class ON class_enrollments (student_id, class_id)",
        "CREATE INDEX IF NOT EXISTS ix_class_enrollments_class_id ON class_enrollments (class_id)",
        "CREATE INDEX IF NOT EXISTS ix_note_progress_student_note ON note_progress (student_id, note_id)",
        "CREATE INDEX IF NOT EXISTS ix_notes_class_id ON notes (class_id)",
        "CREATE INDEX IF NOT EXISTS ix_games_class_id ON games (class_id)",
        "CREATE INDEX IF NOT EXISTS ix_games_linked_note_id ON games (linked_note_id)",
        "CREATE INDEX IF NOT EXISTS ix_ai_logs_class_id ON ai_logs (class_id)",
        "CREATE INDEX IF NOT EXISTS ix_ai_logs_timestamp ON ai_logs (timestamp)",
    ]
    for idx_sql in indexes:
        try:
            conn.execute(text(idx_sql))
            conn.commit()
        except Exception:
            pass

# Index all approved notes into RAG on startup
with Session(engine) as s:
    try:
        approved_notes = s.query(Note).filter(Note.status.in_(["approved", "published"])).all()
        for n in approved_notes:
            index_note(n.class_id, n.id, n.title, "", n.content, n.status)
    except Exception:
        pass

app = FastAPI(
    title="LearnAI API",
    description="AI-powered classroom platform – hackathon MVP",
    version="1.0.0",
)

# Response Compression Middleware (cuts large JSON payload transfer lag by >75%)
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security Headers Middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Allow Vite dev server on port 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(games.router)
app.include_router(progress.router)
app.include_router(analytics.router)
app.include_router(ai_router.router)
app.include_router(visualizer.router)
app.include_router(helper.router)
app.include_router(desk.router)
app.include_router(privacy.router)



@app.get("/")
def root():
    return {"message": "LearnAI API is running 🚀", "docs": "/docs"}

