"""
guard.py - Output guardrails for AI generated responses.
Blocks full solutions, prevents PII leakage, and truncates over-length replies.
"""
import re
from typing import Any, Dict, List, Optional
from app.ai.anonymize import EMAIL_REGEX, PHONE_REGEX

FALLBACK_HINTS = {
    1: "Take a closer look at the syntax and structure. What happens on the very first step?",
    2: "Look closely at the line where values are updated. Does the variable type match what is expected?",
    3: "Here is a similar pattern: with `numbers = [1, 2]`, `numbers.append(3)` adds 3 to the end. How does that compare to your code?",
}


def _normalize(s: str) -> str:
    """Normalize string by collapsing whitespace and lowercasing."""
    if not s:
        return ""
    return re.sub(r'\s+', ' ', s.strip().lower())


def check_output(
    reply: str,
    hint_level: int = 1,
    solution_meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Guard LLM output before sending to student:
    1. Checks for solution leakage (comparing against solution_meta server-side).
    2. Checks for email or phone PII leakage.
    3. Truncates over-long replies to maintain friendly concise tutor tone.
    Returns:
        {
            "text": str,
            "blocked": bool,
            "reason": Optional[str]
        }
    """
    if not reply or not reply.strip():
        return {
            "text": FALLBACK_HINTS.get(hint_level, FALLBACK_HINTS[1]),
            "blocked": False,
            "reason": None
        }

    text = reply.strip()
    norm_text = _normalize(text)

    # 1. PII Check in output
    if EMAIL_REGEX.search(text):
        return {
            "text": FALLBACK_HINTS.get(hint_level, FALLBACK_HINTS[1]),
            "blocked": True,
            "reason": "pii_email_detected"
        }
    if PHONE_REGEX.search(text):
        return {
            "text": FALLBACK_HINTS.get(hint_level, FALLBACK_HINTS[1]),
            "blocked": True,
            "reason": "pii_phone_detected"
        }

    # 2. Solution Leakage Check
    if solution_meta:
        # Check explicit answer tokens
        answers: List[str] = solution_meta.get("answers", [])
        for ans in answers:
            if ans and len(ans.strip()) >= 2:
                norm_ans = _normalize(ans)
                # If exact answer token is leaked verbatim as a standalone answer
                if f" {norm_ans} " in f" {norm_text} " or norm_text == norm_ans:
                    return {
                        "text": FALLBACK_HINTS.get(hint_level, FALLBACK_HINTS[1]),
                        "blocked": True,
                        "reason": f"solution_answer_leakage"
                    }

        # Check correct fix option in bug hunt
        correct_fix: Optional[str] = solution_meta.get("correct_fix")
        if correct_fix and len(correct_fix.strip()) > 3:
            norm_fix = _normalize(correct_fix)
            if norm_fix in norm_text:
                return {
                    "text": FALLBACK_HINTS.get(hint_level, FALLBACK_HINTS[1]),
                    "blocked": True,
                    "reason": "solution_fix_leakage"
                }

        # Check full step sequence in order steps
        steps: List[str] = solution_meta.get("steps", [])
        if len(steps) >= 3:
            # Check if all steps appear in exact correct sequence
            pos = 0
            all_found = True
            for step in steps:
                s_norm = _normalize(step)
                idx = norm_text.find(s_norm, pos)
                if idx == -1:
                    all_found = False
                    break
                pos = idx + len(s_norm)
            if all_found:
                return {
                    "text": FALLBACK_HINTS.get(hint_level, FALLBACK_HINTS[1]),
                    "blocked": True,
                    "reason": "solution_order_leakage"
                }

    # 3. Truncate over-long replies (under ~120-140 words)
    words = text.split()
    if len(words) > 130:
        truncated = " ".join(words[:120])
        # Find clean sentence ending
        last_period = max(truncated.rfind('.'), truncated.rfind('?'), truncated.rfind('!'))
        if last_period > 40:
            text = truncated[:last_period + 1]
        else:
            text = truncated + "..."

    return {
        "text": text,
        "blocked": False,
        "reason": None
    }
