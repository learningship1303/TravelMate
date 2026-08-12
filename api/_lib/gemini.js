import { GoogleGenAI } from '@google/genai'
import {
  MODEL,
  CHAT_GENERATION_CONFIG,
  CHAT_SEED_HISTORY,
  ASSISTANT_GENERATION_CONFIG,
  buildAssistantSeedHistory,
} from './geminiConfig.js'

function getClient() {
  const apiKey = process.env.GOOGLE_GEMINI_AI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GEMINI_AI_API_KEY server environment variable.')
  }
  return new GoogleGenAI({ apiKey })
}

export function createChatSession() {
  const ai = getClient()
  return ai.chats.create({
    model: MODEL,
    config: CHAT_GENERATION_CONFIG,
    history: CHAT_SEED_HISTORY,
  })
}

export function createAssistantSession(trip, priorMessages = [], language = 'English') {
  const ai = getClient()
  return ai.chats.create({
    model: MODEL,
    config: ASSISTANT_GENERATION_CONFIG,
    history: buildAssistantSeedHistory(trip, priorMessages, language),
  })
}

const TRIP_EXTRAS_GENERATION_CONFIG = {
  temperature: 0.8,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 4096,
  responseMimeType: 'application/json',
}

export async function generateTripExtras({ location, noOfDays, budget }) {
  const ai = getClient()

  const prompt = `You are a travel guide assistant. For a ${noOfDays}-day trip to ${location} with a ${budget} budget, return ONLY valid JSON (no markdown fences, no commentary) with exactly this shape:
{
  "overview": "2-3 sentence description of the destination",
  "bestTimeToVisit": "one short paragraph on the best time of year to visit",
  "packingChecklist": [{ "category": "Clothing", "items": ["item 1", "item 2"] }],
  "localTips": ["short practical tip 1", "short practical tip 2"],
  "emergencyContacts": [{ "label": "Police", "value": "phone number or description" }],
  "restaurantRecommendations": [{ "name": "restaurant name", "cuisine": "cuisine type", "priceRange": "$ | $$ | $$$", "note": "one short sentence" }]
}
Include 4-6 packing categories, 5-8 local tips, 3-5 emergency contacts (police, ambulance, tourist helpline, nearest embassy if relevant), and 4-6 restaurant recommendations relevant to ${location}.`

  const result = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: TRIP_EXTRAS_GENERATION_CONFIG,
  })

  const text = (result.text || '').replace(/^```json\s*|\s*```$/g, '')
  return JSON.parse(text)
}
