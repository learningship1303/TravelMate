import axios from 'axios'

const API_KEY = import.meta.env.VITE_GOOGLE_PLACE_API_KEY
const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete'

export const placesConfigured = Boolean(API_KEY)

export function createSessionToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export async function autocompletePlaces(query, sessionToken, signal) {
  if (!API_KEY || !query?.trim()) return []

  const res = await axios.post(
    AUTOCOMPLETE_URL,
    {
      input: query,
      sessionToken,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
      },
      signal,
    }
  )

  const suggestions = res.data?.suggestions || []
  return suggestions
    .map((item) => item.placePrediction)
    .filter(Boolean)
    .map((prediction) => ({
      placeId: prediction.placeId,
      mainText: prediction.structuredFormat?.mainText?.text || prediction.text?.text,
      secondaryText: prediction.structuredFormat?.secondaryText?.text || '',
      fullText: prediction.text?.text,
    }))
}

export async function getPlaceDetails(placeId, sessionToken) {
  if (!API_KEY || !placeId) return null

  const res = await axios.get(`https://places.googleapis.com/v1/places/${placeId}`, {
    params: { sessionToken },
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'displayName,formattedAddress,location,photos',
    },
  })
  return res.data
}
