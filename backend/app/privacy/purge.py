"""
Data retention purge script.
Removes learning session data older than the class retention setting (default 12 months).
Run directly via:
    python -m app.privacy.purge
"""
import sys
import os
from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session

# Add backend directory to sys.path if run directly
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.config import utc_now
from app.models.database import SessionLocal
from app.models.models import Class, Session as GameSession, AILog


def purge_expired_data(db: Session) -> Dict[str, Any]:
    """
    Purge session and AI log records that have exceeded the retention period for their class.
    Default retention period is 12 months if unspecified.
    """
    classes = db.query(Class).all()
    now = utc_now()

    total_sessions_purged = 0
    class_results = []

    for c in classes:
        retention_months = c.retention_months if hasattr(c, "retention_months") and c.retention_months else 12
        cutoff = now - timedelta(days=retention_months * 30)

        purged_count = (
            db.query(GameSession)
            .filter(
                GameSession.class_id == c.id,
                GameSession.timestamp < cutoff,
            )
            .delete()
        )
        total_sessions_purged += purged_count
        class_results.append({
            "class_id": c.id,
            "class_name": c.name,
            "retention_months": retention_months,
            "cutoff_date": cutoff.isoformat(),
            "purged_count": purged_count,
        })

    # Also clean up any unlinked AI logs older than 12 months
    global_cutoff = now - timedelta(days=365)
    logs_purged = (
        db.query(AILog)
        .filter(AILog.timestamp < global_cutoff)
        .delete()
    )

    db.commit()

    return {
        "status": "success",
        "purged_at": now.isoformat(),
        "total_sessions_purged": total_sessions_purged,
        "logs_purged": logs_purged,
        "classes": class_results,
    }


def main():
    print("[LearnAI Privacy Purge] Scanning for expired data based on class retention settings...")
    db = SessionLocal()
    try:
        result = purge_expired_data(db)
        print(f"[OK] Purge completed: {result['total_sessions_purged']} expired sessions and {result['logs_purged']} old AI logs purged.")
        for cr in result["classes"]:
            print(f"   * Class {cr['class_id']} ({cr['class_name']}): {cr['purged_count']} sessions purged (Retention: {cr['retention_months']}m)")
    except Exception as e:
        print(f"[ERROR] Error during purge: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
