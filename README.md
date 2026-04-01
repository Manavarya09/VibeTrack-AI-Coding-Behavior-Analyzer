# VibeTrack -- AI Coding Behavior Analyzer

Track, analyze, and optimize your AI-assisted coding sessions. VibeTrack monitors your interactions with tools like Claude, ChatGPT, and Copilot, detects dependency patterns, and provides actionable insights.

## System Architecture

```
Frontend (React + Vite + Tailwind)    port 5173
    |
Backend (FastAPI + SQLite)            port 8000
    |
Desktop Tracker (Rust/Tauri)          native app
Chrome Extension                      browser
MCP Server (Claude plugin)            stdio
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` -- register an account and start tracking.

### Desktop Tracker

```bash
cd desktop-tracker
cargo build --release
cargo run
```

### MCP Server (Claude Plugin)

```bash
cd mcp-server
npm install
```

Add to Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "vibetrack": {
      "command": "node",
      "args": ["/path/to/VibeTrack/mcp-server/server.js"],
      "env": {
        "VIBETRACK_API_URL": "http://localhost:8000"
      }
    }
  }
}
```

## Vibe Score Formula

```
Score = (Duration in Minutes x Prompt Count) / (Break Time in Minutes + 1)
```

| Classification    | Score Range | Description              |
|-------------------|-------------|--------------------------|
| Normal            | < 100       | Balanced AI usage        |
| Deep Flow         | 100 - 499   | Highly focused session   |
| High Dependency   | >= 500      | Consider taking breaks   |

## API Endpoints

| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| POST   | /api/auth/register              | Register new user              |
| POST   | /api/auth/login/json            | Login (JSON body)              |
| GET    | /api/auth/me                    | Get current user               |
| POST   | /api/session/start              | Start tracking session         |
| POST   | /api/session/end/{id}           | End session                    |
| POST   | /api/session/calculate-vibe/{id}| Calculate vibe score           |
| GET    | /api/sessions                   | List all sessions              |
| POST   | /api/event                      | Log prompt/break/activity      |
| GET    | /api/events                     | List events                    |
| GET    | /api/stats                      | Aggregate statistics           |
| GET    | /api/stats/daily                | Daily stats                    |
| GET    | /api/ml/patterns                | ML pattern detection           |
| GET    | /api/ml/predict                 | Predict session outcome        |
| GET    | /api/recommendations            | Personalized recommendations   |
| GET    | /health                         | Health check                   |
| GET    | /docs                           | Swagger API docs               |

## Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Recharts, Framer Motion
- **Backend**: FastAPI, SQLAlchemy, SQLite, JWT auth, bcrypt
- **Desktop**: Rust, Tauri, reqwest, rusqlite
- **Chrome Extension**: Manifest V3
- **MCP Server**: @modelcontextprotocol/sdk, Node.js
