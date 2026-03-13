/** 3-letter IATA city code for origin and destination
 * YYYY-MM-DD for dates
 */

export interface Flight {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  seatAvailability: number
  price: {
    amount: number
    currency: string
  }
  offerType: 'ExactMatch' | 'amadeusBestPrice'
  uuid: string
}

export interface FlightFilters {
  origin: string | undefined
  destination: string | undefined
  departureDate: string | undefined
  returnDate: string | undefined
}

export type FlightSortKey = 'price-asc' | 'price-desc' | 'date-asc' | 'date-desc' | 'none'
