"""
Data export module for LearnAI privacy center.
Handles student JSON exports and teacher class CSV exports.
Guarantees:
- Student export contains all student-specific records, with student's own name visible only to themselves.
- Class CSV export contains strictly anonymized student identifiers (anon_id), never real names.
"""
import io
import csv
from datetime import datetime
from app.config import utc_now
from typing import Dict, Any, List

from sqlalchemy.orm import Session

from app.models.models import (
    User, Class, ClassEnrollment, Note, NoteProgress,
    Game, Session as GameSession, AILog, Consent, DeletionRequest
)


def export_student_data(db: Session, student: User) -> Dict[str, Any]:
    """
    Export all data stored about the current student, grouped by category.
    Real name is shown only because the student themselves is requesting their own data.
    """
    # 1. Profile
    profile = {
        "id": student.id,
        "anon_id": student.anon_id,
        "name": student.name,
        "role": student.role,
        "created_at": student.created_at.isoformat() if hasattr(student, "created_at") and student.created_at else None,
    }

    # 2. Enrollments
    enrollments_query = (
        db.query(ClassEnrollment, Class)
        .join(Class, ClassEnrollment.class_id == Class.id)
        .filter(ClassEnrollment.student_id == student.id)
        .all()
    )
    enrollments = [
        {
            "class_id": c.id,
            "class_name": c.name,
            "joined_at": getattr(ce, "joined_at", None),
        }
        for ce, c in enrollments_query
    ]

    # 3. Note Progress
    progress_records = (
        db.query(NoteProgress, Note)
        .join(Note, NoteProgress.note_id == Note.id)
        .filter(NoteProgress.student_id == student.id)
        .all()
    )
    note_progress = [
        {
            "note_id": n.id,
            "note_title": n.title,
            "topic": getattr(n, "topic", "general"),
            "read_check_passed": bool(getattr(p, "read_check_passed", False)),
            "attempts": getattr(p, "attempts", 0),
            "last_attempt_at": p.last_attempt_at.isoformat() if getattr(p, "last_attempt_at", None) else None,
        }
        for p, n in progress_records
    ]

    # 4. Sessions
    session_records = (
        db.query(GameSession, Game)
        .join(Game, GameSession.game_id == Game.id)
        .filter(GameSession.student_id == student.id)
        .order_by(GameSession.timestamp.desc())
        .all()
    )
    sessions = [
        {
            "session_id": s.id,
            "game_id": g.id,
            "game_title": g.title,
            "game_type": g.game_type,
            "topic": s.topic,
            "score": s.score,
            "max_score": s.max_score,
            "accuracy": round(float(s.accuracy or 0.0), 3),
            "duration_sec": s.duration_sec or s.duration or 0,
            "attempts": s.attempts,
            "hints_used": s.hints_used,
            "status": s.status,
            "timestamp": s.timestamp.isoformat() if s.timestamp else None,
        }
        for s, g in session_records
    ]

    # 5. AI Logs / Helper interactions
    logs = (
        db.query(AILog)
        .filter(AILog.user_id == student.id)
        .order_by(AILog.timestamp.desc())
        .all()
    )
    helper_feedback = [
        {
            "id": l.id,
            "kind": l.kind,
            "prompt": l.prompt,
            "response": l.response,
            "helpful": l.helpful,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
        }
        for l in logs
    ]

    # 6. Consents
    consents = (
        db.query(Consent)
        .filter(Consent.user_id == student.id)
        .order_by(Consent.accepted_at.desc())
        .all()
    )
    consents_list = [
        {
            "id": c.id,
            "version": c.version,
            "language": c.language,
            "accepted_at": c.accepted_at.isoformat() if c.accepted_at else None,
        }
        for c in consents
    ]

    # 7. Deletion requests
    deletions = (
        db.query(DeletionRequest)
        .filter(DeletionRequest.student_id == student.id)
        .order_by(DeletionRequest.requested_at.desc())
        .all()
    )
    deletion_requests = [
        {
            "id": d.id,
            "status": d.status,
            "reason": d.reason,
            "requested_at": d.requested_at.isoformat() if d.requested_at else None,
            "approved_at": d.approved_at.isoformat() if d.approved_at else None,
        }
        for d in deletions
    ]

    return {

        "export_metadata": {
            "exported_at": utc_now().isoformat(),
            "data_subject": student.anon_id,
            "platform": "LearnAI",
            "consent_status": "active" if consents_list else "none",
        },

        "profile": profile,
        "enrollments": enrollments,
        "note_progress": note_progress,
        "sessions": sessions,
        "helper_feedback": helper_feedback,
        "consents": consents_list,
        "deletion_requests": deletion_requests,
    }


def export_class_csv(db: Session, class_id: int) -> str:
    """
    Export class performance summary as CSV for teachers.
    CRITICAL: Contains strictly anon_ids, NEVER real student names or emails.
    """
    enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id == class_id).all()
    student_ids = [e.student_id for e in enrollments]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    student_anon_map = {s.id: s.anon_id for s in students}

    sessions = (
        db.query(GameSession)
        .filter(GameSession.class_id == class_id)
        .all()
    )

    # Group by (student_anon_id, topic)
    stats: Dict[tuple, Dict[str, Any]] = {}
    for s in sessions:
        anon_id = student_anon_map.get(s.student_id, f"S-{s.student_id:03d}")
        topic = s.topic or "general"
        key = (anon_id, topic)
        if key not in stats:
            stats[key] = {
                "anon_id": anon_id,
                "topic": topic,
                "count": 0,
                "acc_sum": 0.0,
                "score_sum": 0,
                "dur_sum": 0,
            }
        stats[key]["count"] += 1
        stats[key]["acc_sum"] += float(s.accuracy or 0.0)
        stats[key]["score_sum"] += int(s.score or 0)
        stats[key]["dur_sum"] += int(s.duration_sec or s.duration or 0)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "anon_id",
        "topic",
        "sessions_count",
        "avg_accuracy",
        "avg_score",
        "total_duration_sec"
    ])

    for key in sorted(stats.keys()):
        row = stats[key]
        c = row["count"]
        writer.writerow([
            row["anon_id"],
            row["topic"],
            c,
            round(row["acc_sum"] / c, 3) if c > 0 else 0.0,
            round(row["score_sum"] / c, 1) if c > 0 else 0.0,
            row["dur_sum"],
        ])

    return output.getvalue()
