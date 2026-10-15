"""
summary.py - Class and student aggregate analytics computed deterministically.
"""
from datetime import datetime, timedelta
from app.config import utc_now
from typing import List, Dict, Any, Optional

from app.models.models import ClassEnrollment, Session as GameSession, User, Game, Class, FlagAction
from app.analytics.mastery import compute_student_all_mastery, compute_topic_mastery
from app.analytics.prereq import class_root_causes, trace_root_cause, PREREQUISITES_GRAPH
from app.analytics.flags import evaluate_student_flags


def get_class_overview(class_id: int, db: Any, teacher_id: int) -> Dict[str, Any]:
    """
    Computes class overview:
    student_count, active_7d, avg_accuracy, accuracy_trend[], score_distribution[],
    flags_count, class_root_causes[], recent_activity[], wins[]
    """
    now = utc_now()
    seven_days_ago = now - timedelta(days=7)


    enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id == class_id).all()
    student_ids = [e.student_id for e in enrollments]
    student_count = len(student_ids)

    if not student_ids:
        return {
            "student_count": 0,
            "active_7d": 0,
            "avg_accuracy": 0.0,
            "accuracy_trend": [],
            "score_distribution": [
                {"range": "0-49%", "count": 0},
                {"range": "50-69%", "count": 0},
                {"range": "70-84%", "count": 0},
                {"range": "85-100%", "count": 0},
            ],
            "flags_count": 0,
            "class_root_causes": [],
            "recent_activity": [],
            "wins": [],
        }

    # Fetch all sessions for this class
    sessions = (
        db.query(GameSession)
        .filter(GameSession.class_id == class_id, GameSession.student_id.in_(student_ids))
        .order_by(GameSession.timestamp.desc())
        .all()
    )

    # Active 7d
    active_students_7d = set()
    for s in sessions:
        if s.timestamp and s.timestamp >= seven_days_ago:
            active_students_7d.add(s.student_id)
    active_7d = len(active_students_7d)

    # Average accuracy
    accuracies = [float(s.accuracy) for s in sessions if s.accuracy is not None]
    avg_accuracy = round(sum(accuracies) / len(accuracies), 2) if accuracies else 0.0

    # Accuracy trend (grouped by date over the last 14 days or session sequence)
    sessions_by_date: Dict[str, List[float]] = {}
    for s in sorted(sessions, key=lambda x: x.timestamp or datetime.min):
        if s.timestamp:
            date_key = s.timestamp.strftime("%Y-%m-%d")
            sessions_by_date.setdefault(date_key, []).append(float(s.accuracy or 0.0))

    accuracy_trend = [
        {"date": date_k, "accuracy": round(sum(accs) / len(accs), 2), "sessions_count": len(accs)}
        for date_k, accs in sessions_by_date.items()
    ]

    # Score distribution brackets
    score_buckets = {"0-49%": 0, "50-69%": 0, "70-84%": 0, "85-100%": 0}
    for acc in accuracies:
        pct = acc * 100
        if pct < 50:
            score_buckets["0-49%"] += 1
        elif pct < 70:
            score_buckets["50-69%"] += 1
        elif pct < 85:
            score_buckets["70-84%"] += 1
        else:
            score_buckets["85-100%"] += 1

    score_distribution = [{"range": k, "count": v} for k, v in score_buckets.items()]

    # Fetch flag actions for teacher
    db_actions = db.query(FlagAction).filter(FlagAction.teacher_id == teacher_id).all()

    # Calculate flags across class students
    students = db.query(User).filter(User.id.in_(student_ids)).all()
    user_map = {u.id: u for u in students}
    student_sessions_map: Dict[int, List[Any]] = {sid: [] for sid in student_ids}
    for s in sessions:
        student_sessions_map[s.student_id].append(s)

    all_flags = []
    all_wins = []
    for sid in student_ids:
        u = user_map.get(sid)
        anon_id = u.anon_id if u else f"S-{sid:03d}"
        res = evaluate_student_flags(
            student_id=sid,
            anon_id=anon_id,
            class_id=class_id,
            sessions=student_sessions_map[sid],
            db_actions=db_actions,
            current_time=now,
        )
        all_flags.extend(res["needs_attention"])
        all_wins.extend(res["wins"])

    # Class root causes (using prefetched sessions to avoid re-querying SQLite)
    crc = class_root_causes(
        class_id=class_id,
        db=db,
        prefetched_student_ids=student_ids,
        prefetched_student_sessions=student_sessions_map,
    )

    # Recent activity
    recent_activity = []
    game_ids = list({s.game_id for s in sessions[:20]})
    games_map = {g.id: g.title for g in db.query(Game).filter(Game.id.in_(game_ids)).all()} if game_ids else {}

    for s in sessions[:15]:
        u = user_map.get(s.student_id)
        recent_activity.append({
            "session_id": s.id,
            "student_id": s.student_id,
            "anon_id": u.anon_id if u else f"S-{s.student_id:03d}",
            "student_name": u.name if u else "Student",
            "game_title": games_map.get(s.game_id, "Game"),
            "topic": s.topic,
            "accuracy": round(float(s.accuracy or 0.0), 2),
            "score": s.score,
            "timestamp": s.timestamp.isoformat() if s.timestamp else None,
        })

    return {
        "student_count": student_count,
        "active_7d": active_7d,
        "avg_accuracy": avg_accuracy,
        "accuracy_trend": accuracy_trend,
        "score_distribution": score_distribution,
        "flags_count": len(all_flags),
        "class_root_causes": crc,
        "recent_activity": recent_activity,
        "wins": all_wins[:8],
    }


def get_class_heatmap(class_id: int, db: Any) -> Dict[str, Any]:
    """
    Returns heatmap grid data:
    {
      students: [{id, anon_id, name}],
      topics: [str...],
      cells: [{student_id, topic, mastery: float|null, confidence: "ok"|"low"|"none"}]
    }
    """
    enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id == class_id).all()
    student_ids = [e.student_id for e in enrollments]

    students_query = db.query(User).filter(User.id.in_(student_ids)).order_by(User.name.asc()).all()
    students_list = [{"id": u.id, "anon_id": u.anon_id, "name": u.name} for u in students_query]

    # Topics from graph or existing sessions
    topics = list(PREREQUISITES_GRAPH.keys())

    sessions = (
        db.query(GameSession)
        .filter(GameSession.class_id == class_id, GameSession.student_id.in_(student_ids))
        .all()
    )

    by_student_sessions: Dict[int, List[Any]] = {sid: [] for sid in student_ids}
    for s in sessions:
        by_student_sessions[s.student_id].append(s)

    cells = []
    for sid in student_ids:
        m_map = compute_student_all_mastery(by_student_sessions[sid], all_topics=topics)
        for t in topics:
            info = m_map.get(t)
            if info is None or info.get("mastery") is None:
                cells.append({
                    "student_id": sid,
                    "topic": t,
                    "mastery": None,
                    "confidence": "none",
                    "attempts": 0,
                    "trend": "steady",
                })
            else:
                cells.append({
                    "student_id": sid,
                    "topic": t,
                    "mastery": info["mastery"],
                    "confidence": info["confidence"],
                    "attempts": info["attempts"],
                    "trend": info["trend"],
                })

    return {
        "students": students_list,
        "topics": topics,
        "cells": cells,
    }


def get_student_detail(student_id: int, class_id: Optional[int], db: Any) -> Dict[str, Any]:
    """
    Returns full student analytics profile:
    {
      student: {id, anon_id, name},
      score_history: [...],
      topic_mastery: {...},
      sessions: [...],
      prerequisite_chains: [...],
      enrollments_across_classes: [...]
    }
    """
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        return {}

    # Enrollments
    enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.student_id == student_id).all()
    class_ids = [e.class_id for e in enrollments]
    classes = db.query(Class).filter(Class.id.in_(class_ids)).all() if class_ids else []
    enrollments_across_classes = [{"class_id": c.id, "class_name": c.name} for c in classes]

    # Sessions query (filtered by class_id if provided)
    sess_query = db.query(GameSession).filter(GameSession.student_id == student_id)
    if class_id:
        sess_query = sess_query.filter(GameSession.class_id == class_id)
    sessions = sess_query.order_by(GameSession.timestamp.desc()).all()

    # Game titles map
    game_ids = list({s.game_id for s in sessions})
    games = db.query(Game).filter(Game.id.in_(game_ids)).all() if game_ids else []
    game_map = {g.id: g.title for g in games}

    # Score history
    score_history = []
    for s in sessions:
        score_history.append({
            "id": s.id,
            "timestamp": s.timestamp.isoformat() if s.timestamp else None,
            "score": s.score,
            "max_score": s.max_score,
            "accuracy": round(float(s.accuracy or 0.0), 2),
            "topic": s.topic,
            "game_title": game_map.get(s.game_id, "Game"),
            "hints_used": s.hints_used,
            "duration": s.duration,
        })

    # Topic masteries
    topics = list(PREREQUISITES_GRAPH.keys())
    topic_mastery = compute_student_all_mastery(sessions, all_topics=topics)

    # Prerequisite chains for weak topics
    prerequisite_chains = []
    for t, m_info in topic_mastery.items():
        if m_info and m_info.get("mastery") is not None and m_info.get("mastery") < 0.5:
            chain_info = trace_root_cause(topic_mastery, t)
            prerequisite_chains.append({
                "target_topic": t,
                "chain": chain_info["chain"],
                "root": chain_info["root"],
                "evidence": chain_info["evidence"],
            })

    return {
        "student": {
            "id": student.id,
            "anon_id": student.anon_id,
            "name": student.name,
        },
        "score_history": score_history,
        "topic_mastery": topic_mastery,
        "sessions": score_history[:25],
        "prerequisite_chains": prerequisite_chains,
        "enrollments_across_classes": enrollments_across_classes,
    }
