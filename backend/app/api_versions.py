from fastapi import APIRouter

router = APIRouter()


@router.get("/v1/health")
def health_v1():
    return {"version": "1.0.0", "status": "healthy", "api_version": "v1"}


@router.get("/v2/health")
def health_v2():
    return {
        "version": "2.0.0",
        "status": "healthy",
        "api_version": "v2",
        "features": ["websocket", "caching", "rate_limiting"],
    }
