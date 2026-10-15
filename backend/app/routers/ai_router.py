"""
AI hint router – Student Helper chat endpoint.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import Note
from app.services.auth import get_current_user
from app.services import ai_service
from app.models.models import User

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/hint")
async def get_hint(
    note_id: int,
    question: str,
    student_attempt: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Return a Socratic hint for a student.
    Sends note content + question + attempt only – no personal data.
    """
    note = db.query(Note).filter(Note.id == note_id).first()
    note_content = note.content if note else ""
    hint = await ai_service.hint_for_student(note_content, question, student_attempt)
    return {"hint": hint}
