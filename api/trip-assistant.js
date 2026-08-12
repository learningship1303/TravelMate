import { createAssistantSession } from './_lib/gemini.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  const { trip, priorMessages, language, message } = req.body || {}
  if (!message || !trip) {
    res.status(400).json({ message: 'Missing trip context or message' })
    return
  }

  try {
    const chatSession = createAssistantSession(trip, priorMessages || [], language || 'English')
    const streamResult = await chatSession.sendMessageStream({ message })

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.status(200)

    for await (const chunk of streamResult) {
      if (chunk.text) res.write(chunk.text)
    }
    res.end()
  } catch (error) {
    console.error(error)
    if (!res.headersSent) {
      res.status(502).json({ message: error?.message || 'Something went wrong talking to the AI. Please try again.' })
    } else {
      res.end()
    }
  }
}
