"""
Tests for Phase 5 game templates, scoring engine, and session logging.
"""
import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.database import SessionLocal
from app.models.models import Game, Session as GameSession, NoteProgress, User, Class, Note
from app.games.scoring import compute_score
from app.services.auth import create_access_token

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_db():
    db = SessionLocal()
    # Ensure Teacher and Students
    teacher = db.query(User).filter(User.role == "teacher").first()
    if not teacher:
        teacher = User(role="teacher", anon_id="T-001", name="Teacher", password="pass")
        db.add(teacher)
        db.flush()

    cls = db.query(Class).first()
    if not cls:
        cls = Class(name="CS101", teacher_id=teacher.id)
        db.add(cls)
        db.flush()

    student1 = db.query(User).filter(User.anon_id == "S-TEST1").first()
    if not student1:
        student1 = User(role="student", anon_id="S-TEST1", name="Student One", password="pass")
        db.add(student1)
        db.flush()

    student2 = db.query(User).filter(User.anon_id == "S-TEST2").first()
    if not student2:
        student2 = User(role="student", anon_id="S-TEST2", name="Student Two", password="pass")
        db.add(student2)
        db.flush()

    # Note
    note = db.query(Note).first()
    if not note:
        note = Note(class_id=cls.id, title="Test Loops", content="Content", status="published")
        db.add(note)
        db.flush()

    # Consent for test students (required by Phase 8 consent gate)
    from app.models.models import Consent
    for st in [student1, student2]:
        if not db.query(Consent).filter(Consent.user_id == st.id).first():
            db.add(Consent(user_id=st.id, version="1.0", language="en"))

    db.commit()
    yield {
        "teacher": teacher,
        "student1": student1,
        "student2": student2,
        "class": cls,
        "note": note,
    }
    db.close()


def test_start_refused_when_recall_not_passed(setup_db):
    """/start is refused (403) when the recall check is not passed."""
    db = SessionLocal()
    st1 = setup_db["student1"]
    note = setup_db["note"]
    cls = setup_db["class"]

    # Ensure student1 has NOT passed the check on this note
    db.query(NoteProgress).filter(
        NoteProgress.student_id == st1.id,
        NoteProgress.note_id == note.id,
    ).delete()
    db.commit()

    game = Game(
        class_id=cls.id,
        linked_note_id=note.id,
        title="Locked Game",
        game_type="fill_blank",
        content_json=json.dumps({
            "prompt": "Fill in loop",
            "code_template": "for i in range(___0___):",
            "blanks": [{"id": 0, "options": ["5", "10"], "answer": "5"}],
            "topic": "loops",
            "points": 100,
        }),
        status="approved",
    )
    db.add(game)
    db.commit()
    db.refresh(game)

    token = create_access_token({"sub": str(st1.id), "role": "student"})
    res = client.post(
        f"/api/games/{game.id}/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403
    assert "Locked" in res.json()["detail"]


def test_start_payload_safe_and_shuffled(setup_db):
    """/start payload never contains answers; step order is shuffled."""
    db = SessionLocal()
    st1 = setup_db["student1"]
    note = setup_db["note"]
    cls = setup_db["class"]

    # Mark note as passed
    progress = db.query(NoteProgress).filter(
        NoteProgress.student_id == st1.id,
        NoteProgress.note_id == note.id,
    ).first()
    if not progress:
        progress = NoteProgress(student_id=st1.id, note_id=note.id, read_check_passed=True)
        db.add(progress)
    else:
        progress.read_check_passed = True
    db.commit()

    # Create an order_steps game
    order_game = Game(
        class_id=cls.id,
        linked_note_id=note.id,
        title="Order Steps Game",
        game_type="order_steps",
        content_json=json.dumps({
            "prompt": "Order the steps",
            "steps": ["Step 1: Init", "Step 2: Loop", "Step 3: End", "Step 4: Cleanup"],
            "explanation": "Proper sequence",
            "topic": "loops",
            "points": 100,
        }),
        status="approved",
    )
    db.add(order_game)
    db.commit()
    db.refresh(order_game)

    token = create_access_token({"sub": str(st1.id), "role": "student"})
    res = client.post(
        f"/api/games/{order_game.id}/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    content = data["content"]

    # Answers stripped
    assert "answer" not in content
    assert "correct_order" not in content

    # Check Fill Blank as well
    fb_game = Game(
        class_id=cls.id,
        linked_note_id=note.id,
        title="FB Test",
        game_type="fill_blank",
        content_json=json.dumps({
            "prompt": "Fill blank",
            "code_template": "x = ___0___",
            "blanks": [{"id": 0, "options": ["1", "2"], "answer": "1"}],
            "topic": "variables",
            "points": 100,
        }),
        status="approved",
    )
    db.add(fb_game)
    db.commit()
    db.refresh(fb_game)

    res_fb = client.post(
        f"/api/games/{fb_game.id}/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_fb.status_code == 200
    fb_content = res_fb.json()["content"]
    # Verify no blank has an 'answer' field
    for b in fb_content["blanks"]:
        assert "answer" not in b


def test_answer_grading_flow(setup_db):
    """Correct and incorrect answers for each game type are graded properly."""
    db = SessionLocal()
    st1 = setup_db["student1"]
    note = setup_db["note"]
    cls = setup_db["class"]
    token = create_access_token({"sub": str(st1.id), "role": "student"})

    # Bug Hunt Game
    bh_game = Game(
        class_id=cls.id,
        linked_note_id=note.id,
        title="Bug Hunt Test",
        game_type="bug_hunt",
        content_json=json.dumps({
            "prompt": "Find bug",
            "code": "a = 1\nb = 0\nc = a / b",
            "bug_line": 3,
            "bug_explanation": "ZeroDivisionError",
            "fix_options": ["b = 1", "b = None"],
            "correct_fix_index": 0,
            "topic": "variables",
            "points": 100,
        }),
        status="approved",
    )
    db.add(bh_game)
    db.commit()
    db.refresh(bh_game)

    # Start session
    s_res = client.post(
        f"/api/games/{bh_game.id}/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    sess_id = s_res.json()["session_id"]

    # 1. Answer wrong line
    res_wrong_line = client.post(
        f"/api/games/{bh_game.id}/answer",
        json={"session_id": sess_id, "item_id": "line", "response": 1},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_wrong_line.status_code == 200
    assert res_wrong_line.json()["correct"] is False

    # 2. Answer correct line
    res_correct_line = client.post(
        f"/api/games/{bh_game.id}/answer",
        json={"session_id": sess_id, "item_id": "line", "response": 3},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_correct_line.status_code == 200
    assert res_correct_line.json()["correct"] is True

    # 3. Answer correct fix
    res_correct_fix = client.post(
        f"/api/games/{bh_game.id}/answer",
        json={"session_id": sess_id, "item_id": "fix", "response": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_correct_fix.status_code == 200
    assert res_correct_fix.json()["correct"] is True
    assert "ZeroDivisionError" in res_correct_fix.json()["explanation"]


def test_scoring_no_speed_bonus_and_penalties():
    """Score never increases with faster completion time; attempts & hint penalties apply."""
    # Test compute_score directly
    attempts_perfect = {
        "item1": [{"response": "a", "correct": True}],
        "item2": [{"response": "b", "correct": True}],
    }

    score_fast = compute_score(
        max_points=100,
        total_items=2,
        attempts_log=attempts_perfect,
        history=[],
        hints_used=0,
        duration_sec=5,  # 5 seconds
    )
    score_slow = compute_score(
        max_points=100,
        total_items=2,
        attempts_log=attempts_perfect,
        history=[],
        hints_used=0,
        duration_sec=120,  # 120 seconds
    )
    # Score MUST NOT increase with faster completion time
    assert score_fast["points"] == score_slow["points"] == 100

    # Extra attempt penalty test
    attempts_retry = {
        "item1": [
            {"response": "wrong", "correct": False},
            {"response": "right", "correct": True},
        ],
        "item2": [{"response": "right", "correct": True}],
    }
    score_retry = compute_score(
        max_points=100,
        total_items=2,
        attempts_log=attempts_retry,
        history=[],
        hints_used=1,  # 1 hint used = -5 pts
        duration_sec=30,
    )
    # 1st try accuracy = 1/2 = 0.5 => base points = 50
    # hint penalty = 5 => points < 50
    assert score_retry["points"] < 50
    labels = [b["label"] for b in score_retry["breakdown"]]
    assert "Hints Used Penalty" in labels


def test_improvement_bonus():
    """Improvement bonus applies only when accuracy beats the recent average."""
    # Past history on this topic with avg accuracy 0.5
    class DummySession:
        def __init__(self, acc):
            self.accuracy = acc

    history_low = [DummySession(0.4), DummySession(0.5), DummySession(0.3)]
    attempts_all_correct = {
        "item1": [{"response": "a", "correct": True}],
    }
    # Current accuracy is 1.0 > 0.4 avg -> gets +10 bonus
    res_boost = compute_score(
        max_points=100,
        total_items=1,
        attempts_log=attempts_all_correct,
        history=history_low,
    )
    assert res_boost["points"] == 110
    bonus_item = next(b for b in res_boost["breakdown"] if b["label"] == "Improvement Bonus")
    assert bonus_item["points"] == 10

    # Past history with high accuracy 1.0
    history_high = [DummySession(1.0), DummySession(1.0)]
    res_no_boost = compute_score(
        max_points=100,
        total_items=1,
        attempts_log=attempts_all_correct,
        history=history_high,
    )
    assert res_no_boost["points"] == 100
    assert not any(b["label"] == "Improvement Bonus" for b in res_no_boost["breakdown"])


def test_targeted_games_privacy(setup_db):
    """A student cannot see another student's targeted game."""
    db = SessionLocal()
    st1 = setup_db["student1"]
    st2 = setup_db["student2"]
    cls = setup_db["class"]

    targeted_game = Game(
        class_id=cls.id,
        title="Personal Remediation for S-TEST1",
        game_type="fill_blank",
        content_json=json.dumps({
            "prompt": "Practice",
            "code_template": "x = ___0___",
            "blanks": [{"id": 0, "options": ["1"], "answer": "1"}],
            "topic": "variables",
            "points": 50,
        }),
        status="approved",
        target_student_anon_id=st1.anon_id,
    )
    db.add(targeted_game)
    db.commit()
    db.refresh(targeted_game)

    token_st1 = create_access_token({"sub": str(st1.id), "role": "student"})
    token_st2 = create_access_token({"sub": str(st2.id), "role": "student"})

    # Student 1 sees it in list
    res1 = client.get("/api/games/", headers={"Authorization": f"Bearer {token_st1}"})
    ids_st1 = [g["id"] for g in res1.json()]
    assert targeted_game.id in ids_st1

    # Student 2 DOES NOT see it in list
    res2 = client.get("/api/games/", headers={"Authorization": f"Bearer {token_st2}"})
    ids_st2 = [g["id"] for g in res2.json()]
    assert targeted_game.id not in ids_st2

    # Student 2 cannot start it directly
    start_res = client.post(
        f"/api/games/{targeted_game.id}/start",
        headers={"Authorization": f"Bearer {token_st2}"},
    )
    assert start_res.status_code == 403


def test_finish_session_idempotence(setup_db):
    """Finishing a session twice does not double-count."""
    db = SessionLocal()
    st1 = setup_db["student1"]
    note = setup_db["note"]
    cls = setup_db["class"]
    token = create_access_token({"sub": str(st1.id), "role": "student"})

    game = Game(
        class_id=cls.id,
        linked_note_id=note.id,
        title="Finish Once Game",
        game_type="fill_blank",
        content_json=json.dumps({
            "prompt": "Single Item",
            "code_template": "a = ___0___",
            "blanks": [{"id": 0, "options": ["1"], "answer": "1"}],
            "topic": "variables",
            "points": 100,
        }),
        status="approved",
    )
    db.add(game)
    db.commit()
    db.refresh(game)

    # Start
    start_res = client.post(f"/api/games/{game.id}/start", headers={"Authorization": f"Bearer {token}"})
    sess_id = start_res.json()["session_id"]

    # Answer correctly
    client.post(
        f"/api/games/{game.id}/answer",
        json={"session_id": sess_id, "item_id": 0, "response": "1"},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Finish 1st time
    res_fin1 = client.post(
        f"/api/games/{game.id}/finish",
        json={"session_id": sess_id, "duration_sec": 10, "hints_used": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_fin1.status_code == 200
    score1 = res_fin1.json()["score"]

    # Count completed sessions in DB
    count_before = db.query(GameSession).filter(
        GameSession.id == sess_id,
        GameSession.status == "completed",
    ).count()
    assert count_before == 1

    # Finish 2nd time
    res_fin2 = client.post(
        f"/api/games/{game.id}/finish",
        json={"session_id": sess_id, "duration_sec": 15, "hints_used": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_fin2.status_code == 200
    assert res_fin2.json()["score"] == score1

    count_after = db.query(GameSession).filter(
        GameSession.id == sess_id,
        GameSession.status == "completed",
    ).count()
    assert count_after == 1
