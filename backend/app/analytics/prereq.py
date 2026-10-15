"""
prereq.py - Prerequisite graph loader, cycle validation, and root cause tracing.
"""
import os
import json
from typing import Dict, List, Any, Optional

DEFAULT_GRAPH_PATH = os.path.join(os.path.dirname(__file__), "prerequisites.json")


def validate_prerequisite_graph(graph: Dict[str, List[str]]) -> None:
    """
    Validate that the prerequisite graph contains no cycles.
    Raises ValueError if a cycle is found.
    """
    visited: Dict[str, int] = {}  # 0: unvisited, 1: visiting, 2: visited

    def dfs(node: str, path: List[str]):
        visited[node] = 1
        for neighbor in graph.get(node, []):
            if visited.get(neighbor) == 1:
                cycle_str = " -> ".join(path + [neighbor])
                raise ValueError(f"Prerequisite cycle detected: {cycle_str}")
            if visited.get(neighbor, 0) == 0:
                dfs(neighbor, path + [neighbor])
        visited[node] = 2

    for node in graph:
        if visited.get(node, 0) == 0:
            dfs(node, [node])


def load_prerequisites(path: Optional[str] = None) -> Dict[str, List[str]]:
    """
    Load prerequisites from JSON file and validate against cycles.
    """
    file_path = path or DEFAULT_GRAPH_PATH
    if not os.path.exists(file_path):
        # Fallback to backend root
        alt_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "prerequisites.json")
        if os.path.exists(alt_path):
            file_path = alt_path

    if not os.path.exists(file_path):
        return {
            "variables": [],
            "conditionals": ["variables"],
            "loops": ["variables"],
            "functions": ["variables", "conditionals"],
            "lists": ["variables", "loops"],
        }

    with open(file_path, "r", encoding="utf-8") as f:
        graph = json.load(f)

    validate_prerequisite_graph(graph)
    return graph


# Validate default graph on startup
try:
    PREREQUISITES_GRAPH = load_prerequisites()
except Exception as e:
    raise e


def trace_root_cause(
    student_mastery: Dict[str, Optional[Dict[str, Any]]],
    weak_topic: str,
    graph: Optional[Dict[str, List[str]]] = None,
) -> Dict[str, Any]:
    """
    Walk prerequisites recursively.
    The root cause is the deepest prerequisite whose mastery is below 0.5 with confidence 'ok'.
    If no prerequisite is weak, root = weak_topic itself.

    Returns:
        {
            "chain": [topic...],
            "root": str,
            "evidence": [{topic, mastery, confidence}]
        }
    """
    adj = graph if graph is not None else PREREQUISITES_GRAPH
    chain = [weak_topic]
    evidence = []

    weak_topic_info = student_mastery.get(weak_topic)
    if weak_topic_info:
        evidence.append({
            "topic": weak_topic,
            "mastery": weak_topic_info.get("mastery"),
            "confidence": weak_topic_info.get("confidence", "ok"),
        })
    else:
        evidence.append({
            "topic": weak_topic,
            "mastery": None,
            "confidence": "none",
        })

    current_root = weak_topic

    def search_prereq(current: str) -> Optional[str]:
        prereqs = adj.get(current, [])
        for p in prereqs:
            p_info = student_mastery.get(p)
            if p_info:
                p_m = p_info.get("mastery")
                p_c = p_info.get("confidence")
                # Record evidence for inspected prereqs
                if not any(e["topic"] == p for e in evidence):
                    evidence.append({
                        "topic": p,
                        "mastery": p_m,
                        "confidence": p_c,
                    })

                # Check if this prerequisite is weak with confidence 'ok'
                if p_m is not None and p_m < 0.5 and p_c == "ok":
                    chain.append(p)
                    # Check recursively for deeper weak prereq
                    deeper = search_prereq(p)
                    return deeper if deeper else p
        return None

    deepest_weak = search_prereq(weak_topic)
    if deepest_weak:
        current_root = deepest_weak

    return {
        "chain": chain,
        "root": current_root,
        "evidence": evidence,
    }


def class_root_causes(
    class_id: int,
    db: Any,
    graph: Optional[Dict[str, List[str]]] = None,
    prefetched_student_ids: Optional[List[int]] = None,
    prefetched_student_sessions: Optional[Dict[int, List[Any]]] = None,
) -> List[Dict[str, Any]]:
    """
    Identify topics where >= 30% of students with data are weak (mastery < 0.5, confidence 'ok'),
    ranked by percentage of weak students.
    """
    from app.models.models import ClassEnrollment, Session as GameSession
    from app.analytics.mastery import compute_student_all_mastery

    adj = graph if graph is not None else PREREQUISITES_GRAPH

    if prefetched_student_ids is not None and prefetched_student_sessions is not None:
        student_ids = prefetched_student_ids
        student_sessions = prefetched_student_sessions
    else:
        enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id == class_id).all()
        student_ids = [e.student_id for e in enrollments]

        if not student_ids:
            return []

        # Map student_id -> list of sessions in this class
        sessions = db.query(GameSession).filter(
            GameSession.student_id.in_(student_ids),
            GameSession.class_id == class_id,
        ).all()

        student_sessions = {sid: [] for sid in student_ids}
        for s in sessions:
            student_sessions[s.student_id].append(s)

    all_topics = list(adj.keys())

    # topic -> {with_data: int, weak_count: int}
    topic_stats: Dict[str, Dict[str, int]] = {
        t: {"with_data": 0, "weak_count": 0} for t in all_topics
    }

    for sid in student_ids:
        m_map = compute_student_all_mastery(student_sessions[sid], all_topics=all_topics)
        for t, m_info in m_map.items():
            if m_info is not None and m_info.get("mastery") is not None:
                topic_stats.setdefault(t, {"with_data": 0, "weak_count": 0})
                topic_stats[t]["with_data"] += 1
                if m_info.get("mastery") < 0.5 and m_info.get("confidence") == "ok":
                    topic_stats[t]["weak_count"] += 1

    results = []
    for t, stat in topic_stats.items():
        with_data = stat["with_data"]
        weak = stat["weak_count"]
        if with_data > 0:
            pct = weak / with_data
            if pct >= 0.30:
                # Find which downstream topics depend on t
                affected = [k for k, v in adj.items() if t in v]
                results.append({
                    "topic": t,
                    "weak_count": weak,
                    "student_count": with_data,
                    "pct": round(pct * 100, 1),
                    "affected_topics": affected,
                })

    results.sort(key=lambda x: (x["pct"], x["weak_count"]), reverse=True)
    return results
