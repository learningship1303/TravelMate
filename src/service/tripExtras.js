import { GoogleGenerativeAI } from '@google/generative-ai'

const generationConfig = {
  temperature: 0.8,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 4096,
  responseMimeType: 'application/json',
}

export async function generateTripExtras(trip) {
  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_GOOGLE_GEMINI_AI_API_KEY. Add it to your .env file.')
  }

  const location = trip?.userSelection?.location
  const days = trip?.userSelection?.noOfDays
  const budget = trip?.userSelection?.budget

  const prompt = `You are a travel guide assistant. For a ${days}-day trip to ${location} with a ${budget} budget, return ONLY valid JSON (no markdown fences, no commentary) with exactly this shape:
{
  "overview": "2-3 sentence description of the destination",
  "bestTimeToVisit": "one short paragraph on the best time of year to visit",
  "packingChecklist": [{ "category": "Clothing", "items": ["item 1", "item 2"] }],
  "localTips": ["short practical tip 1", "short practical tip 2"],
  "emergencyContacts": [{ "label": "Police", "value": "phone number or description" }],
  "restaurantRecommendations": [{ "name": "restaurant name", "cuisine": "cuisine type", "priceRange": "$ | $$ | $$$", "note": "one short sentence" }]
}
Include 4-6 packing categories, 5-8 local tips, 3-5 emergency contacts (police, ambulance, tourist helpline, nearest embassy if relevant), and 4-6 restaurant recommendations relevant to ${location}.`

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
  })

  const text = result.response
    .text()
    .replace(/^```json\s*|\s*```$/g, '')
  return JSON.parse(text)
}
