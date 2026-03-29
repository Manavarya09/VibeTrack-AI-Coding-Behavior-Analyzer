# VibeTrack Chrome Extension

This extension tracks your AI-assisted coding behavior in the browser.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

## Features

- **Session Tracking**: Start/end tracking sessions from the extension popup
- **AI Tool Detection**: Automatically detects when you're using AI coding tools
- **Event Logging**: Records tab switches to AI tool websites

## Tracked AI Tools

- claude.ai
- chat.openai.com
- copilot.microsoft.com
- cursor.sh
- windsurf.ai

## Permissions

- `activeTab`: To track active tab changes
- `tabs`: To access tab information
- `storage`: To store extension settings
