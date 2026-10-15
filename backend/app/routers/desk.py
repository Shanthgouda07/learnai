"""
routers/desk.py - Teacher AI Desk endpoints.
Strictly teacher-only, scoped to teacher's classes.
All AI calls pass through pipeline.run_ai(). All analytics are deterministic.
"""
import io
import csv
import json
from datetime import datetime, timedelta
from app.config import utc_now
from typing import Optional, List, Dict, Any


from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.models import (
    User, Class, ClassEnrollment, Note, Game, Session as GameSession,
    FlagAction, Intervention, AccessLog,
)
from app.services.auth import get_current_user, require_role
from app.analytics.summary import get_class_overview, get_class_heatmap, get_student_detail
from app.analytics.flags import evaluate_student_flags
from app.analytics.mastery import compute_student_all_mastery, compute_topic_mastery
from app.analytics.prereq import trace_root_cause, class_root_causes, PREREQUISITES_GRAPH
from app.ai.pipeline import run_ai
from app.ai.rag import index_note

router = APIRouter(prefix="/api/desk", tags=["desk"])


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------
class FlagActionRequest(BaseModel):
    reason: Optional[str] = None


class SupportTaskCreateRequest(BaseModel):
    class_id: int
    student_ids: List[int]
    kind: str = "game"  # "note" | "game"
    game_type: Optional[str] = "fill_blank"
    topic: Optional[str] = None
    teacher_instructions: Optional[str] = None


class SupportTaskApproveRequest(BaseModel):
    class_id: int
    kind: str = "game"  # "note" | "game"
    title: Optional[str] = None
    content: Optional[str] = None
    content_json: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    question: str


# ---------------------------------------------------------------------------
# Authorization Helpers
# ---------------------------------------------------------------------------
def _verify_teacher_class(class_id: int, teacher: User, db: Session) -> Class:
    if teacher.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can access the AI Desk.")
    cls = db.query(Class).filter(Class.id == class_id, Class.teacher_id == teacher.id).first()
    if not cls:
        raise HTTPException(status_code=403, detail="Teacher does not own this class.")
    return cls


# ---------------------------------------------------------------------------
# 1. Overview
# ---------------------------------------------------------------------------
@router.get("/classes/{class_id}/overview")
def class_overview(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    _verify_teacher_class(class_id, current_user, db)
    return get_class_overview(class_id=class_id, db=db, teacher_id=current_user.id)


# ---------------------------------------------------------------------------
# 2. Heatmap
# ---------------------------------------------------------------------------
@router.get("/classes/{class_id}/heatmap")
def class_heatmap(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    _verify_teacher_class(class_id, current_user, db)
    return get_class_heatmap(class_id=class_id, db=db)


# ---------------------------------------------------------------------------
# 3. Flags (Needs Attention & Wins)
# ---------------------------------------------------------------------------
@router.get("/classes/{class_id}/flags")
def class_flags(
    class_id: int,
    include_dismissed: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    _verify_teacher_class(class_id, current_user, db)

    enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id == class_id).all()
    student_ids = [e.student_id for e in enrollments]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    user_map = {u.id: u for u in students}

    sessions = (
        db.query(GameSession)
        .filter(GameSession.class_id == class_id, GameSession.student_id.in_(student_ids))
        .all()
    )
    by_student_sessions: Dict[int, List[Any]] = {sid: [] for sid in student_ids}
    for s in sessions:
        by_student_sessions[s.student_id].append(s)

    db_actions = db.query(FlagAction).filter(FlagAction.teacher_id == current_user.id).all()
    now = utc_now()

    all_flags = []
    all_wins = []

    for sid in student_ids:
        u = user_map.get(sid)
        anon_id = u.anon_id if u else f"S-{sid:03d}"
        res = evaluate_student_flags(
            student_id=sid,
            anon_id=anon_id,
            class_id=class_id,
            sessions=by_student_sessions[sid],
            db_actions=None if include_dismissed else db_actions,
            current_time=now,
        )
        for flag in res["needs_attention"]:
            # Attach real student name for teacher view
            flag["student_name"] = u.name if u else "Student"
            all_flags.append(flag)
        for win in res["wins"]:
            win["student_name"] = u.name if u else "Student"
            all_wins.append(win)

    # Sort flags by severity (high -> medium -> low)
    severity_order = {"high": 0, "medium": 1, "low": 2}
    all_flags.sort(key=lambda f: severity_order.get(f.get("severity", "medium"), 1))

    return {
        "flags": all_flags,
        "wins": all_wins,
    }


# ---------------------------------------------------------------------------
# 4. Dismiss & Snooze Flags
# ---------------------------------------------------------------------------
@router.post("/flags/{flag_key}/dismiss")
def dismiss_flag(
    flag_key: str,
    body: FlagActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    action = FlagAction(
        flag_key=flag_key,
        teacher_id=current_user.id,
        action="dismiss",
        reason=body.reason,
        timestamp=utc_now(),
    )
    db.add(action)
    db.commit()
    return {"status": "dismissed", "flag_key": flag_key}


@router.post("/flags/{flag_key}/snooze")
def snooze_flag(
    flag_key: str,
    body: FlagActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    action = FlagAction(
        flag_key=flag_key,
        teacher_id=current_user.id,
        action="snooze",
        reason=body.reason,
        timestamp=utc_now(),
    )
    db.add(action)
    db.commit()
    return {
        "status": "snoozed",
        "flag_key": flag_key,
        "snoozed_until": (utc_now() + timedelta(days=7)).isoformat(),
    }


# ---------------------------------------------------------------------------
# 5. Sessions Table & CSV Export
# ---------------------------------------------------------------------------
@router.get("/classes/{class_id}/sessions")
def class_sessions(
    class_id: int,
    student_id: Optional[int] = None,
    game_id: Optional[int] = None,
    topic: Optional[str] = None,
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    page: int = 1,
    page_size: int = 25,
    format: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    _verify_teacher_class(class_id, current_user, db)

    q = db.query(GameSession).filter(GameSession.class_id == class_id)
    if student_id:
        q = q.filter(GameSession.student_id == student_id)
    if game_id:
        q = q.filter(GameSession.game_id == game_id)
    if topic:
        q = q.filter(GameSession.topic == topic)
    if from_date:
        try:
            dt_from = datetime.fromisoformat(from_date)
            q = q.filter(GameSession.timestamp >= dt_from)
        except Exception:
            pass
    if to_date:
        try:
            dt_to = datetime.fromisoformat(to_date)
            q = q.filter(GameSession.timestamp <= dt_to)
        except Exception:
            pass

    q = q.order_by(GameSession.timestamp.desc())

    # Map users and games scoped to class
    enrolled_sids = [e[0] for e in db.query(ClassEnrollment.student_id).filter(ClassEnrollment.class_id == class_id).all()]
    students = db.query(User).filter(User.id.in_(enrolled_sids)).all() if enrolled_sids else []
    user_map = {u.id: u for u in students}
    games = db.query(Game).filter(Game.class_id == class_id).all()
    game_map = {g.id: g.title for g in games}


    if format == "csv":
        all_sessions = q.all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Session ID", "Anon ID", "Student Name", "Game Title",
            "Topic", "Score", "Max Score", "Accuracy", "Duration (s)",
            "Hints Used", "Timestamp"
        ])
        for s in all_sessions:
            u = user_map.get(s.student_id)
            writer.writerow([
                s.id,
                u.anon_id if u else f"S-{s.student_id:03d}",
                u.name if u else "Student",
                game_map.get(s.game_id, f"Game #{s.game_id}"),
                s.topic or "",
                s.score,
                s.max_score,
                f"{int(round((s.accuracy or 0) * 100))}%",
                s.duration,
                s.hints_used,
                s.timestamp.isoformat() if s.timestamp else "",
            ])
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=class_{class_id}_sessions.csv"},
        )

    total_count = q.count()
    offset = (max(1, page) - 1) * page_size
    page_sessions = q.offset(offset).limit(page_size).all()

    items = []
    for s in page_sessions:
        u = user_map.get(s.student_id)
        items.append({
            "id": s.id,
            "student_id": s.student_id,
            "anon_id": u.anon_id if u else f"S-{s.student_id:03d}",
            "student_name": u.name if u else "Student",
            "game_id": s.game_id,
            "game_title": game_map.get(s.game_id, f"Game #{s.game_id}"),
            "topic": s.topic,
            "score": s.score,
            "max_score": s.max_score,
            "accuracy": round(float(s.accuracy or 0.0), 2),
            "duration": s.duration,
            "hints_used": s.hints_used,
            "timestamp": s.timestamp.isoformat() if s.timestamp else None,
        })

    return {
        "sessions": items,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 1,
    }


# ---------------------------------------------------------------------------
# 6. Student Detail
# ---------------------------------------------------------------------------
@router.get("/students/{student_id}")
def student_detail(
    student_id: int,
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    if class_id:
        _verify_teacher_class(class_id, current_user, db)

    # Record access in audit log (strictly anon_ids, no student names)
    target_student = db.query(User).filter(User.id == student_id).first()
    if target_student:
        access_entry = AccessLog(
            viewer_user_id=current_user.id,
            viewer_anon_id=current_user.anon_id,
            viewer_role=current_user.role,
            target_anon_id=target_student.anon_id,
            page="student_detail",
            timestamp=utc_now(),
        )
        db.add(access_entry)
        db.commit()

    return get_student_detail(student_id=student_id, class_id=class_id, db=db)


# ---------------------------------------------------------------------------
# 7. AI Student Summary
# ---------------------------------------------------------------------------
@router.post("/students/{student_id}/summary")
async def generate_student_summary(
    student_id: int,
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    if class_id:
        _verify_teacher_class(class_id, current_user, db)

    detail = get_student_detail(student_id=student_id, class_id=class_id, db=db)
    student = detail.get("student")
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    anon_id = student.get("anon_id", f"S-{student_id:03d}")
    topic_mastery = detail.get("topic_mastery", {})
    score_history = detail.get("score_history", [])

    # Assemble purely numeric anonymized evidence
    numeric_evidence = {
        "anon_id": anon_id,
        "topics": {
            t: {
                "mastery": m.get("mastery") if m else None,
                "confidence": m.get("confidence") if m else "none",
                "trend": m.get("trend") if m else "steady",
                "attempts": m.get("attempts", 0) if m else 0,
            }
            for t, m in topic_mastery.items()
        },
        "total_sessions": len(score_history),
        "recent_accuracy": [s["accuracy"] for s in score_history[:5]],
    }

    ai_result = await run_ai(
        kind="student_summary",
        user=current_user,
        class_id=class_id,
        payload={"anon_id": anon_id, "evidence": numeric_evidence},
        db=db,
    )

    parsed_summary = {}
    raw_text = ai_result.get("text", "")
    try:
        parsed_summary = json.loads(raw_text)
    except Exception:
        parsed_summary = {
            "summary": raw_text,
            "why_this_summary": [
                f"Mastery metrics calculated from {len(score_history)} completed sessions.",
                f"Topic distribution evaluated across {len(topic_mastery)} curriculum areas.",
            ]
        }

    return {
        "summary": parsed_summary.get("summary", raw_text),
        "why_this_summary": parsed_summary.get("why_this_summary", []),
        "evidence": numeric_evidence,
        "ai_generated": True,
    }


# ---------------------------------------------------------------------------
# 8. Support Task Draft Generation
# ---------------------------------------------------------------------------
@router.post("/support-task")
async def generate_support_task(
    body: SupportTaskCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    _verify_teacher_class(body.class_id, current_user, db)

    students = db.query(User).filter(User.id.in_(body.student_ids)).all()
    if not students:
        raise HTTPException(status_code=400, detail="No valid students selected.")

    anon_ids = [s.anon_id for s in students]

    # Target topic: defaults to flag root cause topic, or provided topic, or "variables"
    target_topic = body.topic
    if not target_topic:
        # Trace root cause for first student
        first_detail = get_student_detail(body.student_ids[0], body.class_id, db)
        chains = first_detail.get("prerequisite_chains", [])
        if chains:
            target_topic = chains[0]["root"]
        else:
            target_topic = "variables"

    ai_payload = {
        "anon_id": ", ".join(anon_ids),
        "target_students": anon_ids,
        "weak_topic": target_topic,
        "task_kind": body.kind,
        "game_type": body.game_type or "fill_blank",
        "teacher_instructions": body.teacher_instructions or "",
    }

    ai_result = await run_ai(
        kind="support_task",
        user=current_user,
        class_id=body.class_id,
        payload=ai_payload,
        db=db,
    )

    raw_text = ai_result.get("text", "")
    try:
        draft_content = json.loads(raw_text)
    except Exception:
        draft_content = {
            "title": f"Targeted Review: {target_topic.capitalize()}",
            "topic": target_topic,
            "content": raw_text,
        }

    evidence_dict = {
        "target_students": anon_ids,
        "root_cause_topic": target_topic,
        "grounded_notes": [s.get("note_title", "") for s in ai_result.get("sources", [])],
    }

    # Save as DRAFT
    if body.kind == "note":
        draft_note = Note(
            class_id=body.class_id,
            title=draft_content.get("title", f"Support Note: {target_topic.capitalize()}"),
            content=draft_content.get("content", raw_text),
            status="draft",
            ai_generated=True,
            target_student_anon_id=json.dumps(anon_ids),
            generated_because=json.dumps(evidence_dict),
        )
        db.add(draft_note)
        db.commit()
        db.refresh(draft_note)
        return {
            "draft_id": draft_note.id,
            "kind": "note",
            "title": draft_note.title,
            "content": draft_note.content,
            "topic": target_topic,
            "target_student_anon_ids": anon_ids,
            "status": "draft",
            "evidence": evidence_dict,
        }
    else:
        # Game draft
        game_content = draft_content.get("content_json", draft_content)
        draft_game = Game(
            class_id=body.class_id,
            title=draft_content.get("title", f"Support Challenge: {target_topic.capitalize()}"),
            game_type=draft_content.get("game_type", body.game_type or "fill_blank"),
            content_json=json.dumps(game_content) if isinstance(game_content, dict) else str(game_content),
            max_points=100,
            status="draft",
            ai_generated=True,
            target_student_anon_id=json.dumps(anon_ids),
            generated_because=json.dumps(evidence_dict),
        )
        db.add(draft_game)
        db.commit()
        db.refresh(draft_game)
        return {
            "draft_id": draft_game.id,
            "kind": "game",
            "title": draft_game.title,
            "game_type": draft_game.game_type,
            "content_json": game_content,
            "topic": target_topic,
            "target_student_anon_ids": anon_ids,
            "status": "draft",
            "evidence": evidence_dict,
        }


# ---------------------------------------------------------------------------
# 9. Support Task Approval & Assignment
# ---------------------------------------------------------------------------
@router.post("/support-task/{draft_id}/approve")
def approve_support_task(
    draft_id: int,
    body: SupportTaskApproveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    _verify_teacher_class(body.class_id, current_user, db)

    topic = "variables"
    target_anon_ids = []
    target_student_ids = []

    if body.kind == "note":
        note = db.query(Note).filter(Note.id == draft_id, Note.class_id == body.class_id).first()
        if not note:
            raise HTTPException(status_code=404, detail="Draft note not found.")
        if body.title:
            note.title = body.title
        if body.content:
            note.content = body.content
        note.status = "published"

        if note.target_student_anon_id:
            try:
                target_anon_ids = json.loads(note.target_student_anon_id)
            except Exception:
                target_anon_ids = [note.target_student_anon_id]

        if note.generated_because:
            try:
                ev = json.loads(note.generated_because)
                topic = ev.get("root_cause_topic", "variables")
            except Exception:
                pass

        # Index approved note in RAG
        index_note(note.class_id, note.id, note.title, "", note.content, note.status)

    else:
        game = db.query(Game).filter(Game.id == draft_id, Game.class_id == body.class_id).first()
        if not game:
            raise HTTPException(status_code=404, detail="Draft game not found.")
        if body.title:
            game.title = body.title
        if body.content_json:
            game.content_json = json.dumps(body.content_json)
            topic = body.content_json.get("topic", "variables")
        game.status = "approved"

        if game.target_student_anon_id:
            try:
                target_anon_ids = json.loads(game.target_student_anon_id)
            except Exception:
                target_anon_ids = [game.target_student_anon_id]

        if game.generated_because:
            try:
                ev = json.loads(game.generated_because)
                topic = ev.get("root_cause_topic", topic)
            except Exception:
                pass

    # Find student IDs from anon IDs
    if target_anon_ids:
        st_users = db.query(User).filter(User.anon_id.in_(target_anon_ids)).all()
        target_student_ids = [u.id for u in st_users]

    # Compute before_mastery on target topic across the students
    before_masteries = []
    for sid in target_student_ids:
        s_sessions = db.query(GameSession).filter(
            GameSession.student_id == sid,
            GameSession.topic == topic,
        ).all()
        m_info = compute_topic_mastery(s_sessions)
        if m_info and m_info.get("mastery") is not None:
            before_masteries.append(m_info["mastery"])
    avg_before = round(sum(before_masteries) / len(before_masteries), 2) if before_masteries else 0.35

    # Record Intervention row
    intervention = Intervention(
        class_id=body.class_id,
        student_ids=json.dumps(target_student_ids),
        student_anon_ids=json.dumps(target_anon_ids),
        topic=topic,
        draft_id=draft_id,
        kind=body.kind,
        before_mastery=avg_before,
        status="pending",
        created_at=utc_now(),
    )
    db.add(intervention)
    db.commit()
    db.refresh(intervention)

    return {
        "message": "Support task approved and assigned.",
        "draft_id": draft_id,
        "intervention_id": intervention.id,
        "status": "approved",
    }


# ---------------------------------------------------------------------------
# 10. Interventions ("Did it help?" view)
# ---------------------------------------------------------------------------
@router.get("/classes/{class_id}/interventions")
def class_interventions(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    _verify_teacher_class(class_id, current_user, db)

    interventions = (
        db.query(Intervention)
        .filter(Intervention.class_id == class_id)
        .order_by(Intervention.created_at.desc())
        .all()
    )

    results = []
    for it in interventions:
        student_ids = []
        try:
            student_ids = json.loads(it.student_ids)
        except Exception:
            pass

        target_anon_ids = []
        try:
            target_anon_ids = json.loads(it.student_anon_ids or "[]")
        except Exception:
            pass

        # Check for sessions on this topic completed AFTER intervention was created
        after_masteries = []
        has_new_activity = False

        for sid in student_ids:
            new_sessions = db.query(GameSession).filter(
                GameSession.student_id == sid,
                GameSession.topic == it.topic,
                GameSession.timestamp >= it.created_at,
            ).all()

            if new_sessions:
                has_new_activity = True
                all_topic_sessions = db.query(GameSession).filter(
                    GameSession.student_id == sid,
                    GameSession.topic == it.topic,
                ).all()
                m_info = compute_topic_mastery(all_topic_sessions)
                if m_info and m_info.get("mastery") is not None:
                    after_masteries.append(m_info["mastery"])

        if has_new_activity and after_masteries:
            avg_after = round(sum(after_masteries) / len(after_masteries), 2)
            it.after_mastery = avg_after
            if avg_after >= it.before_mastery + 0.05:
                it.status = "improved"
            elif avg_after <= it.before_mastery - 0.05:
                it.status = "declined"
            else:
                it.status = "completed"
            db.commit()

        results.append({
            "id": it.id,
            "topic": it.topic,
            "kind": it.kind,
            "draft_id": it.draft_id,
            "student_ids": student_ids,
            "student_anon_ids": target_anon_ids,
            "before_mastery": it.before_mastery,
            "after_mastery": it.after_mastery,
            "status": it.status,
            "created_at": it.created_at.isoformat() if it.created_at else None,
        })

    return results


# ---------------------------------------------------------------------------
# 11. Safe Two-Step Desk Chat
# ---------------------------------------------------------------------------
@router.post("/classes/{class_id}/chat")
async def desk_chat(
    class_id: int,
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    _verify_teacher_class(class_id, current_user, db)

    question = body.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # STEP 1: Convert question to structured query JSON via fixed allowlist
    ai_intent_resp = await run_ai(
        kind="desk_chat_intent",
        user=current_user,
        class_id=class_id,
        payload={"question": question},
        db=db,
    )

    raw_intent_text = ai_intent_resp.get("text", "")
    intent_data = {}
    try:
        intent_data = json.loads(raw_intent_text)
    except Exception:
        intent_data = {"intent": "unsupported", "parameters": {}}

    intent = intent_data.get("intent", "unsupported")
    params = intent_data.get("parameters", {})

    ALLOWLIST = {
        "weak_topic_students",
        "improved_students",
        "inactive_students",
        "class_summary",
        "compare_topics",
        "student_detail",
    }

    if intent not in ALLOWLIST:
        return {
            "reply": (
                "I can answer questions about performance, topics, activity and flags. "
                "Try: 'Who struggled with loops this week?' or 'Who has been inactive?'"
            ),
            "intent": "unsupported",
            "evidence": {},
            "data": [],
        }

    # STEP 2: Execute query deterministically on DB
    enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id == class_id).all()
    student_ids = [e.student_id for e in enrollments]
    students = db.query(User).filter(User.id.in_(student_ids)).all()
    user_map = {u.id: u for u in students}
    anon_map = {u.anon_id: u for u in students}

    sessions = (
        db.query(GameSession)
        .filter(GameSession.class_id == class_id, GameSession.student_id.in_(student_ids))
        .all()
    )
    by_student_sessions: Dict[int, List[Any]] = {sid: [] for sid in student_ids}
    for s in sessions:
        by_student_sessions[s.student_id].append(s)

    query_results: Dict[str, Any] = {}

    if intent == "weak_topic_students":
        target_topic = params.get("topic", "loops")
        threshold = float(params.get("threshold", 0.5))
        struggling = []
        for sid in student_ids:
            u = user_map.get(sid)
            s_list = [s for s in by_student_sessions[sid] if s.topic == target_topic]
            m_info = compute_topic_mastery(s_list)
            if m_info and m_info.get("mastery") is not None and m_info["mastery"] < threshold and m_info.get("confidence") == "ok":
                # Check root cause
                all_m = compute_student_all_mastery(by_student_sessions[sid])
                trace = trace_root_cause(all_m, target_topic)
                struggling.append({
                    "anon_id": u.anon_id if u else f"S-{sid:03d}",
                    "topic": target_topic,
                    "mastery": m_info["mastery"],
                    "trend": m_info["trend"],
                    "root_cause": trace["root"],
                    "root_mastery": all_m.get(trace["root"], {}).get("mastery") if all_m.get(trace["root"]) else None,
                })
        query_results = {"intent": intent, "topic": target_topic, "struggling_students": struggling}

    elif intent == "inactive_students":
        days_thresh = int(params.get("days", 7))
        inactive = []
        now = utc_now()
        for sid in student_ids:
            u = user_map.get(sid)
            s_list = sorted(by_student_sessions[sid], key=lambda x: x.timestamp or datetime.min, reverse=True)
            if s_list and s_list[0].timestamp:
                days_off = (now - s_list[0].timestamp).days
                if days_off >= days_thresh:
                    inactive.append({
                        "anon_id": u.anon_id if u else f"S-{sid:03d}",
                        "days_inactive": days_off,
                        "last_played": s_list[0].timestamp.strftime("%Y-%m-%d"),
                        "total_sessions": len(s_list),
                    })
        query_results = {"intent": intent, "inactive_students": inactive}

    elif intent == "improved_students":
        improved = []
        for sid in student_ids:
            u = user_map.get(sid)
            s_list = by_student_sessions[sid]
            res = evaluate_student_flags(sid, u.anon_id if u else "", class_id, s_list)
            for w in res.get("wins", []):
                improved.append({
                    "anon_id": w["anon_id"],
                    "topic": w.get("topic"),
                    "headline": w.get("headline"),
                    "gain": w.get("evidence", {}).get("gain"),
                })
        query_results = {"intent": intent, "improved_students": improved}

    elif intent == "class_summary":
        overview = get_class_overview(class_id, db, current_user.id)
        query_results = {
            "intent": intent,
            "student_count": overview["student_count"],
            "active_7d": overview["active_7d"],
            "avg_accuracy": overview["avg_accuracy"],
            "flags_count": overview["flags_count"],
            "root_causes": overview["class_root_causes"],
        }

    elif intent == "compare_topics":
        topic_avg = {}
        for t in PREREQUISITES_GRAPH.keys():
            t_sessions = [s for s in sessions if s.topic == t]
            accs = [float(s.accuracy) for s in t_sessions if s.accuracy is not None]
            topic_avg[t] = round(sum(accs) / len(accs), 2) if accs else None
        query_results = {"intent": intent, "topic_averages": topic_avg}

    elif intent == "student_detail":
        target_anon = params.get("anon_id", "")
        st = anon_map.get(target_anon)
        if st:
            detail = get_student_detail(st.id, class_id, db)
            query_results = {
                "intent": intent,
                "anon_id": target_anon,
                "topics": {
                    t: m.get("mastery") if m else None
                    for t, m in detail.get("topic_mastery", {}).items()
                },
            }
        else:
            query_results = {"intent": intent, "error": f"Student {target_anon} not found in this class."}

    # Synthesize natural language answer with LLM using anonymized evidence
    synthesis_resp = await run_ai(
        kind="desk_chat_synthesis",
        user=current_user,
        class_id=class_id,
        payload={"question": question, "data": query_results},
        db=db,
    )

    answer_text = synthesis_resp.get("text", "")

    return {
        "reply": answer_text,
        "intent": intent,
        "parameters": params,
        "evidence": query_results,
    }
