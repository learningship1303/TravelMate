const EARTH_RADIUS_KM = 6371

export function parseGeoCoordinates(value) {
  if (!value || typeof value !== 'string') return null
  const parts = value.split(',').map((part) => Number.parseFloat(part.trim()))
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null
  const [lat, lng] = parts
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

export function haversineDistanceKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function getTripCoordinates(trip) {
  const userCoords = trip?.userSelection?.coordinates
  if (userCoords && Number.isFinite(userCoords.lat) && Number.isFinite(userCoords.lng)) {
    return userCoords
  }

  const hotelCoords = trip?.tripData?.hotel_options
    ?.map((hotel) => parseGeoCoordinates(hotel?.geo_coordinates))
    .find(Boolean)
  if (hotelCoords) return hotelCoords

  for (const day of trip?.tripData?.itinerary || []) {
    for (const place of day?.plan || []) {
      const coords = parseGeoCoordinates(place?.geo_coordinates)
      if (coords) return coords
    }
  }

  return null
}
