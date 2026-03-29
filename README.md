<p align="center">
  <img src="https://img.shields.io/badge/VibeTrack-AI%20Coding%20Analyzer-purple?style=for-the-badge&logo=python&logoColor=white" alt="VibeTrack">
  <img src="https://img.shields.io/badge/Python-3.11+-blue?style=flat&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/React-18-blue?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-Enabled-brightgreen?style=flat" alt="FastAPI">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License">
</p>

# VibeTrack - AI Coding Behavior Analyzer

A comprehensive full-stack system that tracks AI-assisted coding behavior, detects "vibe coding loops" (prolonged high-engagement sessions), and provides actionable insights through ML-powered pattern detection.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Features
- **Session Tracking** - Track coding sessions with start/end times, duration, and source
- **Event Logging** - Log AI tool interactions (Claude, Copilot, ChatGPT, Cursor, etc.)
- **Vibe Score Engine** - Calculate engagement scores using the formula:
  ```
  Score = (session_duration_minutes x prompt_count) / (break_time_minutes + 1)
  ```
- **Session Classification** - Categorize sessions as Normal, Deep Flow, or High Dependency
- **Real-time Dashboard** - Visual analytics with charts and statistics

### Advanced Features
- **JWT Authentication** - Secure login/register system with bcrypt password hashing
- **WebSocket Support** - Real-time session updates and live monitoring
- **ML Pattern Detection** - AI-powered productivity insights
- **Session Prediction** - Predict session outcome based on parameters
- **Webhooks** - External integrations (Slack, Discord, custom endpoints)
- **Team Collaboration** - Create teams, share sessions with teammates
- **Multi-format Export** - JSON, CSV, Markdown, PDF reports
- **Notifications** - In-app alerts for session events
- **Activity Heatmap** - GitHub-style contribution calendar
- **Goals Tracking** - Set and track productivity goals

### Tracking Options
- **Chrome Extension** - Track browser-based AI tool usage
- **Desktop Agent (Rust)** - Track active windows, idle time, application usage

---

## Architecture

```
+-------------------------------------------------------------+
|                        VibeTrack Architecture                 |
+-------------------------------------------------------------+
|                                                                  |
|  +--------------+     +--------------+     +--------------+   |
|  |   Chrome     |     |   Desktop    |     |    Web       |   |
|  |  Extension   |     |   Tracker    |     |   Dashboard  |   |
|  +------+-------+     +------+-------+     +------+-------+   |
|         |                    |                    |            |
|         +--------------------+--------------------+            |
|                              |                                  |
|                      +-------+-------+                        |
|                      |  FastAPI API  |                        |
|                      +-------+-------+                        |
|                              |                                  |
|         +--------------------+--------------------+           |
|         |                    |                    |           |
|  +------+------+    +------+------+    +------+------+   |
|  |   Session   |    |   Events     |    |    Stats     |   |
|  |   Manager   |    |   Manager    |    |   Aggregator |   |
|  +-------------+    +--------------+    +-------------+   |
|                              |                                  |
|                      +-------+-------+                        |
|                      |    SQLite     |                        |
|                      |   Database    |                        |
|                      +---------------+                        |
|                                                                  |
+-------------------------------------------------------------+
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | FastAPI, Python 3.11+ |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts |
| **Database** | SQLite, SQLAlchemy, Alembic |
| **Desktop** | Rust, Tauri |
| **Authentication** | JWT, bcrypt |
| **Real-time** | WebSockets |
| **ML** | Pattern Detection, Prediction Engine |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Rust (for desktop tracker)

### 1. Clone the Repository

```bash
git clone https://github.com/Manavarya09/VibeTrack-AI-Coding-Behavior-Analyzer.git
cd VibeTrack
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### 4. Desktop Tracker (Optional)

```bash
cd desktop-tracker

# Build and run
cargo build --release
cargo run
```

---

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user |

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/session/start` | Start a new session |
| POST | `/api/session/end/{id}` | End a session |
| POST | `/api/session/calculate-vibe/{id}` | Calculate vibe score |
| GET | `/api/sessions` | List all sessions |
| GET | `/api/session/{id}` | Get session details |
| PUT | `/api/session/{id}` | Update session |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/event` | Log an event |
| GET | `/api/events` | List events |
| GET | `/api/event/{id}` | Get event details |

### Statistics and Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get aggregate statistics |
| GET | `/api/stats/daily` | Get daily statistics |
| GET | `/api/analytics/summary` | Get analytics summary |
| GET | `/api/analytics/export` | Export data (CSV/JSON/MD) |

### ML and Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ml/patterns` | Get productivity patterns |
| GET | `/api/ml/predict` | Predict session outcome |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams` | Create a team |
| GET | `/api/teams` | List teams |
| GET | `/api/teams/{id}` | Get team details |
| POST | `/api/teams/{id}/members` | Add team member |
| GET | `/api/teams/{id}/stats` | Get team statistics |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks` | Register webhook |
| DELETE | `/api/webhooks` | Remove webhook |
| GET | `/api/webhooks` | List webhooks |

### WebSocket

```
ws://localhost:8000/ws/{user_id}
```

### Example: Starting a Session

```bash
curl -X POST http://localhost:8000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "source": "web"}'
```

### Example: Logging a Prompt

```bash
curl -X POST http://localhost:8000/api/event \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "user_id": 1,
    "event_type": "prompt",
    "source": "web",
    "content": "Explain recursion to me"
  }'
```

---

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=sqlite:///./vibetrack.db
SECRET_KEY=your-secret-key-change-in-production
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Database Migrations

```bash
cd backend

# Generate a migration
alembic revision --autogenerate -m "add new field"

# Run migrations
alembic upgrade head
```

---

## Deployment

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

```bash
# Backend
cd backend
pip install -r requirements.txt
gunicorn main:app --workers 4 --bind 0.0.0.0:8000

# Frontend
cd frontend
npm run build
npm run preview
```

---

## Project Structure

```
VibeTrack/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth.py       # Authentication
│   │   │   ├── sessions.py   # Session management
│   │   │   ├── events.py    # Event logging
│   │   │   ├── stats.py     # Statistics
│   │   │   ├── ml.py        # ML insights
│   │   │   ├── teams.py     # Team collaboration
│   │   │   └── webhooks.py  # Webhook management
│   │   ├── models/           # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── session.py
│   │   │   ├── event.py
│   │   │   └── team.py
│   │   ├── services/         # Business logic
│   │   │   ├── vibe_score.py
│   │   │   ├── analytics.py
│   │   │   ├── ml_insights.py
│   │   │   └── webhooks.py
│   │   ├── auth.py          # JWT utilities
│   │   ├── cache.py         # Caching layer
│   │   ├── websocket.py     # WebSocket manager
│   │   └── database.py      # Database configuration
│   ├── alembic/              # Database migrations
│   ├── main.py              # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── chrome-extension/          # Chrome extension
│   ├── manifest.json
│   ├── background/
│   │   └── background.js
│   └── popup/
│       ├── popup.html
│       └── popup.js
│
├── desktop-tracker/           # Rust desktop app
│   ├── src/
│   │   ├── main.rs
│   │   └── tracker.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── docker-compose.yml
├── README.md
└── setup.sh
```

---

## Vibe Score Formula

The Vibe Score quantifies your engagement level during coding sessions:

```
Vibe Score = (Duration in Minutes x Prompt Count) / (Break Time in Minutes + 1)
```

### Classification Thresholds

| Classification | Score Range | Description |
|----------------|-------------|-------------|
| **Normal** | < 100 | Standard coding session |
| **Deep Flow** | 100 - 499 | Highly focused, productive session |
| **High Dependency** | >= 500 | Heavy reliance on AI assistance |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made by <a href="https://github.com/Manavarya09">Manav Arya</a>
</p>
