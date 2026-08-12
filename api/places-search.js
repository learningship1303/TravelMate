const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  const apiKey = process.env.GOOGLE_PLACE_API_KEY
  if (!apiKey) {
    res.status(500).json({ message: 'Places search is not configured on the server.' })
    return
  }

  const { textQuery } = req.body || {}
  if (!textQuery) {
    res.status(400).json({ message: 'Missing textQuery' })
    return
  }

  try {
    const placesRes = await fetch(PLACES_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.photos,places.displayName,places.id',
      },
      body: JSON.stringify({ textQuery }),
    })

    if (!placesRes.ok) {
      const errorBody = await placesRes.text().catch(() => '<unreadable body>')
      console.error('Places search upstream error', placesRes.status, placesRes.statusText, errorBody)
      res.status(502).json({ message: 'Unable to fetch place photos right now.' })
      return
    }

    const data = await placesRes.json()
    const photos = data?.places?.[0]?.photos || []
    const photoUrls = photos.map(
      (photo) => `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=1000&maxWidthPx=1900&key=${apiKey}`
    )
    res.status(200).json({ photoUrls })
  } catch (error) {
    console.error(error)
    res.status(502).json({ message: 'Unable to fetch place photos right now.' })
  }
}
