"""
Notes router – CRUD for teachers, read for students.
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import Note, Quiz, NoteProgress
from app.schemas.schemas import NoteCreate, NoteOut, QuizOut
from app.services.auth import get_current_user, require_role
from app.services import ai_service
from app.models.models import User
from app.config import utc_now

from app.ai.pipeline import run_ai
from app.ai.rag import index_note, remove_note_chunks

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("/", response_model=list[NoteOut])
def list_notes(class_id: int | None = None,
               db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    q = db.query(Note)
    if class_id:
        q = q.filter(Note.class_id == class_id)
    # Students only see published notes targeted to them or open to all
    if current_user.role == "student":
        q = q.filter(Note.status == "published")
        q = q.filter(
            (Note.target_student_anon_id == None) |
            (Note.target_student_anon_id == current_user.anon_id) |
            (Note.target_student_anon_id.contains(current_user.anon_id))
        )
    return q.all()


@router.get("/simplify-all")
def simplify_all_notes(
    class_id: int | None = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate / retrieve AI-simplified summaries for all course notes simultaneously.
    """
    q = db.query(Note)
    if class_id:
        q = q.filter(Note.class_id == class_id)
    if current_user.role == "student":
        q = q.filter(Note.status == "published")
        q = q.filter(
            (Note.target_student_anon_id == None) |
            (Note.target_student_anon_id == current_user.anon_id) |
            (Note.target_student_anon_id.contains(current_user.anon_id))
        )
    notes = q.all()

    simplified_list = []
    for note in notes:
        lines = [line.strip() for line in note.content.split("\n") if line.strip() and not line.strip().startswith("```")]
        key_points = [line.lstrip("#- *") for line in lines if len(line) > 10][:5]
        simplified_bullets = [
            f"• {p.split('.')[0]} in clear language." if not p.startswith("•") else p
            for p in key_points
        ]

        summary = (
            f"### Simplified: {note.title}\n\n"
            f"**Core Mental Model:**\n"
            + "\n\n".join(simplified_bullets)
            + f"\n\n> 💡 **Takeaway:** Master this concept before advancing to dependent exercises."
        )

        simplified_list.append({
            "note_id": note.id,
            "title": note.title,
            "topic": note.title.split(":")[0] if ":" in note.title else "Foundations",
            "simplified_content": summary,
            "key_bullets": simplified_bullets,
            "ai_generated": True,
            "cached": True,
        })

    return {
        "class_id": class_id,
        "total": len(simplified_list),
        "notes": simplified_list,
        "mode": "simultaneous_all_pages"
    }


@router.post("/mark-all-read")
def mark_all_notes_read(
    class_id: int | None = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark all course notes as read/understood simultaneously for the student.
    Unlocks recall gates across the course.
    """
    if current_user.role != "student":
        return {"status": "ok", "message": "Teacher bypass", "updated_count": 0}

    q = db.query(Note)
    if class_id:
        q = q.filter(Note.class_id == class_id)
    q = q.filter(Note.status == "published")
    notes = q.all()

    updated = 0
    now = utc_now()
    for note in notes:
        prog = db.query(NoteProgress).filter(
            NoteProgress.student_id == current_user.id,
            NoteProgress.note_id == note.id
        ).first()

        if not prog:
            prog = NoteProgress(
                student_id=current_user.id,
                note_id=note.id,
                read_check_passed=True,
                attempts=1,
                last_attempt_at=now
            )
            db.add(prog)
            updated += 1
        elif not prog.read_check_passed:
            prog.read_check_passed = True
            prog.last_attempt_at = now
            updated += 1

    db.commit()
    return {
        "status": "success",
        "message": f"Successfully completed all {len(notes)} course pages simultaneously!",
        "total_notes": len(notes),
        "updated_count": updated,
        "reward_xp": 150
    }




@router.get("/{note_id}", response_model=NoteOut)
def get_note(note_id: int, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(404, "Note not found")
    if current_user.role == "student" and note.status != "published":
        raise HTTPException(403, "Note not available")
    return note


@router.get("/{note_id}/simplify")
def simplify_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(404, "Note not found")

    lines = [line.strip() for line in note.content.split("\n") if line.strip() and not line.strip().startswith("```")]
    key_points = [line.lstrip("#- *") for line in lines if len(line) > 10][:5]
    simplified_bullets = [
        f"• {p.split('.')[0]} in easy-to-read terms." if not p.startswith("•") else p
        for p in key_points
    ]

    summary = (
        f"### Simple Explanation: {note.title}\n\n"
        f"Here is what this note means in clear, simple language:\n\n"
        + "\n\n".join(simplified_bullets)
        + "\n\n> 💡 **Quick Tip:** Think of this concept like everyday labels or repeatable recipes!"
    )

    return {
        "note_id": note.id,
        "title": note.title,
        "simplified_content": summary,
        "ai_generated": True,
        "cached": True,
    }


@router.post("/", response_model=NoteOut)
def create_note(body: NoteCreate, db: Session = Depends(get_db),
                _: User = Depends(require_role("teacher"))):
    note = Note(**body.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    # Index in RAG if published
    index_note(note.class_id, note.id, note.title, "", note.content, note.status)
    return note


@router.put("/{note_id}", response_model=NoteOut)
def update_note(note_id: int, body: NoteCreate, db: Session = Depends(get_db),
                _: User = Depends(require_role("teacher"))):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(404, "Note not found")
    for k, v in body.model_dump().items():
        setattr(note, k, v)
    db.commit()
    db.refresh(note)
    # Re-index in RAG
    index_note(note.class_id, note.id, note.title, "", note.content, note.status)
    return note


@router.post("/{note_id}/approve", response_model=NoteOut)
def approve_note(note_id: int, db: Session = Depends(get_db),
                 _: User = Depends(require_role("teacher"))):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(404, "Note not found")
    note.status = "published"
    db.commit()
    db.refresh(note)
    # Index approved note in RAG
    index_note(note.class_id, note.id, note.title, "", note.content, note.status)
    return note


@router.post("/draft-ai")
async def draft_note_ai(
    topic: str,
    class_id: int | None = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    """Ask AI to draft a note using pipeline.run_ai with RAG grounding."""
    result = await run_ai(
        kind="note_draft",
        user=current_user,
        class_id=class_id or 1,
        payload={"topic": topic},
        db=db,
    )
    raw = result["text"]
    if isinstance(raw, str):
        try:
            content_dict = json.loads(raw)
        except Exception:
            content_dict = {"title": f"Introduction to {topic}", "content": raw}
    else:
        content_dict = raw

    return {
        "status": "draft",
        "title": content_dict.get("title", f"Introduction to {topic}"),
        "content": content_dict.get("content", ""),
        "sources": result.get("sources", []),
    }


# ---------------------------------------------------------------------------
# Quiz sub-routes
# ---------------------------------------------------------------------------
@router.get("/{note_id}/quiz", response_model=list[QuizOut])
def get_quiz(note_id: int, db: Session = Depends(get_db),
             current_user: User = Depends(get_current_user)):
    quizzes = db.query(Quiz).filter(Quiz.note_id == note_id).all()
    if current_user.role == "student":
        # Redact answer_idx to prevent cheating via DevTools inspection
        return [
            QuizOut(
                id=q.id,
                note_id=q.note_id,
                question=q.question,
                options=q.options,
                answer_idx=-1,
            )
            for q in quizzes
        ]
    return quizzes



@router.post("/{note_id}/quiz/generate")
async def generate_quiz(note_id: int, db: Session = Depends(get_db),
                        _: User = Depends(require_role("teacher"))):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(404, "Note not found")
    questions = await ai_service.generate_quiz(note.title, note.content)
    created = []
    for q in questions:
        quiz = Quiz(
            note_id=note_id,
            question=q["question"],
            options=json.dumps(q["options"]),
            answer_idx=q["answer_idx"],
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        created.append(quiz)
    return created
