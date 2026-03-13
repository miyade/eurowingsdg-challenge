import { ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useFlightsStore } from '~/stores/flights'
import type { FlightFilters, FlightSortKey } from '#shared/types/flight'

export function useFlightFilters() {
  const store = useFlightsStore()
  // these are reactive state and getters thats why we wrap them in storetorefs
  const { filters, availableOrigins, availableDestinations } = storeToRefs(store)
  // actions don't need to be reactive
  const { setFilters, resetFilters, setSortKey } = store

  /** 
   * using draftFilters for what the user is currently editing
   * so not finalized, more like work in progress filter.
  */
  const draftFilters = ref<FlightFilters>({
    origin: undefined,
    destination: undefined,
    departureDate: undefined,
    returnDate: undefined,
  })

  const isFilterPanelOpen = ref<boolean>(false)

  function syncDraftToApplied(): void {
    watchEffect(() => {
      draftFilters.value = { ...filters.value }
    })
  }

  syncDraftToApplied()

  // here we push the draft into the store and close the panel
  function applyFilters(): void {
    setFilters(draftFilters.value)
    isFilterPanelOpen.value = false
  }
  // for cancel cases
  function discardFilters(): void {
    draftFilters.value = { ...filters.value }
  }
  // full reset case
  function clearFilters(): void {
    resetFilters()
    draftFilters.value = {
      origin: undefined,
      destination: undefined,
      departureDate: undefined,
      returnDate: undefined,
    }
  }

  function toggleFilterPanel(): void {
    isFilterPanelOpen.value = !isFilterPanelOpen.value
  }

  return {
    draftFilters,
    isFilterPanelOpen,
    filters,
    availableOrigins,
    availableDestinations,
    setFilters,
    resetFilters,
    setSortKey,
    applyFilters,
    discardFilters,
    clearFilters,
    toggleFilterPanel,
  }
}
