import type { Flight } from '#shared/types/flight'
import { flights } from '../data/flights'

// defineEventHandler is built in with nuxt and wraps our server function with no need for import
export default defineEventHandler((event): Flight[] => {
  /** getQuery reads url query params. 
  * e.g. for /api/flights?origin=DUS we get 'DUS' as origin 
  * the ?: means the param is optional
  */
  const { origin, destination, departureDate, returnDate } = getQuery<{
    origin?: string
    destination?: string
    departureDate?: string
    returnDate?: string
  }>(event)

  // checking if any filters were provided and skip filtering if not
  const hasFilters = origin || destination || departureDate || returnDate

  if (!hasFilters) {
    return flights
  }
  /** for each flight we check each active filter and return false if it doesn't match
   * we match dates exactly
   * TODO: +/- feature for the dates
  */
  return flights.filter((flight) => {
    if (origin && flight.origin.toLowerCase() !== origin.toLowerCase()) {
      return false
    }

    if (destination && flight.destination.toLowerCase() !== destination.toLowerCase()) {
      return false
    }

    if (departureDate && flight.departureDate !== departureDate) {
      return false
    }

    if (returnDate && flight.returnDate !== returnDate) {
      return false
    }

    return true
  })
})
