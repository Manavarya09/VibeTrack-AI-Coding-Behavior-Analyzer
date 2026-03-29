from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.session import Session as SessionModel

router = APIRouter()


@router.get("/activity/timeline")
def get_user_timeline(user_id: int, days: int = 30, db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(days=days)

    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user_id, SessionModel.start_time >= cutoff)
        .order_by(SessionModel.start_time.desc())
        .all()
    )

    timeline = []
    for session in sessions:
        timeline.append(
            {
                "id": session.id,
                "type": "session",
                "start_time": session.start_time.isoformat(),
                "end_time": session.end_time.isoformat() if session.end_time else None,
                "duration": session.duration_minutes,
                "classification": session.classification,
                "vibe_score": session.vibe_score,
            }
        )

    return {
        "user_id": user_id,
        "period_days": days,
        "total_items": len(timeline),
        "timeline": timeline,
    }


@router.get("/activity/hourly-distribution")
def get_hourly_distribution(
    user_id: Optional[int] = None, days: int = 30, db: Session = Depends(get_db)
):
    from sqlalchemy import func

    cutoff = datetime.utcnow() - timedelta(days=days)
    query = db.query(
        func.extract("hour", SessionModel.start_time).label("hour"),
        func.count(SessionModel.id).label("count"),
        func.avg(SessionModel.duration_minutes).label("avg_duration"),
    ).filter(SessionModel.start_time >= cutoff)

    if user_id:
        query = query.filter(SessionModel.user_id == user_id)

    results = query.group_by("hour").all()

    distribution = {i: {"count": 0, "avg_duration": 0} for i in range(24)}
    for r in results:
        hour = int(r.hour)
        distribution[hour] = {
            "count": r.count,
            "avg_duration": float(r.avg_duration or 0),
        }

    return {"distribution": distribution}


@router.get("/activity/weekly-summary")
def get_weekly_summary(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    from sqlalchemy import func

    results = []
    for weeks_ago in range(4):
        week_start = datetime.utcnow() - timedelta(weeks=weeks_ago + 1)
        week_end = datetime.utcnow() - timedelta(weeks=weeks_ago)

        query = db.query(SessionModel).filter(
            SessionModel.start_time >= week_start, SessionModel.start_time < week_end
        )

        if user_id:
            query = query.filter(SessionModel.user_id == user_id)

        sessions = query.all()

        results.append(
            {
                "week": f"Week {4 - weeks_ago}",
                "start_date": week_start.date().isoformat(),
                "end_date": week_end.date().isoformat(),
                "session_count": len(sessions),
                "total_minutes": sum(s.duration_minutes for s in sessions),
                "avg_session_length": sum(s.duration_minutes for s in sessions)
                / len(sessions)
                if sessions
                else 0,
            }
        )

    return {"weekly_summaries": results}
