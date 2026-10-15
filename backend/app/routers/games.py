"""
Games router – Start, Answer, Finish, Leaderboard-free stats, and Lock gating.
"""
import json
from typing import List, Optional, Any
from datetime import datetime
from app.config import utc_now
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.models import Game, Session as GameSession, NoteProgress, User, Class
from app.schemas.schemas import GameOut, GameCreate
from app.games.schemas import (
    StartSessionResponse,
    AnswerRequest,
    AnswerResponse,
    FinishRequest,
    FinishResponse,
    LeaderboardFreeStats,
    PointBreakdownItem,
)
from app.games.registry import get_game_handler
from app.games.scoring import compute_score
from app.services.auth import get_current_user, require_role

router = APIRouter(prefix="/api/games", tags=["games"])


def _check_recall_passed(db: Session, student_id: int, linked_note_id: Optional[int]) -> bool:
    """A game is unlocked if it has no linked note, or the recall check is passed."""
    if not linked_note_id:
        return True
    progress = db.query(NoteProgress).filter(
        NoteProgress.student_id == student_id,
        NoteProgress.note_id == linked_note_id,
    ).first()
    return bool(progress and progress.read_check_passed)


@router.get("/")
def list_games(
    class_id: Optional[int] = None,
    note_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List games.
    Students only see approved/published games and non-targeted games (or their own targeted game).
    Locked state is dynamically calculated.
    """
    q = db.query(Game)
    if class_id:
        q = q.filter(Game.class_id == class_id)
    if note_id:
        q = q.filter(Game.linked_note_id == note_id)

    if current_user.role == "student":
        # Only approved/published games
        q = q.filter(Game.status.in_(["approved", "published"]))
        # Filter targeted games: either not targeted, or targeted to this student (single or group)
        q = q.filter(
            (Game.target_student_anon_id == None) |
            (Game.target_student_anon_id == current_user.anon_id) |
            (Game.target_student_anon_id.contains(current_user.anon_id))
        )

    games = q.all()
    results = []

    # Batch fetch student note recall progress and session stats in 2 queries total
    passed_note_ids = set()
    user_game_stats = {}
    if current_user.role == "student":
        progress_records = db.query(NoteProgress.note_id).filter(
            NoteProgress.student_id == current_user.id,
            NoteProgress.read_check_passed == True,
        ).all()
        passed_note_ids = {r[0] for r in progress_records}

        from sqlalchemy import func
        stats_records = db.query(
            GameSession.game_id,
            func.count(GameSession.id),
            func.max(GameSession.score),
        ).filter(
            GameSession.student_id == current_user.id,
            GameSession.status == "completed",
        ).group_by(GameSession.game_id).all()
        for gid, cnt, max_s in stats_records:
            user_game_stats[gid] = (cnt, max_s or 0)

    for g in games:
        unlocked = True
        lock_reason = None
        best_score = 0
        attempts_count = 0

        if current_user.role == "student":
            if g.linked_note_id:
                unlocked = g.linked_note_id in passed_note_ids
                if not unlocked:
                    lock_reason = f"Read and pass Note #{g.linked_note_id} comprehension check to unlock"

            cnt, best = user_game_stats.get(g.id, (0, 0))
            attempts_count = cnt
            best_score = best

        # Parse content_json to read difficulty and topic if available
        topic = "python-basics"
        difficulty = 1
        try:
            cj = json.loads(g.content_json)
            topic = cj.get("topic", topic)
            difficulty = cj.get("difficulty", difficulty)
        except Exception:
            pass

        results.append({
            "id": g.id,
            "class_id": g.class_id,
            "linked_note_id": g.linked_note_id,
            "title": g.title,
            "game_type": g.game_type,
            "max_points": g.max_points,
            "status": g.status,
            "topic": topic,
            "difficulty": difficulty,
            "ai_generated": g.ai_generated,
            "target_student_anon_id": g.target_student_anon_id,
            "locked": not unlocked,
            "lock_reason": lock_reason,
            "best_score": best_score,
            "attempts_count": attempts_count,
            "created_at": g.created_at,
        })

    return results


@router.get("/{game_id}")
def get_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")

    if current_user.role == "student":
        if game.target_student_anon_id and game.target_student_anon_id != current_user.anon_id:
            raise HTTPException(404, "Game not found")
        if game.status not in ("approved", "published"):
            raise HTTPException(403, "Game is not approved yet")

    return game


@router.post("/", response_model=GameOut)
def create_game(
    body: GameCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    game = Game(
        class_id=body.class_id,
        linked_note_id=body.linked_note_id,
        title=body.title,
        game_type=body.game_type,
        content_json=body.content_json,
        max_points=body.max_points,
        status=body.status,
        ai_generated=body.ai_generated,
    )
    db.add(game)
    db.commit()
    db.refresh(game)
    return game



@router.post("/{game_id}/start", response_model=StartSessionResponse)
def start_game_session(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Start a game session.
    Enforces recall check lock server-side.
    Returns sanitized client payload (never answers, shuffled steps).
    """
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")

    # Check student visibility
    if current_user.role == "student":
        if game.target_student_anon_id and game.target_student_anon_id != current_user.anon_id:
            raise HTTPException(403, "This challenge is assigned to another student")
        if game.status not in ("approved", "published"):
            raise HTTPException(403, "Game is not approved yet")

        # SERVER-SIDE LOCK RULE: refuse /start unless recall check passed
        if not _check_recall_passed(db, current_user.id, game.linked_note_id):
            raise HTTPException(
                status_code=403,
                detail=f"Locked: Please read Note #{game.linked_note_id} and pass the recall check first.",
            )

    # Get handler and validate/sanitize
    handler = get_game_handler(game.game_type)
    content_obj = handler.validate(game.content_json)
    client_content = handler.sanitize_for_client(content_obj)

    topic = getattr(content_obj, "topic", "python-basics")

    # Create in-progress session
    new_session = GameSession(
        student_id=current_user.id,
        game_id=game.id,
        class_id=game.class_id,
        topic=topic,
        max_score=game.max_points,
        status="in_progress",
        items_json="{}",
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return StartSessionResponse(
        session_id=new_session.id,
        game_id=game.id,
        title=game.title,
        game_type=game.game_type,
        max_points=game.max_points,
        content=client_content,
    )


@router.post("/{game_id}/answer", response_model=AnswerResponse)
def submit_answer(
    game_id: int,
    body: AnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Grade a single item response during active gameplay.
    Server holds the truth.
    """
    session_rec = db.query(GameSession).filter(
        GameSession.id == body.session_id,
        GameSession.game_id == game_id,
    ).first()
    if not session_rec:
        raise HTTPException(404, "Session not found")
    if session_rec.student_id != current_user.id and current_user.role != "teacher":
        raise HTTPException(403, "Cannot submit answer for another user's session")

    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")

    handler = get_game_handler(game.game_type)
    content_obj = handler.validate(game.content_json)

    # Grade response
    grade_result = handler.grade_item(content_obj, body.item_id, body.response)
    is_correct = grade_result["correct"]

    # Record attempt in session items_json
    try:
        attempts_log = json.loads(session_rec.items_json or "{}")
    except Exception:
        attempts_log = {}

    item_key = str(body.item_id)
    if item_key not in attempts_log:
        attempts_log[item_key] = []
    attempts_log[item_key].append({
        "response": body.response,
        "correct": is_correct,
        "timestamp": utc_now().isoformat(),
    })


    session_rec.items_json = json.dumps(attempts_log)
    db.commit()

    return AnswerResponse(
        correct=is_correct,
        feedback=grade_result["feedback"],
        explanation=grade_result.get("explanation"),
    )


@router.post("/{game_id}/finish", response_model=FinishResponse)
def finish_game_session(
    game_id: int,
    body: FinishRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Finish an active session, compute final score, and return summary breakdown.
    Idempotent: finishing twice returns the existing score without double-counting.
    """
    session_rec = db.query(GameSession).filter(
        GameSession.id == body.session_id,
        GameSession.game_id == game_id,
    ).first()
    if not session_rec:
        raise HTTPException(404, "Session not found")
    if session_rec.student_id != current_user.id and current_user.role != "teacher":
        raise HTTPException(403, "Unauthorized session finish")

    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(404, "Game not found")

    # If already completed, return existing result (idempotency check)
    if session_rec.status == "completed":
        past_completed = db.query(GameSession).filter(
            GameSession.student_id == session_rec.student_id,
            GameSession.game_id == game_id,
            GameSession.status == "completed",
        ).order_by(GameSession.timestamp.desc()).all()
        best_score = max((s.score for s in past_completed), default=session_rec.score)
        trend = [s.score for s in past_completed[:5]][::-1]

        return FinishResponse(
            session_id=session_rec.id,
            score=session_rec.score,
            accuracy=session_rec.accuracy,
            duration_sec=session_rec.duration_sec,
            streak=0,
            points_breakdown=[PointBreakdownItem(label="Final Score", points=session_rec.score)],
            review_topics=[session_rec.topic or "python"],
            best_score=best_score,
            trend=trend,
            status="completed",
        )

    handler = get_game_handler(game.game_type)
    content_obj = handler.validate(game.content_json)
    total_items = handler.get_total_items(content_obj)

    try:
        attempts_log = json.loads(session_rec.items_json or "{}")
    except Exception:
        attempts_log = {}

    topic = getattr(content_obj, "topic", "python-basics")

    # Fetch last 3 completed sessions on this topic for student to check improvement bonus
    history = db.query(GameSession).filter(
        GameSession.student_id == current_user.id,
        GameSession.topic == topic,
        GameSession.status == "completed",
    ).order_by(GameSession.timestamp.desc()).limit(3).all()

    score_result = compute_score(
        max_points=game.max_points,
        total_items=total_items,
        attempts_log=attempts_log,
        history=history,
        hints_used=body.hints_used or 0,
        duration_sec=body.duration_sec or 0,
    )

    # Persist completed session
    completed_count = db.query(GameSession).filter(
        GameSession.student_id == current_user.id,
        GameSession.game_id == game_id,
        GameSession.status == "completed",
    ).count()

    session_rec.score = score_result["points"]
    session_rec.accuracy = score_result["accuracy"]
    session_rec.duration = body.duration_sec or 0
    session_rec.duration_sec = body.duration_sec or 0
    session_rec.hints_used = body.hints_used or 0
    session_rec.attempts = completed_count + 1
    session_rec.status = "completed"
    session_rec.topic = topic
    session_rec.items_json = json.dumps(score_result["items_json"])
    db.commit()
    db.refresh(session_rec)

    # Review topics: if missed items, flag topic
    review_topics = []
    if score_result["accuracy"] < 1.0:
        review_topics.append(topic)

    # Student's past sessions for this game
    all_game_sessions = db.query(GameSession).filter(
        GameSession.student_id == current_user.id,
        GameSession.game_id == game_id,
        GameSession.status == "completed",
    ).order_by(GameSession.timestamp.desc()).all()

    best_score = max((s.score for s in all_game_sessions), default=session_rec.score)
    trend = [s.score for s in all_game_sessions[:5]][::-1]

    breakdown_models = [
        PointBreakdownItem(label=b["label"], points=b["points"])
        for b in score_result["breakdown"]
    ]

    return FinishResponse(
        session_id=session_rec.id,
        score=score_result["points"],
        accuracy=score_result["accuracy"],
        duration_sec=score_result["duration_sec"],
        streak=score_result["streak"],
        points_breakdown=breakdown_models,
        review_topics=review_topics,
        best_score=best_score,
        trend=trend,
        status="completed",
    )


@router.get("/{game_id}/leaderboard-free-stats", response_model=LeaderboardFreeStats)
def get_student_game_stats(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Leaderboard-free student history for this game (personal best, average, trend).
    No cross-student comparison.
    """
    sessions = db.query(GameSession).filter(
        GameSession.student_id == current_user.id,
        GameSession.game_id == game_id,
        GameSession.status == "completed",
    ).order_by(GameSession.timestamp.desc()).all()

    if not sessions:
        return LeaderboardFreeStats(
            best=0,
            average=0.0,
            trend=[],
            attempts=0,
            last_played=None,
        )

    best_score = max(s.score for s in sessions)
    avg_score = round(sum(s.score for s in sessions) / len(sessions), 1)
    trend = [s.score for s in sessions[:5]][::-1]
    last_played = sessions[0].timestamp.isoformat() if sessions[0].timestamp else None

    return LeaderboardFreeStats(
        best=best_score,
        average=avg_score,
        trend=trend,
        attempts=len(sessions),
        last_played=last_played,
    )


@router.post("/generate-ai")
async def generate_game_ai(
    game_type: str = "fill_blank",
    topic: str = "loops",
    note_id: Optional[int] = None,
    class_id: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    """
    Teacher 'Generate from note' endpoint for games.
    Uses pipeline.run_ai() with RAG context over approved notes.
    Validates output against Phase 5 Pydantic schema and returns as DRAFT.
    """
    from app.ai.pipeline import run_ai

    result = await run_ai(
        kind="game_generate",
        user=current_user,
        class_id=class_id,
        payload={"game_type": game_type, "topic": topic, "note_id": note_id},
        db=db,
    )
    raw_text = result["text"]
    try:
        content_obj = json.loads(raw_text)
    except Exception:
        content_obj = raw_text

    handler = get_game_handler(game_type)
    validated_model = handler.validator(content_obj)

    return {
        "status": "draft",
        "game_type": game_type,
        "title": f"AI Draft: {topic.capitalize()} Challenge",
        "topic": topic,
        "content": validated_model.model_dump(),
        "sources": result.get("sources", []),
    }

