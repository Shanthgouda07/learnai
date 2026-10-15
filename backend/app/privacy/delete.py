"""
Data deletion module for LearnAI privacy center.
Implements student deletion requests and teacher approval workflows.
Preserves class learning statistics via anonymized aggregates while hard-deleting
personal identifiers and private logs.
"""
from datetime import datetime
from app.config import utc_now
from typing import Dict, Any, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.models import (
    User, NoteProgress, Consent, ClassEnrollment,
    Session as GameSession, AILog, DeletionRequest, DeletionAuditLog
)


def request_deletion(db: Session, student: User, class_id: Optional[int] = None, reason: str = "") -> DeletionRequest:
    """
    Register a deletion request for a student.
    Status remains 'pending' until approved by teacher.
    """
    # Check if a pending request already exists
    existing = (
        db.query(DeletionRequest)
        .filter(DeletionRequest.student_id == student.id, DeletionRequest.status == "pending")
        .first()
    )
    if existing:
        return existing

    # Find student's primary class if not provided
    if not class_id:
        enrollment = db.query(ClassEnrollment).filter(ClassEnrollment.student_id == student.id).first()
        if enrollment:
            class_id = enrollment.class_id

    req = DeletionRequest(
        student_id=student.id,
        student_anon_id=student.anon_id,
        class_id=class_id,
        status="pending",
        reason=reason,
        requested_at=utc_now(),
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def approve_deletion(db: Session, request_id: int, teacher: User) -> Dict[str, Any]:
    """
    Teacher approves a deletion request.
    1. Hard-deletes personal data (profile name/password, enrollments, note progress, consents).
    2. Preserves sessions with an anonymized aggregate placeholder so class stats remain valid.
    3. Records the deletion in DeletionAuditLog with strictly zero personal data.
    """
    req = db.query(DeletionRequest).filter(DeletionRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Deletion request not found.")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request is already {req.status}.")

    student = db.query(User).filter(User.id == req.student_id).first()
    deleted_anon_id = req.student_anon_id

    records_deleted = 0

    # 1. Delete note progress
    p_count = db.query(NoteProgress).filter(NoteProgress.student_id == req.student_id).delete()
    records_deleted += p_count

    # 2. Delete consents
    c_count = db.query(Consent).filter(Consent.user_id == req.student_id).delete()
    records_deleted += c_count

    # 3. Delete class enrollments
    e_count = db.query(ClassEnrollment).filter(ClassEnrollment.student_id == req.student_id).delete()
    records_deleted += e_count

    # 4. Scrub AI Logs
    l_count = db.query(AILog).filter(AILog.user_id == req.student_id).delete()
    records_deleted += l_count

    # 5. Preserve Sessions: Re-link to aggregate placeholder user
    aggregate_user = db.query(User).filter(User.anon_id == "AGGREGATE_ANON").first()
    if not aggregate_user:
        aggregate_user = User(
            role="student",
            anon_id="AGGREGATE_ANON",
            name="Anonymized Aggregate",
            password="NONE",
        )
        db.add(aggregate_user)
        db.flush()

    sessions = db.query(GameSession).filter(GameSession.student_id == req.student_id).all()
    sessions_preserved = len(sessions)
    for s in sessions:
        s.student_id = aggregate_user.id

    # 6. Anonymize/wipe student personal data in User record
    if student:
        student.name = f"Deleted Student ({deleted_anon_id})"
        student.password = "DELETED"
        records_deleted += 1

    # 7. Record in DeletionAuditLog (strictly anon_ids, no personal info)
    audit = DeletionAuditLog(
        deleted_anon_id=deleted_anon_id,
        approved_by_anon_id=teacher.anon_id,
        records_deleted=records_deleted,
        sessions_preserved=sessions_preserved,
        timestamp=utc_now(),
    )
    db.add(audit)

    # 8. Update request status
    req.status = "approved"
    req.approved_at = utc_now()
    req.approved_by_teacher_id = teacher.id

    db.commit()

    return {
        "success": True,
        "message": f"Student {deleted_anon_id} data deleted. {sessions_preserved} sessions preserved as anonymized aggregates.",
        "records_deleted": records_deleted,
        "sessions_preserved": sessions_preserved,
        "deleted_anon_id": deleted_anon_id,
        "approved_by_anon_id": teacher.anon_id,
    }
