"""
Progress router – track which notes students have read & passed check.
"""
from datetime import datetime, timezone
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import NoteProgress, Quiz
from app.schemas.schemas import NoteProgressOut
from app.services.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/", response_model=list[NoteProgressOut])
def my_progress(db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    return db.query(NoteProgress)\
             .filter(NoteProgress.student_id == current_user.id).all()


@router.post("/submit-check")
def submit_check(
    note_id: int,
    answers: list[int],   # list of answer indices the student chose
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Grade the 2-question comprehension check.
    Pass = all answers correct → sets read_check_passed = True.
    """
    quizzes = db.query(Quiz).filter(Quiz.note_id == note_id).all()
    if not quizzes:
        raise HTTPException(400, "No quiz found for this note")
    if len(answers) != len(quizzes):
        raise HTTPException(400, f"Expected {len(quizzes)} answers")

    correct = sum(
        1 for q, a in zip(quizzes, answers) if q.answer_idx == a
    )
    passed = correct == len(quizzes)

    progress = db.query(NoteProgress).filter(
        NoteProgress.student_id == current_user.id,
        NoteProgress.note_id == note_id,
    ).first()

    if not progress:
        progress = NoteProgress(
            student_id=current_user.id,
            note_id=note_id,
        )
        db.add(progress)

    progress.attempts += 1
    progress.last_attempt_at = datetime.now(timezone.utc) if hasattr(datetime, "timezone") else datetime.utcnow()
    if passed:
        progress.read_check_passed = True

    db.commit()
    db.refresh(progress)

    return {
        "passed": passed,
        "correct": correct,
        "total": len(quizzes),
        "correct_indices": [q.answer_idx for q in quizzes],
        "progress": NoteProgressOut.model_validate(progress),
    }

