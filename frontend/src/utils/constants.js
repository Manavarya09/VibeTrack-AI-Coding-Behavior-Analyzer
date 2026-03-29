export const SESSION_SOURCES = {
  WEB: 'web',
  DESKTOP: 'desktop',
  CHROME: 'chrome',
}

export const EVENT_TYPES = {
  PROMPT: 'prompt',
  BREAK: 'break',
  ACTIVITY: 'activity',
  TAB_FOCUS: 'tab_focus',
}

export const CLASSIFICATIONS = {
  NORMAL: 'Normal',
  DEEP_FLOW: 'Deep Flow',
  HIGH_DEPENDENCY: 'High Dependency',
}

export const VIBE_SCORE_THRESHOLDS = {
  NORMAL: 100,
  DEEP_FLOW: 500,
}

export const IDLE_THRESHOLD_MINUTES = 5
export const AUTO_END_SESSION_MINUTES = 30

export const AI_TOOLS = [
  'claude.ai',
  'chat.openai.com',
  'copilot.microsoft.com',
  'cursor.sh',
  'windsurf.ai',
]
