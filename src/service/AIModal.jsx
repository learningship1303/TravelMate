import axios from 'axios'

export function getFriendlyAiErrorMessage(error) {
  const raw = error?.response?.data?.message || error?.message || ''
  if (error?.response?.status === 429 || raw.includes('429') || /quota/i.test(raw)) {
    return "TravelMate AI is getting a lot of requests right now and hit today's usage limit. Please try again in a few minutes, or later today."
  }
  if (raw.length > 160) {
    return 'Something went wrong talking to the AI. Please try again.'
  }
  return raw || 'Something went wrong talking to the AI. Please try again.'
}

export async function generateTrip(formData) {
  const { data } = await axios.post('/api/generate-trip', formData)
  return data
}

export async function streamAssistantReply(trip, priorMessages, language, message, onChunk) {
  const response = await fetch('/api/trip-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trip, priorMessages, language, message }),
  })

  if (!response.ok || !response.body) {
    let payload = null
    try {
      payload = await response.json()
    } catch {
      // response body wasn't JSON (e.g. network-level failure) - fall through with generic message
    }
    throw new Error(payload?.message || 'Something went wrong talking to the AI. Please try again.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    full += decoder.decode(value, { stream: true })
    onChunk(full)
  }

  return full
}
