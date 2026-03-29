# VibeTrack - OpenCode Skill

## Skill Description

This skill enables OpenCode to work with VibeTrack - an AI Coding Behavior Analyzer that tracks AI-assisted coding sessions and provides insights through ML-powered pattern detection.

## Activation Phrases

- "vibetrack"
- "track coding sessions"
- "vibe score"
- "coding behavior analytics"
- "AI coding patterns"

## Capabilities

### Session Management
- Start/stop coding sessions
- Track session duration
- Log events and prompts
- Calculate vibe scores

### Analytics
- Get session statistics
- View daily activity
- Export data (CSV, JSON, MD)
- ML pattern detection

### API Integration
- REST endpoints
- WebSocket real-time updates
- Team collaboration features
- Webhook integrations

## Usage

### Start Tracking
```
Start a new VibeTrack session for user 1
```

### Log Events
```
Log a prompt event in session 5
```

### Get Insights
```
Show my coding statistics
```

## Quick Reference

| Command | Description |
|---------|-------------|
| Start session | POST /api/session/start |
| End session | POST /api/session/end/{id} |
| Log event | POST /api/event |
| Get stats | GET /api/stats |
| ML patterns | GET /api/ml/patterns |

## Environment

- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- WebSocket: ws://localhost:8000/ws/{user_id}

## Files

- Backend: `backend/main.py`
- Frontend: `frontend/src/App.jsx`
- Database: SQLite (`vibetrack.db`)
