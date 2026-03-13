import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
  })
  const sortKey = ref<FlightSortKey>('none')

  const filteredAndSortedFlights = computed<Flight[]>(() => {
    let result = flights.value.filter((flight) => {
      if (
        filters.value.origin !== undefined &&
        flight.origin.toLowerCase() !== filters.value.origin.toLowerCase()
      ) {
        return false
      }

      if (
        filters.value.destination !== undefined &&
        flight.destination.toLowerCase() !== filters.value.destination.toLowerCase()
      ) {
        return false
      }

      if (
        filters.value.departureDate !== undefined &&
        flight.departureDate !== filters.value.departureDate
      ) {
        return false
      }

      if (
        filters.value.returnDate !== undefined &&
        flight.returnDate !== filters.value.returnDate
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
    }
  }

  function setSortKey(key: FlightSortKey): void {
    sortKey.value = key
  }

  return {
    flights,
    isLoading,
    error,
    filters,
    sortKey,
    filteredAndSortedFlights,
    availableOrigins,
    availableDestinations,
    fetchFlights,
    setFilters,
    resetFilters,
    setSortKey,
  }
})
