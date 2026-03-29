from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/version")
def get_version():
    return {
        "version": "1.0.0",
        "api_version": "v1",
        "build": "2026.03.30",
        "environment": "production",
    }


@router.get("/time")
def get_server_time():
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "unix": int(datetime.utcnow().timestamp()),
    }
