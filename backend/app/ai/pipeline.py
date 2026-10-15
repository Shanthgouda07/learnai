"""
pipeline.py - The single entry point all LearnAI AI features must use.
Enforces: Authorize -> Anonymize -> RAG Retrieval -> LLM -> Output Guard -> AILog.
No other module may call the LLM directly.
"""
import json
import logging
from datetime import datetime
from app.config import utc_now
from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.models import User, ClassEnrollment, Class, AILog
from app.ai.anonymize import anonymize_payload
from app.ai.rag import retrieve
from app.ai.guard import check_output
from app.ai.prompts import (
    STUDENT_HELPER_SYSTEM_PROMPT,
    NOTE_DRAFT_SYSTEM_PROMPT,
    GAME_GENERATE_SYSTEM_PROMPT,
    SUPPORT_TASK_SYSTEM_PROMPT,
    STUDENT_SUMMARY_SYSTEM_PROMPT,
    DESK_CHAT_INTENT_SYSTEM_PROMPT,
    DESK_CHAT_SYNTHESIS_SYSTEM_PROMPT,
)
from app.ai.ai_service import call_llm

logger = logging.getLogger(__name__)


async def run_ai(
    kind: str,
    user: User,
    class_id: Optional[int],
    payload: Dict[str, Any],
    db: Session,
    solution_meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Execute AI task through the secure 8-step pipeline:
    1. Authorize (role and class enrollment).
    2. Anonymize input payload.
    3. Retrieve relevant chunks from approved class notes.
    4. Build grounded prompt using prompts.py templates.
    5. Call ai_service (live or mock).
    6. Run guard.py on output (solution and PII checking).
    7. Write immutable ai_logs record.
    8. Return response with citations.
    """
    # -----------------------------------------------------------------------
    # Step 1: Authorize
    # -----------------------------------------------------------------------
    if class_id is not None:
        if user.role == "student":
            enrollment = db.query(ClassEnrollment).filter(
                ClassEnrollment.student_id == user.id,
                ClassEnrollment.class_id == class_id
            ).first()
            if not enrollment:
                raise HTTPException(status_code=403, detail="Student is not enrolled in this class.")
        elif user.role == "teacher":
            cls = db.query(Class).filter(
                Class.id == class_id,
                Class.teacher_id == user.id
            ).first()
            if not cls:
                raise HTTPException(status_code=403, detail="Teacher does not own this class.")

    # -----------------------------------------------------------------------
    # Step 2: Anonymize Payload
    # -----------------------------------------------------------------------
    clean_payload, removed_pii = anonymize_payload(payload, context={"db": db})

    # -----------------------------------------------------------------------
    # Step 3: RAG Retrieval (Grounding in approved notes)
    # -----------------------------------------------------------------------
    sources: List[Dict[str, Any]] = []
    grounded = True
    query_text = (
        clean_payload.get("question") or
        clean_payload.get("prompt") or
        clean_payload.get("topic") or
        clean_payload.get("weak_topic") or
        clean_payload.get("student_attempt") or ""
    )

    if class_id is not None and kind in ("helper", "note_draft", "game_generate", "support_task"):
        sources = retrieve(
            class_id=class_id,
            query=str(query_text),
            k=4,
            topic=clean_payload.get("topic") or clean_payload.get("weak_topic")
        )
        if kind == "helper" and not sources:
            grounded = False

    # -----------------------------------------------------------------------
    # Step 4: Build Grounded Prompt
    # -----------------------------------------------------------------------
    hint_level = int(clean_payload.get("hint_level", 1))
    language_pref = clean_payload.get("language", "en")

    if kind == "helper":
        system_prompt = STUDENT_HELPER_SYSTEM_PROMPT
        if not grounded:
            # When query is not covered by approved notes
            user_prompt = (
                f"<student_question>\n{clean_payload.get('question', '')}\n</student_question>\n"
                f"<notes>\nNo notes available on this topic.\n</notes>\n"
            )
        else:
            notes_context = "\n\n".join([
                f"[Note: {s['note_title']} - Heading: {s['heading']}]\n{s['text']}"
                for s in sources
            ])
            user_prompt = (
                f"<notes>\n{notes_context}\n</notes>\n\n"
                f"Hint Level: {hint_level}\n"
                f"Language: {language_pref}\n"
                f"<student_question>\n{clean_payload.get('question', '')}\n</student_question>\n"
                f"<student_attempt>\n{clean_payload.get('attempt', clean_payload.get('student_attempt', 'None'))}\n</student_attempt>\n"
            )

    elif kind == "note_draft":
        system_prompt = NOTE_DRAFT_SYSTEM_PROMPT
        topic = clean_payload.get("topic", "Python")
        notes_context = "\n\n".join([f"[{s['note_title']}]: {s['text']}" for s in sources]) if sources else "None"
        user_prompt = f"Topic: {topic}\n<notes>\n{notes_context}\n</notes>"

    elif kind == "game_generate":
        system_prompt = GAME_GENERATE_SYSTEM_PROMPT
        game_type = clean_payload.get("game_type", "fill_blank")
        topic = clean_payload.get("topic", "loops")
        notes_context = "\n\n".join([f"[{s['note_title']}]: {s['text']}" for s in sources]) if sources else "None"
        user_prompt = f"Game template: {game_type}\nTopic: {topic}\n<notes>\n{notes_context}\n</notes>"

    elif kind == "support_task":
        anon_id = clean_payload.get("anon_id", "Student")
        weak_topic = clean_payload.get("weak_topic", clean_payload.get("topic", "variables"))
        task_kind = clean_payload.get("task_kind", "game")
        system_prompt = SUPPORT_TASK_SYSTEM_PROMPT.format(anon_id=anon_id, weak_topic=weak_topic)
        notes_context = "\n\n".join([f"[{s['note_title']}]: {s['text']}" for s in sources]) if sources else "None"
        user_prompt = (
            f"Student: {anon_id}\n"
            f"Target Topic: {weak_topic}\n"
            f"Kind: {task_kind}\n"
            f"Instructions: {clean_payload.get('teacher_instructions', '')}\n"
            f"<notes>\n{notes_context}\n</notes>"
        )

    elif kind == "student_summary":
        system_prompt = STUDENT_SUMMARY_SYSTEM_PROMPT
        anon_id = clean_payload.get("anon_id", "Student")
        evidence_data = clean_payload.get("evidence", {})
        user_prompt = f"Student: {anon_id}\nNumeric Evidence: {json.dumps(evidence_data)}"

    elif kind == "desk_chat_intent":
        system_prompt = DESK_CHAT_INTENT_SYSTEM_PROMPT
        user_prompt = clean_payload.get("question", "")

    elif kind == "desk_chat_synthesis":
        system_prompt = DESK_CHAT_SYNTHESIS_SYSTEM_PROMPT
        user_prompt = (
            f"Question: {clean_payload.get('question', '')}\n"
            f"<data>\n{json.dumps(clean_payload.get('data', {}))}\n</data>"
        )

    else:
        system_prompt = "You are a helpful educational AI assistant."
        user_prompt = json.dumps(clean_payload)

    # -----------------------------------------------------------------------
    # Step 5: Call ai_service
    # -----------------------------------------------------------------------
    llm_output = await call_llm(system_prompt, user_prompt)

    # -----------------------------------------------------------------------
    # Step 6: Run Output Guard
    # -----------------------------------------------------------------------
    if kind == "helper":
        guard_result = check_output(
            reply=llm_output,
            hint_level=hint_level,
            solution_meta=solution_meta
        )
        final_text = guard_result["text"]
        is_blocked = guard_result["blocked"]
    else:
        final_text = llm_output.strip()
        is_blocked = False
        guard_result = {"blocked": False, "reason": None}


    # -----------------------------------------------------------------------
    # Step 7: Write ai_logs (Immutable audit record with clean data only)
    # -----------------------------------------------------------------------
    clean_sources_meta = [
        {"note_title": s.get("note_title", ""), "heading": s.get("heading", "")}
        for s in sources
    ]
    log_entry = AILog(
        kind=kind,
        user_id=user.id,
        user_role=user.role,
        user_anon_id=user.anon_id,
        class_id=class_id,
        prompt=user_prompt[:2000],
        response=final_text[:2000],
        sources=json.dumps(clean_sources_meta),
        removed_counts=json.dumps(removed_pii),
        blocked=is_blocked,
        block_reason=guard_result.get("reason"),
        timestamp=utc_now()
    )

    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    # -----------------------------------------------------------------------
    # Step 8: Return Result
    # -----------------------------------------------------------------------
    return {
        "text": final_text,
        "sources": clean_sources_meta,
        "hint_level": hint_level,
        "blocked": is_blocked,
        "grounded": grounded,
        "log_id": log_entry.id
    }
