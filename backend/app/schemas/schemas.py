"""
Pydantic schemas for API request / response validation.
Kept in one file for Phase 1 – split by domain in later phases.
"""
from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    anon_id: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    anon_id: str
    name: str
    user_id: int


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class UserOut(BaseModel):
    id: int
    role: str
    anon_id: str
    name: str

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Class
# ---------------------------------------------------------------------------
class ClassOut(BaseModel):
    id: int
    name: str
    teacher_id: int

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Note
# ---------------------------------------------------------------------------
class NoteCreate(BaseModel):
    title: str
    content: str
    class_id: int
    status: str = "published"


class NoteOut(BaseModel):
    id: int
    class_id: int
    title: str
    content: str
    status: str
    ai_generated: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Quiz
# ---------------------------------------------------------------------------
class QuizOut(BaseModel):
    id: int
    note_id: int
    question: str
    options: str        # JSON string
    answer_idx: int

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Game
# ---------------------------------------------------------------------------
class GameCreate(BaseModel):
    class_id: int = 1
    linked_note_id: Optional[int] = None
    title: str
    game_type: str = "visualizer"
    content_json: str
    max_points: int = 100
    status: str = "draft"
    ai_generated: bool = False


class GameOut(BaseModel):
    id: int
    class_id: int
    linked_note_id: Optional[int]
    title: str
    game_type: str
    content_json: str
    max_points: int
    status: str
    ai_generated: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Session
# ---------------------------------------------------------------------------
class SessionCreate(BaseModel):
    game_id: int
    score: int
    max_score: int = 100
    accuracy: float
    duration: int


class SessionOut(BaseModel):
    id: int
    student_id: int
    game_id: int
    score: int
    max_score: int
    accuracy: float
    duration: int
    timestamp: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# NoteProgress
# ---------------------------------------------------------------------------
class NoteProgressOut(BaseModel):
    id: int
    student_id: int
    note_id: int
    read_check_passed: bool
    attempts: int

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Analytics (Teacher Desk)
# ---------------------------------------------------------------------------
class StudentSummary(BaseModel):
    anon_id: str
    name: str
    avg_score: float
    avg_accuracy: float
    sessions_count: int
    notes_completed: int
    needs_attention: bool
    attention_reason: str


# ---------------------------------------------------------------------------
# Visualizer
# ---------------------------------------------------------------------------
class TraceRequest(BaseModel):
    code: str
    stdin_lines: Optional[List[str]] = None
    max_steps: Optional[int] = 500


class CheckRequest(BaseModel):
    challenge_id: int
    code: str
    duration: Optional[int] = 0


class TestCaseResult(BaseModel):
    name: str
    passed: bool
    expected: str
    actual: str
    error: Optional[str] = None


class CheckResponse(BaseModel):
    passed: bool
    results: List[TestCaseResult]
    points_awarded: int
    accuracy: float
