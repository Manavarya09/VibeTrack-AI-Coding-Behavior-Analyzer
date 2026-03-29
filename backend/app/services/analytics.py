from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.session import Session as SessionModel
from app.models.event import Event as EventModel
from datetime import datetime
import csv
import io


def get_analytics_summary(db: Session, user_id: int = None):
    query = db.query(SessionModel)
    if user_id:
        query = query.filter(SessionModel.user_id == user_id)

    sessions = query.all()

    if not sessions:
        return {
            "total_sessions": 0,
            "avg_session_length": 0,
            "longest_session": 0,
            "break_frequency": 0,
            "total_prompts": 0,
        }

    total_sessions = len(sessions)
    total_minutes = sum(s.duration_minutes for s in sessions)
    avg_session = total_minutes / total_sessions
    longest = max(s.duration_minutes for s in sessions)

    sessions_with_breaks = [s for s in sessions if s.break_time_minutes > 0]
    break_frequency = (
        len(sessions_with_breaks) / total_sessions if total_sessions > 0 else 0
    )

    total_prompts = sum(s.prompt_count for s in sessions)

    return {
        "total_sessions": total_sessions,
        "avg_session_length": round(avg_session, 2),
        "longest_session": round(longest, 2),
        "break_frequency": round(break_frequency, 2),
        "total_prompts": total_prompts,
    }


def export_sessions_csv(db: Session, user_id: int = None):
    query = db.query(SessionModel)
    if user_id:
        query = query.filter(SessionModel.user_id == user_id)

    sessions = query.order_by(SessionModel.start_time.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "user_id",
            "start_time",
            "end_time",
            "duration_minutes",
            "prompt_count",
            "break_time_minutes",
            "vibe_score",
            "classification",
        ]
    )

    for s in sessions:
        writer.writerow(
            [
                s.id,
                s.user_id,
                s.start_time,
                s.end_time,
                round(s.duration_minutes, 2),
                s.prompt_count,
                round(s.break_time_minutes, 2),
                s.vibe_score,
                s.classification,
            ]
        )

    return output.getvalue()
