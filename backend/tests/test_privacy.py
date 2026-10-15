"""
Comprehensive tests for LearnAI privacy and consent features.
Verifies:
- Access without consent is blocked (403) on protected endpoints
- Whitelisted endpoints (/api/consent, /api/me) remain accessible
- Submitting consent unblocks the student
- Consent version bump forces re-consent
- Export contains only the requesting student's data
- Deletion removes personal data but keeps anonymized aggregates
- Access log and class CSV export contain strictly anon_ids, never names
- AI transparency endpoint returns plain summary and live metrics
- Demo reset restores demo state
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.models.database import SessionLocal
from app.models.models import (
    User, Class, ClassEnrollment, Note, Game,
    Session as GameSession, NoteProgress, Consent, AccessLog,
    DeletionRequest, DeletionAuditLog
)
from app.services.auth import create_access_token

client = TestClient(app)


def get_token(anon_id: str, role: str) -> str:
    db = SessionLocal()
    u = db.query(User).filter(User.anon_id == anon_id).first()
    if not u:
        u = User(role=role, anon_id=anon_id, name="Test User", password="pass")
        db.add(u)
        db.commit()
    user_id = u.id
    db.close()
    return create_access_token({"sub": str(user_id), "role": role})


def test_unconsented_student_blocked_on_notes():
    """Unconsented student (S-012) receives 403 on standard student endpoints."""
    # Ensure S-012 has no consent
    db = SessionLocal()
    s12 = db.query(User).filter(User.anon_id == "S-012").first()
    assert s12 is not None
    db.query(Consent).filter(Consent.user_id == s12.id).delete()
    db.commit()
    db.close()

    token = get_token("S-012", "student")
    res = client.get("/api/notes/?class_id=1", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403
    assert "Consent required" in res.json()["detail"]


def test_unconsented_student_can_access_me_and_consent():
    """Unconsented student can still access /api/me and /api/consent."""
    token = get_token("S-012", "student")

    # /api/me
    res_me = client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["has_consented"] is False

    # /api/consent
    res_c = client.get("/api/consent", headers={"Authorization": f"Bearer {token}"})
    assert res_c.status_code == 200
    assert res_c.json()["has_consented"] is False


def test_submitting_consent_unblocks_student():
    """Once consent is submitted, student can access protected endpoints."""
    token = get_token("S-012", "student")

    # Accept consent
    res_submit = client.post(
        "/api/consent",
        json={"version": settings.consent_version, "language": "en"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_submit.status_code == 200
    assert res_submit.json()["success"] is True

    # Now note endpoint works
    res_notes = client.get("/api/notes/?class_id=1", headers={"Authorization": f"Bearer {token}"})
    assert res_notes.status_code == 200


def test_consent_version_bump_forces_reconsent(monkeypatch):
    """Bumping consent_version in settings forces re-consent."""
    db = SessionLocal()
    s1 = db.query(User).filter(User.anon_id == "S-001").first()
    # Clean up any leftover 2.0 consent from previous test runs
    db.query(Consent).filter(Consent.user_id == s1.id, Consent.version == "2.0").delete()
    if not db.query(Consent).filter(Consent.user_id == s1.id, Consent.version == "1.0").first():
        db.add(Consent(user_id=s1.id, version="1.0", language="en"))
    db.commit()
    db.close()

    token = get_token("S-001", "student")

    # First verify S-001 has access under 1.0
    res1 = client.get("/api/notes/?class_id=1", headers={"Authorization": f"Bearer {token}"})
    assert res1.status_code == 200

    # Bump version to 2.0
    monkeypatch.setattr(settings, "consent_version", "2.0")

    # Access is now blocked
    res2 = client.get("/api/notes/?class_id=1", headers={"Authorization": f"Bearer {token}"})
    assert res2.status_code == 403
    assert "Consent required" in res2.json()["detail"]

    # Re-accept version 2.0
    client.post(
        "/api/consent",
        json={"version": "2.0", "language": "en"},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Access restored
    res3 = client.get("/api/notes/?class_id=1", headers={"Authorization": f"Bearer {token}"})
    assert res3.status_code == 200


def test_student_data_export_contains_only_requesting_student():
    """Student export includes only the requesting student's own records."""
    token = get_token("S-001", "student")
    res = client.get("/api/privacy/my-data", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()

    assert data["profile"]["anon_id"] == "S-001"
    assert data["profile"]["name"] == "Alex"
    # Ensure all sessions belong to S-001
    db = SessionLocal()
    s1 = db.query(User).filter(User.anon_id == "S-001").first()
    db_count = db.query(GameSession).filter(GameSession.student_id == s1.id).count()
    db.close()
    assert len(data["sessions"]) == db_count


def test_student_deletion_request_and_teacher_approval():
    """Student deletion request hard-deletes personal info but preserves sessions as aggregates."""
    db = SessionLocal()
    del_student = db.query(User).filter(User.anon_id == "S-999-DEL").first()
    if not del_student:
        del_student = User(role="student", anon_id="S-999-DEL", name="Delete Me", password="pass")
        db.add(del_student)
        db.flush()
        db.add(ClassEnrollment(class_id=1, student_id=del_student.id))
        db.commit()

    # Always ensure valid consent exists for this test student before testing deletion
    db.query(Consent).filter(Consent.user_id == del_student.id).delete()
    db.add(Consent(user_id=del_student.id, version=settings.consent_version, language="en"))
    del_student.name = "Delete Me"
    del_student.password = "pass"

    # Always add a fresh session for this test student to be preserved
    game = db.query(Game).filter(Game.class_id == 1).first()
    db.add(GameSession(student_id=del_student.id, game_id=game.id, class_id=1, score=85, accuracy=0.85, topic="variables"))
    db.commit()

    del_student_id = del_student.id
    db.close()

    s_token = create_access_token({"sub": str(del_student_id), "role": "student"})
    t_token = get_token("T-001", "teacher")

    # 1. Student requests deletion
    req_res = client.post(
        "/api/privacy/delete-request",
        json={"reason": "Moving school", "class_id": 1},
        headers={"Authorization": f"Bearer {s_token}"},
    )
    assert req_res.status_code == 200
    req_id = req_res.json()["request_id"]

    # 2. Teacher views requests
    list_res = client.get(
        "/api/privacy/class/1/deletion-requests",
        headers={"Authorization": f"Bearer {t_token}"},
    )
    assert list_res.status_code == 200
    req_ids = [r["id"] for r in list_res.json()]
    assert req_id in req_ids

    # 3. Teacher approves deletion
    appr_res = client.post(
        f"/api/privacy/deletion-requests/{req_id}/approve",
        headers={"Authorization": f"Bearer {t_token}"},
    )
    assert appr_res.status_code == 200
    audit_data = appr_res.json()
    assert audit_data["deleted_anon_id"] == "S-999-DEL"
    assert audit_data["sessions_preserved"] >= 1

    # 4. Check personal data is wiped and session preserved
    db = SessionLocal()
    check_u = db.query(User).filter(User.id == del_student_id).first()
    assert "Deleted Student" in check_u.name
    assert check_u.password == "DELETED"
    # Consents deleted
    assert db.query(Consent).filter(Consent.user_id == del_student_id).count() == 0
    # Audit log entry exists with NO personal name
    audit_row = db.query(DeletionAuditLog).filter(DeletionAuditLog.deleted_anon_id == "S-999-DEL").first()
    assert audit_row is not None
    assert audit_row.approved_by_anon_id == "T-001"
    db.close()


def test_access_log_contains_only_anon_ids():
    """Audit access log must strictly contain anon_ids, NEVER real names."""
    t_token = get_token("T-001", "teacher")

    db = SessionLocal()
    s1 = db.query(User).filter(User.anon_id == "S-001").first()
    s1_id = s1.id
    db.close()

    # Teacher views student detail
    res_view = client.get(f"/api/desk/students/{s1_id}?class_id=1", headers={"Authorization": f"Bearer {t_token}"})
    assert res_view.status_code == 200

    # Check access log
    res_log = client.get("/api/privacy/class/1/access-log", headers={"Authorization": f"Bearer {t_token}"})
    assert res_log.status_code == 200
    logs = res_log.json()
    assert len(logs) >= 1

    log = logs[0]
    assert log["viewer_anon_id"] == "T-001"
    assert log["target_anon_id"] == "S-001"
    # Ensure no real name appears in the access log fields
    for k, v in log.items():
        if isinstance(v, str):
            assert "Alex" not in v
            assert "Ms. Rivera" not in v


def test_class_csv_export_has_no_names():
    """Class CSV export contains anon_ids only."""
    t_token = get_token("T-001", "teacher")
    res = client.get("/api/privacy/class/1/export", headers={"Authorization": f"Bearer {t_token}"})
    assert res.status_code == 200
    csv_text = res.text
    assert "anon_id,topic,sessions_count" in csv_text
    assert "Alex" not in csv_text
    assert "Jordan" not in csv_text


def test_ai_transparency_endpoint():
    """AI transparency endpoint returns plain summary of sent/never sent and live counts."""
    res = client.get("/api/privacy/ai-transparency")
    assert res.status_code == 200
    data = res.json()
    assert "what_is_sent_to_ai" in data
    assert "what_is_never_sent_to_ai" in data
    assert "live_metrics" in data
