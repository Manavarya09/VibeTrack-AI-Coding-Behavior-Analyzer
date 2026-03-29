from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.api import (
    sessions,
    events,
    stats,
    users,
    analytics,
    reports,
    auth,
    ml,
    webhooks,
    teams,
    notifications,
)
from app.database import engine, Base
from app.websocket import manager
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VibeTrack API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router, prefix="/api", tags=["sessions"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(stats.router, prefix="/api", tags=["stats"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(reports.router, prefix="/api", tags=["reports"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(ml.router, prefix="/api", tags=["ml"])
app.include_router(webhooks.router, prefix="/api", tags=["webhooks"])
app.include_router(teams.router, prefix="/api", tags=["teams"])
app.include_router(notifications.router, prefix="/api", tags=["notifications"])


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


import json


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc.errors()}")
    return {"detail": exc.errors()}


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}")
    return {"detail": "Database error occurred"}


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return {"detail": "Internal server error"}


@app.get("/")
def root():
    return {"message": "VibeTrack API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy", "database": "connected"}
