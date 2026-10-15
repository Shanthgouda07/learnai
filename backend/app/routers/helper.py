"""
helper.py - Student AI Helper and AI status/activity endpoints.
All AI operations are governed by pipeline.run_ai.
"""
import json
import time
from collections import defaultdict, deque
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.models import User, Game, Session as GameSession, AILog, Class
from app.services.auth import get_current_user, require_role
from app.ai.pipeline import run_ai
from app.ai.rag import get_rag_backend_name
from app.ai.ai_service import is_mock_mode

router = APIRouter(prefix="/api", tags=["ai-helper"])

# Rate limiting: 20 requests per minute per student
RATE_LIMIT_MAX = 20
RATE_LIMIT_WINDOW = 60.0
_user_request_times: Dict[int, deque] = defaultdict(deque)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class HelperAskRequest(BaseModel):
    class_id: int
    note_id: Optional[int] = None
    game_id: Optional[int] = None
    session_id: Optional[int] = None
    item_id: Optional[Any] = None
    question: str = Field(..., max_length=1000)
    attempt: Optional[str] = None
    hint_level: int = Field(default=1, ge=1, le=3)
    language: Optional[str] = "en"


class HelperAskResponse(BaseModel):
    reply: str
    sources: List[Dict[str, str]]
    hint_level: int
    blocked: bool
    grounded: bool
    log_id: int


class HelperFeedbackRequest(BaseModel):
    log_id: int
    helpful: bool


class AIStatusResponse(BaseModel):
    rag_backend: str
    llm_mode: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.get("/ai/status", response_model=AIStatusResponse)
def get_ai_status():
    """Return active RAG backend (chromadb or keyword) and LLM mode (live or mock)."""
    return {
        "rag_backend": get_rag_backend_name(),
        "llm_mode": "mock" if is_mock_mode() else "live"
    }


@router.post("/helper/ask", response_model=HelperAskResponse)
async def ask_helper(
    body: HelperAskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Student AI Helper conversation endpoint.
    Retrieves grounded context from classroom notes, enforces hint levels and output guard.
    """
    # 1. Message length cap (also checked by Pydantic)
    if len(body.question) > 1000:
        raise HTTPException(status_code=400, detail="Message exceeds maximum length of 1,000 characters.")

    # 2. Rate limiting (20 requests per minute per user)
    now = time.time()
    user_times = _user_request_times[current_user.id]
    while user_times and user_times[0] <= now - RATE_LIMIT_WINDOW:
        user_times.popleft()

    if len(user_times) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please wait a moment before sending another request."
        )
    user_times.append(now)

    # Prune stale user entries to prevent memory leak
    if len(_user_request_times) > 500:
        stale_uids = [
            uid for uid, dq in _user_request_times.items()
            if not dq or dq[-1] <= now - RATE_LIMIT_WINDOW
        ]
        for uid in stale_uids:
            _user_request_times.pop(uid, None)


    # 3. Server-side Solution extraction (NEVER sent to LLM; passed only to output guard)
    solution_meta: Optional[Dict[str, Any]] = None
    if body.game_id:
        game = db.query(Game).filter(Game.id == body.game_id).first()
        if game and game.content_json:
            try:
                g_content = json.loads(game.content_json)
                if game.game_type == "fill_blank":
                    solution_meta = {
                        "answers": [b.get("answer", "") for b in g_content.get("blanks", [])]
                    }
                elif game.game_type == "bug_hunt":
                    fix_opts = g_content.get("fix_options", [])
                    correct_idx = g_content.get("correct_fix_index", 0)
                    correct_fix = fix_opts[correct_idx] if 0 <= correct_idx < len(fix_opts) else ""
                    solution_meta = {"correct_fix": correct_fix}
                elif game.game_type == "order_steps":
                    solution_meta = {"steps": g_content.get("steps", [])}
                elif game.game_type in ("visualizer", "code_visualizer"):
                    solution_meta = {"answers": [g_content.get("expected_output", "")]}
            except Exception:
                solution_meta = None

    # 4. If hint level 2 or 3 is used during an active game session, record hint penalty
    if body.session_id and body.hint_level in (2, 3):
        session = db.query(GameSession).filter(GameSession.id == body.session_id).first()
        if session:
            session.hints_used = (session.hints_used or 0) + 1
            db.commit()

    # 5. Run single pipeline
    payload = {
        "question": body.question,
        "attempt": body.attempt,
        "hint_level": body.hint_level,
        "language": body.language,
        "note_id": body.note_id,
        "game_id": body.game_id,
        "session_id": body.session_id,
        "item_id": body.item_id,
    }

    result = await run_ai(
        kind="helper",
        user=current_user,
        class_id=body.class_id,
        payload=payload,
        db=db,
        solution_meta=solution_meta
    )

    return {
        "reply": result["text"],
        "sources": result["sources"],
        "hint_level": result["hint_level"],
        "blocked": result["blocked"],
        "grounded": result["grounded"],
        "log_id": result["log_id"],
    }


@router.post("/helper/feedback")
def submit_feedback(
    body: HelperFeedbackRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Save thumbs up/down feedback on an AI response."""
    log_entry = db.query(AILog).filter(AILog.id == body.log_id).first()
    if not log_entry:
        raise HTTPException(status_code=404, detail="Log entry not found.")

    log_entry.helpful = body.helpful
    db.commit()
    return {"status": "ok", "helpful": body.helpful}


@router.get("/ai/activity")
def get_ai_activity(
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    """
    Teacher AI activity transparency log.
    Shows recent AI interactions for the teacher's class(es).
    Student names are strictly NEVER present (only anonymous IDs).
    """
    q = db.query(AILog)
    if class_id:
        # Verify teacher ownership
        cls = db.query(Class).filter(Class.id == class_id, Class.teacher_id == current_user.id).first()
        if not cls:
            raise HTTPException(status_code=403, detail="Class not found or unauthorized.")
        q = q.filter(AILog.class_id == class_id)
    else:
        # All classes taught by this teacher
        teacher_classes = db.query(Class.id).filter(Class.teacher_id == current_user.id).all()
        class_ids = [c[0] for c in teacher_classes]
        q = q.filter(AILog.class_id.in_(class_ids))

    logs = q.order_by(AILog.timestamp.desc()).limit(100).all()

    return [
        {
            "id": log.id,
            "kind": log.kind,
            "user_anon_id": log.user_anon_id,
            "user_role": log.user_role,
            "class_id": log.class_id,
            "prompt": log.prompt,
            "response": log.response,
            "sources": json.loads(log.sources) if log.sources else [],
            "removed_counts": json.loads(log.removed_counts) if log.removed_counts else [],
            "blocked": log.blocked,
            "block_reason": log.block_reason,
            "helpful": log.helpful,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
        for log in logs
    ]
