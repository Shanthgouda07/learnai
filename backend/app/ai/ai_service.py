"""
ai_service.py - Unified LLM client with live provider via env and realistic mock fallback.
All calls flow through pipeline.py before reaching this module.
"""
import os
import json
import logging
from typing import Any, Dict, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

MOCK_MODE = not bool(settings.llm_api_key and settings.llm_api_key.strip())


def is_mock_mode() -> bool:
    return MOCK_MODE


async def call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Send prompt to live LLM provider (Gemini REST via httpx).
    If in MOCK_MODE or if request fails, returns mock response.
    """
    if MOCK_MODE:
        return _mock_response(system_prompt, user_prompt)

    try:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.llm_model}:generateContent?key={settings.llm_api_key}"
        )
        body = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
            ]
        }
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(url, json=body)
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        logger.warning(f"[ai_service] Live LLM call failed ({e}). Using mock response fallback.")
        return _mock_response(system_prompt, user_prompt)


def _mock_response(system_prompt: str, user_prompt: str) -> str:
    """Generate realistic offline mock responses based on prompt tags and context."""
    # Check if this is a student helper query
    if "<student_question>" in user_prompt or "student_attempt" in user_prompt:
        # Check grounding in notes
        if "<notes>\n</notes>" in user_prompt or "<notes></notes>" in user_prompt or "No notes available" in user_prompt:
            return "That is not covered in your notes yet. Ask your teacher."

        # Extract note title / heading from retrieved notes
        note_citation = "your notes"
        if "Note: " in user_prompt:
            try:
                line = [l for l in user_prompt.split('\n') if "Note: " in l][0]
                note_citation = line.replace("Note: ", "").strip()
            except Exception:
                pass

        # Check hint level
        if "Hint Level: 3" in user_prompt or "level 3" in user_prompt.lower():
            return (
                f"Here is a similar worked example from {note_citation}:\n"
                "If we have `items = [1, 2]`, writing `items.append(3)` adds 3 to the list so `items` becomes `[1, 2, 3]`.\n"
                "Notice how the method name and syntax work. How can you adapt this to your problem?"
            )
        elif "Hint Level: 2" in user_prompt or "level 2" in user_prompt.lower():
            return (
                f"Notice the syntax discussed in {note_citation}. "
                "Check the loop boundaries and variable assignments carefully. "
                "Are you modifying the right container, and does the range include all needed values?"
            )
        else:
            return (
                f"Great question! Take a look at {note_citation}. "
                "What value does the variable hold right before this step runs? "
                "Trace it with a single example input to see what happens."
            )

    # Note draft
    if "writing curriculum notes" in system_prompt.lower() or "draft a note" in user_prompt.lower():
        topic = "Python Concepts"
        for candidate in ["loops", "variables", "conditionals", "lists", "functions"]:
            if candidate in user_prompt.lower():
                topic = candidate.capitalize()
                break

        return json.dumps({
            "title": f"Mastering {topic}",
            "topic": topic.lower(),
            "content": (
                f"# Mastering {topic}\n\n"
                f"## Core Idea\n\n"
                f"{topic} allow us to organize and execute instructions efficiently in Python.\n\n"
                f"## Practical Example\n\n"
                f"```python\n# Practical demonstration of {topic.lower()}\n"
                f"data = [1, 2, 3]\nfor val in data:\n    print(f'Item: {{val}}')\n```\n\n"
                f"## Classroom Checkpoint\n\n"
                f"Review how each line behaves before starting the challenge."
            )
        })

    # Support task generation
    if "adaptive learning assistant" in system_prompt.lower() or "support_task" in system_prompt.lower() or "support task" in user_prompt.lower():
        topic = "variables"
        for candidate in ["loops", "variables", "conditionals", "lists", "functions"]:
            if candidate in user_prompt.lower():
                topic = candidate
                break

        is_note = "kind: note" in user_prompt.lower() or '"kind": "note"' in user_prompt.lower()
        if is_note:
            return json.dumps({
                "title": f"Targeted Review: {topic.capitalize()}",
                "topic": topic,
                "content": (
                    f"# Review: {topic.capitalize()} Foundations\n\n"
                    f"## Key Concept\n"
                    f"Before building complex logic, reviewing {topic} ensures solid fundamentals.\n\n"
                    f"```python\n# Focused practice on {topic}\nval = 10\nprint(f'{topic}: {{val}}')\n```\n\n"
                    f"## Practice Goal\nReview this example and test yourself."
                )
            })
        else:
            return json.dumps({
                "title": f"Targeted Practice: {topic.capitalize()}",
                "game_type": "fill_blank",
                "content_json": {
                    "topic": topic,
                    "difficulty": 1,
                    "points": 100,
                    "prompt": f"Strengthen your understanding of {topic}.",
                    "code_template": "x = ___0___\nresult = x * 2\nprint(result)",
                    "blanks": [{"id": 0, "options": ["5", "'5'", "None"], "answer": "5"}],
                    "hints": [f"Focus on the {topic} definition", "Use an integer value"],
                    "explanation": f"Using an integer allows multiplication without error."
                }
            })

    # Student summary
    if "summarizing an anonymous student" in system_prompt.lower() or "student_summary" in system_prompt.lower():
        anon_id = "Student"
        for tok in user_prompt.split():
            if tok.startswith("S-"):
                anon_id = tok.strip(",:\"'")
                break

        return json.dumps({
            "summary": (
                f"{anon_id} is making steady progress but has shown signs of difficulty on foundational concepts. "
                "Recent session accuracy declined notably on loops, driven by weak mastery in prerequisite variables. "
                "Providing a focused review on variables should help restore confidence and performance."
            ),
            "why_this_summary": [
                f"Mastery on variables is below 50% with verified confidence.",
                f"Accuracy dropped between earlier and recent sessions on loops.",
                f"Prerequisite analysis identified variables as the root blocker."
            ]
        })

    # Desk chat intent classification (Step 1)
    if "query classifier for a classroom teacher" in system_prompt.lower():
        q_lower = user_prompt.lower()
        # Security/injection check
        if any(bad in q_lower for bad in ["drop table", "delete", "eval", "system prompt", "truncate"]):
            return json.dumps({"intent": "unsupported", "parameters": {}})

        if any(w in q_lower for w in ["struggle", "weak", "failing", "hard time", "trouble", "lowest"]):
            topic = "loops"
            for t in ["variables", "loops", "conditionals", "lists", "functions"]:
                if t in q_lower:
                    topic = t
                    break
            return json.dumps({"intent": "weak_topic_students", "parameters": {"topic": topic, "threshold": 0.5}})

        if any(w in q_lower for w in ["inactive", "absent", "not played", "missing"]):
            return json.dumps({"intent": "inactive_students", "parameters": {"days": 7}})

        if any(w in q_lower for w in ["improve", "better", "win", "progress"]):
            return json.dumps({"intent": "improved_students", "parameters": {"time_window": "week"}})

        if any(w in q_lower for w in ["reteach", "summary", "class", "overview", "how is"]):
            return json.dumps({"intent": "class_summary", "parameters": {}})

        if any(w in q_lower for w in ["compare", "versus", "vs"]):
            return json.dumps({"intent": "compare_topics", "parameters": {"topics": ["variables", "loops"]}})

        if "s-" in q_lower:
            # student specific
            for part in user_prompt.split():
                if part.upper().startswith("S-"):
                    return json.dumps({"intent": "student_detail", "parameters": {"anon_id": part.upper().strip("?.,!")}})

        return json.dumps({"intent": "unsupported", "parameters": {}})

    # Desk chat synthesis (Step 2)
    if "answering a teacher's inquiry" in system_prompt.lower():
        # Synthesize answer using data in prompt
        if "weak_topic_students" in user_prompt or "struggle" in user_prompt.lower():
            return (
                "Based on the classroom data, the students who struggled with loops this week are S-004 (40% accuracy) "
                "and S-007 (35% accuracy). For both students, prerequisite tracing indicates weak mastery in variables (~35%)."
            )
        if "inactive_students" in user_prompt:
            return "S-009 has been inactive for 9 days (last played 9 days ago with 3 total sessions logged)."
        if "improved_students" in user_prompt:
            return "S-002 showed sharp improvement over the past 2 weeks, gaining +25 percentage points in accuracy."
        return "Here is the summary of the requested classroom data based on recent sessions."

    return "AI processing completed successfully."

