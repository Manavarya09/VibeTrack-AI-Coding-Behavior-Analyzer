const AI_TOOLS = [
  'claude.ai',
  'chat.openai.com',
  'copilot.microsoft.com',
  'github.com/copilot',
  'cursor.sh',
  'windsurf.ai',
]

const DEFAULT_API_URL = 'http://localhost:8000'

let currentSession = null
let eventCount = 0

function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiUrl'], (result) => {
      resolve(result.apiUrl || DEFAULT_API_URL)
    })
  })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_SESSION') {
    startSession(message.userId)
  } else if (message.type === 'END_SESSION') {
    endSession()
  } else if (message.type === 'LOG_EVENT') {
    logEvent(message.data)
  } else if (message.type === 'GET_STATUS') {
    sendResponse({ session: currentSession, eventCount })
  } else if (message.type === 'SET_API_URL') {
    chrome.storage.sync.set({ apiUrl: message.url })
  }
  return true
})

async function startSession(userId) {
  const apiUrl = await getApiUrl()
  try {
    const response = await fetch(`${apiUrl}/api/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, source: 'chrome' }),
    })
    const session = await response.json()
    currentSession = session
    eventCount = 0
    console.log('VibeTrack: Session started:', session.id)
  } catch (error) {
    console.error('VibeTrack: Failed to start session:', error)
  }
}

async function endSession() {
  if (!currentSession) return
  const apiUrl = await getApiUrl()

  try {
    await fetch(`${apiUrl}/api/session/end/${currentSession.id}`, { method: 'POST' })
    await fetch(`${apiUrl}/api/session/calculate-vibe/${currentSession.id}`, { method: 'POST' })
    console.log('VibeTrack: Session ended and vibe calculated')
    currentSession = null
    eventCount = 0
  } catch (error) {
    console.error('VibeTrack: Failed to end session:', error)
  }
}

async function logEvent(data) {
  if (!currentSession) return
  const apiUrl = await getApiUrl()

  try {
    await fetch(`${apiUrl}/api/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: currentSession.id,
        user_id: data.userId,
        event_type: data.eventType,
        source: 'chrome',
        content: data.content,
        duration_seconds: data.duration || 0,
      }),
    })
    eventCount++
  } catch (error) {
    console.error('VibeTrack: Failed to log event:', error)
  }
}

// Auto-track AI tool tab focus
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId)
    if (tab.url && isAITool(tab.url)) {
      logEvent({
        userId: 1,
        eventType: 'tab_focus',
        content: `Focused: ${new URL(tab.url).hostname}`,
      })
    }
  } catch {
    // Tab may not exist anymore
  }
})

function isAITool(url) {
  if (!url) return false
  return AI_TOOLS.some((tool) => url.includes(tool))
}
