import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Flight, FlightFilters, FlightSortKey } from '#shared/types/flight'

export const useFlightsStore = defineStore('flights', () => {
  const flights = ref<Flight[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const filters = ref<FlightFilters>({
    origin: undefined,
    destination: undefined,
    departureDate: undefined,
    returnDate: undefined,
    offerType: undefined,
    lowSeatsOnly: undefined,
    maxPrice: undefined,
  })
  const sortKey = ref<FlightSortKey>('none')

  function getTripDays(dep: string, ret: string): number {
    const d1 = new Date(dep + 'T12:00:00Z')
    const d2 = new Date(ret + 'T12:00:00Z')
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
  }

  const filteredAndSortedFlights = computed<Flight[]>(() => {
    let result = flights.value.filter((flight) => {
      if (
        filters.value.origin !== undefined &&
        !flight.origin.toLowerCase().startsWith(filters.value.origin.toLowerCase())
      ) {
        return false
      }

      if (
        filters.value.destination !== undefined &&
        !flight.destination.toLowerCase().startsWith(filters.value.destination.toLowerCase())
      ) {
        return false
      }

      if (flight.offerType === 'ExactMatch') {
        if (filters.value.departureDate && flight.departureDate !== filters.value.departureDate) return false
        if (filters.value.returnDate && flight.returnDate !== filters.value.returnDate) return false
      }
      else if (flight.offerType === 'amadeusBestPrice') {
        if (filters.value.departureDate && filters.value.returnDate) {
          const searchedDuration = getTripDays(filters.value.departureDate, filters.value.returnDate)
          const flightDuration = getTripDays(flight.departureDate, flight.returnDate)
          if (flightDuration !== searchedDuration) return false
        }
      }

      if (
        filters.value.offerType !== undefined &&
        flight.offerType !== filters.value.offerType
      ) {
        return false
      }

      if (filters.value.lowSeatsOnly === true && flight.seatAvailability >= 3) {
        return false
      }

      if (
        filters.value.maxPrice !== undefined &&
        flight.price.amount > filters.value.maxPrice
      ) {
        return false
      }

      return true
    })
  // when sortkey is none we return early here with no need for copying

    if (sortKey.value === 'none') {
      return result
    }

    result = [...result]
  /** when two flights have the same price or date it could make the order random and jump around
   * when rerendering. || a.uuid.localeCompare(b.uuid) make it give the same result for same input
   * thats why i am using the uuid as a tiebreaker
  */
    switch (sortKey.value) {
      case 'price-asc':
        result.sort((a, b) => a.price.amount - b.price.amount || a.uuid.localeCompare(b.uuid))
        break
      case 'price-desc':
        result.sort((a, b) => b.price.amount - a.price.amount || a.uuid.localeCompare(b.uuid))
        break
      case 'date-asc':
        result.sort((a, b) => a.departureDate.localeCompare(b.departureDate) || a.uuid.localeCompare(b.uuid))
        break
      case 'date-desc':
        result.sort((a, b) => b.departureDate.localeCompare(a.departureDate) || a.uuid.localeCompare(b.uuid))
        break
    }

    return result
  })

  const exactMatchFlights = computed(() =>
    filteredAndSortedFlights.value.filter(f => f.offerType === 'ExactMatch'),
  )

  const bestPriceFlights = computed(() =>
    filteredAndSortedFlights.value.filter(f => f.offerType === 'amadeusBestPrice'),
  )

  const hasMinimumFilters = computed<boolean>(
    () =>
      typeof filters.value.origin === 'string' && filters.value.origin.length >= 3 &&
      typeof filters.value.destination === 'string' && filters.value.destination.length >= 3,
  )

  const hasAllFilters = computed<boolean>(
    () =>
      hasMinimumFilters.value &&
      typeof filters.value.departureDate === 'string' && filters.value.departureDate.length > 0 &&
      typeof filters.value.returnDate === 'string' && filters.value.returnDate.length > 0,
  )

  const availableOrigins = computed<string[]>(() =>
    [...new Set(flights.value.map((f) => f.origin))].sort(),
  )

  const availableDestinations = computed<string[]>(() =>
    [...new Set(flights.value.map((f) => f.destination))].sort(),
  )

  async function fetchFlights(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Flight[]>('/api/flights')
      flights.value = data
    }
    catch {
      error.value = 'Failed to load flights. Please try again.'
    }
    finally {
      isLoading.value = false
    }
  }

  function setFilters(partial: Partial<FlightFilters>): void {
    filters.value = { ...filters.value, ...partial }
  }

  function resetFilters(): void {
    filters.value = {
      origin: undefined,
      destination: undefined,
      departureDate: undefined,
      returnDate: undefined,
      offerType: undefined,
      lowSeatsOnly: undefined,
      maxPrice: undefined,
    }
  }

  function setSortKey(key: FlightSortKey): void {
    sortKey.value = key
  }

  const maxPriceBound = computed(() => {
    if (!flights.value.length) return 400
    return Math.ceil(Math.max(...flights.value.map((f) => f.price.amount)))
  })

  function isValidOfferType(value: string): value is 'ExactMatch' | 'amadeusBestPrice' {
    return value === 'ExactMatch' || value === 'amadeusBestPrice'
  }

  function isValidSortKey(value: string): value is FlightSortKey {
    return ['price-asc', 'price-desc', 'date-asc', 'date-desc'].includes(value)
  }

  function pickFirstQueryValue(value: string | string[] | undefined): string | undefined {
    const raw = Array.isArray(value) ? value[0] : value
    return raw?.trim() || undefined
  }

  function parseQueryParams(query: Record<string, string | string[] | undefined>) {
    const origin = pickFirstQueryValue(query.origin)
    const destination = pickFirstQueryValue(query.destination)
    const departureDate = pickFirstQueryValue(query.departure)
    const returnDate = pickFirstQueryValue(query.return)

    const rawOfferType = pickFirstQueryValue(query.offerType)
    const offerType = rawOfferType && isValidOfferType(rawOfferType) ? rawOfferType : undefined

    const lowSeatsOnly = query.lowSeats === '1' ? (true as const) : undefined

    const rawMaxPrice = pickFirstQueryValue(query.maxPrice)
    const parsedMaxPrice = rawMaxPrice !== undefined ? Number(rawMaxPrice) : NaN
    const maxPrice = rawMaxPrice !== undefined && !isNaN(parsedMaxPrice) ? parsedMaxPrice : undefined

    const rawSort = pickFirstQueryValue(query.sort)
    const parsedSortKey: FlightSortKey = rawSort && isValidSortKey(rawSort) ? rawSort : 'none'

    return { origin, destination, departureDate, returnDate, offerType, lowSeatsOnly, maxPrice, parsedSortKey }
  }

  function initFromQuery(query: Record<string, string | string[] | undefined>): void {
    const { origin, destination, departureDate, returnDate, offerType, lowSeatsOnly, maxPrice, parsedSortKey } =
      parseQueryParams(query)
    filters.value = { origin, destination, departureDate, returnDate, offerType, lowSeatsOnly, maxPrice }
    sortKey.value = parsedSortKey
  }

  function buildQuery(): Record<string, string> {
    const activeParams: Record<string, string> = {}
    const f = filters.value

    if (f.origin) activeParams.origin = f.origin
    if (f.destination) activeParams.destination = f.destination
    if (f.departureDate) activeParams.departure = f.departureDate
    if (f.returnDate) activeParams.return = f.returnDate
    if (f.offerType) activeParams.offerType = f.offerType
    if (f.lowSeatsOnly === true) activeParams.lowSeats = '1'
    if (f.maxPrice !== undefined && f.maxPrice < maxPriceBound.value) {
      activeParams.maxPrice = String(f.maxPrice)
    }
    if (sortKey.value !== 'none') activeParams.sort = sortKey.value

    return activeParams
  }

  function useUrlSync(): void {
    if (!import.meta.client) return

    const route = useRoute()
    const router = useRouter()

    initFromQuery(route.query as Record<string, string | string[]>)

    watch(
      [filters, sortKey],
      () => {
        const nextQuery = buildQuery()
        const currentQuery = route.query as Record<string, string>
        const nextKeys = Object.keys(nextQuery).sort()
        const currentKeys = Object.keys(currentQuery).sort()
        const alreadyInSync =
          nextKeys.length === currentKeys.length &&
          nextKeys.every((k) => nextQuery[k] === currentQuery[k])

        if (!alreadyInSync) {
          router.replace({ query: nextQuery })
        }
      },
      { deep: true },
    )

    watch(
      () => route.query,
      (newQuery) => {
        const { origin, destination, departureDate, returnDate, offerType, lowSeatsOnly, maxPrice, parsedSortKey } =
          parseQueryParams(newQuery as Record<string, string | string[]>)

        const f = filters.value
        const filtersUnchanged =
          origin === f.origin &&
          destination === f.destination &&
          departureDate === f.departureDate &&
          returnDate === f.returnDate &&
          offerType === f.offerType &&
          lowSeatsOnly === f.lowSeatsOnly &&
          maxPrice === f.maxPrice

        if (!filtersUnchanged) {
          filters.value = { origin, destination, departureDate, returnDate, offerType, lowSeatsOnly, maxPrice }
        }

        if (parsedSortKey !== sortKey.value) {
          sortKey.value = parsedSortKey
        }
      },
    )
  }

  return {
    flights,
    isLoading,
    error,
    filters,
    sortKey,
    filteredAndSortedFlights,
    exactMatchFlights,
    bestPriceFlights,
    hasMinimumFilters,
    hasAllFilters,
    availableOrigins,
    availableDestinations,
    maxPriceBound,
    fetchFlights,
    setFilters,
    resetFilters,
    setSortKey,
    initFromQuery,
    buildQuery,
    useUrlSync,
  }
})
