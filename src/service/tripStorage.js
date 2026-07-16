const STORAGE_KEY = 'travelmate_ai_trips'

const readTrips = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch (error) {
    console.error('Unable to read saved trips:', error)
    return []
  }
}

export const saveTrip = (trip) => {
  const trips = readTrips()
  const nextTrips = [trip, ...trips.filter((item) => item.id !== trip.id)]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTrips))
}

export const getTripById = (tripId) => {
  return readTrips().find((trip) => trip.id === tripId)
}

export const getTripsByUserEmail = (email) => {
  return readTrips().filter((trip) => trip.userEmail === email)
}

export const updateTrip = (tripId, patch) => {
  const trips = readTrips()
  const nextTrips = trips.map((trip) =>
    trip.id === tripId ? { ...trip, ...(typeof patch === 'function' ? patch(trip) : patch) } : trip
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTrips))
  return nextTrips.find((trip) => trip.id === tripId)
}
