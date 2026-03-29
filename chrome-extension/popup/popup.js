let isActive = false

document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status')
  const startBtn = document.getElementById('startBtn')
  const stopBtn = document.getElementById('stopBtn')
  const eventCountEl = document.getElementById('eventCount')

  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (response && response.session) {
      isActive = true
      updateUI()
    }
    if (response && response.eventCount) {
      eventCountEl.textContent = response.eventCount
    }
  })

  startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'START_SESSION', userId: 1 })
    isActive = true
    updateUI()
  })

  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'END_SESSION' })
    isActive = false
    eventCountEl.textContent = '0'
    updateUI()
  })

  function updateUI() {
    if (isActive) {
      statusEl.textContent = 'Session Active'
      statusEl.className = 'status active'
      startBtn.style.display = 'none'
      stopBtn.style.display = 'block'
    } else {
      statusEl.textContent = 'No active session'
      statusEl.className = 'status inactive'
      startBtn.style.display = 'block'
      stopBtn.style.display = 'none'
    }
  }
})
