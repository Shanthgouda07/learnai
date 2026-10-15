"""
Analytics router – Teacher Desk: class overview, per-student summaries,
attention flags, AI support-task generation.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.database import get_db
from app.models.models import User, Session as GameSession, NoteProgress, Game
from app.schemas.schemas import StudentSummary
from app.services.auth import require_role
from app.services import ai_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


from collections import defaultdict


def _build_student_summary(
    student: User,
    db: Session,
    prefetched_sessions: list | None = None,
    prefetched_notes_count: int | None = None,
) -> StudentSummary:
    if prefetched_sessions is not None:
        sessions = prefetched_sessions
    else:
        sessions = db.query(GameSession)\
                     .filter(GameSession.student_id == student.id)\
                     .order_by(GameSession.timestamp).all()

    if prefetched_notes_count is not None:
        notes_done = prefetched_notes_count
    else:
        notes_done = db.query(NoteProgress).filter(
            NoteProgress.student_id == student.id,
            NoteProgress.read_check_passed == True,
        ).count()

    if not sessions:
        return StudentSummary(
            anon_id=student.anon_id,
            name=student.name,
            avg_score=0.0,
            avg_accuracy=0.0,
            sessions_count=0,
            notes_completed=notes_done,
            needs_attention=False,
            attention_reason="",
        )

    avg_score = sum(s.score for s in sessions) / len(sessions)
    avg_accuracy = sum(s.accuracy for s in sessions) / len(sessions)

    # Attention flag: accuracy dropped >25 pp in last 3 sessions vs previous
    needs_attention = False
    reason = ""
    if len(sessions) >= 4:
        recent = sessions[-3:]
        older  = sessions[:-3]
        recent_acc = sum(s.accuracy for s in recent) / len(recent)
        older_acc  = sum(s.accuracy for s in older)  / len(older)
        if older_acc - recent_acc > 0.25:
            needs_attention = True
            reason = (
                f"Accuracy dropped from {older_acc*100:.0f}% to "
                f"{recent_acc*100:.0f}% in recent sessions"
            )
    elif avg_accuracy < 0.4 and len(sessions) >= 2:
        needs_attention = True
        reason = f"Average accuracy is low ({avg_accuracy*100:.0f}%)"

    return StudentSummary(
        anon_id=student.anon_id,
        name=student.name,
        avg_score=round(avg_score, 1),
        avg_accuracy=round(avg_accuracy, 4),
        sessions_count=len(sessions),
        notes_completed=notes_done,
        needs_attention=needs_attention,
        attention_reason=reason,
    )


@router.get("/class-overview", response_model=list[StudentSummary])
def class_overview(
    class_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("teacher")),
):
    students = db.query(User).filter(User.role == "student").all()
    if not students:
        return []

    student_ids = [s.id for s in students]

    # Pre-fetch all sessions in 1 query
    all_sessions = (
        db.query(GameSession)
        .filter(GameSession.student_id.in_(student_ids))
        .order_by(GameSession.timestamp.asc())
        .all()
    )
    sessions_by_student = defaultdict(list)
    for sess in all_sessions:
        sessions_by_student[sess.student_id].append(sess)

    # Pre-fetch notes progress counts in 1 query
    from sqlalchemy import func
    note_counts = (
        db.query(NoteProgress.student_id, func.count(NoteProgress.id))
        .filter(
            NoteProgress.student_id.in_(student_ids),
            NoteProgress.read_check_passed == True,
        )
        .group_by(NoteProgress.student_id)
        .all()
    )
    notes_count_map = dict(note_counts)

    return [
        _build_student_summary(
            s,
            db,
            prefetched_sessions=sessions_by_student[s.id],
            prefetched_notes_count=notes_count_map.get(s.id, 0),
        )
        for s in students
    ]



@router.get("/sessions")
def all_sessions(
    class_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("teacher")),
):
    q = db.query(GameSession, User.anon_id, Game.title, Game.game_type)\
           .join(User, User.id == GameSession.student_id)\
           .join(Game, Game.id == GameSession.game_id)
    rows = q.order_by(GameSession.timestamp.desc()).limit(200).all()
    return [
        {
            "session_id": s.id,
            "anon_id": anon,
            "game_title": title,
            "game_type": gtype,
            "score": s.score,
            "max_score": s.max_score,
            "accuracy": s.accuracy,
            "duration": s.duration,
            "timestamp": s.timestamp,
        }
        for s, anon, title, gtype in rows
    ]


@router.post("/generate-support-task")
async def generate_support_task(
    anon_id: str,
    weak_topic: str,
    task_type: str = "note",
    _: User = Depends(require_role("teacher")),
):
    """Ask AI to produce a targeted note or game for a struggling student."""
    if task_type not in ("note", "game"):
        raise HTTPException(400, "task_type must be 'note' or 'game'")
    result = await ai_service.generate_support_task(anon_id, weak_topic, task_type)
    return {"status": "draft", "content": result}


@router.post("/teacher-chat")
async def teacher_chat(
    question: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("teacher")),
):
    """Natural-language Q&A over session data for teachers."""
    rows = db.query(GameSession, User.anon_id)\
             .join(User, User.id == GameSession.student_id)\
             .order_by(GameSession.timestamp.desc()).limit(100).all()
    summary_lines = [
        f"{anon}: game={s.game_id} score={s.score}/{s.max_score} "
        f"acc={s.accuracy:.0%} dur={s.duration}s ts={s.timestamp.date()}"
        for s, anon in rows
    ]
    summary = "\n".join(summary_lines)
    answer = await ai_service.teacher_chat(summary, question)
    return {"answer": answer}
