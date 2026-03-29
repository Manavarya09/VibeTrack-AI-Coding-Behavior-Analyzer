# VibeTrack – AI Coding Behavior Analyzer

A full-stack system that tracks AI-assisted coding behavior and detects "vibe coding loops" (prolonged high-engagement sessions).

## Features

- **Session Tracking**: Track coding sessions with start/end times
- **Event Logging**: Log AI tool interactions (Claude, Copilot, ChatGPT)
- **Vibe Score Engine**: Calculate engagement scores using the formula:
  ```
  Score = (session_duration_minutes × prompt_count) / (break_time_minutes + 1)
  ```
- **Classification**: Categorize sessions as Normal, Deep Flow, or High Dependency
- **Dashboard**: Visual analytics with charts and statistics
- **Chrome Extension**: Track browser-based AI tool usage
- **Desktop Agent**: Track active windows and idle time (Rust/Tauri)

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Database**: SQLite
- **Desktop Tracker**: Rust + Tauri

## Quick Start

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

### Desktop Tracker (Rust)

```bash
cd desktop-tracker
cargo build --release
cargo run
```

## API Endpoints

- `POST /api/session/start` - Start a new session
- `POST /api/session/end/{id}` - End a session
- `POST /api/event` - Log an event
- `GET /api/stats` - Get aggregate statistics
- `GET /api/sessions` - Get all sessions
- `GET /api/stats/daily` - Get daily statistics

## Project Structure

```
VibeTrack/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── models/   # SQLAlchemy models
│   │   └── services/ # Business logic
│   └── main.py
├── frontend/          # React frontend
│   └── src/
│       ├── pages/
│       └── components/
├── chrome-extension/  # Chrome extension
└── desktop-tracker/  # Rust desktop app
```

## License

MIT
