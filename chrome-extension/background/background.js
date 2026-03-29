const AI_TOOLS = [
  'claude.ai',
  'chat.openai.com',
  'copilot.microsoft.com',
  'github.com copilot',
  'cursor.sh',
  'windsurf.ai'
]

let currentSession = null
let eventCount = 0

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_SESSION') {
    startSession(message.userId)
  } else if (message.type === 'END_SESSION') {
    endSession()
  } else if (message.type === 'LOG_EVENT') {
    logEvent(message.data)
  } else if (message.type === 'GET_STATUS') {
    sendResponse({ session: currentSession, eventCount })
  }
  return true
})

async function startSession(userId) {
  try {
    const response = await fetch('http://localhost:8000/api/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, source: 'chrome' })
    })
    const session = await response.json()
    currentSession = session
    eventCount = 0
    console.log('Session started:', session.id)
  } catch (error) {
    console.error('Failed to start session:', error)
  }
}

async function endSession() {
  if (!currentSession) return
  
  try {
    await fetch(`http://localhost:8000/api/session/end/${currentSession.id}`, {
      method: 'POST'
    })
    console.log('Session ended')
    currentSession = null
    eventCount = 0
  } catch (error) {
    console.error('Failed to end session:', error)
  }
}

async function logEvent(data) {
  if (!currentSession) return
  
  try {
    await fetch('http://localhost:8000/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: currentSession.id,
        user_id: data.userId,
        event_type: data.eventType,
        source: data.source,
        content: data.content,
        duration_seconds: data.duration || 0
      })
    })
    eventCount++
  } catch (error) {
    console.error('Failed to log event:', error)
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId)
    if (isAITool(tab.url)) {
      logEvent({
        userId: 1,
        eventType: 'tab_focus',
        source: 'chrome',
        content: tab.url
      })
    }
  } catch (error) {
    console.error('Error tracking tab:', error)
  }
})

function isAITool(url) {
  return AI_TOOLS.some(tool => url.includes(tool))
}
