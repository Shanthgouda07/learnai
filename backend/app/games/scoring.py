"""
Unified Scoring Engine for all games (FillBlank, BugHunt, OrderSteps, Visualizer).
"""
import math
from typing import Dict, Any, List, Optional


def compute_score(
    max_points: int,
    total_items: int,
    attempts_log: Dict[str, List[Dict[str, Any]]],
    history: List[Any],
    hints_used: int = 0,
    duration_sec: int = 0,
) -> Dict[str, Any]:
    """
    Compute score, accuracy, streak, and breakdown for a game session.
    
    attempts_log shape:
        {
            item_id: [
                {"response": Any, "correct": bool},
                ...
            ]
        }
    """
    total_items = max(1, total_items)
    first_try_correct_count = 0
    total_extra_attempts = 0
    per_item_data = {}
    current_streak = 0
    max_streak = 0

    item_share = max_points / total_items
    total_attempt_penalty = 0.0

    for item_id, attempts in attempts_log.items():
        if not attempts:
            continue
        first_attempt = attempts[0]
        first_correct = bool(first_attempt.get("correct", False))
        eventually_correct = any(a.get("correct", False) for a in attempts)
        num_attempts = len(attempts)

        if first_correct:
            first_try_correct_count += 1
            current_streak += 1
            if current_streak > max_streak:
                max_streak = current_streak
        else:
            current_streak = 0

        # Attempt penalty: -10% of item's share per extra attempt, floored at 30% remaining (max 70% penalty)
        if num_attempts > 1 and eventually_correct:
            extra = num_attempts - 1
            total_extra_attempts += extra
            penalty = extra * 0.10 * item_share
            # Floored at 30% of item's share => maximum penalty is 70%
            capped_penalty = min(penalty, 0.70 * item_share)
            total_attempt_penalty += capped_penalty
        elif not eventually_correct:
            # If not eventually correct, gets 0 share
            pass

        per_item_data[str(item_id)] = {
            "attempts": num_attempts,
            "first_try_correct": first_correct,
            "eventually_correct": eventually_correct,
        }

    accuracy = round(first_try_correct_count / total_items, 2)
    base_points = max_points * accuracy

    hint_penalty = hints_used * 5

    # Improvement bonus: +10 if accuracy beats student's average on this topic over last 3 sessions
    recent_accs = [
        getattr(s, "accuracy", 0.0)
        for s in history[:3]
        if getattr(s, "accuracy", None) is not None
    ]
    improvement_bonus = 0
    if recent_accs:
        recent_avg = sum(recent_accs) / len(recent_accs)
        if accuracy > recent_avg:
            improvement_bonus = 10

    # Total points (no speed bonus)
    raw_points = base_points - total_attempt_penalty - hint_penalty + improvement_bonus
    final_points = max(0, int(round(raw_points)))

    breakdown = [
        {"label": "Base Points", "points": int(round(base_points))},
    ]
    if total_attempt_penalty > 0:
        breakdown.append({
            "label": "Extra Attempts Penalty",
            "points": -int(round(total_attempt_penalty)),
        })
    if hint_penalty > 0:
        breakdown.append({
            "label": "Hints Used Penalty",
            "points": -int(hint_penalty),
        })
    if improvement_bonus > 0:
        breakdown.append({
            "label": "Improvement Bonus",
            "points": int(improvement_bonus),
        })

    return {
        "points": final_points,
        "accuracy": accuracy,
        "streak": max_streak,
        "breakdown": breakdown,
        "items_json": per_item_data,
        "duration_sec": duration_sec,
    }
