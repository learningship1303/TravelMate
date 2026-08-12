export const MAX_DAYS = 30

export const AI_PROMPT =
  'Generate Travel Plan for Location : {location}, for {totalDays} Days for {traveler} with a {budget} budget ,Give me a Hotels options list with Hotel Name, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with place Name, Place Details, Place Image Url, Geo Coordinates, ticket Pricing, rating, Time travel each of the location for {totalDays} days with each day plan with best time to visit in JSON format'

export function buildFinalPrompt({ location, noOfDays, traveler, budget, targetBudgetAmount, targetBudgetCurrency }) {
  let finalPrompt = AI_PROMPT.replace('{location}', location)
    .replace('{totalDays}', noOfDays)
    .replace('{traveler}', traveler)
    .replace('{budget}', budget)
    .replace('{totalDays}', noOfDays)

  const targetAmount = Number(targetBudgetAmount)
  if (targetAmount > 0) {
    finalPrompt += ` The traveler's target total budget for the entire trip (all days, hotel, and activities combined) is approximately ${targetAmount} ${targetBudgetCurrency}. Please plan within this budget where realistically possible.`
  }
  return finalPrompt
}

export function validateTripFormFields({ location, noOfDays, budget, traveler }) {
  const days = Number(noOfDays)
  if (!location || !noOfDays || !Number.isInteger(days) || days < 1 || days > MAX_DAYS || !budget || !traveler) {
    return {
      valid: false,
      message: noOfDays && days > MAX_DAYS ? `Trips are limited to ${MAX_DAYS} days` : 'Please fill all the details',
    }
  }
  return { valid: true, message: null }
}
