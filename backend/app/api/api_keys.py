from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from app.services.api_keys import api_key_manager
from app.auth import decode_access_token
from app.database import get_db
from app.models.user import User

router = APIRouter()


class APIKeyCreate(BaseModel):
    name: str = "Default"
    expires_days: int = 365


class APIKeyResponse(BaseModel):
    id: int
    name: str
    key_prefix: str
    created_at: str
    expires_at: str
    is_active: bool
    last_used: Optional[str] = None


def get_current_user_id(authorization: str = Header(...)) -> int:
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    return payload.get("sub")


@router.post("/api-keys", response_model=dict)
def create_api_key(key_data: APIKeyCreate, user_id: int = Depends(get_current_user_id)):
    result = api_key_manager.generate_key(user_id, key_data.name, key_data.expires_days)
    return result


@router.get("/api-keys", response_model=List[APIKeyResponse])
def list_api_keys(user_id: int = Depends(get_current_user_id)):
    keys = api_key_manager.list_keys(user_id)
    return keys


@router.delete("/api-keys/{key_id}")
def revoke_api_key(key_id: int, user_id: int = Depends(get_current_user_id)):
    success = api_key_manager.revoke_key(key_id)
    if not success:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key revoked"}


@router.post("/api-keys/verify")
def verify_api_key(key: str):
    result = api_key_manager.verify_key(key)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid or expired API key")
    return {"valid": True, "user_id": result["user_id"]}
