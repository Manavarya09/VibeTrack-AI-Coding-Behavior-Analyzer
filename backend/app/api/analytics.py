from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.services.analytics import get_analytics_summary, export_sessions_csv
from app.services.export import (
    export_to_json,
    export_to_csv,
    export_to_markdown,
    generate_pdf_report,
)

router = APIRouter()


@router.get("/analytics/summary")
def analytics_summary(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    return get_analytics_summary(db, user_id)


@router.get("/analytics/export")
def export_data(
    format: str = "csv", user_id: Optional[int] = None, db: Session = Depends(get_db)
):
    sessions = export_sessions_csv(db, user_id)

    if format == "json":
        return Response(
            content=sessions,
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=sessions.json"},
        )
    elif format == "markdown":
        return Response(
            content=sessions,
            media_type="text/markdown",
            headers={"Content-Disposition": "attachment; filename=sessions.md"},
        )
    else:
        return Response(
            content=sessions,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=sessions.csv"},
        )
