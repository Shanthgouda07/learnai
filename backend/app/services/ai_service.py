"""
AI Service – single integration point for LLM calls.

If LLM_API_KEY is not set, every function returns a realistic MOCK response
so the entire app works fully offline / without an API key.
"""
import json
import httpx
from app.config import settings

MOCK_MODE = not settings.llm_api_key.strip()


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
async def _call_llm(system: str, user: str) -> str:
    """Send a chat completion request to the Gemini REST API."""
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.llm_model}:generateContent?key={settings.llm_api_key}"
    )
    body = {
        "contents": [
            {"role": "user", "parts": [{"text": f"{system}\n\n{user}"}]}
        ]
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=body)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def draft_note(topic: str) -> dict:
    """Generate a Markdown note draft on a given topic."""
    if MOCK_MODE:
        return {
            "title": f"Introduction to {topic}",
            "content": (
                f"# Introduction to {topic}\n\n"
                "## What is it?\n\n"
                f"{topic} is a fundamental concept in programming. "
                "Understanding it will help you write cleaner, more efficient code.\n\n"
                "## Key Concepts\n\n"
                "- **Variables** store data values\n"
                "- **Loops** repeat blocks of code\n"
                "- **Functions** encapsulate reusable logic\n\n"
                "## Example\n\n"
                "```python\n"
                "# A simple example\n"
                "for i in range(5):\n"
                "    print(f'Step {i}')\n"
                "```\n\n"
                "## Summary\n\n"
                f"In this note we covered the basics of {topic}. "
                "Practice the examples above before moving on to the quiz."
            ),
        }
    system = (
        "You are an expert Python programming teacher writing educational notes for "
        "secondary-school students. Write in clear, friendly Markdown. "
        "Include a short code example. Keep it under 400 words. "
        "Return ONLY valid JSON with keys 'title' and 'content'."
    )
    raw = await _call_llm(system, f"Write a teaching note about: {topic}")
    # Strip markdown code fences if present
    raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
    return json.loads(raw)


async def generate_quiz(note_title: str, note_content: str) -> list[dict]:
    """Generate 2 multiple-choice comprehension questions for a note."""
    if MOCK_MODE:
        return [
            {
                "question": f"Which of the following best describes the purpose of {note_title}?",
                "options": [
                    "To confuse the reader",
                    "To teach a core programming concept",
                    "To introduce advanced mathematics",
                    "None of the above",
                ],
                "answer_idx": 1,
            },
            {
                "question": "What does the example code in the note demonstrate?",
                "options": [
                    "Network programming",
                    "Database queries",
                    "A loop that prints steps",
                    "File input/output",
                ],
                "answer_idx": 2,
            },
        ]
    system = (
        "You are a quiz generator. Given a note, produce exactly 2 multiple-choice "
        "comprehension questions. Return ONLY a valid JSON array where each element has: "
        "'question' (string), 'options' (list of 4 strings), 'answer_idx' (0-based int)."
    )
    user = f"Note title: {note_title}\n\nNote content:\n{note_content}"
    raw = await _call_llm(system, user)
    raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
    return json.loads(raw)


async def generate_support_task(anon_id: str, weak_topic: str, task_type: str) -> dict:
    """
    Generate a targeted note or game for a struggling student.
    Uses only anonymous ID – no personal data sent.
    """
    if MOCK_MODE:
        if task_type == "note":
            return {
                "type": "note",
                "title": f"Extra Practice: {weak_topic}",
                "content": (
                    f"# Extra Practice: {weak_topic}\n\n"
                    f"Student {anon_id} has been struggling with {weak_topic}. "
                    "This note revisits the concept with simpler examples.\n\n"
                    "## Step-by-step Breakdown\n\n"
                    f"Let's take {weak_topic} apart piece by piece...\n\n"
                    "```python\n# Start simple\nx = 1\nprint(x)\n```\n\n"
                    "## Practice Exercise\n\nTry modifying the code above to print 1 to 10."
                ),
            }
        else:
            return {
                "type": "game",
                "game_type": "fill_blank",
                "title": f"Fix it! – {weak_topic}",
                "content_json": json.dumps({
                    "instructions": f"Fill in the blanks to complete the {weak_topic} program.",
                    "template": "for i in range(___):  \n    print(i)",
                    "blanks": [{"index": 0, "answer": "5"}],
                }),
            }
    system = (
        "You are an AI tutor assistant. Generate a targeted learning task for a student "
        f"(anonymous ID: {anon_id}) who is struggling with '{weak_topic}'. "
        f"Task type requested: {task_type}. "
        "Return ONLY valid JSON. "
        "If type=note: keys are 'type','title','content' (Markdown). "
        "If type=game: keys are 'type','game_type','title','content_json' (JSON string)."
    )
    raw = await _call_llm(system, f"Weak topic: {weak_topic}, Student: {anon_id}")
    raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
    return json.loads(raw)


async def hint_for_student(
    note_content: str, question: str, student_attempt: str
) -> str:
    """
    Return a Socratic hint – NEVER the full answer.
    No personal data is sent.
    """
    if MOCK_MODE:
        return (
            "Great effort! Think about what the code does step by step. "
            "What happens on the *first* iteration of the loop? "
            "Try tracing through the code with a small example value."
        )
    system = (
        "You are a helpful AI tutor for students learning Python. "
        "Your ONLY job is to guide the student ONE step forward using hints and questions. "
        "NEVER give the full answer or final solution. "
        "Be encouraging and concise (max 3 sentences)."
    )
    user = (
        f"Note content (for context):\n{note_content[:800]}\n\n"
        f"Question the student is stuck on: {question}\n\n"
        f"Student's current attempt: {student_attempt}"
    )
    return await _call_llm(system, user)


async def teacher_chat(session_summary: str, teacher_question: str) -> str:
    """Answer a teacher's natural-language question about class performance."""
    if MOCK_MODE:
        return (
            "Based on the session data, 3 students (S-004, S-007, S-011) show a notable "
            "accuracy drop on loop-related games over the past week. "
            "S-007 went from 75% to 38% accuracy. Consider assigning the 'Extra Practice: Loops' note."
        )
    system = (
        "You are an AI teaching assistant. Answer the teacher's question using only "
        "the anonymised session data provided. Be concise and actionable."
    )
    user = f"Session data:\n{session_summary}\n\nTeacher question: {teacher_question}"
    return await _call_llm(system, user)
