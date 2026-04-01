from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.models.team import Team, TeamMember
from app.models.session import Session as SessionModel

router = APIRouter()


class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    owner_id: int = 1


class TeamResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    member_count: int = 0

    class Config:
        from_attributes = True


class TeamMemberAdd(BaseModel):
    user_id: int
    role: str = "member"


def _team_to_response(team, member_count: int) -> dict:
    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "created_at": team.created_at,
        "member_count": member_count,
    }


@router.post("/teams", response_model=TeamResponse)
def create_team(team_data: TeamCreate, db: Session = Depends(get_db)):
    existing = db.query(Team).filter(Team.name == team_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Team name already exists")

    team = Team(
        name=team_data.name,
        description=team_data.description,
        owner_id=team_data.owner_id,
    )
    db.add(team)
    db.commit()
    db.refresh(team)

    member = TeamMember(team_id=team.id, user_id=team_data.owner_id, role="owner")
    db.add(member)
    db.commit()

    return _team_to_response(team, 1)


@router.get("/teams", response_model=List[TeamResponse])
def get_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    result = []
    for team in teams:
        member_count = (
            db.query(TeamMember).filter(TeamMember.team_id == team.id).count()
        )
        result.append(_team_to_response(team, member_count))
    return result


@router.get("/teams/{team_id}", response_model=TeamResponse)
def get_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    member_count = db.query(TeamMember).filter(TeamMember.team_id == team_id).count()
    return _team_to_response(team, member_count)


@router.post("/teams/{team_id}/members")
def add_member(team_id: int, member_data: TeamMemberAdd, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    existing = (
        db.query(TeamMember)
        .filter(
            TeamMember.team_id == team_id, TeamMember.user_id == member_data.user_id
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="User already in team")

    member = TeamMember(
        team_id=team_id, user_id=member_data.user_id, role=member_data.role
    )
    db.add(member)
    db.commit()

    return {"message": "Member added"}


@router.get("/teams/{team_id}/stats")
def get_team_stats(team_id: int, db: Session = Depends(get_db)):
    members = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
    member_ids = [m.user_id for m in members]

    sessions = db.query(SessionModel).filter(SessionModel.user_id.in_(member_ids)).all()

    total_minutes = sum(s.duration_minutes for s in sessions)

    return {
        "team_id": team_id,
        "member_count": len(members),
        "total_sessions": len(sessions),
        "total_minutes": round(total_minutes, 2),
        "avg_session_length": round(total_minutes / len(sessions), 2)
        if sessions
        else 0,
    }
