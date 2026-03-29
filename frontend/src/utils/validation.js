export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePassword(password) {
  return {
    valid: password.length >= 8,
    message: password.length < 8 ? 'Password must be at least 8 characters' : ''
  }
}

export function validateUsername(username) {
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' }
  }
  return { valid: true, message: '' }
}

export function validateSession(data) {
  const errors = []
  
  if (!data.user_id) {
    errors.push('User ID is required')
  }
  
  if (data.duration_minutes && data.duration_minutes < 0) {
    errors.push('Duration cannot be negative')
  }
  
  if (data.prompt_count && data.prompt_count < 0) {
    errors.push('Prompt count cannot be negative')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateEvent(data) {
  const errors = []
  
  if (!data.session_id) {
    errors.push('Session ID is required')
  }
  
  if (!data.event_type) {
    errors.push('Event type is required')
  }
  
  const validTypes = ['prompt', 'break', 'activity', 'tab_focus']
  if (data.event_type && !validTypes.includes(data.event_type)) {
    errors.push(`Event type must be one of: ${validTypes.join(', ')}`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}
