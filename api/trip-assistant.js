import { createAssistantSession } from './_lib/gemini.js'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { trip, priorMessages, language, message } = body || {}
  if (!message || !trip) {
    return new Response(JSON.stringify({ message: 'Missing trip context or message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const chatSession = createAssistantSession(trip, priorMessages || [], language || 'English')
    const streamResult = await chatSession.sendMessageStream({ message })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult) {
            if (chunk.text) controller.enqueue(encoder.encode(chunk.text))
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ message: error?.message || 'Something went wrong talking to the AI. Please try again.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
