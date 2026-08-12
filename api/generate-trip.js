import { createChatSession } from './_lib/gemini.js'
import { buildFinalPrompt, validateTripFormFields } from './_lib/prompt.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  const { location, noOfDays, budget, traveler, targetBudgetAmount, targetBudgetCurrency } = req.body || {}

  const { valid, message } = validateTripFormFields({ location, noOfDays, budget, traveler })
  if (!valid) {
    res.status(400).json({ message })
    return
  }

  try {
    const finalPrompt = buildFinalPrompt({ location, noOfDays, traveler, budget, targetBudgetAmount, targetBudgetCurrency })
    const chatSession = createChatSession()
    const result = await chatSession.sendMessage({ message: finalPrompt })
    const cleaned = (result.text || '').replace(/^```json\s*|\s*```$/g, '')
    const tripData = JSON.parse(cleaned)
    res.status(200).json(tripData)
  } catch (error) {
    console.error(error)
    res.status(502).json({ message: error?.message || 'Something went wrong talking to the AI. Please try again.' })
  }
}
