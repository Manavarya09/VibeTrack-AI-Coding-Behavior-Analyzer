from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import sessions, events, stats
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VibeTrack API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router, prefix="/api", tags=["sessions"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(stats.router, prefix="/api", tags=["stats"])


@app.get("/")
def root():
    return {"message": "VibeTrack API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
