# VibeTrack Desktop Tracker

A Rust-based desktop application for tracking your coding behavior.

## Prerequisites

- Rust (1.70+)
- Cargo
- Tauri CLI

## Setup

```bash
cd desktop-tracker
cargo build --release
```

## Running

```bash
cargo run
```

## Features

- **Window Tracking**: Tracks active window title and application
- **Idle Detection**: Detects when you've been idle (5 min threshold)
- **Activity Events**: Sends activity data to the backend API
- **Background Tracking**: Runs efficiently in the background

## API Communication

The desktop tracker sends events to `http://localhost:8000/api/event`:

```json
{
  "session_id": 1,
  "user_id": 1,
  "event_type": "activity",
  "source": "desktop",
  "content": "{\"timestamp\":\"...\",\"active_app\":\"...\",\"is_idle\":false}",
  "duration_seconds": 60
}
```

## Platform Support

- macOS (primary)
- Windows (basic support)
- Linux (basic support)
