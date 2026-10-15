"""
Privacy router for LearnAI.
Handles:
- Consent check, acceptance, and re-consent enforcement
- Student personal data view (/my-data) and JSON export (/export)
- Student deletion requests and teacher approval with aggregate session preservation
- Teacher class export as CSV (anon_ids only)
- Audit access log retrieval (anon_ids only, no real names)
- AI transparency endpoint (what is sent / never sent + live redacted PII counts)
- Class data retention settings & parental consent flag
- Demo mode status and one-click database reset
"""
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.config import settings, utc_now

from app.models.database import get_db
from app.models.models import (
    User, Class, Consent, AccessLog, DeletionRequest,
    DeletionAuditLog, AILog, ClassEnrollment
)
from app.services.auth import get_current_user, require_role
from app.privacy.export import export_student_data, export_class_csv
from app.privacy.delete import request_deletion, approve_deletion

router = APIRouter(prefix="/api", tags=["privacy"])


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------
class ConsentSubmitRequest(BaseModel):
    version: str
    language: Optional[str] = "en"

class DeleteRequestBody(BaseModel):
    reason: Optional[str] = ""
    class_id: Optional[int] = None

class ClassPrivacySettingsUpdate(BaseModel):
    retention_months: Optional[int] = None
    parental_consent_obtained: Optional[bool] = None


# ---------------------------------------------------------------------------
# 1. Consent Management
# ---------------------------------------------------------------------------
@router.get("/consent")
@router.get("/privacy/consent")
def get_consent_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Check current consent status for the user against current system consent_version.
    """
    consents = (
        db.query(Consent)
        .filter(Consent.user_id == current_user.id)
        .order_by(Consent.accepted_at.desc())
        .all()
    )
    has_valid_consent = any(c.version == settings.consent_version for c in consents)

    return {
        "has_consented": has_valid_consent,
        "current_version": settings.consent_version,
        "role": current_user.role,
        "consents": [
            {
                "id": c.id,
                "version": c.version,
                "language": c.language,
                "accepted_at": c.accepted_at.isoformat() if c.accepted_at else None,
            }
            for c in consents
        ],
    }


@router.post("/consent")
@router.post("/privacy/consent")
def submit_consent(
    body: ConsentSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Record user's consent for a specific terms version and language.
    """
    consent_rec = Consent(
        user_id=current_user.id,
        version=body.version,
        language=body.language or "en",
        accepted_at=utc_now(),
    )

    db.add(consent_rec)
    db.commit()
    db.refresh(consent_rec)

    return {
        "success": True,
        "message": "Consent recorded successfully.",
        "consent": {
            "id": consent_rec.id,
            "version": consent_rec.version,
            "language": consent_rec.language,
            "accepted_at": consent_rec.accepted_at.isoformat(),
        },
    }


# ---------------------------------------------------------------------------
# 2. Student My Data & JSON Export
# ---------------------------------------------------------------------------
@router.get("/privacy/my-data")
def get_my_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return everything stored about the current student, grouped by category.
    Names are visible ONLY to the student themselves.
    """
    return export_student_data(db, current_user)


@router.get("/privacy/export")
def download_my_data_json(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Download student's complete data export as JSON file.
    """
    data = export_student_data(db, current_user)
    content = json.dumps(data, indent=2)
    filename = f"learnai_privacy_export_{current_user.anon_id}.json"

    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ---------------------------------------------------------------------------
# 3. Student Deletion Request & Teacher Approval
# ---------------------------------------------------------------------------
@router.post("/privacy/delete-request")
def create_delete_request(
    body: DeleteRequestBody,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Student submits a deletion request.
    School/teacher approves before hard deletion occurs.
    """
    if current_user.role != "student":
        raise HTTPException(status_code=400, detail="Only student accounts can file deletion requests.")

    req = request_deletion(db, student=current_user, class_id=body.class_id, reason=body.reason or "")
    return {
        "success": True,
        "request_id": req.id,
        "status": req.status,
        "requested_at": req.requested_at.isoformat() if req.requested_at else None,
        "message": "Deletion request received. School/teacher approval is required to safeguard records.",
    }


@router.get("/privacy/class/{class_id}/deletion-requests")
def list_class_deletion_requests(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    """
    List deletion requests for a teacher's class.
    Shows student anon_id and student name to the teacher (since teacher is class admin).
    """
    # Verify teacher owns class
    c = db.query(Class).filter(Class.id == class_id, Class.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=403, detail="Class not found or unauthorized.")

    reqs = (
        db.query(DeletionRequest)
        .filter(DeletionRequest.class_id == class_id)
        .order_by(DeletionRequest.requested_at.desc())
        .all()
    )

    # Attach student names for teacher review
    student_ids = [r.student_id for r in reqs]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    student_map = {s.id: s.name for s in students}

    return [
        {
            "id": r.id,
            "student_id": r.student_id,
            "student_anon_id": r.student_anon_id,
            "student_name": student_map.get(r.student_id, "Unknown"),
            "status": r.status,
            "reason": r.reason,
            "requested_at": r.requested_at.isoformat() if r.requested_at else None,
            "approved_at": r.approved_at.isoformat() if r.approved_at else None,
        }
        for r in reqs
    ]


@router.post("/privacy/deletion-requests/{request_id}/approve")
def approve_student_deletion(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    """
    Teacher approves student data deletion.
    Hard-deletes personal data, preserves sessions as anonymized aggregates.
    """
    return approve_deletion(db, request_id=request_id, teacher=current_user)


# ---------------------------------------------------------------------------
# 4. Teacher Class CSV Export
# ---------------------------------------------------------------------------
@router.get("/privacy/class/{class_id}/export")
def download_class_csv(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    """
    Download class learning progress as CSV.
    Guaranteed: Strictly anon_ids, NEVER student names or emails.
    """
    c = db.query(Class).filter(Class.id == class_id, Class.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=403, detail="Class not found or unauthorized.")

    csv_data = export_class_csv(db, class_id)
    filename = f"class_{class_id}_anonymized_progress.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ---------------------------------------------------------------------------
# 5. Class Access Log Audit (Anon IDs only, visible to teacher and admin)
# ---------------------------------------------------------------------------
@router.get("/privacy/class/{class_id}/access-log")
def get_class_access_log(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    """
    Retrieve access log for student detail views in this class.
    Contains strictly anon_ids, never personal names.
    """
    c = db.query(Class).filter(Class.id == class_id, Class.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=403, detail="Class not found or unauthorized.")

    # Find anon_ids of students in class
    enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id == class_id).all()
    student_ids = [e.student_id for e in enrollments]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    class_anon_ids = {s.anon_id for s in students}

    logs = (
        db.query(AccessLog)
        .filter(AccessLog.target_anon_id.in_(class_anon_ids))
        .order_by(AccessLog.timestamp.desc())
        .limit(100)
        .all()
    )

    return [
        {
            "id": l.id,
            "viewer_anon_id": l.viewer_anon_id,
            "viewer_role": l.viewer_role,
            "target_anon_id": l.target_anon_id,
            "page": l.page,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
        }
        for l in logs
    ]


# ---------------------------------------------------------------------------
# 6. AI Transparency & Live PII Redaction Counts
# ---------------------------------------------------------------------------
@router.get("/privacy/ai-transparency")
def get_ai_transparency(
    db: Session = Depends(get_db),
):
    """
    Plain summary of what is sent to AI and what is NEVER sent to AI.
    Calculates live counts of removed PII from ai_logs audit records.
    """
    logs = db.query(AILog).all()

    total_ai_calls = len(logs)
    pii_redacted_calls = 0
    names_removed = 0
    emails_removed = 0
    phones_removed = 0

    for l in logs:
        if l.removed_counts:
            try:
                counts = json.loads(l.removed_counts)
                if isinstance(counts, list) and counts:
                    pii_redacted_calls += 1
                    names_removed += counts.count("NAME") + counts.count("NAME_OR_IDENTIFIER")
                    emails_removed += counts.count("EMAIL")
                    phones_removed += counts.count("PHONE")
                elif isinstance(counts, dict) and counts:
                    pii_redacted_calls += 1
                    names_removed += counts.get("names", 0) + counts.get("name", 0)
                    emails_removed += counts.get("emails", 0) + counts.get("email", 0)
                    phones_removed += counts.get("phones", 0) + counts.get("phone", 0)
            except Exception:
                pass

    return {
        "principles": [
            "AI supports human judgment; it never makes final pedagogical or privacy decisions autonomously.",
            "All student prompts are sanitized and anonymized before reaching external models.",
            "Student real names, contact details, and school identifiers are strictly never transmitted.",
        ],
        "what_is_sent_to_ai": [
            "Sanitized query text with names replaced by pseudonyms (e.g. S-004)",
            "Curriculum topic and targeted sub-concept (e.g. 'for_loops')",
            "Retrieved course note excerpts (RAG context from approved notes only)",
            "Target learning stage or grade level context",
        ],
        "what_is_never_sent_to_ai": [
            "Student real names and nicknames",
            "Email addresses, phone numbers, or contact information",
            "Physical location or IP addresses",
            "Direct quiz answer keys or confidential teacher grading notes",
            "Cross-class or cross-student historical performance dossiers",
        ],
        "live_metrics": {
            "total_ai_requests": total_ai_calls,
            "requests_with_pii_intercepted": pii_redacted_calls,
            "names_redacted_count": names_removed,
            "emails_redacted_count": emails_removed,
            "phones_redacted_count": phones_removed,
            "total_pii_tokens_shielded": names_removed + emails_removed + phones_removed,
        },
    }


# ---------------------------------------------------------------------------
# 7. Class Data Retention Settings & Parental Consent
# ---------------------------------------------------------------------------
@router.get("/privacy/class/{class_id}/settings")
def get_class_privacy_settings(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    c = db.query(Class).filter(Class.id == class_id, Class.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=403, detail="Class not found or unauthorized.")

    return {
        "class_id": c.id,
        "class_name": c.name,
        "retention_months": getattr(c, "retention_months", 12) or 12,
        "parental_consent_obtained": bool(getattr(c, "parental_consent_obtained", False)),
    }


@router.patch("/privacy/class/{class_id}/settings")
def update_class_privacy_settings(
    class_id: int,
    body: ClassPrivacySettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    c = db.query(Class).filter(Class.id == class_id, Class.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=403, detail="Class not found or unauthorized.")

    if body.retention_months is not None:
        if body.retention_months not in [3, 6, 12, 24, 36]:
            raise HTTPException(status_code=400, detail="Retention months must be one of 3, 6, 12, 24, 36.")
        c.retention_months = body.retention_months

    if body.parental_consent_obtained is not None:
        c.parental_consent_obtained = body.parental_consent_obtained

    db.commit()
    db.refresh(c)

    return {
        "success": True,
        "class_id": c.id,
        "retention_months": c.retention_months,
        "parental_consent_obtained": c.parental_consent_obtained,
    }


# ---------------------------------------------------------------------------
# 8. Demo Mode & Reset
# ---------------------------------------------------------------------------
@router.get("/demo/status")
def get_demo_status():
    return {
        "demo_mode": settings.demo_mode,
        "consent_version": settings.consent_version,
    }


@router.post("/demo/reset")
def reset_demo_database(
    current_user: User = Depends(require_role("teacher")),
):
    """
    Reset demo data back to baseline state.
    Requires teacher role and settings.demo_mode == True.
    Re-runs seed script to restore:
    - S-004, S-007, S-011 weak in variables
    - S-002 improved
    - S-009 inactive 9 days
    """
    if not settings.demo_mode:
        raise HTTPException(status_code=403, detail="Reset is only permitted in demo mode.")

    from seed import run_seed  # seed.py wrapper
    run_seed()

    return {
        "success": True,
        "message": "Demo data successfully reset to baseline scenario.",
    }

