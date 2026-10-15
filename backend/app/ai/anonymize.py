"""
anonymize.py - PII stripping and student name-to-anon_id mapping.
Every AI feature in LearnAI must pass inputs through this privacy module.
"""
import re
from typing import Any, Dict, List, Optional, Tuple, Union
from sqlalchemy.orm import Session
from app.models.database import SessionLocal
from app.models.models import User

# Common English words that can also be given names.
# For these words, we avoid matching lowercase occurrences in sentences (e.g. "will", "may").
COMMON_ENGLISH_WORDS = {
    "will", "may", "mark", "rose", "grace", "hope", "bill", "art",
    "rob", "sue", "bob", "read", "for", "in", "and", "or", "not"
}

# Regex patterns for sensitive identifiers
EMAIL_REGEX = re.compile(
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
)

# Indian and international phone numbers
PHONE_REGEX = re.compile(
    r'(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|'
    r'\b\+?[1-9]\d{0,2}[\s-]?(?:\(\d{1,4}\)|\d{1,4})[\s-]?\d{2,4}[\s-]?\d{3,4}\b'
)

# Aadhaar-like 12-digit identification numbers (e.g. 1234 5678 9012 or 123456789012)
ID_NUMBER_REGEX = re.compile(
    r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'
)

# URLs with personal social or code handles
URL_HANDLE_REGEX = re.compile(
    r'https?://(?:www\.)?(?:github|gitlab|twitter|x|linkedin|instagram|facebook)\.com/[A-Za-z0-9_.-]+(?:\b|/)|'
    r'https?://[^\s]+/[~@][A-Za-z0-9_.-]+'
)

# Date of birth formats (DD/MM/YYYY, YYYY-MM-DD, etc.)
DOB_REGEX = re.compile(
    r'\b(?:(?:0?[1-9]|[12]\d|3[01])[-/.](?:0?[1-9]|1[0-2])[-/.](?:19\d\d|20\d\d)|'
    r'(?:19\d\d|20\d\d)[-/.](?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01]))\b'
)

# Street-address-like patterns
ADDRESS_REGEX = re.compile(
    r'\b\d{1,5}\s+[A-Za-z0-9.,\s]{2,35}?\s*(?:Street|St\.|St|Avenue|Ave\.|Ave|Road|Rd\.|Rd|Lane|Ln\.|Ln|Boulevard|Blvd\.|Blvd|Drive|Dr\.|Dr|Cross|Main\s+Road|Nagar|Layout|Colony|Apartments|Apt\.|Floor)\b',
    re.IGNORECASE
)


class AnonymizedPayload(dict):
    """Dict-like result of anonymize_payload supporting both key access and tuple unpacking."""
    def __init__(self, clean_payload: Any, removed: List[Dict[str, Any]]):
        if isinstance(clean_payload, dict):
            super().__init__(clean_payload)
        else:
            super().__init__()
        self.clean_payload = clean_payload
        self.removed = removed

    def __iter__(self):
        return iter((self.clean_payload, self.removed))


import time

_cached_users_map = None
_cached_users_map_time = 0.0


def _fetch_users_map(context: Optional[Dict[str, Any]] = None) -> Tuple[List[Tuple[str, str, bool]], List[Tuple[str, str, bool]]]:
    """
    Returns (student_entries, teacher_entries) where each entry is
    (name_pattern, replacement_id, is_common_word).
    """
    global _cached_users_map, _cached_users_map_time

    # Check for direct explicit overrides in context (useful for unit tests)
    if context and "users" in context:
        students_ctx: List[Tuple[str, str, bool]] = []
        teachers_ctx: List[Tuple[str, str, bool]] = []
        for u in context["users"]:
            name = u.get("name", "").strip()
            anon_id = u.get("anon_id", "")
            role = u.get("role", "student")
            if not name:
                continue
            is_common = name.lower() in COMMON_ENGLISH_WORDS
            if role == "teacher":
                teachers_ctx.append((name, "TEACHER", is_common))
            else:
                students_ctx.append((name, anon_id, is_common))
        students_ctx.sort(key=lambda x: len(x[0]), reverse=True)
        teachers_ctx.sort(key=lambda x: len(x[0]), reverse=True)
        return students_ctx, teachers_ctx

    now = time.time()
    if _cached_users_map is not None and (now - _cached_users_map_time) < 15.0:
        return _cached_users_map

    students: List[Tuple[str, str, bool]] = []
    teachers: List[Tuple[str, str, bool]] = []

    # Query DB
    db: Optional[Session] = None
    own_db = False
    if context and isinstance(context.get("db"), Session):
        db = context["db"]
    else:
        try:
            db = SessionLocal()
            own_db = True
        except Exception:
            db = None

    if db is not None:
        try:
            users = db.query(User).all()
            for u in users:
                name = (u.name or "").strip()
                if not name:
                    continue
                is_common = name.lower() in COMMON_ENGLISH_WORDS
                if u.role == "teacher":
                    teachers.append((name, "TEACHER", is_common))
                else:
                    students.append((name, u.anon_id, is_common))
        except Exception:
            pass
        finally:
            if own_db:
                db.close()

    # Sort names by length descending so longer full names match before first names
    students.sort(key=lambda x: len(x[0]), reverse=True)
    teachers.sort(key=lambda x: len(x[0]), reverse=True)

    _cached_users_map = (students, teachers)
    _cached_users_map_time = now
    return _cached_users_map



def anonymize(text: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Anonymize a text string:
    1. Replaces known student names with their anon_id (e.g. S-004), including possessives.
    2. Replaces known teacher names with 'TEACHER'.
    3. Strips emails, phone numbers, URLs with handles, Aadhaar-like IDs, DOBs, and addresses.
    Returns:
        {
            "clean_text": str,
            "removed": [{"type": str, "count": int}, ...]
        }
    """
    if not text or not isinstance(text, str):
        return {"clean_text": text or "", "removed": []}

    clean_text = text
    counts: Dict[str, int] = {
        "name": 0,
        "email": 0,
        "phone": 0,
        "id_number": 0,
        "url": 0,
        "dob": 0,
        "address": 0,
    }

    students, teachers = _fetch_users_map(context)
    all_names = teachers + students

    # 1. Name replacement (handling possessives like "Riya's" -> "S-004's")
    for name, replacement, is_common in all_names:
        escaped_name = re.escape(name)
        # Matches the name and optional possessive 's or ’s
        pattern_str = rf'\b({escaped_name})(\'s|’s)?\b'
        
        flags = 0 if is_common else re.IGNORECASE
        regex = re.compile(pattern_str, flags)

        def replace_name_match(match: re.Match) -> str:
            counts["name"] += 1
            possessive = match.group(2) or ""
            return f"{replacement}{possessive}"

        clean_text = regex.sub(replace_name_match, clean_text)

    # 2. Emails
    def replace_email(match: re.Match) -> str:
        counts["email"] += 1
        return "[EMAIL]"
    clean_text = EMAIL_REGEX.sub(replace_email, clean_text)

    # 3. URLs with personal handles
    def replace_url(match: re.Match) -> str:
        counts["url"] += 1
        return "[URL]"
    clean_text = URL_HANDLE_REGEX.sub(replace_url, clean_text)

    # 4. Aadhaar-like 12-digit numbers (run before phone so 4-4-4 format is captured as ID)
    def replace_id(match: re.Match) -> str:
        counts["id_number"] += 1
        return "[ID_NUMBER]"
    clean_text = ID_NUMBER_REGEX.sub(replace_id, clean_text)

    # 5. Phone numbers
    def replace_phone(match: re.Match) -> str:
        counts["phone"] += 1
        return "[PHONE]"
    clean_text = PHONE_REGEX.sub(replace_phone, clean_text)

    # 6. Dates of birth
    def replace_dob(match: re.Match) -> str:
        counts["dob"] += 1
        return "[DOB]"
    clean_text = DOB_REGEX.sub(replace_dob, clean_text)

    # 7. Street addresses
    def replace_address(match: re.Match) -> str:
        counts["address"] += 1
        return "[ADDRESS]"
    clean_text = ADDRESS_REGEX.sub(replace_address, clean_text)

    removed_list = [
        {"type": k, "count": v}
        for k, v in counts.items()
        if v > 0
    ]

    return {
        "clean_text": clean_text,
        "removed": removed_list
    }


def anonymize_payload(payload: Any, context: Optional[Dict[str, Any]] = None) -> AnonymizedPayload:
    """
    Recursively walk nested dictionaries/lists and clean every string value.
    Returns AnonymizedPayload (clean_payload, removed_summary).
    """
    aggregated_counts: Dict[str, int] = {}

    def _walk(item: Any) -> Any:
        if isinstance(item, str):
            res = anonymize(item, context)
            for r in res["removed"]:
                t = r["type"]
                aggregated_counts[t] = aggregated_counts.get(t, 0) + r["count"]
            return res["clean_text"]
        elif isinstance(item, dict):
            return {k: _walk(v) for k, v in item.items()}
        elif isinstance(item, list):
            return [_walk(v) for v in item]
        return item

    cleaned = _walk(payload)
    removed_list = [
        {"type": k, "count": v}
        for k, v in aggregated_counts.items()
        if v > 0
    ]

    return AnonymizedPayload(cleaned, removed_list)
