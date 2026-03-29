from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.services.analytics import get_analytics_summary, export_sessions_csv

router = APIRouter()


@router.get("/analytics/summary")
def analytics_summary(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    return get_analytics_summary(db, user_id)


@router.get("/analytics/export")
def export_csv(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    csv_data = export_sessions_csv(db, user_id)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sessions.csv"},
    )
