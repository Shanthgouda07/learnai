"""
Visualizer router – code tracing, challenge execution, and test grading.
"""
import time
import json
from collections import defaultdict
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.models import Game, Session as GameSession, User
from app.schemas.schemas import (
    TraceRequest,
    CheckRequest,
    CheckResponse,
    TestCaseResult,
    GameOut,
)
from app.services.auth import get_current_user
from app.visualizer.sandbox import run_in_sandbox

router = APIRouter(prefix="/api/visualizer", tags=["visualizer"])

# In-memory sliding window rate limiter: 30 requests/min
RATE_LIMIT = 30
WINDOW_SECONDS = 60
_user_request_timestamps = defaultdict(list)


def check_rate_limit(key: str):
    now = time.time()
    cutoff = now - WINDOW_SECONDS
    timestamps = [t for t in _user_request_timestamps[key] if t > cutoff]
    if len(timestamps) >= RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded: maximum 30 requests per minute.",
        )
    timestamps.append(now)
    _user_request_timestamps[key] = timestamps
    # Prune stale keys to prevent memory leak
    if len(_user_request_timestamps) > 500:
        stale = [k for k, v in _user_request_timestamps.items() if not v or v[-1] < cutoff]
        for k in stale:
            _user_request_timestamps.pop(k, None)


def get_rate_limit_key(request: Request, current_user: Optional[User]) -> str:
    if current_user:
        return f"user:{current_user.id}"
    client_ip = request.client.host if request.client else "unknown"
    return f"ip:{client_ip}"


# Helper to optionally get current user (or None if unauthenticated)
def get_optional_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    try:
        from app.services.auth import decode_token
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        user_id = payload.get("sub")
        return db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        return None


@router.post("/trace")
def trace_code(
    body: TraceRequest,
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Execute Python code in the sandbox and return step-by-step trace.
    """
    key = get_rate_limit_key(request, current_user)
    check_rate_limit(key)

    result = run_in_sandbox(
        code=body.code,
        stdin_lines=body.stdin_lines or [],
        max_steps=body.max_steps or 500,
    )
    return result


@router.post("/check", response_model=CheckResponse)
def check_challenge(
    body: CheckRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Run code against a challenge's test cases in separate sandboxes,
    compare expected vs actual stdout, calculate score, and log session.
    """
    key = get_rate_limit_key(request, current_user)
    check_rate_limit(key)

    game = db.query(Game).filter(Game.id == body.challenge_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Challenge not found")

    try:
        content = json.loads(game.content_json)
    except Exception:
        raise HTTPException(status_code=500, detail="Malformed challenge configuration")

    test_cases = content.get("test_cases", [])
    if not test_cases:
        # Fallback single test case using expected_output
        expected = content.get("expected_output", "")
        test_cases = [{"name": "Default Test", "stdin": [], "expected_stdout": expected}]

    results: List[TestCaseResult] = []
    passed_count = 0

    for tc in test_cases:
        tc_name = tc.get("name", "Test case")
        tc_stdin = tc.get("stdin", [])
        expected_stdout = str(tc.get("expected_stdout", "")).strip()

        sandbox_res = run_in_sandbox(
            code=body.code,
            stdin_lines=tc_stdin,
            max_steps=500,
            timeout_sec=1.5,
        )

        error_obj = sandbox_res.get("error")
        err_msg = error_obj["message"] if error_obj else None
        actual_stdout = str(sandbox_res.get("final_stdout", "")).strip()

        # Check if actual matches expected and no runtime error
        tc_passed = (error_obj is None) and (actual_stdout == expected_stdout)
        if tc_passed:
            passed_count += 1

        results.append(
            TestCaseResult(
                name=tc_name,
                passed=tc_passed,
                expected=expected_stdout,
                actual=actual_stdout,
                error=err_msg,
            )
        )

    accuracy = round(passed_count / max(len(test_cases), 1), 2)
    all_passed = passed_count == len(test_cases)

    # Calculate attempts and scoring
    base_points = content.get("points", game.max_points or 100)
    points_awarded = int(round(base_points * accuracy))

    if current_user:
        existing_count = db.query(GameSession).filter(
            GameSession.student_id == current_user.id,
            GameSession.game_id == game.id,
        ).count()
        attempts = existing_count + 1

        # Penalty scales with extra attempts, capped at 30%
        penalty = min(0.30, (attempts - 1) * 0.10)
        points_awarded = int(round(base_points * accuracy * (1.0 - penalty)))

        topic = content.get("topic", "python-basics")

        # Record session only for verified authenticated users
        session_record = GameSession(
            student_id=current_user.id,
            game_id=game.id,
            score=points_awarded,
            max_score=base_points,
            accuracy=accuracy,
            duration=body.duration or 0,
            attempts=attempts,
            class_id=game.class_id,
            topic=topic,
        )
        db.add(session_record)
        db.commit()

    return CheckResponse(
        passed=all_passed,
        results=results,
        points_awarded=points_awarded,
        accuracy=accuracy,
    )



@router.get("/challenges")
def list_visualizer_challenges(
    note_id: Optional[int] = None,
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    List approved visualizer challenges, optionally filtered by linked note.
    """
    q = db.query(Game).filter(
        Game.game_type.in_(["visualizer", "code_visualizer"]),
        Game.status == "published",
    )
    if note_id is not None:
        q = q.filter(Game.linked_note_id == note_id)
    if class_id is not None:
        q = q.filter(Game.class_id == class_id)
    return q.all()
