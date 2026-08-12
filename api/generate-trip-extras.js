import { generateTripExtras } from './_lib/gemini.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  const { location, noOfDays, budget } = req.body || {}
  if (!location || !noOfDays || !budget) {
    res.status(400).json({ message: 'Missing location, noOfDays, or budget' })
    return
  }

  try {
    const extras = await generateTripExtras({ location, noOfDays, budget })
    res.status(200).json(extras)
  } catch (error) {
    console.error(error)
    res.status(502).json({ message: error?.message || 'Something went wrong talking to the AI. Please try again.' })
  }
}
