"""
test_desk_analytics.py - Test analytics core algorithms: mastery, prereq, flags.
"""
from datetime import datetime, timedelta
from app.config import utc_now
import pytest

from app.analytics.mastery import compute_topic_mastery, compute_student_all_mastery
from app.analytics.prereq import trace_root_cause, validate_prerequisite_graph
from app.analytics.flags import evaluate_student_flags


class MockSession:
    def __init__(self, accuracy=0.0, timestamp=None, topic="loops", items_json=None, hints_used=0):
        self.accuracy = accuracy
        self.timestamp = timestamp or utc_now()
        self.topic = topic
        self.items_json = items_json or '{"0": {"first_try_correct": true}, "1": {"first_try_correct": false}}'
        self.hints_used = hints_used



def test_mastery_weighted_and_no_data():
    # No data returns None (distinct from 0)
    assert compute_topic_mastery([]) is None

    # Two sessions: older was 0.2, newer was 0.8
    # With decay=0.7, newer session (weight 1.0) dominates older (weight 0.7)
    s_old = MockSession(accuracy=0.2, timestamp=utc_now() - timedelta(days=2))
    s_new = MockSession(accuracy=0.8, timestamp=utc_now() - timedelta(days=1))
    
    result = compute_topic_mastery([s_old, s_new])
    assert result is not None
    # Weighted avg = (1.0*0.8 + 0.7*0.2) / 1.7 = 0.94 / 1.7 ≈ 0.55
    # Plain avg would be 0.50
    assert result["mastery"] > 0.50
    assert result["attempts"] == 2
    assert result["trend"] == "improving"
    assert result["confidence"] == "ok"  # 2 sessions, 4 items total


def test_low_confidence_never_flags():
    # Only 1 session with 2 items -> confidence="low"
    s1 = MockSession(accuracy=0.1, timestamp=utc_now() - timedelta(days=1))
    res = compute_topic_mastery([s1])
    assert res is not None
    assert res["confidence"] == "low"
    assert res["mastery"] == 0.1

    # Should not produce any attention flags because confidence is low
    flags_res = evaluate_student_flags(
        student_id=99,
        anon_id="S-099",
        class_id=1,
        sessions=[s1],
    )
    assert len(flags_res["needs_attention"]) == 0


def test_prerequisite_tracing():
    graph = {
        "variables": [],
        "conditionals": ["variables"],
        "loops": ["variables"],
    }

    # Case 1: Weak loops (0.3) with weak variables (0.2) -> root = variables
    student_mastery_weak = {
        "loops": {"mastery": 0.3, "confidence": "ok"},
        "variables": {"mastery": 0.2, "confidence": "ok"},
    }
    trace1 = trace_root_cause(student_mastery_weak, "loops", graph=graph)
    assert trace1["root"] == "variables"
    assert trace1["chain"] == ["loops", "variables"]

    # Case 2: Weak loops (0.3) with healthy variables (0.8) -> root = loops
    student_mastery_healthy = {
        "loops": {"mastery": 0.3, "confidence": "ok"},
        "variables": {"mastery": 0.8, "confidence": "ok"},
    }
    trace2 = trace_root_cause(student_mastery_healthy, "loops", graph=graph)
    assert trace2["root"] == "loops"
    assert trace2["chain"] == ["loops"]


def test_prerequisite_cycle_detection():
    # Cycle graph: a -> b -> a
    cyclic_graph = {
        "a": ["b"],
        "b": ["a"],
    }
    with pytest.raises(ValueError, match="Prerequisite cycle detected"):
        validate_prerequisite_graph(cyclic_graph)


def test_flag_rules_and_reason_templates():
    now = utc_now()

    # Rule 2: Accuracy fell >= 20 percentage points
    # Latest 3: 0.40, Previous 3: 0.70 -> drop = 30%
    # With weak variables at 0.35
    sessions = []
    for k in range(3):
        # Latest 3 sessions
        sessions.append(MockSession(accuracy=0.40, timestamp=now - timedelta(days=k), topic="loops"))
    for k in range(3, 6):
        # Previous 3 sessions
        sessions.append(MockSession(accuracy=0.70, timestamp=now - timedelta(days=k), topic="loops"))
    # Also add 3 sessions on variables with low accuracy
    for k in range(3):
        sessions.append(MockSession(accuracy=0.35, timestamp=now - timedelta(days=k + 1), topic="variables"))

    flags = evaluate_student_flags(
        student_id=4,
        anon_id="S-004",
        class_id=1,
        sessions=sessions,
        current_time=now,
    )

    needs_att = flags["needs_attention"]
    assert len(needs_att) > 0
    loop_flag = next((f for f in needs_att if "loops" in f["flag_key"]), None)
    assert loop_flag is not None
    assert "accuracy fell 70% to 40% on loops" in loop_flag["reason_text"]
    assert "variables" in loop_flag["reason_text"]
    assert loop_flag["root_cause_topic"] == "variables"


def test_dismiss_and_snooze():
    now = utc_now()
    sessions = [
        MockSession(accuracy=0.2, timestamp=now - timedelta(days=1), topic="loops"),
        MockSession(accuracy=0.2, timestamp=now - timedelta(days=2), topic="loops"),
        MockSession(accuracy=0.2, timestamp=now - timedelta(days=3), topic="loops"),
    ]

    class MockAction:
        def __init__(self, flag_key, action, timestamp):
            self.flag_key = flag_key
            self.action = action
            self.timestamp = timestamp

    flag_key = "flag_5_loops_low_mastery"

    # Snooze active (3 days ago)
    snooze_act = MockAction(flag_key=flag_key, action="snooze", timestamp=now - timedelta(days=3))
    res1 = evaluate_student_flags(5, "S-005", 1, sessions, db_actions=[snooze_act], current_time=now)
    assert not any(f["flag_key"] == flag_key for f in res1["needs_attention"])

    # Snooze expired (8 days ago)
    snooze_exp = MockAction(flag_key=flag_key, action="snooze", timestamp=now - timedelta(days=8))
    res2 = evaluate_student_flags(5, "S-005", 1, sessions, db_actions=[snooze_exp], current_time=now)
    assert any(f["flag_key"] == flag_key for f in res2["needs_attention"])

    # Dismiss without new sessions (dismissed after all sessions)
    dismiss_act = MockAction(flag_key=flag_key, action="dismiss", timestamp=now)
    res3 = evaluate_student_flags(5, "S-005", 1, sessions, db_actions=[dismiss_act], current_time=now)
    assert not any(f["flag_key"] == flag_key for f in res3["needs_attention"])

    # Dismiss with new session appearing afterwards
    new_sess = MockSession(accuracy=0.2, timestamp=now + timedelta(hours=1), topic="loops")
    res4 = evaluate_student_flags(5, "S-005", 1, sessions + [new_sess], db_actions=[dismiss_act], current_time=now + timedelta(hours=2))
    assert any(f["flag_key"] == flag_key for f in res4["needs_attention"])
