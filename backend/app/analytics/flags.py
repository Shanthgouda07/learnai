"""
flags.py - Deterministic needs-attention rules, root-cause enrichment, and positive wins.
"""
from datetime import datetime, timedelta
from app.config import utc_now
from typing import List, Dict, Any, Optional

from app.analytics.mastery import compute_student_all_mastery, compute_topic_mastery
from app.analytics.prereq import trace_root_cause


def evaluate_student_flags(
    student_id: int,
    anon_id: str,
    class_id: int,
    sessions: List[Any],
    db_actions: Optional[List[Any]] = None,
    current_time: Optional[datetime] = None,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Evaluates needs-attention flags and positive win flags for a student in a class.
    db_actions: list of FlagAction records for this student/teacher.

    Returns:
        {
            "needs_attention": [flag_dict, ...],
            "wins": [win_dict, ...]
        }
    """
    now = current_time or utc_now()

    attention_flags: List[Dict[str, Any]] = []
    win_flags: List[Dict[str, Any]] = []

    if not sessions:
        return {"needs_attention": [], "wins": []}

    # Group sessions by topic
    by_topic: Dict[str, List[Any]] = {}
    for s in sessions:
        topic = getattr(s, "topic", "general")
        by_topic.setdefault(topic, []).append(s)

    # Compute masteries across all topics
    student_mastery = {t: compute_topic_mastery(s_list) for t, s_list in by_topic.items()}

    # Parse dismiss and snooze actions
    # action_record: {action: "dismiss"|"snooze", timestamp: datetime}
    actions_by_key: Dict[str, Any] = {}
    if db_actions:
        for act in db_actions:
            # Keep the latest action per flag_key
            if act.flag_key not in actions_by_key or act.timestamp > actions_by_key[act.flag_key].timestamp:
                actions_by_key[act.flag_key] = act

    def is_action_suppressed(flag_key: str, latest_session_time: Optional[datetime]) -> bool:
        if flag_key not in actions_by_key:
            return False
        act = actions_by_key[flag_key]
        if act.action == "snooze":
            # Snooze for 7 days
            if now < act.timestamp + timedelta(days=7):
                return True
            return False
        elif act.action == "dismiss":
            # Dismissed flags stay hidden unless new evidence appears
            # New evidence: session timestamp > dismissal timestamp
            if latest_session_time and latest_session_time > act.timestamp:
                return False
            return True
        return False

    # -------------------------------------------------------------------------
    # RULE 3: Inactive for >= 7 days after having been active
    # -------------------------------------------------------------------------
    sorted_all_sessions = sorted(
        sessions,
        key=lambda s: getattr(s, "timestamp", None) or datetime.min,
        reverse=True,
    )
    latest_sess = sorted_all_sessions[0]
    latest_sess_time = getattr(latest_sess, "timestamp", None)

    if latest_sess_time:
        days_inactive = (now - latest_sess_time).days
        if days_inactive >= 7:
            flag_key = f"flag_{student_id}_inactive"
            if not is_action_suppressed(flag_key, latest_sess_time):
                last_date_str = latest_sess_time.strftime("%b %d")
                attention_flags.append({
                    "flag_key": flag_key,
                    "student_id": student_id,
                    "anon_id": anon_id,
                    "severity": "high" if days_inactive >= 14 else "medium",
                    "rules_fired": ["inactive_7d"],
                    "reason_text": f"{anon_id}: inactive for {days_inactive} days (last active {last_date_str}).",
                    "evidence": {
                        "days_inactive": days_inactive,
                        "last_active": latest_sess_time.isoformat(),
                        "total_sessions": len(sessions),
                    },
                    "suggested_action": "check_in",
                    "root_cause_topic": "activity",
                })

    # -------------------------------------------------------------------------
    # TOPIC RULES: Rule 1, Rule 2, Rule 4 & Positive Wins
    # -------------------------------------------------------------------------
    for topic, topic_sessions in by_topic.items():
        sorted_topic = sorted(
            topic_sessions,
            key=lambda s: getattr(s, "timestamp", None) or datetime.min,
            reverse=True,
        )
        t_mastery_info = student_mastery.get(topic)
        if not t_mastery_info:
            continue

        mastery_val = t_mastery_info.get("mastery")
        confidence = t_mastery_info.get("confidence")
        t_latest_time = getattr(sorted_topic[0], "timestamp", None)

        # Skip low confidence data for triggering attention flags
        if confidence != "ok":
            continue

        # Prerequisite trace for root cause
        trace = trace_root_cause(student_mastery, topic)
        root_cause_topic = trace["root"]
        root_info = student_mastery.get(root_cause_topic)
        root_mastery_val = root_info.get("mastery") if root_info else None

        # --- RULE 2: Accuracy dropped >= 20 percentage points between previous 3 and latest 3 ---
        rule2_fired = False
        if len(sorted_topic) >= 6:
            latest_3 = [float(getattr(s, "accuracy", 0.0)) for s in sorted_topic[:3]]
            prev_3 = [float(getattr(s, "accuracy", 0.0)) for s in sorted_topic[3:6]]
            avg_latest = sum(latest_3) / 3.0
            avg_prev = sum(prev_3) / 3.0
            drop = avg_prev - avg_latest

            if drop >= 0.20:
                rule2_fired = True
                flag_key = f"flag_{student_id}_{topic}_drop"
                if not is_action_suppressed(flag_key, t_latest_time):
                    prev_pct = int(round(avg_prev * 100))
                    latest_pct = int(round(avg_latest * 100))
                    if root_cause_topic != topic and root_mastery_val is not None:
                        root_pct = int(round(root_mastery_val * 100))
                        reason_text = (
                            f"{anon_id}: accuracy fell {prev_pct}% to {latest_pct}% on {topic}. "
                            f"Likely root cause: weak prerequisite '{root_cause_topic}' ({root_pct}%)."
                        )
                    else:
                        reason_text = f"{anon_id}: accuracy fell {prev_pct}% to {latest_pct}% on {topic}."

                    attention_flags.append({
                        "flag_key": flag_key,
                        "student_id": student_id,
                        "anon_id": anon_id,
                        "severity": "high",
                        "rules_fired": ["accuracy_drop_20pct"],
                        "reason_text": reason_text,
                        "evidence": {
                            "topic": topic,
                            "previous_3_accuracy": round(avg_prev, 2),
                            "latest_3_accuracy": round(avg_latest, 2),
                            "drop": round(drop, 2),
                            "root_cause_topic": root_cause_topic,
                            "root_mastery": root_mastery_val,
                        },
                        "suggested_action": "game" if root_cause_topic != topic else "note",
                        "root_cause_topic": root_cause_topic,
                    })

        # --- RULE 1: Mastery < 0.5 with >= 3 sessions of data ---
        if mastery_val is not None and mastery_val < 0.5 and len(sorted_topic) >= 3 and not rule2_fired:
            flag_key = f"flag_{student_id}_{topic}_low_mastery"
            if not is_action_suppressed(flag_key, t_latest_time):
                topic_pct = int(round(mastery_val * 100))
                if root_cause_topic != topic and root_mastery_val is not None:
                    root_pct = int(round(root_mastery_val * 100))
                    reason_text = (
                        f"{anon_id}: low mastery ({topic_pct}%) on {topic}. "
                        f"Likely root cause: weak prerequisite '{root_cause_topic}' ({root_pct}%)."
                    )
                else:
                    reason_text = f"{anon_id}: low mastery ({topic_pct}%) on {topic} across {len(sorted_topic)} sessions."

                attention_flags.append({
                    "flag_key": flag_key,
                    "student_id": student_id,
                    "anon_id": anon_id,
                    "severity": "high" if mastery_val < 0.35 else "medium",
                    "rules_fired": ["low_mastery"],
                    "reason_text": reason_text,
                    "evidence": {
                        "topic": topic,
                        "mastery": mastery_val,
                        "sessions_count": len(sorted_topic),
                        "root_cause_topic": root_cause_topic,
                        "root_mastery": root_mastery_val,
                    },
                    "suggested_action": "game" if root_cause_topic != topic else "note",
                    "root_cause_topic": root_cause_topic,
                })

        # --- RULE 4: >= 3 recent sessions with heavy hint use (> 2 hints/session) AND low accuracy ---
        recent_hints = sorted_topic[: min(5, len(sorted_topic))]
        heavy_hint_sessions = [
            s for s in recent_hints
            if getattr(s, "hints_used", 0) > 2 and float(getattr(s, "accuracy", 0.0)) < 0.5
        ]
        if len(heavy_hint_sessions) >= 3 and not rule2_fired:
            flag_key = f"flag_{student_id}_{topic}_heavy_hints"
            if not is_action_suppressed(flag_key, t_latest_time):
                avg_hints = sum(getattr(s, "hints_used", 0) for s in heavy_hint_sessions) / len(heavy_hint_sessions)
                avg_acc = sum(float(getattr(s, "accuracy", 0.0)) for s in heavy_hint_sessions) / len(heavy_hint_sessions)
                attention_flags.append({
                    "flag_key": flag_key,
                    "student_id": student_id,
                    "anon_id": anon_id,
                    "severity": "medium",
                    "rules_fired": ["heavy_hints_low_accuracy"],
                    "reason_text": f"{anon_id}: heavy hint use (avg {avg_hints:.1f}/sess) with low accuracy ({int(round(avg_acc * 100))}%) on {topic}.",
                    "evidence": {
                        "topic": topic,
                        "heavy_hint_sessions_count": len(heavy_hint_sessions),
                        "avg_hints": round(avg_hints, 1),
                        "avg_accuracy": round(avg_acc, 2),
                    },
                    "suggested_action": "note",
                    "root_cause_topic": root_cause_topic,
                })

        # --- POSITIVE WIN FLAGS ---
        if len(sorted_topic) >= 4:
            latest_half = sorted_topic[: len(sorted_topic) // 2]
            older_half = sorted_topic[len(sorted_topic) // 2 :]
            avg_new = sum(float(getattr(s, "accuracy", 0.0)) for s in latest_half) / len(latest_half)
            avg_old = sum(float(getattr(s, "accuracy", 0.0)) for s in older_half) / len(older_half)
            gain = avg_new - avg_old
            if gain >= 0.20:
                win_flags.append({
                    "student_id": student_id,
                    "anon_id": anon_id,
                    "topic": topic,
                    "headline": f"Sharp improvement in {topic}",
                    "reason_text": f"{anon_id} accuracy improved by +{int(round(gain * 100))}% on {topic} (now {int(round(avg_new * 100))}%).",
                    "evidence": {
                        "topic": topic,
                        "gain": round(gain, 2),
                        "current_accuracy": round(avg_new, 2),
                    },
                })
        elif mastery_val is not None and mastery_val >= 0.85 and len(sorted_topic) >= 3:
            win_flags.append({
                "student_id": student_id,
                "anon_id": anon_id,
                "topic": topic,
                "headline": f"High mastery in {topic}",
                "reason_text": f"{anon_id} achieved {int(round(mastery_val * 100))}% mastery on {topic}.",
                "evidence": {
                    "topic": topic,
                    "mastery": mastery_val,
                },
            })

    return {
        "needs_attention": attention_flags,
        "wins": win_flags,
    }
