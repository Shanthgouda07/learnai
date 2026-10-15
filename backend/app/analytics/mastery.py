"""
mastery.py - Exponentially weighted accuracy & topic mastery calculation.

Computes deterministic mastery per (student, topic) with decay over recent sessions,
confidence ratings, and trend evaluation.
"""
import json
from typing import Optional, Dict, Any, List
from datetime import datetime


def compute_topic_mastery(
    sessions: List[Any],
    decay: float = 0.7,
    max_sessions: int = 10,
) -> Optional[Dict[str, Any]]:
    """
    Given a list of Session objects for a single student on a single topic,
    compute exponentially weighted accuracy over the last max_sessions (sorted most recent first).

    Returns:
        None if no sessions exist (represents "no data", distinct from zero).
        dict: {
            "mastery": float (0.0 to 1.0),
            "attempts": int (session count),
            "trend": "improving" | "steady" | "declining",
            "last_played": str (ISO timestamp) or None,
            "confidence": "low" | "ok",
        }
    """
    if not sessions:
        return None

    # Sort sessions by timestamp descending (most recent first)
    sorted_sessions = sorted(
        sessions,
        key=lambda s: getattr(s, "timestamp", None) or datetime.min,
        reverse=True,
    )[:max_sessions]

    if not sorted_sessions:
        return None

    total_attempts = len(sessions)
    last_played = None
    if getattr(sorted_sessions[0], "timestamp", None):
        last_played = sorted_sessions[0].timestamp.isoformat()

    total_items = 0
    accuracies = []

    for s in sorted_sessions:
        # Determine accuracy and item count
        acc = getattr(s, "accuracy", 0.0)
        items_json = getattr(s, "items_json", None)
        item_count = 0

        if items_json:
            try:
                data = json.loads(items_json) if isinstance(items_json, str) else items_json
                if isinstance(data, dict):
                    item_count = len(data)
                elif isinstance(data, list):
                    item_count = len(data)
            except Exception:
                item_count = 1
        else:
            item_count = 1

        total_items += max(1, item_count)
        accuracies.append(max(0.0, min(1.0, float(acc))))

    # Exponentially weighted accuracy: most recent session has weight 1.0, previous 0.7, next 0.7^2 ...
    weighted_sum = 0.0
    weight_total = 0.0

    for i, acc in enumerate(accuracies):
        weight = decay ** i
        weighted_sum += weight * acc
        weight_total += weight

    mastery = round(weighted_sum / weight_total, 2) if weight_total > 0 else 0.0
    mastery = max(0.0, min(1.0, mastery))

    # Confidence check: "confidence='low' if fewer than 3 items or 2 sessions"
    if len(sorted_sessions) < 2 or total_items < 3:
        confidence = "low"
    else:
        confidence = "ok"

    # Trend calculation: compare recent sessions vs older sessions
    # Note: accuracies is ordered [most_recent, 2nd_most_recent, ...]
    n = len(accuracies)
    if n >= 4:
        recent_half = accuracies[: n // 2]
        older_half = accuracies[n // 2 :]
        avg_recent = sum(recent_half) / len(recent_half)
        avg_older = sum(older_half) / len(older_half)
        diff = avg_recent - avg_older
        if diff >= 0.10:
            trend = "improving"
        elif diff <= -0.10:
            trend = "declining"
        else:
            trend = "steady"
    elif n >= 2:
        diff = accuracies[0] - accuracies[-1]
        if diff >= 0.10:
            trend = "improving"
        elif diff <= -0.10:
            trend = "declining"
        else:
            trend = "steady"
    else:
        trend = "steady"

    return {
        "mastery": mastery,
        "attempts": total_attempts,
        "trend": trend,
        "last_played": last_played,
        "confidence": confidence,
    }


def compute_student_all_mastery(
    sessions: List[Any],
    all_topics: Optional[List[str]] = None,
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Computes mastery across all topics for a given student's sessions.
    Topics with no sessions return None ("no data").
    """
    by_topic: Dict[str, List[Any]] = {}
    for s in sessions:
        topic = getattr(s, "topic", None)
        if topic:
            by_topic.setdefault(topic, []).append(s)

    topics_to_evaluate = set(by_topic.keys())
    if all_topics:
        topics_to_evaluate.update(all_topics)

    result: Dict[str, Optional[Dict[str, Any]]] = {}
    for topic in sorted(topics_to_evaluate):
        topic_sessions = by_topic.get(topic, [])
        result[topic] = compute_topic_mastery(topic_sessions)

    return result
