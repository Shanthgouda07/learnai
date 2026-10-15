"""
Tests for Python visualizer backend tracer, validator, and sandbox.
"""
import pytest
from app.visualizer.validator import validate_code
from app.visualizer.sandbox import run_in_sandbox


def test_simple_loop_trace():
    """Simple loop produces the right number of steps and correct variable values."""
    code = (
        "total = 0\n"
        "for i in range(1, 4):\n"
        "    total += i\n"
        "print(total)\n"
    )
    res = run_in_sandbox(code)
    assert res["error"] is None, f"Unexpected error: {res['error']}"
    assert len(res["steps"]) > 0
    assert "6" in res["final_stdout"]

    # Verify variable evolution
    steps = res["steps"]
    totals = [
        s["locals"].get("total", s["globals"].get("total"))
        for s in steps
        if "total" in s["locals"] or "total" in s["globals"]
    ]
    assert 0 in totals
    assert 6 in totals


def test_recursive_factorial_call_stack():
    """A recursive function (factorial) shows a call stack growing to depth n and shrinking again."""
    code = (
        "def fact(n):\n"
        "    if n <= 1:\n"
        "        return 1\n"
        "    return n * fact(n - 1)\n"
        "res = fact(3)\n"
    )
    res = run_in_sandbox(code)
    assert res["error"] is None
    steps = res["steps"]

    # Find the maximum call stack depth for fact
    max_depth = 0
    depths = []
    for s in steps:
        stack = s["call_stack"]
        fact_frames = [f for f in stack if f["func"] == "fact"]
        depth = len(fact_frames)
        depths.append(depth)
        if depth > max_depth:
            max_depth = depth

    # factorial(3) should grow to depth 3 and then unwind back to 0
    assert max_depth >= 3
    # Check that depth decreases after reaching max
    peak_idx = depths.index(max_depth)
    assert any(d < max_depth for d in depths[peak_idx:])


def test_infinite_loop_cap_or_timeout():
    """`while True: pass` times out or hits the step cap, with a friendly error."""
    code = "while True:\n    pass\n"
    res = run_in_sandbox(code, max_steps=50, timeout_sec=2.0)
    assert res["truncated"] is True
    assert res["error"] is not None
    err_msg = res["error"]["message"].lower()
    assert "stopped" in err_msg or "loop" in err_msg or "time" in err_msg


def test_security_rejections():
    """`import os`, `open('x')`, `__import__('os')`, `().__class__.__bases__` are all rejected."""
    bad_codes = [
        "import os",
        "open('x')",
        "__import__('os')",
        "().__class__.__bases__",
    ]
    for bad in bad_codes:
        v = validate_code(bad)
        assert v["ok"] is False, f"Expected '{bad}' to be rejected by validator"

        res = run_in_sandbox(bad)
        assert res["error"] is not None, f"Expected '{bad}' to return error from sandbox"


def test_runtime_error_division_by_zero():
    """A runtime error (division by zero) returns steps up to the error plus the error line."""
    code = (
        "x = 10\n"
        "y = 0\n"
        "z = x / y\n"
    )
    res = run_in_sandbox(code)
    assert res["error"] is not None
    assert "ZeroDivisionError" in res["error"]["type"]
    assert res["error"]["line"] == 3
    assert len(res["steps"]) >= 2  # Steps for lines 1 and 2 exist


def test_list_mutation_marks_changed():
    """A list mutation marks the variable in `changed`."""
    code = (
        "nums = [1, 2]\n"
        "nums.append(3)\n"
    )
    res = run_in_sandbox(code)
    assert res["error"] is None
    steps = res["steps"]
    # Look for a step after line 2 where 'nums' is marked as changed
    nums_changed = [
        s for s in steps
        if "nums" in s.get("changed", [])
    ]
    assert len(nums_changed) >= 1, "Expected nums to appear in changed list"


def test_check_endpoint_pass_and_fail():
    """/check passes correct code and fails wrong code with a useful diff."""
    import json
    from fastapi.testclient import TestClient
    from app.main import app
    from app.models.database import SessionLocal
    from app.models.models import Game, Class, User

    client = TestClient(app)
    db = SessionLocal()

    # Ensure a test teacher/class exists
    user = db.query(User).filter(User.role == "teacher").first()
    if not user:
        user = User(role="teacher", anon_id="T-TEST", name="Test Teacher", password="pass")
        db.add(user)
        db.flush()

    cls = db.query(Class).first()
    if not cls:
        cls = Class(name="Test Class", teacher_id=user.id)
        db.add(cls)
        db.flush()

    # Create a challenge with test cases
    challenge_payload = {
        "kind": "make_it_print",
        "prompt": "Print Hello World",
        "starter_code": "# write your code",
        "expected_output": "Hello World",
        "test_cases": [
            {"name": "Print Greeting", "stdin": [], "expected_stdout": "Hello World"}
        ],
        "hints": ["Use print()"],
        "topic": "strings",
        "points": 100,
    }
    game = Game(
        class_id=cls.id,
        title="Print Hello Test",
        game_type="visualizer",
        content_json=json.dumps(challenge_payload),
        status="published",
    )
    db.add(game)
    db.commit()
    db.refresh(game)

    # 1. Test wrong code
    res_fail = client.post("/api/visualizer/check", json={
        "challenge_id": game.id,
        "code": "print('Wrong Output')",
    })
    assert res_fail.status_code == 200
    data_fail = res_fail.json()
    assert data_fail["passed"] is False
    assert data_fail["accuracy"] == 0.0
    assert len(data_fail["results"]) == 1
    assert data_fail["results"][0]["expected"] == "Hello World"
    assert data_fail["results"][0]["actual"] == "Wrong Output"

    # 2. Test correct code
    res_pass = client.post("/api/visualizer/check", json={
        "challenge_id": game.id,
        "code": "print('Hello World')",
    })
    assert res_pass.status_code == 200
    data_pass = res_pass.json()
    assert data_pass["passed"] is True
    assert data_pass["accuracy"] == 1.0
    assert data_pass["points_awarded"] > 0
    assert data_pass["results"][0]["actual"] == "Hello World"
