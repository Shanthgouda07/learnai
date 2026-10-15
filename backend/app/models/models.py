"""
LearnAI – SQLAlchemy ORM models
All tables follow the schema defined in the project spec.
"""
from datetime import datetime
from app.config import utc_now
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean,
    DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship, declarative_base


Base = declarative_base()


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id      = Column(Integer, primary_key=True, index=True)
    role    = Column(SAEnum("teacher", "student", name="role_enum"), nullable=False)
    anon_id = Column(String(16), unique=True, nullable=False)   # e.g. S-001, T-001
    name    = Column(String(64), nullable=False)
    # plain-text password is acceptable for the demo (no real auth needed)
    password = Column(String(128), nullable=False, default="demo1234")

    # relationships
    sessions     = relationship("Session",      back_populates="student")
    note_progress = relationship("NoteProgress", back_populates="student")
    classes_taught = relationship("Class", back_populates="teacher")
    enrollments   = relationship("ClassEnrollment", back_populates="student")


# ---------------------------------------------------------------------------
# Classes
# ---------------------------------------------------------------------------
class Class(Base):
    __tablename__ = "classes"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(128), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    retention_months = Column(Integer, default=12)
    parental_consent_obtained = Column(Boolean, default=True)

    teacher     = relationship("User", back_populates="classes_taught")
    enrollments = relationship("ClassEnrollment", back_populates="class_")
    notes       = relationship("Note",  back_populates="class_")
    games       = relationship("Game",  back_populates="class_")



class ClassEnrollment(Base):
    __tablename__ = "class_enrollments"

    id         = Column(Integer, primary_key=True, index=True)
    class_id   = Column(Integer, ForeignKey("classes.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id"),   nullable=False, index=True)

    class_   = relationship("Class", back_populates="enrollments")
    student  = relationship("User",  back_populates="enrollments")


# ---------------------------------------------------------------------------
# Notes
# ---------------------------------------------------------------------------
class Note(Base):
    __tablename__ = "notes"

    id         = Column(Integer, primary_key=True, index=True)
    class_id   = Column(Integer, ForeignKey("classes.id"), nullable=False, index=True)
    title      = Column(String(256), nullable=False)
    content    = Column(Text, nullable=False)          # Markdown
    # draft = AI generated, not yet teacher-approved
    status     = Column(SAEnum("draft", "published", name="note_status_enum"),
                        default="published", nullable=False)
    ai_generated = Column(Boolean, default=False)
    target_student_anon_id = Column(String(256), nullable=True)
    generated_because      = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    class_    = relationship("Class", back_populates="notes")
    quizzes   = relationship("Quiz",         back_populates="note")
    progress  = relationship("NoteProgress", back_populates="note")


# ---------------------------------------------------------------------------
# Quizzes (comprehension checks tied to notes)
# ---------------------------------------------------------------------------
class Quiz(Base):
    __tablename__ = "quizzes"

    id         = Column(Integer, primary_key=True, index=True)
    note_id    = Column(Integer, ForeignKey("notes.id"), nullable=False, index=True)
    question   = Column(Text, nullable=False)
    # JSON string: list of option strings, e.g. '["opt1","opt2","opt3","opt4"]'
    options    = Column(Text, nullable=False)
    answer_idx = Column(Integer, nullable=False)   # 0-based correct option index

    note = relationship("Note", back_populates="quizzes")


# ---------------------------------------------------------------------------
# Games
# ---------------------------------------------------------------------------
class Game(Base):
    __tablename__ = "games"

    id           = Column(Integer, primary_key=True, index=True)
    class_id     = Column(Integer, ForeignKey("classes.id"), nullable=False, index=True)
    # note that must be read/passed before this game unlocks
    linked_note_id = Column(Integer, ForeignKey("notes.id"), nullable=True, index=True)
    title        = Column(String(256), nullable=False)
    # Template type: fill_blank | bug_hunt | order_steps | visualizer
    game_type    = Column(String(32), nullable=False)
    # Structured JSON payload that drives the game template
    content_json = Column(Text, nullable=False, default="{}")
    max_points   = Column(Integer, default=100)
    status       = Column(String(32), default="approved", nullable=False)
    target_student_anon_id = Column(String(256), nullable=True)
    generated_because      = Column(Text, nullable=True)
    ai_generated = Column(Boolean, default=False)
    created_at   = Column(DateTime, default=utc_now)

    class_   = relationship("Class", back_populates="games")
    sessions = relationship("Session", back_populates="game")


# ---------------------------------------------------------------------------
# Sessions (one row per student game attempt)
# ---------------------------------------------------------------------------
class Session(Base):
    __tablename__ = "sessions"

    id           = Column(Integer, primary_key=True, index=True)
    student_id   = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    game_id      = Column(Integer, ForeignKey("games.id"), nullable=False, index=True)
    score        = Column(Integer, default=0)
    max_score    = Column(Integer, default=100)
    accuracy     = Column(Float,   default=0.0)    # 0.0 – 1.0
    duration     = Column(Integer, default=0)      # seconds
    duration_sec = Column(Integer, default=0)      # alias/standard duration in seconds
    attempts     = Column(Integer, default=1)
    hints_used   = Column(Integer, default=0)
    class_id     = Column(Integer, ForeignKey("classes.id"), nullable=True, index=True)
    topic        = Column(String(64), nullable=True, index=True)
    status       = Column(String(32), default="completed")  # "in_progress" | "completed"
    items_json   = Column(Text, nullable=True, default="{}")  # per-item correctness & logs
    timestamp    = Column(DateTime, default=utc_now, index=True)

    student = relationship("User", back_populates="sessions")
    game    = relationship("Game", back_populates="sessions")


# ---------------------------------------------------------------------------
# NoteProgress (tracks read + quiz completion per student)
# ---------------------------------------------------------------------------
class NoteProgress(Base):
    __tablename__ = "note_progress"

    id               = Column(Integer, primary_key=True, index=True)
    student_id       = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    note_id          = Column(Integer, ForeignKey("notes.id"), nullable=False, index=True)
    read_check_passed = Column(Boolean, default=False)
    attempts         = Column(Integer, default=0)
    last_attempt_at  = Column(DateTime, nullable=True)

    student = relationship("User", back_populates="note_progress")
    note    = relationship("Note", back_populates="progress")


# ---------------------------------------------------------------------------
# AILog (audit trail for all AI requests, storing ONLY anonymized text)
# ---------------------------------------------------------------------------
class AILog(Base):
    __tablename__ = "ai_logs"

    id             = Column(Integer, primary_key=True, index=True)
    kind           = Column(String(64), nullable=False)   # "helper", "note_draft", "game_generate", "support_task", "student_summary", "desk_chat"
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_role      = Column(String(32), nullable=False)   # "student", "teacher"
    user_anon_id   = Column(String(32), nullable=False)   # "S-001", "T-001"
    class_id       = Column(Integer, ForeignKey("classes.id"), nullable=True)
    prompt         = Column(Text, nullable=False)          # Anonymized prompt
    response       = Column(Text, nullable=False)          # Anonymized response summary
    sources        = Column(Text, nullable=True, default="[]")  # JSON list of sources cited
    removed_counts = Column(Text, nullable=True, default="[]")  # JSON list of removed PII types
    blocked        = Column(Boolean, default=False)
    block_reason   = Column(String(128), nullable=True)
    helpful        = Column(Boolean, nullable=True)        # Thumbs up/down feedback
    timestamp      = Column(DateTime, default=utc_now)


# ---------------------------------------------------------------------------
# Flag Actions (Teacher dismiss / snooze records)
# ---------------------------------------------------------------------------
class FlagAction(Base):
    __tablename__ = "flag_actions"

    id         = Column(Integer, primary_key=True, index=True)
    flag_key   = Column(String(128), nullable=False, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action     = Column(String(32), nullable=False)   # "dismiss" | "snooze"
    reason     = Column(Text, nullable=True)
    timestamp  = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Interventions (Tracking support tasks assigned to students and outcome)
# ---------------------------------------------------------------------------
class Intervention(Base):
    __tablename__ = "interventions"

    id               = Column(Integer, primary_key=True, index=True)
    class_id         = Column(Integer, ForeignKey("classes.id"), nullable=False)
    student_ids      = Column(Text, nullable=False)          # JSON array of int ids e.g. [4, 7]
    student_anon_ids = Column(Text, nullable=True)           # JSON array e.g. ["S-004", "S-007"]
    topic            = Column(String(64), nullable=False)
    draft_id         = Column(Integer, nullable=False)       # ID of note or game
    kind             = Column(String(32), default="game")    # "note" | "game"
    before_mastery   = Column(Float, nullable=False, default=0.0)
    after_mastery    = Column(Float, nullable=True)
    status           = Column(String(32), default="pending") # "pending" | "completed" | "improved" | "no_change"
    created_at       = Column(DateTime, default=datetime.utcnow)
    completed_at     = Column(DateTime, nullable=True)


# ---------------------------------------------------------------------------
# Consent (Student consent records with version and language)
# ---------------------------------------------------------------------------
class Consent(Base):
    __tablename__ = "consents"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    version     = Column(String(32), nullable=False)
    accepted_at = Column(DateTime, default=datetime.utcnow)
    language    = Column(String(16), default="en")


# ---------------------------------------------------------------------------
# AccessLog (Teacher/Admin access to student detail pages - anon_ids only)
# ---------------------------------------------------------------------------
class AccessLog(Base):
    __tablename__ = "access_log"

    id               = Column(Integer, primary_key=True, index=True)
    viewer_user_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    viewer_anon_id   = Column(String(32), nullable=False)
    viewer_role      = Column(String(32), nullable=False)
    target_anon_id   = Column(String(32), nullable=False)
    page             = Column(String(128), default="student_detail")
    timestamp        = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# DeletionRequest (Student requests to delete personal data, approved by teacher)
# ---------------------------------------------------------------------------
class DeletionRequest(Base):
    __tablename__ = "deletion_requests"

    id                     = Column(Integer, primary_key=True, index=True)
    student_id             = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_anon_id        = Column(String(32), nullable=False)
    class_id               = Column(Integer, ForeignKey("classes.id"), nullable=True)
    status                 = Column(String(32), default="pending")  # "pending" | "approved" | "rejected"
    requested_at           = Column(DateTime, default=datetime.utcnow)
    approved_at            = Column(DateTime, nullable=True)
    approved_by_teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reason                 = Column(Text, nullable=True)


# ---------------------------------------------------------------------------
# DeletionAuditLog (Immutable log of data deletions - strictly NO personal data)
# ---------------------------------------------------------------------------
class DeletionAuditLog(Base):
    __tablename__ = "deletion_audit_log"

    id                  = Column(Integer, primary_key=True, index=True)
    deleted_anon_id     = Column(String(32), nullable=False)
    approved_by_anon_id = Column(String(32), nullable=False)
    records_deleted     = Column(Integer, default=0)
    sessions_preserved  = Column(Integer, default=0)
    timestamp           = Column(DateTime, default=datetime.utcnow)



