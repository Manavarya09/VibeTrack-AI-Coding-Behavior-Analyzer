# VibeTrack MCP Server

Model Context Protocol (MCP) server for VibeTrack AI Coding Behavior Analyzer.

## Installation

```bash
cd mcp-server
npm install
```

## Configuration

Set the API URL:
```bash
export VIBETRACK_API_URL=http://localhost:8000
```

## Running

```bash
npm start
```

## Available Tools

| Tool | Description |
|------|-------------|
| `start_session` | Start a new coding session |
| `end_session` | End an active session |
| `log_event` | Log an event (prompt, break, activity) |
| `get_stats` | Get aggregate statistics |
| `get_sessions` | Get all sessions |
| `get_ml_patterns` | Get ML-powered productivity patterns |
| `calculate_vibe_score` | Calculate vibe score for a session |
| `get_recommendations` | Get personalized recommendations |

## Usage Example

```javascript
{
  name: 'start_session',
  arguments: {
    user_id: 1,
    source: 'mcp'
  }
}
```

## Integration

This MCP server can be integrated with:
- Claude Desktop
- OpenCode
- Other MCP-compatible clients
