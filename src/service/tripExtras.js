import axios from 'axios'

export async function generateTripExtras(trip) {
  const { data } = await axios.post('/api/generate-trip-extras', {
    location: trip?.userSelection?.location,
    noOfDays: trip?.userSelection?.noOfDays,
    budget: trip?.userSelection?.budget,
  })
  return data
}
