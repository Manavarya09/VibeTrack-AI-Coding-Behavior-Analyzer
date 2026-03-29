# VibeTrack Skill - AI Coding Behavior Analyzer

## Overview

This skill provides capabilities to work with VibeTrack - an AI Coding Behavior Analyzer that tracks coding sessions, analyzes engagement patterns, and detects "vibe coding loops".

## Triggers

This skill activates when the user mentions:
- "vibetrack"
- "AI coding behavior"
- "session tracking"
- "vibe score"
- "coding analytics"

## Capabilities

### 1. Project Setup
- Initialize VibeTrack backend (FastAPI)
- Initialize VibeTrack frontend (React + Vite)
- Configure database (SQLite)
- Set up development environment

### 2. Session Management
- Start/stop coding sessions
- Track session duration
- Log AI tool interactions
- Calculate vibe scores

### 3. Vibe Score Engine
The vibe score is calculated using:
```
Score = (session_duration_minutes x prompt_count) / (break_time_minutes + 1)
```

Classifications:
- Normal: < 100
- Deep Flow: 100 - 499
- High Dependency: >= 500

### 4. API Endpoints

Backend routes:
- `/api/session/*` - Session management
- `/api/event/*` - Event logging
- `/api/stats/*` - Statistics
- `/api/analytics/*` - Analytics
- `/api/ml/*` - ML insights
- `/api/teams/*` - Team collaboration

### 5. Frontend Components
- Dashboard with charts
- Session timer
- Event logger
- Analytics summary
- ML insights

### 6. Tracking Options
- Chrome Extension (browser)
- Desktop Agent (Rust/Tauri)
- Web Dashboard

## Usage Examples

### Start a new session
```python
POST /api/session/start
{"user_id": 1, "source": "web"}
```

### Log a prompt event
```python
POST /api/event
{
  "session_id": 1,
  "user_id": 1,
  "event_type": "prompt",
  "source": "web",
  "content": "Explain recursion"
}
```

### Get statistics
```python
GET /api/stats
```

### Get ML insights
```python
GET /api/ml/patterns?user_id=1
```

## Project Structure

```
VibeTrack/
├── backend/
│   ├── app/
│   │   ├── api/        # API routes
│   │   ├── models/     # Database models
│   │   └── services/   # Business logic
│   └── main.py
├── frontend/
│   └── src/
│       ├── components/
│       └── pages/
├── chrome-extension/
└── desktop-tracker/
```

## Environment Variables

Backend (.env):
```
DATABASE_URL=sqlite:///./vibetrack.db
SECRET_KEY=your-secret-key
API_PORT=8000
```

Frontend (.env):
```
VITE_API_URL=http://localhost:8000
```

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up -d
```

## Integration Points

- REST API at `http://localhost:8000`
- WebSocket at `ws://localhost:8000/ws/{user_id}`
- Frontend at `http://localhost:5173`

## Testing

```bash
# Backend tests
cd backend && pytest tests/

# Frontend build
cd frontend && npm run build
```

## Notes

- All timestamps are in UTC
- Session IDs are auto-incremented
- Vibe scores are calculated on session end
- Events automatically increment prompt count
