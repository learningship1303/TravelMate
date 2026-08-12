import axios from "axios"

export const GetPlaceDetails = (data) => axios.post('/api/places-search', data)
