<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFlightsStore } from '~/stores/flights'
import { useFlightDateConstraints } from '~/composables/flights/useFlightDateConstraints'
import AirportInput from '~/components/flights/AirportInput.vue'
import DatePickerInput from '~/components/flights/DatePickerInput.vue'

const store = useFlightsStore()

const origin = ref('')
const destination = ref('')
const departureDate = ref('')
const returnDate = ref('')

const {
  canSelectDates,
  minDepartureDateObj,
  maxDepartureDateObj,
  returnMinDateObj,
  maxReturnDateObj,
  disabledDepartureDatesRanges,
  disabledReturnDatesRanges,
} = useFlightDateConstraints(origin, destination, departureDate)

watch(
  () => store.filters,
  (storeFilters) => {
    origin.value = storeFilters.origin ?? ''
    destination.value = storeFilters.destination ?? ''
    departureDate.value = storeFilters.departureDate ?? ''
    returnDate.value = storeFilters.returnDate ?? ''
  },
  { deep: true, immediate: true },
)

watch([origin, destination, departureDate, returnDate], () => {
  const nextOrigin = origin.value || undefined
  const nextDestination = destination.value || undefined
  const nextDepartureDate = departureDate.value || undefined
  const nextReturnDate = returnDate.value || undefined

  if (
    nextOrigin === store.filters.origin &&
    nextDestination === store.filters.destination &&
    nextDepartureDate === store.filters.departureDate &&
    nextReturnDate === store.filters.returnDate
  ) return

  store.setFilters({
    origin: nextOrigin,
    destination: nextDestination,
    departureDate: nextDepartureDate,
    returnDate: nextReturnDate,
  })
})

watch(departureDate, (newDep) => {
  if (returnDate.value && newDep && returnDate.value < newDep) {
    returnDate.value = ''
  }
})

watch(
  [origin, destination],
  () => {
    departureDate.value = ''
    returnDate.value = ''
  },
  { flush: 'sync' },
)

function clearFilters() {
  origin.value = ''
  destination.value = ''
  departureDate.value = ''
  returnDate.value = ''
  store.resetFilters()
}
</script>

<template>
  <section class="filters" aria-label="Filter flights">
    <div class="filters__row">

      <div class="filters__field">
        <AirportInput
          v-model="origin"
          label="From"
          input-id="filter-origin"
          placeholder="e.g. DUS"
          suggestions-list-id="origin-suggestions"
        />
      </div>

      <div class="filters__field">
        <AirportInput
          v-model="destination"
          label="To"
          input-id="filter-destination"
          placeholder="e.g. BCN"
          suggestions-list-id="destination-suggestions"
        />
      </div>

      <div class="filters__field">
        <DatePickerInput
          v-model="departureDate"
          label="Departure"
          input-id="filter-departure"
          :disabled="!canSelectDates"
          :min-date="minDepartureDateObj"
          :max-date="maxDepartureDateObj"
          :disabled-dates="disabledDepartureDatesRanges"
        />
      </div>

      <div class="filters__field">
        <DatePickerInput
          v-model="returnDate"
          label="Return"
          input-id="filter-return"
          :disabled="!canSelectDates"
          :min-date="returnMinDateObj"
          :max-date="maxReturnDateObj"
          :disabled-dates="disabledReturnDatesRanges"
        />
      </div>

    </div>

    <button
      v-if="origin || destination || departureDate || returnDate"
      class="filters__clear"
      type="button"
      aria-label="Clear all filters"
      @click="clearFilters"
    >
      Clear filters
    </button>
  </section>
</template>

<style scoped>
.filters {
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.filters__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.filters__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  position: relative;
  min-width: 0;
}

.filters__label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
}

.filters__clear {
  align-self: flex-start;
  background: none;
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  cursor: pointer;
  min-height: 44px;
  transition: all var(--transition-default);
}

.filters__clear:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filters__clear:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

@media (min-width: 640px) {
  .filters__row {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}
</style>
